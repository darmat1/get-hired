package config

import (
	"errors"
	"os"
	"strings"
)

type Config struct {
	Port           string
	DatabaseURL    string
	EncryptionKey  string // 64 hex chars; may be empty (user keys then unusable)
	BaseURL        string // Next deployment, used for PDF proxy
	AgentsDisabled bool
	ProviderOrder  []string // AI_PROVIDER_ORDER, empty = registry order
	ProviderKeys   map[string]string
}

func Load() (Config, error) {
	c := Config{
		Port:           getenv("PORT", "8080"),
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		EncryptionKey:  os.Getenv("ENCRYPTION_KEY"),
		BaseURL:        strings.TrimRight(getenv("GETHIRED_BASE_URL", "https://gethired.work"), "/"),
		AgentsDisabled: os.Getenv("AGENTS_DISABLED") == "1" || os.Getenv("AGENTS_DISABLED") == "true",
		ProviderKeys:   map[string]string{},
	}
	if c.DatabaseURL == "" {
		return c, errors.New("DATABASE_URL is required")
	}
	for _, id := range strings.Split(os.Getenv("AI_PROVIDER_ORDER"), ",") {
		if id = strings.TrimSpace(id); id != "" {
			c.ProviderOrder = append(c.ProviderOrder, id)
		}
	}

	c.ProviderKeys["openrouter"] = getenv("OPENROUTER_API_KEY", "")
	c.ProviderKeys["gemini"] = getenv("GOOGLE_API_KEY", "")
	c.ProviderKeys["groq"] = getenv("GROQ_API_KEY", getenv("GH_GROQ_API_KEY", ""))
	c.ProviderKeys["openai"] = getenv("OPENAI_API_KEY", "")
	c.ProviderKeys["claude"] = getenv("ANTHROPIC_API_KEY", "")
	return c, nil
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
