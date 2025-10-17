import { Cliente } from "../../src/cliente/cliente-entity.js"

import { MikroORM } from "@mikro-orm/mysql"

function getRandomDateInLastMonths(cantMeses: number): Date {
    const now = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - cantMeses)

    const randomTime = oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime())
    return new Date(randomTime)
}

export async function seedClientes(orm: MikroORM) {
    const clienteEm = orm.em.fork()

    const clientes: Cliente[] = []

    const nombres = ['Ana', 'Luis', 'Carlos', 'Maria', 'Jorge', 'Laura', 'Pedro', 'Sofia', 'Diego', 'Elena']
    const apellidos = ['Gomez', 'Martinez', 'Rodriguez', 'Lopez', 'Fernandez', 'Diaz', 'Perez', 'Garcia', 'Ruiz', 'Torres']
    const provincias = ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Santiago del Estero', 'Formosa', 'Salta', 'Corrientes', 'Entre Rios']
    const ciudades = ['Rosario', 'La Plata', 'Mar del Plata', 'Córdoba Capital', 'Santa Fe Capital', 'La Plata', 'La Rioja', 'CABA']
    const calles = ['Calle Falsa', 'Avenida Siempre Viva', 'Pasaje Luna', 'Boulevard Central', 'Camino del Sol']

    for (let i = 0; i < 100; i++) {
        const dni = `${Math.floor(Math.random() * 90000000) + 1000000}`
        const nombre = nombres[Math.floor(Math.random() * nombres.length)]
        const apellido = apellidos[Math.floor(Math.random() * apellidos.length)]
        const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}@example.com`
        const telefono = `+54 9 11 1234 ${Math.floor(Math.random() * 9000) + 1000}`
        const provincia = provincias[Math.floor(Math.random() * provincias.length)]
        const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)]
        const direccion = `${calles[Math.floor(Math.random() * calles.length)]} ${100 + i}`
        const codigoPostal = `${Math.floor(Math.random() * 9000) + 1000}`

        const cliente = new Cliente(
            dni,
            nombre,
            apellido,
            email,
            telefono,
            provincia,
            ciudad,
            direccion,
            codigoPostal
        )

        cliente.fechaIngreso = getRandomDateInLastMonths(3)
        
        clientes.push(cliente)
        clienteEm.persist(cliente)
    }

    await clienteEm.flush();
}