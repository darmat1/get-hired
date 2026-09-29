package ai

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestOpenRouterProvider(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/v1/chat/completions" {
			t.Errorf("bad path: %s", r.URL.Path)
		}
		if auth := r.Header.Get("Authorization"); auth != "Bearer key" {
			t.Errorf("bad auth: %s", auth)
		}

		res := map[string]any{
			"choices": []map[string]any{
				{"message": map[string]any{"content": "hello openrouter"}},
			},
		}
		json.NewEncoder(w).Encode(res)
	}))
	defer ts.Close()

	p := &OpenRouterProvider{BaseURL: ts.URL + "/api/v1/chat/completions"}
	res, err := p.Complete(context.Background(), "key", Request{})
	if err != nil {
		t.Fatal(err)
	}
	if res.Content != "hello openrouter" || res.Provider != "openrouter" {
		t.Fatalf("bad res: %+v", res)
	}
}

func TestGeminiProvider(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1beta/models/gemini-2.5-flash:generateContent" {
			t.Errorf("bad path: %s", r.URL.Path)
		}
		if r.URL.Query().Get("key") != "key" {
			t.Errorf("bad key query: %s", r.URL.Query().Get("key"))
		}

		res := map[string]any{
			"candidates": []map[string]any{
				{
					"finishReason": "STOP",
					"content": map[string]any{
						"parts": []map[string]any{
							{"text": "hello gemini"},
						},
					},
				},
			},
		}
		json.NewEncoder(w).Encode(res)
	}))
	defer ts.Close()

	p := &GeminiProvider{BaseURL: ts.URL}
	res, err := p.Complete(context.Background(), "key", Request{Model: "gemini-2.5-flash"})
	if err != nil {
		t.Fatal(err)
	}
	if res.Content != "hello gemini" || res.Provider != "gemini" {
		t.Fatalf("bad res: %+v", res)
	}
}

func TestGroqProvider(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/openai/v1/chat/completions" {
			t.Errorf("bad path: %s", r.URL.Path)
		}
		if auth := r.Header.Get("Authorization"); auth != "Bearer key" {
			t.Errorf("bad auth: %s", auth)
		}

		res := map[string]any{
			"choices": []map[string]any{
				{"message": map[string]any{"content": "hello groq"}},
			},
		}
		json.NewEncoder(w).Encode(res)
	}))
	defer ts.Close()

	p := &GroqProvider{BaseURL: ts.URL + "/openai/v1/chat/completions"}
	res, err := p.Complete(context.Background(), "key", Request{})
	if err != nil {
		t.Fatal(err)
	}
	if res.Content != "hello groq" || res.Provider != "groq" {
		t.Fatalf("bad res: %+v", res)
	}
}

func TestOpenAIProvider(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/chat/completions" {
			t.Errorf("bad path: %s", r.URL.Path)
		}
		if auth := r.Header.Get("Authorization"); auth != "Bearer key" {
			t.Errorf("bad auth: %s", auth)
		}

		res := map[string]any{
			"choices": []map[string]any{
				{"message": map[string]any{"content": "hello openai"}},
			},
		}
		json.NewEncoder(w).Encode(res)
	}))
	defer ts.Close()

	p := &OpenAIProvider{BaseURL: ts.URL + "/v1/chat/completions"}
	res, err := p.Complete(context.Background(), "key", Request{})
	if err != nil {
		t.Fatal(err)
	}
	if res.Content != "hello openai" || res.Provider != "openai" {
		t.Fatalf("bad res: %+v", res)
	}
}

func TestClaudeProvider(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/messages" {
			t.Errorf("bad path: %s", r.URL.Path)
		}
		if auth := r.Header.Get("x-api-key"); auth != "key" {
			t.Errorf("bad auth: %s", auth)
		}

		res := map[string]any{
			"content": []map[string]any{
				{"text": "hello claude"},
			},
		}
		json.NewEncoder(w).Encode(res)
	}))
	defer ts.Close()

	p := &ClaudeProvider{BaseURL: ts.URL + "/v1/messages"}
	res, err := p.Complete(context.Background(), "key", Request{})
	if err != nil {
		t.Fatal(err)
	}
	if res.Content != "hello claude" || res.Provider != "claude" {
		t.Fatalf("bad res: %+v", res)
	}
}
