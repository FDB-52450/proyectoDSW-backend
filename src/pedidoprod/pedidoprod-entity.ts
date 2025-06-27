import crypto from 'node:crypto'
import { Producto } from '../producto/producto-entity.js'
import { Pedido } from '../pedido/pedido-entity.js'

export class PedidoProd {
  constructor(
    public cantidad: number,
    public precioUnidad: number,
    public producto: Producto,
    public precioTotal = cantidad * precioUnidad,
    public id = crypto.randomInt(1000, 10000).toString()
  ) {}
}