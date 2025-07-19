import { Imagen } from '../imagen/imagen-entity.js'
import { Repository } from '../shared/repository.js'
import { Marca } from './marca-entity.js'

import { EntityManager, SqlEntityManager } from '@mikro-orm/mysql'
import { ImagenRepository } from '../imagen/imagen-repository.js'

import fs from 'fs'

export class MarcaRepository /*implements Repository<Marca>*/ {
  constructor(
    private marcaEm: EntityManager
  ) {}

  public async findAll(): Promise<Marca[]> {
    return await this.marcaEm.find(Marca, {}, {populate: ['imagen']})
  }

  public async findOne(item: { id: number }): Promise<Marca | null> {
    return await this.marcaEm.findOne(Marca, {id: item.id}, {populate: ['imagen']})
  }

  public async add(item: Marca): Promise<Marca | null> {
    try {
      await this.marcaEm.persistAndFlush(item)
      return item
    } catch {
      if (item.imagen.url != "template.png") {
        fs.unlinkSync("images/" + item.imagen.url)
      }
      return null
    }
  }

  public async update(item: Marca): Promise<Marca | null> {
    const marca = await this.findOne(item)

    if (marca) {
      let oldImage = marca.imagen

      if (item.imagen.url === 'remove') {
        item.imagen = await this.getTemplateImage()
        fs.unlinkSync("images/" + oldImage.url)
      } else if (item.imagen.url === 'keep') {
        item.imagen = oldImage
      } else { // UPDATE IMAGE
        if (oldImage.url != "template.png") {
          fs.unlinkSync("images/" + oldImage.url)
          await this.marcaEm.remove(oldImage);
        }
      }

      Object.assign(marca, item)

      try {
        await this.marcaEm.flush()
      } catch {
        throw new Error()
      }
    }

    return marca
  }

  public async delete(item: { id: number }): Promise<Marca | null> {
    const marca = await this.findOne(item)

    if (marca) {
      fs.unlinkSync("images/" + marca.imagen.url)
      await this.marcaEm.removeAndFlush(marca)
    }

    return marca
  }

  public async getTemplateImage() {
    const imagenRepo = new ImagenRepository(this.marcaEm?.fork() as SqlEntityManager)

    return await imagenRepo.findTemplate()
  }

  public async createMarcas() {
    const marcas = [
      new Marca('INTEL', new Imagen('test.jpg', true)),
      new Marca('AMD', new Imagen('amdLogo.png'))
    ]

    await this.marcaEm.persistAndFlush(marcas)
  }
}