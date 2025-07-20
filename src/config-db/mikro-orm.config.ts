import type { Options } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';

import { Administrador } from '../administrador/administrador-entity.js';
import { Categoria } from '../categoria/categoria-entity.js';
import { Imagen } from '../imagen/imagen-entity.js';
import { Marca } from '../marca/marca-entity.js';
import { Pedido } from '../pedido/pedido-entity.js';
import { PedidoProd } from '../pedidoprod/pedidoprod-entity.js';
import { Producto } from '../producto/producto-entity.js';

const config: Options<MySqlDriver> = {
  entities: [Categoria, Administrador, Imagen, Marca, Producto, PedidoProd, Pedido],
  dbName: process.env.DB_NAME || 'backend_db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'root',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  driver: MySqlDriver
};

export default config;