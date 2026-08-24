import { Icon } from '@iconify/react/dist/iconify.js';
import styles from './../facturacion.module.css'
import { motion } from 'framer-motion';
import { useState, useEffect, Dispatch } from 'react'
import { IProduct } from '../../../../../redux/reducers/productos/interfaces';
import { useAppDispatch, useAppSelector } from '../../../../../redux/store';
import { getProductsBySale } from '../../../../../redux/reducers/ventas/ventas.reducer';
import { getCategorias } from '../../../../../redux/reducers/Admin/productos/producto.reducer';
import { RootState } from '../../../../../redux/rootState';
import { IAuthState } from '../../../../../redux/reducers/auth/interfaces';
import { CardGridSkeleton } from '../../../../../components/Skeleton';

interface IProductFilterProps {
    products: IProduct[]
    setOpenSidebar: Dispatch<boolean>
    loading?: boolean
}

const ProductosFiltradosByCard = ({ products, setOpenSidebar, loading }: IProductFilterProps) => {

    const [productsFilters, setProductsFilters] = useState<IProduct[]>([]);
    const [category, setCategory] = useState<string>('Todos')
    const [idCategoria, setIdCategoria] = useState<any>(0);
    const { me }: IAuthState = useAppSelector((state: RootState) => state.auth)

    const dispatch = useAppDispatch()
    const { categorias } = useAppSelector((state: RootState) => state.adminProducts)

    const addRowToSale = (item: IProduct) => {
        dispatch(getProductsBySale(item))
    }

    useEffect(() => {
        dispatch(getCategorias())
    }, [dispatch])

    useEffect(() => {
        setProductsFilters(products);
    }, [products])

    const showProductsByCategory = (category: any) => {
        setIdCategoria(category?.categoriaId)
        setCategory(category?.nombre);
    }

    useEffect(() => {
        if (idCategoria === 0) {
            setProductsFilters(products);
            return
        }
        if (idCategoria !== 0) {
            const filtered = products?.filter((item: IProduct) => item.categoriaId === idCategoria)
            setProductsFilters(filtered);
        }
    }, [idCategoria])

    const productosVentas = me?.userName === 'VENTAS1' || me?.userName === 'VENTAS2' ? productsFilters?.filter((item: any) => item?.categoria?.id === 3 && item?.grupoId === 17) : productsFilters

    return (
        <div>
            <div className='mb-3'>
                <div className={styles.header__options}>
                    {
                        me?.userName === 'VENTAS1' || me?.userName === 'VENTAS2' ? '' : (
                            <>
                                {
                                    categorias?.map((item: any, index: number) => {
                                        return (
                                            <div key={index}>
                                                <button onClick={() => showProductsByCategory(item)} className={category === item?.nombre ? styles.activeCategory : ''}>
                                                    <Icon icon="material-symbols:copy-all" />
                                                    <p>{item?.nombre}</p>
                                                </button>
                                            </div>
                                        )
                                    })
                                }
                            </>
                        )
                    }

                </div>
            </div>
            <div className={styles.content__viewProducts}>
                {loading ? <CardGridSkeleton count={12} /> : (
                <motion.div layout className={styles.gridContent__products}>
                    {
                        productosVentas?.map((item: IProduct) => {
                            return (
                                <motion.div layout className={styles.cardFood} key={item?.productoId} onClick={() => {
                                    addRowToSale(item),
                                        setOpenSidebar(false)
                                }}>
                                    {
                                        item?.rutaImagen !== '' ?    <div>
                                        <img src={item?.rutaImagen} alt="entrada" />
                                    </div>:<div className={styles['empty-img']}>
                                        <p> Sin Imagen para previsualizar</p>
                                    </div>
                                    }
                                 
                                    <div className={styles.info__cardFood}>
                                        <div>
                                            <h3>{item?.nombre}</h3>
                                        </div>
                                        <div className={styles.mount__cardFood}>
                                            <p>S/ {Number(item?.precio).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className={styles.infoCardFooter}>
                                        <p>{item?.nombreCategoria}</p>
                                    </div>
                                </motion.div>
                            )
                        })
                    }
                </motion.div>
                )}
            </div>
        </div>
    );
}

export default ProductosFiltradosByCard