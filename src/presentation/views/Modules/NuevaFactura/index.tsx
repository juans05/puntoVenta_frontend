import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./nuevaFactura.module.css";
import { getToken } from "../../../../helpers/auth-helpers";
import axiosInstance from "../../../../utils/axios";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import { RootState } from "../../../../redux/rootState";
import { IProductsState } from "../../../../redux/reducers/productos/interfaces";
import { getProducts } from "../../../../redux/reducers/Admin/productos/producto.reducer";
import { getPayMethods } from "../../../../redux/reducers/extensiones/extensiones..reducer";
import { IExtensionesState } from "../../../../redux/reducers/extensiones/interfaces";
import { ISalesState, ISaleProduct } from "../../../../redux/reducers/ventas/interfaces";
import {
  decrementProductInSale,
  deleteProductInSale,
  getProductsBySale,
  resetResponse,
  resetSale,
  saleProducts,
} from "../../../../redux/reducers/ventas/ventas.reducer";
import { ProductoPickerModal } from "./ProductoPickerModal";
import ModalLoadingPay from "../Facturacion/ModalLoadingPay";
import { printTable } from "../../../../helpers/functions/printTitle";
import { title } from "../../../../infraestructure/MData/MData";

type TipoDocumento = "boleta" | "factura" | "nota-venta";

const NuevaFactura = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { products }: IProductsState = useAppSelector((state: RootState) => state.products);
  const { payMethods }: IExtensionesState = useAppSelector((state: RootState) => state.extentions);
  const { productsBySale, message, code }: ISalesState = useAppSelector(
    (state: RootState) => state.sales
  );

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>("boleta");
  const [ruc, setRuc] = useState("");
  const [metodoPagoId, setMetodoPagoId] = useState<number>(0);
  const [fechaVenta, setFechaVenta] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [isOpenLoadingPay, setIsOpenLoadingPay] = useState(false);

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [clientesEncontrados, setClientesEncontrados] = useState<any[]>([]);

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
      return;
    }
    dispatch(resetSale());
    dispatch(getProducts(0, 0, "", 1, 100, undefined));
    dispatch(getPayMethods());
  }, []);

  useEffect(() => {
    printTable(`${title.name}::NUEVA FACTURA`);
  }, []);

  useEffect(() => {
    if (message === "") return;
    if (code === 1) {
      toast.success(message);
      setTimeout(() => dispatch(resetResponse()), 1000);
    }
    if (code === 100) {
      setEnviando(false);
      setIsOpenLoadingPay(false);
      toast.error(message);
      setTimeout(() => dispatch(resetResponse()), 1000);
    }
  }, [message, code]);

  const total = productsBySale.reduce(
    (acc, item: any) => acc + item.precio * item.cantidad,
    0
  );
  const subtotal = total / 1.18;
  const igv = total - subtotal;

  const agregarProductos = (seleccionados: any[]) => {
    seleccionados.forEach((p) => dispatch(getProductsBySale(p) as any));
    if (seleccionados.length > 0) {
      toast.success(`${seleccionados.length} producto(s) agregado(s)`);
    }
  };

  const restar = (item: any) => dispatch(decrementProductInSale(item) as any);
  const sumar = (item: any) => dispatch(getProductsBySale(item) as any);
  const eliminar = (productoId: number) => dispatch(deleteProductInSale(productoId) as any);

  const seleccionarCliente = (c: any) => {
    setNombre(c?.nombre ?? "");
    setApellido("");
    setDni(c?.numeroDocumento ?? "");
    setClientesEncontrados([]);
    setTerminoBusqueda("");
  };

  const buscarCliente = async () => {
    const termino = terminoBusqueda.trim();
    if (termino.length < 3) {
      return toast.error("Escribe al menos 3 caracteres (DNI o nombre)");
    }
    setBuscando(true);
    try {
      const { data }: any = await axiosInstance.get(`/clientes/listar?value=${termino}&Amount=20`);
      const items = data?.data?.items ?? [];
      setClientesEncontrados(items);
      if (items.length === 0) toast.error("No se encontró el cliente, complétalo manualmente");
      if (items.length === 1) seleccionarCliente(items[0]);
    } catch {
      toast.error("Error al buscar cliente");
      setClientesEncontrados([]);
    } finally {
      setBuscando(false);
    }
  };

  const metodoPagoSeleccionado = (payMethods as any[])?.find((m) => m.id === metodoPagoId);

  const tipoDocumentoVentaId = tipoDocumento === "boleta" ? 2 : tipoDocumento === "factura" ? 1 : 3;

  const generarFactura = () => {
    if (nombre.trim() === "" || apellido.trim() === "") {
      return toast.error("El nombre y apellido del cliente son obligatorios");
    }
    if (dni.trim().length !== 8) {
      return toast.error("El DNI debe tener 8 dígitos");
    }
    if (tipoDocumento === "factura" && ruc.trim().length !== 11) {
      return toast.error("El RUC debe tener 11 dígitos");
    }
    if (productsBySale.length === 0) {
      return toast.error("Agrega al menos un producto");
    }
    if (metodoPagoId === 0) {
      return toast.error("Elige un método de pago");
    }

    const payload: ISaleProduct = {
      clientId: null,
      tipoDocumentoVentaId,
      numeroDocumento: tipoDocumento === "factura" ? ruc : dni,
      razonSocial: `${nombre.trim()} ${apellido.trim()}`.trim(),
      ruc: tipoDocumento === "factura" ? ruc : "",
      efectivo: metodoPagoSeleccionado?.value?.toUpperCase() || "",
      tipoVenta: tipoDocumento,
      total,
      fechaVenta,
      esEcommerce: false,
      tipoEnvio: "LOCAL",
      distrito: "",
      detalleComprobante: productsBySale.map((item: any) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        valorUnitario: item.precio,
      })),
      detallePago: [
        {
          metodoPagoId,
          monto: total,
          referenciaOperacion: "",
        },
      ],
    };

    setEnviando(true);
    setIsOpenLoadingPay(true);
    dispatch(saleProducts(payload) as any);
  };

  const limpiar = () => {
    setNombre("");
    setApellido("");
    setDni("");
    setTipoDocumento("boleta");
    setRuc("");
    setMetodoPagoId(0);
    setClientesEncontrados([]);
    setTerminoBusqueda("");
    dispatch(resetSale());
  };

  return (
    <div>
      <Toaster richColors position="top-right" />
      <div className={styles.header}>
        <h3>Nueva Factura</h3>
        <button type="button" className={styles.newBtn} onClick={() => setIsPickerOpen(true)}>
          <Icon icon="mdi:plus" /> Agregar productos
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h4>Cliente</h4>

          <div className={styles.buscarClienteRow}>
            <input
              placeholder="Buscar por DNI o nombre..."
              value={terminoBusqueda}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTerminoBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscarCliente()}
            />
            <button type="button" className={styles.searchBtn} onClick={buscarCliente} disabled={buscando}>
              <Icon icon="iconamoon:search-bold" /> {buscando ? "Buscando..." : "Buscar cliente"}
            </button>
          </div>

          {clientesEncontrados.length > 1 && (
            <div className={styles.clientesEncontrados}>
              <p>Se encontraron {clientesEncontrados.length} clientes, selecciona uno:</p>
              {clientesEncontrados.map((c: any) => (
                <div key={c.id} className={styles.clienteRow}>
                  <span>
                    {c.nombre} · {c.numeroDocumento}
                  </span>
                  <button type="button" onClick={() => seleccionarCliente(c)}>
                    Seleccionar
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.formGrid}>
            <div>
              <label>Nombre</label>
              <input value={nombre} onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} />
            </div>
            <div>
              <label>Apellido</label>
              <input value={apellido} onChange={(e: ChangeEvent<HTMLInputElement>) => setApellido(e.target.value)} />
            </div>
            <div>
              <label>DNI</label>
              <input
                value={dni}
                maxLength={8}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDni(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
            <div>
              <label>Fecha</label>
              <input
                type="date"
                value={fechaVenta}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaVenta(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h4>Tipo de documento</h4>
          <div className={styles.tipoDocumentoRow}>
            <label>
              <input
                type="radio"
                checked={tipoDocumento === "boleta"}
                onChange={() => setTipoDocumento("boleta")}
              />
              Boleta
            </label>
            <label>
              <input
                type="radio"
                checked={tipoDocumento === "factura"}
                onChange={() => setTipoDocumento("factura")}
              />
              Factura
            </label>
            <label>
              <input
                type="radio"
                checked={tipoDocumento === "nota-venta"}
                onChange={() => setTipoDocumento("nota-venta")}
              />
              Nota de venta
            </label>
          </div>
          {tipoDocumento === "factura" && (
            <div className={styles.rucField}>
              <label>RUC</label>
              <input
                value={ruc}
                maxLength={11}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRuc(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.productosHeader}>
            <h4>Productos</h4>
            <button type="button" className={styles.addBtn} onClick={() => setIsPickerOpen(true)}>
              <Icon icon="mdi:plus" /> Agregar productos
            </button>
          </div>

          {productsBySale.length === 0 ? (
            <p className={styles.empty}>Aún no agregaste productos.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>P. Unit.</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {productsBySale.map((item: any) => (
                    <tr key={item.productoId}>
                      <td data-label="Producto">{item.nombre}</td>
                      <td data-label="Cantidad">
                        <div className={styles.qtyControl}>
                          <button type="button" onClick={() => restar(item)}>-</button>
                          <span>{item.cantidad}</span>
                          <button type="button" onClick={() => sumar(item)}>+</button>
                        </div>
                      </td>
                      <td data-label="P. Unit.">S/ {Number(item.precio).toFixed(2)}</td>
                      <td data-label="Subtotal">S/ {Number(item.precio * item.cantidad).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => eliminar(item.productoId)}
                        >
                          <Icon icon="mdi:trash-can-outline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h4>Método de pago</h4>
          <select
            className={styles.select}
            value={metodoPagoId}
            onChange={(e) => setMetodoPagoId(Number(e.target.value))}
          >
            <option value={0}>Selecciona un método de pago</option>
            {(payMethods as any[])?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.value}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.section}>
          <div className={styles.totalesRow}>
            <span>Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.totalesRow}>
            <span>IGV (18%)</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
          <div className={`${styles.totalesRow} ${styles.totalesRowFinal}`}>
            <span>Total</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.buttons}>
          <button type="button" className={styles.cancel} onClick={limpiar}>
            Limpiar
          </button>
          <button type="button" className={styles.submit} disabled={enviando} onClick={generarFactura}>
            {enviando ? "Generando..." : "Generar factura"}
          </button>
        </div>
      </div>

      <ProductoPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        products={products}
        onAgregar={agregarProductos}
      />
      {isOpenLoadingPay && code === 1 && <ModalLoadingPay setIsOpenLoadingPay={setIsOpenLoadingPay} />}
    </div>
  );
};

export default NuevaFactura;
