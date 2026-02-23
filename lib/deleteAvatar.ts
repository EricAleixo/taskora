/**
 * deleteAvatar — utilitário SERVER-SIDE
 * ─────────────────────────────────────────────────────────────────────────────
 * Use ao excluir um usuário ou ao trocar o avatar fora do fluxo de upload.
 *
 * Exemplo de uso ao deletar usuário:
 *
 *   // em algum server action ou route handler de deleção de conta
 *   import { deleteAvatarByUrl } from "@/lib/deleteAvatar";
 *
 *   const user = await db.profile.findUnique({ where: { id } });
 *   await deleteAvatarByUrl(user?.avatarUrl);
 *   await db.profile.delete({ where: { id } });
 */

import { cloudinary } from "@/lib/cloudinary";

/** Extrai o public_id de uma URL do Cloudinary.
 *  https://res.cloudinary.com/demo/image/upload/v123/avatars/user_abc.webp
 *  → "avatars/user_abc"
 */
function publicIdFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    const match = pathname.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Deleta a imagem no Cloudinary a partir da URL armazenada no banco.
 * Retorna `true` se deletou, `false` se a URL era inválida ou não era do Cloudinary.
 * Nunca lança exceção — loga e retorna `false` em caso de erro.
 */
export async function deleteAvatarByUrl(
  avatarUrl: string | null | undefined
): Promise<boolean> {
  if (!avatarUrl) return false;

  const publicId = publicIdFromUrl(avatarUrl);
  if (!publicId) return false;

  try {
    const { result } = await cloudinary.uploader.destroy(publicId);
    return result === "ok";
  } catch (err) {
    console.error("[deleteAvatar] Falha ao deletar no Cloudinary:", err);
    return false;
  }
}