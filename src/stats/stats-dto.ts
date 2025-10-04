export interface PedidoStatsDTO {
    cantVentas: {
        cantTotal: number,
        cantConfirmado: number,
        cantCancelado: number,
    }
    montoVentas: {
        ventasConfirmadas: {
            yearMes: string,
            montoTotal: number,
            montoAvg: number,
        }[],
        ventasCanceladas: {
            yearMes: string,
            montoTotal: number,
            montoAvg: number,
        }[]
    }
    distDatos: {
        distPagos: {
            tipo: string,
            cant: number
        }[]
        distEntregas: {
            tipo: string,
            cant: number
        }[]
    }
    geoDistDatos: {
        provincias: {
            provincia: string,
            montoTotal: number
        }[]
        ciudades: {
            provincia: string,
            ciudad: string,
            montoTotal: number
        }[]
    }
    maxDia: {
        dia: number,
        monto: number
    }
    minDia: {
        dia: number,
        monto: number
    }
}


export interface ProductoStatsDTO {
    cantVendida: {
        yearMes: string,
        cantVendida: number
    }[]
    ventas: {
        id: string,
        nombre: string,
        montoTotal: number,
    }[]
    cantNoVendida: {
        cantNoVendida: number,
        cantTotal: number,
    }
}


export interface MarcaStatsDTO {
    ventas: {
        id: string,
        nombre: string,
        montoTotal: number,
    }[]
}


export interface CategoriaStatsDTO {
    ventas: {
        id: string,
        nombre: string,
        montoTotal: number,
    }[]
}


export interface ClienteStatsDTO {
    cantClientes: {
        numMes: number,
        cantNueva: number,
        cantAcumulada: number,
    }[]
    mejoresClientes: {
        id: string,
        nombre: string,
        montoTotal: number,
    }[]
    clientesReiterantes: number,
    geoDistDatos: {
        provincias: {
            provincia: string,
            cantTotal: number
        }[]
        ciudades: {
            provincia: string,
            ciudad: string,
            cantTotal: number
        }[]
    }
    maxDia: {
        dia: number,
        cant: number
    }
    minDia: {
        dia: number,
        cant: number
    }
    averageAge: number,
}