import { Router } from 'express'

import { getPedidoStats, getProductoStats, getCategoriaStats, getMarcaStats, getClienteStats } from './stats-controller.js'

import { authLogin } from '../middleware/loginAuth.js'

export const statsRouter = Router()

statsRouter.get('/pedidos/', authLogin, getPedidoStats)
statsRouter.get('/productos/', authLogin, getProductoStats)
statsRouter.get('/categorias/', authLogin, getCategoriaStats)
statsRouter.get('/marcas/', authLogin, getMarcaStats)
statsRouter.get('/clientes/', authLogin, getClienteStats)