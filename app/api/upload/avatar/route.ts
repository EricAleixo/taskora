import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extrai o public_id de uma URL do Cloudinary.
 *  Ex: https://res.cloudinary.com/demo/image/upload/v123/avatars/user_abc.webp
 *      → "avatars/user_abc"
 */
function publicIdFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    // Remove tudo antes de /upload/ e a extensão final
    const match = pathname.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ── POST /api/upload/avatar ───────────────────────────────────────────────────
// Body: FormData com campo "file" (Blob/File) e "oldUrl?" (string)

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const oldUrl = form.get("oldUrl") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // Valida tipo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas." }, { status: 422 });
    }

    // Limita 5 MB
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Imagem deve ter menos de 5 MB." }, { status: 422 });
    }

    // Converte File → Buffer → base64 data URI (Cloudinary aceita assim)
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Faz upload
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "avatars",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
      // Substitui automaticamente se enviar o mesmo public_id
      overwrite: true,
    });

    // Deleta avatar antigo (melhor esforço — não falha o request se der erro)
    if (oldUrl) {
      const oldPublicId = publicIdFromUrl(oldUrl);
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId).catch(console.error);
      }
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("[upload/avatar] POST error:", err);
    return NextResponse.json({ error: "Erro interno no upload." }, { status: 500 });
  }
}

// ── DELETE /api/upload/avatar ─────────────────────────────────────────────────
// Body: JSON { url: string }
// Chamado ao excluir o usuário ou ao limpar o avatar manualmente.

export async function DELETE(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string };

    if (!url) {
      return NextResponse.json({ error: "URL não informada." }, { status: 400 });
    }

    const publicId = publicIdFromUrl(url);

    if (!publicId) {
      return NextResponse.json({ error: "Não foi possível extrair o public_id." }, { status: 422 });
    }

    const { result } = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ deleted: result === "ok" });
  } catch (err) {
    console.error("[upload/avatar] DELETE error:", err);
    return NextResponse.json({ error: "Erro interno ao deletar." }, { status: 500 });
  }
}