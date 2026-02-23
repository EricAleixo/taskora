"use client";

import { useForm } from "react-hook-form";
import { useCreateProfile } from "@/src/client/services/profiles/useCreateProfile";
import { CreateProfileDTO } from "@/src/client/services/profiles/profile.client.service";
import { useUploadAvatar } from "@/src/client/services/profiles/useUploadAvatar";
import { AvatarCropModal } from "@/components/ui/AvatarCropModal";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animateThemeChange } from "@/lib/themeTransition";
import { useSession } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Logo } from "../../atoms/Logo";

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = "light" | "dark" | "system";

interface User {
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

// ─── Theme helpers (sem next-themes) ─────────────────────────────────────────

/**
 * Aplica o tema diretamente na classe do <html>.
 * NÃO persiste nada — só visual (preview).
 */
function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(prefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

// ─── Step Icons ───────────────────────────────────────────────────────────────

const StepIcons: Record<number, React.ReactNode> = {
  1: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  2: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  3: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  4: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

// ─── Theme Icons ──────────────────────────────────────────────────────────────

const ThemeLightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const ThemeDarkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ThemeSystemIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l3.5 3.5L13 4" />
  </svg>
);

const STEPS = [
  { id: 1, label: "Identidade", sublabel: "Nome e bio" },
  { id: 2, label: "Foto", sublabel: "Avatar público" },
  { id: 3, label: "Preferências", sublabel: "Tema e região" },
  { id: 4, label: "Notificações", sublabel: "Como te avisar" },
];

const THEME_OPTIONS: { value: Theme; label: string; Icon: React.FC; previewClass: string }[] = [
  {
    value: "light",
    label: "Claro",
    Icon: ThemeLightIcon,
    previewClass: "bg-white border border-zinc-200",
  },
  {
    value: "dark",
    label: "Escuro",
    Icon: ThemeDarkIcon,
    previewClass: "bg-zinc-900",
  },
  {
    value: "system",
    label: "Sistema",
    Icon: ThemeSystemIcon,
    previewClass: "bg-linear-to-br from-white to-zinc-900",
  },
];

// ─── Timeline ─────────────────────────────────────────────────────────────────

function TimelineSteps({ current }: { current: number }) {
  const total = STEPS.length;

  return (
    <div className="w-full mb-10 md:mb-12">
      <div className="relative flex items-center justify-between">
        {STEPS.map((s, i) => {
          const done = current > s.id;
          const active = current === s.id;
          const lineFill = Math.min(1, Math.max(0, current - s.id));

          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2.5 shrink-0">
                <motion.div
                  className={cn(
                    "relative flex items-center justify-center rounded-full border-2 z-10 transition-all duration-300",
                    "w-10 h-10 md:w-11 md:h-11",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-primary/10 text-primary",
                    !done && !active && "border-border bg-muted/30 text-muted-foreground/40",
                  )}
                  style={active ? { boxShadow: "0 0 0 4px hsl(var(--primary)/0.12), 0 0 20px hsl(var(--primary)/0.18)" } : {}}
                >
                  {active && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-primary/15"
                      animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                    />
                  )}
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.span key="check" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
                        <CheckIcon />
                      </motion.span>
                    ) : (
                      <motion.span key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {StepIcons[s.id]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="flex flex-col items-center">
                  <motion.span
                    animate={{ color: active ? "hsl(var(--primary))" : done ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground)/0.4)" }}
                    className="text-[10px] md:text-[11px] font-semibold tracking-wider uppercase leading-none whitespace-nowrap"
                  >
                    {s.label}
                  </motion.span>
                  <span className="hidden lg:block text-[10px] text-muted-foreground/30 mt-0.5">
                    {s.sublabel}
                  </span>
                </div>
              </div>

              {i < total - 1 && (
                <div className="relative flex-1 h-0.5 mx-2 md:mx-3 bg-border/40 rounded-full overflow-hidden mb-6">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: "linear-gradient(90deg, hsl(var(--primary)/0.7), hsl(var(--primary)))", boxShadow: "0 0 8px hsl(var(--primary)/0.4)" }}
                    animate={{ width: `${lineFill * 100}%` }}
                    transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Photo Step ───────────────────────────────────────────────────────────────

interface PhotoStepProps {
  oauthImageUrl?: string | null;
  previewUrl?: string | null;
  onCropBlob: (blob: Blob) => void;
  onKeepOauth: () => void;
}

function PhotoStep({ oauthImageUrl, previewUrl, onCropBlob, onKeepOauth }: PhotoStepProps) {
  const [cropOpen, setCropOpen] = useState(false);

  const hasOauth = Boolean(oauthImageUrl);
  const hasCropped = Boolean(previewUrl && previewUrl !== oauthImageUrl);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <motion.div
        className={cn(
          "relative group flex flex-col items-center justify-center cursor-pointer",
          "w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden",
          "border-2 border-dashed transition-all duration-200",
          previewUrl
            ? "border-primary/40"
            : "border-border hover:border-primary/60 hover:bg-primary/3",
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setCropOpen(true)}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-white text-xs font-medium">Trocar foto</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center select-none">
            <motion.div
              className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </motion.div>
            <p className="text-sm text-muted-foreground leading-snug font-medium">
              Clique para selecionar e recortar
            </p>
            <p className="text-[11px] text-muted-foreground/40">JPG · PNG · WEBP · até 5 MB</p>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col items-center gap-2">
        {hasOauth && !hasCropped && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-primary/70 font-medium bg-primary/8 px-3 py-1.5 rounded-full"
          >
            ✓ Foto do seu login detectada — clique para ajustar ou mantenha
          </motion.p>
        )}
        {hasCropped && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs text-primary font-medium">✓ Foto personalizada aplicada</span>
            {hasOauth && (
              <button
                type="button"
                onClick={onKeepOauth}
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground underline underline-offset-4 transition-colors"
              >
                Usar foto original
              </button>
            )}
          </motion.div>
        )}
        {!hasOauth && !previewUrl && (
          <p className="text-sm text-muted-foreground/50 text-center max-w-xs leading-relaxed">
            Aparece em comentários, notificações e seu perfil público.
          </p>
        )}
      </div>

      <AvatarCropModal
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        onCropComplete={(blob) => {
          onCropBlob(blob);
          setCropOpen(false);
        }}
      />
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotifCard({ id, title, desc, defaultChecked = false, onChange }: {
  id: string;
  title: string;
  desc: string;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onChange?.(next);
  };

  return (
    <div
      onClick={toggle}
      className={cn(
        "flex items-start gap-4 rounded-2xl p-4 md:p-5 border-2 cursor-pointer transition-all duration-200 select-none",
        checked
          ? "bg-primary/5 border-primary/25 shadow-sm shadow-primary/10"
          : "bg-card border-border/60 hover:border-primary/20 hover:bg-primary/3",
      )}
    >
      <div
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 rounded-sm border-2 flex items-center justify-center transition-colors duration-150",
          checked
            ? "bg-primary border-primary"
            : "border-muted-foreground/40 bg-transparent",
        )}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div>
        <p className={cn(
          "text-sm font-semibold transition-colors",
          checked ? "text-foreground" : "text-muted-foreground",
        )}>
          {title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Slide variants ───────────────────────────────────────────────────────────

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60, filter: "blur(4px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60, filter: "blur(4px)" }),
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const CompleteProfileScreen = ({ user }: { user?: User | null }) => {
  const { mutateAsync: createProfile, isPending: isSaving } = useCreateProfile();
  const { mutateAsync: uploadAvatar } = useUploadAvatar();

  // useSession para atualizar o JWT com o novo tema sem precisar de logout
  const { update: updateSession } = useSession();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);

  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.image ?? null);
  const [useOauth, setUseOauth] = useState<boolean>(Boolean(user?.image));

  // ── Ref para guardar o tema original (para reverter ao desmontar sem salvar) ──
  const originalThemeRef = useRef<Theme>("system");
  const hasInitializedTheme = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateProfileDTO>({
    defaultValues: {
      avatarUrl: user?.image || undefined,
      timezone: "America/Sao_Paulo",
      theme: "system",
      receiveEmailNotifications: true,
    },
  });

  const watchedName = watch("name");
  const watchedTheme = (watch("theme") ?? "system") as Theme;
  const watchedTimezone = watch("timezone");

  // ── Captura o tema original do <html> ao montar, e reverte ao desmontar ──────
  // Espelha exatamente a lógica do ProfilePage: o originalTheme é o que estava
  // no token/cookie antes do usuário abrir esta tela. Ao fechar sem salvar,
  // volta para esse valor.
  useEffect(() => {
    if (hasInitializedTheme.current) return;
    hasInitializedTheme.current = true;

    // Lê o tema que já está aplicado no <html> (vindo do script do layout/token)
    const root = document.documentElement;
    const current: Theme = root.classList.contains("dark")
      ? "dark"
      : root.classList.contains("light")
        ? "light"
        : "system";

    originalThemeRef.current = current;

    return () => {
      // Saiu sem salvar → reverte para o tema que estava antes de entrar
      applyThemeClass(originalThemeRef.current);
    };
  }, []);

  // ── Handlers do PhotoStep ──────────────────────────────────────────────────

  const handleCropBlob = (blob: Blob) => {
    setCroppedBlob(blob);
    setUseOauth(false);
    const localUrl = URL.createObjectURL(blob);
    setAvatarPreview(localUrl);
  };

  const handleKeepOauth = () => {
    setCroppedBlob(null);
    setUseOauth(true);
    setAvatarPreview(user?.image ?? null);
  };

  // ── Preview visual do tema (igual ao ProfilePage) ─────────────────────────
  // Não persiste nada no token — só muda a classe do <html> para preview imediato.
  const handleThemeChange = (t: Theme) => {
    animateThemeChange(() => {
      applyThemeClass(t);    // só muda a classe do <html>
      setValue("theme", t);  // atualiza o form
    });
  };

  // ── Navegação ──────────────────────────────────────────────────────────────

  const go = async (direction: "next" | "prev") => {
    if (direction === "next") {
      const fieldsPerStep: Record<number, (keyof CreateProfileDTO)[]> = {
        1: ["name"],
        2: [],
        3: ["timezone", "theme"],
        4: [],
      };
      const valid = await trigger(fieldsPerStep[step]);
      if (!valid) return;
    }
    setDir(direction === "next" ? 1 : -1);
    setStep((s) => (direction === "next" ? s + 1 : s - 1));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  // Só aqui o tema é persistido (salvo no backend).
  // Após salvar, applyThemeClass confirma o tema visualmente (já estava em preview).

  const onSubmit = async (data: CreateProfileDTO) => {
    let finalAvatarUrl: string | undefined = undefined;

    try {
      if (croppedBlob) {
        finalAvatarUrl = await uploadAvatar({ blob: croppedBlob });
      } else if (useOauth && user?.image) {
        const res = await fetch("/api/upload/avatar-from-url/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: user.image }),
        });
        if (res.ok) {
          const json = await res.json();
          finalAvatarUrl = json.url;
        }
      }
    } catch (err) {
      console.error("[CompleteProfileScreen] Erro no upload de avatar:", err);
    }

    // Confirma o tema visualmente (já estava em preview, mas garante sync)
    applyThemeClass(data.theme as Theme);

    // ✅ Igual ao ProfilePage: await createProfile → await updateSession → reload
    // Usar mutateAsync garante que updateSession só roda após o perfil estar salvo no banco
    await createProfile({ ...data, avatarUrl: finalAvatarUrl });

    // ✅ Só aqui atualiza o token JWT com o novo tema
    // O callback jwt() no NextAuth intercepta trigger === "update" e grava token.theme
    await updateSession({ theme: data.theme });

    window.location.reload();
  };

  const isPending = isSaving;

  // ── Headings ───────────────────────────────────────────────────────────────

  const headings: Record<number, React.ReactNode> = {
    1: (<>Olá, <span className="text-primary">bem-vindo</span> 👋</>),
    2: (<>Sua foto de <span className="text-primary">perfil</span></>),
    3: (<>Suas <span className="text-primary">preferências</span></>),
    4: (<>Quase <span className="text-primary">pronto</span> ✦</>),
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-125 rounded-full opacity-40"
          style={{ background: "radial-gradient(ellipse, hsl(var(--primary)/0.16) 0%, transparent 68%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-112.5 h-100 rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, hsl(var(--primary)/0.12) 0%, transparent 70%)" }}
        />
      </div>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6 md:mb-8">
        <div className="h-10 flex items-center justify-center">
          <Logo />
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="relative w-full max-w-3xl xl:max-w-5xl"
      >
        <div
          className="bg-card border border-border/70 rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 24px 64px hsl(0 0% 0% / 0.14), 0 0 0 1px hsl(var(--border)/0.3)" }}
        >
          <div className="h-0.75 bg-linear-to-r from-transparent via-primary to-transparent opacity-60" />

          <div className="p-6 md:p-10 xl:p-12">
            {/* Heading */}
            <div className="mb-8 md:mb-10">
              <AnimatePresence mode="wait">
                <motion.div key={`heading-${step}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.22 }}>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary/70 mb-2">
                    Etapa {step} de {STEPS.length}
                  </p>
                  <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold text-foreground leading-tight">
                    {headings[step]}
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">{STEPS[step - 1].sublabel}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <TimelineSteps current={step} />

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="min-h-70 md:min-h-75">
                <AnimatePresence custom={dir} mode="wait">
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={slide}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="w-full"
                  >
                    {/* ── Step 1: Identidade ── */}
                    {step === 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div className="md:col-span-2 flex flex-col gap-2">
                          <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                            Nome completo <span className="text-primary">*</span>
                          </Label>
                          <Input
                            placeholder="ex: Maria Silva"
                            className={cn(
                              "h-12 border-2 bg-muted/30 transition-all duration-200 text-sm",
                              "focus-visible:ring-0 focus-visible:border-primary focus-visible:bg-background",
                              "focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]",
                              errors.name && "border-destructive/60 bg-destructive/3",
                            )}
                            {...register("name", { required: "Nome é obrigatório" })}
                          />
                          <AnimatePresence>
                            {errors.name && (
                              <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-destructive font-medium flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                                </svg>
                                {errors.name.message}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-2">
                          <div className="flex items-baseline justify-between">
                            <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Biografia</Label>
                            <span className="text-[11px] text-muted-foreground/40">opcional</span>
                          </div>
                          <Textarea
                            placeholder="Sua área de atuação, o que te move, um hobby…"
                            rows={4}
                            className="resize-none border-2 bg-muted/30 transition-all duration-200 text-sm leading-relaxed focus-visible:ring-0 focus-visible:border-primary focus-visible:bg-background focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                            {...register("bio", { maxLength: { value: 200, message: "Máximo 200 caracteres" } })}
                          />
                        </div>
                      </div>
                    )}

                    {/* ── Step 2: Foto ── */}
                    {step === 2 && (
                      <div className="flex justify-center">
                        <PhotoStep
                          oauthImageUrl={user?.image}
                          previewUrl={avatarPreview}
                          onCropBlob={handleCropBlob}
                          onKeepOauth={handleKeepOauth}
                        />
                      </div>
                    )}

                    {/* ── Step 3: Preferências ── */}
                    {step === 3 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div className="flex flex-col gap-2">
                          <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Fuso horário</Label>
                          <Select defaultValue="America/Sao_Paulo" onValueChange={(v) => setValue("timezone", v)}>
                            <SelectTrigger className="h-12 border-2 bg-muted/30 focus:ring-0 focus:border-primary transition-all duration-200">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                ["America/Sao_Paulo", "🇧🇷  São Paulo (BRT)"],
                                ["America/Manaus", "🇧🇷  Manaus (AMT)"],
                                ["America/Belem", "🇧🇷  Belém (BRT)"],
                                ["America/Fortaleza", "🇧🇷  Fortaleza (BRT)"],
                                ["America/Recife", "🇧🇷  Recife (BRT)"],
                                ["America/New_York", "🇺🇸  New York (EST)"],
                                ["Europe/Lisbon", "🇵🇹  Lisboa (WET)"],
                                ["UTC", "🌍  UTC"],
                              ].map(([v, l]) => (
                                <SelectItem key={v} value={v}>{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* ── Tema: replicado do ProfilePage com ícones SVG ── */}
                        <div className="flex flex-col gap-2">
                          <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                            Tema
                          </Label>

                          {/* Badge de preview ativo (espelha o badge do ProfilePage) */}
                          <AnimatePresence>
                            {watchedTheme && (
                              <motion.p
                                key={watchedTheme}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-[11px] text-primary/60 font-medium -mt-0.5 mb-1"
                              >
                                Prévia aplicada: {watchedTheme === "light" ? "Claro" : watchedTheme === "dark" ? "Escuro" : "Sistema"}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <div className="grid grid-cols-3 gap-2.5">
                            {THEME_OPTIONS.map((t) => {
                              const isSelected = watchedTheme === t.value;
                              return (
                                <motion.button
                                  key={t.value}
                                  type="button"
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleThemeChange(t.value)}
                                  className={cn(
                                    "relative flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border-2 transition-all duration-200",
                                    isSelected
                                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/15"
                                      : "border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-primary/30",
                                  )}
                                >
                                  {/* Preview mini do tema (igual ao ProfilePage) */}
                                  <div className={cn("h-7 w-full rounded-md", t.previewClass)} />

                                  {/* Ícone SVG do tema */}
                                  <span className={cn(
                                    "transition-colors",
                                    isSelected ? "text-primary" : "text-muted-foreground/50",
                                  )}>
                                    <t.Icon />
                                  </span>

                                  {/* Label */}
                                  <span className={cn(
                                    "text-[11px] font-semibold",
                                    isSelected ? "text-primary" : "text-muted-foreground/60",
                                  )}>
                                    {t.label}
                                  </span>

                                  {/* Badge de seleção (igual ao ProfilePage) */}
                                  {isSelected && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
                                    >
                                      <CheckIcon />
                                    </motion.span>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-2">
                          <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Idioma</Label>
                          <Select defaultValue="pt-BR">
                            <SelectTrigger className="h-12 border-2 bg-muted/30 focus:ring-0 focus:border-primary transition-all duration-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
                              <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                              <SelectItem value="es">🇪🇸 Español</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* ── Step 4: Notificações ── */}
                    {step === 4 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="flex flex-col gap-3">
                          <NotifCard
                            id="email-notif"
                            title="Notificações por e-mail"
                            desc="Atualizações, alertas e novidades direto na sua caixa de entrada."
                            defaultChecked
                            onChange={(v) => setValue("receiveEmailNotifications", v)}
                          />
                        </div>

                        {/* Summary card */}
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="rounded-2xl border-2 border-primary/15 bg-primary/3 p-5 h-fit"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-primary/70">Resumo do perfil</p>
                          </div>

                          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/40">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 ring-2 ring-primary/20 shrink-0">
                              {avatarPreview ? (
                                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                                  {(watchedName || user?.name || "?")[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{watchedName || user?.name || "—"}</p>
                              <p className="text-xs text-muted-foreground/50">{user?.email || "sem e-mail"}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2.5">
                            {[
                              ["Fuso", watchedTimezone || "—"],
                              ["Tema", watchedTheme === "light" ? "Claro" : watchedTheme === "dark" ? "Escuro" : "Sistema"],
                              [
                                "Foto",
                                croppedBlob
                                  ? "Personalizada ✓"
                                  : useOauth && user?.image
                                    ? "Do login ✓"
                                    : "Sem foto",
                              ],
                            ].map(([k, v]) => (
                              <div key={k} className="flex items-center justify-between">
                                <span className="text-[11px] uppercase tracking-wider text-muted-foreground/40 font-semibold">{k}</span>
                                <span className={cn("text-xs font-semibold", v.includes("✓") ? "text-primary" : "text-foreground")}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="mt-10 flex items-center gap-3">
                <AnimatePresence>
                  {step > 1 && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => go("prev")}
                      className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full border-2 border-border/60 bg-background hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>

                <motion.button
                  type="button"
                  disabled={isPending}
                  onClick={step < STEPS.length ? () => go("next") : handleSubmit(onSubmit)}
                  className={cn(
                    "flex-1 h-12 rounded-full font-semibold text-sm tracking-wide",
                    "flex items-center justify-center gap-2 transition-all duration-200",
                    "bg-primary text-primary-foreground",
                    "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
                  )}
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Salvando…
                    </>
                  ) : step < STEPS.length ? (
                    <>
                      Continuar
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  ) : (
                    "Concluir perfil"
                  )}
                </motion.button>

                <AnimatePresence>
                  {step === 2 && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => go("next")}
                      className="text-sm text-muted-foreground/45 hover:text-muted-foreground transition-colors underline underline-offset-4 shrink-0 whitespace-nowrap"
                    >
                      Pular
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-border/40 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-primary/60 to-primary"
                    animate={{ width: `${(step / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <span className="text-xs text-muted-foreground/40 font-medium tabular-nums shrink-0">
                  {Math.round((step / STEPS.length) * 100)}%
                </span>
              </div>
            </form>
          </div>

          <div className="h-px bg-linear-to-r from-transparent via-border/30 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
};