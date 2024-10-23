export type DomainErrorCoreProperties = Pick<
  DomainError,
  "error" | "message" | "debug"
>;

export abstract class DomainError extends Error {
  public abstract error: string;
  public abstract debug: unknown;

  constructor(public message: string) {
    super(message);
  }
}
