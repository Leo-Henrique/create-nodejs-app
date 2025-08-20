export class ApiError {
  public constructor(
    public readonly statusCode: number,
    public readonly error: string,
    public readonly message: string,
  ) {}
}

export class ApiUnknownError {
  static readonly message =
    "Houve uma falha inesperada ao se comunicar com nosso servidor. Tente novamente em alguns segundos ou nos contate se o problema persistir.";

  constructor(public message = ApiUnknownError.message) {}
}
