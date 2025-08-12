export class AppError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}