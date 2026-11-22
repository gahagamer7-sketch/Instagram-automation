/** Klass nomlarini xavfsiz birlashtirish (qo'shimcha paketlarsiz). */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
