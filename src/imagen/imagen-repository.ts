import { Imagen } from './imagen-entity.js'
import { EntityManager } from '@mikro-orm/mysql'

export class ImagenRepository {
  constructor(
    private imagenEm: EntityManager
  ) {}

  async findTemplate(): Promise<Imagen> {
    let imagen = await this.imagenEm.findOne(Imagen, {url: 'template.png'})

    if (!imagen) {
      imagen = new Imagen('template.png');
      await this.imagenEm.persistAndFlush(imagen);
    }

    return imagen
  }

  async createImagenes() {
    const imagenes = [
      new Imagen('template.png'),
    ]

    await this.imagenEm.persistAndFlush(imagenes)
  }
}