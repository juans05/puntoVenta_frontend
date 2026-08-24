import { IProduct } from "../redux/reducers/productos/interfaces";

const useTotals = (productosFicha: any[], productsBySale: IProduct[]) => {

    const anfitrionasAgrupadas = productosFicha.reduce((acc, anfitriona) => {
        const key = `${anfitriona.productoId}-${anfitriona.anfitrionaId}`;
        if (!acc[key]) {
            acc[key] = {
                ...anfitriona,
                cantidad: 1,
            };
        } else {
            acc[key].cantidad++;
        }
        return acc;
    }, {});

    // Obtener la cantidad total y la ruta de la imagen de cada producto
    const productosFinales = Object.values(anfitrionasAgrupadas).map((anfitriona: any) => {
        const producto: any = productsBySale.find((p) => p.productoId === anfitriona.productoId);
        return {
            anfitrionas: [anfitriona],
            cantidadTotal: anfitriona?.precioEspecial * anfitriona?.cantidad,
            productoId: anfitriona?.productoId,
            rutaImagen: producto?.rutaImagen,
            nombre: producto?.nombre
        };
    });

    // Agrupar anfitrionas con el mismo productoId
    const productosAgrupados = productosFinales.reduce((acc: any, productoFinal) => {
        const existingProduct: any = acc.find((p: any) => p.productoId === productoFinal.productoId);
        if (existingProduct) {
            existingProduct.anfitrionas.push(...productoFinal.anfitrionas);
            existingProduct.cantidadTotal += productoFinal.cantidadTotal;
        } else {
            acc.push(productoFinal);
        }
        return acc;
    }, []);

    const precioEspecialTotals = productosFicha?.reduce((acc, item) => {
        const { productoId, precioEspecial } = item;
        if (acc[productoId]) {
            acc[productoId] += precioEspecial;
        } else {
            acc[productoId] = precioEspecial;
        }
        return acc;
    }, {});

    const resultado = Object.entries(precioEspecialTotals).map(([productId, total]) => ({
        productoId: parseInt(productId),
        totalFicha: total,
    }));

    const productos: IProduct[] | any = productsBySale.map((producto: IProduct) => {
        const found = resultado.find((item: any) => Number(item?.productoId) === Number(producto?.productoId));
        if (found) {
            return {
                ...producto,
                totalFicha: Number(found?.totalFicha)
            }
        } else {
            return {
                ...producto,
                totalFicha: 0
            }
        }
    });

    const totalPrecio = Number(productos.reduce((acumulador: number, item: IProduct) => acumulador + (item.precio * item.cantidad), 0)).toFixed(2) || Number(0).toFixed(2);
    const totalFicha = Number(productosFicha.reduce((acumulador: number, item: any) => acumulador + (item?.precioUnitario), 0)).toFixed(2) || Number(0).toFixed(2);
    const totalAnfi = Number(productos.reduce((acumulador: number, item: any) => acumulador + (item?.totalFicha), 0)).toFixed(2) || Number(0).toFixed(2);

    const totalClient = Number(totalAnfi) + Number(totalPrecio);
    const totalMonto = Number(totalPrecio) + Number(totalFicha)

    return [totalClient, totalMonto, productos, productosAgrupados]
}

export default useTotals;
