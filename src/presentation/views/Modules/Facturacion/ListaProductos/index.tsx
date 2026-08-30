import { Icon } from "@iconify/react/dist/iconify.js";
import styles from './../facturacion.module.css'
import { IAuthState } from "../../../../../redux/reducers/auth/interfaces";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { RootState } from "../../../../../redux/rootState";
import { ISalesState } from "../../../../../redux/reducers/ventas/interfaces";
import { IProduct } from "../../../../../redux/reducers/productos/interfaces";
import { motion } from 'framer-motion'
import { ChangeEvent, Dispatch, useEffect } from "react";
import { toast } from 'sonner'
import NotProducts from "../../../../../assets/svg/notProducts";
import { decrementProductInSale, deleteProductInSale, getProductsBySale, updateProductByPrice } from "../../../../../redux/reducers/ventas/ventas.reducer";
import SidebarOptions from "../SidebarOptions";
import Input from "../../../../../components/Input";
import { produce } from 'immer'
import { resetCustomer } from "../../../../../redux/reducers/auth/auth.reducer";

interface IProps {
    setIsOpenModal: Dispatch<boolean>
    openSidebarMenu: any
    isIgv: boolean
    isOpenSidebar: boolean
    setOpenSidebar: Dispatch<boolean>
    boxModal: any
    setOpenRetiro: Dispatch<boolean>
    setIsOpenModalHistorialRetiro: Dispatch<boolean>
    closeMobileCart: () => void
    requiereCaja?: boolean
}

const ListaProductos = ({isIgv,setIsOpenModalHistorialRetiro,setOpenRetiro, boxModal,setOpenSidebar,isOpenSidebar, setIsOpenModal, openSidebarMenu, closeMobileCart, requiereCaja = true }: IProps) => {

    const dispatch = useAppDispatch();

    let cajaStorage: any = localStorage.getItem('caja');
    cajaStorage = JSON.parse(cajaStorage);

    const { customer, me }: IAuthState = useAppSelector((state: RootState) => state.auth)
    const { productsBySale,
    }: ISalesState = useAppSelector((state: RootState) => state.sales)

    const showPage = () => {
        if (productsBySale?.length === 0) {
            toast.error('Agregar un producto para poder pagar')
            return
        } else {
            setIsOpenModal(true);
            return
        }
    }

    useEffect(() => {
        if(productsBySale?.length === 0) {
            dispatch(resetCustomer());
        }
    },[productsBySale])

    const deleteProduct = (productoId: number) => {
        dispatch(deleteProductInSale(productoId))
    }

    const addProduct = (item: IProduct) => {
        dispatch(getProductsBySale(item))
    }

    const decrementProduct = (item: IProduct) => {
        dispatch(decrementProductInSale(item))
    }

    let total = 0;

    for(const producto of productsBySale) {
        total += producto.precio * producto.cantidad
    }

    const changePriceProduct = (e : ChangeEvent<HTMLInputElement>, item: IProduct) => {
        const newPrice = parseFloat(e.target.value);

        // Validación básica: asegúrate de que el precio no es negativo o NaN.
        if (isNaN(newPrice) || newPrice < 0) {
            toast.error('Precio ingresado inválido.');
            return;
        }
    
        // Encuentra el índice del producto en el arreglo.
        const productIndex = productsBySale.findIndex(prod => prod.productoId === item.productoId);
    
        if (productIndex === -1) {
            toast.error('Producto no encontrado.');
            return;
        }
    
        // Crea una copia del arreglo y actualiza el producto en cuestión.
        const updatedProducts = produce(productsBySale, draft => {
            draft[productIndex].precio = newPrice;
        });
        // Actualiza el estado.
        dispatch(updateProductByPrice(updatedProducts));
    }

    return (
        <div className="relative">
            {isOpenSidebar && <SidebarOptions requiereCaja={requiereCaja} setIsOpenModalHistorialRetiro={setIsOpenModalHistorialRetiro} setOpenRetiro={setOpenRetiro} boxModal={boxModal} onClose={() => setOpenSidebar(false)} />}
            <div onClick={closeMobileCart} className={styles.mobileCartSheet__close}><span></span></div>
            <div className="flex justify-between px-5 py-3">
                <h3 className="text-[#47525E] font-bold"><h4 className="mt-2">Vendedor - {me?.userName}</h4></h3>
                <div className="flex items-center">
                    <Icon onClick={openSidebarMenu} icon="charm:menu-kebab" className="cursor-pointer" color="#a8a8a8" width={20} />
                </div>
            </div>

            <motion.div className={styles.content__list}>

                <div>
                    {
                        productsBySale?.length > 0 ? productsBySale?.map((item: IProduct) => {
                            return (
                                <motion.div animate={{ x: 0, y: 0 }}
                                    initial={{ x: 30 }}
                                    key={item?.productoId} layout className={styles.card__product}>
                                    <div className={styles.content__cardProduct}>
                                        <div className={styles.deleteProduct}>
                                            <Icon onClick={() => deleteProduct(item?.productoId)} icon="iconamoon:close-duotone" color="#47525E" width={25} />
                                        </div>
                                        {
                                            item?.rutaImagen !==''?  <div className={styles.img__product}>
                                            <img src={item?.rutaImagen} alt="entrada" />
                                        </div>:<div className={styles['empty-img-list']}>
                                        <p> Sin Imagen</p>
                                    </div>
                                        }
                                       
                                        <div>
                                            <h5>{item.nombre}</h5>
                                            <p>Cantidad</p>
                                            <div className={styles.increment__decrement}>
                                                <button onClick={() => decrementProduct(item)}>-</button><span>x {item?.cantidad}</span><button onClick={() => addProduct(item)}>+</button>
                                            </div>
                                        </div>
                                        <div className={styles.mount_total}>
                                            <div>
                                                <p>S/ </p>
                                                <Input type="text" name="precio" onChange={(e: ChangeEvent<HTMLInputElement>) => changePriceProduct(e, item)} defaultValue={Number(item.precio * item?.cantidad).toFixed(2)} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        }) :

                            <>
                                <div className={styles.no__products}>
                                    <div>
                                        <NotProducts />
                                        <p>No tienes productos, agrega al menos un producto para poder realizar el pago</p>
                                    </div>
                                </div>
                            </>
                    }
                </div>
            </motion.div>

            <div className="px-5">
                <div className="flex mt-1 justify-between items-center w-full">
                    <p className="uppercase text-[#47525E] font-bold text-sm">cliente</p>
                    <p className="uppercase">{customer ? customer : 'SIN CLIENTE'}</p>
                </div>
                <div className="flex mt-1 justify-between items-center w-full">
                    <p className="uppercase text-[#47525E] font-bold text-sm">subtotal</p>
                    <p>{isIgv ? (Number(total / 1.18).toFixed(2)) : total.toFixed(2)}</p>
                </div>
                <div className="flex mt-1 justify-between items-center w-full">
                    <p className="uppercase text-[#47525E] font-bold text-sm">impuestos</p>
                    <p>{isIgv ? (Number(total - Number(total / 1.18)).toFixed(2)) : Number(0).toFixed(2)}</p>
                </div>
                <div className="flex mt-1 justify-between items-center w-full">
                    <p className="uppercase text-[#47525E] font-bold text-sm">descuento</p>
                    <p>0.00</p>
                </div>
                <div className={styles.dash}></div>
                <div className="flex mt-2 justify-between items-center w-full">
                    <p className="uppercase text-ink-900 font-bold text-base">total</p>
                    <p className="text-ink-900 font-bold text-xl">{total.toFixed(2)}</p>
                </div>
                <button disabled={
                    (requiereCaja ? cajaStorage?.cajaAbierta === true : true) &&
                        productsBySale?.length > 0 ? false : true} onClick={showPage} className="mt-4 bg-brand-500 hover:bg-brand-600 transition-colors w-full rounded-md p-3 text-white font-semibold">Pagar</button>
            </div>
        </div>

    );
}

export default ListaProductos;