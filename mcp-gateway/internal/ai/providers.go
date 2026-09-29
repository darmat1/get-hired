// PARITY: src/lib/ai/providers/*.ts — keep in sync, see mcp-gateway/PARITY.md
package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

type OpenRouterProvider struct {
	BaseURL string
}

func (p *OpenRouterProvider) ID() string { return "openrouter" }

func (p *OpenRouterProvider) Complete(ctx context.Context, apiKey string, req Request) (Response, error) {
	if apiKey == "" {
		return Response{}, errors.New("[AI] OpenRouter API key is missing")
	}

	url := p.BaseURL
	if url == "" {
		url = "https://openrouter.ai/api/v1/chat/completions"
	}

	var models []string
	if req.Model != "" {
		models = []string{req.Model}
	} else {
		val := getenv("NEXT_PUBLIC_OPENROUTER_FREE_MODEL", "google/gemini-2.0-flash-exp:free")
		for _, m := range strings.Split(val, ",") {
			if m = strings.TrimSpace(m); m != "" {
				models = append(models, m)
			}
		}
	}

	for _, model := range models {
		body := map[string]any{
			"model": model,
			"messages": []map[string]any{
				{"role": "system", "content": req.SystemPrompt},
				{"role": "user", "content": req.UserPrompt},
			},
			"temperature": 0.0,
		}
		if req.Temperature != nil {
			body["temperature"] = *req.Temperature
		}
		if req.MaxTokens != nil {
			body["max_tokens"] = *req.MaxTokens
		}
		if req.ResponseFormat != nil && req.ResponseFormat.Type == "json_object" {
			body["response_format"] = map[string]any{"type": "json_object"}
		}

		jb, _ := json.Marshal(body)
		hreq, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jb))
		hreq.Header.Set("Authorization", "Bearer "+apiKey)
		hreq.Header.Set("Content-Type", "application/json")
		hreq.Header.Set("HTTP-Referer", getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"))
		hreq.Header.Set("X-Title", "Get Hired AI")

		resp, err := http.DefaultClient.Do(hreq)
		if err != nil {
			continue
		}
		if resp.StatusCode == 200 {
			var data struct {
				Choices []struct {
					Message struct {
						Content string `json:"content"`
					} `json:"message"`
				} `json:"choices"`
			}
			json.NewDecoder(resp.Body).Decode(&data)
			resp.Body.Close()
			if len(data.Choices) > 0 && data.Choices[0].Message.Content != "" {
				return Response{Content: data.Choices[0].Message.Content, Provider: p.ID(), Model: model}, nil
			}
		} else {
			resp.Body.Close()
		}
	}
	return Response{}, fmt.Errorf("OpenRouter: all models failed (%s)", strings.Join(models, ", "))
}

type GeminiProvider struct {
	BaseURL string
}

func (p *GeminiProvider) ID() string { return "gemini" }

func (p *GeminiProvider) Complete(ctx context.Context, apiKey string, req Request) (Response, error) {
	if req.Model != "" {
		return p.complete(ctx, apiKey, req, true, true, 0)
	}

	val := getenv("GOOGLE_MODEL", "gemini-3.5-flash-lite,gemma-4-31b-it")
	var candidates []string
	for _, m := range strings.Split(val, ",") {
		if m = strings.TrimSpace(m); m != "" {
			candidates = append(candidates, m)
		}
	}

	var lastErr error
	for _, model := range candidates {
		req.Model = model
		res, err := p.complete(ctx, apiKey, req, true, true, 0)
		if err == nil {
			return res, nil
		}
		lastErr = err
	}
	if lastErr != nil {
		return Response{}, lastErr
	}
	return Response{}, errors.New("[AI] Gemini: all model candidates failed")
}

func (p *GeminiProvider) complete(ctx context.Context, apiKey string, req Request, withThinking bool, allowModelFallback bool, retryCount int) (Response, error) {
	if apiKey == "" {
		return Response{}, errors.New("[AI] Google API key is missing")
	}

	model := req.Model
	if model == "" {
		model = getenv("GOOGLE_MODEL", "gemini-2.5-flash")
	}

	timeoutMs := 120000
	if req.TimeoutMs != nil {
		timeoutMs = *req.TimeoutMs
	}
	ctx, cancel := context.WithTimeout(ctx, time.Duration(timeoutMs)*time.Millisecond)
	defer cancel()

	url := p.BaseURL
	if url == "" {
		url = "https://generativelanguage.googleapis.com"
	}
	url = fmt.Sprintf("%s/v1beta/models/%s:generateContent?key=%s", url, model, apiKey)

	genConfig := map[string]any{
		"temperature":      0.7,
		"maxOutputTokens":  4096,
		"responseMimeType": "text/plain",
	}
	if req.Temperature != nil {
		genConfig["temperature"] = *req.Temperature
	}
	if req.MaxTokens != nil {
		genConfig["maxOutputTokens"] = *req.MaxTokens
	}
	if req.ResponseFormat != nil && req.ResponseFormat.Type == "json_object" {
		genConfig["responseMimeType"] = "application/json"
	}
	if withThinking {
		genConfig["thinking_level"] = "MINIMAL"
	}

	body := map[string]any{
		"contents": []map[string]any{
			{
				"role": "user",
				"parts": []map[string]any{
					{"text": req.SystemPrompt + "\n\n" + req.UserPrompt},
				},
			},
		},
		"generationConfig": genConfig,
	}
	jb, _ := json.Marshal(body)
	hreq, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jb))
	hreq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(hreq)
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return Response{}, fmt.Errorf("[AI] Google Gemini request timed out after %ds", timeoutMs/1000)
		}
		return Response{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		errText := string(b)

		if withThinking && resp.StatusCode == 400 && strings.Contains(errText, "thinking_level") {
			return p.complete(ctx, apiKey, req, false, allowModelFallback, retryCount)
		}

		if allowModelFallback && resp.StatusCode == 404 && req.Model != "" {
			fallback := "gemini-2.5-flash"
			if model != fallback {
				req.Model = fallback
				return p.complete(ctx, apiKey, req, withThinking, false, retryCount)
			}
		}

		if resp.StatusCode == 503 && retryCount < 3 {
			// Instead of blocking with time.Sleep which can be canceled, just simple sleep
			time.Sleep(time.Duration(1500*(1<<retryCount)) * time.Millisecond)
			return p.complete(ctx, apiKey, req, withThinking, allowModelFallback, retryCount+1)
		}

		return Response{}, fmt.Errorf("Google Gemini Error %d: %s", resp.StatusCode, errText)
	}

	var data struct {
		Candidates []struct {
			FinishReason string `json:"finishReason"`
			Content      struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	json.NewDecoder(resp.Body).Decode(&data)

	var content string
	if len(data.Candidates) > 0 && len(data.Candidates[0].Content.Parts) > 0 {
		content = data.Candidates[0].Content.Parts[0].Text
	}

	if content == "" && len(data.Candidates) > 0 && data.Candidates[0].FinishReason != "" {
		return Response{}, fmt.Errorf("Google Gemini failed with reason: %s", data.Candidates[0].FinishReason)
	}

	return Response{Content: content, Provider: p.ID(), Model: model}, nil
}

type GroqProvider struct {
	BaseURL string
}

func (p *GroqProvider) ID() string { return "groq" }

func (p *GroqProvider) Complete(ctx context.Context, apiKey string, req Request) (Response, error) {
	return p.complete(ctx, apiKey, req, false)
}

func (p *GroqProvider) complete(ctx context.Context, apiKey string, req Request, isRetry bool) (Response, error) {
	if apiKey == "" {
		return Response{}, errors.New("[AI] Groq API key is missing")
	}
	model := req.Model
	if model == "" {
		model = getenv("GROQ_MODEL", "openai/gpt-oss-120b")
	}

	url := p.BaseURL
	if url == "" {
		url = "https://api.groq.com/openai/v1/chat/completions"
	}

	body := map[string]any{
		"model": model,
		"messages": []map[string]any{
			{"role": "system", "content": req.SystemPrompt},
			{"role": "user", "content": req.UserPrompt},
		},
		"temperature": 0.0,
		"max_tokens":  4096,
	}
	if req.Temperature != nil {
		body["temperature"] = *req.Temperature
	}
	if req.MaxTokens != nil {
		body["max_tokens"] = *req.MaxTokens
	}
	if req.ResponseFormat != nil && req.ResponseFormat.Type == "json_object" {
		body["response_format"] = map[string]any{"type": "json_object"}
	}

	jb, _ := json.Marshal(body)
	hreq, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jb))
	hreq.Header.Set("Authorization", "Bearer "+apiKey)
	hreq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(hreq)
	if err != nil {
		return Response{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		errText := string(b)
		if !isRetry && resp.StatusCode == 400 && req.ResponseFormat != nil && req.ResponseFormat.Type == "json_object" {
			req.ResponseFormat = nil
			return p.complete(ctx, apiKey, req, true)
		}
		return Response{}, fmt.Errorf("Groq API error (%d): %s", resp.StatusCode, errText)
	}

	var data struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	json.NewDecoder(resp.Body).Decode(&data)

	var content string
	if len(data.Choices) > 0 {
		content = data.Choices[0].Message.Content
	}
	if content == "" {
		if !isRetry && req.ResponseFormat != nil && req.ResponseFormat.Type == "json_object" {
			req.ResponseFormat = nil
			return p.complete(ctx, apiKey, req, true)
		}
		return Response{}, errors.New("Groq returned empty content")
	}

	return Response{Content: content, Provider: p.ID(), Model: model}, nil
}

type OpenAIProvider struct {
	BaseURL string
}

func (p *OpenAIProvider) ID() string { return "openai" }

func (p *OpenAIProvider) Complete(ctx context.Context, apiKey string, req Request) (Response, error) {
	if apiKey == "" {
		return Response{}, errors.New("[AI] OpenAI API key is missing")
	}
	model := req.Model
	if model == "" {
		model = getenv("OPENAI_MODEL", "gpt-5.6-luna")
	}

	url := p.BaseURL
	if url == "" {
		url = "https://api.openai.com/v1/chat/completions"
	}

	body := map[string]any{
		"model": model,
		"messages": []map[string]any{
			{"role": "system", "content": req.SystemPrompt},
			{"role": "user", "content": req.UserPrompt},
		},
		"temperature": 0.0,
	}
	if req.Temperature != nil {
		body["temperature"] = *req.Temperature
	}
	if req.MaxTokens != nil {
		body["max_tokens"] = *req.MaxTokens
	}
	if req.ResponseFormat != nil && req.ResponseFormat.Type == "json_object" {
		body["response_format"] = map[string]any{"type": "json_object"}
	}

	jb, _ := json.Marshal(body)
	hreq, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jb))
	hreq.Header.Set("Authorization", "Bearer "+apiKey)
	hreq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(hreq)
	if err != nil {
		return Response{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		return Response{}, fmt.Errorf("OpenAI API error (%d): %s", resp.StatusCode, string(b))
	}

	var data struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	json.NewDecoder(resp.Body).Decode(&data)

	var content string
	if len(data.Choices) > 0 {
		content = data.Choices[0].Message.Content
	}
	if content == "" {
		return Response{}, errors.New("OpenAI returned empty content")
	}

	return Response{Content: content, Provider: p.ID(), Model: model}, nil
}

type ClaudeProvider struct {
	BaseURL string
}

func (p *ClaudeProvider) ID() string { return "claude" }

func (p *ClaudeProvider) Complete(ctx context.Context, apiKey string, req Request) (Response, error) {
	if apiKey == "" {
		return Response{}, errors.New("[AI] Anthropic API key is missing")
	}
	model := req.Model
	if model == "" {
		model = getenv("ANTHROPIC_MODEL", "claude-sonnet-5")
	}

	url := p.BaseURL
	if url == "" {
		url = "https://api.anthropic.com/v1/messages"
	}

	maxT := 4096
	if req.MaxTokens != nil {
		maxT = *req.MaxTokens
	}
	temp := 0.7
	if req.Temperature != nil {
		temp = *req.Temperature
	}

	body := map[string]any{
		"model":       model,
		"max_tokens":  maxT,
		"temperature": temp,
		"system":      req.SystemPrompt,
		"messages": []map[string]any{
			{"role": "user", "content": req.UserPrompt},
		},
	}

	jb, _ := json.Marshal(body)
	hreq, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jb))
	hreq.Header.Set("x-api-key", apiKey)
	hreq.Header.Set("anthropic-version", "2023-06-01")
	hreq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(hreq)
	if err != nil {
		return Response{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		return Response{}, fmt.Errorf("Anthropic Error %d: %s", resp.StatusCode, string(b))
	}

	var data struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	}
	json.NewDecoder(resp.Body).Decode(&data)

	var content string
	if len(data.Content) > 0 {
		content = data.Content[0].Text
	}

	return Response{Content: content, Provider: p.ID(), Model: model}, nil
}
