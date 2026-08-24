import { Icon } from '@iconify/react/dist/iconify.js'
import styles from '../facturacion.module.css'
import { motion } from 'framer-motion'
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../../../redux/store';
import { RootState } from '../../../../../redux/rootState';
import report from '../../../../../assets/img/report.png'
import { cerrarReporte, obtenerMontoCaja } from '../../../../../redux/reducers/ventas/ventas.reducer';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ISalesState } from '../../../../../redux/reducers/ventas/interfaces';

const ModalReporte = () => {

    const dispatch = useAppDispatch();
    const { me } : any = useAppSelector((state: RootState) => state.auth)
    const { montosCaja } : ISalesState = useAppSelector((state: RootState) => state.sales)

    const onClose = () => {
        dispatch(cerrarReporte())
    }

    useEffect(() => {
        if(me?.userName !== undefined) {
            dispatch(obtenerMontoCaja(me?.userName))
        }
    },[me])

    console.log(montosCaja)

    const [dimensions,] = useState({ width: 80, height: 297 });
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef?.current,
        documentTitle: 'data',
        pageStyle: `@media print {
            @page {
              size: ${dimensions.width}mm ${dimensions.height}mm;
              margin: 0;
            }
          }`,
    })

    return (
        <div className={styles.wrapper__caja}>
            <motion.div animate={{ y: 0 }} initial={{ y: -30 }} className={styles.modal__historial}>
                <div className={styles.report__content}>
                    <div className={styles.header__historial}>
                        <div>
                            <Icon onClick={onClose} icon="iconamoon:close-duotone" color="#47525E" width={25} />
                        </div>
                        <h5>Reporte del cierre de caja</h5>
                        <p>Este es el reporte al finalizar su caja</p>
                    </div>
                    <div className={styles.report__wrapper}>
                        <div>
                            <img width={130} src={report} alt="" />
                        </div>
                        <div>
                            <div ref={componentRef} className={styles.body__report}>
                            <div className={styles.header__report}>
                                <h4>Cierre de caja</h4>
                           
                            </div>
                                <div>
                                    <label htmlFor="">Fecha:</label>
                                    <p><p>{moment(new Date()).format('DD/MM/YYYY HH:mm:ss')}</p></p>
                                </div>
                                <div>
                                    <label htmlFor="">Usuario:</label>
                                    <p>{me?.userName}</p>
                                </div>
                                <div>
                                    <label htmlFor="">Monto Inicio:</label>
                                    <p>{montosCaja?.montoInicio || 0}</p>
                                </div>
                                <div>
                                    <label htmlFor="">Total Efectivo:</label>
                                    <p>{montosCaja?.montoEfectivo || 0}</p>
                                </div>
                                <div>
                                    <label htmlFor="">Total Tarjeta:</label>
                                    <p>{montosCaja?.montoTarjeta || 0}</p>
                                </div>
                                <div>
                                    <label htmlFor="">Total Yape:</label>
                                    <p>{montosCaja?.montoYape || 0}</p>
                                </div>
                                <div>
                                    <label htmlFor="">Monto Cierre:</label>
                                    <p>{montosCaja?.montoCierre || 0}</p>
                                </div>
                                <div>
                                    <label htmlFor="">Monto Retiros:</label>
                                    <p>{montosCaja?.montoRetiros || 0}</p>
                                </div>
                                <div>
                                    <label htmlFor="">Total:</label>
                                    <p>{montosCaja?.montoTotal || 0}</p>
                                </div>
                            </div>
                            <button onClick={handlePrint} className="mt-4 text-sm bg-brand-500 hover:bg-brand-600 transition-colors w-full rounded-md p-2 text-white">Imprimir reporte</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default ModalReporte;