# 📦 Tech Nexus - Backend
Bienvenido al repositorio del servicio **backend** de Tech Nexus - una API desarrollada con Node.js/Express que gestiona los datos, autenticación y lógica de negocio de un sistema de comercio online de productos de computación.

Además de este archivo, la documentación también cuenta con otros dos archivos que explican en mayor detalle las **entidades** ([entidades.md](./entidades.md)) y la **lógica de negocio** ([logicaNegocio.md](./logicaNegocio.md)) del sistema.

> ⚠️ Este repositorio es solo para el **backend**. El frontend se encuentra en otro repositorio: [Tech Nexus - Frontend](https://github.com/tu-org/frontend-repo)

---

## 📚 Tabla de Contenidos

- [🛠 Tecnologías](#-tecnologías)
- [📋 Prerrequisitos](#-prerrequisitos)
- [🚀 Primeros Pasos](#-primeros-pasos)
- [🧾 Estructura del Proyecto](#-estructura-del-proyecto)
- [🗃 Base de Datos](#-base-de-datos)
- [📡 Documentación de la API](#-documentación-de-la-api)
- [🧪 Pruebas](#-pruebas)
- [🛠 Variables de Entorno](#-variables-de-entorno)
- [📦 Scripts](#-scripts)
- [📞 Contacto](#-contacto)

---

## 🛠 Tecnologías

- **Lenguaje**: Node.js / TypeScript
- **Framework**: Express.js
- **Base de datos**: MySQL
- **ORM**: MikroORM
- **Autenticación**: Cookies
- **Pruebas**: Vitest / Supertest

---

## 📋 Prerrequisitos

Antes de comenzar con la instalación y ejecución del backend, asegúrate de haber instalado lo siguiente:

- **[Node.js (incluye npm)](https://nodejs.org/)** (v16+ recomendado)
- **[MySQL](https://dev.mysql.com/downloads/mysql/)**

### Configuración de MySQL
#### Crear la base de datos.
Para crear la base de datos requerida por la aplicación, puedes ejecutar el siguiente comando desde la terminal (se te pedirá la contraseña del usuario root):
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS backend_db;"
```
o ingrese a la aplicacion de MySQL Workbench y realize la siguiente query:
```sql
CREATE DATABASE IF NOT EXISTS backend_db;
```

> ℹ️ **Nota**: El nombre que viene por defecto de la base de datos (backend_db) puede ser modificado, siempre y cuando se configure correctamente las variables de entorno para reflejar este cambio (ver sección de variables de entorno).

---

## 🚀 Primeros Pasos

### 1. Clonar el repositorio

```bash
git clone https://github.com/FDB-52450/proyectoDSW-backend.git
cd backend-repo
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Copiar y configurar las variables de entorno (ver sección de variables de entorno)
```bash
cp .env-example .env
```
> 💡 En Windows, usar `copy .env-example .env` en lugar de `cp .env-example .env`


### 4. Construir el proyecto (opcional)
```bash
npm run build
```

### 5. Generar la estructura de la base de datos
```bash
npm run db:create
```
> 💡 En caso de estar en un ambiente de producción, se recomienda generar una migracion con `npx mikro-orm migration:create` y `migration:up`.

### 6. Iniciar el servidor de desarrollo
```bash
npm run start:dev
```

## 🧾 Estructura del Proyecto
```bash
/src
  app.ts            → Punto de entrada de la aplicación
  /administrador
    administrador-controller.ts      → Controladores de rutas
    administrador-routes.ts          → Definición de endpoints
    administrador-repository.ts      → Acceso a la base de datos
    administrador-entity.ts          → Modelo de entidad
  /categoria
  /cliente
  /imagen
  /marca
  /pedido
  /pedidoprod
  /producto
  /stats
  /shared           → Funciones, errores y utilidades comunes
  /middleware       → Middlewares de Express
   /validation       → Validaciones de entrada
  /config           → Configuraciones (DB, auth)
  /tasks            → Tareas programadas (cron jobs)
/docs               → Documentación de la API
/tests              → Pruebas unitarias e integración
/seeders            → Scripts para poblar la base de datos
package.json
```

> ℹ️ **Nota:** Las entidades `Cliente`, y `Stats` difieren en la estructura general de las entidades (ademas de los elementos de la estructura general, poseen un entidad-service.ts y un entidad-dto.ts) al haber sido implementadas en una etapa mas avanzada del projecto.
Las entidades `Imagen`, y `PedidoProd` no poseen una estructura (solo contiene su definicion de entidad).


## 🗃 Base de Datos
- **Tipo**: MySQL
- **ORM**: MikroORM ([https://mikro-orm.io/docs/quick-start](https://mikro-orm.io/docs/quick-start))

### Generar la estructura de la base de datos
Este script permite generar la estructura de la base de datos (tablas y relaciones). **Debe ser ejecutado antes de intentar poblar la base de datos por primera vez**.
```bash
npm run db:create
```

### Poblar la base de datos
> ⚠️ Asegúrate de haber ejecutado la creación de la estructura de la base de datos antes de poblarla.

Este script permite poblar rápidamente la base de datos con 3 administradores (1 superadmin), 120 productos, 100 clientes, unas cuantas marcas y categorías (aprox. 10 por cada una) y 1000 pedidos con diferentes estados.

Todas las marcas son cargadas con una imagen, mientras que solo unos pocos productos son cargados por imagen (debido al alto costo de carga por producto)
```bash
npm run seed
```

## 📡 Documentación de la API

Aunque no contamos con Swagger, incluimos archivos `.http` con ejemplos prácticos de llamadas a la API que puedes usar para probar los endpoints fácilmente.

### Archivos con ejemplos de requests:

- [`admin.http`](../tests/httpTests/admin.http)
- [`categoria.http`](../tests/httpTests/categoria.http)
- [`cliente.http`](../tests/httpTests/cliente.http)
- [`pedidos.http`](../tests/httpTests/pedidos.http)
- [`producto.http`](../tests/httpTests/producto.http)
- [`stats.http`](../tests/httpTests/stats.http)

---

### Cómo usar los archivos `.http`

Estas peticiones se pueden ejecutar en Visual Studio code utilizando la extensión **REST Client** ([https://marketplace.visualstudio.com/items?itemName=humao.rest-client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)), haciendo clic en el botón **“Send Request”** para ejecutar una petición en específico.

Alternativamente, se pueden usar las llamadas como referencia para hacer peticiones con curl, Postman u otra herramienta HTTP.

---

## 🧪 Pruebas
- **Framework**: Vitest ([https://vitest.dev/guide/](https://vitest.dev/guide/))
- **HTTP**: Supertest ([https://www.npmjs.com/package/supertest](https://www.npmjs.com/package/supertest))

### Realizar tests unitarios y de integracion
```bash
npm test
```

## 🛠️ Variables de Entorno
A continuación se describen las variables necesarias para configurar el entorno del proyecto:

| Variable        | Valor por defecto | Descripción                                         |
|----------------|-------------------|-----------------------------------------------------|
| `SALT`         | `salt`               | Usado para encriptar contraseñas (scrypt)   |
| `SECRET`       | `secret`               | Clave secreta para sesiones                  |
| `DB_NAME`      | `backend_db`      | Nombre de la base de datos                         |
| `DB_USER`      | `root`            | Usuario de la base de datos                        |
| `DB_PASSWORD`  | `root`            | Contraseña de la base de datos                     |
| `DB_HOST`      | `localhost`       | Dirección del host de la base de datos             |
| `DB_PORT`      | `3306`            | Puerto del servicio de base de datos (MySQL)       |
| `NODE_MODE`    | `dev`            | Entorno de ejecución (dev/prod)            |

## 📦 Scripts

- `npm run build` - Compila el proyecto TypeScript.
- `npm run start:dev` - Inicia el servidor en modo desarrollo con tsc-watch.
- `npm run seed` - Pobla la base de datos con datos de prueba.
- `npm test` - Ejecuta las pruebas unitarias e integración.

## 📞 Contacto
En caso de tener alguna duda con respecto a la documentacion o al projecto en si, comunicarse mediante el siguiente medio:
- **Email**: [francodb2005@outlook.com.ar](mailto:francodb2005@outlook.com.ar)