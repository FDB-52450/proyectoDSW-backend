import request from 'supertest'

import { app } from '../../src/app'
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'

const PRODUCT_ID = 4
const PRODUCT_CANTIDAD = 1

const pedidoDataB = {
    tipoEntrega: "retiro",
    tipoPago: "efectivo",
    cliente: {
        dni: Math.floor(1000000 + Math.random() * 9000000).toString(),
        nombre: "Maria",
        apellido: "Lopez",
        email: `maria.${Math.floor(1000000 + Math.random() * 9000000).toString()}@example.com`,
        telefono: "+54 9 11 1234 5633",
        provincia: "Buenos Aires",
        ciudad: "Córdoba Capital",
        direccion: "Boulevard Central 103",
        codigoPostal: "1003"
    },
    detalle: [
        {
            cantidad: PRODUCT_CANTIDAD,
            productoId: PRODUCT_ID
        },
    ]
}

function getPedidoData() {
    return {
        tipoEntrega: "retiro",
        tipoPago: "efectivo",
        cliente: {
            dni: Math.floor(1000000 + Math.random() * 9000000).toString(),
            nombre: "Maria",
            apellido: "Lopez",
            email: `maria.${Math.floor(1000000 + Math.random() * 9000000).toString()}@example.com`,
            telefono: "+54 9 11 1234 5633",
            provincia: "Buenos Aires",
            ciudad: "Córdoba Capital",
            direccion: "Boulevard Central 103",
            codigoPostal: "1003"
        },
        detalle: [
            {
                cantidad: PRODUCT_CANTIDAD,
                productoId: PRODUCT_ID
            },
        ]
    }
}

describe('Creacion de pedidos', () => {
    let cookies: string

    beforeAll(async () => {
        const loginRes = await request(app)
        .post('/api/administradores/login')
        .send({ nombre: 'subAdmin1', password: 'subPass1' })
        .expect(200)

        cookies = loginRes.headers['set-cookie'];
        expect(cookies).toBeDefined();
    })

    it('crear pedido, retornar 201 y aumentar stock reservado', async () => {
        const before = await request(app)
        .get(`/api/productos/${PRODUCT_ID}`)
        .set('Cookie', cookies)
        .query({view: 'admin'})
        .expect(200);

        const stockReservado = before.body.data.stockReservado;

        const response = await request(app)
        .post('/api/pedidos')
        .send(pedidoDataB)
        .expect(201);

        const after = await request(app)
        .get(`/api/productos/${PRODUCT_ID}`)
        .set('Cookie', cookies)
        .query({view: 'admin'})
        .expect(200);

        const stockReservadoFinal = after.body.data.stockReservado;

        expect(stockReservadoFinal).toBe(stockReservado + PRODUCT_CANTIDAD);
    });

    it('retornar 400 si al pedido le falta atributos', async () => {
        const response = await request(app)
        .post('/api/pedidos')
        .send({estado: 'confirmado'})
        .expect(400);
    });

    it('retornar 422 si no hay suficiente stock', async () => {
        pedidoDataB.detalle[0].cantidad = 100

        const response = await request(app)
        .post('/api/pedidos')
        .send(pedidoDataB)
        .expect(422);

        expect(response.body.error).toBe('VALIDACION_FALLIDA');
    })
})

describe('Modificacion de pedidos', () => {
    let cookies: string
    let pedidoUpdateId: number

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie'];
        expect(cookies).toBeDefined();
    })

    beforeEach(async () => {
        const pedidoData = getPedidoData()

        const createResponse = await request(app)
        .post('/api/pedidos')
        .set('Cookie', cookies)
        .send(pedidoData)
        .expect(201)

        pedidoUpdateId = createResponse.body.data.id
    })

    it('modificar tipo de pago de pedido y retornar 200', async () => {
        await request(app)
        .patch(`/api/pedidos/${pedidoUpdateId}`)
        .set('Cookie', cookies)
        .send({tipoPago: 'efectivo'})
        .expect(200)

        const updatedPedido = await request(app)
        .get(`/api/pedidos/${pedidoUpdateId}`)
        .set('Cookie', cookies)
        .expect(200)

        expect(updatedPedido.body.data.tipoPago).toBe('efectivo')
    })

    it('retornar 400 si el tipo de envio es invalido', async () => {
        await request(app)
        .patch(`/api/pedidos/${pedidoUpdateId}`)
        .set('Cookie', cookies)
        .send({tipoEnvio: 'LOL'})
        .expect(400)
    })

    it('retornar 400 si la fecha de entrega es menor a la fecha actual', async () => {
        const now = new Date()
        now.setDate(now.getDate() - 1)

        const updateResponse = await request(app)
        .patch(`/api/pedidos/${pedidoUpdateId}`)
        .set('Cookie', cookies)
        .send({fechaEntrega: now.toDateString()})
        .expect(400)
    })
})

describe('Confirmacion/cancelacion de pedidos', () => {
    let cookies: string

    let pedidoUpdateId: number
    let productoUpdateId: number
    let productoCantidad: number

    beforeAll(async () => {
        const loginRes = await request(app).post('/api/administradores/login').send({ nombre: 'subAdmin1', password: 'subPass1' }).expect(200)

        cookies = loginRes.headers['set-cookie'];
        expect(cookies).toBeDefined();
    })

    beforeEach(async () => {
        const pedidoData = getPedidoData()

        const createResponse = await request(app)
        .post('/api/pedidos')
        .set('Cookie', cookies)
        .send(pedidoData)
        .expect(201)

        pedidoUpdateId = createResponse.body.data.id
        productoUpdateId = createResponse.body.data.detalle[0].producto.id
        productoCantidad = createResponse.body.data.detalle[0].cantidad
    })

    it('aceptar pedido, bajar stock disp. y stock reservado', async () => {
        const beforeProductResponse = await request(app)
        .get(`/api/productos/${productoUpdateId}`)
        .set('Cookie', cookies)
        .query({view: 'admin'})
        .expect(200);

        const beforeStock = beforeProductResponse.body.data.stock
        const beforeStockRes = beforeProductResponse.body.data.stockReservado

        const confirmResponse = await request(app)
        .patch(`/api/pedidos/${pedidoUpdateId}`)
        .set('Cookie', cookies)
        .send({estado: 'confirmado'})
        .expect(200)

        const afterProductResponse = await request(app)
        .get(`/api/productos/${productoUpdateId}`)
        .set('Cookie', cookies)
        .query({view: 'admin'})
        .expect(200);

        const afterStock = afterProductResponse.body.data.stock
        const afterStockRes = afterProductResponse.body.data.stockReservado

        expect(afterStockRes).toBe(beforeStockRes - productoCantidad)
        expect(afterStock).toBe(beforeStock - productoCantidad)
    })

    it('cancelar pedido, y bajar stock reservado', async () => {
        const beforeProductResponse = await request(app)
        .get(`/api/productos/${productoUpdateId}`)
        .set('Cookie', cookies)
        .query({view: 'admin'})
        .expect(200);

        const beforeStock = beforeProductResponse.body.data.stock
        const beforeStockRes = beforeProductResponse.body.data.stockReservado

        const cancelResponse = await request(app)
        .patch(`/api/pedidos/${pedidoUpdateId}`)
        .set('Cookie', cookies)
        .send({estado: 'cancelado'})
        .expect(200)

        const afterProductResponse = await request(app)
        .get(`/api/productos/${productoUpdateId}`)
        .set('Cookie', cookies)
        .query({view: 'admin'})
        .expect(200);

        const afterStock = afterProductResponse.body.data.stock
        const afterStockRes = afterProductResponse.body.data.stockReservado

        expect(afterStockRes).toBe(beforeStockRes - productoCantidad)
        expect(afterStock).toBe(beforeStock)
    })

    it('no deberia permitir cancelar un pedido ya confirmado', async () => {
        const confirmResponse = await request(app)
        .patch(`/api/pedidos/${pedidoUpdateId}`)
        .set('Cookie', cookies)
        .send({estado: 'cancelado'})
        .expect(200);

        const cancelResponse = await request(app)
        .patch(`/api/pedidos/${pedidoUpdateId}`)
        .set('Cookie', cookies)
        .send({estado: 'confirmado'})
        .expect(401);

        expect(cancelResponse.body.message).toBe('Transaccion no valida.');
    })
})
