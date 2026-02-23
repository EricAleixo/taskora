// components/FormSignUp.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginBtn } from "../../atoms/Buttons/LoginBtn";
import { FaApple } from "react-icons/fa";
import { motion } from "framer-motion";
import { sendVerificationCode, verifyCodeAndCreateUser } from "@/src/server/actions/auth-email";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const Item = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div variants={fadeUp} className={className}>
    {children}
  </motion.div>
);

export const FormSignUp = () => {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await sendVerificationCode(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Erro desconhecido.");
      return;
    }

    setStep("otp");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await verifyCodeAndCreateUser(email, code);

    if (!result.success) {
      setError(result.error ?? "Erro desconhecido.");
      setLoading(false);
      return;
    }

    // Loga automaticamente após criação
    const signInResult = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (signInResult?.ok) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-sm"
    >
      <Card className="w-full">
        <CardHeader>
          <div className="grid grid-cols-1 gap-2">
            <Item>
              <CardTitle>{step === "form" ? "Criar Conta" : "Verificar Email"}</CardTitle>
            </Item>
            <Item>
              <CardDescription>
                {step === "form"
                  ? "Para criar uma conta use seu email, ou alguma das seguintes plataformas."
                  : `Insira o código de 6 dígitos enviado para ${email}.`}
              </CardDescription>
            </Item>
          </div>
          {step === "form" && (
            <Item>
              <CardAction>
                <Link href="/login">
                  <Button variant="link">Login</Button>
                </Link>
              </CardAction>
            </Item>
          )}
        </CardHeader>

        <CardContent>
          {step === "form" ? (
            <form onSubmit={handleSubmitForm}>
              <div className="flex flex-col gap-6">
                <Item>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </Item>
                <Item>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </Item>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <div className="flex flex-col gap-6">
                <Item>
                  <div className="grid gap-2">
                    <Label htmlFor="code">Código de verificação</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </Item>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Item className="w-full">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verificando..." : "Confirmar código"}
                  </Button>
                </Item>
                <Item className="w-full">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => setStep("form")}
                  >
                    Voltar e alterar email
                  </Button>
                </Item>
              </div>
            </form>
          )}
        </CardContent>

        {step === "form" && (
          <CardFooter className="flex-col gap-2">
            <Item className="w-full">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Enviando código..." : "Criar conta"}
                  </Button>
                </Item>
            <Item className="w-full">
              <LoginBtn />
            </Item>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};