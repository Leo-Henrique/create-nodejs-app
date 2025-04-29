export class ApiError {
  public constructor(
    public readonly statusCode: number,
    public readonly error: string,
    public readonly message: string,
  ) {}
}
