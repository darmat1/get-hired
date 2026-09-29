// PARITY: src/lib/ai/server-ai.ts — keep in sync, see mcp-gateway/PARITY.md
package ai

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lucsky/cuid"
)

const FreeQuotaLimit = 10
const freeQuotaWindow = 7 * 24 * time.Hour

// Display names from src/lib/ai/providers/*.ts (`name = ...`), used in user-facing errors.
var providerNames = map[string]string{
	"openrouter": "OpenRouter",
	"gemini":     "Google Gemini",
	"groq":       "Groq",
	"openai":     "OpenAI",
	"claude":     "Claude (Anthropic)",
}

type Client struct {
	Pool       *pgxpool.Pool
	Providers  []Provider
	Order      []string
	ServerKeys map[string]string
	EncKey     string
}

func FreeQuotaCount(count int, last *time.Time, now time.Time) int {
	if last == nil {
		return count // TS: !lastFreeAiUsage → freeAiGenerationsCount
	}
	if now.Sub(*last) >= freeQuotaWindow {
		return 0
	}
	return count
}

func isModelCompatibleWithProvider(model string, providerId string) bool {
	if model == "" {
		return true
	}
	normalized := strings.ToLower(model)
	switch providerId {
	case "gemini":
		return strings.HasPrefix(normalized, "gemini-") || strings.HasPrefix(normalized, "gemma-")
	case "groq":
		return strings.Contains(normalized, "llama") || strings.Contains(normalized, "mixtral") || strings.Contains(normalized, "gemma") || strings.Contains(normalized, "gpt-oss")
	case "openai":
		return strings.HasPrefix(normalized, "gpt-") || strings.HasPrefix(normalized, "o")
	case "claude":
		return strings.HasPrefix(normalized, "claude-")
	case "openrouter":
		return true
	default:
		return true
	}
}

func mapModelForProvider(requestedModel string, providerId string) string {
	if requestedModel == "" {
		return ""
	}
	lower := strings.ToLower(requestedModel)
	isSmallFast := lower == "small-fast"
	isLargeSmart := lower == "large-smart"

	if isSmallFast {
		switch providerId {
		case "groq":
			return "llama-3.1-8b-instant"
		case "gemini":
			return "gemini-3.5-flash-lite"
		case "openrouter":
			return "meta-llama/llama-3.1-8b-instruct"
		case "claude":
			return "claude-haiku-4-5-20251001"
		case "openai":
			return "gpt-5.6-luna"
		default:
			return requestedModel
		}
	}

	if isLargeSmart {
		switch providerId {
		case "groq":
			return "openai/gpt-oss-120b"
		case "gemini":
			return "gemini-2.5-flash"
		case "openrouter":
			return "meta-llama/llama-3.3-70b-instruct"
		case "claude":
			return "claude-sonnet-5"
		case "openai":
			return "gpt-5.6-terra"
		default:
			return requestedModel
		}
	}

	return requestedModel
}

func (c *Client) Complete(ctx context.Context, req Request, userID string) (Response, error) {
	var errs []string

	providerMap := make(map[string]Provider)
	for _, p := range c.Providers {
		providerMap[p.ID()] = p
	}

	if userID != "" && c.Pool != nil {
		var prefProvider, prefModel *string
		err := c.Pool.QueryRow(ctx, `SELECT "preferredAIProvider", "preferredAIModel" FROM "user" WHERE id=$1`, userID).Scan(&prefProvider, &prefModel)
		if err == nil {
			type userKey struct {
				provider string
				key      *string
			}
			var keys []userKey
			rows, err := c.Pool.Query(ctx, `SELECT provider, key FROM user_ai_key WHERE "userId"=$1`, userID)
			if err == nil {
				for rows.Next() {
					var k userKey
					if err := rows.Scan(&k.provider, &k.key); err == nil {
						keys = append(keys, k)
					}
				}
				rows.Close()

				sort.SliceStable(keys, func(i, j int) bool {
					if prefProvider != nil {
						if keys[i].provider == *prefProvider {
							return true
						}
						if keys[j].provider == *prefProvider {
							return false
						}
					}
					return false
				})

				for _, uk := range keys {
					p, ok := providerMap[uk.provider]
					if !ok {
						continue
					}

					// Mirrors the Prisma extension in src/lib/prisma.ts: decrypt only
					// values that look encrypted, keep the raw value on failure.
					// Missing key → provider falls back to the server key, like TS
					// (`request.apiKey || process.env.X`).
					var decryptedKey string
					if uk.key != nil {
						decryptedKey = *uk.key
						if strings.Contains(decryptedKey, ":") && c.EncKey != "" {
							if dec, err := Decrypt(decryptedKey, c.EncKey); err == nil {
								decryptedKey = dec
							}
						}
					}
					if decryptedKey == "" {
						decryptedKey = c.ServerKeys[p.ID()]
					}

					modelToUse := req.Model
					if modelToUse == "" && prefProvider != nil && uk.provider == *prefProvider && prefModel != nil {
						if isModelCompatibleWithProvider(*prefModel, uk.provider) {
							modelToUse = *prefModel
						}
					}

					finalModel := mapModelForProvider(modelToUse, p.ID())

					userReq := req
					userReq.Model = finalModel

					res, err := p.Complete(ctx, decryptedKey, userReq)
					if err == nil {
						_, _ = c.Pool.Exec(context.Background(), `INSERT INTO ai_usage_event (id, "userId", provider, model, "createdAt") VALUES ($1, $2, $3, $4, now())`, cuid.New(), userID, p.ID(), res.Model)
						return res, nil
					}

					msg := err.Error()
					if prefProvider != nil && uk.provider == *prefProvider && strings.Contains(msg, "Error 503") {
						return Response{}, errors.New("Google Gemini is temporarily unavailable due to high demand. Please try again in 30-60 seconds.")
					}
					if prefProvider != nil && uk.provider == *prefProvider && strings.Contains(msg, "429") {
						return Response{}, fmt.Errorf("%s is temporarily rate-limited for your account. Please wait a bit and try again, or switch to another provider/model.", providerNames[p.ID()])
					}
					errs = append(errs, fmt.Sprintf("User %s: %s", uk.provider, msg))
				}
			}
		}
	}

	var available []Provider
	if len(c.Order) > 0 {
		for _, id := range c.Order {
			if p, ok := providerMap[id]; ok {
				if c.ServerKeys[id] != "" {
					available = append(available, p)
				}
			}
		}
	} else {
		for _, p := range c.Providers {
			if c.ServerKeys[p.ID()] != "" {
				available = append(available, p)
			}
		}
	}

	if len(available) == 0 && len(errs) == 0 {
		return Response{}, errors.New("[AI] No AI providers available. Please configure API keys.")
	}

	var freeCount int
	var lastUsage *time.Time
	userFound := false
	if userID != "" && c.Pool != nil {
		err := c.Pool.QueryRow(ctx, `SELECT "freeAiGenerationsCount", "lastFreeAiUsage" FROM "user" WHERE id=$1`, userID).Scan(&freeCount, &lastUsage)
		if err == nil {
			userFound = true
			count := FreeQuotaCount(freeCount, lastUsage, time.Now())
			if count >= FreeQuotaLimit {
				return Response{}, fmt.Errorf("You have exhausted your %d free AI generations for this week. Please connect your own API key in settings.", FreeQuotaLimit)
			}
		}
	}

	for _, p := range available {
		finalModel := mapModelForProvider(req.Model, p.ID())
		sysReq := req
		sysReq.Model = finalModel

		res, err := p.Complete(ctx, c.ServerKeys[p.ID()], sysReq)
		if err == nil {
			if userFound {
				count := FreeQuotaCount(freeCount, lastUsage, time.Now())
				_, _ = c.Pool.Exec(context.Background(), `UPDATE "user" SET "freeAiGenerationsCount"=$1, "lastFreeAiUsage"=now(), "updatedAt"=now() WHERE id=$2`, count+1, userID)
			}
			if c.Pool != nil && userID != "" {
				_, _ = c.Pool.Exec(context.Background(), `INSERT INTO ai_usage_event (id, "userId", provider, model, "createdAt") VALUES ($1, $2, $3, $4, now())`, cuid.New(), userID, p.ID(), res.Model)
			}
			return res, nil
		}

		errs = append(errs, fmt.Sprintf("System %s: %s", p.ID(), err.Error()))
	}

	isRateLimited := false
	for _, e := range errs {
		lower := strings.ToLower(e)
		if strings.Contains(lower, "429") || strings.Contains(lower, "rate_limit") {
			isRateLimited = true
			break
		}
	}

	if isRateLimited {
		return Response{}, errors.New("AI service is temporarily busy. Please try again in a minute.")
	}
	return Response{}, errors.New("AI service is temporarily unavailable. Please try again shortly.")
}
