"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components";
import { analysisApi, Analysis } from "@/services/api";
import { useUser } from "@/hooks/useUser";

interface BrandPoint {
  brand: string;
  adCount: number;
  hookDiversity: number;
  x: number;
  y: number;
}

export default function LandscapePage() {
  const { user: dbUser } = useUser();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [points, setPoints] = useState<BrandPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<BrandPoint | null>(null);

  useEffect(() => {
    if (dbUser?.id) fetchData();
  }, [dbUser]);

  const fetchData = async () => {
    try {
      const data = await analysisApi.getAll(dbUser!.id);
      setAnalyses(data);
      buildPoints(data);
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
    }
    setLoading(false);
  };

  const buildPoints = (analyses: Analysis[]) => {
    const brandMap = new Map<string, { adCount: number; hooks: Set<string> }>();

    for (const analysis of analyses) {
      const research = Array.isArray(analysis.researchData)
        ? analysis.researchData
        : [];
      const hooks = Array.isArray(analysis.hooks) ? analysis.hooks : [];

      for (const brand of research) {
        const existing = brandMap.get(brand.brand) || {
          adCount: 0,
          hooks: new Set<string>(),
        };
        existing.adCount += brand.ads?.length || 0;
        hooks.forEach((h: any) => {
          if (h.usedBy?.includes(brand.brand)) {
            existing.hooks.add(h.name);
          }
        });
        brandMap.set(brand.brand, existing);
      }
    }

    const maxAds = Math.max(
      ...Array.from(brandMap.values()).map((v) => v.adCount),
      1,
    );
    const maxHooks = Math.max(
      ...Array.from(brandMap.values()).map((v) => v.hooks.size),
      1,
    );

    const result: BrandPoint[] = Array.from(brandMap.entries()).map(
      ([brand, data]) => ({
        brand,
        adCount: data.adCount,
        hookDiversity: data.hooks.size,
        x: (data.adCount / maxAds) * 80 + 10,
        y: 90 - (data.hooks.size / maxHooks) * 80,
      }),
    );

    setPoints(result);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        Competitive Landscape
      </h1>

      {loading ? (
        <p className="text-muted">Loading landscape data...</p>
      ) : points.length === 0 ? (
        <Card>
          <p className="text-muted">
            No data yet. Run the analysis pipeline first to populate the
            landscape.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="relative w-full" style={{ height: "500px" }}>
              {/* Y-axis label */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-muted text-sm whitespace-nowrap">
                Hook Diversity
              </div>

              {/* X-axis label */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-muted text-sm">
                Ad Volume
              </div>

              {/* Grid */}
              <div className="absolute inset-8 border border-dark-border rounded-lg">
                {/* Grid lines */}
                <div className="absolute top-1/4 left-0 right-0 border-t border-dark-border/30" />
                <div className="absolute top-1/2 left-0 right-0 border-t border-dark-border/30" />
                <div className="absolute top-3/4 left-0 right-0 border-t border-dark-border/30" />
                <div className="absolute left-1/4 top-0 bottom-0 border-l border-dark-border/30" />
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-dark-border/30" />
                <div className="absolute left-3/4 top-0 bottom-0 border-l border-dark-border/30" />

                {/* Quadrant labels */}
                <span className="absolute top-2 left-2 text-xs text-muted/50">
                  Low Volume / High Diversity
                </span>
                <span className="absolute top-2 right-2 text-xs text-muted/50">
                  High Volume / High Diversity
                </span>
                <span className="absolute bottom-2 left-2 text-xs text-muted/50">
                  Low Volume / Low Diversity
                </span>
                <span className="absolute bottom-2 right-2 text-xs text-muted/50">
                  High Volume / Low Diversity
                </span>

                {/* Data points */}
                {points.map((point) => (
                  <div
                    key={point.brand}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    onMouseEnter={() => setHovered(point)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="w-4 h-4 rounded-full bg-primary-blue border-2 border-white/20 transition-all group-hover:w-6 group-hover:h-6 group-hover:border-primary-green" />
                    <span className="absolute top-6 left-1/2 -translate-x-1/2 text-white text-xs font-medium whitespace-nowrap">
                      {point.brand}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {hovered && (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-2">
                {hovered.brand}
              </h3>
              <div className="flex gap-8">
                <div>
                  <p className="text-muted text-sm">Ads Found</p>
                  <p className="text-2xl font-bold text-primary-blue">
                    {hovered.adCount}
                  </p>
                </div>
                <div>
                  <p className="text-muted text-sm">Hook Diversity</p>
                  <p className="text-2xl font-bold text-primary-green">
                    {hovered.hookDiversity}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {points.map((point) => (
              <Card key={point.brand}>
                <h3 className="text-white font-semibold mb-2">{point.brand}</h3>
                <div className="flex justify-between">
                  <div>
                    <p className="text-muted text-xs">Ad Volume</p>
                    <p className="text-white font-bold">{point.adCount}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Hook Diversity</p>
                    <p className="text-white font-bold">
                      {point.hookDiversity}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
