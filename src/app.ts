import express from 'express'
import cors from 'cors'
import session from 'express-session'
import rateLimit from 'express-rate-limit'

import { productoRouter } from './producto/producto-routes.js'
import { marcaRouter} from './marca/marca-routes.js'
import { categoriaRouter } from './categoria/categoria-routes.js'
import { administradorRouter } from './administrador/administrador-routes.js'
import { pedidoRouter } from './pedido/pedido-routes.js'
import { clienteRouter } from './cliente/cliente-routes.js'

import { orm, syncSchema } from './shared/database.js'
import { RequestContext } from '@mikro-orm/core'

import { errorLogger } from './shared/loggers.js'
import { startTasks } from './tasks/startTasks.js'

const app = express()
const port = 8080

// await syncSchema() // ONLY FOR UPDATING SCHEMA

app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
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
app.use('/api/clientes', clienteRouter)

app.use((_, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

app.listen(port, () => {
  console.log('Server running on http://localhost:8080/')
  startTasks()
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorLogger.error(err);

  const status = err.status || err.statusCode || 500;
  const prod = (process.env.NODE_MODE === 'production')

  res.status(status).json({
    message: prod ? 'Internal Server Error' : err.message,
    ...(prod ? {} : { stack: err.stack }),
  });
})