import { Icon } from '@iconify/react/dist/iconify.js';
import styles from '../facturacion.module.css'
import { motion } from 'framer-motion'

const ModalHistorialRetiros = ({ onClose }: any) => {

    let storage: any = localStorage.getItem('caja');
    storage = JSON.parse(storage)

    console.log(storage)

    const retiros = [...(storage?.retiros ?? [])].reverse();

    return (
        <div className={styles.wrapper__retiro}>
            <motion.div animate={{ y: 0 }} initial={{ y: -30 }} className={styles.modal__HistorialRetiro}>
                <div>
                    <div className={styles.header__retiro}>
                        <div>
                            <Icon onClick={onClose} icon="iconamoon:close-duotone" color="#47525E" width={25} />
                        </div>
                        <h5>Historial de retiros</h5>
                        <p>Conoce el resumen detallado de cada retiro</p>
                    </div>
                    <div className={styles.body__HistorialRetiro}>
                        <div>
                            {
                                retiros?.map((item: any, index: number) => {
                                    return (
                                        <div className={styles.card__mount} key={index}>
                                            <div>
                                                <Icon color='#6b57f0' width={60} icon="ant-design:dollar-outlined" />
                                            </div>
                                            <div className={styles.info__cardmount}>
                                                <div>
                                                    <strong>Motivo: </strong>
                                                    <p>{item?.motivo}</p>
                                                </div>
                                                <h4>S/ {Number(item?.monto ?? 0).toFixed(2)}</h4>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default ModalHistorialRetiros;