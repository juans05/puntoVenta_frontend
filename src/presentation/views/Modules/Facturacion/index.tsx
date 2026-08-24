
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../../../helpers/auth-helpers';
import useDebounce from '../../../../hooks/useDebounce';
import { getProducts } from '../../../../redux/reducers/Admin/productos/producto.reducer';
// import { IAuthState } from '../../../../redux/reducers/auth/interfaces';
import { IProductsState } from '../../../../redux/reducers/productos/interfaces';
import { RootState } from '../../../../redux/rootState';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import Header from './Header';
import ListaProductos from './ListaProductos';
import ModalLoadingPay from './ModalLoadingPay';
import ModalPay from './ModalPay';
import ProductosFiltradosByCard from './ProductosFiltradosByCard';
// import ProductosFiltradosByTable from './ProductosFiltradosByTable';
import styles from './facturacion.module.css'
import { useState, useEffect, ChangeEvent } from 'react'
import { getPayMethods } from '../../../../redux/reducers/extensiones/extensiones..reducer';
import { obtenerMontoCaja, resetResponse } from '../../../../redux/reducers/ventas/ventas.reducer';
import { Toaster, toast } from 'sonner';
import { ISalesState } from '../../../../redux/reducers/ventas/interfaces';
import ModalCaja from './ModalCaja';
import ModalReporte from './ModalReporte';
import ModalRetiro from './ModalRetiro';
import ModalHistorialRetiros from './ModalHistorialRetiros';
import { getCustomer } from '../../../../redux/reducers/auth/auth.reducer';

const Facturacion = () => {

    const dispatch = useAppDispatch();
    const { products }: IProductsState = useAppSelector((state: RootState) => state.products);
    const { customer, me }: any = useAppSelector((state: RootState) => state.auth)
    const { message, numeroDocumento, code }: ISalesState = useAppSelector((state: RootState) => state.sales)
    const {
        caja,
        isReport,
        //  code 
    }: ISalesState = useAppSelector((state: RootState) => state.sales)
    const [searchProduct, setSearchProduct] = useState('');
    const [isIgv, setIsIgv] = useState<boolean>(false)
    const [loadingProducts, setLoadingProducts] = useState<boolean>(true)

    const navigate = useNavigate()

    const debounceSearch = useDebounce(searchProduct, 1000);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchProduct(e.target.value)
    }

    const token = getToken();

    useEffect(() => {
        dispatch(getPayMethods());
    }, [])

    useEffect(() => {
        if (me?.userName !== undefined) {
            dispatch(obtenerMontoCaja(me?.userName))
        }
    }, [me])

    console.log(products)

    useEffect(() => {
        if (!getToken()) {
            return navigate('/')
        }
        setLoadingProducts(true)
        dispatch(getProducts(0, 0, debounceSearch, 1, 100, undefined)).finally(() => setLoadingProducts(false))
    }, [dispatch, customer, debounceSearch, token])

    // useEffect(() => {
    //   dispatch(
    //     getProducts(activeTab, activeTab1, debounceSearch, 1, 100, newGroupState?.name)
    //   );
    // }, [dispatch, activeTab, activeTab1,debounceSearch]);

    const [isOpen, setIsOpenModal] = useState<boolean>(false);
    const [isOpenLoadingPay, setIsOpenLoadingPay] = useState<boolean>(false)
    const [isOpenSidebar, setOpenSidebar] = useState<boolean>(false);
    const [isOpenCaja, setOpenCaja] = useState<boolean>(false);
    const [isOpenRetiro, setIsOpenRetiro] = useState<boolean>(false);
    const [isOpenModalHistorialRetiro, setIsOpenModalHistorialRetiro] = useState<boolean>(false)

    useEffect(() => {
        if (caja?.cajaAbierta === false) {
            setOpenCaja(true)
        } else {
            setOpenCaja(false)
        }
        if (caja === null) {
            null
            return
        }
    }, [caja])

    const boxModal = () => {
        setOpenCaja(true);
    }

    console.log(me)

    useEffect(() => {
        if (me?.userName.startsWith('RECEPCION') || me?.userName.startsWith('CONTADORA')) {
            window.location.href = '/dashboard/productos';
        }
    }, [me])

    const openSidebarMenu = () => {
        setOpenSidebar(true)
    }

    useEffect(() => {
        if (message !== "" && code === 1) {
            toast.success(message)
            setTimeout(() => {
                dispatch(resetResponse())
            }, 1000);
            return
        }
        if (message !== "" && code === 100) {
            setIsOpenLoadingPay(false);
            toast.error(message)
            setTimeout(() => {
                dispatch(getCustomer(""));
                dispatch(resetResponse())
            }, 1000);
            return
        }
    }, [message, code, numeroDocumento])

    return (
        <>
            <div className={styles.products__wrapper}>
                <Toaster richColors position='top-right' />
                <div className={styles.gridContainer__facturation}>
                    <div className={styles.pruductsFilter__wrapper}>
                        <div className={styles.content__productFilter}>
                            <div className={styles.header__content}>
                                <Header handleChange={handleChange} />
                            </div>
                            <div className={styles.filters__products}>
                                <ProductosFiltradosByCard setOpenSidebar={setOpenSidebar} products={products} loading={loadingProducts} />
                            </div>
                        </div>
                    </div>


                    <div className={styles.facturation__wrapper}>
                        <ListaProductos
                            setOpenRetiro={setIsOpenRetiro}
                            boxModal={boxModal}
                            isIgv={isIgv}
                            setIsOpenModalHistorialRetiro={setIsOpenModalHistorialRetiro}
                            setOpenSidebar={setOpenSidebar}
                            isOpenSidebar={isOpenSidebar}
                            openSidebarMenu={openSidebarMenu} setIsOpenModal={setIsOpenModal} />
                    </div>
                </div>
            </div>
            {isOpen && !isOpenLoadingPay && <ModalPay isIgv={isIgv} setIsIgv={setIsIgv} onClose={() => setIsOpenModal(false)} isOpen={isOpen} setIsOpenLoadingPay={setIsOpenLoadingPay} />}
            {isOpenLoadingPay && code === 1 && <ModalLoadingPay setIsOpenLoadingPay={setIsOpenLoadingPay} />}
            {isOpenCaja && <ModalCaja onClose={() => setOpenCaja(false)} setOpenCaja={setOpenCaja} />}
            {isReport && <ModalReporte />}
            {isOpenRetiro && <ModalRetiro onClose={() => setIsOpenRetiro(false)} setOpenRetiro={setIsOpenRetiro} />}
            {isOpenModalHistorialRetiro && <ModalHistorialRetiros onClose={() => setIsOpenModalHistorialRetiro(false)} />}
        </>
    );
}

export default Facturacion;