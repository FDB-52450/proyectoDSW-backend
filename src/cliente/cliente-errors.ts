import { AppError } from "../shared/errors.js";

export class ClienteNotFoundError extends AppError {
  constructor(message = 'Cliente no encontrado') {
    super(message, 404);
  }
}

export class ClienteConstraintError extends AppError {
  constructor(message = 'DNI/Email ya en uso') {
    super(message, 409);
  }
}

export class NoClientesFoundError extends AppError {
  constructor(message = 'No hay clientes creados') {
    super(message, 404);
  }
}

export class ClienteDataMismatchError extends AppError {
    constructor(message = 'Los datos ingresados no coinciden con el cliente registrado') {
        super(message, 422)
    }
}