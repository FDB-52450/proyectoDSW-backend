import { Entity, PrimaryKey, Property, OneToMany, Collection, Cascade } from '@mikro-orm/core'
import { Pedido } from '../pedido/pedido-entity.js'
import { ClienteDTO } from './cliente-dto.js'

@Entity()
export class Cliente {
    @PrimaryKey({type: 'number', autoincrement: true})
    id!: number

    @Property({ unique: true, type: 'string'})
    dni!: string

    @Property({type: 'string'})
    nombre!: string

    @Property({type: 'string'})
    apellido!: string

    @Property({type: 'string'})
    email!: string

    @Property({type: 'string'})
    telefono!: string

    @Property({type: 'string'})
    provincia!: string
    
    @Property({type: 'string'})
    ciudad!: string

    @Property({type: 'string'})
    direccion!: string

    @Property({type: 'string'})
    codigoPostal!: string
 
    @Property({ onCreate: () => new Date(), type: 'date'})
    fechaIngreso!: Date

    @Property({ nullable: true, type: 'date' })
    banStart: Date | null  = null

    @Property({ nullable: true, type: 'date' })
    banEnd: Date | null = null

    @Property({ nullable: true, type: 'string' })
    banRazon: string | null = null

    @OneToMany(() => Pedido, pedido => pedido.cliente, {cascade: [Cascade.REMOVE]})
    pedidos = new Collection<Pedido>(this)

    constructor(
        dni: string,
        nombre: string,
        apellido: string,
        email: string,
        telefono: string,
        provincia: string,
        ciudad: string,
        direccion: string,
        codigoPostal: string
    ) {
        this.dni = this.capitalize(dni)
        this.nombre = this.capitalize(nombre)
        this.apellido = this.capitalize(apellido)
        this.email = email
        this.telefono = telefono
        this.provincia = this.capitalize(provincia)
        this.ciudad = this.capitalize(ciudad)
        this.direccion = this.capitalize(direccion)
        this.codigoPostal = codigoPostal
    }

    private capitalize (str: string) { 
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    static constructorDTO (data: ClienteDTO) {
        return new Cliente(data.dni, data.nombre, data.apellido, data.email, data.telefono, 
            data.provincia, data.ciudad, data.direccion, data.codigoPostal)
    }
}

