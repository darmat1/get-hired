// Command mcp-gateway is a thin MCP-over-Streamable-HTTP front end for
// get-hired's agent API. It holds the long-lived SSE connection MCP clients
// expect (cheap on a small VPS — just a goroutine, not billed per-second the
// way Vercel's Fluid Compute bills held-open connections) and proxies every
// tool call straight through to the existing /api/agent/v1/* REST API,
// forwarding the caller's bearer token unchanged. No business logic, no
// database access, no secrets beyond knowing where get-hired lives — see
// proxy.go for the shared REST-call path all tools below go through.
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

func main() {
	s := server.NewMCPServer("get-hired-agent-gateway", "1.0.0")
	registerTools(s)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mcpHandler := server.NewStreamableHTTPServer(s,
		server.WithStateLess(true), // mirrors the Vercel MCP route: no server-side session state
		server.WithHTTPContextFunc(injectAuthHeader),
		server.WithEndpointPath("/mcp"),
		// mcp-go sends no keep-alive by default. Reverse proxies (Cloudflare
		// included — free/pro plans close a connection after ~100s with no
		// bytes flowing) will silently sever an idle SSE stream without
		// this. 15s matches the interval the old TS/Vercel MCP route used.
		server.WithHeartbeatInterval(15*time.Second),
		// This process sits behind a reverse proxy (Caddy) reached over
		// loopback, which forwards the real external Host header — the
		// library's DNS-rebinding guard would otherwise reject that as a
		// mismatched-Host loopback request.
		server.WithDisableLocalhostProtection(true),
	)

	mux := http.NewServeMux()
	mux.Handle("/mcp", mcpHandler)
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	addr := ":" + port
	fmt.Printf("mcp-gateway listening on %s (proxying to %s)\n", addr, baseURL)
	if err := http.ListenAndServe(addr, mux); err != nil {
		fmt.Fprintf(os.Stderr, "server error: %v\n", err)
		os.Exit(1)
	}
}

func registerTools(s *server.MCPServer) {
	// ── Profile ──────────────────────────────────────────────────────────
	s.AddTool(
		mcp.NewTool("get_profile",
			mcp.WithDescription("Get the user's profile: personal info, work experience, education, skills, certificates."),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			return jsonToolResult(ctx, "GET", "/api/agent/v1/profile", nil)
		},
	)

	s.AddTool(
		mcp.NewTool("update_profile",
			mcp.WithDescription("Update the user's profile. Only provided fields are changed; omitted fields are left as-is."),
			mcp.WithObject("personalInfo", mcp.Description("Name, email, phone, location, links, etc.")),
			mcp.WithArray("workExperience", mcp.Description("List of work experience entries.")),
			mcp.WithArray("education", mcp.Description("List of education entries.")),
			mcp.WithArray("skills", mcp.Description("List of skill entries.")),
			mcp.WithArray("certificates", mcp.Description("List of certificate entries.")),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			return jsonToolResult(ctx, "PATCH", "/api/agent/v1/profile", req.GetArguments())
		},
	)

	// ── Resumes ──────────────────────────────────────────────────────────
	s.AddTool(
		mcp.NewTool("list_resumes",
			mcp.WithDescription("List the user's resumes (lean summary — use get_resume for full content)."),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			return jsonToolResult(ctx, "GET", "/api/agent/v1/resumes", nil)
		},
	)

	s.AddTool(
		mcp.NewTool("get_resume",
			mcp.WithDescription("Get one resume by id, full content."),
			mcp.WithString("resumeId", mcp.Required()),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := stringArg(req.GetArguments(), "resumeId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return jsonToolResult(ctx, "GET", "/api/agent/v1/resumes/"+id, nil)
		},
	)

	s.AddTool(
		mcp.NewTool("create_resume",
			mcp.WithDescription("Create a new resume (max 2 per user). Omitted content fields are pre-filled from the user's profile."),
			mcp.WithString("title"),
			mcp.WithString("template"),
			mcp.WithObject("personalInfo"),
			mcp.WithArray("workExperience"),
			mcp.WithArray("education"),
			mcp.WithArray("skills"),
			mcp.WithArray("certificates"),
			mcp.WithObject("customization", mcp.Description("sidebarColor, showAvatar, and per-section show* toggles.")),
			mcp.WithString("language"),
			mcp.WithString("targetPosition"),
			mcp.WithString("targetCompany"),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			return jsonToolResult(ctx, "POST", "/api/agent/v1/resumes", req.GetArguments())
		},
	)

	s.AddTool(
		mcp.NewTool("update_resume",
			mcp.WithDescription("Update a resume. Only provided fields are changed — this is how you change the template, or the design (customization: sidebarColor, showAvatar, and the various show* toggles), or any content."),
			mcp.WithString("resumeId", mcp.Required()),
			mcp.WithString("title"),
			mcp.WithString("template"),
			mcp.WithObject("personalInfo"),
			mcp.WithArray("workExperience"),
			mcp.WithArray("education"),
			mcp.WithArray("skills"),
			mcp.WithArray("certificates"),
			mcp.WithObject("customization"),
			mcp.WithString("language"),
			mcp.WithString("targetPosition"),
			mcp.WithString("targetCompany"),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			args := req.GetArguments()
			id, err := stringArg(args, "resumeId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			delete(args, "resumeId")
			return jsonToolResult(ctx, "PATCH", "/api/agent/v1/resumes/"+id, args)
		},
	)

	s.AddTool(
		mcp.NewTool("delete_resume",
			mcp.WithDescription("Delete a resume."),
			mcp.WithString("resumeId", mcp.Required()),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := stringArg(req.GetArguments(), "resumeId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return jsonToolResult(ctx, "DELETE", "/api/agent/v1/resumes/"+id, nil)
		},
	)

	s.AddTool(
		mcp.NewTool("download_resume_pdf",
			mcp.WithDescription("Render a resume to PDF and return it as an embedded file."),
			mcp.WithString("resumeId", mcp.Required()),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := stringArg(req.GetArguments(), "resumeId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return pdfToolResult(ctx, id)
		},
	)

	s.AddTool(
		mcp.NewTool("generate_resume",
			mcp.WithDescription("Use AI to pick relevant experience/skills from the user's profile and create a tailored resume for a target role or a job description."),
			mcp.WithString("targetRole"),
			mcp.WithString("jobDescription"),
			mcp.WithString("template"),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			return jsonToolResult(ctx, "POST", "/api/agent/v1/resumes/generate", req.GetArguments())
		},
	)

	// ── Cover letters ────────────────────────────────────────────────────
	s.AddTool(
		mcp.NewTool("list_cover_letters",
			mcp.WithDescription("List the user's cover letters (truncated job description — use get_cover_letter for full text)."),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			return jsonToolResult(ctx, "GET", "/api/agent/v1/cover-letters", nil)
		},
	)

	s.AddTool(
		mcp.NewTool("get_cover_letter",
			mcp.WithDescription("Get one cover letter by id, full text."),
			mcp.WithString("coverLetterId", mcp.Required()),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := stringArg(req.GetArguments(), "coverLetterId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return jsonToolResult(ctx, "GET", "/api/agent/v1/cover-letters/"+id, nil)
		},
	)

	s.AddTool(
		mcp.NewTool("create_cover_letter",
			mcp.WithDescription("Save a cover letter the agent already wrote (no AI call — use generate_cover_letter for that)."),
			mcp.WithString("jobDescription", mcp.Required()),
			mcp.WithString("coverLetterText", mcp.Required()),
			mcp.WithString("format"),
			mcp.WithString("language"),
			mcp.WithString("resumeId"),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			return jsonToolResult(ctx, "POST", "/api/agent/v1/cover-letters", req.GetArguments())
		},
	)

	s.AddTool(
		mcp.NewTool("update_cover_letter",
			mcp.WithDescription("Update a cover letter's text/format/language."),
			mcp.WithString("coverLetterId", mcp.Required()),
			mcp.WithString("coverLetterText"),
			mcp.WithString("format"),
			mcp.WithString("language"),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			args := req.GetArguments()
			id, err := stringArg(args, "coverLetterId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			delete(args, "coverLetterId")
			return jsonToolResult(ctx, "PATCH", "/api/agent/v1/cover-letters/"+id, args)
		},
	)

	s.AddTool(
		mcp.NewTool("delete_cover_letter",
			mcp.WithDescription("Delete a cover letter."),
			mcp.WithString("coverLetterId", mcp.Required()),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := stringArg(req.GetArguments(), "coverLetterId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return jsonToolResult(ctx, "DELETE", "/api/agent/v1/cover-letters/"+id, nil)
		},
	)

	s.AddTool(
		mcp.NewTool("generate_cover_letter",
			mcp.WithDescription("Use AI to write and save a cover letter tailored to a job description."),
			mcp.WithString("jobDescription", mcp.Required()),
			mcp.WithString("format"),
			mcp.WithString("language"),
			mcp.WithString("resumeId"),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			return jsonToolResult(ctx, "POST", "/api/agent/v1/cover-letters/generate", req.GetArguments())
		},
	)

	// ── Templates ────────────────────────────────────────────────────────
	s.AddTool(
		mcp.NewTool("list_templates",
			mcp.WithDescription("List all available resume template ids and names, flagging which are ATS-safe (single-column)."),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			return jsonToolResult(ctx, "GET", "/api/agent/v1/templates", nil)
		},
	)
}
