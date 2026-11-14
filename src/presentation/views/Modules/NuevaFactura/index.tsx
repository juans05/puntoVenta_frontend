import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./nuevaFactura.module.css";
import { useFormErrors, estiloError, CampoError } from "../../../../components/FormError";
import comprasStyles from "../Admin/Views/Compras/compras.module.css";
// Mismo diseño que Compras > Registrar factura: se reutiliza su hoja de estilos.
import f from "../Admin/Views/Compras/formularioCompra.module.css";
import { getToken } from "../../../../helpers/auth-helpers";
import axiosInstance from "../../../../utils/axios";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import { RootState } from "../../../../redux/rootState";
import { IProductsState } from "../../../../redux/reducers/productos/interfaces";
import { getProducts } from "../../../../redux/reducers/Admin/productos/producto.reducer";
import { getPayMethods, getTiposIgv, getUnidadesMedida, getTypeDocument, getAllUbigeos, getTiposOperacion, getMonedas, getSucursales, getColaboradores } from "../../../../redux/reducers/extensiones/extensiones..reducer";
import SelectUbigeo from "../../../../components/SelectPro/SelectUbigeo";
import { IExtensionesState } from "../../../../redux/reducers/extensiones/interfaces";
import { ISalesState, ISaleProduct } from "../../../../redux/reducers/ventas/interfaces";
import {
  decrementProductInSale,
  deleteProductInSale,
  getProductsBySale,
  resetResponse,
  resetSale,
  saleProducts,
  updateProductByPrice,
} from "../../../../redux/reducers/ventas/ventas.reducer";
import { ProductoPickerModal } from "./ProductoPickerModal";
import { ClientePickerModal } from "./ClientePickerModal";
import ModalLoadingPay from "../Facturacion/ModalLoadingPay";
import { printTable } from "../../../../helpers/functions/printTitle";
import { title } from "../../../../infraestructure/MData/MData";
import {
  openModalAnfitriona,
  activeClientes,
  clearActiveClientes,
} from "../../../../redux/reducers/Admin/clientes-proveedores/clientesProveedoresAnfitrionas.reducer";
import { ClientesModal } from "../../../../components/Modal/Admin/Clientes";
import { AsientoPreview, AsientoSimulado, tasaIgv } from "../../../../components/AsientoPreview";

type TipoDocumento = "boleta" | "factura" | "nota-venta" | "cotizacion";

const TIPO_DOC_DNI = 1;
const TIPO_DOC_RUC = 5;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

// Deja escribir solo numeros con hasta un punto decimal y 2 decimales -- usado en
// todos los campos de monto/porcentaje para que sea imposible teclear negativos,
// letras o formatos invalidos como "1.2.3".
const sanitizeDecimal = (raw: string): string => {
  let v = raw.replace(/[^0-9.]/g, "");
  const firstDot = v.indexOf(".");
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
  }
  const [intPart, decPart] = v.split(".");
  if (decPart !== undefined && decPart.length > 2) {
    v = `${intPart}.${decPart.slice(0, 2)}`;
  }
  return v;
};

const esDecimalValido = (v: string) => DECIMAL_REGEX.test(v);

// Checkboxes del popup "Opc. Avanzadas" -- controla que campo se muestra en el form.
// Los que ya existian antes de esta feature quedan visibles por defecto (true); los
// campos nuevos (SUNAT/logistica) arrancan ocultos hasta que el usuario los active.
const CAMPOS_AVANZADOS: { key: string; label: string; columna: 1 | 2 | 3 }[] = [
  { key: "tipoOperacion", label: "Tipo de Operación", columna: 1 },
  { key: "sucursal", label: "Lista de Sucursales", columna: 1 },
  { key: "fechaDocumento", label: "Fecha del Documento", columna: 1 },
  { key: "placaVehiculo", label: "N° Placa Vehículo", columna: 1 },
  { key: "guiaRemisionManual", label: "N° Guía Remisión Manual", columna: 1 },
  { key: "ubigeo", label: "Ubigeo/Ubicación del Cliente", columna: 1 },
  { key: "etiquetas", label: "Etiquetas", columna: 1 },
  { key: "fechaVencimiento", label: "Fecha Vencimiento del Documento", columna: 2 },
  { key: "numeroOrden", label: "N° de Orden", columna: 2 },
  { key: "colaborador", label: "Lista de Colaboradores", columna: 2 },
  { key: "numeroCelular", label: "Número de Celular", columna: 2 },
  { key: "tipoMoneda", label: "Tipo de Moneda", columna: 3 },
  { key: "tipoCambio", label: "Tipo de Cambio (SUNAT)", columna: 3 },
  { key: "guiaRemisionElectronica", label: "N° Guía Remisión Electrónica", columna: 3 },
  { key: "direccionCliente", label: "Dirección del Cliente", columna: 3 },
  { key: "retencion", label: "Retención", columna: 3 },
  { key: "detraccion", label: "Detracción", columna: 3 },
  { key: "anticipo", label: "Anticipo", columna: 3 },
];

const CAMPOS_VISIBLES_POR_DEFECTO = new Set([
  "fechaDocumento",
  "ubigeo",
  "numeroCelular",
  "direccionCliente",
  "detraccion",
]);

const NuevaFactura = () => {
  const dispatch = useAppDispatch();
  const { errors, setError, clearError, limpiarErrores } = useFormErrors();
  const navigate = useNavigate();
  const { tipo: tipoInicial } = useParams<{ tipo: string }>();
  const [searchParams] = useSearchParams();
  const cotizacionOrigenId = searchParams.get("cotizacionId");
  const pedidoVentaId = searchParams.get("pedidoVentaId");
  const tipoDocumentoInicial: TipoDocumento =
    tipoInicial === "factura" || tipoInicial === "nota-venta" || tipoInicial === "cotizacion" ? tipoInicial : "boleta";

  const { products }: IProductsState = useAppSelector((state: RootState) => state.products);
  const { payMethods, tiposIgv, unidadesMedida, typeDocument, ubigeos, tiposOperacion, monedas, sucursales, colaboradores }: IExtensionesState = useAppSelector((state: RootState) => state.extentions);
  const { productsBySale, message, code, correlative }: ISalesState = useAppSelector(
    (state: RootState) => state.sales
  );

  // XML importados en lote: se revisan y emiten de a uno (el primero ya esta en el formulario).
  const [colaXml, setColaXml] = useState<any[]>([]);
  const [totalXml, setTotalXml] = useState(0);
  const [leyendoXml, setLeyendoXml] = useState(false);
  const xmlInputRef = useRef<HTMLInputElement>(null);
  const [tipoDocIdentId, setTipoDocIdentId] = useState<number>(
    tipoDocumentoInicial === "factura" ? TIPO_DOC_RUC : TIPO_DOC_DNI
  );
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccionCliente, setDireccionCliente] = useState("");
  const [ubigeoId, setUbigeoId] = useState("");
  const [ubigeoLabel, setUbigeoLabel] = useState("");
  const [celular, setCelular] = useState("");
  const CAMPOS_DESBLOQUEADOS = { razonSocial: false, direccion: false, celular: false, ubigeo: false };
  const [camposBloqueados, setCamposBloqueados] = useState(CAMPOS_DESBLOQUEADOS);
  const [enviarEmail, setEnviarEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [metodoPagoId, setMetodoPagoId] = useState<number>(0);
  // No usar toISOString(): convierte a UTC y en timezones negativos (Peru, UTC-5) las horas
  // de la noche caen ya en el dia siguiente en UTC, registrando la fecha de "manana".
  const [fechaVenta, setFechaVenta] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isClientePickerOpen, setIsClientePickerOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [isOpenLoadingPay, setIsOpenLoadingPay] = useState(false);

  const [buscando, setBuscando] = useState(false);
  const [clientesEncontrados, setClientesEncontrados] = useState<any[]>([]);

  const [esCredito, setEsCredito] = useState(false);
  // Dias de credito: los fijos (1/15/20/30/60) mas los que la empresa registro; -1 = "Otro plazo...".
  const [plazosCredito, setPlazosCredito] = useState<number[]>([1, 15, 20, 30, 60]);
  const [diasCredito, setDiasCredito] = useState(30);
  const [nuevoPlazo, setNuevoPlazo] = useState("");
  const [descuentoActivo, setDescuentoActivo] = useState(false);
  const [porcentajeDescuento, setPorcentajeDescuento] = useState("0");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [observacion, setObservacion] = useState("");
  const [modoEnvio, setModoEnvio] = useState<"F" | "S" | "G">("G");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [campos, setCampos] = useState<Record<string, boolean>>(() => {
    const iniciales: Record<string, boolean> = {};
    CAMPOS_AVANZADOS.forEach((c) => {
      iniciales[c.key] = CAMPOS_VISIBLES_POR_DEFECTO.has(c.key);
    });
    return iniciales;
  });
  const toggleCampo = (key: string) => setCampos((prev) => ({ ...prev, [key]: !prev[key] }));

  const [tipoOperacionId, setTipoOperacionId] = useState<number>(0);
  const [sucursalId, setSucursalId] = useState<number>(0);
  const [placaVehiculo, setPlacaVehiculo] = useState("");
  const [guiaRemisionManual, setGuiaRemisionManual] = useState("");
  const [guiaRemisionElectronica, setGuiaRemisionElectronica] = useState("");
  const [etiquetas, setEtiquetas] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [numeroOrden, setNumeroOrden] = useState("");
  const [colaboradorId, setColaboradorId] = useState("");
  const [monedaId, setMonedaId] = useState<number>(0);
  const [tipoCambio, setTipoCambio] = useState("");
  const [montoRetencion, setMontoRetencion] = useState("");
  const [tipoDetraccionId, setTipoDetraccionId] = useState(0);
  const [tiposDetraccion, setTiposDetraccion] = useState<any[]>([]);
  const [montoAnticipo, setMontoAnticipo] = useState("");

  // Solo Cotizacion: hasta cuando es valida. Se guarda como yyyy-MM-dd (input type=date nativo).
  const [fechaVigencia, setFechaVigencia] = useState<string>("");
  const [seriesDocumento, setSeriesDocumento] = useState<Record<string, string>>({});

  useEffect(() => {
    axiosInstance.get("/extensiones/tipos-detraccion").then((r: any) => setTiposDetraccion(r.data?.data ?? [])).catch(() => {});
    axiosInstance.get("/extensiones/plazos-credito").then((r: any) => r.data?.data?.length && setPlazosCredito(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
      return;
    }
    dispatch(resetSale());
    dispatch(getProducts(0, 0, "", 1, 100, undefined, { seVende: true }));
    dispatch(getPayMethods());
    dispatch(getTiposIgv() as any);
    dispatch(getUnidadesMedida() as any);
    dispatch(getTypeDocument());
    dispatch(getAllUbigeos() as any);
    dispatch(getTiposOperacion() as any);
    dispatch(getMonedas() as any);
    dispatch(getSucursales() as any);
    dispatch(getColaboradores() as any);
    axiosInstance
      .get(`/facturacion/series`)
      .then(({ data }: any) => setSeriesDocumento(data?.data ?? {}))
      .catch(() => {});
  }, []);

  // Al convertir una cotizacion (boton "Convertir" en la lista de Cotizaciones) llega
  // ?cotizacionId=X -- se precarga cliente y productos, el resto el vendedor lo confirma como
  // cualquier venta nueva (metodo de pago, etc. no vienen de la cotizacion).
  useEffect(() => {
    if (!cotizacionOrigenId) return;

    axiosInstance
      .get(`/facturacion/cotizacion/${cotizacionOrigenId}/convertir`)
      .then(({ data }: any) => {
        const cotizacion = data?.data;
        if (!cotizacion) return;

        if (cotizacion.numeroDocumento) {
          setTipoDocIdentId(cotizacion.numeroDocumento.length === 11 ? TIPO_DOC_RUC : TIPO_DOC_DNI);
          setNumeroDocumento(cotizacion.numeroDocumento);
        }
        if (cotizacion.razonSocial) setRazonSocial(cotizacion.razonSocial);

        const productos = (cotizacion.comprobanteDetalles || []).map((d: any) => ({
          productoId: d.productoId,
          index: d.productoId,
          nombre: d.producto?.nombre ?? "",
          precio: d.valorUnitario,
          categoriaId: 0,
          categoria: {} as any,
          nombreCategoria: "",
          proveedor: null,
          codigoBarra: "",
          precioVentaSinInpuesto: 0,
          precioVentaConInpuesto: 0,
          margenGanancia: 0,
          cambioPrecioPermitido: true,
          stock: d.producto?.stock ?? 0,
          cantidad: d.cantidad,
          rutaImagen: d.producto?.rutaImagen ?? "",
          comentarios: [],
          totalFicha: d.valorUnitarioTotal,
          tipoIgvId: d.tipoIgvId,
          unidadMedidaId: d.unidadMedidaId,
        }));

        dispatch(updateProductByPrice(productos) as any);
        toast.success("Cotización cargada: revisa los datos antes de emitir");
      })
      .catch((error: any) => {
        toast.error(error?.response?.data?.message ?? "No se pudo cargar la cotización");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cotizacionOrigenId]);

  useEffect(() => {
    printTable(`${title.name}::NUEVA FACTURA`);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        generarFacturaRef.current?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (message === "") return;
    if (code === 1) {
      toast.success(correlative ? `${message}: ${correlative}` : message);
      if (colaXml.length > 0) {
        // Lote de XML: en vez de ir a "pago exitoso" se carga el siguiente documento.
        setEnviando(false);
        setIsOpenLoadingPay(false);
        siguienteXml();
      }
      setTimeout(() => dispatch(resetResponse()), 1000);
    }
    if (code === 100) {
      setEnviando(false);
      setIsOpenLoadingPay(false);
      toast.error(message);
      setTimeout(() => dispatch(resetResponse()), 1000);
    }
  }, [message, code]);

  // Default al agregar un producto: Gravado ("10") / Unidad ("NIU"), resueltos desde los
  // catalogos cargados -- si aun no cargaron, se deja sin id y el backend trata null como Gravado/NIU.
  const tipoIgvGravadoId = (tiposIgv as any[])?.find((t) => t.codigo === "10")?.id;
  const unidadMedidaNiuId = (unidadesMedida as any[])?.find((u) => u.codigo === "NIU")?.id;

  // Emitir desde un pedido de venta (flujo completo): se precargan cliente y lo entregado que aun no
  // se facturo. El stock ya bajo en la entrega, por eso el backend no lo descuenta de nuevo.
  useEffect(() => {
    if (!pedidoVentaId || (products as any[]).length === 0 || tipoIgvGravadoId === undefined) return;

    axiosInstance
      .get(`/pedidos-venta/${pedidoVentaId}`)
      .then(({ data }: any) => {
        const pedido = data?.data;
        if (!pedido) return;

        if (pedido.numeroDocumento) {
          setTipoDocIdentId(pedido.numeroDocumento.length === 11 ? TIPO_DOC_RUC : TIPO_DOC_DNI);
          setNumeroDocumento(pedido.numeroDocumento);
        }
        if (pedido.razonSocial) setRazonSocial(pedido.razonSocial);
        if (pedido.direccionCliente) setDireccionCliente(pedido.direccionCliente);

        const productos = (pedido.detalle || []).flatMap((d: any) => {
          const porFacturar = d.cantidadEntregada - d.cantidadFacturada;
          const p: any = (products as any[]).find((x) => (x.productoId ?? x.id) === d.productoId);
          if (porFacturar <= 0 || !p) return [];
          return [
            {
              ...p,
              productoId: d.productoId,
              index: d.productoId,
              precio: d.valorUnitario,
              cantidad: porFacturar,
              totalFicha: d.valorUnitario * porFacturar,
              tipoIgvId: d.tipoIgvId ?? tipoIgvGravadoId,
              unidadMedidaId: d.unidadMedidaId ?? unidadMedidaNiuId,
            },
          ];
        });

        dispatch(resetSale());
        dispatch(updateProductByPrice(productos) as any);
        if (productos.length === 0) toast.error("El pedido no tiene mercadería entregada pendiente de facturar");
        else toast.success("Pedido cargado: revisa los datos antes de emitir");
      })
      .catch((error: any) => toast.error(error?.response?.data?.message ?? "No se pudo cargar el pedido de venta"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoVentaId, (products as any[]).length, tipoIgvGravadoId]);


  const subtotalBruto = productsBySale.reduce(
    (acc, item: any) => acc + item.precio * item.cantidad,
    0
  );

  // IGV real sumado por linea segun el % de su Tipo IGV (18, 10.5, 11...; Exonerado/Inafecto no paga).
  const igvBruto = productsBySale.reduce((acc: number, item: any) => {
    const tasa = tasaIgv((tiposIgv as any[])?.find((t) => t.id === item.tipoIgvId));
    const importeLinea = item.precio * item.cantidad;
    return acc + (importeLinea - importeLinea / (1 + tasa / 100));
  }, 0);

  const montoDescuento = descuentoActivo
    ? Math.round(((subtotalBruto * Number(porcentajeDescuento || 0)) / 100) * 100) / 100
    : 0;
  const total = subtotalBruto - montoDescuento;
  const factorDescuento = subtotalBruto > 0 ? total / subtotalBruto : 1;

  const subtotal = (subtotalBruto - igvBruto) * factorDescuento;
  const igv = igvBruto * factorDescuento;

  const vuelto = montoRecibido !== "" ? Number(montoRecibido) - total : 0;

  // El descuento se prorratea sobre cada linea (el backend valida Total == suma del detalle);
  // el residual de redondeo entre lineas se ajusta en la ultima para que la suma cuadre exacto.
  const armarDetalle = () => {
    const detalleComprobante = productsBySale.map((item: any) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
      valorUnitario: Math.round(item.precio * factorDescuento * 100) / 100,
      tipoIgvId: item.tipoIgvId,
      unidadMedidaId: item.unidadMedidaId,
    }));
    const sumaAjustada = detalleComprobante.reduce((acc: number, l: any) => acc + l.valorUnitario * l.cantidad, 0);
    const residual = Math.round((total - sumaAjustada) * 100) / 100;
    if (residual !== 0 && detalleComprobante.length > 0) {
      const ultima = detalleComprobante[detalleComprobante.length - 1];
      ultima.valorUnitario = Math.round((ultima.valorUnitario + residual / ultima.cantidad) * 100) / 100;
    }
    return detalleComprobante;
  };

  // Vista previa del asiento con las cuentas configuradas: la calcula el backend con las mismas reglas
  // que la venta, sin guardar. Si falla, AsientoPreview cae a los codigos por defecto.
  const [asientosSimulados, setAsientosSimulados] = useState<AsientoSimulado[] | null>(null);
  const firmaPreview = JSON.stringify([productsBySale.map((p: any) => [p.productoId, p.cantidad, p.precio, p.tipoIgvId]), total, esCredito, numeroDocumento, pedidoVentaId]);
  useEffect(() => {
    if (productsBySale.length === 0) { setAsientosSimulados(null); return; }
    const t = setTimeout(() => {
      axiosInstance
        .post("/facturacion/simular-asiento", { tipoDocumentoVentaId, numeroDocumento, esCredito, total, pedidoVentaId: pedidoVentaId ? Number(pedidoVentaId) : undefined, detalleComprobante: armarDetalle() })
        .then((r: any) => setAsientosSimulados(r.data?.data ?? null))
        .catch(() => setAsientosSimulados(null));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firmaPreview]);

  const agregarProductos = (seleccionados: any[]) => {
    seleccionados.forEach((p) =>
      dispatch(
        getProductsBySale({
          ...p,
          tipoIgvId: tipoIgvGravadoId,
          unidadMedidaId: unidadMedidaNiuId,
        }) as any
      )
    );
    if (seleccionados.length > 0) {
      toast.success(`${seleccionados.length} producto(s) agregado(s)`);
    }
  };

  // Precarga cliente y productos desde un XML leido. Las lineas se emparejan con el catalogo por
  // codigo de barra o nombre; las que no se encuentran se avisan para agregarlas a mano.
  const cargarXmlEnFormulario = (xml: any) => {
    const doc = xml.clienteNumeroDocumento ?? "";
    if (doc) {
      setTipoDocIdentId(doc.length === 11 ? TIPO_DOC_RUC : TIPO_DOC_DNI);
      setNumeroDocumento(doc);
    }
    setRazonSocial(xml.clienteRazonSocial ?? "");
    setDireccionCliente(xml.clienteDireccion ?? "");

    const norm = (t?: string) => (t ?? "").trim().toLowerCase();
    const sinEncontrar: string[] = [];
    const productos = (xml.lineas ?? []).flatMap((l: any) => {
      const p: any = (products as any[]).find(
        (x) => (l.codigo && norm(x.codigoBarra) === norm(l.codigo)) || norm(x.nombre) === norm(l.descripcion)
      );
      if (!p) {
        sinEncontrar.push(l.descripcion);
        return [];
      }
      return [
        {
          ...p,
          productoId: p.productoId ?? p.id,
          index: p.productoId ?? p.id,
          precio: l.precioUnitario,
          cantidad: l.cantidad,
          totalFicha: l.precioUnitario * l.cantidad,
          tipoIgvId: tipoIgvGravadoId,
          unidadMedidaId: unidadMedidaNiuId,
        },
      ];
    });

    dispatch(resetSale());
    dispatch(updateProductByPrice(productos) as any);
    if (sinEncontrar.length > 0) toast.error(`Sin coincidir en el catálogo (agrégalos a mano): ${sinEncontrar.join(", ")}`);
  };

  const handleXmlSeleccionado = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (archivos.length === 0) return;

    setLeyendoXml(true);
    const resultados = await Promise.allSettled(
      archivos.map((a) => {
        const fd = new FormData();
        fd.append("archivo", a);
        return axiosInstance
          .post(`/facturacion/importar-xml`, fd, { headers: { "Content-Type": "multipart/form-data" } })
          .then((r: any) => r.data?.data);
      })
    );
    setLeyendoXml(false);

    const leidos = resultados.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
    if (leidos.length < archivos.length) toast.error(`${archivos.length - leidos.length} XML no se pudieron leer`);
    if (leidos.length === 0) return;

    setColaXml(leidos.slice(1));
    setTotalXml(leidos.length);
    cargarXmlEnFormulario(leidos[0]);
    toast.success(`${leidos.length} XML leído(s): revisa y emite uno por uno`);
  };

  // Tras emitir con exito, si quedan XML en cola se carga el siguiente en vez de quedarse vacio.
  const siguienteXml = () => {
    if (colaXml.length === 0) return;
    cargarXmlEnFormulario(colaXml[0]);
    setColaXml(colaXml.slice(1));
  };

  const restar = (item: any) => dispatch(decrementProductInSale(item) as any);
  const sumar = (item: any) => dispatch(getProductsBySale(item) as any);
  const eliminar = (productoId: number) => dispatch(deleteProductInSale(productoId) as any);

  // Solo para productos con "cambio de precio permitido" (ver columna P. Unit.).
  const cambiarPrecio = (productoId: number, valor: string) => {
    const precio = parseFloat(valor);
    if (isNaN(precio) || precio < 0) {
      toast.error("Precio inválido");
      return;
    }
    const actualizados = productsBySale.map((p: any) =>
      p.productoId === productoId ? { ...p, precio, totalFicha: precio * p.cantidad } : p
    );
    dispatch(updateProductByPrice(actualizados) as any);
  };

  const cambiarUnidadMedida = (productoId: number, unidadMedidaId: number) => {
    const actualizados = productsBySale.map((p: any) =>
      p.productoId === productoId ? { ...p, unidadMedidaId } : p
    );
    dispatch(updateProductByPrice(actualizados) as any);
  };

  // Al vender a credito el backend ignora DetallePago por completo (no se cobra nada ahora, queda
  // en Cuentas por Cobrar) -- se limpian los campos de pago para que no quede una forma de pago o
  // un descuento "por cobrar ahora" puesto pero inaplicable.
  const toggleCredito = (activo: boolean) => {
    setEsCredito(activo);
    if (activo) {
      setMetodoPagoId(0);
      setDescuentoActivo(false);
      setPorcentajeDescuento("0");
      setMontoRecibido("");
    }
  };

  // Vencimiento de la venta a credito = fecha del documento + dias de credito (yyyy-MM-dd, sin pasar por UTC).
  const vencimientoCredito = (() => {
    if (!esCredito || diasCredito < 1 || !fechaVenta) return "";
    const d = new Date(`${fechaVenta}T00:00:00`);
    d.setDate(d.getDate() + diasCredito);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  // "Otro plazo...": lo registra en la tabla de la empresa y queda elegido; la proxima vez ya sale en la lista.
  const registrarPlazo = async () => {
    const dias = parseInt(nuevoPlazo, 10);
    if (!(dias >= 1 && dias <= 365)) return toast.error("Los días de crédito deben estar entre 1 y 365");
    try {
      await axiosInstance.post("/extensiones/plazos-credito/crear", { dias });
      setPlazosCredito((prev) => Array.from(new Set([...prev, dias])).sort((x, y) => x - y));
      setDiasCredito(dias);
      setNuevoPlazo("");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo registrar el plazo");
    }
  };

  // Mismo formato "DEP/PROV/DIST" que muestra SelectUbigeo al elegir una opcion.
  const etiquetaUbigeo = (id: any) => {
    const u = (ubigeos as any[])?.find((x) => String(x.ubigeoId) === String(id));
    return u ? `${u.departamento}/${u.provincia}/${u.distrito}` : "";
  };

  const seleccionarCliente = (c: any) => {
    setRazonSocial(c?.nombre ?? "");
    setNumeroDocumento(c?.numeroDocumento ?? "");
    if (c?.tipoDocumentoId) setTipoDocIdentId(c.tipoDocumentoId);
    setDireccionCliente(c?.direccion ?? "");
    setCelular(c?.telefono ?? "");
    setEmail(c?.email ?? "");
    // Siempre se fija (incluso vacio) -- si no, un ubigeo de una busqueda anterior se queda
    // pegado en pantalla aunque el cliente nuevo no tenga uno.
    const labelUbigeo = c?.ubigeoId ? etiquetaUbigeo(c.ubigeoId) : "";
    setUbigeoId(labelUbigeo ? String(c.ubigeoId) : "");
    setUbigeoLabel(labelUbigeo);
    setClientesEncontrados([]);
    // Cliente ya registrado: los campos que trae la ficha se bloquean para no pisar el dato
    // oficial por error; los que vienen vacios se dejan editables.
    setCamposBloqueados({
      razonSocial: !!c?.nombre,
      direccion: !!c?.direccion,
      celular: !!c?.telefono,
      ubigeo: !!labelUbigeo,
    });
  };

  // Busca primero en clientes ya registrados; si no hay coincidencias y es un RUC (11 digitos),
  // cae a la consulta SUNAT (peruapi.com, proxeada por el backend) para autocompletar Razon Social/Direccion.
  const buscarClienteEnRuc = async (ruc: string) => {
    try {
      const { data }: any = await axiosInstance.get(`/extensiones/ruc/${ruc}`);
      const info = data?.data;
      if (!info?.razonSocial) {
        setCamposBloqueados(CAMPOS_DESBLOQUEADOS);
        return toast.error("No se encontró el cliente, complétalo manualmente");
      }
      setRazonSocial(info.razonSocial);
      setDireccionCliente(info.direccion || "");
      setCelular(""); // el RUC no trae celular -- limpia lo que haya quedado de una busqueda anterior
      const labelUbigeo = info.ubigeoId ? etiquetaUbigeo(info.ubigeoId) : "";
      const ubigeoEncontrado = !!labelUbigeo;
      setUbigeoId(ubigeoEncontrado ? String(info.ubigeoId) : "");
      setUbigeoLabel(labelUbigeo);
      setCamposBloqueados({ razonSocial: true, direccion: !!info.direccion, celular: false, ubigeo: ubigeoEncontrado });
      toast.success("Datos obtenidos de RUC (SUNAT)");
    } catch {
      setCamposBloqueados(CAMPOS_DESBLOQUEADOS);
      toast.error("No se encontró el cliente, complétalo manualmente");
    }
  };

  // Mismo fallback que el RUC pero para DNI (8 digitos), contra el webhook de consulta de pacientes.
  const buscarClienteEnDni = async (dni: string) => {
    try {
      const { data }: any = await axiosInstance.get(`/extensiones/dni/${dni}`);
      const info = data?.data;
      if (!info?.razonSocial) {
        setCamposBloqueados(CAMPOS_DESBLOQUEADOS);
        return toast.error("No se encontró el cliente, complétalo manualmente");
      }
      setRazonSocial(info.razonSocial);
      setDireccionCliente(""); // el DNI no trae direccion/ubigeo -- limpia lo que haya quedado antes
      setUbigeoId("");
      setUbigeoLabel("");
      const celularLimpio = info.celular ? String(info.celular).replace(/\D/g, "") : "";
      setCelular(celularLimpio);
      setCamposBloqueados({ razonSocial: true, direccion: false, celular: !!celularLimpio, ubigeo: false });
      toast.success("Datos obtenidos de DNI");
    } catch {
      setCamposBloqueados(CAMPOS_DESBLOQUEADOS);
      toast.error("No se encontró el cliente, complétalo manualmente");
    }
  };

  const buscarCliente = async () => {
    const termino = numeroDocumento.trim();
    if (termino.length < 3) {
      return toast.error("Escribe al menos 3 caracteres del número de documento");
    }
    setBuscando(true);
    setCamposBloqueados(CAMPOS_DESBLOQUEADOS);
    try {
      const { data }: any = await axiosInstance.get(`/clientes/listar?value=${termino}&Amount=20`);
      const items = data?.data?.items ?? [];
      setClientesEncontrados(items);
      if (items.length === 1) seleccionarCliente(items[0]);
    } catch (error: any) {
      setClientesEncontrados([]);
      // El backend responde 404 cuando no hay clientes que coincidan (no es un error real),
      // asi que ese caso especifico cae al fallback de RUC en vez de mostrar "Error al buscar".
      if (error?.response?.status === 404) {
        if (tipoDocIdentId === TIPO_DOC_RUC && termino.length === 11) {
          await buscarClienteEnRuc(termino);
        } else if (tipoDocIdentId === TIPO_DOC_DNI && termino.length === 8) {
          await buscarClienteEnDni(termino);
        } else {
          setCamposBloqueados(CAMPOS_DESBLOQUEADOS);
          toast.error("No se encontró el cliente, complétalo manualmente");
        }
      } else {
        setCamposBloqueados(CAMPOS_DESBLOQUEADOS);
        toast.error("Error al buscar cliente");
      }
    } finally {
      setBuscando(false);
    }
  };

  const abrirRegistroCliente = () => {
    dispatch(activeClientes({ numeroDocumento: numeroDocumento.trim(), tipoDocumentoId: tipoDocIdentId }) as any);
    dispatch(openModalAnfitriona() as any);
  };

  const clienteRegistrado = (c: any) => {
    dispatch(clearActiveClientes() as any);
    seleccionarCliente(c);
  };

  const metodoPagoSeleccionado = (payMethods as any[])?.find((m) => m.id === metodoPagoId);
  // Al contado arranca en Efectivo (lo mas comun) para no obligar a elegirlo en cada venta.
  const efectivoId = (payMethods as any[])?.find((m) => String(m.value).toUpperCase().includes("EFECTIVO"))?.id ?? 0;
  useEffect(() => {
    if (!esCredito && metodoPagoId === 0 && efectivoId) setMetodoPagoId(efectivoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esCredito, efectivoId, metodoPagoId]);

  const tipoDocumentoVentaId =
    tipoDocumentoInicial === "boleta" ? 2 : tipoDocumentoInicial === "factura" ? 1 : tipoDocumentoInicial === "cotizacion" ? 6 : 3;

  const tipoDocSeleccionado = (typeDocument as any[])?.find((t) => t.id === tipoDocIdentId);
  const labelNumeroDocumento = tipoDocSeleccionado ? `N° de ${tipoDocSeleccionado.value}` : "N° de Documento";

  // Factura exige RUC (persona juridica); Boleta/Nota de venta son para persona natural, asi
  // que no tiene sentido ofrecer RUC ahi -- se filtra el catalogo en vez de solo validar al guardar.
  const tiposDocumentoDisponibles = (typeDocument as any[])?.filter((t) =>
    tipoDocumentoInicial === "factura" ? t.id === TIPO_DOC_RUC : t.id !== TIPO_DOC_RUC
  );

  const generarFactura = () => {
    limpiarErrores();
    const marcar = (campo: string, mensaje: string) => {
      setError(campo, mensaje);
      toast.error(mensaje);
    };

    if (razonSocial.trim().length < 3) {
      return marcar("razonSocial", "La Razón Social debe tener al menos 3 caracteres");
    }
    if (/^\d+$/.test(razonSocial.trim())) {
      return marcar("razonSocial", "La Razón Social no puede contener solo números");
    }
    if (numeroDocumento.trim() === "") {
      return marcar("numeroDocumento", "El número de documento es obligatorio");
    }
    if (tipoDocIdentId === TIPO_DOC_DNI && numeroDocumento.trim().length !== 8) {
      return marcar("numeroDocumento", "El DNI debe tener 8 dígitos");
    }
    if (tipoDocIdentId === TIPO_DOC_RUC && numeroDocumento.trim().length !== 11) {
      return marcar("numeroDocumento", "El RUC debe tener 11 dígitos");
    }
    if (tipoDocumentoInicial === "factura" && tipoDocIdentId !== TIPO_DOC_RUC) {
      return marcar("tipoDocIdentId", "Para Factura, el tipo de documento debe ser RUC");
    }
    if (celular.trim() !== "" && celular.trim().length !== 9) {
      return marcar("celular", "El número de celular debe tener 9 dígitos");
    }
    if (enviarEmail) {
      if (email.trim() === "") {
        return marcar("email", "Ingresa el email del cliente o desactiva el envío por email");
      }
      if (!EMAIL_REGEX.test(email.trim())) {
        return marcar("email", "El email del cliente no es válido");
      }
    }
    if (productsBySale.length === 0) {
      return marcar("productos", "Agrega al menos un producto");
    }
    if (total <= 0) {
      return marcar("productos", "El total de la venta debe ser mayor a 0");
    }

    if (descuentoActivo) {
      if (porcentajeDescuento.trim() === "" || !esDecimalValido(porcentajeDescuento)) {
        return marcar("porcentajeDescuento", "Ingresa un porcentaje de descuento válido (máx. 2 decimales)");
      }
      const pct = Number(porcentajeDescuento);
      if (pct <= 0 || pct > 100) {
        return marcar("porcentajeDescuento", "El descuento debe ser mayor a 0% y no puede superar 100%");
      }
    }

    if (montoRecibido !== "") {
      if (!esDecimalValido(montoRecibido)) {
        return marcar("montoRecibido", "El Total Recibido no es válido (máx. 2 decimales)");
      }
      if (!esCredito && Number(montoRecibido) < total) {
        return marcar("montoRecibido", "El Total Recibido es menor al Total a pagar");
      }
    }

    if (campos.tipoCambio && tipoCambio !== "" && !esDecimalValido(tipoCambio)) {
      return marcar("tipoCambio", "El Tipo de Cambio no es válido (máx. 2 decimales)");
    }
    if (campos.retencion && montoRetencion !== "" && !esDecimalValido(montoRetencion)) {
      return marcar("montoRetencion", "El monto de Retención no es válido (máx. 2 decimales)");
    }
    if (campos.anticipo && montoAnticipo !== "" && !esDecimalValido(montoAnticipo)) {
      return marcar("montoAnticipo", "El monto de Anticipo no es válido (máx. 2 decimales)");
    }

    let detallePago: { metodoPagoId: number; monto: number; referenciaOperacion: string }[];

    if (esCredito && diasCredito < 1) {
      return toast.error("Registra los días de crédito (✓) o elige un plazo de la lista");
    }
    if (esCredito) {
      // El backend ignora DetallePago cuando EsCredito=true (ver ComprobanteRepository.
      // CrearComprobante): no se cobra nada ahora, queda pendiente en Cuentas por Cobrar.
      detallePago = [];
    } else {
      if (metodoPagoId === 0) {
        return toast.error("Elige un método de pago");
      }
      detallePago = [{ metodoPagoId, monto: total, referenciaOperacion: "" }];
    }

    const detalleComprobante = armarDetalle();

    const payload: ISaleProduct = {
      clientId: null,
      tipoDocumentoVentaId,
      tipoDocumentoId: tipoDocIdentId,
      numeroDocumento,
      razonSocial: razonSocial.trim(),
      ruc: tipoDocIdentId === TIPO_DOC_RUC ? numeroDocumento : "",
      direccionCliente: direccionCliente.trim() || undefined,
      ubigeoId: ubigeoId || undefined,
      celular: celular.trim() || undefined,
      email: email.trim() || undefined,
      efectivo: metodoPagoSeleccionado?.value?.toUpperCase() || "",
      tipoVenta: tipoDocumentoInicial,
      total,
      fechaVenta,
      esEcommerce: false,
      tipoEnvio: "LOCAL",
      distrito: "",
      esCredito,
      porcentajeDescuento: descuentoActivo ? Number(porcentajeDescuento) : undefined,
      montoDescuento: descuentoActivo ? montoDescuento : undefined,
      montoRecibido: montoRecibido !== "" ? Number(montoRecibido) : undefined,
      vuelto: montoRecibido !== "" ? Math.max(vuelto, 0) : undefined,
      observacion: observacion.trim() || undefined,
      modoEnvio,
      sucursalId: campos.sucursal && sucursalId !== 0 ? sucursalId : undefined,
      tipoOperacionId: campos.tipoOperacion && tipoOperacionId !== 0 ? tipoOperacionId : undefined,
      placaVehiculo: campos.placaVehiculo ? placaVehiculo.trim() || undefined : undefined,
      guiaRemisionManual: campos.guiaRemisionManual ? guiaRemisionManual.trim() || undefined : undefined,
      guiaRemisionElectronica: campos.guiaRemisionElectronica ? guiaRemisionElectronica.trim() || undefined : undefined,
      etiquetas: campos.etiquetas ? etiquetas.trim() || undefined : undefined,
      fechaVencimiento: vencimientoCredito || (campos.fechaVencimiento ? fechaVencimiento || undefined : undefined),
      numeroOrden: campos.numeroOrden ? numeroOrden.trim() || undefined : undefined,
      colaboradorId: campos.colaborador && colaboradorId !== "" ? colaboradorId : undefined,
      monedaId: campos.tipoMoneda && monedaId !== 0 ? monedaId : undefined,
      tipoCambio: campos.tipoCambio && tipoCambio !== "" ? Number(tipoCambio) : undefined,
      montoRetencion: campos.retencion && montoRetencion !== "" ? Number(montoRetencion) : undefined,
      tipoDetraccionId: campos.detraccion && tipoDetraccionId !== 0 ? tipoDetraccionId : undefined,
      fechaVigencia: tipoDocumentoInicial === "cotizacion" && fechaVigencia ? fechaVigencia : undefined,
      cotizacionOrigenId: cotizacionOrigenId ? Number(cotizacionOrigenId) : undefined,
      pedidoVentaId: pedidoVentaId ? Number(pedidoVentaId) : undefined,
      montoAnticipo: campos.anticipo && montoAnticipo !== "" ? Number(montoAnticipo) : undefined,
      detalleComprobante,
      detallePago,
    };

    setEnviando(true);
    setIsOpenLoadingPay(true);
    dispatch(saleProducts(payload) as any);
  };

  const generarFacturaRef = useRef(generarFactura);
  generarFacturaRef.current = generarFactura;

  const limpiar = () => {
    setTipoDocIdentId(tipoDocumentoInicial === "factura" ? TIPO_DOC_RUC : TIPO_DOC_DNI);
    setNumeroDocumento("");
    setCamposBloqueados(CAMPOS_DESBLOQUEADOS);
    setRazonSocial("");
    setDireccionCliente("");
    setUbigeoId("");
    setUbigeoLabel("");
    setCelular("");
    setEnviarEmail(false);
    setEmail("");
    setMetodoPagoId(0);
    setClientesEncontrados([]);
    setEsCredito(false);
    setDescuentoActivo(false);
    setPorcentajeDescuento("0");
    setMontoRecibido("");
    setObservacion("");
    setModoEnvio("G");
    setTipoOperacionId(0);
    setSucursalId(0);
    setPlacaVehiculo("");
    setGuiaRemisionManual("");
    setGuiaRemisionElectronica("");
    setEtiquetas("");
    setFechaVencimiento("");
    setNumeroOrden("");
    setColaboradorId("");
    setMonedaId(0);
    setTipoCambio("");
    setMontoRetencion("");
    setMontoAnticipo("");
    dispatch(resetSale());
  };

  const DOC: Record<TipoDocumento, [string, string, string | undefined]> = {
    factura: ["Nueva Factura", "Factura", seriesDocumento.factura],
    boleta: ["Nueva Boleta", "Boleta", seriesDocumento.boleta],
    cotizacion: ["Nueva Cotización", "Cotización", seriesDocumento.cotizacion],
    "nota-venta": ["Nueva Nota de Venta", "Nota de venta", seriesDocumento.notaVenta],
  };
  const [tituloForm, etiquetaDoc, serieDoc] = DOC[tipoDocumentoInicial];

  return (
    <div>
      <Toaster richColors position="top-right" />
      <div className={comprasStyles.registrarHeader}>
        <button type="button" className={comprasStyles.backBtn} onClick={() => navigate(-1)} title="Volver">
          ←
        </button>
        <div>
          <h3>{tituloForm}</h3>
          <p className={comprasStyles.subtitle}>
            {totalXml > 1
              ? `Documento ${totalXml - colaXml.length} de ${totalXml}: revisa y guarda para pasar al siguiente.`
              : "Completa los datos del comprobante y del cliente."}
          </p>
        </div>
        <button type="button" className={comprasStyles.historialBtn} onClick={() => xmlInputRef.current?.click()} disabled={leyendoXml}
          title="Carga cliente y productos desde uno o varios XML">
          📄 {leyendoXml ? "Leyendo XML..." : "Subir XML"}
        </button>
        <input ref={xmlInputRef} type="file" accept=".xml" multiple hidden onChange={handleXmlSeleccionado} />
        <div className={styles.advancedWrap}>
          <button type="button" className={styles.advancedBtn} onClick={() => setShowAdvanced((v) => !v)}>
            <Icon icon="mdi:cog-outline" /> Opc. Avanzadas <Icon icon="mdi:chevron-down" />
          </button>
          {showAdvanced && (
            <>
              <div className={styles.advancedBackdrop} onClick={() => setShowAdvanced(false)} />
              <div className={styles.advancedPanel}>
                {[1, 2, 3].map((col) => (
                  <div key={col} className={styles.advancedColumn}>
                    {CAMPOS_AVANZADOS.filter((c) => c.columna === col).map((c) => (
                      <label key={c.key} className={styles.advancedItem}>
                        <input type="checkbox" checked={!!campos[c.key]} onChange={() => toggleCampo(c.key)} />
                        {c.label}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={f.hoja}>
        <div className={f.cabecera}>
          <div>
            <div className={f.campo}>
              <label className={f.req}>Cliente</label>
              <div>
                <div className={f.buscarRow}>
                  <select
                    className={f.tipoDoc}
                    style={{ width: "auto", maxWidth: 120, ...estiloError(!!errors.tipoDocIdentId) }}
                    value={tipoDocIdentId}
                    onChange={(e) => {
                      setTipoDocIdentId(Number(e.target.value));
                      clearError("tipoDocIdentId");
                    }}
                  >
                    {tiposDocumentoDisponibles?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.value}
                      </option>
                    ))}
                  </select>
                  <input
                    className={f.input}
                    placeholder={labelNumeroDocumento}
                    value={numeroDocumento}
                    maxLength={tipoDocIdentId === TIPO_DOC_DNI ? 8 : tipoDocIdentId === TIPO_DOC_RUC ? 11 : 20}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const esNumerico = tipoDocIdentId === TIPO_DOC_DNI || tipoDocIdentId === TIPO_DOC_RUC;
                      const limpio = esNumerico
                        ? e.target.value.replace(/\D/g, "")
                        : e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                      setNumeroDocumento(limpio);
                      // Cambiar el numero de documento invalida los datos bloqueados del cliente anterior.
                      setCamposBloqueados(CAMPOS_DESBLOQUEADOS);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && buscarCliente()}
                    style={estiloError(!!errors.numeroDocumento)}
                  />
                  <button type="button" className={f.buscarBtn} onClick={() => setIsClientePickerOpen(true)} disabled={buscando} title="Buscar cliente">🔍</button>
                  <button type="button" className={f.buscarBtn} onClick={abrirRegistroCliente} title="Registrar nuevo cliente">➕</button>
                </div>
                <CampoError mensaje={errors.tipoDocIdentId} />
                <CampoError mensaje={errors.numeroDocumento} />
              </div>
            </div>
            <div className={f.campo}>
              <label />
              <div>
                <input
                  className={f.input}
                  placeholder="Razón social / Nombre"
                  value={razonSocial}
                  disabled={camposBloqueados.razonSocial}
                  style={estiloError(!!errors.razonSocial)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setRazonSocial(e.target.value);
                    clearError("razonSocial");
                  }}
                />
                <CampoError mensaje={errors.razonSocial} />
              </div>
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

            {campos.direccionCliente && (
              <div className={f.campo}>
                <label>Dirección</label>
                <input
                  className={f.input}
                  placeholder="Dirección completa"
                  value={direccionCliente}
                  disabled={camposBloqueados.direccion}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDireccionCliente(e.target.value)}
                />
              </div>
            )}
            {campos.ubigeo && (
              <div className={f.campo}>
                <label>Ubigeo</label>
                <SelectUbigeo
                  isSearch
                  disabled={camposBloqueados.ubigeo}
                  placeholder="Código de ubigeo"
                  name="ubigeo"
                  id="ubigeoId"
                  defaultValue={ubigeoLabel}
                  options={(ubigeos as any[]) ?? []}
                  onChange={(idValue: any, value: string) => {
                    setUbigeoId(String(idValue));
                    setUbigeoLabel(value);
                  }}
                />
              </div>
            )}
            {campos.numeroCelular && (
              <div className={f.campo}>
                <label>Num. celular</label>
                <div>
                  <input
                    className={f.input}
                    placeholder="Número de celular"
                    value={celular}
                    maxLength={9}
                    disabled={camposBloqueados.celular}
                    style={estiloError(!!errors.celular)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setCelular(e.target.value.replace(/\D/g, ""));
                      clearError("celular");
                    }}
                  />
                  <CampoError mensaje={errors.celular} />
                </div>
              </div>
            )}
          </div>

          <div>
            {campos.fechaDocumento && (
              <div className={f.campo}>
                <label>Fecha</label>
                <input type="date" className={f.input} value={fechaVenta} onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaVenta(e.target.value)} />
              </div>
            )}
            {tipoDocumentoInicial === "cotizacion" && (
              <div className={f.campo}>
                <label>Válida hasta (opcional)</label>
                <input type="date" className={f.input} value={fechaVigencia} onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaVigencia(e.target.value)} />
              </div>
            )}
            <div className={f.campo}>
              <label className={f.checkLabel}>
                Al crédito
                <input type="checkbox" checked={esCredito} onChange={(e) => toggleCredito(e.target.checked)} />
              </label>
              {esCredito ? (
                <div>
                  <div className={diasCredito === -1 ? f.dosCol : undefined}>
                    <select className={f.input} title="Días de crédito" value={diasCredito} onChange={(e) => setDiasCredito(Number(e.target.value))}>
                      {plazosCredito.map((d) => (
                        <option key={d} value={d}>
                          {d} {d === 1 ? "día" : "días"} de crédito
                        </option>
                      ))}
                      <option value={-1}>Otro plazo...</option>
                    </select>
                    {diasCredito === -1 && (
                      <div className={f.buscarRow}>
                        <input className={f.input} type="number" min={1} max={365} placeholder="Días" autoFocus value={nuevoPlazo}
                          onChange={(e) => setNuevoPlazo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && registrarPlazo()} />
                        <button type="button" className={f.buscarBtn} onClick={registrarPlazo} title="Registrar este plazo">✓</button>
                      </div>
                    )}
                  </div>
                  {vencimientoCredito && <small style={{ color: "#667085" }}>Vence el {vencimientoCredito.split("-").reverse().join("/")}</small>}
                </div>
              ) : (
                <select className={f.input} value={metodoPagoId} onChange={(e) => setMetodoPagoId(Number(e.target.value))}>
                  <option value={0}>Forma de pago</option>
                  {(payMethods as any[])?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.value}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className={f.campo}>
              <label className={f.checkLabel} title="¿Deseas enviar el comprobante electrónico al email del cliente?">
                Enviar al email
                <input type="checkbox" checked={enviarEmail} onChange={(e) => setEnviarEmail(e.target.checked)} />
              </label>
              <div>
                <input
                  type="email"
                  className={f.input}
                  placeholder={enviarEmail ? "Email del cliente" : "Comprobante electrónico al email del cliente"}
                  value={email}
                  disabled={!enviarEmail}
                  style={estiloError(!!errors.email)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                />
                <CampoError mensaje={errors.email} />
              </div>
            </div>
          </div>

          <div>
            <div className={f.campo}>
              <label>{etiquetaDoc} #</label>
              <div className={f.dosCol}>
                <input className={f.input} readOnly value={serieDoc ?? "..."} title="Serie" />
                <input className={f.input} readOnly value={correlative || "Se asigna al guardar"} title="Correlativo" />
              </div>
            </div>
            <div className={f.campo}>
              <label>Observación</label>
              <textarea className={f.notas} rows={4} placeholder="Escribe aquí una observación" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Datos adicionales (los que se activan en Opc. Avanzadas): mismas 3 columnas de la cabecera. */}
        <div className={f.cabecera}>
          {campos.tipoOperacion && (
            <div className={f.campo}>
              <label>Tipo de Operación</label>
              <select className={f.input} value={tipoOperacionId} onChange={(e) => setTipoOperacionId(Number(e.target.value))}>
                <option value={0}>Selecciona un tipo de operación</option>
                {(tiposOperacion as any[])?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.value}
                  </option>
                ))}
              </select>
            </div>
          )}
          {campos.sucursal && (
            <div className={f.campo}>
              <label>Sucursal</label>
              <select className={f.input} value={sucursalId} onChange={(e) => setSucursalId(Number(e.target.value))}>
                <option value={0}>Selecciona una sucursal</option>
                {(sucursales as any[])?.map((su) => (
                  <option key={su.id} value={su.id}>
                    {su.value}
                  </option>
                ))}
              </select>
            </div>
          )}
          {campos.colaborador && (
            <div className={f.campo}>
              <label>Colaborador</label>
              <select className={f.input} value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)}>
                <option value="">Selecciona un colaborador</option>
                {(colaboradores as any[])?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombres} {u.apellidos}
                  </option>
                ))}
              </select>
            </div>
          )}
          {campos.tipoMoneda && (
            <div className={f.campo}>
              <label>Tipo de Moneda</label>
              <select className={f.input} value={monedaId} onChange={(e) => setMonedaId(Number(e.target.value))}>
                <option value={0}>Selecciona una moneda</option>
                {(monedas as any[])?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.value}
                  </option>
                ))}
              </select>
            </div>
          )}
          {campos.tipoCambio && (
            <div className={f.campo}>
              <label>Tipo de Cambio (SUNAT)</label>
              <div>
                <input
                  type="text"
                  className={f.input}
                  value={tipoCambio}
                  style={estiloError(!!errors.tipoCambio)}
                  onChange={(e) => {
                    setTipoCambio(sanitizeDecimal(e.target.value));
                    clearError("tipoCambio");
                  }}
                />
                <CampoError mensaje={errors.tipoCambio} />
              </div>
            </div>
          )}
          {campos.placaVehiculo && (
            <div className={f.campo}>
              <label>N° Placa Vehículo</label>
              <input className={f.input} value={placaVehiculo} maxLength={10} onChange={(e) => setPlacaVehiculo(e.target.value.toUpperCase())} />
            </div>
          )}
          {campos.guiaRemisionManual && (
            <div className={f.campo}>
              <label>N° Guía Remisión Manual</label>
              <input className={f.input} value={guiaRemisionManual} maxLength={20} onChange={(e) => setGuiaRemisionManual(e.target.value)} />
            </div>
          )}
          {campos.guiaRemisionElectronica && (
            <div className={f.campo}>
              <label>N° Guía Remisión Electrónica</label>
              <input className={f.input} value={guiaRemisionElectronica} maxLength={20} onChange={(e) => setGuiaRemisionElectronica(e.target.value)} />
            </div>
          )}
          {campos.numeroOrden && (
            <div className={f.campo}>
              <label>N° de Orden</label>
              <input className={f.input} value={numeroOrden} maxLength={30} onChange={(e) => setNumeroOrden(e.target.value)} />
            </div>
          )}
          {campos.fechaVencimiento && (
            <div className={f.campo}>
              <label>Fecha Vencimiento del Documento</label>
              <input type="date" className={f.input} value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
            </div>
          )}
          {campos.etiquetas && (
            <div className={f.campo}>
              <label>Etiquetas</label>
              <input className={f.input} placeholder="Separadas por coma" value={etiquetas} maxLength={200} onChange={(e) => setEtiquetas(e.target.value)} />
            </div>
          )}
          {campos.detraccion && (
            <div className={f.campo}>
              <label>Detracción</label>
              <div>
                <select className={f.input} value={tipoDetraccionId} onChange={(e) => setTipoDetraccionId(Number(e.target.value))}>
                  <option value={0}>Sin detracción</option>
                  {tiposDetraccion.map((t) => (
                    <option key={t.id} value={t.id}>
                      {Number(t.porcentaje)}%{t.descripcion ? ` - ${t.descripcion}` : ""}
                    </option>
                  ))}
                </select>
                {tipoDetraccionId !== 0 && (
                  <small>
                    Monto: S/ {((total * Number(tiposDetraccion.find((t) => t.id === tipoDetraccionId)?.porcentaje ?? 0)) / 100).toFixed(2)}
                  </small>
                )}
              </div>
            </div>
          )}
          {campos.retencion && (
            <div className={f.campo}>
              <label>Retención S/.</label>
              <div>
                <input
                  type="text"
                  className={f.input}
                  value={montoRetencion}
                  style={estiloError(!!errors.montoRetencion)}
                  onChange={(e) => {
                    setMontoRetencion(sanitizeDecimal(e.target.value));
                    clearError("montoRetencion");
                  }}
                />
                <CampoError mensaje={errors.montoRetencion} />
              </div>
            </div>
          )}
          {campos.anticipo && (
            <div className={f.campo}>
              <label>Anticipo S/.</label>
              <div>
                <input
                  type="text"
                  className={f.input}
                  value={montoAnticipo}
                  style={estiloError(!!errors.montoAnticipo)}
                  onChange={(e) => {
                    setMontoAnticipo(sanitizeDecimal(e.target.value));
                    clearError("montoAnticipo");
                  }}
                />
                <CampoError mensaje={errors.montoAnticipo} />
              </div>
            </div>
          )}
        </div>

        <div className={f.lineas}>
          <div className={`${f.fila} ${f.filaTitulo} ${styles.filaVenta}`}>
            <span>Artículo</span>
            <span>Und. medida</span>
            <span>Cantidad</span>
            <span>Precio</span>
            <span className={f.derecha}>Importe</span>
            <span />
          </div>
          {productsBySale.map((item: any) => (
            <div key={item.productoId} className={`${f.fila} ${styles.filaVenta}`}>
              <span className={styles.articulo}>{item.nombre}</span>
              <select className={f.input} value={item.unidadMedidaId ?? ""} onChange={(e) => cambiarUnidadMedida(item.productoId, Number(e.target.value))}>
                {(unidadesMedida as any[])?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.codigo}
                  </option>
                ))}
              </select>
              <div className={styles.qtyControl}>
                <button type="button" onClick={() => restar(item)}>-</button>
                <span>{item.cantidad}</span>
                <button type="button" onClick={() => sumar(item)}>+</button>
              </div>
              {item.cambioPrecioPermitido ? (
                <input
                  type="text"
                  className={f.input}
                  defaultValue={Number(item.precio).toFixed(2)}
                  onBlur={(e) => cambiarPrecio(item.productoId, e.target.value)}
                />
              ) : (
                <span className={styles.articulo}>S/ {Number(item.precio).toFixed(2)}</span>
              )}
              <span className={f.derecha}>S/ {Number(item.precio * item.cantidad).toFixed(2)}</span>
              <button type="button" className={f.removeRow} onClick={() => eliminar(item.productoId)} title="Quitar línea">🗑</button>
            </div>
          ))}
          <CampoError mensaje={errors.productos} />
        </div>

        <div className={f.pie}>
          <div className={f.pieIzq}>
            <button type="button" className={f.addLineBtn} onClick={() => setIsPickerOpen(true)}>⊕ Añade una línea</button>

            <div className={styles.modoEnvioCol}>
              <strong>Modo de envío</strong>
              <label className={`${styles.modoEnvioOption} ${styles.modoEnvioAzul}`}>
                <input type="radio" checked={modoEnvio === "F"} onChange={() => setModoEnvio("F")} />
                Solo Firmar e Imprimir
              </label>
              <label className={`${styles.modoEnvioOption} ${styles.modoEnvioVerde}`}>
                <input type="radio" checked={modoEnvio === "S"} onChange={() => setModoEnvio("S")} />
                Enviar a SUNAT ahora mismo!
              </label>
              <label className={`${styles.modoEnvioOption} ${styles.modoEnvioCeleste}`}>
                <input type="radio" checked={modoEnvio === "G"} onChange={() => setModoEnvio("G")} />
                Solo Guardar la Venta
              </label>
            </div>
          </div>

          <div className={f.totales}>
            <div><span>Gravada:</span><span>S/ {subtotal.toFixed(2)}</span></div>
            <div>
              <span className={f.conInput}>
                Descuento en %
                <input type="checkbox" style={{ accentColor: "#6C5DD3" }} checked={descuentoActivo} disabled={esCredito} onChange={(e) => setDescuentoActivo(e.target.checked)} />
                {descuentoActivo && (
                  <input
                    type="text"
                    className={f.totalInput}
                    value={porcentajeDescuento}
                    disabled={esCredito}
                    style={estiloError(!!errors.porcentajeDescuento)}
                    onChange={(e) => {
                      const limpio = sanitizeDecimal(e.target.value);
                      setPorcentajeDescuento(limpio !== "" && Number(limpio) > 100 ? "100" : limpio);
                      clearError("porcentajeDescuento");
                    }}
                  />
                )}
              </span>
              <span>- S/ {montoDescuento.toFixed(2)}</span>
            </div>
            <CampoError mensaje={errors.porcentajeDescuento} />
            <div><span>IGV:</span><span>S/ {igv.toFixed(2)}</span></div>
            <div className={f.totalFila}><span>Total:</span><span>S/ {total.toFixed(2)}</span></div>
            <div>
              <span className={f.conInput}>
                Total recibido
                <input
                  type="text"
                  className={f.totalInput}
                  value={montoRecibido}
                  disabled={esCredito}
                  style={estiloError(!!errors.montoRecibido)}
                  onChange={(e) => {
                    setMontoRecibido(sanitizeDecimal(e.target.value));
                    clearError("montoRecibido");
                  }}
                />
              </span>
              <span>S/ {Number(montoRecibido || 0).toFixed(2)}</span>
            </div>
            <CampoError mensaje={errors.montoRecibido} />
            <div><span>Vuelto:</span><span>S/ {(montoRecibido !== "" ? Math.max(vuelto, 0) : 0).toFixed(2)}</span></div>
            {/* Mismas cuentas por defecto que ComprobanteRepository.GenerarAsientoVenta. */}
            <AsientoPreview
              asientos={asientosSimulados}
              lineas={[
                { cuenta: esCredito ? "12" : "10", descripcion: esCredito ? "Cuentas por cobrar (total)" : "Caja (total)", debe: Math.round(total * 100) / 100, haber: 0 },
                { cuenta: "40111", descripcion: "IGV por pagar", debe: 0, haber: Math.round(igv * 100) / 100 },
                { cuenta: "70", descripcion: "Ventas (subtotal)", debe: 0, haber: Math.round((total - Math.round(igv * 100) / 100) * 100) / 100 },
              ]}
              nota={asientosSimulados ? "Cuentas tomadas de la configuración (producto, cliente, IGV y cuentas por defecto)." : "Además, la salida de mercadería: 69 Costo de ventas (Debe) / 20 Mercaderías (Haber) al costo. Las cuentas propias del producto o del cliente reemplazan a estas."}
            />
            <div className={f.acciones}>
              <button type="button" className={f.cancelarBtn} onClick={limpiar}>Limpiar</button>
              <button type="button" className={f.guardarBtn} disabled={enviando || Object.keys(errors).length > 0} onClick={generarFactura}>
                {enviando ? "Guardando..." : "Guardar (F12)"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductoPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        products={products}
        onAgregar={agregarProductos}
      />
      {isOpenLoadingPay && code === 1 && colaXml.length === 0 && <ModalLoadingPay setIsOpenLoadingPay={setIsOpenLoadingPay} />}
      <ClientesModal onGuardado={clienteRegistrado} />
      <ClientePickerModal
        isOpen={isClientePickerOpen}
        onClose={() => setIsClientePickerOpen(false)}
        onSeleccionar={seleccionarCliente}
        documentoInicial={numeroDocumento}
      />
    </div>
  );
};

export default NuevaFactura;
