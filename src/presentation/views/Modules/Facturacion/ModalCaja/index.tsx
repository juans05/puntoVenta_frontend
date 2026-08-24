import { Icon } from '@iconify/react/dist/iconify.js';
import styles from '../facturacion.module.css'
import { motion } from 'framer-motion'
import billetera from '../../../../../assets/img/pagado.png'
import Input from '../../../../../components/Input';
import { useAppDispatch, useAppSelector } from '../../../../../redux/store';
import { abrirCaja, cerrarCaja } from '../../../../../redux/reducers/ventas/ventas.reducer';
import { useState } from 'react'
import { ISalesState } from '../../../../../redux/reducers/ventas/interfaces';
import { RootState } from '../../../../../redux/rootState';

const ModalCaja = ({onClose,setOpenCaja}: any) => {

    const { montosCaja, caja}: ISalesState = useAppSelector((state: RootState) => state.sales)

    const dispatch = useAppDispatch();

    const [amount, setAmount] = useState<number>(0)

    const openBox = () => {
        if(montosCaja?.cajaAbierta === undefined || caja === false || caja?.cajaAbierta === false || montosCaja?.cajaAbierta === false) {
            dispatch(abrirCaja(amount))
            setOpenCaja(false)
        } else {
            dispatch(cerrarCaja())
            setOpenCaja(false)
        }
    }

    return (
        <div className={styles.wrapper__caja}>
        <motion.div animate={{ y: 0 }} initial={{ y: -30 }} className={styles.modal__historial}>
            <div>
                <div className={styles.header__historial}>
                    <div>
                        <Icon onClick={onClose} icon="iconamoon:close-duotone" color="#47525E" width={25} />
                    </div>
                    <h5>Caja</h5>
                    <p>{montosCaja?.cajaAbierta === undefined || caja === false || montosCaja?.cajaAbierta === false ? 'Upps !!! Aún no haz abierto tu caja para poder operar las ventas' : 'Cierra tu caja para constatar tus ventas' }</p>
                </div>
                <div className={styles.body__caja}>
                  <div>
                    <img width={150} src={billetera} alt="" />
                  </div>
                  <div>
                    <Input value={0} name='monto' type='number' onChange={(e: any) => setAmount(Number(e.target.value))} isLabel label={montosCaja?.cajaAbierta === undefined || caja === false || montosCaja?.cajaAbierta === false ? 'Monto de apertura' : 'Monto de cierre'} />
                    <button disabled={amount >= 0 ? false : true} onClick={openBox} className="mt-4 text-sm bg-brand-500 hover:bg-brand-600 transition-colors w-full rounded-md p-2 text-white">{montosCaja?.cajaAbierta === undefined || caja === false || montosCaja?.cajaAbierta === false ? 'Aperturar Caja' : 'Cerrar Caja'}</button>
                  </div>
                </div>
            </div>
        </motion.div>
    </div>
    )
}

export default ModalCaja;