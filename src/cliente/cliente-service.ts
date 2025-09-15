import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'
import { ClienteRepository } from './cliente-repository.js'
import { Cliente } from './cliente-entity.js'
import { ClienteDTO } from './cliente-dto.js'

import { ClienteConstraintError, ClienteDataMismatchError, ClienteNotFoundError, NoClientesFoundError } from './cliente-errors.js'
import { errorLogger } from '../shared/loggers.js'

function getRepo() {
    const em = RequestContext.getEntityManager()

    return new ClienteRepository(em as SqlEntityManager)
}

async function clienteFindAll() {
    const repository = getRepo()

    const clientes = await repository.findAll()

    if (clientes.length <= 0) {
        throw new NoClientesFoundError()
    }

    return clientes
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

export { clienteFindAll, clienteFindOne, clienteCreate, clienteUpdate, clienteRemove, clienteObtain }