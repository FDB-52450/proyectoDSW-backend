# Lógica de negocio
## ⚠️ Antes de leer
Se recomienda haber leído la documentación relacionada con las entidades del sistema ([entidades.md](./entidades.md)) para poder entender todos los términos utilizados en el siguiente texto.

## 📚 Tabla de Contenidos
- [Reglas de validación](#reglas-de-validacion)
- [Reglas de cálculo](#reglas-de-cálculo)
- [Flujos y estados](#flujos-y-estados)
- [Gestión de stock](#gestion-de-stock)
- [Políticas](#politicas)
- [Seguridad](#seguridad)
- [Manejo de errores](#manejo-de-errores)
- [Estadísticas](#estadisticas)
- [Restricciones](#restricciones)

## Reglas de validación
### General
- Todas las entidades cuentan con reglas estrictas de validación al momento de crear o modificar registros.
- Se validan tanto los **campos obligatorios y sus formatos** como la **cantidad de campos** recibidos.
- **No se permiten campos adicionales** en el cuerpo de la solicitud; cualquier dato extra provocará el rechazo de la petición.

#### Tipos de atributos
- En general, las siguientes reglas aplican para validar ciertos tipos de atributos:
  - **String**: En caso de ser un input, el mismo no debe exceder una cierta longitud (generalmente entre 100 y 256). En caso de ser una opción (retiro/envío), el mismo debe ser una de las opciones.
  - **Int**: Ningún número puede ser negativo, y la mayoría tiene un mínimo que varía entre 0 y 1 dependiendo del atributo.

### Imágenes
- Las imágenes subidas deben cumplir con las siguientes restricciones:
  - **Tamaño máximo**: 5 MB
  - **Formatos permitidos**: `jpeg`, `png`, `webp`

### Pedidos
- Los pedidos no pueden ser eliminados ni modificados una vez creados, por lo que toda la validación ocurre en la creación del pedido.
- Al crear un pedido, se verifica que:
  - **Stock suficiente**: La cantidad solicitada de cada producto debe estar disponible.
  - **Límites por categoría**: No se debe superar el stock límite establecido para cada categoría involucrada en el pedido.
  - **Estado del cliente**: El cliente que realiza el pedido no debe estar bloqueado (ban activo).

## Reglas de cálculo
### Pedidos
- Cada pedido almacena el precio total del mismo, y cada ítem de su detalle almacena el precio individual del producto y el total del ítem con el fin de mantener el precio histórico del pedido y los productos que lo componen.
- El total de un pedido se calcula a base de cada uno de sus ítems, sumando el precio unitario de cada producto multiplicado por su cantidad.
- A la hora de crear un pedido, el sistema ignora los valores unitarios dados por el request y utiliza los valores actuales del producto.
- Si no se da una fecha para la entrega del pedido, el sistema asigna una automáticamente 7 días después de la fecha actual (agregando un día más si la fecha cae en domingo)

### Productos
- Todo producto almacena su precio final, el cual se calcula como el precio base multiplicado por el descuento del producto. Este precio final es actualizado cada vez que la entidad se modifica, y sirve para ordenar correctamente los productos por precio.
- Todos los precios se almacenan sin IVA.

## Flujos y estados
### Ciclo de vida (pedido)
- Todo pedido empieza con un estado pendiente, y termina con estado confirmado o cancelado.
- Un pedido es confirmado de forma manual por un administrador cuando el cliente retire el mismo y confirme su pago.
- Un pedido es cancelado de forma manual por un administrador, o de forma automática por el sistema cuando su **fecha de entrega** sea menor a la fecha del día actual.
- No es posible cambiar el estado de un pedido una vez que este mismo sea confirmado o cancelado.

### Ciclo de vida (imagen)
- Una imagen se crea al ser subida junto con una marca o producto, subiendo tres o dos versiones de la imagen en diferentes tamaños para mayor flexibilidad.
- Una imagen no puede ser modificada, solo creada o borrada.
- Si un producto o marca es eliminada, las imágenes asociadas a la misma son borradas del sistema.

## Gestión de stock
### Reserva de stock
- Para representar la cantidad de stock reservado en un pedido, todo producto tiene un atributo llamado stock reservado.
- Al crear un producto, este mismo empieza con un stock reservado igual a 0.
- El stock reservado de un producto no puede modificarse directamente.
- En la vista pública, el stock mostrado es el resultado del stock total menos el stock reservado.
- Cuando un pedido es cancelado o confirmado, el stock reservado del mismo disminuye.

### Límites de stock
- Para garantizar que la mayor cantidad de clientes posibles puedan adquirir los productos que desean, cada categoría tiene un límite de unidades que pueden ser agregadas al carrito.
- Este límite es establecido a la hora de crear la categoría, y generalmente se determina a base de la cantidad necesaria para armar una computadora más uno.

## Políticas
### Bloqueo de clientes
- Un cliente puede ser bloqueado de manera automática, debido al incumplimiento de pedidos, o de manera manual por un administrador.
- Un cliente bloqueado no puede crear nuevos pedidos hasta que su "cuenta" sea desbloqueada.
- Para representar un bloqueo, la entidad cliente posee tres atributos: `banStart` (Date/null), `banEnd` (Date/null) y `banRazon` (string/null).
- Si el cliente está bloqueado (`banStart` no es nulo), pero `banEnd` si es nulo, esto significa que el bloqueo es permanente y solo puede ser desbloqueado de forma manual por un administrador.

#### Bloqueo automático
- Una vez por día, una tarea es ejecutada para cancelar cualquier pedido que tenga estado pendiente y que su fecha de entrega sea menor a la fecha actual.
- Por cada cliente que haya no cumplido con un pedido, el sistema analizará la cantidad de pedidos cancelados del mismo como el monto total del mismo, y a base de eso determinará la duración del bloqueo que recibirá el cliente.
- Al mismo tiempo, otra tarea es ejecutada una vez por día para desbloquear a cualquier cliente que esté bloqueado y que su fecha de finalización de ban sea menor a la fecha actual.

## Seguridad
### Admins
- El sistema cuenta con administradores, los cuales se encargan de la gestión de las varias entidades que tiene el sistema.
- Los administradores se dividen en dos roles: **admins** y **superadmins**, siendo la única diferencia que los superadmins pueden ver y gestionar a otros administradores.

### Autorización
- En general, todos los endpoints utilizados para crear, modificar o eliminar entidades requieren de autorización para poder ser utilizados.
- La excepción a esto son los endpoints de find y findAll de pedido y stats, que solo son accesibles por administradores, y el endpoint de create de pedido, el cual es accesible a todos.
- En el caso de la entidad administrador, todos los endpoints de la misma (excepto **login** y **logout**) solo pueden ser accedidos por superadmins.

### Logging
- El sistema cuenta con varios sistemas de logging, con el fin de mantener una lista detallada de las acciones realizadas en el sistema, cuando fueron realizadas y el usuario que las realizó.
- Cada vez que una entidad es creada, borrada o modificada, se registra la acción realizada, la información asociada a la misma, la fecha y hora en la que se realizó y el usuario logueado que la hizo.
- El sistema también loguea todos los logins exitosos y no exitosos, junto con los logouts.

## Manejo de errores
### Errores de validación
- Si se detecta un error durante la validación del input de una request, el servidor responderá con un error 400 junto con un arreglo de todos los errores ocurridos durante el mismo (body.errors)

### Errores definidos
- Cuando ocurre un error debido a un input mal formado, no semánticamente, sino desde la lógica del negocio, el sistema devuelve un error de tipo 4xx junto con un mensaje descriptivo del mismo.
- En casos específicos, como la validación de pedidos, es posible que el sistema devuelva un arreglo de errores.

### Errores no definidos
- Si ocurre un error no esperado o no manejado por el servidor de forma manual, el mismo responderá con un error 500 y un mensaje de error genérico.
- El sistema cuenta con un try catch de forma global, de forma tal que, si un error no es atrapado de forma manual, el mismo será atrapado por el try catch global. En este caso, el servidor logueará el error ocurrido y devolverá un error 500 junto con el mensaje de error (en caso de que NODE_MODE no esté en modo prod).

## Estadísticas
- Para poder ilustrar las distintas métricas, el sistema ofrece una serie de estadísticas solo visibles para administradores.
- El sistema recopila estadísticas de 5 entidades, consideradas como fundamentales para el funcionamiento del sistema: 
  - **Pedidos**: Cantidad y monto total de ventas, distribución de los distintos tipos de pagos y envíos y de las distintas ubicaciones desde las cuales se realizan pedidos, y el día máximo y mínimo de ventas.
  - **Clientes**: Cantidad total y nueva de clientes, mejores clientes, cantidad de clientes reiterantes, distribución geográfica de clientes y el día máximo y mínimo de nuevos clientes
  - **Productos**: Cantidad y monto de productos vendidos, y cantidad total no vendida de productos.
  - **Categorías/marcas**: Marcas/categorías con la mayor y la menor cantidad de ventas.
- Cada estadística es recopilada por mes, y se recopila desde el primero del mes hasta el día actual para cada mes para lograr una comparación justa.

## Restricciones
### Eliminación de entidades
- Toda entidad que está siendo referenciada por otra entidad no puede ser eliminada. Esto aplica a cualquier marca o categoría que está referenciada en un producto, y a cualquier producto utilizado en un pedido. Si se desea eliminar una de estas entidades, se debe eliminar cualquier referencia a la misma.
- Los pedidos y los clientes, al representar información fundamental para el sistema, no pueden ser eliminados.

### Cantidad de imágenes
- Toda marca solo puede tener una imagen, y todo producto no puede tener mas de 4 imagenes.