"use client";

import { useState, useEffect } from "react";
import { LuPlus, LuX, LuFolderOpen, LuPencil } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "@/src/client/services/project/useCreateProject";
import { useUpdateProject } from "@/src/client/services/project/useUpdateProject";

interface ProjectModalProps {
  /** Modo de operação */
  mode: "create" | "edit";
  /** Dados iniciais (apenas para mode="edit") */
  initialData?: {
    id: string;
    title: string;
    description?: string;
  };
  /** Label customizado para o botão trigger (opcional) */
  label?: string;
  /** Render customizado para o trigger (substitui o botão padrão) */
  trigger?: (open: () => void) => React.ReactNode;
}

export const ProjectModal = ({
  mode,
  initialData,
  label,
  trigger,
}: ProjectModalProps) => {
  const [open, setOpen] = useState(false);

  const { mutateAsync: createProject, isPending: isCreating } = useCreateProject();
  const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateProject();

  const isPending = isCreating || isUpdating;
  const isEdit = mode === "edit";

  const defaultLabel = isEdit ? "Editar Projeto" : "Novo Projeto";
  const resolvedLabel = label ?? defaultLabel;

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const title = data.get("title") as string;
    const description = (data.get("description") as string) || undefined;

    if (isEdit && initialData) {
      await updateProject({ id: initialData.id, data: { title, description } });
    } else {
      await createProject({ title, description });
    }

    handleClose();
  };

  return (
    <>
      {/* Trigger */}
      {trigger ? (
        trigger(handleOpen)
      ) : isEdit ? (
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LuPencil className="h-4 w-4" />
          <span>{resolvedLabel}</span>
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="flex items-center whitespace-nowrap bg-primary rounded p-2 text-primary-foreground text-sm md:text-base transition-all duration-150 hover:bg-primary/90 self-start md:self-auto"
        >
          <LuPlus className="mr-1 h-5 w-5" />
          <span className="hidden sm:inline">{resolvedLabel}</span>
          <span className="sm:hidden">{isEdit ? "Editar" : "Novo"}</span>
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div
            className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                  {isEdit ? (
                    <LuPencil className="h-4 w-4 text-primary" />
                  ) : (
                    <LuFolderOpen className="h-4 w-4 text-primary" />
                  )}
                </div>
                <h2 className="font-semibold text-base text-foreground">
                  {isEdit ? "Editar Projeto" : "Novo Projeto"}
                </h2>
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
                  defaultValue={initialData?.title}
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
                  defaultValue={initialData?.description}
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
                  {isEdit ? (
                    <>
                      <LuPencil className="mr-1 h-4 w-4" />
                      {isPending ? "Salvando..." : "Salvar"}
                    </>
                  ) : (
                    <>
                      <LuPlus className="mr-1 h-4 w-4" />
                      {isPending ? "Criando..." : "Criar Projeto"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};