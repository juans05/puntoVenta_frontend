import { IProduct } from "../../../../../redux/reducers/productos/interfaces";
import { getProductsBySale } from "../../../../../redux/reducers/ventas/ventas.reducer";
import { useAppDispatch } from "../../../../../redux/store";
import styles from './../facturacion.module.css'

interface IProductFilterProps {
    products: IProduct[] | null
}

const ProductosFiltradosByTable = ({ products }: IProductFilterProps) => {

    const dispatch = useAppDispatch()

    const addRowToSale = (item: IProduct) => {
        dispatch(getProductsBySale(item))
    }

    return (
        <div className={styles.content__listTable}>
            <div className="pr-4">
                <div className="table">
                    <div className="content__table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre de Producto</th>
                                    <th>Stock</th>
                                    <th>Precio</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    products?.map((item: IProduct) => {
                                        return (
                                            <tr key={item?.productoId} className={styles.rowSelect} onClick={() => addRowToSale(item)}>
                                                <td>{item?.nombre}</td>
                                                <td>{item?.stock}</td>
                                                <td>{item?.precio}</td>
                                                <td>{item?.precio}</td>
                                            </tr>

                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductosFiltradosByTable;