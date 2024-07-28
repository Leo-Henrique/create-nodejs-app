export abstract class DomainError extends Error {
  public abstract error: string;
  public abstract HTTPStatusCode: number;
  public abstract debug: unknown;

  constructor(public message: string) {
    super(message);
  }
}
