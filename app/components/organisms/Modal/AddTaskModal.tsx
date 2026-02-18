"use client";

import { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { useCreateTask } from "@/src/client/services/project/useCreateTask";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AddTaskModalProps {
  projectId: number;
  /** "primary" = botão verde do header | "ghost" = botão sutil das colunas */
  variant?: "primary" | "ghost";
}

// ─── Trigger variants ────────────────────────────────────────────────────────

const TriggerPrimary = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center whitespace-nowrap bg-primary rounded p-2 text-primary-foreground text-sm md:text-base transition-all duration-150 hover:bg-primary/90"
  >
    <MdAdd className="mr-1 h-5 w-5 md:h-6 md:w-6" />
    <span className="hidden sm:inline">Adicionar Tarefa</span>
    <span className="sm:hidden">Nova</span>
  </button>
);

const TriggerGhost = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="ghost"
    className="w-full justify-start text-muted-foreground hover:text-foreground"
    onClick={onClick}
  >
    <MdAdd className="mr-2 h-4 w-4" />
    Adicionar
  </Button>
);

// ─── Component ───────────────────────────────────────────────────────────────

export const AddTaskModal = ({ projectId, variant = "primary" }: AddTaskModalProps) => {
  const [open, setOpen] = useState(false);

  const { mutateAsync, isPending } = useCreateTask(projectId);

  const handleOpen  = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    await mutateAsync({
      title:       data.get("title") as string,
      description: (data.get("description") as string) || null,
      date:        new Date().toISOString(),
      projectId,
    });

    handleClose();
  };

  return (
    <>
      {/* Trigger */}
      {variant === "primary" ? (
        <TriggerPrimary onClick={handleOpen} />
      ) : (
        <TriggerGhost onClick={handleOpen} />
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                  <MdAdd className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold text-base text-foreground">Nova Tarefa</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Título <span className="text-destructive">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  minLength={3}
                  autoFocus
                  placeholder="Ex: Revisar pull request"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Detalhes adicionais (opcional)"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  <MdAdd className="mr-1 h-4 w-4" />
                  {isPending ? "Criando..." : "Criar Tarefa"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};