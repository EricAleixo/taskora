import { useMutation } from "@tanstack/react-query";

interface UploadAvatarParams {
  /** Blob recortado pelo AvatarCropModal */
  blob: Blob;
  /** URL do avatar atual para deletar no Cloudinary após o novo upload */
  oldUrl?: string;
}

async function uploadAvatar({ blob, oldUrl }: UploadAvatarParams): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "avatar.webp");
  if (oldUrl) form.append("oldUrl", oldUrl);

  const res = await fetch("/api/upload/avatar", { method: "POST", body: form });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error ?? "Falha no upload");
  }

  const { url } = await res.json();
  return url as string;
}

export function useUploadAvatar() {
  return useMutation({ mutationFn: uploadAvatar });
}