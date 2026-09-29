// PARITY: src/app/api/agent/v1/resumes/[id]/pdf/route.ts — keep in sync, see mcp-gateway/PARITY.md
package pdfproxy

import (
	"context"
	"io"
	"net/http"
	"net/url"
	"time"
)

// PDF rendering can be slow on a cold Vercel function; bound it anyway.
var client = &http.Client{Timeout: 60 * time.Second}

type Proxy struct {
	BaseURL   string
	Transport string
}

func (p *Proxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	targetURL, err := url.Parse(p.BaseURL + r.URL.Path)
	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}
	targetURL.RawQuery = r.URL.RawQuery

	req, err := http.NewRequestWithContext(r.Context(), r.Method, targetURL.String(), nil)
	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}

	req.Header.Set("Authorization", r.Header.Get("Authorization"))
	req.Header.Set("X-Agent-Transport", p.Transport)

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	for k, vv := range resp.Header {
		for _, v := range vv {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func Fetch(ctx context.Context, baseURL, authHeader, resumeID string) (body []byte, contentType string, status int, err error) {
	targetURL, err := url.Parse(baseURL + "/api/agent/v1/resumes/" + resumeID + "/pdf")
	if err != nil {
		return nil, "", 0, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL.String(), nil)
	if err != nil {
		return nil, "", 0, err
	}

	req.Header.Set("Authorization", authHeader)
	req.Header.Set("X-Agent-Transport", "mcp")

	resp, err := client.Do(req)
	if err != nil {
		return nil, "", 0, err
	}
	defer resp.Body.Close()

	body, err = io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", resp.StatusCode, err
	}
	return body, resp.Header.Get("Content-Type"), resp.StatusCode, nil
}
