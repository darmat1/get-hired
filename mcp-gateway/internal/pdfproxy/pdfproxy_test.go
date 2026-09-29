package pdfproxy

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestPDFProxy(t *testing.T) {
	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-token" {
			t.Errorf("missing or bad Authorization header: %q", r.Header.Get("Authorization"))
		}
		if r.Header.Get("X-Agent-Transport") != "rest" {
			t.Errorf("missing or bad X-Agent-Transport: %q", r.Header.Get("X-Agent-Transport"))
		}
		if r.URL.Path != "/api/agent/v1/resumes/123/pdf" {
			t.Errorf("bad path: %q", r.URL.Path)
		}
		if r.URL.RawQuery != "download=true" {
			t.Errorf("bad query: %q", r.URL.RawQuery)
		}

		w.Header().Set("Content-Type", "application/pdf")
		w.Header().Set("Content-Disposition", `attachment; filename="resume.pdf"`)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("fake-pdf-bytes"))
	}))
	defer backend.Close()

	proxy := &Proxy{
		BaseURL:   backend.URL,
		Transport: "rest",
	}

	req := httptest.NewRequest("GET", "http://gateway/api/agent/v1/resumes/123/pdf?download=true", nil)
	req.Header.Set("Authorization", "Bearer test-token")
	w := httptest.NewRecorder()

	proxy.ServeHTTP(w, req)

	res := w.Result()
	if res.StatusCode != http.StatusOK {
		t.Errorf("status = %d", res.StatusCode)
	}
	if res.Header.Get("Content-Type") != "application/pdf" {
		t.Errorf("content-type = %q", res.Header.Get("Content-Type"))
	}
	if res.Header.Get("Content-Disposition") != `attachment; filename="resume.pdf"` {
		t.Errorf("content-disposition = %q", res.Header.Get("Content-Disposition"))
	}
	body, _ := io.ReadAll(res.Body)
	if string(body) != "fake-pdf-bytes" {
		t.Errorf("body = %q", body)
	}
}
