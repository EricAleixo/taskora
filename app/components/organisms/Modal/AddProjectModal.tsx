"use client";

import { useState } from "react";
import { LuPlus, LuX, LuFolderOpen } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "@/src/client/services/project/useCreateProject";

interface AddProjectModalProps {
  label?: string;
}

export const AddProjectModal = ({ label = "Novo Projeto" }: AddProjectModalProps) => {
  const [open, setOpen] = useState(false);

  const { mutateAsync, isPending } = useCreateProject();

  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    await mutateAsync({
      title:       data.get("title") as string,
      description: (data.get("description") as string) || undefined,
    });

    handleClose();
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center whitespace-nowrap bg-primary rounded p-2 text-primary-foreground text-sm md:text-base transition-all duration-150 hover:bg-primary/90 self-start md:self-auto"
      >
        <LuPlus className="mr-1 h-5 w-5" />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">Novo</span>
      </button>

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
                  <LuFolderOpen className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold text-base text-foreground">Novo Projeto</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LuX className="h-5 w-5" />
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
                  placeholder="Ex: Redesign do App"
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
                  placeholder="Detalhes sobre o projeto (opcional)"
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
                  <LuPlus className="mr-1 h-4 w-4" />
                  {isPending ? "Criando..." : "Criar Projeto"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};