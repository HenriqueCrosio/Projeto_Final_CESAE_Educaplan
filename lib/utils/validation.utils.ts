import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalize(str: string): string {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
}
  
type ContentType = "course" | "module" | "topic" | "team" | "class" | "lesson" | "enrollment"

const prefixMap: Record<ContentType, string> = {
  course: "crs",
  module: "mdl",
  topic: "tpc",
  team: "tms",
  class: "cls",
  lesson: "lsn",
  enrollment: "enr"
}

export function generateSlug(name: string, contentType: ContentType): string {
  const prefix = prefixMap[contentType]
  const baseSlug = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")

  return `${prefix}-${baseSlug}`
}


export const formatCurrency = (cents: number): string => (cents / 100).toFixed(2) + " €"

export const generateClassName = (index: number): string => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return `Turma ${alphabet[index % alphabet.length]}`; // Turma A, B, C...
};

import { format } from "date-fns";
import { enGB } from "date-fns/locale";

export const formatDateTime = (date: Date | string): string => {
  if (!date) return "Invalid Date";

  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return format(parsedDate, "dd/MM/yyyy HH:mm", { locale: enGB });
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};