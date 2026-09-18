import { useEffect, useState } from "react";
import styles from "./formularioCompra.module.css";
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
} from "../../../../../../redux/reducers/extensiones/extensiones..reducer";
import axiosInstance from "../../../../../../utils/axios";
import Input from "../../../../../../components/Input";
import SelectPro from "../../../../../../components/SelectPro";
import SelectUbigeo from "../../../../../../components/SelectPro/SelectUbigeo";
import { toast } from "sonner";

interface IDetalleLinea {
  productoId: number;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
}

const lineaVacia: IDetalleLinea = { productoId: 0, nombre: "", cantidad: 1, costoUnitario: 0 };

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

const hoyIso = () => new Date().toISOString().slice(0, 10);

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
  const [proveedorId, setProveedorId] = useState<number>(0);
  const [proveedorNombre, setProveedorNombre] = useState("");
  const [proveedorDireccion, setProveedorDireccion] = useState("");
  const [proveedorUbigeoId, setProveedorUbigeoId] = useState("");
  const [proveedorUbigeoLabel, setProveedorUbigeoLabel] = useState("");
  const [proveedorEmail, setProveedorEmail] = useState("");

  const [docSerie, setDocSerie] = useState("");
  const [docNumero, setDocNumero] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [fechaKardex, setFechaKardex] = useState(hoyIso());
  const [monedaId, setMonedaId] = useState<number>(0);
  const [tipoIgvId, setTipoIgvId] = useState<number>(0);

  const [tipoDescuento, setTipoDescuento] = useState<"%" | "S/">("%");
  const [descuentoValor, setDescuentoValor] = useState<string>("0");
  const [otrosCargos, setOtrosCargos] = useState<string>("0");
  const [esCredito, setEsCredito] = useState(false);
  const [metodoPagoId, setMetodoPagoId] = useState<number>(0);
  const [observacion, setObservacion] = useState("");

  const [detalle, setDetalle] = useState<IDetalleLinea[]>([]);
  const [loading, setLoading] = useState(false);
  const [cargandoCompra, setCargandoCompra] = useState(false);

  useEffect(() => {
    dispatch(getProductosCompra() as any);
    dispatch(getPayMethods() as any);
    dispatch(getMonedas() as any);
    dispatch(getTiposIgv() as any);
    dispatch(getAllUbigeos() as any);
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
          cantidad: l.cantidad || 1,
          costoUnitario: l.precioUnitario || 0,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compraId, prefillXml]);

  const productosOptions = (productosCompra ?? []).map((p: any) => ({ id: p.productoId, value: p.nombre }));
  const metodoPagoSeleccionado = (payMethods ?? []).find((m: any) => Number(m.id) === Number(metodoPagoId))?.value ?? "";
  const monedaSeleccionada = (monedas ?? []).find((m: any) => Number(m.id) === Number(monedaId))?.value ?? "";
  const tipoIgvSeleccionado = (tiposIgv ?? []).find((t: any) => Number(t.id) === Number(tipoIgvId))?.value ?? "";

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

  const agregarLinea = () => setDetalle([...detalle, { ...lineaVacia }]);
  const quitarLinea = (index: number) => setDetalle(detalle.filter((_, i) => i !== index));
  const cambiarLinea = (index: number, campo: keyof IDetalleLinea, valor: any) =>
    setDetalle(detalle.map((linea, i) => (i === index ? { ...linea, [campo]: valor } : linea)));
  const seleccionarProducto = (index: number, idValue: any, value: string) =>
    setDetalle(detalle.map((linea, i) => (i === index ? { ...linea, productoId: Number(idValue), nombre: value } : linea)));

  // Calculo en vivo solo para mostrar un preview -- el backend es la fuente de verdad al guardar.
  const subtotalProductos = detalle.reduce((acc, l) => acc + (Number(l.cantidad) || 0) * (Number(l.costoUnitario) || 0), 0);
  const montoDescuento =
    tipoDescuento === "%"
      ? Math.round(subtotalProductos * ((Number(descuentoValor) || 0) / 100) * 100) / 100
      : Number(descuentoValor) || 0;
  const otrosCargosNum = Number(otrosCargos) || 0;
  const baseConDescuento = subtotalProductos - montoDescuento + otrosCargosNum;
  const tipoIgvObj = (tiposIgv ?? []).find((t: any) => Number(t.id) === Number(tipoIgvId));
  const aplicaImpuesto = tipoIgvObj ? tipoIgvObj.aplicaPorcentajeImpuesto : true;
  const gravada = aplicaImpuesto ? Math.round((baseConDescuento / 1.18) * 100) / 100 : baseConDescuento;
  const igv = aplicaImpuesto ? Math.round((baseConDescuento - gravada) * 100) / 100 : 0;
  const total = baseConDescuento;

  const guardar = async () => {
    const lineasValidas = detalle.filter((l) => Number(l.productoId) > 0 && Number(l.cantidad) > 0 && Number(l.costoUnitario) >= 0);

    if (lineasValidas.length === 0) {
      return toast.error("Agrega al menos un producto con cantidad válida");
    }
    if (proveedorId === 0 && !proveedorNombre.trim()) {
      return toast.error("Busca o completa los datos del proveedor");
    }

    const payload = {
      sucursalId: sucursalId > 0 ? sucursalId : null,
      proveedorId: proveedorId > 0 ? proveedorId : null,
      proveedorRuc: numeroDocumento || undefined,
      proveedorNombre: proveedorNombre || undefined,
      proveedorDireccion: proveedorDireccion || undefined,
      proveedorUbigeoId: proveedorUbigeoId || undefined,
      proveedorEmail: proveedorEmail || undefined,
      metodoPagoId: metodoPagoId > 0 ? metodoPagoId : null,
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
      detalle: lineasValidas.map((l) => ({
        productoId: l.productoId,
        cantidad: Number(l.cantidad),
        costoUnitario: Number(l.costoUnitario),
      })),
    };

    setLoading(true);
    try {
      if (esEdicion) await dispatch(actualizarCompra(compraId!, payload, onGuardado) as any);
      else await dispatch(crearCompra(payload, onGuardado) as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.columnas}>
        <div className={styles.columnaPrincipal}>
          <div className={styles.card}>
            <h4>🏢 Proveedor</h4>
            <div className={styles.grid}>
              <div>
                <label>T.DOC.</label>
                <select
                  className={styles.select}
                  value={tipoDocProveedor}
                  onChange={(e) => setTipoDocProveedor(e.target.value as "RUC" | "DNI")}
                >
                  <option value="RUC">R.U.C.</option>
                  <option value="DNI">D.N.I.</option>
                </select>
              </div>
              <div>
                <label>NÚM. DOC.</label>
                <div className={styles.buscarRow}>
                  <input
                    className={styles.input}
                    placeholder="Escribe o busca..."
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value.replace(/\s/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && buscarProveedor()}
                  />
                  <button type="button" className={styles.buscarBtn} onClick={buscarProveedor} disabled={buscandoProveedor}>
                    🔍
                  </button>
                </div>
              </div>
              <div className={styles.full}>
                <Input
                  isLabel
                  label="Razón social / Nombre"
                  name="proveedorNombre"
                  value={proveedorNombre}
                  onChange={(e: any) => setProveedorNombre(e.target.value)}
                />
              </div>
              <div>
                <Input
                  isLabel
                  label="Dirección"
                  name="proveedorDireccion"
                  value={proveedorDireccion}
                  onChange={(e: any) => setProveedorDireccion(e.target.value)}
                />
              </div>
              <div>
                <SelectUbigeo
                  isLabel
                  isSearch
                  label="Ubigeo"
                  name="proveedorUbigeo"
                  id="proveedorUbigeoId"
                  options={ubigeos ?? []}
                  defaultValue={proveedorUbigeoLabel}
                  placeholder="Buscar distrito..."
                  onChange={(idValue: any, value: string) => {
                    setProveedorUbigeoId(idValue ? String(idValue) : "");
                    setProveedorUbigeoLabel(value);
                  }}
                />
              </div>
              <div className={styles.full}>
                <Input
                  isLabel
                  label="Correo (opcional)"
                  name="proveedorEmail"
                  value={proveedorEmail}
                  onChange={(e: any) => setProveedorEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h4>📄 Datos de la Orden de Compra</h4>
            <div className={styles.grid}>
              <div>
                <label>Sucursal</label>
                <SelectPro
                  isSearch
                  options={(sucursales ?? []).map((s: any) => ({ id: s.id, value: s.value }))}
                  defaultValue={(sucursales ?? []).find((s: any) => Number(s.id) === Number(sucursalId))?.value ?? ""}
                  onChange={(idValue: any) => setSucursalId(Number(idValue))}
                  placeholder="Sin especificar"
                />
              </div>
              <div>
                <Input isLabel label="Serie" name="serie" value={docSerie} onChange={(e: any) => setDocSerie(e.target.value)} />
              </div>
              <div>
                <Input isLabel label="Número" name="numero" value={docNumero} onChange={(e: any) => setDocNumero(e.target.value)} />
              </div>
              <div>
                <label>Fecha de Emisión</label>
                <input type="date" className={styles.dateInput} value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} />
              </div>
              <div>
                <label>Fecha Kardex</label>
                <input type="date" className={styles.dateInput} value={fechaKardex} onChange={(e) => setFechaKardex(e.target.value)} />
              </div>
              <div>
                <label>Moneda</label>
                <SelectPro
                  isSearch
                  options={(monedas ?? []).map((m: any) => ({ id: m.id, value: m.value }))}
                  defaultValue={monedaSeleccionada}
                  onChange={(idValue: any) => setMonedaId(Number(idValue))}
                  placeholder="Soles (S/)"
                />
              </div>
              <div>
                <label>IGV</label>
                <SelectPro
                  isSearch
                  options={(tiposIgv ?? []).map((t: any) => ({ id: t.id, value: t.value }))}
                  defaultValue={tipoIgvSeleccionado}
                  onChange={(idValue: any) => setTipoIgvId(Number(idValue))}
                  placeholder="18%"
                />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h4>
              📦 Productos
              <button type="button" className={styles.addLineBtn} onClick={agregarLinea}>
                + Agregar producto
              </button>
            </h4>

            {detalle.length === 0 && (
              <div className={styles.emptyProductos}>
                🛒 Aún no hay productos. Trae una factura arriba o agrega productos.
              </div>
            )}

            {detalle.map((linea, index) => (
              <div key={index} className={styles.detalleRow}>
                <div>
                  <label>Producto</label>
                  <SelectPro
                    isSearch
                    options={productosOptions}
                    defaultValue={linea.nombre}
                    onChange={(idValue: any, value: string) => seleccionarProducto(index, idValue, value)}
                    placeholder="Selecciona un producto"
                  />
                </div>
                <div>
                  <label>Cantidad</label>
                  <Input type="number" name="cantidad" value={linea.cantidad} onChange={(e: any) => cambiarLinea(index, "cantidad", e.target.value)} />
                </div>
                <div>
                  <label>Costo unitario</label>
                  <Input type="number" name="costoUnitario" value={linea.costoUnitario} onChange={(e: any) => cambiarLinea(index, "costoUnitario", e.target.value)} />
                </div>
                <div>
                  <label>Subtotal</label>
                  <div className={styles.subtotalLinea}>
                    S/ {((Number(linea.cantidad) || 0) * (Number(linea.costoUnitario) || 0)).toFixed(2)}
                  </div>
                </div>
                <button type="button" className={styles.removeRow} onClick={() => quitarLinea(index)} title="Quitar producto">
                  🗑
                </button>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <h4>
              💳 Pago
              <label className={styles.creditoToggle}>
                ¿Compra al crédito?
                <input type="checkbox" checked={esCredito} onChange={(e) => setEsCredito(e.target.checked)} />
              </label>
            </h4>
            <div className={styles.grid}>
              <div className={styles.full}>
                <label>Forma de pago</label>
                <SelectPro
                  isSearch
                  options={payMethods ?? []}
                  defaultValue={metodoPagoSeleccionado}
                  onChange={(idValue: any) => setMetodoPagoId(Number(idValue))}
                  placeholder="Efectivo"
                />
              </div>
              <div className={styles.full}>
                <Input isLabel label="Observación (opcional)" name="observacion" value={observacion} onChange={(e: any) => setObservacion(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.columnaResumen}>
          <div className={styles.resumenCard}>
            <h4>📊 Resumen</h4>
            <div className={styles.resumenFila}>
              <span>Gravada</span>
              <span>S/ {gravada.toFixed(2)}</span>
            </div>
            <div className={styles.resumenFila}>
              <span>IGV</span>
              <span>S/ {igv.toFixed(2)}</span>
            </div>

            <div className={styles.descuentoBloque}>
              <div className={styles.resumenFila}>
                <span>Descuento</span>
                <div className={styles.tipoDescuentoToggle}>
                  <button type="button" className={tipoDescuento === "%" ? styles.activo : ""} onClick={() => setTipoDescuento("%")}>
                    %
                  </button>
                  <button type="button" className={tipoDescuento === "S/" ? styles.activo : ""} onClick={() => setTipoDescuento("S/")}>
                    S/
                  </button>
                </div>
              </div>
              <input
                type="number"
                className={styles.resumenInput}
                value={descuentoValor}
                onChange={(e) => setDescuentoValor(e.target.value)}
              />
              <div className={styles.resumenNegativo}>- S/ {montoDescuento.toFixed(2)}</div>
            </div>

            <div className={styles.descuentoBloque}>
              <span>Otros cargos</span>
              <input type="number" className={styles.resumenInput} value={otrosCargos} onChange={(e) => setOtrosCargos(e.target.value)} />
              <div className={styles.resumenPositivo}>+ S/ {otrosCargosNum.toFixed(2)}</div>
            </div>

            <div className={styles.totalFila}>
              <span>Total a pagar</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>

            <button type="button" className={styles.guardarBtn} onClick={guardar} disabled={loading || cargandoCompra}>
              {loading ? "Guardando..." : "Guardar compra"}
            </button>
            <button type="button" className={styles.cancelarBtn} onClick={onCancelar}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
