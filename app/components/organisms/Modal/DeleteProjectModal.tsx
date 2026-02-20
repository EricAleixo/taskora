"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteProjectModalProps {
  open: boolean;
  projectTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DeleteProjectModal = ({
  open,
  projectTitle,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteProjectModalProps) => {
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-xl border border-border bg-card shadow-xl p-5 md:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle size={18} className="text-destructive" />
                  </div>
                  <h2 className="text-base md:text-lg font-semibold text-foreground leading-snug">
                    Excluir projeto
                  </h2>
                </div>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <p className="text-sm text-muted-foreground mb-1">
                Tem certeza que deseja excluir{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{projectTitle}&rdquo;
                </span>
                ?
              </p>
              <p className="text-xs text-muted-foreground/70 mb-6">
                Esta ação não pode ser desfeita. Todos os dados associados serão
                permanentemente removidos.
              </p>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  {isLoading ? "Excluindo..." : "Excluir projeto"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};