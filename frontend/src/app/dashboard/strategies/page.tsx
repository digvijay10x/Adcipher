"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components";
import { analysisApi, Analysis } from "@/services/api";
import { useUser } from "@/hooks/useUser";

export default function StrategiesPage() {
  const { user: dbUser } = useUser();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selected, setSelected] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dbUser?.id) fetchAnalyses();
  }, [dbUser]);

  const fetchAnalyses = async () => {
    try {
      const data = await analysisApi.getAll(dbUser!.id);
      setAnalyses(data);
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await analysisApi.delete(id);
      if (selected?.id === id) setSelected(null);
      await fetchAnalyses();
    } catch (error) {
      console.error("Failed to delete analysis:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Strategies</h1>

      {loading ? (
        <p className="text-muted">Loading analyses...</p>
      ) : analyses.length === 0 ? (
        <Card>
          <p className="text-muted">
            No analyses yet. Run the pipeline from the Analysis page.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-lg font-semibold text-white mb-2">
              Past Analyses
            </h2>
            {analyses.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelected(a)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selected?.id === a.id
                    ? "border-primary-blue bg-primary-blue/10"
                    : "border-dark-border bg-dark-card hover:border-white/20"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {a.title || "Untitled Analysis"}
                    </p>
                    <p className="text-muted text-xs mt-1">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-muted text-xs mt-1">
                      {Array.isArray(a.gaps) ? a.gaps.length : 0} gaps /{" "}
                      {Array.isArray(a.generatedCopy)
                        ? a.generatedCopy.length
                        : 0}{" "}
                      ads
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(a.id);
                    }}
                    className="text-red-400 hover:text-red-300 text-xs transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="space-y-6">
                <Card>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {selected.title}
                  </h2>
                  <p className="text-muted text-sm">
                    {new Date(selected.createdAt).toLocaleDateString()}
                  </p>
                </Card>

                {Array.isArray(selected.researchData) &&
                  selected.researchData.length > 0 && (
                    <Card>
                      <h3 className="text-lg font-semibold text-primary-green mb-3">
                        Research Data
                      </h3>
                      {selected.researchData.map((brand: any, i: number) => (
                        <div
                          key={i}
                          className="mb-4 pb-4 border-b border-dark-border last:border-0"
                        >
                          <p className="text-white font-medium">
                            {brand.brand}
                          </p>
                          <p className="text-muted text-sm mt-1">
                            {brand.summary}
                          </p>
                          <p className="text-muted text-xs mt-1">
                            {brand.ads?.length || 0} ads collected
                          </p>
                        </div>
                      ))}
                    </Card>
                  )}

                {Array.isArray(selected.hooks) && selected.hooks.length > 0 && (
                  <Card>
                    <h3 className="text-lg font-semibold text-primary-blue mb-3">
                      Hooks Found ({selected.hooks.length})
                    </h3>
                    {selected.hooks.map((hook: any, i: number) => (
                      <div
                        key={i}
                        className="mb-3 pl-3 border-l-2 border-primary-blue/30"
                      >
                        <p className="text-white text-sm font-medium">
                          {hook.name}
                        </p>
                        <p className="text-muted text-xs">{hook.description}</p>
                        <p className="text-muted text-xs mt-1">
                          Used by: {hook.usedBy?.join(", ")} | Frequency:{" "}
                          {hook.frequency}
                        </p>
                      </div>
                    ))}
                  </Card>
                )}

                {Array.isArray(selected.saturatedAngles) &&
                  selected.saturatedAngles.length > 0 && (
                    <Card>
                      <h3 className="text-lg font-semibold text-red-400 mb-3">
                        Saturated Angles ({selected.saturatedAngles.length})
                      </h3>
                      {selected.saturatedAngles.map((angle: any, i: number) => (
                        <div
                          key={i}
                          className="mb-3 pl-3 border-l-2 border-red-500/30"
                        >
                          <p className="text-white text-sm font-medium">
                            {angle.angle}
                          </p>
                          <p className="text-muted text-xs">{angle.reason}</p>
                        </div>
                      ))}
                    </Card>
                  )}

                {Array.isArray(selected.gaps) && selected.gaps.length > 0 && (
                  <Card>
                    <h3 className="text-lg font-semibold text-primary-green mb-3">
                      Gap Opportunities ({selected.gaps.length})
                    </h3>
                    {selected.gaps.map((gap: any, i: number) => (
                      <div
                        key={i}
                        className="mb-3 pl-3 border-l-2 border-primary-green/30"
                      >
                        <p className="text-white text-sm font-medium">
                          {gap.opportunity}
                        </p>
                        <p className="text-muted text-xs">{gap.reasoning}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-green/10 text-primary-green text-xs rounded">
                          {gap.targetEmotion}
                        </span>
                      </div>
                    ))}
                  </Card>
                )}

                {selected.counterStrategy && (
                  <Card>
                    <h3 className="text-lg font-semibold text-primary-blue mb-3">
                      Counter-Strategy
                    </h3>
                    <p className="text-white text-sm mb-4">
                      {selected.counterStrategy.positioning}
                    </p>
                    {selected.counterStrategy.angles?.map(
                      (angle: any, i: number) => (
                        <div
                          key={i}
                          className="mb-3 pl-3 border-l-2 border-primary-blue/30"
                        >
                          <p className="text-white text-sm font-medium">
                            {angle.angle}
                          </p>
                          <p className="text-muted text-xs">
                            {angle.description}
                          </p>
                          <p className="text-muted text-xs mt-1">
                            {angle.whyItWorks}
                          </p>
                        </div>
                      ),
                    )}
                  </Card>
                )}

                {Array.isArray(selected.generatedCopy) &&
                  selected.generatedCopy.length > 0 && (
                    <Card>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Generated Ad Copy
                      </h3>
                      <div className="space-y-3">
                        {selected.generatedCopy.map((ad: any, i: number) => (
                          <div
                            key={i}
                            className="p-3 bg-dark-bg rounded-lg border border-dark-border"
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
                    </Card>
                  )}
              </div>
            ) : (
              <Card>
                <p className="text-muted">
                  Select an analysis to view details.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
