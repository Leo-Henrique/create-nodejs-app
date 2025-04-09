import { ResourceNotFoundError } from "../errors";

export function notFoundErrorHandlerPlugin() {
  return new ResourceNotFoundError("Recurso não encontrado.");
}
