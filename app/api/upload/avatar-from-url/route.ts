import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

/**
 * POST /api/upload/avatar-from-url
 * Body JSON: { url: string }
 *
 * Faz download server-side de uma URL externa (Google, Apple, GitHub…)
 * e faz upload direto ao Cloudinary via fetch_url, contornando restrições
 * de CORS que impediriam o browser de fazer isso diretamente.
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string };

    if (!url) {
      return NextResponse.json({ error: "URL não informada." }, { status: 400 });
    }

    // Valida que é uma URL absoluta e de protocolo http(s)
    let parsed: URL;
    try {
      parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch {
      return NextResponse.json({ error: "URL inválida." }, { status: 422 });
    }

    // Faz download server-side seguindo redirects (Google, Apple redirectionam a URL da foto)
    const imageRes = await fetch(parsed.href, { redirect: "follow" });
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Não foi possível baixar a imagem externa." }, { status: 502 });
    }

    const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${contentType};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "avatars",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("[upload/avatar-from-url] POST error:", err);
    return NextResponse.json({ error: "Erro ao importar imagem externa." }, { status: 500 });
  }
}