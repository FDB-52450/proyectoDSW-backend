import express from 'express'
import cors from 'cors'

import { productoRouter } from './producto/producto-routes.js'
import { marcaRouter} from './marca/marca-routes.js'
import { categoriaRouter } from './categoria/categoria-routes.js'
import { administradorRouter } from './administrador/administrador-routes.js'
import { pedidoRouter } from './pedido/pedido-routes.js'

const app = express()
const port = 8080

app.use(express.json())
app.use(cors())
app.use('/images', express.static('images'))

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

