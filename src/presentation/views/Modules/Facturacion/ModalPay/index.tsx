import { ChangeEvent, Dispatch } from "react";
import styles from "../facturacion.module.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Input from "../../../../../components/Input";
import { Toaster, toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import {
  getClients,
  getDni,
  getTurnedBilling,
  resetResponse,
  saleProducts,
  saveClient,
  updateClient,
} from "../../../../../redux/reducers/ventas/ventas.reducer";
import {
  ISaleProduct,
  ISalesState,
} from "../../../../../redux/reducers/ventas/interfaces";
import { RootState } from "../../../../../redux/rootState";
import { IExtensionesState } from "../../../../../redux/reducers/extensiones/interfaces";
import SelectPro from "../../../../../components/SelectPro";
import {
  getCustomer,
  resetCustomer,
} from "../../../../../redux/reducers/auth/auth.reducer";
import { Calendar } from "../../../../../components/Date";
import SelectUbigeo from "../../../../../components/SelectPro/SelectUbigeo";
import { getAllUbigeos } from "../../../../../redux/reducers/extensiones/extensiones..reducer";
import Swicth from "./Switch";

interface IProps {
  onClose: Dispatch<boolean | any>;
  isOpen: boolean;
  setIsOpenLoadingPay: Dispatch<boolean>;
  setIsIgv: Dispatch<boolean>;
  isIgv: boolean;
}

interface IOption {
  id: number;
  value: string;
}

export interface IClient {
  id?: number;
  index?: number;
  tipoDocumentoId: number;
  nombre: any;
  numeroDocumento: string;
  direccion: string;
  sexo: string;
  fechaNacimiento: string;
  ubigeo: string;
  telefono: string;
  email: string;
  ubigeoId: number;
}

const initialForm: ISaleProduct = {
  detalleComprobante: [],
  detallePago: [
    {
      metodoPagoId: 0,
      monto: 0,
      referenciaOperacion: "",
    },
  ],
  tipoVenta: "",
  ruc: "",
  efectivo: "",
  razonSocial: "",
  numeroDocumento: "",
  tipoDocumentoVentaId: 1,
  total: 0,
  clientId: null,
  esEcommerce: false,
  tipoEnvio: "LOCAL",
  distrito: "",
};

const formClient: IClient = {
  id: 0,
  tipoDocumentoId: 1,
  telefono: "",
  nombre: "",
  numeroDocumento: "",
  direccion: "",
  email: "",
  fechaNacimiento: "",
  sexo: "",
  ubigeo: "",
  ubigeoId: 260101,
};

const ModalPay = ({ onClose, setIsOpenLoadingPay, setIsIgv }: IProps) => {
  const dispatch: any = useAppDispatch();

  const { productsBySale, clientes, code, cliente }: ISalesState =
    useAppSelector((state: RootState) => state.sales);
  const { payMethods, ubigeos }: IExtensionesState = useAppSelector(
    (state: RootState) => state.extentions
  );

  const [formCliente, setFormCliente] = useState(formClient);
  const [payMethod, setMethodPay] = useState<number>(0);
  const [vuelto, setVuelto] = useState<string | number>(0);
  const [pago, setPago] = useState<number>(0);
  const [referenciaOperacion, setReferenciaOperacion] = useState<string>("");
  const [activeBilling, setActiveBilling] = useState<string>("boleta");
  const [formValues, setFormValues] = useState(initialForm);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [withClient, setWithClient] = useState<boolean>(false);
  const [searchDni, setSearchDni] = useState<any>("");

  useEffect(() => {
    if (cliente?.id !== 0) {
      dispatch(getCustomer(cliente?.nombre));
    }
  }, [cliente]);

  let total = 0;

  for (const producto of productsBySale) {
    total += producto.precio * producto.cantidad;
  }

  const documents = [{ id: 1, value: "DNI" }];

  const sex = [
    { id: 1, value: "MASCULINO" },
    { id: 2, value: "FEMENINO" },
  ];

  useEffect(() => {
    dispatch(getAllUbigeos());
  }, []);

  useEffect(() => {
    if (payMethod === 4 && activeBilling === "boleta") {
      setFormValues({
        ...formValues,
        razonSocial: clientes[0]?.nombre,
      });
    }
    if (payMethod === 3 && activeBilling === "boleta") {
      setFormValues({
        ...formValues,
        razonSocial: clientes[0]?.nombre,
      });
    }
    if (payMethod === 1 && activeBilling === "boleta") {
      setFormValues({
        ...formValues,
        razonSocial: clientes[0]?.nombre,
      });
    }
    if (clientes[0]?.nombre === undefined && activeBilling === "boleta") {
      setFormValues({
        ...formValues,
        razonSocial: "",
      });
    }
  }, [activeBilling, payMethod]);

  useEffect(() => {
    if (productsBySale?.length > 0) {
      const detalleCliente: any = productsBySale?.map((item: any) => ({
        productoId: item?.productoId,
        valorUnitario: item?.precio,
        cantidad: item?.cantidad,
      }));

      setFormValues({
        ...formValues,
        detalleComprobante: detalleCliente,
      });
    }
  }, [productsBySale]);

  useEffect(() => {
    if (
      (payMethod === 1 && activeBilling === "boleta") ||
      (payMethod === 2 && activeBilling === "boleta") ||
      (payMethod === 2 && activeBilling === "factura")
    ) {
      setIsIgv(true);
    }
  }, [activeBilling, payMethod]);

  const handleCheckedMethodPay = (method: number) => {
    setMethodPay(method);
  };

  const chooseBilling = (billing: string) => {
    if (billing === "boleta" || billing === "factura") {
      setIsIgv(true);
    } else {
      setIsIgv(false);
    }
    setActiveBilling(billing);
    setFormValues({
      ...formValues,
      tipoDocumentoVentaId: billing === "boleta" ? 2 : 1,
    });
  };

  const next = () => {
    if (activeBilling === "factura" && payMethod === 1) {
      if (formValues?.razonSocial === "") {
        return toast.error("Debes agregar la razon social");
      }
      if (formValues?.ruc === "") {
        return toast.error("Debes agregar un numero de documento");
      }
      if (formValues?.ruc.length !== 11) {
        return toast.error("El ruc debe tener 11 números");
      }
    }
    if (
      (activeBilling === "factura" && payMethod === 3) ||
      (activeBilling === "factura" && payMethod === 4)
    ) {
      if (formValues?.razonSocial === "") {
        return toast.error("Debes agregar la razon social");
      }
      if (formValues?.ruc === "") {
        return toast.error("Debes agregar un numero de documento");
      }
      if (formValues?.ruc.length !== 11) {
        return toast.error("El ruc debe tener 11 números");
      }
    }
    if (activeBilling === "") {
      return toast.error("Elegir un tipo de venta");
    }
    if (activeBilling === "factura" && payMethod === 2) {
      if (formValues?.razonSocial === "") {
        return toast.error("Debes agregar la razon social");
      }
      if (formValues?.ruc === "") {
        return toast.error("Debes agregar un numero de documento");
      }
      if (formValues?.ruc.length !== 11) {
        return toast.error("El ruc debe tener 11 números");
      }
    }
    dispatch(getDni(activeBilling === "boleta" ? searchDni : formValues?.ruc));
    if (payMethod === 3 || payMethod === 4) {
      setIsOpenLoadingPay(true);
      setActiveBilling("");
      return dispatch(
        saleProducts({
          ...formValues,
          numeroDocumento:
            activeBilling === "boleta" ? searchDni : formValues?.ruc,
          tipoDocumentoVentaId: activeBilling === "boleta" ? 2 : 1,
          efectivo: payMethod === 3 ? "YAPE" : "PLIN",
          tipoVenta: activeBilling,
          total: total,
          detallePago: [
            {
              metodoPagoId: payMethod,
              monto: total,
              referenciaOperacion: "",
            },
          ],
        })
      );
    }

    if (payMethod === 2 || payMethod === 6) {
      if (referenciaOperacion === "") {
        return toast.error("Debes agregar una referencia válida de operación");
      }
      setIsOpenLoadingPay(true);
      setActiveBilling("");
      dispatch(
        saleProducts({
          ...formValues,
          efectivo: "VISA",
          numeroDocumento:
            activeBilling === "boleta" ? searchDni : formValues?.ruc,
          tipoDocumentoVentaId: activeBilling === "boleta" ? 2 : 1,
          tipoVenta: activeBilling,
          total: total,
          detalleComprobante: formValues.detalleComprobante?.map(
            (item: any) => ({
              ...item,
              valorUnitario: Number(item?.valorUnitario?.toFixed(2)),
            })
          ),
          detallePago: [
            {
              metodoPagoId: payMethod,
              monto: total,
              referenciaOperacion: referenciaOperacion,
            },
          ],
        })
      );
    } else {
      if (Number(pago) >= total) {
        if (payMethod !== 0) {
          setActiveBilling("");
          setIsOpenLoadingPay(true);
          dispatch(
            saleProducts({
              ...formValues,
              tipoVenta: activeBilling,
              numeroDocumento:
                activeBilling === "boleta" ? searchDni : formValues?.ruc,
              tipoDocumentoVentaId: activeBilling === "boleta" ? 2 : 1,
              total: total,
              efectivo: "SOLES",
              detallePago: formValues?.detallePago?.map((item: any) => ({
                ...item,
                monto: total,
              })),
            })
          );
          dispatch(getTurnedBilling(Number(vuelto)));
        } else {
          return toast.error("Elegir un metodo de pago");
        }
      } else {
        return toast.error("El monto del pago debe ser mayor al total a pagar");
      }
    }
  };

  const handleChangeFactura = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const Factura = (e: ChangeEvent<HTMLInputElement>) => {
    const detallePago = {
      metodoPagoId: Number(payMethod),
      monto: Number(total),
      referenciaOperacion: referenciaOperacion,
    };

    setFormValues({
      ...formValues,
      detallePago: [detallePago],
    });
    setPago(Number(e.target.value));
    const vueltoConfirmado = Number(e.target.value) >= Number(total);
    // @ts-ignore
    setVuelto(
      vueltoConfirmado
        ? `S/ ${Number(Number(e.target.value) - Number(total)).toFixed(2)}`
        : "Pago insuficiente"
    );
  };

  const disabled = payMethod !== 0 ? false : true;

  const handleSelectInput = (
    _idValue: any,
    _value: string,
    _name: string,
    id: any
  ) => {
    setFormCliente({
      ...formCliente,
      [id]: _value,
    });
  };

  const handleSelectUbigeo = (
    _idValue: any,
    _value: string,
    _name: string,
    id: any
  ) => {
    setFormCliente({
      ...formCliente,
      ubigeo: _value,
      [id]: Number(_idValue),
    });
  };

  useEffect(() => {
    if (searchDni !== "" && clientes?.length > 0) {
      dispatch(getCustomer(clientes[0]?.nombre));
      setFormCliente(clientes[0]);
      setFormValues({
        ...formValues,
        clientId: clientes[0].id,
      });
      if (payMethod === 1 && activeBilling === "boleta") {
        setFormValues({
          ...formValues,
          razonSocial: clientes[0]?.nombre,
        });
      } else
        setFormValues({
          ...formValues,
          razonSocial: "",
        });
    }
    if (clientes?.length === 0) {
      setFormCliente({
        ...formCliente,
        numeroDocumento: searchDni,
      });
    }
  }, [clientes]);

  console.log(formValues);
  console.log(formCliente);
  console.log(payMethod);

  const searchClient = () => {
    setIsNew(true);
    if (searchDni.length === 8) {
      dispatch(getClients(searchDni));
    }
  };

  const onChangeClient = (e: ChangeEvent<HTMLInputElement>) => {
    setFormCliente({
      ...formCliente,
      [e.target.name]: e.target.value,
    });
  };

  const saveClientNew = () => {
    if (formCliente?.nombre === "") {
      return toast.error("Los nombres y apellidos son obligatorios");
    }
    if (formCliente?.sexo === "") {
      return toast.error("El genero es obligatorio");
    }
    if (
      Number(formCliente?.tipoDocumentoId) === 1 &&
      formCliente?.numeroDocumento.length !== 8
    ) {
      return toast.error("El dni debe tener 8 numeros");
    }
    if (formCliente.numeroDocumento === "") {
      return toast.error("El numero de documento es obligatorio");
    }

    if (formCliente.id === 0) {
      dispatch(
        saveClient({
          ...formCliente,
          sexo: formCliente?.sexo === "MASCULINO" ? "M" : "F",
        })
      );
    } else {
      dispatch(
        updateClient({
          ...formCliente,
          clienteId: formCliente?.id,
          fechaNacimiento: formCliente?.fechaNacimiento,
          sexo: formCliente?.sexo === "MASCULINO" ? "M" : "F",
        })
      );
    }
  };

  const handleDate = (date: any) => {
    setFormCliente({
      ...formCliente,
      fechaNacimiento: date,
    });
  };

  useEffect(() => {
    if (code === 1) {
      setSearchDni(formCliente?.numeroDocumento);
      setFormCliente(formClient);
      setIsNew(false);
    }
  }, [code]);

  const back = () => {
    setIsNew(false);
    setFormCliente(formCliente);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsNew(true);
      if (searchDni.length === 8) {
        dispatch(getClients(searchDni));
        dispatch(getDni(searchDni));
      }
    }
  };

  useEffect(() => {
    if (withClient === false) {
      dispatch(resetCustomer());
      setFormCliente(formClient);
      setSearchDni("");
      dispatch(resetResponse());
    } else {
      setIsNew(false);
      back();
    }
  }, [withClient]);

  console.log(isNew);

  return (
    <div className={styles.wrapper__payMethod}>
      <Toaster richColors position="top-right" />
      <motion.div
        animate={{ y: 0 }}
        initial={{ y: -30 }}
        className={styles.modal__payMethod}
      >
        <div>
          <div className={styles.header__payMethod}>
            <div>
              <Icon
                onClick={onClose}
                icon="iconamoon:close-duotone"
                color="#47525E"
                width={25}
              />
            </div>
            <h5>Métodos de pago</h5>
            <p>Ingrese el dni del cliente o cree uno nuevo para la venta</p>
          </div>
          <Swicth
            withClient={withClient}
            setWithClient={setWithClient}
            back={back}
          />
          <div className={styles.body__payMethod}>
            {withClient && !isNew && (
              <div className={styles.client__option}>
                <div className="mb-3">
                  <Input
                    name="dni"
                    value={searchDni}
                    onKeyDown={handleKeyDown}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSearchDni(e.target.value)
                    }
                    isLabel
                    label="Ingrese el dni"
                  />
                </div>
                <div>
                  <button
                    onClick={searchClient}
                    className="bg-brand-500 hover:bg-brand-600 transition-colors mt-7 w-full rounded-md p-2 px-5 text-sm text-white"
                  >
                    Buscar cliente
                  </button>
                </div>
              </div>
            )}
            <div className={styles.grid__cardMethodPay}>
              {isNew && (
                <>
                  <div>
                    <SelectPro
                      onChange={handleSelectInput}
                      options={documents}
                      defaultValue={
                        formCliente?.tipoDocumentoId === 1 ? "DNI" : "RUC"
                      }
                      isLabel
                      id="tipoDocumentoId"
                      label="Tipo de documento"
                      isSearch
                    />
                  </div>
                  <div>
                    <Input
                      onChange={onChangeClient}
                      value={formCliente?.numeroDocumento}
                      name="numeroDocumento"
                      isLabel
                      label="Numero de documento"
                    />
                  </div>
                  <div>
                    <Input
                      onChange={onChangeClient}
                      value={formCliente?.nombre}
                      name="nombre"
                      isLabel
                      label="Nombres y apellidos"
                    />
                  </div>
                  <div>
                    <Input
                      onChange={onChangeClient}
                      value={formCliente?.direccion}
                      name="direccion"
                      isLabel
                      label="Direccion"
                    />
                  </div>
                  <div>
                    <Calendar
                      defaultValue={formCliente.fechaNacimiento}
                      onChange={handleDate}
                      text="Fecha Nacimiento"
                    />
                  </div>
                  <div>
                    <Input
                      onChange={onChangeClient}
                      value={formCliente?.telefono}
                      name="telefono"
                      isLabel
                      label="Telefono"
                    />
                  </div>
                  <div>
                    <Input
                      onChange={onChangeClient}
                      value={formCliente?.email}
                      name="email"
                      isLabel
                      label="Email"
                    />
                  </div>
                  <div>
                    <SelectPro
                      onChange={handleSelectInput}
                      options={sex}
                      defaultValue={formCliente?.sexo}
                      isLabel
                      name="sexo"
                      id="sexo"
                      label="Sexo"
                      isSearch
                    />
                  </div>
                  <div>
                    <SelectUbigeo
                      onChange={handleSelectUbigeo}
                      options={ubigeos}
                      defaultValue={
                        formCliente?.ubigeo !== null
                          ? formCliente?.ubigeo
                          : "SIN ESPECIFICAR"
                      }
                      isLabel
                      name="ubigeo"
                      id="ubigeoId"
                      label="Ubigeo"
                      isSearch
                    />
                  </div>
                </>
              )}
            </div>
            <div className={styles.wrapper__contentPays}>
              {!isNew &&
                payMethods?.map((item: IOption) => (
                  <div
                    key={item?.id}
                    className={styles.card__methodPay}
                    onClick={() => handleCheckedMethodPay(item.id)}
                  >
                    <div
                      className={
                        payMethod === item?.id ? styles.active__payment : ""
                      }
                    >
                      <div>
                        <div>
                          <input
                            type="radio"
                            value="1"
                            checked={payMethod === item.id && true}
                            onChange={() => undefined}
                          />
                          {item?.id === 1 || item?.id === 7 ? (
                            <Icon
                              icon="mingcute:receive-money-fill"
                              color="#59CF64"
                              width={85}
                            />
                          ) : (item?.id === 2 || item?.id === 6)  ? (
                            <Icon icon="logos:visa" width={120} height={80} />
                          ) : (item?.id === 3 ) ? (
                            <img
                              width={60}
                              src="https://peruconnection.com.pe/wp-content/uploads/2021/11/9877sd.png"
                            />
                          ) : item?.id === 4 ? (
                            <img
                              width={85}
                              src="https://seeklogo.com/images/P/plin-logo-0C4106153C-seeklogo.com.png"
                            />
                          ) : item?.id === 5 ? (
                            <img
                              style={{ textAlign: "center", margin: "0 auto" }}
                              width={105}
                              src="https://img.freepik.com/vector-gratis/mano-sujetando-telefono-servicio-billetera-digital-enviando-dinero-transaccion-pago-o-transferencia-traves-ilustracion-plana-aplicacion-movil_74855-20589.jpg?w=2000"
                            />
                          ) : (
                            ""
                          )}
                          <p>{item?.value}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {!isNew && (
              //  payMethod !== 0 && !isNew && (
              <div className={styles.chooseBilling}>
                <div>
                  <button
                    className={activeBilling === "boleta" ? styles.active : ""}
                    onClick={() => chooseBilling("boleta")}
                  >
                    Boleta
                  </button>
                </div>
                <div>
                  <button
                    className={activeBilling === "factura" ? styles.active : ""}
                    onClick={() => chooseBilling("factura")}
                  >
                    Factura
                  </button>
                </div>
                <div>
                  <button
                    disabled
                    className={
                      activeBilling === "nota-credito" ? styles.active : ""
                    }
                    onClick={() => chooseBilling("nota-credito")}
                  >
                    Nota de crédito
                  </button>
                </div>
              </div>
            )}

            {!isNew && (
              <div className="mt-4 mb-4 p-4 border border-neutral-200 rounded-lg bg-neutral-50 shadow-sm">
                <div className="flex items-center justify-between">
                  <label htmlFor="esEcommerce" className="text-sm font-semibold text-neutral-700 cursor-pointer select-none">
                    ¿Es venta de Ecommerce?
                  </label>
                  <input
                    id="esEcommerce"
                    type="checkbox"
                    checked={formValues.esEcommerce}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormValues({
                        ...formValues,
                        esEcommerce: e.target.checked
                      });
                    }}
                    className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500 cursor-pointer"
                  />
                </div>

                {formValues.esEcommerce && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-neutral-200">
                    <div>
                      <SelectPro
                        onChange={(_idValue: any, value: string) => {
                          setFormValues({
                            ...formValues,
                            tipoEnvio: value
                          });
                        }}
                        options={[
                          { id: 1, value: "LOCAL" },
                          { id: 2, value: "PROVINCIA" }
                        ]}
                        defaultValue={formValues.tipoEnvio || "LOCAL"}
                        isLabel
                        id="tipoEnvio"
                        label="Tipo de envío"
                      />
                    </div>
                    <div>
                      <Input
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setFormValues({
                            ...formValues,
                            distrito: e.target.value
                          });
                        }}
                        value={formValues.distrito || ""}
                        name="distrito"
                        isLabel
                        label="Distrito"
                        autocomplete="off"
                        placeholder="Ej: Miraflores"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeBilling === "factura" && !isNew && (payMethod === 2  || payMethod === 6 || payMethod === 5 )&& (
              <div className={styles.body__payMethod__billingActive}>
                <div className="mb-3">
                  <Input
                    onChange={handleChangeFactura}
                    name="razonSocial"
                    isLabel
                    label="Razón social"
                    autocomplete="off"
                  />
                </div>
                <div className="mb-3">
                  <Input
                    onChange={handleChangeFactura}
                    name="ruc"
                    isLabel
                    label="Ruc"
                    autocomplete="off"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    autocomplete="off"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setReferenciaOperacion(e.target.value)
                    }
                    name="referenciaOperacion"
                    isLabel
                    label="Rerefencia de operación"
                  />
                </div>
              </div>
            )}

            {((activeBilling === "factura" && !isNew && payMethod === 3) ||
              (activeBilling === "factura" && !isNew && payMethod === 4)) && (
              <div className={styles.body__payMethod__billingActivePlinYape}>
                <div className="mb-3">
                  <Input
                    onChange={handleChangeFactura}
                    name="razonSocial"
                    isLabel
                    label="Razón social"
                    autocomplete="off"
                  />
                </div>
                <div className="mb-3">
                  <Input
                    onChange={handleChangeFactura}
                    name="ruc"
                    isLabel
                    label="Ruc"
                    autocomplete="off"
                  />
                </div>
              </div>
            )}

            {activeBilling === "boleta" && !isNew && (
              <>
                <div className={styles.body__payMethod__billingActive}>
                  {(payMethod === 2 || payMethod === 6 || payMethod === 5 ) && (
                    <>
                      <div>
                        <Input
                          type="number"
                          autocomplete="off"
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setReferenciaOperacion(e.target.value)
                          }
                          name="referenciaOperacion"
                          isLabel
                          label="Rerefencia de operación"
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            { ( payMethod === 1 || payMethod === 7 ) && withClient && !isNew ? (
              <div className={styles.form__payMethod}>
                <>
                  {withClient && activeBilling === "boleta" ? (
                    <div className="">
                      <Input
                        disabled
                        onChange={handleChangeFactura}
                        name="razonSocial"
                        defaultValue={clientes[0]?.nombre || ""}
                        isLabel
                        label="Nombres completos"
                        autocomplete="off"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="">
                        <Input
                          onChange={handleChangeFactura}
                          name="razonSocial"
                          isLabel
                          label="Razon social"
                          autocomplete="off"
                        />
                      </div>
                      <div className="mb-3">
                        <Input
                          onChange={handleChangeFactura}
                          name="ruc"
                          isLabel
                          label="Ruc"
                          autocomplete="off"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Input
                      type="number"
                      onChange={Factura}
                      name="monto"
                      isLabel
                      label="Monto pagado"
                    />
                  </div>
                  <div>
                    <Input
                      disabled
                      value={vuelto}
                      onChange={() => undefined}
                      name="monto"
                      isLabel
                      label="Vuelto"
                    />
                  </div>
                </>
              </div>
            ) : (
              <>
                {!isNew && ( payMethod === 1 || payMethod === 7 ) && (
                  <div className={styles.form__payMethod}>
                    <>
                      {activeBilling === "factura" ? (
                        <>
                          <div className="">
                            <Input
                              onChange={handleChangeFactura}
                              name="razonSocial"
                              isLabel
                              label="Razon social"
                              autocomplete="off"
                            />
                          </div>
                          <div className="mb-3">
                            <Input
                              onChange={handleChangeFactura}
                              name="ruc"
                              isLabel
                              label="Ruc"
                              autocomplete="off"
                            />
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                      <div>
                        <Input
                          type="number"
                          onChange={Factura}
                          name="monto"
                          isLabel
                          label="Monto pagado"
                        />
                      </div>
                      <div>
                        <Input
                          disabled
                          value={vuelto}
                          onChange={() => undefined}
                          name="monto"
                          isLabel
                          label="Vuelto"
                        />
                      </div>
                    </>
                  </div>
                )}
              </>
            )}
            {isNew ? (
              <div className={styles.buttons__options}>
                <button
                  onClick={saveClientNew}
                  className="bg-brand-500 hover:bg-brand-600 transition-colors mt-6 w-full rounded-md p-2 px-5 text-white"
                >
                  {clientes?.length === 0 ? "Agregar" : "Editar"}
                </button>
                <button
                  onClick={back}
                  className="bg-white border border-neutral-300 text-ink-900 hover:bg-neutral-50 transition-colors mt-6 w-full rounded-md p-2 px-5"
                >
                  Regresar
                </button>
              </div>
            ) : (
              <button
                disabled={
                  disabled || (withClient === true && clientes.length === 0)
                }
                onClick={next}
                className="mt-8 bg-brand-500 hover:bg-brand-600 transition-colors w-full rounded-md p-3 text-white"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModalPay;
