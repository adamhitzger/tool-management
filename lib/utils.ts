import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const MAX_ICON_SIZE = 50 * 1024

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
