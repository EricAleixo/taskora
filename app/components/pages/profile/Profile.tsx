"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  LuUser,
  LuBell,
  LuPalette,
  LuCamera,
  LuSave,
  LuCheck,
  LuLoader,
} from "react-icons/lu";
import { useCurrentProfile } from "@/src/client/services/profiles/useCurrentProfile";
import { useUpdateProfile } from "@/src/client/services/profiles/useUpdateProfile";
import { AvatarCropModal } from "@/components/ui/AvatarCropModal";
import Logo from "../../atoms/Logo";
import { animateThemeChange } from "@/lib/themeTransition";
import { useUploadAvatar } from "@/src/client/services/profiles/useUploadAvatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  avatarUrl: string;
  bio: string;
  timezone: string;
  theme: string;
  receiveEmailNotifications: boolean;
}

interface ProfilePageProps {
  userEmail?: string;
}

// ── Theme types & helpers ──────────────────────────────────────────────────────

export type Theme =
  | "light"
  | "dark"
  | "system"
  | "teal-light"
  | "teal-dark"
  | "cyan-light"
  | "cyan-dark";

const ALL_THEMES: {
  value: Theme;
  label: string;
  /** classes CSS que representam visualmente o tema no mini-preview */
  previewClass: string;
  isDark: boolean;
  colorKey: "green" | "teal" | "cyan";
}[] = [
  {
    value: "light",
    label: "Verde Claro",
    previewClass: "bg-white border",
    isDark: false,
    colorKey: "green",
  },
  {
    value: "dark",
    label: "Verde Escuro",
    previewClass: "bg-zinc-900",
    isDark: true,
    colorKey: "green",
  },
  {
    value: "teal-light",
    label: "Teal Claro",
    previewClass: "bg-teal-50 border border-teal-200",
    isDark: false,
    colorKey: "teal",
  },
  {
    value: "teal-dark",
    label: "Teal Escuro",
    previewClass: "bg-teal-950",
    isDark: true,
    colorKey: "teal",
  },
  {
    value: "cyan-light",
    label: "Cyan Claro",
    previewClass: "bg-cyan-50 border border-cyan-200",
    isDark: false,
    colorKey: "cyan",
  },
  {
    value: "cyan-dark",
    label: "Cyan Escuro",
    previewClass: "bg-cyan-950",
    isDark: true,
    colorKey: "cyan",
  },
];

// Accent dot color por palette
const COLOR_DOT: Record<"green" | "teal" | "cyan", string> = {
  green: "bg-green-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-400",
};

/**
 * Aplica o tema diretamente na classe do <html>.
 * Mapeia o valor salvo → classes CSS corretas.
 */
function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark", "theme-teal", "theme-cyan");

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  switch (theme) {
    case "system":
      root.classList.add(prefersDark ? "dark" : "light");
      break;
    case "light":
      root.classList.add("light");
      break;
    case "dark":
      root.classList.add("dark");
      break;
    case "teal-light":
      root.classList.add("theme-teal");
      break;
    case "teal-dark":
      root.classList.add("dark", "theme-teal");
      break;
    case "cyan-light":
      root.classList.add("theme-cyan");
      break;
    case "cyan-dark":
      root.classList.add("dark", "theme-cyan");
      break;
  }
}

// ── Section wrapper ───────────────────────────────────────────────────────────

const Section = ({
  icon,
  title,
  description,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
    className="bg-card border rounded-2xl p-5 sm:p-6 space-y-5"
  >
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <Separator />
    {children}
  </motion.div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

export const ProfilePage = ({ userEmail }: ProfilePageProps) => {
  const { data, isPending } = useCurrentProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { mutateAsync: uploadAvatar, isPending: isUploading } =
    useUploadAvatar();

  const { update: updateSession } = useSession();

  const [saved, setSaved] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const hasLoadedProfile = useRef(false);
  const originalThemeRef = useRef<Theme>("system");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ProfileData>({
    defaultValues: {
      name: "",
      avatarUrl: "",
      bio: "",
      timezone: "",
      theme: "system",
      receiveEmailNotifications: false,
    },
  });

  useEffect(() => {
    if (!data || hasLoadedProfile.current) return;
    hasLoadedProfile.current = true;

    const profileTheme = (data.profile.theme ?? "system") as Theme;
    originalThemeRef.current = profileTheme;

    reset({
      name: data.profile.name ?? "",
      avatarUrl: data.profile.avatarUrl ?? "",
      bio: data.profile.bio ?? "",
      timezone: data.profile.timezone ?? "America/Sao_Paulo",
      theme: profileTheme,
      receiveEmailNotifications: data.profile.receiveEmailNotifications ?? true,
    });

    applyThemeClass(profileTheme);

    return () => {
      applyThemeClass(originalThemeRef.current);
    };
  }, [data, reset]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Logo variant="loading" />
      </div>
    );
  }

  const avatarUrl = watch("avatarUrl");
  const bio = watch("bio");
  const theme = watch("theme") as Theme;
  const receiveEmailNotifications = watch("receiveEmailNotifications");
  const name = watch("name");

  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const handleThemeChange = (t: Theme) => {
    animateThemeChange(() => {
      applyThemeClass(t);
      setValue("theme", t);
    });
  };

  // ── Avatar crop + upload ───────────────────────────────────────────────────

  const handleAvatarCrop = async (blob: Blob) => {
    const currentAvatarUrl = avatarUrl || undefined;
    const newUrl = await uploadAvatar({ blob, oldUrl: currentAvatarUrl });
    setValue("avatarUrl", newUrl, { shouldDirty: true });
  };

  // ── Form submit ───────────────────────────────────────────────────────────

  const onSubmit = async (formData: ProfileData) => {
    if (!data?.profile.id) return;

    await updateProfile({
      id: String(data.profile.id),
      data: formData,
    });

    await updateSession({ theme: formData.theme });
    applyThemeClass(formData.theme as Theme);
    originalThemeRef.current = formData.theme as Theme;

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-8 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <SidebarTrigger className="sm:hidden" />
          <div>
            <h1 className="text-lg font-semibold">Meu Perfil</h1>
            {userEmail && (
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          form="profile-form"
          disabled={isSubmitting || isUploading}
          className="gap-2 min-w-27.5"
        >
          {saved ? (
            <>
              <LuCheck className="h-4 w-4" />
              Salvo!
            </>
          ) : isSubmitting ? (
            "Salvando…"
          ) : (
            <>
              <LuSave className="h-4 w-4" />
              Salvar
            </>
          )}
        </Button>
      </motion.div>

      {/* ── Form ── */}
      <form
        id="profile-form"
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
          {/* ── LEFT: Informações pessoais ── */}
          <Section
            icon={<LuUser className="h-4 w-4" />}
            title="Informações pessoais"
            description="Como você aparece para outros membros"
            delay={0.05}
          >
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative group shrink-0">
                <Avatar className="h-20 w-20">
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <button
                  type="button"
                  onClick={() => setCropModalOpen(true)}
                  disabled={isUploading}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-not-allowed"
                  title="Alterar foto"
                >
                  {isUploading ? (
                    <LuLoader className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <LuCamera className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>

              <div className="flex-1 w-full space-y-1.5">
                <p className="text-sm font-medium">Foto de perfil</p>
                <p className="text-xs text-muted-foreground">
                  Clique na foto para recortar e enviar
                </p>
                <input type="hidden" {...register("avatarUrl")} />
                {avatarUrl && (
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {avatarUrl}
                  </p>
                )}
              </div>
            </div>

            {/* Nome + Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">
                  Nome completo
                </Label>
                <Input
                  id="name"
                  {...register("name", { required: "Nome é obrigatório" })}
                  placeholder="Seu nome"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Fuso horário</Label>
                <Select
                  value={watch("timezone")}
                  onValueChange={(v) => setValue("timezone", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">
                      América/São Paulo (UTC-3)
                    </SelectItem>
                    <SelectItem value="America/New_York">
                      América/New York (UTC-5)
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      América/Los Angeles (UTC-8)
                    </SelectItem>
                    <SelectItem value="Europe/Lisbon">
                      Europa/Lisboa (UTC+0)
                    </SelectItem>
                    <SelectItem value="Europe/London">
                      Europa/Londres (UTC+0)
                    </SelectItem>
                    <SelectItem value="Europe/Paris">
                      Europa/Paris (UTC+1)
                    </SelectItem>
                    <SelectItem value="Asia/Tokyo">
                      Ásia/Tóquio (UTC+9)
                    </SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-sm">
                Bio{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="bio"
                {...register("bio", { maxLength: 255 })}
                placeholder="Conte um pouco sobre você…"
                rows={5}
                maxLength={255}
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio?.length ?? 0}/255
              </p>
            </div>
          </Section>

          {/* ── RIGHT: Aparência + Notificações ── */}
          <div className="flex flex-col gap-5">
            {/* Tema */}
            <Section
              icon={<LuPalette className="h-4 w-4" />}
              title="Aparência"
              description="Escolha o tema da interface"
              delay={0.1}
            >
              {/* System option — full width on top */}
              <button
                type="button"
                onClick={() => handleThemeChange("system")}
                className={`
                  relative w-full rounded-xl border-2 p-3 flex items-center gap-3 transition-all
                  ${
                    theme === "system"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  }
                `}
              >
                <div className="h-8 w-14 rounded-md shrink-0 bg-linear-to-r from-white to-zinc-900 border" />
                <div className="text-left">
                  <p className="text-xs font-medium">Sistema</p>
                  <p className="text-xs text-muted-foreground">
                    Segue o seu SO
                  </p>
                </div>
                {theme === "system" && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    <LuCheck className="h-3 w-3" />
                  </Badge>
                )}
              </button>

              {/* 6 themes in 2-column grid (3 rows: green, teal, cyan) */}
              <div className="grid grid-cols-2 gap-2.5">
                {ALL_THEMES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => handleThemeChange(t.value)}
                    className={`
                      relative rounded-xl border-2 p-3 text-center transition-all
                      ${
                        theme === t.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/40"
                      }
                    `}
                  >
                    {/* Mini preview */}
                    <div
                      className={`h-8 rounded-md mb-2 w-full ${t.previewClass} flex items-end justify-end p-1`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${COLOR_DOT[t.colorKey]}`}
                      />
                    </div>

                    <span className="text-xs font-medium leading-tight block">
                      {t.label}
                    </span>

                    {theme === t.value && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                        <LuCheck className="h-3 w-3" />
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </Section>

            {/* Notificações */}
            <Section
              icon={<LuBell className="h-4 w-4" />}
              title="Notificações"
              description="Gerencie como você recebe atualizações"
              delay={0.15}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">E-mail de notificações</p>
                  <p className="text-xs text-muted-foreground">
                    Receba atualizações de tarefas e projetos por e-mail
                  </p>
                </div>
                <Switch
                  checked={receiveEmailNotifications}
                  onCheckedChange={(v) =>
                    setValue("receiveEmailNotifications", v)
                  }
                />
              </div>
            </Section>
          </div>
        </div>
      </form>

      {/* ── Crop Modal ── */}
      <AvatarCropModal
        open={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleAvatarCrop}
      />
    </div>
  );
};