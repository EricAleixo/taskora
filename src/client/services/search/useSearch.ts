import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export interface SearchProject {
  id: number;
  title: string;
}

export interface SearchTask {
  id: number;
  title: string;
  status: string;
  projectId: number | null;
}

export interface SearchResults {
  projects: SearchProject[];
  tasks: SearchTask[];
}

async function fetchSearch(q: string): Promise<SearchResults> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("Erro na busca");
  return res.json();
}

export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => fetchSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });
}