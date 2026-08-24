
import { Icon } from '@iconify/react/dist/iconify.js'
import styles from './ventas.module.css'
import { motion } from 'framer-motion'
import Input from '../../../../../../components/Input'
import { ChangeEvent, useState } from 'react'
import { useAppDispatch } from '../../../../../../redux/store'
import { AnularVenta } from '../../../../../../redux/reducers/Admin/ventas/ventasRealizadas.reducer'

interface IProps {
    onClose: any
    id: number
}

const Motivo = ({ onClose, id }: IProps) => {
    console.log(id)

    const dispatch = useAppDispatch();

    const [motive, setMotive] = useState<string>("");

    const next = () => {
        const data = {
            idComprobante: id,
            motivoAnulacion: motive
        }
        dispatch(AnularVenta(data));
        onClose();
    }

    return (
        <div className={styles.wrapper__motive}>
            <motion.div animate={{ y: 0 }} initial={{ y: -30 }} className={styles.modal__motive}>
                <div>
                    <div className={styles.header__motive}>
                        <div>
                            <Icon onClick={onClose} icon="iconamoon:close-duotone" color="#47525E" width={25} />
                        </div>
                        <h5>Motivo</h5>
                        <p>Ingrese el motivo por el cual usted anula este comprobante</p>
                    </div>
                    <div className={styles.body__motive}>
                        <Input type='textarea' name='motivo' onChange={(e : ChangeEvent<HTMLInputElement>) => setMotive(e.target.value)} />
                    </div>
                    <div className='px-5 pb-3'>
                        <button disabled={motive === ""} onClick={next} className="mt-1 bg-[#EA6991] w-full rounded-md p-3 text-cyan-50">Enviar y anular</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Motivo;