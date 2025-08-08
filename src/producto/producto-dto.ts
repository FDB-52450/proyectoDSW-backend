import { Collection } from "@mikro-orm/core";
import { Categoria } from "../categoria/categoria-entity.js";
import { Marca } from "../marca/marca-entity.js";
import { Producto } from "./producto-entity.js";
import { Imagen } from "../imagen/imagen-entity.js";

export class ProductoDTO {
    id: number
    nombre: string
    desc: string
    precio: number
    descuento: number
    precioFinal: number
    stock?: number
    stockReservado?: number
    stockDisponible?: number
    destacado: boolean
    fechaIngreso: Date

    marca: Marca
    categoria: Categoria
    imagenes: Collection<Imagen>

    constructor(producto: Producto, view: string) {
        this.id = producto.id
        this.nombre = producto.nombre
        this.desc = producto.desc
        this.precio = producto.precio
        this.descuento = producto.descuento
        this.precioFinal = producto.precioFinal
        this.destacado = producto.destacado
        this.fechaIngreso = producto.fechaIngreso
        this.marca = producto.marca
        this.categoria = producto.categoria
        this.imagenes = producto.imagenes

        if (view === 'admin') {
            this.stock = producto.stock
            this.stockReservado = producto.stockReservado
        } else {
            this.stockDisponible = producto.stock - producto.stockReservado;
        }
    }
}