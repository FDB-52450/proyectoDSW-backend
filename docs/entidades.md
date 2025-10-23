# Entidades

Este documento describe de forma concisa las entidades principales del backend, sus campos más relevantes, relaciones y dónde encontrar su implementación (entidad / rutas / repositorio) en el proyecto.

## 📚 Tabla de Contenidos

### 🧩 Catálogo
- [Producto](#-producto)
- [Categoría](#-categoría)
- [Marca](#-marca)
- [Imagen](#-imagen)

### 🛒 Ventas
- [Pedido](#-pedido)
- [PedidoProd](#-pedidoProd)

### 👥 Usuarios
- [Cliente](#-cliente)
- [Administrador](#-administrador)

---
## Producto

### Descripción

La entidad `Producto` representa un artículo en el catálogo del sistema, que puede ser comprado por los clientes del sistema.

### Propiedades

| Propiedad         | Tipo                     | Descripción |
|-------------------|--------------------------|--------------|
| `id`              | `number`                 | Identificador único del producto. |
| `nombre`          | `string`                 | Nombre único del producto. |
| `desc`            | `string`                 | Descripción detallada del producto. |
| `precio`          | `number`                 | Precio base del producto (sin descuento aplicado). |
| `descuento`       | `number`                 | Porcentaje de descuento aplicado al producto. |
| `precioFinal`     | `number`                 | Precio final calculado después del descuento. |
| `stock`           | `number`                 | Cantidad total disponible en inventario. |
| `stockReservado`  | `number`                 | Cantidad de unidades reservadas (campo oculto). |
| `destacado`       | `boolean`                | Indica si el producto debe mostrarse como destacado. |
| `ocultado`        | `boolean`                | Indica si el producto está oculto del catálogo. |
| `fechaIngreso`    | `Date`                   | Fecha de ingreso del producto al sistema. |
| `imagenes`        | `Imagen[]`     | Colección de imágenes asociadas al producto. |
| `marca`           | `Marca`                  | Marca a la que pertenece el producto. |
| `categoria`       | `Categoria`              | Categoría a la que pertenece el producto. |

### Relaciones

- **Marca**: Relación `ManyToOne`. Cada producto pertenece a una única marca.  
- **Categoría**: Relación `ManyToOne`. Cada producto pertenece a una única categoría.  
- **Imagen**: Relación `OneToMany`. Un producto puede tener cero o múltiples imágenes asociadas.

### Métodos

| Método | Descripción |
|--------|--------------|
| `setFinalPrice()` | Calcula automáticamente el `precioFinal` aplicando el descuento al `precio`. Se ejecuta antes de crear o actualizar el producto. |
| `handleImagenes(imagenesNuevas: Imagen[])` | Gestiona la colección de imágenes del producto, actualizando, agregando o eliminando según corresponda, y asignando una imagen principal. |
| `getStockDisponible()` | Devuelve la cantidad de stock disponible (stock total menos stock reservado). |
| `aumentarStockReservado(cantidad: number)` / `reducirStockReservado(cantidad: number)` | Incrementa o reduce el stock reservado. |
| `aumentarStock(cantidad: number)` / `reducirStock(cantidad: number)` | Incrementa o reduce el stock total. |
| `getPrecioConDescuento()` | Devuelve el precio del producto aplicando el descuento actual. |

### Notas

- **Precio final**: Es un campo utilizado para filtrar y mostrar productos por precio final; se actualiza automáticamente antes de cada inserción o actualización mediante el método `setFinalPrice()`.  
- **Imágenes**: La primera imagen de la colección se marca como imagen principal, y un producto no puede tener más de 4 imágenes.
- **Stock reservado**: Es un campo interno utilizado para manejar reservas temporales de stock, no visible públicamente.  
- **Descuento**: El valor debe representarse como porcentaje (ej. `10` para 10%).  


---

## Categoría

### Descripción

La entidad `Categoria` representa a una agrupación de productos bajo un cierto nombre, basado en el tipo de productos que la categoría agrupa.

### Propiedades

| Propiedad  | Tipo     | Descripción                           |
|------------|----------|---------------------------------------|
| `id`       | `number` | Identificador único de la categoría |
| `nombre`   | `string` | Nombre de la categoría              |
| `duracionGarantia` | `number` | Duración de la garantía de un producto de una cierta categoría (en meses)                |
| `stockLimit`     | `number` | Cantidad máxima de compra de productos de una cierta categoría (en unidades)       |

### Relaciones

- **Producto**: Relación `OneToMany`. Una categoría puede tener varios productos asociados.

### Métodos

| Método | Descripción |
|--------|--------------|
| Ninguno | La entidad no tiene métodos especiales. |

### Notas

- **StockLimit**: Este atributo se utiliza en la creación de pedidos para evitar que un cliente reserve una gran cantidad de productos en una sola compra.
- **DuracionGarantia**: Este atributo, en la implementación actual, no cumple ninguna funcionalidad.
---

## Marca

### Descripción

La entidad `Marca` representa a una agrupación de productos bajo un cierta marca de la vida real.

### Propiedades

| Propiedad  | Tipo     | Descripción                           |
|------------|----------|---------------------------------------|
| `id`       | `number` | Identificador único de la marca |
| `nombre`   | `string` | Nombre de la marca              |
| `imagen`    | `Imagen` \| `null` | Referencia a la imagen asociada a la marca. Puede ser nulo si no tiene imagen. |

### Relaciones

- **Marca**: Relación `OneToMany`. Una marca puede tener varios productos asociados.
- **Imagen**: Relación `OneToOne`. Una marca solo puede tener una imagen.

### Métodos

| Método | Descripción |
|--------|--------------|
| Ninguno | La entidad no tiene métodos especiales. |

### Notas

- **Imagen**: Es posible que una marca no tenga una imagen; en ese caso, el campo imagen será nulo.

---

## Imagen

### Descripción

La entidad `Imagen` representa una imagen subida por un administrador, la cual está asociada a una marca o a un producto específico. Cada imagen se almacena como un conjunto de tres versiones en distintos tamaños, agrupadas en una carpeta con el nombre de la `url` de la imagen.

### Propiedades

| Propiedad  | Tipo     | Descripción                           |
|------------|----------|---------------------------------------|
| `id`       | `number` | Identificador único de la imagen |
| `url`   | `string` | Identificador único de la carpeta en la que reside la imagen (UUID generado automáticamente)              |
| `imagenPrimaria`    | `boolean`  | Indica si la imagen es la imagen primaria. |
| `buffer`    | `Buffer`  | Almacena temporalmente la información de una imagen antes de que sea guardada. |

### Relaciones

- **Marca**: Relación `OneToOne`. Una imagen pertenece a una sola marca.
- **Producto**: Relación `ManyToOne`. Una imagen pertenece a un solo producto.

### Métodos

| Método | Descripción |
|--------|--------------|
| `saveToDisk()` | Gestiona la creación de la imagen física, generando el `url` y guardando tres versiones (`small`, `medium`, `large`). Se ejecuta antes de que la entidad sea guardada en la base de datos. |
| `deleteFromDisk()` | Gestiona la eliminación de la imagen física, borrando la carpeta y sus sub archivos. Se ejecuta despues de que la entidad sea borrada de la base de datos. |

### Notas

- **Ubicación de archivos**: Las imágenes se almacenan en la carpeta `/images/{uuid}/` dentro del proyecto.  
- **Formatos generados**: Se crean tres versiones redimensionadas (`small`, `medium`, `large`) en formato **WebP**.  
- **Advertencia**: No se debe cambiar la ubicación física del archivo `imagen-entity.ts` sin actualizar las rutas relativas en los métodos de guardado y eliminación.  
- **Campo `buffer`**: Solo se utiliza durante la creación de la entidad y no se persiste en la base de datos.  
---

## Pedido

### Descripción

La entidad `Pedido` representa una orden de compra realizada por un cliente. Contiene información sobre el método de entrega y pago, el estado del pedido, el total a pagar, las fechas relevantes, y el detalle de productos incluidos.  

Además, gestiona la lógica relacionada con el cálculo del precio total, el control de stock de los productos asociados y la estimación automática de la fecha de entrega.

### Propiedades

| Propiedad       | Tipo                   | Descripción |
|-----------------|------------------------|--------------|
| `id`            | `number`               | Identificador único del pedido. |
| `tipoEntrega`   | `string`               | Tipo de entrega seleccionado (`retiro` / `envío`). |
| `tipoPago`      | `string`               | Método de pago utilizado (`efectivo` / `tarjeta`). |
| `estado`        | `string`               | Estado actual del pedido (`pendiente` por defecto). |
| `precioTotal`   | `number`               | Importe total del pedido, calculado automáticamente en base al detalle. |
| `fechaEntrega`  | `Date`                 | Fecha estimada o asignada de entrega del pedido. |
| `fechaPedido`   | `Date`                 | Fecha en la que se creó el pedido (por defecto, la fecha actual). |
| `detalle`       | `PedidoProd[]`         | Colección de productos asociados al pedido. |
| `cliente`       | `Cliente`              | Cliente que realizó el pedido. |

### Relaciones

- **PedidoProd**: Relación `OneToMany`. Un pedido contiene múltiples ítems.  
  - Incluye `cascade: [remove, persist]`, por lo que al eliminar un pedido se eliminan automáticamente sus ítems asociados.  
- **Cliente**: Relación `ManyToOne`. Cada pedido pertenece a un único cliente.

### Métodos

| Método | Descripción |
|--------|--------------|
| `calcularPrecioTotal()` | Calcula el total del pedido sumando `cantidad * precioUnidad` de cada ítem del detalle. |
| `checkDetalle()` | Verifica que todos los ítems del pedido tengan stock suficiente antes de confirmar la compra, devolviendo un boolean. |
| `calcularFechaEntrega()` | Asigna una fecha de entrega estimada **7 días después** de la creación del pedido, ajustando si cae en domingo. |
| `aumentarStockReservado()` / `reducirStockReservado()` | Aumenta o reduce el stock reservado de los productos involucrados en el pedido. |
| `aumentarStock()` / `reducirStock()` | Aumenta o reduce el stock total de los productos según el estado del pedido. |

### Notas

- **Cálculo de precio total**: Se realiza automáticamente en el constructor, pero puede recalcularse manualmente con `calcularPrecioTotal()`.  
- **Control de stock**: Los métodos de stock operan a través de los ítems (`PedidoProd`), que a su vez interactúan con los productos (`Producto`).  
- **Fecha de entrega**: Si no se define manualmente, se asigna automáticamente una fecha 7 días posterior al pedido (ajustada si cae en domingo).  
- **Eliminación en cascada**: Al eliminar un pedido, sus ítems (`PedidoProd`) se eliminan automáticamente de la base de datos.  
- **Estados posibles**: Todo pedido, por defecto, empieza con el estado `pendiente`. Solo puede cambiar a `confirmado` (pedido completado) o `cancelado` (manual o automáticamente por el sistema).
- **Tipos de pago/entrega**: Actualmente, los atributos `tipoEntrega` y `tipoPago` son cosméticos y no afectan en como el pedido es procesado.

---
## PedidoProd

### Descripción

La entidad `PedidoProd` representa un ítem específico dentro de un pedido, vinculando un producto con una cantidad determinada y almacenando información de precios para ese ítem. Es responsable de verificar la disponibilidad de stock y de gestionar la reserva y actualización del stock del producto asociado.

### Propiedades

| Propiedad      | Tipo         | Descripción |
|----------------|--------------|-------------|
| `id`           | `number`     | Identificador único del ítem de pedido. |
| `cantidad`     | `number`     | Cantidad de unidades del producto en el pedido. |
| `producto`     | `Producto`   | Producto asociado a este ítem. |
| `precioUnidad` | `number`     | Precio por unidad del producto en el momento de creación del ítem (se usa el `precioFinal` del producto). |
| `precioTotal`  | `number`     | Precio total del ítem (`precioUnidad * cantidad`). |
| `pedido`       | `Pedido`    | Pedido al que pertenece este ítem. |

### Relaciones

- **Producto**: Relación `ManyToOne`. Cada ítem está asociado a un único producto.  
- **Pedido**: Relación `ManyToOne`. Cada ítem pertenece a un único pedido.

### Métodos

| Método                | Descripción |
|-----------------------|-------------|
| `checkStock()`        | Verifica si la cantidad solicitada no excede el stock disponible (stock - stockReservado) del producto. |
| `aumentarStockReservado()` / `reducirStockReservado()` | Aumenta o reduce el stock reservado del producto. |
| `aumentarStock()` / `reducirStock()` | Aumenta o reduce el stock total del producto. |

### Notas

- **Precio almacenado**: Se guarda el precio por unidad y total al momento de crear el ítem para mantener integridad histórica, aunque el precio del producto cambie después.  
- **Control de stock**: La entidad actúa como intermediaria para controlar el stock reservado y disponible en el producto asociado.  
- **Uso en cascada**: Los ítems `PedidoProd` se eliminan automáticamente al borrar el pedido asociado gracias a la configuración de cascada en la entidad `Pedido`.

---
## Cliente

### Descripción

La entidad `Cliente` representa a una persona o usuario registrado que puede realizar pedidos en el sistema. Contiene información personal y de contacto, además de datos relacionados con restricciones de acceso (bloqueos temporales).

### Propiedades

| Propiedad    | Tipo           | Descripción                                           |
|--------------|----------------|-------------------------------------------------------|
| `id`         | `number`       | Identificador único del cliente.                      |
| `dni`        | `string`       | Documento Nacional de Identidad, único por cliente.  |
| `nombre`     | `string`       | Nombre del cliente.                                   |
| `apellido`   | `string`       | Apellido del cliente.                                 |
| `email`      | `string`       | Correo electrónico del cliente.                      |
| `telefono`   | `string`       | Número telefónico de contacto.                        |
| `provincia`  | `string`       | Provincia de residencia.                              |
| `ciudad`     | `string`       | Ciudad de residencia.                                 |
| `direccion`  | `string`       | Dirección completa del cliente.                       |
| `codigoPostal` | `string`     | Código postal de la dirección.                        |
| `fechaIngreso` | `Date`       | Fecha en que el cliente fue registrado en el sistema.|
| `banStart`   | `Date \| null` | Fecha de inicio del bloqueo (si existe).             |
| `banEnd`     | `Date \| null` | Fecha de fin del bloqueo (si existe).                 |
| `banRazon`   | `string \| null`| Motivo por el cual el cliente está bloqueado (si aplica). |
| `pedidos`   | `Pedido[]`| Colección de pedidos asociados al cliente. |

### Relaciones

- **Pedidos**: Relación `OneToMany`. Un cliente puede tener múltiples pedidos a su nombre.

### Métodos

| Método                | Descripción |
|-----------------------|-------------|
|`constructorDTO()` | Método estático que inicializa una nueva instancia de Cliente utilizando los datos proporcionados en un DTO (por ejemplo, desde una request HTTP).  
|`capitalize()`| Método privado que convierte la primera letra de una cadena a mayúscula (utilizado internamente).

### Notas

- **Duración de bloqueo**: Si `banStart` no es nulo y `banEnd` es nulo, el bloqueo será permanente (sin fecha de fin definida).
- **Campo `dni`**: Este campo actúa como un identificador alternativo del cliente y es único.  

---

## Administrador

### Descripción

La entidad `Administrador` representa a un usuario con privilegios administrativos. Los administradores tienen acceso completo al sistema, siendo capaces de crear, borrar o modificar casi todas las entidades (ver notas).

### Propiedades

| Propiedad  | Tipo     | Descripción                           |
|------------|----------|---------------------------------------|
| `id`       | `number` | Identificador único del administrador |
| `nombre`   | `string` | Nombre del administrador              |
| `passwordHash` | `string` | Contraseña encriptada                 |
| `role`     | `string` | Rol del admin en el sistema (superadmin o admin)                 |

### Relaciones

- **Ninguna**: Un administrador no se relaciona con otras entidades.

### Métodos
| Método | Descripción |
|--------|--------------|
| `hashPassword(password: string)` | Devuelve un string (password) hasheado. |

### Notas

- **Hashing**: Cuando se crea un administrador, el constructor toma como uno de sus parámetros una contraseña y guarda la misma encryptada con scrypt en la base de datos.
- **Role**: Los administradores pueden tener dos roles: **admin** y **superadmin**.
  - Los **superadmins** tienen la capacidad de ver, crear, borrar y modificar a otros administradores, pero **no pueden crear ni borrar superadmins**.
  - Los **admins** solo tienen acceso limitado a la gestión de la aplicación y no pueden modificar a otros administradores.