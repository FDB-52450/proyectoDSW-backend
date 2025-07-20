import express from 'express'
import cors from 'cors'
import session from 'express-session'
import rateLimit from 'express-rate-limit'

import { productoRouter } from './producto/producto-routes.js'
import { marcaRouter} from './marca/marca-routes.js'
import { categoriaRouter } from './categoria/categoria-routes.js'
import { administradorRouter } from './administrador/administrador-routes.js'
import { pedidoRouter } from './pedido/pedido-routes.js'

import { orm, syncSchema} from './shared/database.js'
import { RequestContext } from '@mikro-orm/core'

import { ProductoRepository } from './producto/producto-repository.js'

const app = express()
const port = 8080

// await syncSchema() // ONLY FOR UPDATING SCHEMA

app.use(express.json())
app.use(cors())
app.use('/images', express.static('images'))

app.use(rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 120,
}))

app.use(session({
  secret: process.env.SECRET || 'super-duper-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 },
  rolling: true
}));

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

app.use('/api/productos', productoRouter)
app.use('/api/marcas', marcaRouter)
app.use('/api/categorias', categoriaRouter)
app.use('/api/administradores', administradorRouter)
app.use('/api/pedidos', pedidoRouter)

app.use((_, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

app.listen(port, () => {
  console.log('Server running on http://localhost:8080/')
})