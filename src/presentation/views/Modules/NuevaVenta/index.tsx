import { useNavigate } from 'react-router-dom'
import styles from './nueva-venta.module.css'
import { ChangeEvent, useState } from 'react'
import { useAppDispatch } from '../../../../redux/store'
import { getCustomer } from '../../../../redux/reducers/auth/auth.reducer'

const NuevaVenta = () => {

    const dispatch = useAppDispatch();

    const [customer, setCustomer] = useState<string>('');

    const navigate = useNavigate();

    const goFacturation = () => {
        dispatch(getCustomer(customer));
        return navigate('/facturacion');
    }

    return (
        <div className={styles.newSale}>
            <div className={styles.content__wrappernewSale}>
                <div className={styles.img__newSale}>
                    {/* <img src={nuevaVenta} alt="nueva venta" /> */}
                </div>
                <div>
                    <h6>Escriba el nombre del cliente, para una nueva venta</h6>
                </div>
                <div className={styles.input__newSale}>
                    <input onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomer(e.target.value)} placeholder='Ejemplo: Diego Ortega' type="text" />
                </div>
                <div className={styles.buttons__newSale}>
                    <button onClick={goFacturation}><p>Cancelar</p></button>
                    <button onClick={goFacturation}><p>Aceptar</p></button>
                </div>
            </div>
        </div>
    );
}

export default NuevaVenta;