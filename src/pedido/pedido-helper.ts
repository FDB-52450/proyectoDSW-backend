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
    productoId?: number,
    categoriaId?: number
}

interface DetalleItem {
    productoId: number,
    cantidad: number
}

const maxGlobalPedidoAmountLimit = 3
const maxGlobalPedidoCostLimit = 10000000

function pedidoValidateDetalleStock(pedido: Pedido, clienteCheck: boolean): ValidationResult {
    const detalle = pedido.detalle.getItems()
    let errors: ValidationError[] = []

    const categoriaSums: Map<number, number> = new Map()
    const categoriasError: Set<number> = new Set();

    for (const pedProd of detalle) {
        const prodCategoria = pedProd.producto.categoria
        const cantPedida = pedProd.cantidad

        const categoriaId = prodCategoria.id
        const stockLim = prodCategoria.stockLimit

        const currentSum = categoriaSums.get(categoriaId) ?? 0

        if (currentSum + cantPedida > stockLim && !categoriasError.has(categoriaId)) {
            errors.push({ categoriaId: prodCategoria.id, message: `Maximo ${stockLim} unidades permitadas por pedido de categoria ${prodCategoria.nombre}`})
            categoriasError.add(categoriaId)
        }

        if (!categoriasError.has(categoriaId)) {
            categoriaSums.set(categoriaId, currentSum + cantPedida)
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