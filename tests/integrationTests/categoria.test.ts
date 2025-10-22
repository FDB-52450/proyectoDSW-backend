import request from 'supertest'

import { app } from '../../src/app'
import { describe, it, expect, beforeAll } from 'vitest'

function getCategoriaData() {
    return {
        nombre: `TEST-CATEGORIA-${Date.now() + Math.floor(1000 + Math.random() * 9000).toString()}`,
        duracionGarantia: 12,
        stockLimit: 5
    }
}

describe('Creacion de categorias', () => {
    let cookies: string

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie']
        expect(cookies).toBeDefined()
    })

    it('crear categoria y retornar 201', async() => {
        const categoriaData = getCategoriaData()

        const createResponse = await request(app)
        .post('/api/categorias')
        .set('Cookie', cookies)
        .send(categoriaData)
        .expect(201)

        const categId = createResponse.body.data.id

        const getResponse = await request(app)
        .get(`/api/categorias/${categId}`)
        .expect(200)

        const categoria = getResponse.body.data

        expect(categoria.nombre).toBe(categoriaData.nombre)
        expect(categoria.duracionGarantia).toBe(12)
        expect(categoria.stockLimit).toBe(5)
    })
});

describe('Modificacion de categorias', () => {
    let cookies: string
    let categoriaUpdateId: number

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie']
        expect(cookies).toBeDefined()
    })

    beforeAll(async () => {
        const categoriaData = getCategoriaData()

        const createResponse = await request(app)
        .post('/api/categorias')
        .set('Cookie', cookies)
        .send(categoriaData)
        .expect(201)

        categoriaUpdateId = createResponse.body.data.id
    })
 
    it('actualizar atributos de categoria y retornar 200', async() => {
        const updateResponse = await request(app)
        .patch(`/api/categorias/${categoriaUpdateId}`)
        .send({duracionGarantia: 24})
        .set('Cookie', cookies)
        .expect(200)

        const getResponse = await request(app)
        .get(`/api/categorias/${categoriaUpdateId}`)
        .expect(200)

        const categoria = getResponse.body.data

        expect(categoria.id).toBe(categoriaUpdateId)
        expect(categoria.duracionGarantia).toBe(24)
    })
})

describe('Eliminacion de categorias', () => {
    let cookies: string
    let categoriaDeleteId: number

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie']
        expect(cookies).toBeDefined()
    })

    
    beforeAll(async () => {
        const categoriaData = getCategoriaData()
        
        const createResponse = await request(app)
        .post('/api/categorias')
        .set('Cookie', cookies)
        .send(categoriaData)
        .expect(201)

        categoriaDeleteId = createResponse.body.data.id
    })
 
    it('borrar categoria y retornar 404', async() => {
        const deleteResponse = await request(app)
        .delete(`/api/categorias/${categoriaDeleteId}`)
        .set('Cookie', cookies)
        .expect(200)

        const getResponse = await request(app)
        .get(`/api/categorias/${categoriaDeleteId}`)
        .expect(404)
    })

    it('intentar borrar categoria usada en producto y retornar 409', async () => {
        const productoRequest = await request(app)
        .get('/api/productos/1')
        .expect(200)

        const categoriaId = productoRequest.body.data.categoria.id

        const deleteResponse = await request(app)
        .delete(`/api/categorias/${categoriaId}`)
        .set('Cookie', cookies)
        .expect(409)
    })
})