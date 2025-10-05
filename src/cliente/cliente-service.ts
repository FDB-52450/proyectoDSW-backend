import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'
import { ClienteRepository } from './cliente-repository.js'
import { Cliente } from './cliente-entity.js'
import { ClienteDTO } from './cliente-dto.js'

import { ClienteConstraintError, ClienteDataMismatchError, ClienteNotFoundError, NoClientesFoundError } from './cliente-errors.js'
import { errorLogger } from '../shared/loggers.js'
import { ClienteFilters } from './clienteFilters-entity.js'

interface ClienteStatus {
    banned: boolean,
    banStart?: Date
    banEnd?: Date | null
    banRazon?: string
}

function getRepo() {
    const em = RequestContext.getEntityManager()

    return new ClienteRepository(em as SqlEntityManager)
}

async function clienteFindAll(page: number, filters: ClienteFilters) {
    const repository = getRepo()

    const [clientes, totalItems] = await repository.findAll(page, filters)

    if (clientes.length <= 0) {
        return [[], {totalPedidos: 0, totalPages: 0, currentPage: 0, pageSize: 20}]
    }

    const totalPages = Math.ceil(totalItems / 20)
    const paginationData = { totalProducts: totalItems, totalPages, currentPage: page, pageSize: 20}

    return [clientes, paginationData]
}

async function clienteFindOne(id: number) {
    const repository = getRepo()
    
    const cliente = await repository.findOne({ id })

    if (!cliente) {
        throw new ClienteNotFoundError()
    }

    return cliente
}

async function clienteFindByDni(dni: string) {
    const repository = getRepo()
    
    const cliente = await repository.findByDni({ dni })

    if (!cliente) {
        throw new ClienteNotFoundError()
    }

    return cliente
}

async function clienteCreate(clienteDTO: ClienteDTO) {
    const repository = getRepo()
    const cliente = Cliente.constructorDTO(clienteDTO)

    const clienteConstraint = await repository.checkConstraint(cliente)

    if (clienteConstraint) {
        throw new ClienteConstraintError()
    }

    const clienteCreado = await repository.add(cliente)

    if (!clienteCreado) {
        throw new Error()
    }

    return clienteCreado
}

async function clienteUpdate(clienteDTO: ClienteDTO) {
    const repository = getRepo()

    const clienteConstraint = await repository.checkConstraint(clienteDTO as Cliente)

    if (clienteConstraint) {
        throw new ClienteConstraintError()
    }

    const clienteActualizado = await repository.update(clienteDTO as Cliente)
    
    if (!clienteActualizado) {
        throw new Error()
    }

    return clienteActualizado
}

async function clienteRemove(id: number) {
    const repository = getRepo()
    const cliente = await repository.delete({ id })
    
    if (!cliente) {
        throw new ClienteNotFoundError()
    }

    return cliente
}

async function clienteSuspend(id: number, duracion: number | null, razon: string) {
    const repository = getRepo()
    const cliente = await repository.suspend({ id, duracion, razon })

    if (!cliente) {
        throw new ClienteNotFoundError()
    }

    return cliente
}

async function clienteReactivate(id: number) {
    const repository = getRepo()
    const cliente = await repository.reactivate({ id })

    if (!cliente) {
        throw new ClienteNotFoundError()
    }

    return cliente
}

async function clienteGetStatus(clienteDTO: ClienteDTO) {
    const repository = getRepo()
    const dni = clienteDTO.dni
    const cliente = await repository.findByDni({ dni })

    const status: ClienteStatus = {banned: false}

    if (cliente && cliente.banStart) {  
        status.banned = true
        status.banStart = cliente.banStart
        status.banEnd = cliente.banEnd
        status.banRazon = cliente.banRazon ?? 'Razon no especificada.'
    }

    return status
}

function checkClienteData(dbCliente: Cliente, reqCliente: ClienteDTO): boolean {
    return (
        dbCliente.nombre.toLowerCase() === reqCliente.nombre.toLowerCase() &&
        dbCliente.apellido.toLowerCase() === reqCliente.apellido.toLowerCase() &&
        dbCliente.email.toLowerCase() === reqCliente.email.toLowerCase()
    )
}

async function clienteObtain(clienteDTO: ClienteDTO) {
    try {
        const cliente = await clienteFindByDni(clienteDTO.dni)

        if (!checkClienteData(cliente, clienteDTO)) {
            throw new ClienteDataMismatchError()
        }

        return cliente
    } catch (findErr) {
        if (findErr instanceof ClienteDataMismatchError) {
            throw findErr
        }

        if (findErr instanceof ClienteNotFoundError) {
            try {
                return await clienteCreate(clienteDTO)
            } catch (createErr) {
                if (createErr instanceof ClienteConstraintError) {
                    throw new ClienteConstraintError()
                }

                errorLogger.error(createErr)
                
                throw new Error('Error desconocido ocurrido durante busqueda de cliente.')
            }
        }

        errorLogger.error(findErr)

        throw new Error('Error desconocido ocurrido durante busqueda de cliente.');
    }
}

export { clienteFindAll, clienteFindOne, clienteCreate, clienteUpdate, clienteRemove, clienteObtain, clienteSuspend, clienteReactivate, clienteGetStatus }