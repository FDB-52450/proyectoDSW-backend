import { MikroORM, EntityManager } from '@mikro-orm/core';
import mikroOrmConfig from '../config-db/mikro-orm.config.js';

export const orm = await MikroORM.init(mikroOrmConfig)

export const syncSchema = async () => {
    await orm.getSchemaGenerator().updateSchema()
}