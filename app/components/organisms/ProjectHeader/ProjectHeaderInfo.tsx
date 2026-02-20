"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, AlignLeft, Trash2 } from "lucide-react";
import { Project } from "@/app/types/Project";
import { useUpdateProject } from "@/src/client/services/project/useUpdateProject";
import { useDeleteProject } from "@/src/client/services/project/useDeleteProject";
import { DeleteProjectModal } from "../Modal/DeleteProjectModal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProjectHeaderInfoProps {
  project: Project;
}

export const ProjectHeaderInfo = ({ project }: ProjectHeaderInfoProps) => {
  const { mutate: updateProject } = useUpdateProject();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [hoverTitle, setHoverTitle] = useState(false);
  const [hoverDesc, setHoverDesc] = useState(false);
  const [focusTitle, setFocusTitle] = useState(false);
  const [focusDesc, setFocusDesc] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(project.title);
  }, [project.title]);

  useEffect(() => {
    setDescription(project.description ?? "");
  }, [project.description]);

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc) descRef.current?.focus();
  }, [editingDesc]);
  

  const handleTitleBlur = () => {
    setEditingTitle(false);
    setFocusTitle(false);

    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(project.title);
      return;
    }

    if (trimmed !== project.title) {
      updateProject({ id: String(project.id), data: { title: trimmed } });
    }
  };

  const handleDescBlur = () => {
    setEditingDesc(false);
    setFocusDesc(false);

    const trimmed = description.trim();
    if (trimmed !== (project.description ?? "")) {
      updateProject({ id: String(project.id), data: { description: trimmed } });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") titleRef.current?.blur();
  };

  const handleDescKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") descRef.current?.blur();
  };

  const router = useRouter();

  const handleDeleteConfirm = () => {
    deleteProject(
      { id: String(project.id) },
      {
        onSuccess: () => {
          setDeleteModalOpen(false);

          router.push(`/projects?deleted=true&title=${encodeURIComponent(project.title)}`);
          router.refresh(); // opcional, mas recomendado
        },
        onError: () => {
          toast.error("Erro ao deletar projeto");
        },
      },
    );
  };

  const showTitleIcon = hoverTitle || focusTitle;
  const showDescIcon = hoverDesc || focusDesc;

  return (
    <>
      <div className="mb-4 md:mb-6">
        {/* Title row */}
        <div
          className="flex items-center gap-2 mb-2 group/title"
          onMouseEnter={() => setHoverTitle(true)}
          onMouseLeave={() => setHoverTitle(false)}
        >
          {editingTitle ? (
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setFocusTitle(true)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-xl md:text-2xl font-bold w-full bg-transparent outline-none transition-colors text-foreground"
            />
          ) : (
            <h1
              onClick={() => setEditingTitle(true)}
              className="text-xl md:text-2xl font-bold truncate cursor-text hover:opacity-70 transition-opacity"
            >
              {title}
            </h1>
          )}

          <AnimatePresence>
            {showTitleIcon && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="shrink-0 text-muted-foreground/50"
              >
                <Pencil size={14} />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Delete button — sempre visível em mobile, aparece no hover em desktop */}
          <motion.button
            onClick={() => setDeleteModalOpen(true)}
            whileTap={{ scale: 0.9 }}
            aria-label="Excluir projeto"
            className="
              ml-auto shrink-0
              flex items-center justify-center
              h-7 w-7 rounded-md
              text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10
              transition-colors
              opacity-100 md:opacity-0 md:group-hover/title:opacity-100
            "
          >
            <Trash2 size={15} />
          </motion.button>
        </div>

        {/* Description */}
        <div
          className="flex items-start gap-2 group/desc"
          onMouseEnter={() => setHoverDesc(true)}
          onMouseLeave={() => setHoverDesc(false)}
        >
          {editingDesc ? (
            <textarea
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setFocusDesc(true)}
              onBlur={handleDescBlur}
              onKeyDown={handleDescKeyDown}
              rows={2}
              placeholder="Adicionar descrição..."
              className="text-muted-foreground text-xs md:text-sm w-full bg-transparent outline-none transition-colors resize-none"
            />
          ) : (
            <p
              onClick={() => setEditingDesc(true)}
              className="text-muted-foreground text-xs md:text-sm cursor-text hover:opacity-70 transition-opacity min-h-5"
            >
              {description || (
                <span className="opacity-40 italic">
                  Adicionar descrição...
                </span>
              )}
            </p>
          )}

          <AnimatePresence>
            {showDescIcon && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="shrink-0 text-muted-foreground/50 mt-0.5"
              >
                <AlignLeft size={13} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <DeleteProjectModal
        open={deleteModalOpen}
        projectTitle={title}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
        isLoading={isDeleting}
      />
    </>
  );
};
