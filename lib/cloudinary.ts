import { v2 as cloudinary } from "cloudinary";

/**
 * Configure suas credenciais no .env.local:
 *
 *   CLOUDINARY_CLOUD_NAME=seu_cloud_name
 *   CLOUDINARY_API_KEY=sua_api_key
 *   CLOUDINARY_API_SECRET=seu_api_secret
 *
 * Essas variáveis NUNCA devem ter prefixo NEXT_PUBLIC_ — ficam só no servidor.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };