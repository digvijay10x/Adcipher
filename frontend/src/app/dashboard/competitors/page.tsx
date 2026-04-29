"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/components";
import { competitorApi, Competitor } from "@/services/api";
import { useUser } from "@/hooks/useUser";

export default function CompetitorsPage() {
  const { user: dbUser } = useUser();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

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
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!brand.trim() || !dbUser?.id) return;
    setAdding(true);
    try {
      await competitorApi.add({
        brand: brand.trim(),
        name: brand.trim(),
        userId: dbUser.id,
      });
      setBrand("");
      await fetchCompetitors();
    } catch (error) {
      console.error("Failed to add competitor:", error);
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await competitorApi.delete(id);
      await fetchCompetitors();
    } catch (error) {
      console.error("Failed to delete competitor:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Competitors</h1>

      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">
          Add Competitor Brand
        </h2>
        <div className="flex gap-4">
          <Input
            placeholder="Enter brand name (e.g. Nike, Zomato, Razorpay)"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button
            variant="green"
            onClick={handleAdd}
            disabled={adding || !brand.trim()}
          >
            {adding ? "Adding..." : "Add Brand"}
          </Button>
        </div>
      </Card>

      <div className="mt-8">
        {loading ? (
          <p className="text-muted">Loading competitors...</p>
        ) : competitors.length === 0 ? (
          <Card>
            <p className="text-muted">
              No competitors added yet. Add a brand above to start tracking.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitors.map((comp) => (
              <Card key={comp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {comp.name || comp.brand}
                    </h3>
                    <p className="text-muted text-sm mt-1">{comp.brand}</p>
                    <p className="text-muted text-sm mt-2">
                      Added {new Date(comp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(comp.id)}
                    className="text-red-400 hover:text-red-300 text-sm transition-all"
                  >
                    Remove
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
