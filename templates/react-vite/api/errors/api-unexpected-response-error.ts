const defaultMessage =
  "Houve uma falha inesperada ao se comunicar com nosso servidor. Por favor, contate nosso suporte." as const;

export class ApiUnexpectedResponseError {
  static message = defaultMessage;

  constructor(public message = defaultMessage) {}
}
