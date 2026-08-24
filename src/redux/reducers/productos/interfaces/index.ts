export interface IProductsState {
    products: IProduct[],
    total: number
}

export interface IProduct {
    productoId: number
    index: number
    nombre: string
    precio: number
    categoriaId: number
    categoria: Category
    nombreCategoria: string
    proveedor: null
    codigoBarra: string
    precioVentaSinInpuesto: number
    precioVentaConInpuesto: number
    margenGanancia: number
    cambioPrecioPermitido: boolean
    stock: number,
    cantidad: number
    rutaImagen: string
    comentarios: Comments[]
    totalFicha: number
}

export interface IProductData {
    data: unknown,
    code: number
    message: string
    status: number
}

export interface IResponseProduct {
    config?: null
    data: IProductData
    headers?: null
    request?: null
    status: number
    statusText: string
}

export interface Data {
    hasItems: boolean
    items: IProduct[]
    page: number
    pages: number
    total: number
}

interface Category {
    nombre: string
    id: number
    usuarioCreacion: string
    fechaCreacion: string
    estado: boolean
    tenantId: string
}

interface Comments {
    item: number
    descripcion: string
    productoId: number
    producto: null
    id: number
    usuarioCreacion: string
    fechaCreacion: string
    estado: true
    tenantId: string
}
/* 
interface IDetalleFichaProducto {
    productId: number
    habitacionId: number
    anfitrionaId: number
    precioEspecial: number
} */