// PARITY: src/lib/ai/prompts/job-archetypes.ts
package prompts

import (
	"fmt"
	"strings"
)

type JobArchetypeDefinition struct {
	ID           string
	Title        string
	ThematicAxes string
	BuyerSignal  string
	Emphasize    string
}

var JobArchetypes = []JobArchetypeDefinition{
	{
		ID:           "ai-platform-llmops",
		Title:        "AI Platform / LLMOps Engineer",
		ThematicAxes: "Evaluation, observability, reliability, pipelines",
		BuyerSignal:  "Someone who puts AI in production with metrics",
		Emphasize:    "Production systems, evals, observability, reliability, cost-awareness, closed-loop quality",
	},
	{
		ID:           "agentic-workflows",
		Title:        "Agentic Workflows / Automation",
		ThematicAxes: "HITL, tooling, orchestration, multi-agent",
		BuyerSignal:  "Someone who builds reliable agent systems",
		Emphasize:    "Multi-agent orchestration, HITL, reliability, error handling, automation leverage",
	},
	{
		ID:           "technical-ai-pm",
		Title:        "Technical AI Product Manager",
		ThematicAxes: "GenAI/Agents, PRDs, discovery, delivery",
		BuyerSignal:  "Someone who translates business to AI product",
		Emphasize:    "Product discovery, stakeholder management, PRDs, prioritization, measurable outcomes",
	},
	{
		ID:           "ai-solutions-architect",
		Title:        "AI Solutions Architect",
		ThematicAxes: "Hyperautomation, enterprise, integrations",
		BuyerSignal:  "Someone who designs end-to-end AI architectures",
		Emphasize:    "System design, integrations, enterprise readiness, architecture decisions, solution framing",
	},
	{
		ID:           "ai-forward-deployed",
		Title:        "AI Forward Deployed Engineer",
		ThematicAxes: "Client-facing, fast delivery, prototyping",
		BuyerSignal:  "Someone who delivers AI solutions to clients fast",
		Emphasize:    "Fast delivery, ambiguity handling, client-facing execution, prototyping to production",
	},
	{
		ID:           "ai-transformation-lead",
		Title:        "AI Transformation Lead",
		ThematicAxes: "Change management, adoption, org enablement",
		BuyerSignal:  "Someone who leads AI transformation in an org",
		Emphasize:    "Adoption, organizational change, enablement, process transformation, leadership",
	},
}

func RenderJobArchetypesForPrompt() string {
	var lines []string
	for _, a := range JobArchetypes {
		lines = append(lines, fmt.Sprintf("- %s: thematic axes = %s; what they buy = %s; emphasize = %s",
			a.Title, a.ThematicAxes, a.BuyerSignal, a.Emphasize))
	}
	return strings.Join(lines, "\n")
}
