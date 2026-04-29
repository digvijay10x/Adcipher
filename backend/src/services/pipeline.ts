import { Response } from "express";
import { runResearchAgent, ResearchResult } from "./agents/researchAgent";
import { runPatternAgent, PatternResult } from "./agents/patternAgent";
import { runStrategyAgent, StrategyResult } from "./agents/strategyAgent";
import { runCopyAgent, CopyResult } from "./agents/copyAgent";
import prisma from "../config/db";

type AgentStatus = "waiting" | "running" | "complete" | "error";

interface PipelineEvent {
  agent: string;
  status: AgentStatus;
  data?: unknown;
  error?: string;
}

const sendEvent = (res: Response, event: PipelineEvent) => {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
};

export const runPipeline = async (
  userId: string,
  brands: string[],
  res: Response,
  ragContext?: string,
): Promise<void> => {
  // Notify all agents waiting
  sendEvent(res, { agent: "research", status: "waiting" });
  sendEvent(res, { agent: "pattern", status: "waiting" });
  sendEvent(res, { agent: "strategy", status: "waiting" });
  sendEvent(res, { agent: "copy", status: "waiting" });

  let researchData: ResearchResult[] = [];
  let patternData: PatternResult = { hooks: [], saturatedAngles: [] };
  let strategyData: StrategyResult = {
    gaps: [],
    counterStrategy: { positioning: "", angles: [] },
  };
  let copyData: CopyResult = { ads: [] };

  // Agent 1: Research
  try {
    sendEvent(res, { agent: "research", status: "running" });
    const research = await runResearchAgent(brands);
    researchData = research.parsed;
    sendEvent(res, {
      agent: "research",
      status: "complete",
      data: researchData,
    });
  } catch (error: any) {
    sendEvent(res, {
      agent: "research",
      status: "error",
      error: error.message,
    });
    return;
  }

  // Agent 2: Pattern Analysis
  try {
    sendEvent(res, { agent: "pattern", status: "running" });
    const pattern = await runPatternAgent(researchData);
    patternData = pattern.parsed;
    sendEvent(res, {
      agent: "pattern",
      status: "complete",
      data: patternData,
    });
  } catch (error: any) {
    sendEvent(res, {
      agent: "pattern",
      status: "error",
      error: error.message,
    });
    return;
  }

  // Agent 3: Strategy
  try {
    sendEvent(res, { agent: "strategy", status: "running" });
    const strategy = await runStrategyAgent(
      researchData,
      patternData,
      ragContext,
    );
    strategyData = strategy.parsed;
    sendEvent(res, {
      agent: "strategy",
      status: "complete",
      data: strategyData,
    });
  } catch (error: any) {
    sendEvent(res, {
      agent: "strategy",
      status: "error",
      error: error.message,
    });
    return;
  }

  // Agent 4: Copy Generation
  try {
    sendEvent(res, { agent: "copy", status: "running" });
    const copy = await runCopyAgent(strategyData);
    copyData = copy.parsed;
    sendEvent(res, { agent: "copy", status: "complete", data: copyData });
  } catch (error: any) {
    sendEvent(res, {
      agent: "copy",
      status: "error",
      error: error.message,
    });
    return;
  }

  // Save analysis to database
  try {
    const analysis = await prisma.analysis.create({
      data: {
        userId,
        title: `Analysis: ${brands.join(", ")}`,
        researchData: researchData as any,
        hooks: patternData.hooks as any,
        saturatedAngles: patternData.saturatedAngles as any,
        gaps: strategyData.gaps as any,
        counterStrategy: strategyData.counterStrategy as any,
        generatedCopy: copyData.ads as any,
      },
    });

    sendEvent(res, {
      agent: "pipeline",
      status: "complete",
      data: { analysisId: analysis.id },
    });
  } catch (error: any) {
    console.error("Failed to save analysis:", error);
    sendEvent(res, {
      agent: "pipeline",
      status: "error",
      error: "Failed to save analysis",
    });
  }
};
