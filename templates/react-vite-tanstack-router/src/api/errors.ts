export class ApiError {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly message: string;

  constructor(data: { name: string; statusCode: number; message: string }) {
    this.name = data.name;
    this.statusCode = data.statusCode;
    this.message = data.message;
  }
}

export class ApiUnknownError {
  static readonly message =
    "Houve uma falha inesperada ao se comunicar com nosso servidor. Tente novamente em alguns segundos ou nos contate se o problema persistir.";
  public message = ApiUnknownError.message;
}
