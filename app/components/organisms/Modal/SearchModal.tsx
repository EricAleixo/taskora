"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LuSearch,
  LuFolder,
  LuSquareCheck,
  LuArrowRight,
  LuX,
  LuLoader,
} from "react-icons/lu";
import { useSearch } from "@/src/client/services/search/useSearch";

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  done: "Concluída",
  cancelled: "Cancelada",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  in_progress: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  done: "bg-green-500/15 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/15 text-red-500",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
        STATUS_COLOR[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// ── Highlight matching text ───────────────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-sm px-0.5 not-italic font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Result item ───────────────────────────────────────────────────────────────

interface ResultItemProps {
  icon: React.ReactNode;
  title: string;
  query: string;
  right?: React.ReactNode;
  active: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

function ResultItem({ icon, title, query, right, active, onClick, onMouseEnter }: ResultItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
        active
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground/50")}>
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium truncate">
        <Highlight text={title} query={query} />
      </span>
      {right}
      {active && <LuArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />}
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50">
      {children}
    </p>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data, isFetching } = useSearch(query);

  const projects = data?.projects ?? [];
  const tasks = data?.tasks ?? [];

  // Flat list for keyboard navigation
  const allItems = [
    ...projects.map((p) => ({ type: "project" as const, ...p })),
    ...tasks.map((t) => ({ type: "task" as const, ...t })),
  ];

  const isEmpty = query.length >= 2 && !isFetching && allItems.length === 0;

  const navigate = useCallback(
    (item: (typeof allItems)[number]) => {
      if (item.type === "project") {
        router.push(`/projects/${item.id}`);
      } else {
        router.push(`/tasks?highlight=${item.id}`);
      }
      onClose();
    },
    [router, onClose],
  );

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keep activeIndex in bounds
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && allItems[activeIndex]) {
        navigate(allItems[activeIndex]);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, allItems, activeIndex, navigate, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[15vh] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <div
              className="bg-background border border-border/80 rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 24px 64px hsl(0 0% 0% / 0.25), 0 0 0 1px hsl(var(--border)/0.5)" }}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
                {isFetching ? (
                  <LuLoader className="h-4 w-4 text-muted-foreground/60 shrink-0 animate-spin" />
                ) : (
                  <LuSearch className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar projetos e tarefas…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    <LuX className="h-4 w-4" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground/50">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-95 overflow-y-auto p-2">
                {/* Estado vazio — query curta */}
                {query.length < 2 && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground/40">
                    <LuSearch className="h-8 w-8" />
                    <p className="text-sm">Digite para buscar</p>
                  </div>
                )}

                {/* Sem resultados */}
                {isEmpty && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground/40">
                    <p className="text-sm">Nenhum resultado para</p>
                    <p className="text-sm font-semibold text-muted-foreground">"{query}"</p>
                  </div>
                )}

                {/* Projetos */}
                {projects.length > 0 && (
                  <div className="mb-1">
                    <SectionLabel>Projetos</SectionLabel>
                    {projects.map((p, i) => (
                      <ResultItem
                        key={`project-${p.id}`}
                        icon={<LuFolder className="h-4 w-4" />}
                        title={p.title}
                        query={query}
                        active={activeIndex === i}
                        onClick={() => navigate({ type: "project", ...p })}
                        onMouseEnter={() => setActiveIndex(i)}
                      />
                    ))}
                  </div>
                )}

                {/* Tarefas */}
                {tasks.length > 0 && (
                  <div>
                    <SectionLabel>Tarefas</SectionLabel>
                    {tasks.map((t, i) => (
                      <ResultItem
                        key={`task-${t.id}`}
                        icon={<LuSquareCheck className="h-4 w-4" />}
                        title={t.title}
                        query={query}
                        right={<StatusBadge status={t.status} />}
                        active={activeIndex === projects.length + i}
                        onClick={() => navigate({ type: "task", ...t })}
                        onMouseEnter={() => setActiveIndex(projects.length + i)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              {allItems.length > 0 && (
                <div className="border-t border-border/60 px-4 py-2 flex items-center gap-3 text-[10px] text-muted-foreground/40">
                  <span className="flex items-center gap-1">
                    <kbd className="font-mono bg-muted rounded px-1 py-0.5">↑↓</kbd> navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="font-mono bg-muted rounded px-1 py-0.5">↵</kbd> abrir
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="font-mono bg-muted rounded px-1 py-0.5">ESC</kbd> fechar
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}