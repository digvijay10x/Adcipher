"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { User, Competitor, Analysis } from "@/types";

interface AppContextType {
  user: User | null;
  competitors: Competitor[];
  analyses: Analysis[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setCompetitors: (competitors: Competitor[]) => void;
  addCompetitor: (competitor: Competitor) => void;
  removeCompetitor: (id: string) => void;
  setAnalyses: (analyses: Analysis[]) => void;
  addAnalysis: (analysis: Analysis) => void;
  setLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setLoading] = useState(false);

  const addCompetitor = (competitor: Competitor) => {
    setCompetitors((prev) => [...prev, competitor]);
  };

  const removeCompetitor = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  const addAnalysis = (analysis: Analysis) => {
    setAnalyses((prev) => [...prev, analysis]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        competitors,
        analyses,
        isLoading,
        setUser,
        setCompetitors,
        addCompetitor,
        removeCompetitor,
        setAnalyses,
        addAnalysis,
        setLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
