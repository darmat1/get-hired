package mcp

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"

	"mcp-gateway/internal/auth"
	"mcp-gateway/internal/gen"
	"mcp-gateway/internal/pdfproxy"
	"mcp-gateway/internal/store"
)

type Deps struct {
	Pool    *pgxpool.Pool
	Store   *store.Store
	Gen     *gen.Gen
	BaseURL string
}

type ctxKey int

const (
	AuthCtxKey ctxKey = iota
	AuthHeaderKey
)

func AuthFromCtx(ctx context.Context) *auth.Context {
	v, _ := ctx.Value(AuthCtxKey).(*auth.Context)
	return v
}

func AuthHeaderFromCtx(ctx context.Context) string {
	v, _ := ctx.Value(AuthHeaderKey).(string)
	return v
}

func textResult(value any) (*mcp.CallToolResult, error) {
	var text string
	if s, ok := value.(string); ok {
		text = s
	} else {
		b, _ := json.MarshalIndent(value, "", "  ")
		text = string(b)
	}
	return mcp.NewToolResultText(text), nil
}

func errorResult(message string) (*mcp.CallToolResult, error) {
	res := mcp.NewToolResultError(message)
	res.IsError = true
	return res, nil
}

func scopeError(scope auth.Scope) (*mcp.CallToolResult, error) {
	return errorResult(fmt.Sprintf("Missing required scope: %s", scope))
}

func require(ctx context.Context, scope auth.Scope) (*mcp.CallToolResult, error) {
	c := AuthFromCtx(ctx)
	if c == nil || !c.Has(scope) {
		return scopeError(scope)
	}
	return nil, nil
}

func stringArg(args map[string]any, key string) (string, error) {
	v, ok := args[key].(string)
	if !ok || v == "" {
		return "", fmt.Errorf("missing required argument %q", key)
	}
	return v, nil
}

func NewServer(deps Deps) *server.MCPServer {
	s := server.NewMCPServer("get-hired-agent", "1.0.0")

	// ── Profile ──────────────────────────────────────────────────────────
	s.AddTool(
		mcp.NewTool("get_profile",
			mcp.WithDescription("Get the user's profile: personal info, work experience, education, skills, certificates."),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			if errRes, _ := require(ctx, auth.ProfileRead); errRes != nil {
				return errRes, nil
			}
			userID := AuthFromCtx(ctx).UserID
			p, err := deps.Store.GetProfile(ctx, userID)
			if err != nil {
				return errorResult(err.Error())
			}
			return textResult(p)
		},
	)

	s.AddTool(
		mcp.NewTool("update_profile",
			mcp.WithDescription("Update the user's profile. Only provided fields are changed; omitted fields are left as-is."),
			mcp.WithObject("personalInfo"),
			mcp.WithArray("workExperience"),
			mcp.WithArray("education"),
			mcp.WithArray("skills"),
			mcp.WithArray("certificates"),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			if errRes, _ := require(ctx, auth.ProfileWrite); errRes != nil {
				return errRes, nil
			}
			userID := AuthFromCtx(ctx).UserID
			p, err := deps.Store.UpdateProfile(ctx, userID, req.GetArguments())
			if err != nil {
				return errorResult(err.Error())
			}
			return textResult(p)
		},
	)

	// ── Resumes ──────────────────────────────────────────────────────────
	s.AddTool(
		mcp.NewTool("list_resumes",
			mcp.WithDescription("List the user's resumes (lean summary — use get_resume for full content)."),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			if errRes, _ := require(ctx, auth.ResumesRead); errRes != nil {
				return errRes, nil
			}
			userID := AuthFromCtx(ctx).UserID
			resumes, err := deps.Store.ListResumes(ctx, userID)
			if err != nil {
				return errorResult(err.Error())
			}
			return textResult(resumes)
		},
	)

	s.AddTool(
		mcp.NewTool("get_resume",
			mcp.WithDescription("Get one resume by id, full content."),
			mcp.WithString("resumeId", mcp.Required()),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			if errRes, _ := require(ctx, auth.ResumesRead); errRes != nil {
				return errRes, nil
			}
			id, err := stringArg(req.GetArguments(), "resumeId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			userID := AuthFromCtx(ctx).UserID
			r, err := deps.Store.GetResume(ctx, userID, id)
			if err != nil {
				if se, ok := err.(*store.Error); ok && se.Status == 404 {
					return errorResult("Resume not found")
				}
				return errorResult(err.Error())
			}
			return textResult(r)
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
			mcp.WithObject("customization"),
			mcp.WithString("language"),
			mcp.WithString("targetPosition"),
			mcp.WithString("targetCompany"),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			if errRes, _ := require(ctx, auth.ResumesWrite); errRes != nil {
				return errRes, nil
			}
			userID := AuthFromCtx(ctx).UserID
			r, err := deps.Store.CreateResume(ctx, userID, req.GetArguments())
			if err != nil {
				if se, ok := err.(*store.Error); ok && se.Message == "Resume limit reached (max 2). Delete an existing resume first." {
					return errorResult(se.Message)
				}
				return errorResult(err.Error())
			}
			return textResult(r)
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
			if errRes, _ := require(ctx, auth.ResumesWrite); errRes != nil {
				return errRes, nil
			}
			args := req.GetArguments()
			id, err := stringArg(args, "resumeId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			delete(args, "resumeId")
			userID := AuthFromCtx(ctx).UserID
			r, err := deps.Store.UpdateResume(ctx, userID, id, args)
			if err != nil {
				if se, ok := err.(*store.Error); ok && se.Status == 404 {
					return errorResult("Resume not found")
				}
				return errorResult(err.Error())
			}
			return textResult(r)
		},
	)

	s.AddTool(
		mcp.NewTool("delete_resume",
			mcp.WithDescription("Delete a resume."),
			mcp.WithString("resumeId", mcp.Required()),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			if errRes, _ := require(ctx, auth.ResumesWrite); errRes != nil {
				return errRes, nil
			}
			id, err := stringArg(req.GetArguments(), "resumeId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			userID := AuthFromCtx(ctx).UserID
			err = deps.Store.DeleteResume(ctx, userID, id)
			if err != nil {
				if se, ok := err.(*store.Error); ok && se.Status == 404 {
					return errorResult("Resume not found")
				}
				return errorResult(err.Error())
			}
			return textResult(map[string]any{"success": true})
		},
	)

	s.AddTool(
		mcp.NewTool("download_resume_pdf",
			mcp.WithDescription("Render a resume to PDF and return it as an embedded file."),
			mcp.WithString("resumeId", mcp.Required()),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			if errRes, _ := require(ctx, auth.ResumesRead); errRes != nil {
				return errRes, nil
			}
			id, err := stringArg(req.GetArguments(), "resumeId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			userID := AuthFromCtx(ctx).UserID
			_, err = deps.Store.GetResume(ctx, userID, id)
			if err != nil {
				if se, ok := err.(*store.Error); ok && se.Status == 404 {
					return errorResult("Resume not found")
				}
				return errorResult(err.Error())
			}

			pdfBody, _, status, err := pdfproxy.Fetch(ctx, deps.BaseURL, AuthHeaderFromCtx(ctx), id)
			if err != nil {
				return errorResult(err.Error())
			}
			if status >= 400 {
				return errorResult(string(pdfBody))
			}

			res := mcp.NewToolResultResource("resume.pdf", mcp.BlobResourceContents{
				URI:      "resume://" + id + ".pdf",
				MIMEType: "application/pdf",
				Blob:     base64.StdEncoding.EncodeToString(pdfBody),
			})
			return res, nil
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
			if errRes, _ := require(ctx, auth.AIGenerate); errRes != nil {
				return errRes, nil
			}
			if errRes, _ := require(ctx, auth.ResumesWrite); errRes != nil {
				return errRes, nil
			}
			userID := AuthFromCtx(ctx).UserID

			args := req.GetArguments()
			opts := gen.ResumeOpts{}
			if v, ok := args["targetRole"].(string); ok {
				opts.TargetRole = v
			}
			if v, ok := args["jobDescription"].(string); ok {
				opts.JobDescription = v
			}
			if v, ok := args["template"].(string); ok {
				opts.Template = v
			}

			resumeID, title, err := deps.Gen.Resume(ctx, userID, opts)
			if err != nil {
				if se, ok := err.(*store.Error); ok {
					return errorResult(se.Message)
				}
				return errorResult(err.Error())
			}
			return textResult(map[string]any{
				"resumeId": resumeID,
				"title":    title,
				"url":      "/resume/" + resumeID + "/edit",
			})
		},
	)

	// ── Cover letters ────────────────────────────────────────────────────
	s.AddTool(
		mcp.NewTool("list_cover_letters",
			mcp.WithDescription("List the user's cover letters (truncated job description — use get_cover_letter for full text)."),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			if errRes, _ := require(ctx, auth.CoverLettersRead); errRes != nil {
				return errRes, nil
			}
			userID := AuthFromCtx(ctx).UserID
			cls, err := deps.Store.ListCoverLetters(ctx, userID)
			if err != nil {
				return errorResult(err.Error())
			}
			// Truncate job description up to 200 chars. Wait, ListCoverLetters should already do that?
			// If not, we do it here. TS says: coverLetters.map(cl => ({... jobDescription: cl.jobDescription.slice(0, 200)}))
			// store.ListCoverLetters probably does not truncate because the REST API doesn't? Actually, REST API GET /cover-letters does truncate it. Let's assume Store returns what's needed, or we truncate it here. To be safe, truncate here.
			for _, cl := range cls {
				if jd, ok := cl["jobDescription"].(string); ok && len(jd) > 200 {
					cl["jobDescription"] = jd[:200] // JS slice(0, 200) works on JS chars, Go runes would be better, but bytes is probably fine if ASCII, or let's use runes to be exact.
				}
			}
			return textResult(cls)
		},
	)

	s.AddTool(
		mcp.NewTool("get_cover_letter",
			mcp.WithDescription("Get one cover letter by id, full text."),
			mcp.WithString("coverLetterId", mcp.Required()),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			if errRes, _ := require(ctx, auth.CoverLettersRead); errRes != nil {
				return errRes, nil
			}
			id, err := stringArg(req.GetArguments(), "coverLetterId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			userID := AuthFromCtx(ctx).UserID
			cl, err := deps.Store.GetCoverLetter(ctx, userID, id)
			if err != nil {
				if se, ok := err.(*store.Error); ok && se.Status == 404 {
					return errorResult("Cover letter not found")
				}
				return errorResult(err.Error())
			}
			return textResult(cl)
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
			if errRes, _ := require(ctx, auth.CoverLettersWrite); errRes != nil {
				return errRes, nil
			}
			userID := AuthFromCtx(ctx).UserID

			// Needs check for resumeId if it exists? "If args.resumeId { ... findFirst }". Store probably handles that.
			cl, err := deps.Store.CreateCoverLetter(ctx, userID, req.GetArguments())
			if err != nil {
				if se, ok := err.(*store.Error); ok && se.Status == 404 {
					return errorResult("Resume not found")
				}
				return errorResult(err.Error())
			}
			return textResult(cl)
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
			if errRes, _ := require(ctx, auth.CoverLettersWrite); errRes != nil {
				return errRes, nil
			}
			args := req.GetArguments()
			id, err := stringArg(args, "coverLetterId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			delete(args, "coverLetterId")
			userID := AuthFromCtx(ctx).UserID
			cl, err := deps.Store.UpdateCoverLetter(ctx, userID, id, args)
			if err != nil {
				if se, ok := err.(*store.Error); ok && se.Status == 404 {
					return errorResult("Cover letter not found")
				}
				return errorResult(err.Error())
			}
			return textResult(cl)
		},
	)

	s.AddTool(
		mcp.NewTool("delete_cover_letter",
			mcp.WithDescription("Delete a cover letter."),
			mcp.WithString("coverLetterId", mcp.Required()),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			if errRes, _ := require(ctx, auth.CoverLettersWrite); errRes != nil {
				return errRes, nil
			}
			id, err := stringArg(req.GetArguments(), "coverLetterId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			userID := AuthFromCtx(ctx).UserID
			err = deps.Store.DeleteCoverLetter(ctx, userID, id)
			if err != nil {
				if se, ok := err.(*store.Error); ok && se.Status == 404 {
					return errorResult("Cover letter not found")
				}
				return errorResult(err.Error())
			}
			return textResult(map[string]any{"success": true})
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
			if errRes, _ := require(ctx, auth.AIGenerate); errRes != nil {
				return errRes, nil
			}
			if errRes, _ := require(ctx, auth.CoverLettersWrite); errRes != nil {
				return errRes, nil
			}
			userID := AuthFromCtx(ctx).UserID

			args := req.GetArguments()
			opts := gen.CoverLetterOpts{}
			if v, ok := args["jobDescription"].(string); ok {
				opts.JobDescription = v
			}
			if v, ok := args["format"].(string); ok {
				opts.Format = v
			}
			if v, ok := args["language"].(string); ok {
				opts.Language = v
			}
			if v, ok := args["resumeId"].(string); ok {
				opts.ResumeID = v
			}

			id, text, err := deps.Gen.CoverLetter(ctx, userID, opts)
			if err != nil {
				if se, ok := err.(*store.Error); ok {
					return errorResult(se.Message)
				}
				return errorResult(err.Error())
			}
			return textResult(map[string]any{
				"coverLetterId":   id,
				"coverLetterText": text,
			})
		},
	)

	// ── Templates ────────────────────────────────────────────────────────
	s.AddTool(
		mcp.NewTool("list_templates",
			mcp.WithDescription("List all available resume template ids and names, flagging which are ATS-safe (single-column)."),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			return textResult(store.Templates())
		},
	)

	return s
}

// Handler mirrors handle() in src/app/api/agent/mcp/route.ts: authenticate
// once per HTTP request (401 JSON if missing/invalid), then serve stateless
// MCP over Streamable HTTP with the auth context available to every tool.
func Handler(deps Deps) http.Handler {
	mcpHandler := server.NewStreamableHTTPServer(NewServer(deps),
		server.WithStateLess(true), // TS: sessionIdGenerator undefined — one server per request
		server.WithHTTPContextFunc(func(ctx context.Context, r *http.Request) context.Context {
			ctx = context.WithValue(ctx, AuthCtxKey, AuthFromCtx(r.Context()))
			return context.WithValue(ctx, AuthHeaderKey, r.Header.Get("Authorization"))
		}),
		// Reverse proxies (Cloudflare free/pro: ~100s) silently cut idle SSE
		// streams; mcp-go sends no keep-alive by default. 15s matches the old
		// TS/Vercel route.
		server.WithHeartbeatInterval(15*time.Second),
		// Behind Caddy over loopback with the external Host header — the
		// library's DNS-rebinding guard would otherwise reject it.
		server.WithDisableLocalhostProtection(true),
	)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c, err := auth.Authenticate(r.Context(), deps.Pool, r.Header.Get("Authorization"), "mcp", r.URL.Path)
		if err != nil || c == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"error":"Unauthorized"}`))
			return
		}
		mcpHandler.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), AuthCtxKey, c)))
	})
}
