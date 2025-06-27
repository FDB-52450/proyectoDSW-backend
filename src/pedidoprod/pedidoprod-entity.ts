import crypto from 'node:crypto'
import { Producto } from '../producto/producto-entity.js'

export class PedidoProd {
  constructor(
    public cantidad: number,
    public producto: Producto,
    public precioUnidad = producto.precio,
    public precioTotal = cantidad * precioUnidad,
    public id = crypto.randomInt(1000, 10000).toString()
  ) {}
}