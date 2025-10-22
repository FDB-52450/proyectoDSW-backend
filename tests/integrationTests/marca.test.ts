import request from 'supertest'
import path from 'path'

import { app } from '../../src/app'
import { describe, it, expect, beforeAll } from 'vitest'

function getMarcaNombre() {
    return `TEST-CATEGORIA-${Date.now() + Math.floor(1000 + Math.random() * 9000).toString()}`
}

describe('Creacion de marcas', () => {
    let cookies: string

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie']
        expect(cookies).toBeDefined()
    })

    it('crear marca y retornar 201', async() => {
        const marcaNombre = getMarcaNombre()
        const createResponse = await request(app)
            .post('/api/marcas')
            .field('nombre', marcaNombre)
            .set('Cookie', cookies)
            .expect(201)

        const marcaId = createResponse.body.data.id

        const getResponse = await request(app)
            .get(`/api/marcas/${marcaId}`)
            .set('Cookie', cookies)
            .expect(200)

        const marca = getResponse.body.data

        expect(marca.nombre).toBe(marcaNombre)
        expect(marca.imagen).toBe(null)
    })
});

describe('Modificacion de marcas', () => {
    let cookies: string
    let marcaUpdateId: number

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie']
        expect(cookies).toBeDefined()
    })
  
    beforeAll(async () => {
        const marcaNombre = getMarcaNombre()
        const createResponse = await request(app)
            .post('/api/marcas')
            .field('nombre', marcaNombre)
            .set('Cookie', cookies)
            .expect(201)

        marcaUpdateId = createResponse.body.data.id
    })
 
    it('actualizar atributos de marca y retornar 200', async() => {
        const updateResponse = await request(app)
        .patch(`/api/marcas/${marcaUpdateId}`)
        .field('nombre', 'TEST-TEST')
        .set('Cookie', cookies)
        .expect(200)

        const getResponse = await request(app)
        .get(`/api/marcas/${marcaUpdateId}`)
        .expect(200)

        const marca = getResponse.body.data

        expect(marca.id).toBe(marcaUpdateId)
        expect(marca.nombre).toBe('TEST-TEST')
    })

    it('agregar imagen a marca y retornar 200', async() => {
        const imagePath = path.join(__dirname, '../testImages/brandImages/amdLogo.webp');

        const updateResponse = await request(app)
        .patch(`/api/marcas/${marcaUpdateId}`)
        .attach('imagen', imagePath)
        .set('Cookie', cookies)
        .expect(200)

        const getResponse = await request(app)
        .get(`/api/marcas/${marcaUpdateId}`)
        .expect(200)

        const marca = getResponse.body.data

        expect(marca.id).toBe(marcaUpdateId)
        expect(marca.imagen.url).toBeDefined()
        expect(marca.imagen.imagenPrimaria).toBe(true)
    })
})

describe('Eliminacion de marcas', () => {
    let cookies: string
    let marcaDeleteId: number

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie']
        expect(cookies).toBeDefined()
    })

    beforeAll(async () => {
        const marcaNombre = getMarcaNombre()
        const createResponse = await request(app)
            .post('/api/marcas')
            .field('nombre', marcaNombre)
            .set('Cookie', cookies)
            .expect(201)

        marcaDeleteId = createResponse.body.data.id
    })
 
    it('borrar marca y retornar 404', async() => {
        const deleteResponse = await request(app)
        .delete(`/api/marcas/${marcaDeleteId}`)
        .set('Cookie', cookies)
        .expect(200)

        const getResponse = await request(app)
        .get(`/api/marcas/${marcaDeleteId}`)
        .expect(404)
    })

    it('intentar borrar marca usado en pedido y retornar 409', async () => {
        const productoRequest = await request(app)
        .get('/api/productos/1')
        .expect(200)

        const marcaId = productoRequest.body.data.marca.id

        const deleteResponse = await request(app)
        .delete(`/api/marcas/${marcaId}`)
        .set('Cookie', cookies)
        .expect(409)
    })
})