import { useEffect, useState } from "react";
import styles from "./formularioCompra.module.css";
import { useFormErrors, CampoError } from "../../../../../../components/FormError";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  crearCompra,
  actualizarCompra,
  getProductosCompra,
} from "../../../../../../redux/reducers/Admin/compras/compra.reducer";
import {
  getPayMethods,
  getMonedas,
  getTiposIgv,
  getAllUbigeos,
  getTypeDocument,
} from "../../../../../../redux/reducers/extensiones/extensiones..reducer";
import {
  openModalProveedor,
  activeProveedorMain,
  clearActiveProveedor,
} from "../../../../../../redux/reducers/Admin/clientes-proveedores/clientesProveedoresAnfitrionas.reducer";
import { ProveedorModal } from "../../../../../../components/Modal/Admin/Proveedores";
import { ClientePickerModal } from "../../../NuevaFactura/ClientePickerModal";
import {
  openModalProducto,
  activeProducto as activeProductoMain,
  clearActiveProducto,
} from "../../../../../../redux/reducers/Admin/productos/producto.reducer";
import { ProductoModal } from "../../../../../../components/Modal/Admin/Producto";
import axiosInstance from "../../../../../../utils/axios";

import SelectPro from "../../../../../../components/SelectPro";
import { toast } from "sonner";
import { AsientoPreview, lineasAsientoCompra, separarIgv, tasaIgv, useAsientoSimulado } from "../../../../../../components/AsientoPreview";

interface IDetalleLinea {
  productoId: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  costoUnitario: number;
  centroCostoId: number;
  cuentaContableId: number;
  sucursalDestinoId: number;
}

const lineaVacia: IDetalleLinea = { productoId: 0, nombre: "", descripcion: "", cantidad: 1, costoUnitario: 0, centroCostoId: 0, cuentaContableId: 0, sucursalDestinoId: 0 };

interface IPagoInicial {
  metodoPagoId: number;
  monto: string;
}

export interface IPrefillXml {
  proveedorId?: number | null;
  proveedorNombre?: string | null;
  proveedorRuc?: string | null;
  numeroDocumento?: string | null;
  fechaEmision?: string | null;
  lineas: { descripcion: string; cantidad: number; precioUnitario: number }[];
}

interface IProps {
  compraId?: number;
  prefillXml?: IPrefillXml | null;
  sucursalIdInicial?: number;
  onGuardado: () => void;
  onCancelar: () => void;
}

const toIso = (v?: string | null) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

// No usar toISOString(): convierte a UTC y en timezones negativos (Perú, UTC-5) las horas
// de la noche caen ya en el dia siguiente en UTC, registrando la fecha de "manana".
const hoyIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const FormularioCompra = ({ compraId, prefillXml, sucursalIdInicial, onGuardado, onCancelar }: IProps) => {
  const dispatch = useAppDispatch();
  const { productosCompra }: any = useAppSelector((state: RootState) => state.compras);
  const { payMethods, monedas, tiposIgv, ubigeos, sucursales }: any = useAppSelector(
    (state: RootState) => state.extentions
  );

  const esEdicion = !!compraId;

  const [sucursalId, setSucursalId] = useState<number>(sucursalIdInicial ?? 0);
  const [tipoDocProveedor, setTipoDocProveedor] = useState<"RUC" | "DNI">("RUC");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [buscandoProveedor, setBuscandoProveedor] = useState(false);
  const [pickerProveedorOpen, setPickerProveedorOpen] = useState(false);
  const [proveedorId, setProveedorId] = useState<number>(0);
  const [proveedorNombre, setProveedorNombre] = useState("");
  const [proveedorDireccion, setProveedorDireccion] = useState("");
  const [proveedorUbigeoId, setProveedorUbigeoId] = useState("");
  const [, setProveedorUbigeoLabel] = useState("");
  const [proveedorEmail, setProveedorEmail] = useState("");

  const [docSerie, setDocSerie] = useState("");
  const [docNumero, setDocNumero] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [fechaKardex, setFechaKardex] = useState(hoyIso());
  const [monedaId, setMonedaId] = useState<number>(0);
  const [tipoIgvId, setTipoIgvId] = useState<number>(0);
  const [tipoCambio, setTipoCambio] = useState<string>("");

  const [tipoDescuento, setTipoDescuento] = useState<"%" | "S/">("%");
  const [descuentoValor, setDescuentoValor] = useState<string>("0");
  const [otrosCargos, setOtrosCargos] = useState<string>("0");
  const [esCredito, setEsCredito] = useState(false);
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [diasCredito, setDiasCredito] = useState("");
  const [metodoPagoId, setMetodoPagoId] = useState<number>(0);
  const [observacion, setObservacion] = useState("");
  const [pagos, setPagos] = useState<IPagoInicial[]>([]);

  // Detraccion SUNAT (SPOT): opcional, solo si el servicio/bien esta afecto.
  const [tipoDetraccionId, setTipoDetraccionId] = useState<number>(0);
  const [numeroDetraccion, setNumeroDetraccion] = useState("");
  const [fechaDetraccion, setFechaDetraccion] = useState("");

  const [tiposDetraccion, setTiposDetraccion] = useState<any[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
  const [cuentasContables, setCuentasContables] = useState<any[]>([]);

  const [detalle, setDetalle] = useState<IDetalleLinea[]>([]);
  const [loading, setLoading] = useState(false);
  const [cargandoCompra, setCargandoCompra] = useState(false);

  const cargarSerieNumero = async (sucId: number) => {
    try {
      const { data }: any = await axiosInstance.get(`/compras/obtener-serie-numero?sucursalId=${sucId || 0}`);
      if (data?.data) {
        setDocSerie(data.data.serie || "");
        setDocNumero(data.data.numero || "");
      }
    } catch {
      // silenciosa
    }
  };

  useEffect(() => {
    dispatch(getProductosCompra(true) as any);
    dispatch(getPayMethods() as any);
    dispatch(getMonedas() as any);
    dispatch(getTiposIgv() as any);
    dispatch(getAllUbigeos() as any);
    dispatch(getTypeDocument() as any);
    axiosInstance.get("/extensiones/tipos-detraccion").then((r: any) => setTiposDetraccion(r.data?.data ?? [])).catch(() => {});
    axiosInstance.get("/extensiones/centros-costo").then((r: any) => setCentrosCosto(r.data?.data ?? [])).catch(() => {});
    axiosInstance.get("/cuentas-contables/listar").then((r: any) => setCuentasContables(r.data?.data ?? [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (compraId) {
      setCargandoCompra(true);
      axiosInstance
        .get(`/compras/${compraId}`)
        .then(({ data }: any) => {
          const c = data?.data;
          setSucursalId(c?.sucursalId ?? 0);
          setProveedorId(c?.proveedorId ?? 0);
          setProveedorNombre(c?.proveedor ?? "");
          setNumeroDocumento(c?.proveedorRuc ?? "");
          setTipoDocProveedor((c?.proveedorRuc ?? "").length === 8 ? "DNI" : "RUC");
          setProveedorDireccion(c?.proveedorDireccion ?? "");
          setProveedorEmail(c?.proveedorEmail ?? "");
          setProveedorUbigeoId(c?.proveedorUbigeoId ?? "");
          setProveedorUbigeoLabel(c?.proveedorUbigeo ?? "");
          setMetodoPagoId(c?.metodoPagoId ?? 0);
          setObservacion(c?.observacion ?? "");
          setFechaKardex(c?.fechaCompra ? toIso(c.fechaCompra.split(" ")[0].split("/").reverse().join("-")) || hoyIso() : hoyIso());
          setDocSerie(c?.serie ?? "");
          setDocNumero(c?.numero ?? "");
          setFechaEmision(toIso(c?.fechaEmision));
          setMonedaId(c?.monedaId ?? 0);
          setTipoIgvId(c?.tipoIgvId ?? 0);
          setTipoDescuento(c?.porcentajeDescuento ? "%" : "S/");
          setDescuentoValor(String(c?.porcentajeDescuento ?? c?.montoDescuento ?? 0));
          setOtrosCargos(String(c?.otrosCargos ?? 0));
          setEsCredito(!!c?.esCredito);
          setFechaVencimiento(c?.fechaVencimiento ?? "");
          setTipoCambio(c?.tipoCambio != null ? String(c.tipoCambio) : "");
          setTipoDetraccionId(c?.tipoDetraccionId ?? 0);
          setNumeroDetraccion(c?.numeroDetraccion ?? "");
          setFechaDetraccion(toIso(c?.fechaDetraccion));
          setDetalle(
            (c?.detalle ?? []).map((d: any) => ({
              productoId: d.productoId,
              nombre: d.producto ?? "",
              descripcion: d.descripcion ?? "",
              cantidad: d.cantidad,
              costoUnitario: d.costoUnitario,
              centroCostoId: d.centroCostoId ?? 0,
              cuentaContableId: d.cuentaContableId ?? 0,
              sucursalDestinoId: d.sucursalDestinoId ?? c?.sucursalId ?? 0,
            }))
          );
        })
        .catch(() => toast.error("No se pudo cargar la compra"))
        .finally(() => setCargandoCompra(false));
    } else if (prefillXml) {
      setProveedorId(prefillXml.proveedorId ?? 0);
      setProveedorNombre(prefillXml.proveedorNombre ?? "");
      setNumeroDocumento(prefillXml.proveedorRuc ?? "");
      const partes = (prefillXml.numeroDocumento ?? "").split("-");
      setDocSerie(partes.length > 1 ? partes[0] : "");
      setDocNumero(partes.length > 1 ? partes.slice(1).join("-") : partes[0] ?? "");
      setFechaEmision(toIso(prefillXml.fechaEmision));
      setDetalle(
        prefillXml.lineas.map((l) => ({
          productoId: 0,
          nombre: l.descripcion,
          descripcion: "",
          cantidad: l.cantidad || 1,
          costoUnitario: l.precioUnitario || 0,
          centroCostoId: 0,
          cuentaContableId: 0,
          sucursalDestinoId: sucursalIdInicial ?? 0,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compraId, prefillXml]);

  useEffect(() => {
    if (!esEdicion && !docSerie) {
      cargarSerieNumero(sucursalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sucursalId, esEdicion]);

  const productosOptions = (productosCompra ?? []).map((p: any) => ({ id: p.productoId, value: p.nombre }));
  const metodoPagoSeleccionado = (payMethods ?? []).find((m: any) => Number(m.id) === Number(metodoPagoId))?.value ?? "";
  const monedaSeleccionada = (monedas ?? []).find((m: any) => Number(m.id) === Number(monedaId))?.value ?? "";
  const tipoIgvSeleccionado = (tiposIgv ?? []).find((t: any) => Number(t.id) === Number(tipoIgvId))?.value ?? "";
  const tipoDetraccionSeleccionado = (tiposDetraccion ?? []).find((t: any) => Number(t.id) === Number(tipoDetraccionId))?.value ?? "";
  const centrosCostoOptions = (centrosCosto ?? []).map((c: any) => ({ id: c.id, value: c.value }));
  const cuentasContablesOptions = (cuentasContables ?? []).filter((c: any) => c.esHoja).map((c: any) => ({ id: c.id, value: `${c.codigo} - ${c.nombre}` }));
  const nombreCentroCosto = (id: number) => (centrosCosto ?? []).find((c: any) => c.id === id)?.value ?? "";
  const nombreCuentaContable = (id: number) => cuentasContablesOptions.find((c: any) => c.id === id)?.value ?? "";
  const sucursalesOptions = (sucursales ?? []).map((s: any) => ({ id: s.id, value: s.value }));
  const nombreSucursal = (id: number) => sucursalesOptions.find((s: any) => Number(s.id) === Number(id))?.value ?? "";
  const totalPagos = pagos.reduce((a, p) => a + (Number(p.monto) || 0), 0);

  const limpiarProveedor = () => {
    setProveedorId(0);
    setProveedorNombre("");
    setProveedorDireccion("");
    setProveedorUbigeoId("");
    setProveedorUbigeoLabel("");
    setProveedorEmail("");
  };

  const seleccionarProveedorExistente = (p: any) => {
    setProveedorId(p.proveedorId);
    setProveedorNombre(p.nombre ?? "");
    setProveedorDireccion(p.dirección ?? "");
    setProveedorEmail(p.email ?? "");
    if (p.ubigeoId && p.ubigeo) {
      setProveedorUbigeoId(String(p.ubigeoId));
      setProveedorUbigeoLabel(`${p.ubigeo.departamento}/${p.ubigeo.provincia}/${p.ubigeo.distrito}`);
    } else {
      setProveedorUbigeoId("");
      setProveedorUbigeoLabel("");
    }
    setNumeroDocumento(p.ruc ?? "");
  };

  const buscarProveedorPorDocumentoExterno = async (doc: string, tipo: "RUC" | "DNI") => {
    try {
      const url = tipo === "RUC" ? `/extensiones/ruc/${doc}` : `/extensiones/dni/${doc}`;
      const { data }: any = await axiosInstance.get(url);
      const info = data?.data;
      if (!info?.razonSocial) {
        toast.error("No se encontró, completa los datos manualmente");
        return;
      }
      setProveedorId(0);
      setProveedorNombre(info.razonSocial);
      setProveedorDireccion(info.direccion ?? "");
      setProveedorEmail("");
      if (info.ubigeoId) {
        const ubigeo = (ubigeos as any[])?.find((u) => String(u.ubigeoId) === String(info.ubigeoId));
        if (ubigeo) {
          setProveedorUbigeoId(String(ubigeo.ubigeoId));
          setProveedorUbigeoLabel(`${ubigeo.departamento}/${ubigeo.provincia}/${ubigeo.distrito}`);
        }
      } else {
        setProveedorUbigeoId("");
        setProveedorUbigeoLabel("");
      }
      toast.success(`Datos obtenidos de ${tipo} (SUNAT)`);
    } catch {
      toast.error("No se encontró, completa los datos manualmente");
    }
  };

  const buscarProveedor = async () => {
    const termino = numeroDocumento.trim();
    if (termino.length < 3) return toast.error("Escribe al menos 3 caracteres del número de documento");

    setBuscandoProveedor(true);
    limpiarProveedor();
    setNumeroDocumento(termino);
    try {
      const { data }: any = await axiosInstance.get(`/proveedor/listar?Value=${termino}&Amount=5`);
      const items = data?.data?.items ?? [];
      if (items.length > 0) seleccionarProveedorExistente(items[0]);
      else toast.error("No se encontró, completa los datos manualmente");
    } catch (error: any) {
      if (
        error?.response?.status === 404 &&
        ((tipoDocProveedor === "RUC" && termino.length === 11) || (tipoDocProveedor === "DNI" && termino.length === 8))
      ) {
        await buscarProveedorPorDocumentoExterno(termino, tipoDocProveedor);
      } else {
        toast.error("No se encontró, completa los datos manualmente");
      }
    } finally {
      setBuscandoProveedor(false);
    }
  };

  const abrirRegistroProveedor = () => {
    dispatch(activeProveedorMain({ ruc: numeroDocumento.trim() }) as any);
    dispatch(openModalProveedor() as any);
  };

  const proveedorRegistrado = (p: any) => {
    dispatch(clearActiveProveedor() as any);
    seleccionarProveedorExistente(p);
  };

  const agregarLinea = () => setDetalle([...detalle, { ...lineaVacia, sucursalDestinoId: sucursalId }]);
  const quitarLinea = (index: number) => setDetalle(detalle.filter((_, i) => i !== index));
  const cambiarLinea = (index: number, campo: keyof IDetalleLinea, valor: any) =>
    setDetalle(detalle.map((linea, i) => (i === index ? { ...linea, [campo]: valor } : linea)));
  const seleccionarProducto = (index: number, idValue: any, value: string) =>
    setDetalle(detalle.map((linea, i) => (i === index ? { ...linea, productoId: Number(idValue), nombre: value } : linea)));

  // "+ Crear producto" del droplist de una linea: abre el modal completo de Producto (precio,
  // stock, etc. no caben en un alta rapida) precargado con el nombre buscado, y al guardar
  // selecciona el producto creado en esa misma linea.
  const [lineaCreandoProducto, setLineaCreandoProducto] = useState<number | null>(null);
  const crearProductoDesdeLinea = (index: number, busqueda: string) => {
    setLineaCreandoProducto(index);
    dispatch(activeProductoMain({ nombre: busqueda }) as any);
    dispatch(openModalProducto() as any);
  };
  const productoCreado = (p: any) => {
    dispatch(clearActiveProducto() as any);
    if (lineaCreandoProducto !== null) seleccionarProducto(lineaCreandoProducto, p.productoId, p.nombre);
    setLineaCreandoProducto(null);
    dispatch(getProductosCompra(true) as any);
  };

  // Calculo en vivo solo para mostrar un preview -- el backend es la fuente de verdad al guardar.
  const subtotalProductos = detalle.reduce((acc, l) => acc + (Number(l.cantidad) || 0) * (Number(l.costoUnitario) || 0), 0);
  const montoDescuento =
    tipoDescuento === "%"
      ? Math.round(subtotalProductos * ((Number(descuentoValor) || 0) / 100) * 100) / 100
      : Number(descuentoValor) || 0;
  const otrosCargosNum = Number(otrosCargos) || 0;
  const baseConDescuento = subtotalProductos - montoDescuento + otrosCargosNum;
  const tipoIgvObj = (tiposIgv ?? []).find((t: any) => Number(t.id) === Number(tipoIgvId));
  const tasa = tasaIgv(tipoIgvObj);
  const { gravada, igv } = separarIgv(baseConDescuento, tasa > 0, tasa);
  const total = baseConDescuento;
  const totalPagado = esCredito ? totalPagos : total;
  const lineasPreview = detalle.filter((l) => Number(l.productoId) > 0 && Number(l.cantidad) > 0 && Number(l.costoUnitario) >= 0);
  const asientosSimulados = useAsientoSimulado("/compras/simular-asiento", lineasPreview.length === 0 ? null : {
    proveedorId: proveedorId > 0 ? proveedorId : null, proveedorRuc: numeroDocumento || undefined,
    tipoIgvId: tipoIgvId > 0 ? tipoIgvId : undefined, esCredito,
    porcentajeDescuento: tipoDescuento === "%" ? Number(descuentoValor) || undefined : undefined,
    montoDescuento: tipoDescuento === "S/" ? Number(descuentoValor) || undefined : undefined,
    otrosCargos: otrosCargosNum || undefined,
    detalle: lineasPreview.map((l) => ({
      productoId: l.productoId, cantidad: Number(l.cantidad), costoUnitario: Number(l.costoUnitario),
      centroCostoId: l.centroCostoId > 0 ? l.centroCostoId : undefined,
      cuentaContableId: l.cuentaContableId > 0 ? l.cuentaContableId : undefined,
    })),
  });

  const { errors, setError, clearError, limpiarErrores } = useFormErrors();

  const guardar = async () => {
    limpiarErrores();
    const lineasValidas = detalle.filter((l) => Number(l.productoId) > 0 && Number(l.cantidad) > 0 && Number(l.costoUnitario) >= 0);

    if (lineasValidas.length === 0) {
      setError("productos", "Agrega al menos un producto con cantidad válida");
      return toast.error("Agrega al menos un producto con cantidad válida");
    }
    if (proveedorId === 0 && !proveedorNombre.trim()) {
      setError("proveedorNombre", "Busca o completa los datos del proveedor");
      return toast.error("Busca o completa los datos del proveedor");
    }
    const pagosValidos = pagos.filter((p) => p.metodoPagoId > 0 && Number(p.monto) > 0);
    if (!esEdicion && esCredito && pagosValidos.length > 0 && totalPagos > total + 0.01) {
      setError("pagos", "La suma de los pagos no puede superar el total");
      return toast.error("La suma de los pagos no puede superar el total");
    }

    const payload = {
      sucursalId: sucursalId > 0 ? sucursalId : null,
      proveedorId: proveedorId > 0 ? proveedorId : null,
      proveedorRuc: numeroDocumento || undefined,
      proveedorNombre: proveedorNombre || undefined,
      proveedorDireccion: proveedorDireccion || undefined,
      proveedorUbigeoId: proveedorUbigeoId || undefined,
      proveedorEmail: proveedorEmail || undefined,
      // A credito no hay forma de pago: se elige al pagar en Cuentas por pagar.
      metodoPagoId: !esCredito && metodoPagoId > 0 ? metodoPagoId : null,
      observacion,
      fechaCompra: fechaKardex || undefined,
      serie: docSerie || undefined,
      numero: docNumero || undefined,
      fechaEmision: fechaEmision || undefined,
      monedaId: monedaId > 0 ? monedaId : undefined,
      tipoIgvId: tipoIgvId > 0 ? tipoIgvId : undefined,
      porcentajeDescuento: tipoDescuento === "%" ? Number(descuentoValor) || undefined : undefined,
      montoDescuento: tipoDescuento === "S/" ? Number(descuentoValor) || undefined : undefined,
      otrosCargos: otrosCargosNum || undefined,
      esCredito,
      fechaVencimiento: esCredito && fechaVencimiento ? fechaVencimiento : undefined,
      tipoCambio: Number(tipoCambio) || undefined,
      tipoDetraccionId: tipoDetraccionId > 0 ? tipoDetraccionId : undefined,
      numeroDetraccion: numeroDetraccion || undefined,
      fechaDetraccion: tipoDetraccionId > 0 && fechaDetraccion ? fechaDetraccion : undefined,
      detalle: lineasValidas.map((l) => ({
        productoId: l.productoId,
        cantidad: Number(l.cantidad),
        costoUnitario: Number(l.costoUnitario),
        descripcion: l.descripcion || undefined,
        centroCostoId: l.centroCostoId > 0 ? l.centroCostoId : undefined,
        cuentaContableId: l.cuentaContableId > 0 ? l.cuentaContableId : undefined,
        sucursalDestinoId: l.sucursalDestinoId > 0 ? l.sucursalDestinoId : undefined,
      })),
    };

    // Pagos iniciales (solo al crear, con la compra ya a credito): reusa el mismo endpoint que
    // Cuentas por Pagar, una llamada por metodo de pago, aplicada sobre la compra recien creada.
    const aplicarPagosIniciales = async (compra: any) => {
      if (!esEdicion && pagosValidos.length > 0 && compra?.id && compra?.proveedorId) {
        for (const p of pagosValidos) {
          try {
            await axiosInstance.post("/pagos-proveedor/crear", {
              socioId: compra.proveedorId, metodoPagoId: p.metodoPagoId,
              detalle: [{ documentoId: compra.id, monto: Number(p.monto) }],
            });
          } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "La compra se registró, pero un pago no se pudo aplicar");
          }
        }
      }
      onGuardado();
    };

    setLoading(true);
    try {
      if (esEdicion) await dispatch(actualizarCompra(compraId!, payload, onGuardado) as any);
      else await dispatch(crearCompra(payload, aplicarPagosIniciales) as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.hoja}>
      <div className={styles.cabecera}>
        <div>
          <div className={styles.campo}>
            <label className={styles.req}>Proveedor</label>
            <div className={styles.buscarRow}>
              <select className={styles.tipoDoc} value={tipoDocProveedor} onChange={(e) => setTipoDocProveedor(e.target.value as "RUC" | "DNI")}>
                <option value="RUC">RUC</option>
                <option value="DNI">DNI</option>
              </select>
              <input
                className={styles.input}
                placeholder="N° documento"
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value.replace(/\s/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && buscarProveedor()}
              />
              <button type="button" className={styles.buscarBtn} onClick={() => setPickerProveedorOpen(true)} disabled={buscandoProveedor} title="Buscar proveedor">🔍</button>
              <button type="button" className={styles.buscarBtn} onClick={abrirRegistroProveedor} title="Registrar nuevo proveedor">➕</button>
            </div>
          </div>
          <div className={styles.campo}>
            <label />
            <div>
              <input
                className={styles.input}
                placeholder="Razón social / Nombre"
                value={proveedorNombre}
                onChange={(e) => {
                  setProveedorNombre(e.target.value);
                  clearError("proveedorNombre");
                }}
              />
              <CampoError mensaje={errors.proveedorNombre} />
            </div>
          </div>
          <div className={styles.campo}>
            <label>Divisa</label>
            <div className={styles.dosCol}>
              <SelectPro isSearch options={(monedas ?? []).map((m: any) => ({ id: m.id, value: m.value }))} defaultValue={monedaSeleccionada}
                onChange={(idValue: any) => setMonedaId(Number(idValue))} placeholder="PEN - Soles" />
              <input className={styles.input} type="number" placeholder="T. cambio" title="Tipo de cambio" value={tipoCambio} onChange={(e) => setTipoCambio(e.target.value)} />
            </div>
          </div>
          <div className={styles.campo}>
            <label>Impuesto</label>
            <SelectPro isSearch options={(tiposIgv ?? []).map((t: any) => ({ id: t.id, value: t.value }))} defaultValue={tipoIgvSeleccionado}
              onChange={(idValue: any) => setTipoIgvId(Number(idValue))} placeholder="IGV 18%" />
          </div>
        </div>

        <div>
          <div className={styles.campo}>
            <label>Fecha de emisión</label>
            <input type="date" className={styles.input} value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} />
          </div>
          <div className={styles.campo}>
            <label title="También es la fecha del kardex">Fecha de contabilización</label>
            <input type="date" className={styles.input} value={fechaKardex} onChange={(e) => setFechaKardex(e.target.value)} />
          </div>
          <div className={styles.campo}>
            <label>Periodo</label>
            <input type="month" className={styles.input} value={fechaKardex.slice(0, 7)} readOnly title="Se toma de la fecha de contabilización" />
          </div>
          <div className={styles.campo}>
            <label>
              <input type="checkbox" checked={esCredito} onChange={(e) => setEsCredito(e.target.checked)} /> Al crédito
            </label>
            {esCredito ? (
              <div className={styles.dosCol}>
                <input className={styles.input} type="number" min={1} placeholder="Días" title="Días de crédito" value={diasCredito}
                  onChange={(e) => {
                    setDiasCredito(e.target.value);
                    const n = parseInt(e.target.value, 10);
                    if (n > 0 && fechaEmision) {
                      const d = new Date(`${fechaEmision}T00:00:00`);
                      d.setDate(d.getDate() + n);
                      setFechaVencimiento(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
                    }
                  }} />
                <input type="date" className={styles.input} title="Fecha de vencimiento" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
              </div>
            ) : (
              <SelectPro isSearch options={payMethods ?? []} defaultValue={metodoPagoSeleccionado}
                onChange={(idValue: any) => setMetodoPagoId(Number(idValue))} placeholder="Forma de pago: Efectivo" />
            )}
          </div>
        </div>

        <div>
          <div className={styles.campo}>
            <label>Factura #</label>
            <div className={styles.dosCol}>
              <input className={styles.input} placeholder="Serie" value={docSerie} onChange={(e) => setDocSerie(e.target.value)} />
              <input className={styles.input} placeholder="Número" value={docNumero} onChange={(e) => setDocNumero(e.target.value)} />
            </div>
          </div>
          <div className={styles.campo}>
            <label>Notas</label>
            <textarea className={styles.notas} rows={4} value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
        </div>
      </div>

      <div className={styles.lineas}>
        <div className={`${styles.fila} ${styles.filaTitulo}`}>
          <span>Artículo</span>
          <span>Descripción</span>
          <span>Sucursal</span>
          <span>Centro de costo</span>
          <span>Cuenta contable</span>
          <span>Cantidad</span>
          <span>Precio</span>
          <span className={styles.derecha}>Importe</span>
          <span />
        </div>
        {detalle.map((linea, index) => (
          <div key={index} className={styles.fila}>
            <SelectPro isSearch options={productosOptions} defaultValue={linea.nombre}
              onChange={(idValue: any, value: string) => seleccionarProducto(index, idValue, value)} placeholder="Producto"
              onAgregarNuevo={(busqueda) => crearProductoDesdeLinea(index, busqueda)} agregarNuevoLabel="producto" />
            <input className={styles.input} value={linea.descripcion} onChange={(e) => cambiarLinea(index, "descripcion", e.target.value)} />
            <SelectPro isSearch options={sucursalesOptions} defaultValue={nombreSucursal(linea.sucursalDestinoId)}
              onChange={(idValue: any) => cambiarLinea(index, "sucursalDestinoId", Number(idValue))} placeholder="Sucursal" />
            <SelectPro isSearch options={centrosCostoOptions} defaultValue={nombreCentroCosto(linea.centroCostoId)}
              onChange={(idValue: any) => cambiarLinea(index, "centroCostoId", Number(idValue))} placeholder="Opcional" />
            <SelectPro isSearch options={cuentasContablesOptions} defaultValue={nombreCuentaContable(linea.cuentaContableId)}
              onChange={(idValue: any) => cambiarLinea(index, "cuentaContableId", Number(idValue))} placeholder="Por defecto" />
            <input className={styles.input} type="number" value={linea.cantidad} onChange={(e) => cambiarLinea(index, "cantidad", e.target.value)} />
            <input className={styles.input} type="number" value={linea.costoUnitario} onChange={(e) => cambiarLinea(index, "costoUnitario", e.target.value)} />
            <span className={styles.derecha}>S/ {((Number(linea.cantidad) || 0) * (Number(linea.costoUnitario) || 0)).toFixed(2)}</span>
            <button type="button" className={styles.removeRow} onClick={() => quitarLinea(index)} title="Quitar línea">🗑</button>
          </div>
        ))}
        <CampoError mensaje={errors.productos} />
      </div>

      <div className={styles.pie}>
        <div className={styles.pieIzq}>
          <button type="button" className={styles.addLineBtn} onClick={agregarLinea}>⊕ Añade una línea</button>

          {esCredito && !esEdicion && (
            <div>
              {pagos.map((p, i) => (
                <div key={i} className={styles.pagoFila}>
                  <SelectPro isSearch options={payMethods ?? []}
                    defaultValue={(payMethods ?? []).find((m: any) => Number(m.id) === Number(p.metodoPagoId))?.value ?? ""}
                    onChange={(idValue: any) => setPagos(pagos.map((x, j) => (j === i ? { ...x, metodoPagoId: Number(idValue) } : x)))} placeholder="Medio de pago" />
                  <input className={styles.input} type="number" placeholder="Monto" value={p.monto}
                    onChange={(e) => setPagos(pagos.map((x, j) => (j === i ? { ...x, monto: e.target.value } : x)))} />
                  <button type="button" className={styles.removeRow} onClick={() => setPagos(pagos.filter((_, j) => j !== i))} title="Quitar pago">🗑</button>
                </div>
              ))}
              <button type="button" className={styles.addLineBtn} onClick={() => setPagos([...pagos, { metodoPagoId: 0, monto: "" }])}>⊕ Añadir pago inicial</button>
              <CampoError mensaje={errors.pagos} />
            </div>
          )}

          <details className={styles.plegable}>
            <summary>💰 Detracción {tipoDetraccionId ? `· ${tipoDetraccionSeleccionado}` : "(opcional)"}</summary>
            <div className={styles.tresCol}>
              <SelectPro isSearch options={(tiposDetraccion ?? []).map((t: any) => ({ id: t.id, value: t.value }))} defaultValue={tipoDetraccionSeleccionado}
                onChange={(idValue: any) => setTipoDetraccionId(Number(idValue))} placeholder="No aplica" />
              <input className={styles.input} placeholder="N° de constancia" value={numeroDetraccion} disabled={!tipoDetraccionId} onChange={(e) => setNumeroDetraccion(e.target.value)} />
              <input type="date" className={styles.input} value={fechaDetraccion} disabled={!tipoDetraccionId} onChange={(e) => setFechaDetraccion(e.target.value)} />
            </div>
          </details>

          <AsientoPreview lineas={lineasAsientoCompra(gravada, igv, total)} asientos={asientosSimulados}
            nota={asientosSimulados ? "Calculado con las cuentas configuradas en el producto, el proveedor y las cuentas por defecto."
              : "Además, la mercadería entra a almacén: 20 Mercaderías (Debe) / 61 Variación de existencias (Haber). Las cuentas propias del producto o proveedor reemplazan a estas."} />
        </div>

        <div className={styles.totales}>
          <div><span>Total parcial:</span><span>S/ {subtotalProductos.toFixed(2)}</span></div>
          <div>
            <span className={styles.conInput}>
              Descuento
              <span className={styles.tipoDescuentoToggle}>
                <button type="button" className={tipoDescuento === "%" ? styles.activo : ""} onClick={() => setTipoDescuento("%")}>%</button>
                <button type="button" className={tipoDescuento === "S/" ? styles.activo : ""} onClick={() => setTipoDescuento("S/")}>S/</button>
              </span>
              <input type="number" className={styles.totalInput} value={descuentoValor} onChange={(e) => setDescuentoValor(e.target.value)} />
            </span>
            <span>- S/ {montoDescuento.toFixed(2)}</span>
          </div>
          <div>
            <span className={styles.conInput}>
              Otros cargos
              <input type="number" className={styles.totalInput} value={otrosCargos} onChange={(e) => setOtrosCargos(e.target.value)} />
            </span>
            <span>S/ {otrosCargosNum.toFixed(2)}</span>
          </div>
          <div><span>IGV:</span><span>S/ {igv.toFixed(2)}</span></div>
          <div className={styles.totalFila}><span>Total ({monedaSeleccionada ? monedaSeleccionada.split(" ")[0] : "PEN"}):</span><span>S/ {total.toFixed(2)}</span></div>
          {!esEdicion && (
            <>
              <div><span>Total pagado:</span><span>S/ {totalPagado.toFixed(2)}</span></div>
              <div><span>Importe adeudado:</span><span>S/ {Math.max(0, total - totalPagado).toFixed(2)}</span></div>
            </>
          )}
          <div className={styles.acciones}>
            <button type="button" className={styles.cancelarBtn} onClick={onCancelar}>Cancelar</button>
            <button type="button" className={styles.guardarBtn} onClick={guardar} disabled={loading || cargandoCompra || Object.keys(errors).length > 0}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      <ClientePickerModal
        isOpen={pickerProveedorOpen}
        onClose={() => setPickerProveedorOpen(false)}
        onSeleccionar={(p: any) => {
          setTipoDocProveedor((p.ruc ?? "").length === 8 ? "DNI" : "RUC");
          seleccionarProveedorExistente(p);
        }}
        titulo="Buscar proveedor"
        endpoint="/proveedor/listar"
      />
      <ProveedorModal onGuardado={proveedorRegistrado} />
      <ProductoModal onGuardado={productoCreado} />
    </div>
  );
};