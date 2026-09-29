package pdfproxy

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFetch(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer token" {
			t.Fatal("wrong auth")
		}
		if r.Header.Get("X-Agent-Transport") != "mcp" {
			t.Fatal("wrong transport")
		}
		if r.URL.Path != "/api/agent/v1/resumes/123/pdf" {
			t.Fatal("wrong path")
		}
		w.Header().Set("Content-Type", "application/pdf")
		w.WriteHeader(200)
		w.Write([]byte("pdf data"))
	}))
	defer ts.Close()

	body, ct, status, err := Fetch(context.Background(), ts.URL, "Bearer token", "123")
	if err != nil || ct != "application/pdf" || status != 200 || string(body) != "pdf data" {
		t.Fatalf("failed: %v, %v, %v, %v", body, ct, status, err)
	}
}
