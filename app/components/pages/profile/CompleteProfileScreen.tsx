"use client";

import { useForm } from "react-hook-form";
import { useCreateProfile } from "@/src/client/services/profiles/useCreateProfile";
import { CreateProfileDTO } from "@/src/client/services/profiles/profile.client.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const CompleteProfileScreen = () => {
  const { mutate: createProfile, isPending } = useCreateProfile();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProfileDTO>({
    defaultValues: {
      timezone: "America/Sao_Paulo",
      theme: "system",
      receiveEmailNotifications: true,
    },
  });

  const onSubmit = (data: CreateProfileDTO) => {
    createProfile(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Bem-vindo 👋</CardTitle>
          <CardDescription>
            Antes de continuar, precisamos completar seu perfil.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Nome */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                {...register("name", { required: "Nome é obrigatório" })}
              />
              {errors.name && (
                <span className="text-xs text-destructive">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você..."
                rows={3}
                className="resize-none"
                {...register("bio")}
              />
            </div>

            {/* Timezone */}
            <div className="flex flex-col gap-1.5">
              <Label>Fuso horário</Label>
              <Select
                defaultValue="America/Sao_Paulo"
                onValueChange={(value) => setValue("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">América/São Paulo (BRT)</SelectItem>
                  <SelectItem value="America/Manaus">América/Manaus (AMT)</SelectItem>
                  <SelectItem value="America/Belem">América/Belém (BRT)</SelectItem>
                  <SelectItem value="America/Fortaleza">América/Fortaleza (BRT)</SelectItem>
                  <SelectItem value="America/Recife">América/Recife (BRT)</SelectItem>
                  <SelectItem value="America/New_York">América/New York (EST)</SelectItem>
                  <SelectItem value="Europe/Lisbon">Europa/Lisboa (WET)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tema */}
            <div className="flex flex-col gap-1.5">
              <Label>Tema</Label>
              <Select
                defaultValue="system"
                onValueChange={(value) => setValue("theme", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notificações */}
            <div className="flex flex-col gap-2">
              <Label>Notificações</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="receiveEmailNotifications"
                  defaultChecked
                  onCheckedChange={(checked) =>
                    setValue("receiveEmailNotifications", !!checked)
                  }
                />
                <Label htmlFor="receiveEmailNotifications" className="font-normal cursor-pointer">
                  Receber notificações por e-mail
                </Label>
              </div>
            </div>

            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? "Salvando..." : "Concluir perfil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};