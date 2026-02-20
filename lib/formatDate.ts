import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Parseia uma string de data no formato YYYY-MM-DD sem deslocamento de fuso horário.
 * new Date("2025-02-20") interpreta como UTC 00:00, o que em UTC-3 vira dia 19.
 * Ao adicionar T00:00:00, o JS interpreta como horário local.
 */
export const parseLocalDate = (dateString: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(`${dateString}T00:00:00`);
  }
  return new Date(dateString);
};

/**
 * Formata uma string de data para exibição curta.
 * Ex: "20 de fev. de 2025"
 */
export const formatDate = (dateString: string): string => {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Formata uma string de data para exibição curta com date-fns.
 * Ex: "20 de fev"
 */
export const formatDateShort = (dateString: string): string => {
  const date = parseLocalDate(dateString);
  return format(date, "dd 'de' MMM", { locale: ptBR });
};

/**
 * Formata uma string de data para exibição completa com date-fns.
 * Ex: "20 de fevereiro de 2025"
 */
export const formatDateLong = (dateString: string): string => {
  const date = parseLocalDate(dateString);
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

/**
 * Formata um objeto Date para exibição de data e hora.
 * Ex: "20/02/2025 às 14:30"
 */
export const formatDateTime = (date: Date): string => {
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};
