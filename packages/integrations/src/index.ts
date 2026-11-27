/** Barcha integratsiyalar uchun umumiy xatolik turi. */
export class IntegrationError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "IntegrationError";
  }
}

export * from "./pexels";
