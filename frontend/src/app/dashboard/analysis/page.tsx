"use client";

import { useState, useEffect, useRef } from "react";
import { Card, Button } from "@/components";
import { competitorApi, Competitor } from "@/services/api";
import { useUser } from "@/hooks/useUser";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AgentStatus = "waiting" | "running" | "complete" | "error";

interface AgentState {
  status: AgentStatus;
  data: any;
  error?: string;
}

const AGENTS = [
  {
    key: "research",
    name: "Research Agent",
    description: "Searching the internet for competitor ads and campaigns",
    model: "groq/compound-beta (web search)",
  },
  {
    key: "pattern",
    name: "Pattern Analysis Agent",
    description: "Identifying psychological hooks and saturated angles",
    model: "llama-3.3-70b-versatile",
  },
  {
    key: "strategy",
    name: "Strategy Agent",
    description: "Finding whitespace gaps and generating counter-strategy",
    model: "llama-3.3-70b-versatile + RAG",
  },
  {
    key: "copy",
    name: "Copy Agent",
    description: "Generating ready-to-use ad copy variations",
    model: "llama-3.3-70b-versatile",
  },
];

const statusColors: Record<AgentStatus, string> = {
  waiting: "bg-gray-600",
  running: "bg-yellow-500 animate-pulse",
  complete: "bg-primary-green",
  error: "bg-red-500",
};

const statusLabels: Record<AgentStatus, string> = {
  waiting: "Waiting",
  running: "Running",
  complete: "Complete",
  error: "Error",
};

export default function AnalysisPage() {
  const { user: dbUser } = useUser();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [agents, setAgents] = useState<Record<string, AgentState>>({});
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dbUser?.id) fetchCompetitors();
  }, [dbUser]);

  const fetchCompetitors = async () => {
    try {
      const data = await competitorApi.getAll(dbUser!.id);
      setCompetitors(data);
    } catch (error) {
      console.error("Failed to fetch competitors:", error);
    }
  };

  const toggleSelect = (brand: string) => {
    setSelected((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const runPipeline = async () => {
    if (!dbUser?.id || selected.length === 0) return;

    setRunning(true);
    setPipelineComplete(false);
    setAnalysisId(null);
    setAgents({
      research: { status: "waiting", data: null },
      pattern: { status: "waiting", data: null },
      strategy: { status: "waiting", data: null },
      copy: { status: "waiting", data: null },
    });

    try {
      const response = await fetch(`${API_URL}/api/analysis/pipeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: dbUser.id, brands: selected }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));
              const { agent, status, data, error } = event;

              setAgents((prev) => ({
                ...prev,
                [agent]: { status, data: data || prev[agent]?.data, error },
              }));

              if (agent === "pipeline" && status === "complete") {
                setPipelineComplete(true);
                setAnalysisId(data?.analysisId);
              }

              if (status === "complete" || status === "error") {
                resultsRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "end",
                });
              }
            } catch (e) {
              // skip malformed events
            }
          }
        }
      }
    } catch (error) {
      console.error("Pipeline error:", error);
    }

    setRunning(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        AI Analysis Pipeline
      </h1>

      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">
          Select Competitors to Analyze
        </h2>
        {competitors.length === 0 ? (
          <p className="text-muted">
            No competitors added. Go to Competitors page first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3 mb-6">
            {competitors.map((comp) => (
              <button
                key={comp.id}
                onClick={() => toggleSelect(comp.brand)}
                disabled={running}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selected.includes(comp.brand)
                    ? "border-primary-green bg-primary-green/10 text-primary-green"
                    : "border-dark-border text-muted hover:border-white hover:text-white"
                } ${running ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {comp.name || comp.brand}
              </button>
            ))}
          </div>
        )}
        <Button
          variant="blue"
          onClick={runPipeline}
          disabled={running || selected.length === 0}
        >
          {running ? "Pipeline Running..." : "Run Analysis"}
        </Button>
      </Card>

      {Object.keys(agents).length > 0 && (
        <div className="mt-8 space-y-4" ref={resultsRef}>
          <h2 className="text-xl font-semibold text-white mb-4">
            Agent Pipeline
          </h2>

          {AGENTS.map(({ key, name, description, model }) => {
            const agent = agents[key];
            if (!agent) return null;

            return (
              <Card key={key}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${statusColors[agent.status]}`}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {name}
                      </h3>
                      <p className="text-muted text-sm">{description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm ${
                        agent.status === "complete"
                          ? "text-primary-green"
                          : agent.status === "running"
                            ? "text-yellow-500"
                            : agent.status === "error"
                              ? "text-red-500"
                              : "text-muted"
                      }`}
                    >
                      {statusLabels[agent.status]}
                    </span>
                    <p className="text-muted text-xs mt-1">{model}</p>
                  </div>
                </div>

                {agent.error && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{agent.error}</p>
                  </div>
                )}

                {agent.status === "complete" && agent.data && (
                  <div className="mt-4 p-4 bg-dark-bg rounded-lg border border-dark-border">
                    {key === "research" && (
                      <div className="space-y-4">
                        {Array.isArray(agent.data) &&
                          agent.data.map((brand: any, i: number) => (
                            <div key={i}>
                              <h4 className="text-primary-green font-semibold mb-2">
                                {brand.brand}
                              </h4>
                              <p className="text-muted text-sm mb-2">
                                {brand.summary}
                              </p>
                              <p className="text-muted text-xs">
                                {brand.ads?.length || 0} ads found
                              </p>
                            </div>
                          ))}
                      </div>
                    )}

                    {key === "pattern" && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-primary-blue font-semibold mb-2">
                            Hooks Found: {agent.data.hooks?.length || 0}
                          </h4>
                          {agent.data.hooks?.map((hook: any, i: number) => (
                            <div
                              key={i}
                              className="mb-2 pl-3 border-l-2 border-primary-blue/30"
                            >
                              <p className="text-white text-sm font-medium">
                                {hook.name}
                              </p>
                              <p className="text-muted text-xs">
                                {hook.description}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 className="text-red-400 font-semibold mb-2">
                            Saturated Angles:{" "}
                            {agent.data.saturatedAngles?.length || 0}
                          </h4>
                          {agent.data.saturatedAngles?.map(
                            (angle: any, i: number) => (
                              <div
                                key={i}
                                className="mb-2 pl-3 border-l-2 border-red-500/30"
                              >
                                <p className="text-white text-sm font-medium">
                                  {angle.angle}
                                </p>
                                <p className="text-muted text-xs">
                                  {angle.reason}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {key === "strategy" && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-primary-green font-semibold mb-2">
                            Positioning
                          </h4>
                          <p className="text-white text-sm">
                            {agent.data.counterStrategy?.positioning}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-primary-green font-semibold mb-2">
                            Gap Opportunities: {agent.data.gaps?.length || 0}
                          </h4>
                          {agent.data.gaps?.map((gap: any, i: number) => (
                            <div
                              key={i}
                              className="mb-2 pl-3 border-l-2 border-primary-green/30"
                            >
                              <p className="text-white text-sm font-medium">
                                {gap.opportunity}
                              </p>
                              <p className="text-muted text-xs">
                                {gap.reasoning}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 className="text-primary-blue font-semibold mb-2">
                            Counter-Strategy Angles
                          </h4>
                          {agent.data.counterStrategy?.angles?.map(
                            (angle: any, i: number) => (
                              <div
                                key={i}
                                className="mb-2 pl-3 border-l-2 border-primary-blue/30"
                              >
                                <p className="text-white text-sm font-medium">
                                  {angle.angle}
                                </p>
                                <p className="text-muted text-xs">
                                  {angle.description}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {key === "copy" && (
                      <div className="space-y-4">
                        {agent.data.ads?.map((ad: any, i: number) => (
                          <div
                            key={i}
                            className="p-3 bg-dark-card rounded-lg border border-dark-border"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-primary-blue text-xs font-medium uppercase">
                                {ad.platform}
                              </span>
                              <span className="text-muted text-xs">
                                {ad.angle}
                              </span>
                            </div>
                            <p className="text-white font-semibold">
                              {ad.headline}
                            </p>
                            <p className="text-muted text-sm mt-1">
                              {ad.primaryText}
                            </p>
                            <p className="text-muted text-xs mt-1">
                              {ad.description}
                            </p>
                            <span className="inline-block mt-2 px-3 py-1 bg-primary-blue/20 text-primary-blue text-xs rounded">
                              {ad.cta}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          {pipelineComplete && (
            <Card>
              <div className="text-center py-4">
                <p className="text-primary-green text-lg font-semibold">
                  Pipeline Complete
                </p>
                <p className="text-muted text-sm mt-1">
                  Analysis saved. View it in the Strategies page.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
