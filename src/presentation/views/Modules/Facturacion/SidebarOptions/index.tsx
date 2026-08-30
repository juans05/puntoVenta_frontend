import styles from '../facturacion.module.css'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Link } from 'react-router-dom'
import { IAuthState } from '../../../../../redux/reducers/auth/interfaces'
import {
    useAppDispatch,
    useAppSelector
} from '../../../../../redux/store'
import { RootState } from '../../../../../redux/rootState'
import { cerrarCaja } from '../../../../../redux/reducers/ventas/ventas.reducer'
import { Dispatch } from 'react'
import { toast } from 'sonner'

interface props {
    onClose: any
    boxModal: any
    setOpenRetiro: any
    setIsOpenModalHistorialRetiro: Dispatch<boolean>
    requiereCaja?: boolean
}

const SidebarOptions = ({ onClose,
    boxModal,setOpenRetiro,setIsOpenModalHistorialRetiro, requiereCaja = true
}: props) => {

    const dispatch = useAppDispatch();

    const { me }: IAuthState = useAppSelector((state: RootState) => state.auth)

    const confirmClose = () => {
        dispatch(cerrarCaja());
    }

    let cajaStorage: any = localStorage.getItem('caja');
    cajaStorage = JSON.parse(cajaStorage);

    const signout = () => {
        localStorage.clear();
        return (window.location.href = "/");
    }

    const openRetiro = () => {
        if(cajaStorage === null) {
            return toast.error('Caja cerrada, debes aperturar tu caja primero');
        }
        setOpenRetiro(true)
    }

    const openHistorialRetiro = () => {
        if(cajaStorage === null) {
            return toast.error('Caja cerrada, debes aperturar tu caja primero');
        }
        if(cajaStorage.retiros?.length === 0) {
            return toast.error('No se encontraron retiros')
        }
        setIsOpenModalHistorialRetiro(true)
    }

    return (
        <div className={styles.sidebar__wrapper}>
            <motion.div animate={{ y: 0 }} initial={{ y: -30 }} className={styles.sidebar}>
                <div>
                    <div className={styles.header__historial}>
                        <div>
                            <Icon onClick={onClose} icon="iconamoon:close-duotone" color="#47525E" width={25} />
                        </div>
                        <h5>{me?.userName}</h5>
                        <p>POS</p>
                    </div>
                    <div className={styles.dividerSidebar}>
                        <div></div>
                    </div>
                    <div>
                        <ul className={styles.menuSidebar}>
                            <li>
                                <Link to={'/dashboard/productos'}><Icon icon="humbleicons:dashboard" />Administración</Link>
                            </li>
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                            <li>
                                <Link to={'/dashboard/ventas-realizadas'}><Icon icon="iconoir:home-sale" />Historial de ventas</Link>
                            </li>
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                            {requiereCaja && (
                                <>
                                    <li>
                                        <Link onClick={openHistorialRetiro} to={'#'}><Icon icon="icon-park-outline:folder-withdrawal" />Historial de retiros</Link>
                                    </li>
                                    <div className={styles.dividerSidebar}>
                                        <div></div>
                                    </div>
                                    <li>
                                        <Link onClick={cajaStorage === null || cajaStorage.cajaAbierta === false ? boxModal : confirmClose} to={'#'}><Icon icon="solar:box-broken" />{cajaStorage === null || cajaStorage.cajaAbierta === false ? 'Abrir Caja' : 'Cerrar Caja'}</Link>
                                    </li>
                                    <div className={styles.dividerSidebar}>
                                        <div></div>
                                    </div>
                                    <li>
                                        <Link onClick={openRetiro} to={'#'}><Icon icon="uil:money-withdrawal" />Retiro de dinero</Link>
                                    </li>
                                    <div className={styles.dividerSidebar}>
                                        <div></div>
                                    </div>
                                </>
                            )}
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                            <li>

                                <Link onClick={signout} to={'#'}> <Icon icon="solar:logout-2-linear" />Cerrar sesión</Link>
                            </li>
                        </ul>
                    </div>

                    {
                        cajaStorage?.cajaAbierta === true &&

                        <div className={styles.historial__ventas}>

                            <h5>Historial de ventas</h5>
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                            <div>
                                <label htmlFor="">Monto de inicio:</label>
                                <p>{cajaStorage?.montoInicio}</p>
                            </div>
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                            <div>
                                <label htmlFor="">Monto Cierre:</label>
                                <p>{cajaStorage?.montoCierre}</p>
                            </div>
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                            <div>
                                <label htmlFor="">Monto de Efectivo:</label>
                                <p>{cajaStorage?.montoEfectivo}</p>
                            </div>
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                            <div>
                                <label htmlFor="">Monto de tarjeta:</label>
                                <p>{cajaStorage?.montoTarjeta}</p>
                            </div>
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                            <div>
                                <label htmlFor="">Monto de Yape:</label>
                                <p>{cajaStorage?.montoYape}</p>
                            </div>
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                            <div>
                                <label htmlFor="">Monto de retiros:</label>
                                <p>{cajaStorage?.montoRetiros}</p>
                            </div>
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                            <div>
                                <label htmlFor="">Monto total:</label>
                                <p>{cajaStorage?.montoTotal}</p>
                            </div>
                            <div className={styles.dividerSidebar}>
                                <div></div>
                            </div>
                        </div>

                    }
                </div>
            </motion.div>
        </div>
    )
}

export default SidebarOptions;