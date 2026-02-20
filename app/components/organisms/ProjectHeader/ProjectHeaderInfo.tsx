"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, AlignLeft } from "lucide-react";
import { Project } from "@/app/types/Project";

interface ProjectHeaderInfoProps {
  project: Project;
}

export const ProjectHeaderInfo = ({ project }: ProjectHeaderInfoProps) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [hoverTitle, setHoverTitle] = useState(false);
  const [hoverDesc, setHoverDesc] = useState(false);
  const [focusTitle, setFocusTitle] = useState(false);
  const [focusDesc, setFocusDesc] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc) descRef.current?.focus();
  }, [editingDesc]);

  const handleTitleBlur = () => {
    setEditingTitle(false);
    setFocusTitle(false);
    if (!title.trim()) setTitle(project.title);
  };

  const handleDescBlur = () => {
    setEditingDesc(false);
    setFocusDesc(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") titleRef.current?.blur();
  };

  const handleDescKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") descRef.current?.blur();
  };

  const showTitleIcon = hoverTitle || focusTitle;
  const showDescIcon = hoverDesc || focusDesc;

  return (
    <div className="mb-4 md:mb-6">
      {/* Title */}
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
              <span className="opacity-40 italic">Adicionar descrição...</span>
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
  );
};