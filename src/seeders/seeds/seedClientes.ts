import { Cliente } from "../../cliente/cliente-entity.js"

import { MikroORM } from "@mikro-orm/mysql"

export async function seedClientes(orm: MikroORM) {
    const clienteEm = orm.em.fork()

    const clientes: Cliente[] = []

    const nombres = ['Ana', 'Luis', 'Carlos', 'Maria', 'Jorge', 'Laura', 'Pedro', 'Sofia', 'Diego', 'Elena']
    const apellidos = ['Gomez', 'Martinez', 'Rodriguez', 'Lopez', 'Fernandez', 'Diaz', 'Perez', 'Garcia', 'Ruiz', 'Torres']
    const provincias = ['Buenos Aires', 'Córdoba', 'Santa Fe']
    const ciudades = ['Rosario', 'La Plata', 'Mar del Plata', 'Córdoba Capital', 'Santa Fe Capital']
    const calles = ['Calle Falsa', 'Avenida Siempre Viva', 'Pasaje Luna', 'Boulevard Central', 'Camino del Sol']

    for (let i = 0; i < 10; i++) {
        const dni = `1000000${i}`
        const nombre = nombres[i % nombres.length]
        const apellido = apellidos[i % apellidos.length]
        const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}@example.com`
        const telefono = `+54 9 11 1234 56${i}${i}`
        const provincia = provincias[i % provincias.length]
        const ciudad = ciudades[i % ciudades.length]
        const direccion = `${calles[i % calles.length]} ${100 + i}`
        const codigoPostal = `100${i}`

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
        
        clientes.push(cliente)
        clienteEm.persist(cliente)
    }

    await clienteEm.flush();
}