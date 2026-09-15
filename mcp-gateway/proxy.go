package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/mark3labs/mcp-go/mcp"
)

// baseURL is the get-hired deployment this gateway proxies real tool calls
// to. All business logic (Prisma, AI generation, PDF rendering, scope
// checks) lives there — this gateway only terminates the MCP transport and
// translates JSON-RPC tool calls into REST calls, forwarding the caller's
// bearer token unchanged so the REST endpoint's own auth stays authoritative.
var baseURL = mustGetenv("GETHIRED_BASE_URL")

func mustGetenv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		fmt.Fprintf(os.Stderr, "missing required env var %s\n", key)
		os.Exit(1)
	}
	return v
}

var httpClient = &http.Client{Timeout: 30 * time.Second}

type ctxKey int

const authHeaderKey ctxKey = iota

// injectAuthHeader is the HTTPContextFunc passed to the StreamableHTTP
// server: it copies the incoming Authorization header into the request
// context so tool handlers (which never see the raw *http.Request) can
// forward it unchanged to the REST API.
func injectAuthHeader(ctx context.Context, r *http.Request) context.Context {
	return context.WithValue(ctx, authHeaderKey, r.Header.Get("Authorization"))
}

func authFromCtx(ctx context.Context) string {
	v, _ := ctx.Value(authHeaderKey).(string)
	return v
}

// restCall performs one REST call against the get-hired API, forwarding the
// caller's bearer token. body (if non-nil) is JSON-marshaled as the request
// body; for GET/DELETE pass nil.
func restCall(ctx context.Context, method, path string, body any) (status int, respBody []byte, err error) {
	var reqBody io.Reader
	if body != nil {
		b, mErr := json.Marshal(body)
		if mErr != nil {
			return 0, nil, fmt.Errorf("marshal request body: %w", mErr)
		}
		reqBody = bytes.NewReader(b)
	}

	req, err := http.NewRequestWithContext(ctx, method, baseURL+path, reqBody)
	if err != nil {
		return 0, nil, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Authorization", authFromCtx(ctx))
	// Lets authenticateAgentRequest log the real transport (mcp) instead of
	// inferring "rest" from the /api/agent/v1/* path it actually hits.
	req.Header.Set("X-Agent-Transport", "mcp")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return 0, nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return resp.StatusCode, nil, fmt.Errorf("read response body: %w", err)
	}
	return resp.StatusCode, data, nil
}

// jsonToolResult calls the REST API and turns the response into an MCP
// tool result: the raw JSON body as text content on success, or an
// isError result carrying the REST error body on failure. This is the
// shared path for every tool except download_resume_pdf (binary).
func jsonToolResult(ctx context.Context, method, path string, body any) (*mcp.CallToolResult, error) {
	status, data, err := restCall(ctx, method, path, body)
	if err != nil {
		return mcp.NewToolResultErrorFromErr("request to get-hired failed", err), nil
	}
	if status >= 400 {
		return mcp.NewToolResultError(string(data)), nil
	}
	return mcp.NewToolResultText(string(data)), nil
}

// pdfToolResult fetches a resume's rendered PDF and embeds it as a binary
// resource, matching the shape the Vercel MCP route already returns.
func pdfToolResult(ctx context.Context, resumeID string) (*mcp.CallToolResult, error) {
	status, data, err := restCall(ctx, "GET", "/api/agent/v1/resumes/"+resumeID+"/pdf", nil)
	if err != nil {
		return mcp.NewToolResultErrorFromErr("request to get-hired failed", err), nil
	}
	if status >= 400 {
		return mcp.NewToolResultError(string(data)), nil
	}
	return mcp.NewToolResultResource("resume.pdf", mcp.BlobResourceContents{
		URI:      "resume://" + resumeID + ".pdf",
		MIMEType: "application/pdf",
		Blob:     base64.StdEncoding.EncodeToString(data),
	}), nil
}

// stringArg reads a required string argument from a tool call.
func stringArg(args map[string]any, key string) (string, error) {
	v, ok := args[key].(string)
	if !ok || v == "" {
		return "", fmt.Errorf("missing required argument %q", key)
	}
	return v, nil
}
