export interface JobArchetypeDefinition {
  id: string;
  title: string;
  thematicAxes: string;
  buyerSignal: string;
  emphasize: string;
}

export const JOB_ARCHETYPES: JobArchetypeDefinition[] = [
  {
    id: "ai-platform-llmops",
    title: "AI Platform / LLMOps Engineer",
    thematicAxes: "Evaluation, observability, reliability, pipelines",
    buyerSignal: "Someone who puts AI in production with metrics",
    emphasize:
      "Production systems, evals, observability, reliability, cost-awareness, closed-loop quality",
  },
  {
    id: "agentic-workflows",
    title: "Agentic Workflows / Automation",
    thematicAxes: "HITL, tooling, orchestration, multi-agent",
    buyerSignal: "Someone who builds reliable agent systems",
    emphasize:
      "Multi-agent orchestration, HITL, reliability, error handling, automation leverage",
  },
  {
    id: "technical-ai-pm",
    title: "Technical AI Product Manager",
    thematicAxes: "GenAI/Agents, PRDs, discovery, delivery",
    buyerSignal: "Someone who translates business to AI product",
    emphasize:
      "Product discovery, stakeholder management, PRDs, prioritization, measurable outcomes",
  },
  {
    id: "ai-solutions-architect",
    title: "AI Solutions Architect",
    thematicAxes: "Hyperautomation, enterprise, integrations",
    buyerSignal: "Someone who designs end-to-end AI architectures",
    emphasize:
      "System design, integrations, enterprise readiness, architecture decisions, solution framing",
  },
  {
    id: "ai-forward-deployed",
    title: "AI Forward Deployed Engineer",
    thematicAxes: "Client-facing, fast delivery, prototyping",
    buyerSignal: "Someone who delivers AI solutions to clients fast",
    emphasize:
      "Fast delivery, ambiguity handling, client-facing execution, prototyping to production",
  },
  {
    id: "ai-transformation-lead",
    title: "AI Transformation Lead",
    thematicAxes: "Change management, adoption, org enablement",
    buyerSignal: "Someone who leads AI transformation in an org",
    emphasize:
      "Adoption, organizational change, enablement, process transformation, leadership",
  },
];

export function renderJobArchetypesForPrompt(): string {
  return JOB_ARCHETYPES.map(
    (archetype) =>
      `- ${archetype.title}: thematic axes = ${archetype.thematicAxes}; what they buy = ${archetype.buyerSignal}; emphasize = ${archetype.emphasize}`,
  ).join("\n");
}
