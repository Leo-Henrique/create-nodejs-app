export abstract class HttpError extends Error {
  public abstract error: string;
  public abstract statusCode: number;
  public abstract debug: unknown;

  constructor(public message: string) {
    super(message);
  }
}
