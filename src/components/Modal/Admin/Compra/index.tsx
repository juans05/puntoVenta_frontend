import Modal from "react-modal";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "./compra.module.css";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import { RootState } from "../../../../redux/rootState";
import {
  actualizarCompra,
  crearCompra,
  getProductosCompra,
  getProveedores,
} from "../../../../redux/reducers/Admin/compras/compra.reducer";
import { getPayMethods } from "../../../../redux/reducers/extensiones/extensiones..reducer";
import axiosInstance from "../../../../utils/axios";
import Input from "../../../Input";
import SelectPro from "../../../SelectPro";
import { toast } from "sonner";

Modal.setAppElement("#root");

interface IDetalleLinea {
  productoId: number;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
}

const lineaVacia: IDetalleLinea = {
  productoId: 0,
  nombre: "",
  cantidad: 1,
  costoUnitario: 0,
};

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  compraId?: number;
}

// "dd/MM/yyyy HH:mm:ss" (formato del backend) -> "yyyy-MM-dd" (formato del input date)
const fechaDisplayAIso = (fechaDisplay: string): string => {
  const [datePart] = fechaDisplay.split(" ");
  const [d, m, y] = datePart.split("/");
  return `${y}-${m}-${d}`;
};

export const CompraModal = ({ isOpen, onClose, compraId }: IProps) => {
  const dispatch = useAppDispatch();
  const { proveedores, productosCompra }: any = useAppSelector(
    (state: RootState) => state.compras
  );
  const { payMethods }: any = useAppSelector((state: RootState) => state.extentions);

  const esEdicion = !!compraId;

  const [proveedorId, setProveedorId] = useState<number>(0);
  const [metodoPagoId, setMetodoPagoId] = useState<number>(0);
  const [observacion, setObservacion] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [detalle, setDetalle] = useState<IDetalleLinea[]>([{ ...lineaVacia }]);
  const [loading, setLoading] = useState(false);
  const [cargandoCompra, setCargandoCompra] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    dispatch(getProveedores() as any);
    dispatch(getProductosCompra() as any);
    dispatch(getPayMethods() as any);

    if (compraId) {
      setCargandoCompra(true);
      axiosInstance
        .get(`/compras/${compraId}`)
        .then(({ data }: any) => {
          const c = data?.data;
          setProveedorId(c?.proveedorId ?? 0);
          setMetodoPagoId(c?.metodoPagoId ?? 0);
          setObservacion(c?.observacion ?? "");
          setFecha(c?.fechaCompra ? fechaDisplayAIso(c.fechaCompra) : "");
          setDetalle(
            (c?.detalle ?? []).map((d: any) => ({
              productoId: d.productoId,
              nombre: d.producto ?? "",
              cantidad: d.cantidad,
              costoUnitario: d.costoUnitario,
            }))
          );
        })
        .catch(() => toast.error("No se pudo cargar la compra"))
        .finally(() => setCargandoCompra(false));
    } else {
      setProveedorId(0);
      setMetodoPagoId(0);
      setObservacion("");
      setFecha("");
      setDetalle([{ ...lineaVacia }]);
    }
  }, [isOpen, dispatch, compraId]);

  const proveedoresOptions = (proveedores ?? []).map((p: any) => ({
    id: p.proveedorId,
    value: p.nombre,
  }));

  const productosOptions = (productosCompra ?? []).map((p: any) => ({
    id: p.productoId,
    value: p.nombre,
  }));

  const proveedorSeleccionado =
    proveedoresOptions.find((p: any) => Number(p.id) === Number(proveedorId))?.value ?? "";

  const metodoPagoSeleccionado =
    (payMethods ?? []).find((m: any) => Number(m.id) === Number(metodoPagoId))?.value ?? "";

  const agregarLinea = () => setDetalle([...detalle, { ...lineaVacia }]);

  const quitarLinea = (index: number) =>
    setDetalle(detalle.filter((_, i) => i !== index));

  const cambiarLinea = (index: number, campo: keyof IDetalleLinea, valor: any) => {
    setDetalle(
      detalle.map((linea, i) => (i === index ? { ...linea, [campo]: valor } : linea))
    );
  };

  const seleccionarProducto = (index: number, idValue: any, value: string) => {
    setDetalle(
      detalle.map((linea, i) =>
        i === index ? { ...linea, productoId: Number(idValue), nombre: value } : linea
      )
    );
  };

  const total = detalle.reduce(
    (acc, linea) => acc + (Number(linea.cantidad) || 0) * (Number(linea.costoUnitario) || 0),
    0
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const lineasValidas = detalle.filter(
      (l) =>
        Number(l.productoId) > 0 &&
        Number(l.cantidad) > 0 &&
        Number(l.costoUnitario) >= 0
    );

    if (lineasValidas.length === 0) {
      const sinProducto = detalle.some((l) => !(Number(l.productoId) > 0));
      const sinCantidad = detalle.some((l) => !(Number(l.cantidad) > 0));
      if (sinProducto) {
        toast.error("Selecciona un producto en cada línea");
      } else if (sinCantidad) {
        toast.error("La cantidad debe ser mayor a 0");
      } else {
        toast.error("Agrega al menos un producto con cantidad válida");
      }
      return;
    }

    const payload = {
      proveedorId: proveedorId > 0 ? proveedorId : null,
      metodoPagoId: metodoPagoId > 0 ? metodoPagoId : null,
      observacion,
      fechaCompra: esEdicion && fecha ? fecha : null,
      detalle: lineasValidas.map((l) => ({
        productoId: l.productoId,
        cantidad: Number(l.cantidad),
        costoUnitario: Number(l.costoUnitario),
      })),
    };

    setLoading(true);
    try {
      if (esEdicion) {
        await dispatch(actualizarCompra(compraId!, payload, onClose) as any);
      } else {
        await dispatch(crearCompra(payload, onClose) as any);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      closeTimeoutMS={200}
      className={styles.panel}
      overlayClassName={styles.overlay}
    >
      <div className={styles.encabezado}>
        <h3>
          {esEdicion ? "Editar compra" : "Nueva compra"}
          <small>
            {esEdicion
              ? "Corrige los productos, cantidades o datos de la compra"
              : "Registra una entrada de stock por compra"}
          </small>
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          <Icon icon="mdi:close" width={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h3>Datos de la compra</h3>
          <div className={styles.grid}>
            <div>
              <SelectPro
                isLabel
                isSearch
                label="Proveedor (opcional)"
                options={proveedoresOptions}
                defaultValue={proveedorSeleccionado}
                onChange={(idValue: any) => setProveedorId(Number(idValue))}
                placeholder="Sin proveedor"
              />
            </div>
            <div>
              <SelectPro
                isLabel
                isSearch
                label="Método de pago (opcional)"
                options={payMethods}
                defaultValue={metodoPagoSeleccionado}
                onChange={(idValue: any) => setMetodoPagoId(Number(idValue))}
                placeholder="Sin especificar"
              />
            </div>
            {esEdicion && (
              <div>
                <label>Fecha</label>
                <input
                  type="date"
                  className={styles.fechaInput}
                  value={fecha}
                  onChange={(e: any) => setFecha(e.target.value)}
                />
              </div>
            )}
            <div className={styles.full}>
              <Input
                isLabel
                label="Observación"
                name="observacion"
                value={observacion}
                onChange={(e: any) => setObservacion(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>
            Productos
            <button type="button" className={styles.addLineBtn} onClick={agregarLinea}>
              + Agregar producto
            </button>
          </h3>

          {detalle.map((linea, index) => (
            <div key={index} className={styles.detalleRow}>
              <div>
                <label>Producto</label>
                <SelectPro
                  isSearch
                  options={productosOptions}
                  defaultValue={linea.nombre}
                  onChange={(idValue: any, value: string) =>
                    seleccionarProducto(index, idValue, value)
                  }
                  placeholder="Selecciona un producto"
                />
              </div>
              <div>
                <label>Cantidad</label>
                <Input
                  type="number"
                  name="cantidad"
                  value={linea.cantidad}
                  onChange={(e: any) => cambiarLinea(index, "cantidad", e.target.value)}
                />
              </div>
              <div>
                <label>Costo unitario</label>
                <Input
                  type="number"
                  name="costoUnitario"
                  value={linea.costoUnitario}
                  onChange={(e: any) =>
                    cambiarLinea(index, "costoUnitario", e.target.value)
                  }
                />
              </div>
              <div>
                <label>Subtotal</label>
                <div className={styles.subtotal}>
                  S/ {((Number(linea.cantidad) || 0) * (Number(linea.costoUnitario) || 0)).toFixed(2)}
                </div>
              </div>
              <button
                type="button"
                className={styles.removeRow}
                onClick={() => quitarLinea(index)}
                disabled={detalle.length === 1}
                title="Quitar producto"
              >
                <Icon icon="mdi:trash-can-outline" />
              </button>
            </div>
          ))}

          <div className={styles.total}>
            <span>Total:</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.buttons}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.submit} disabled={loading || cargandoCompra}>
            {loading ? "Guardando..." : esEdicion ? "Guardar cambios" : "Registrar compra"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
