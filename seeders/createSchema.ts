import { orm } from "../src/shared/database.js"

async function main() {
    const generator = orm.getSchemaGenerator()
    
    await generator.createSchema()
    await orm.close(true)
}

main();