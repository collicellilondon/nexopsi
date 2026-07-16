import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export const compactNumber = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1
});
