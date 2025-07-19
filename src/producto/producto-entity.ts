import crypto from 'node:crypto'
import { Marca } from '../marca/marca-entity.js'
import { Categoria } from '../categoria/categoria-entity.js'
import { Imagen } from '../imagen/imagen-entity.js'

export class Producto {
  // TODO: Revise if the assignment of properties in the constructor is necessary
  // and if it can be simplified or optimized.

  constructor(
    public nombre: string,
    public desc: string,
    public precio: number,
    public descuento: number,
    public stock: number,
    public imagenes: Imagen[],
    public marca: Marca,
    public categoria: Categoria,
    public fechaIngreso = new Date(),
    public stockReservado = 0,
    public destacado = false,
    public id = crypto.randomInt(1000, 10000)
  ) {}

  public getStockDisponible(): number {
    return this.stock - this.stockReservado
  }

  public aumentarStockReservado(cantidad: number): void {
    this.stockReservado += cantidad
  }

  public reducirStockReservado(cantidad: number): void {
    this.stockReservado -= cantidad
  }

  public aumentarStock(cantidad: number): void {
    this.stock += cantidad
  }

  public reducirStock(cantidad: number): void {
    this.stock -= cantidad
  }

  // Method to be used at some point in the future

  public getPrecioConDescuento(): number {
    return this.precio - (this.precio * this.descuento / 100)
  }
}