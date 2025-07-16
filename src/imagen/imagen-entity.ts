import crypto from 'crypto'

// TODO: Determine if the url should just be the id (conflict when two imagenes don't have an url?)

export class Imagen{
    constructor(
        public url: string = 'template.png',
        public primaria: boolean = true,
        public id = crypto.randomInt(1000, 10000).toString()
    ) {}
}