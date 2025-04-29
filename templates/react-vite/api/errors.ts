export class ApiError {
  public constructor(
    public readonly statusCode: number,
    public readonly error: string,
    public readonly message: string,
  ) {}
}

export class ApiUnexpectedResponseError {
  static readonly message =
    "Houve uma falha inesperada ao se comunicar com nosso servidor. Aguarde alguns instantes ou contate nosso suporte.";

  constructor(public message = ApiUnexpectedResponseError.message) {}
}
