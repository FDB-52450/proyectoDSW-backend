import { seedProductos } from './seeds/seedProductos.js'
import { seedMarcas } from './seeds/seedMarcas.js'
import { seedCategorias } from './seeds/seedCategorias.js'
import { seedPedidos } from './seeds/seedPedidos.js'
import { seedAdmins } from './seeds/seedAdmins.js'

import { clearSeeds } from './clearSeeds.js'

import config from '../src/config-db/mikro-orm.config.js'
import { MikroORM } from '@mikro-orm/mysql'
import { seedClientes } from './seeds/seedClientes.js'

async function main() {
  const orm = await MikroORM.init(config)

  try {
    await clearSeeds(orm)
    
    await seedAdmins(orm)
    await seedCategorias(orm)
    await seedMarcas(orm)
    await seedProductos(orm)
    await seedClientes(orm)
    await seedPedidos(orm)
  } catch (e) {
    console.error(e)
  } finally {
    await orm.close(true)
  }
}

main()