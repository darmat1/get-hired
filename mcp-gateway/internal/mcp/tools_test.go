package mcp

import (
	"context"
	"strings"
	"testing"

	"github.com/mark3labs/mcp-go/mcp"
	"mcp-gateway/internal/auth"
)

func TestTools(t *testing.T) {
	s := NewServer(Deps{})

	toolsMap := s.ListTools()
	want := []string{"get_profile", "update_profile", "list_resumes", "get_resume", "create_resume",
		"update_resume", "delete_resume", "generate_resume", "download_resume_pdf", "list_templates",
		"list_cover_letters", "get_cover_letter", "create_cover_letter", "update_cover_letter",
		"delete_cover_letter", "generate_cover_letter"}

	if len(toolsMap) != len(want) {
		t.Fatalf("got %d tools, want %d", len(toolsMap), len(want))
	}
	for _, w := range want {
		if _, ok := toolsMap[w]; !ok {
			t.Errorf("missing tool: %s", w)
		}
	}

	// DB test for list_resumes missing scope
	ctx := context.WithValue(context.Background(), AuthCtxKey, &auth.Context{UserID: "1", Scopes: []auth.Scope{auth.ProfileRead}})
	tool := toolsMap["list_resumes"]
	if tool == nil {
		t.Fatal("tool list_resumes not found")
	}

	res, err := tool.Handler(ctx, mcp.CallToolRequest{
		Request: mcp.Request{Method: "tools/call"},
		Params: mcp.CallToolParams{
			Name: "list_resumes",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if !res.IsError {
		t.Fatal("expected IsError=true")
	}
	if len(res.Content) == 0 {
		t.Fatal("missing content")
	}
	text := res.Content[0].(mcp.TextContent).Text
	if !strings.Contains(text, "Missing required scope") {
		t.Errorf("unexpected error text: %s", text)
	}
}
