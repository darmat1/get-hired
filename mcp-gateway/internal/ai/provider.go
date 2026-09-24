package ai

import "context"

type ResponseFormat struct {
	Type string `json:"type"` // "json_object" or "text"
}

type Request struct {
	SystemPrompt   string
	UserPrompt     string
	Temperature    *float64
	MaxTokens      *int
	TimeoutMs      *int
	ResponseFormat *ResponseFormat
	APIKey         string
	Model          string
}

type Response struct {
	Content  string
	Provider string
	Model    string
}

type Provider interface {
	ID() string
	Complete(ctx context.Context, apiKey string, req Request) (Response, error)
}
