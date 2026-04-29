"use client";

import { useState } from "react";
import { Card, Button, Input } from "@/components";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface GeneratedAd {
  headline: string;
  primaryText: string;
  description: string;
  cta: string;
  angle: string;
  platform: string;
}

export default function GeneratePage() {
  const [gaps, setGaps] = useState("");
  const [strategy, setStrategy] = useState("");
  const [generating, setGenerating] = useState(false);
  const [ads, setAds] = useState<GeneratedAd[]>([]);
  const [streamText, setStreamText] = useState("");

  const handleGenerate = async () => {
    if (!gaps.trim() || !strategy.trim()) return;

    setGenerating(true);
    setAds([]);
    setStreamText("");

    try {
      const response = await fetch(`${API_URL}/api/analysis/generate-copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gaps: gaps.split("\n").filter((g) => g.trim()),
          strategy: strategy.trim(),
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let buffer = "";
      let fullText = "";

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
              if (event.content) {
                fullText += event.content;
                setStreamText(fullText);
              }
              if (event.done) {
                // Try to parse the full response as JSON
                try {
                  const cleaned = fullText
                    .replace(/```json\s?/g, "")
                    .replace(/```/g, "")
                    .trim();
                  const parsed = JSON.parse(cleaned);
                  if (parsed.ads) {
                    setAds(parsed.ads);
                  } else if (Array.isArray(parsed)) {
                    setAds(parsed);
                  }
                  setStreamText("");
                } catch {
                  // Keep showing raw text if not valid JSON
                }
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (error) {
      console.error("Generate error:", error);
    }

    setGenerating(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Ad Copy Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Market Gaps</h2>
          <p className="text-muted text-sm mb-3">Enter one gap per line</p>
          <textarea
            value={gaps}
            onChange={(e) => setGaps(e.target.value)}
            placeholder={
              "Sustainability messaging\nMental health positioning\nCommunity-driven campaigns"
            }
            rows={6}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-blue transition-all resize-none"
          />
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">
            Counter-Strategy
          </h2>
          <p className="text-muted text-sm mb-3">
            Describe your positioning and approach
          </p>
          <textarea
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            placeholder="Position as a sustainability-first brand that empowers individuals through eco-friendly products and holistic wellness approaches"
            rows={6}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-blue transition-all resize-none"
          />
        </Card>
      </div>

      <Button
        variant="green"
        onClick={handleGenerate}
        disabled={generating || !gaps.trim() || !strategy.trim()}
      >
        {generating ? "Generating..." : "Generate Ad Copy"}
      </Button>

      {streamText && (
        <Card>
          <h2 className="text-lg font-semibold text-white mb-3">
            Generating...
          </h2>
          <pre className="text-muted text-sm whitespace-pre-wrap">
            {streamText}
          </pre>
        </Card>
      )}

      {ads.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Generated Ad Copy
          </h2>
          {ads.map((ad, i) => (
            <Card key={i}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-primary-blue text-xs font-medium uppercase">
                  {ad.platform}
                </span>
                <span className="text-muted text-xs">{ad.angle}</span>
              </div>
              <p className="text-white text-lg font-semibold">{ad.headline}</p>
              <p className="text-muted mt-2">{ad.primaryText}</p>
              <p className="text-muted text-sm mt-1">{ad.description}</p>
              <span className="inline-block mt-3 px-4 py-1.5 bg-primary-blue/20 text-primary-blue text-sm rounded">
                {ad.cta}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
