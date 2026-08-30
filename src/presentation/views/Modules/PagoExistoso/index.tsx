import SuccessPay from '../../../../assets/svg/successPay';
import styles from './pago-existoso.module.css'
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ISalesState } from '../../../../redux/reducers/ventas/interfaces';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { RootState } from '../../../../redux/rootState';
import { IProduct } from '../../../../redux/reducers/productos/interfaces';
import { resetClients, resetDni, resetResponse, resetSale } from '../../../../redux/reducers/ventas/ventas.reducer';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print'
import moment from 'moment';
import { useEffect } from 'react'
import { resetCustomer } from '../../../../redux/reducers/auth/auth.reducer';

const PagoExitoso = () => {

    const nowDay = moment(new Date()).format('DD/MM/YYYY HH:mm:ss');

    const [dimensions,] = useState({ width: 80, height: 297 });
    const { productsBySale, turned, tipoVenta, correlative, code,efectivo, numeroDocumento }: ISalesState = useAppSelector((state: RootState) => state.sales)
    const { me, customer }: any = useAppSelector((state: RootState) => state.auth)
    const navigate = useNavigate();
    const dispatch = useAppDispatch()

    const newSale = () => {
        dispatch(resetSale())
        dispatch(resetResponse())
        dispatch(resetDni())
        dispatch(resetClients());
        dispatch(resetCustomer())
        return navigate('/facturacion');
    }

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

    let total = 0;

    for(const producto of productsBySale) {
        total += producto.precio * producto.cantidad
    }

    useEffect(() => {
        if(code !== 1) {
            dispatch(resetSale())
            return navigate('/facturacion');
        }
    },[code])

    console.log(me)

    return (
        <div className={styles.pageSuccess__wrapper}>
            <div>
                <motion.div animate={{ y: 0, opacity: 1 }} initial={{ y: 80, opacity: 0.4 }} className={styles.info__printRecipt}>
                    <SuccessPay />
                    <button onClick={handlePrint} className="mt-2 bg-[#2997FE] w-full rounded-md p-3 text-cyan-50">Imprimir Recibo</button>
                    <button onClick={newSale} className="mt-5 bg-[#eff0f1] w-full rounded-md p-3 text-black-50">Nueva venta</button>
                </motion.div>
            </div>
            <div>
                <motion.div animate={{ y: 0, opacity: 1 }} initial={{ y: 80, opacity: 0.4 }}>
                    <div ref={componentRef} style={{ width: '330px' }}>
                        <div className={styles.bodySuccess__content}>
                            <div className={styles.headerSucces__Pay}>
                                <div>
                                    <p>SOLIS EGUIZABAL VENTURA</p>
                                </div>
                                <div>
                                    <label htmlFor="">RUC:</label>
                                    <p>10430936315</p>
                                </div>
                                <div>
                                    <p>JR César Vallejo 881 Los Olivos</p>
                                </div>
                            </div>
                            <div className={styles.sale__number}>
                                <div className={styles.divider}></div>
                                <div className={styles.header}>
                                    <h4>{tipoVenta}</h4>
                                    <p>{correlative}</p>
                                </div>
                                <div className={styles.divider}></div>
                            </div>

                            <div className={styles.bodySuccess__info}>
                                <div>
                                    <label htmlFor="">F. Emisión</label>
                                    <p>{nowDay}</p>
                                </div>
                                <div>
                                    <label htmlFor="">Cliente</label>
                                    <p>{customer ? customer : "VARIOS"}</p>
                                </div>
                                <div>
                                    <label htmlFor="">Doc.trib.no.dom.sin.ruc</label>
                                    <p>{numeroDocumento || 999999}</p>
                                </div>
                                <div>
                                    <label htmlFor="">Direccion</label>
                                    <p></p>
                                </div>
                                <div>
                                    <label htmlFor="">Vendedor</label>
                                    <p>{me?.nombre}</p>
                                </div>
                            </div>

                            <div className={styles.table__products}>
                                <table>
                                    <thead>

                                        <tr>
                                            <th>Cantidad</th>
                                            <th>Descripcion</th>
                                            <th>P.Unit</th>
                                            <th>Total</th>
                                        </tr>

                                    </thead>
                                    <tbody>
                                        {
                                            productsBySale?.map((item: IProduct) => (
                                                <tr key={item.nombre}>
                                                    <td>{item.cantidad}</td>
                                                    <td>{item.nombre}</td>

                                                    <td>
                                                        {Number(item.precio).toFixed(2)}</td>
                                                        <td>
                                                        {Number(item.precio * item.cantidad).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                                <div>
                                    <div className={styles.pay}>
                                        <div>
                                            <p><strong>Total a pagar:</strong>{Number(total).toFixed(2)}</p>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className={styles.footer_pay}>
                                <p><strong>EFECTIVO:</strong>{efectivo}</p>
                                <p><strong>PAGOS:</strong>{nowDay}-{efectivo === "VISA" ? 'TARJETA' : 'EFECTIVO'}-S/ {total || 0.00}</p>
                                <p><strong>SALDO:</strong>{turned}</p>
                            </div>

                            <div className={styles.about}>
                                <p>Gracias por su preferencia</p>
                                <p>Solis Salon SPA</p>
                                <p>Dios lo bendiga</p>
                            </div>
                            <div className={styles.note}>
                                ***** Por el décimo comprobante generado, llévate un premio sorpresa ****
                            </div>
                            <div className={styles.note}>
                                ***** Ven en tu cumpleaños y llevate un premio sorpresa ****
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default PagoExitoso;