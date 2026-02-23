"use client";

/**
 * AvatarCropModal
 * ──────────────────────────────────────────────────────────────
 * Deps:  npm install react-easy-crop
 * Types: npm install -D @types/react-easy-crop   ← geralmente não precisa (tem embutido)
 *
 * Uso:
 *   <AvatarCropModal
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onCropComplete={(blob) => handleUpload(blob)}
 *   />
 */

import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { LuZoomIn, LuRefreshCw } from "react-icons/lu";

// ── Canvas helper ─────────────────────────────────────────────────────────────

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  outputSize = 400
): Promise<Blob> {
  const image = await createImageBitmap(await (await fetch(imageSrc)).blob());

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
      "image/webp",
      0.92
    )
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AvatarCropModalProps {
  open: boolean;
  onClose: () => void;
  /** Recebe o Blob recortado — quem chama decide o que fazer (upload, preview…) */
  onCropComplete: (blob: Blob) => void | Promise<void>;
  /** Tamanho do output em px (padrão 400) */
  outputSize?: number;
}

export function AvatarCropModal({
  open,
  onClose,
  onCropComplete,
  outputSize = 400,
}: AvatarCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Handlers ──

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    // Limpa input para aceitar o mesmo arquivo novamente
    e.target.value = "";
  };

  const handleCropCompleteInternal = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setLoading(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, outputSize);
      await onCropComplete(blob);
      handleClose();
    } catch (err) {
      console.error("Crop error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    onClose();
  };

  // ── Render ──

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Foto de perfil</DialogTitle>
        </DialogHeader>

        {/* Seletor de arquivo (antes de ter imagem) */}
        {!imageSrc && (
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full h-48 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
            >
              <LuZoomIn className="h-8 w-8" />
              <span className="text-sm font-medium">Clique para selecionar uma imagem</span>
              <span className="text-xs">PNG, JPG, WEBP — máx. 5 MB</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Área de crop */}
        {imageSrc && (
          <>
            <div className="relative w-full h-72 bg-zinc-950">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropCompleteInternal}
              />
            </div>

            {/* Controles */}
            <div className="px-6 py-4 space-y-4">
              {/* Zoom */}
              <div className="flex items-center gap-3">
                <LuZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
                <Slider
                  min={1}
                  max={3}
                  step={0.05}
                  value={[zoom]}
                  onValueChange={([v]) => setZoom(v)}
                  className="flex-1"
                />
              </div>

              {/* Rotação */}
              <div className="flex items-center gap-3">
                <LuRefreshCw className="h-4 w-4 text-muted-foreground shrink-0" />
                <Slider
                  min={-180}
                  max={180}
                  step={1}
                  value={[rotation]}
                  onValueChange={([v]) => setRotation(v)}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {rotation}°
                </span>
              </div>

              {/* Trocar imagem */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Trocar imagem
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </>
        )}

        <DialogFooter className="px-6 pb-6 gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!imageSrc || loading}
          >
            {loading ? "Aplicando…" : "Aplicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}