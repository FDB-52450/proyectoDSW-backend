import request from 'supertest'
import path from 'path'

import { app } from '../../src/app'
import { describe, it, expect, beforeAll } from 'vitest'

const PRODUCT_UPDATE_ID = 1
const PRODUCT_DELETE_ID = 50

const productData = {
    nombre: 'TEST-PRODUCT',
    precio: '150000',
    stock: '99',
    marcaId: '1',
    categoriaId: '1'
};

describe('Creacion de productos', () => {
    let cookies: string

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie']
        expect(cookies).toBeDefined()
    })

    it('crear producto y retornar 201', async() => {
        const createRequest = request(app)
        .post('/api/productos')
        .set('Cookie', cookies)
        .query({view: 'admin'})

        for (const [key, value] of Object.entries(productData)) {
            createRequest.field(key, value);
        }

        const createResponse = await createRequest.expect(201)
        const productId = createResponse.body.data.id

        const getResponse = await request(app)
        .get(`/api/productos/${productId}`)
        .set('Cookie', cookies)
        .query({view: 'admin'})
        .expect(200)

        const product = getResponse.body.data

        expect(product.nombre).toBe('TEST-PRODUCT')
        expect(product.precio).toBe(150000)
        expect(product.stock).toBe(99)
        expect(product.stockReservado).toBe(0)
        expect(product.marca.id).toBe(1)
        expect(product.categoria.id).toBe(1)
        expect(product.destacado).toBe(false)
        expect(product.imagenes).toStrictEqual([])
    })
});

describe('Modificacion de productos', () => {
    let cookies: string

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie']
        expect(cookies).toBeDefined()
    })
 
    it('actualizar atributos de producto y retornar 200', async() => {
        const updateResponse = await request(app)
        .patch(`/api/productos/${PRODUCT_UPDATE_ID}`)
        .field('precio', 1)
        .set('Cookie', cookies)
        .expect(200)

        const getResponse = await request(app)
        .get(`/api/productos/${PRODUCT_UPDATE_ID}`)
        .expect(200)

        const product = getResponse.body.data

        expect(product.id).toBe(PRODUCT_UPDATE_ID)
        expect(product.precio).toBe(1)
    })

    it('agregar imagen a producto y retornar 200', async() => {
        const imagePath = path.join(__dirname, '../testImages/productImages/amd-ryzen-9-5950x.webp');

        const updateResponse = await request(app)
        .patch(`/api/productos/${PRODUCT_UPDATE_ID}`)
        .attach('images', imagePath)
        .set('Cookie', cookies)
        .expect(200)

        const getResponse = await request(app)
        .get(`/api/productos/${PRODUCT_UPDATE_ID}`)
        .expect(200)

        const product = getResponse.body.data

        expect(product.id).toBe(PRODUCT_UPDATE_ID)
        expect(product.imagenes[0].url).toBeDefined()
    })
})

describe('Eliminacion de productos', () => {
    let cookies: string

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie']
        expect(cookies).toBeDefined()
    })
 
    it('borrar producto y retornar 404', async() => {
        const deleteResponse = await request(app)
        .delete(`/api/productos/${PRODUCT_DELETE_ID}`)
        .set('Cookie', cookies)
        .expect(200)

        const getResponse = await request(app)
        .get(`/api/productos/${PRODUCT_DELETE_ID}`)
        .expect(404)
    })

    it('intentar borrar producto usado en pedido y retornar 409', async () => {
        const pedidoRequest = await request(app)
        .get('/api/pedidos/1')
        .set('Cookie', cookies)
        .expect(200)

        const productId = pedidoRequest.body.data.detalle[0].producto.id

        const deleteResponse = await request(app)
        .delete(`/api/productos/${productId}`)
        .set('Cookie', cookies)
        .expect(409)
    })
})