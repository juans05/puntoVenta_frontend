import styles from '../facturacion.module.css'
import loading from '../../../../../assets/gif/loading.gif'
import { motion } from 'framer-motion';
import { ISalesState } from '../../../../../redux/reducers/ventas/interfaces';
import { useAppSelector } from '../../../../../redux/store';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../../../redux/rootState';
import { useEffect } from 'react'
// import { resetResponse } from '../../../../../redux/reducers/ventas/ventas.reducer';

const ModalLoadingPay = ({setIsOpenLoadingPay} : any) => {

    const navigate = useNavigate();

    const { code }: ISalesState = useAppSelector((state: RootState) => state.sales)

    useEffect(()=> {
        if(code === 1) {
            setTimeout(() => {
                setIsOpenLoadingPay(false)
                return navigate('/pago-exitoso');
            }, 1000);
        }
    },[code])

    return (
        <div className={styles.wrapper__payMethod}>
            <motion.div animate={{ y: 0 }} initial={{ y: -30 }} className={styles.modal__payMethod}>
                <div className={styles.loading__wrapper}>
                    <div className={styles.loading}>
                        <img src={loading} alt="cargando..." />
                        <div className={styles.header__payMethod}>
                            <h5>Esperando el proceso de pago</h5>
                            <p>Pago en proceso porfavor espere mientras tengamos la impresión del recibo de pago</p>
                        </div>
                    </div>
                    <div className='p-5'>
                        <button disabled className="mt-2 bg-brand-500 w-full rounded-md p-3 text-white">Cerrar</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default ModalLoadingPay;