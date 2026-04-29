"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components";
import {
  competitorApi,
  analysisApi,
  Competitor,
  Analysis,
} from "@/services/api";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";

export default function DashboardPage() {
  const { dbUser } = useUser();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dbUser?.id) fetchData();
  }, [dbUser]);

  const fetchData = async () => {
    try {
      const [comps, anals] = await Promise.all([
        competitorApi.getAll(dbUser!.id),
        analysisApi.getAll(dbUser!.id),
      ]);
      setCompetitors(comps);
      setAnalyses(anals);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  };

  const totalGaps = analyses.reduce((total, a) => {
    const gaps = Array.isArray(a.gaps) ? a.gaps.length : 0;
    return total + gaps;
  }, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-muted mb-1">Competitors Tracked</p>
          <p className="text-3xl font-bold text-white">
            {loading ? "..." : competitors.length}
          </p>
        </Card>
        <Card>
          <p className="text-muted mb-1">Analyses Run</p>
          <p className="text-3xl font-bold text-white">
            {loading ? "..." : analyses.length}
          </p>
        </Card>
        <Card>
          <p className="text-muted mb-1">Gaps Discovered</p>
          <p className="text-3xl font-bold text-primary-green">
            {loading ? "..." : totalGaps}
          </p>
        </Card>
        <Card>
          <p className="text-muted mb-1">Ad Copy Generated</p>
          <p className="text-3xl font-bold text-primary-blue">
            {loading
              ? "..."
              : analyses.reduce(
                  (t, a) =>
                    t +
                    (Array.isArray(a.generatedCopy)
                      ? a.generatedCopy.length
                      : 0),
                  0,
                )}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/competitors"
              className="px-4 py-3 bg-dark-bg rounded-lg text-white hover:bg-dark-cardHover transition-all border border-dark-border"
            >
              Add Competitor Brands
            </Link>
            <Link
              href="/dashboard/analysis"
              className="px-4 py-3 bg-primary-blue/10 rounded-lg text-primary-blue hover:bg-primary-blue/20 transition-all border border-primary-blue/30"
            >
              Run AI Analysis Pipeline
            </Link>
            <Link
              href="/dashboard/generate"
              className="px-4 py-3 bg-primary-green/10 rounded-lg text-primary-green hover:bg-primary-green/20 transition-all border border-primary-green/30"
            >
              Generate Ad Copy
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Analyses
          </h2>
          {analyses.length === 0 ? (
            <p className="text-muted">
              No analyses yet. Run the pipeline to get started.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {analyses.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  href="/dashboard/strategies"
                  className="p-3 bg-dark-bg rounded-lg border border-dark-border hover:border-primary-blue/30 transition-all"
                >
                  <p className="text-white text-sm font-medium">
                    {a.title || "Untitled Analysis"}
                  </p>
                  <p className="text-muted text-xs mt-1">
                    {new Date(a.createdAt).toLocaleDateString()} -{" "}
                    {Array.isArray(a.gaps) ? a.gaps.length : 0} gaps found
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
