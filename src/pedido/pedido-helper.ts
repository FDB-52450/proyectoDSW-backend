import { RequestContext } from "@mikro-orm/core";
import { ProductoRepository } from "../producto/producto-repository.js";
import { Pedido } from "./pedido-entity.js";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { PedidoProd } from "../pedidoprod/pedidoprod-entity.js";

export class ValidationResult {
    result: boolean
    errors?: ValidationError[]

    constructor(result: boolean, errors: ValidationError[]) {
        this.result = result
        this.errors = errors
    }
}

interface ValidationError {
    message: string,
    productoId?: number
}

interface DetalleItem {
    productoId: number,
    cantidad: number
}

const stockLimits = [
    { min: 0,       max: 9999,    limit: 10 },
    { min: 10000,   max: 29999,   limit: 7 },
    { min: 30000,   max: 74999,   limit: 5 },
    { min: 75000,   max: 124999,  limit: 3 },
    { min: 125000,  max: 249999,  limit: 2 },
    { min: 250000,  max: Infinity, limit: 1 },
]

const maxGlobalPedidoAmountLimit = 3
const maxGlobalPedidoCostLimit = 10000000

function getMaxStockForPrice(prodPrecio: number) {
    const range = stockLimits.find(rule => prodPrecio >= rule.min && prodPrecio <= rule.max)
    return range ? range.limit : 1
}

function pedidoValidateDetalleStock(pedido: Pedido, clienteCheck: boolean): ValidationResult {
    const detalle = pedido.detalle.getItems()
    let errors: ValidationError[] = []

    for (const [key, value] of Object.entries(detalle)) {
        const productoPrecio = value.producto.precioFinal
        const productoStock = value.producto.getStockDisponible()
        const cantidadPedida = value.cantidad

        // Checks whenever the amount solicited for a certain product exceeds the amount allowed per price bracket.
        const maxStock = getMaxStockForPrice(productoPrecio)

        if (cantidadPedida > productoStock) {
            errors.push({ productoId: value.producto.id, message: `Solo hay ${productoStock} unidades disponibles.` })
        }

        if (cantidadPedida > maxStock) {
            errors.push({ productoId: value.producto.id, message: `Maximo ${maxStock} unidades permitidas por pedido.` })
        }
    }

    if (!clienteCheck) {
        const cliente = pedido.cliente
        const pedidosPendientes = cliente.pedidos.filter(pedido => pedido.estado == 'pendiente')
        const totalMontoPedidos = pedidosPendientes.reduce((sum, pedido) => sum + pedido.precioTotal, 0)

        if (pedidosPendientes.length > maxGlobalPedidoAmountLimit) {
            errors.push({ message: `El usuario excede la cantidad permitida de pedidos activos.` })
        }

        if (totalMontoPedidos + pedido.precioTotal > maxGlobalPedidoCostLimit) {
            errors.push({ message: `El usuario excede el monto total maximo de $15.000.000 en pedidos activos.` })
        }
    }

    return new ValidationResult(errors.length > 0, errors)
}

async function pedidoTransformDetalle(inputDetalle: DetalleItem[]): Promise<PedidoProd[] | ValidationResult>  {
    const prodRepo = new ProductoRepository(RequestContext.getEntityManager()?.fork() as SqlEntityManager)
    let errors: ValidationError[] = []

    const detalleWithProducts = await Promise.all(inputDetalle.map(async (item) => {
        const producto = await prodRepo.findOne({ id: item.productoId })

        if (!producto) {
            errors.push({ productoId: item.productoId, message: 'El producto no existe.' })
            return null
        }

        return new PedidoProd(item.cantidad, producto)
    }))

    if (errors.length > 0) return new ValidationResult(true, errors)

    return detalleWithProducts.filter(Boolean) as PedidoProd[] // MAGIC
}

export { pedidoValidateDetalleStock, pedidoTransformDetalle }