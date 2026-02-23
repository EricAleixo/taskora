"use server";

import { db } from "@/src/server/db";
import { eq, and, gt } from "drizzle-orm";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { otpTable, userTable } from "../db/schemas";

const transporter = nodemailer.createTransport({
  service: "Outlook365",
  auth: {
    user: process.env.EMAIL_USER, // seuemail@outlook.com
    pass: process.env.EMAIL_PASS, // sua senha normal do Outlook
  },
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationCode(email: string, password: string) {
  await db.delete(otpTable).where(eq(otpTable.email, email));

  const code = generateCode();
  const passwordHash = await bcrypt.hash(password, 12);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(otpTable).values({
    email,
    passwordHash,
    code,
    expiresAt,
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Seu código de verificação",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
          <h2>Verificação de email</h2>
          <p>Use o código abaixo para concluir seu cadastro. Ele expira em <strong>10 minutos</strong>.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 24px; background: #f4f4f5; border-radius: 8px; margin: 24px 0;">
            ${code}
          </div>
          <p style="color: #888; font-size: 12px;">Se você não solicitou este código, ignore este email.</p>
        </div>
      `,
    });
  } catch {
    return { success: false, error: "Erro ao enviar email." };
  }

  return { success: true };
}

export async function verifyCodeAndCreateUser(email: string, code: string) {
  const otpRecords = await db
    .select()
    .from(otpTable)
    .where(
      and(
        eq(otpTable.email, email),
        eq(otpTable.code, code),
        gt(otpTable.expiresAt, new Date())
      )
    )
    .limit(1);

  if (otpRecords.length === 0) {
    return { success: false, error: "Código inválido ou expirado." };
  }

  const otp = otpRecords[0];

  const existing = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "Email já cadastrado." };
  }

  await db.insert(userTable).values({
    email,
    password: otp.passwordHash,
  });

  await db.delete(otpTable).where(eq(otpTable.id, otp.id));

  return { success: true };
}