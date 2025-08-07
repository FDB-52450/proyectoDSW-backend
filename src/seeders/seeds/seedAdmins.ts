import { Administrador } from "../../administrador/administrador-entity.js";

import { MikroORM } from "@mikro-orm/mysql"

export async function seedAdmins(orm: MikroORM) {
    const adminEm = orm.em.fork()
    const admins: Administrador[] = []

    const nombresBase = ['mainAdmin', 'subAdmin1', 'subAdmin2']
    const passwordBase = ['mainPass123', 'subPass1', 'subPass2']

    for (let i = 0; i < nombresBase.length; i++) {
        const nombre = `${nombresBase[i]}`
        const password = `${passwordBase[i]}`
        const role = i === 0 ? 'superadmin' : undefined
        
        const admin = new Administrador(nombre, password, role)

        admins.push(admin);
        adminEm.persist(admin);
    }

    await adminEm.flush();
}