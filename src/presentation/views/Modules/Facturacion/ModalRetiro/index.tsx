import { Icon } from '@iconify/react/dist/iconify.js';
import styles from '../facturacion.module.css'
import { motion } from 'framer-motion'
import Input from '../../../../../components/Input';
import { useAppDispatch } from '../../../../../redux/store';
import { resetResponse, retirarCaja } from '../../../../../redux/reducers/ventas/ventas.reducer';
import { ChangeEvent, useState } from 'react'
import { toast } from 'sonner';
import RetiroSvg from '../../../../../assets/svg/retiro';

const ModalRetiro = ({ onClose, setOpenRetiro }: any) => {

    const dispatch = useAppDispatch();
    let storage : any = localStorage.getItem('caja');
    const [amount, setAmount] = useState<number>(0);
    const [motivo, setMotivo] = useState<string>('');
    storage = JSON.parse(storage)

    const retirar = () => {
        if(amount === 0) {
            return toast.error('Si vas a retirar dinero, tu monto debe ser mayor a 0')
        }
        if(motivo === '') {
            return toast.error('Debes justificar el monto del retiro')
        }

        if(amount > storage?.montoTotal) {
            dispatch(resetResponse())
            return toast.error('No puedes retirar este monto, excedes a tu total de caja')
        } else {
            const retiroData = {
                cajaId: storage?.cajaId,
                monto: amount,
                motivo: motivo
            }
            dispatch(resetResponse())
            dispatch(retirarCaja(retiroData))
            setOpenRetiro(false)
        }
    }

    return (
        <div className={styles.wrapper__retiro}>
            <motion.div animate={{ y: 0 }} initial={{ y: -30 }} className={styles.modal__retiro}>
                <div>
                    <div className={styles.header__retiro}>
                        <div>
                            <Icon onClick={onClose} icon="iconamoon:close-duotone" color="#47525E" width={25} />
                        </div>
                        <h5>Retiro</h5>
                        <p>Coloca el monto y el motivo de su retiro</p>
                    </div>
                    <div className={styles.body__retiro}>
                        <div>
                            <RetiroSvg />
                        </div>
                        <div>
                            <Input value={amount} name='monto' type='number' onChange={(e: any) => setAmount(Number(e.target.value))} isLabel label="Monto" />
                            <Input isLabel label='Motivo' onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMotivo(e.target.value)} type='textarea' name="" id=""/>
                            <button disabled={amount > 0 && motivo !== "" ? false : true} onClick={retirar} className="mt-0 text-sm bg-brand-500 hover:bg-brand-600 transition-colors w-full rounded-md p-2 text-white">Retirar</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default ModalRetiro;