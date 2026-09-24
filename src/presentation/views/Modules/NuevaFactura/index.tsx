import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./nuevaFactura.module.css";
import comprasStyles from "../Admin/Views/Compras/compras.module.css";
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
import ModalLoadingPay from "../Facturacion/ModalLoadingPay";
import { printTable } from "../../../../helpers/functions/printTitle";
import { title } from "../../../../infraestructure/MData/MData";
import {
  openModalAnfitriona,
  activeClientes,
  clearActiveClientes,
} from "../../../../redux/reducers/Admin/clientes-proveedores/clientesProveedoresAnfitrionas.reducer";
import { ClientesModal } from "../../../../components/Modal/Admin/Clientes";

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
  { key: "igvSunat", label: "IGV - SUNAT", columna: 2 },
  { key: "tipoMoneda", label: "Tipo de Moneda", columna: 3 },
  { key: "tipoCambio", label: "Tipo de Cambio (SUNAT)", columna: 3 },
  { key: "guiaRemisionElectronica", label: "N° Guía Remisión Electrónica", columna: 3 },
  { key: "direccionCliente", label: "Dirección del Cliente", columna: 3 },
  { key: "retencion", label: "Retención", columna: 3 },
  { key: "anticipo", label: "Anticipo", columna: 3 },
];

const CAMPOS_VISIBLES_POR_DEFECTO = new Set([
  "fechaDocumento",
  "ubigeo",
  "numeroCelular",
  "direccionCliente",
  "igvSunat",
]);

const NuevaFactura = () => {
  const dispatch = useAppDispatch();
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

  // Antes del formulario se elige como traer el documento; convertir una cotizacion va directo.
  const [eligioMetodo, setEligioMetodo] = useState(!!cotizacionOrigenId || !!pedidoVentaId);
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
  const [enviando, setEnviando] = useState(false);
  const [isOpenLoadingPay, setIsOpenLoadingPay] = useState(false);

  const resumenRef = useRef<HTMLDivElement>(null);
  const [buscando, setBuscando] = useState(false);
  const [clientesEncontrados, setClientesEncontrados] = useState<any[]>([]);

  const [multipagos, setMultipagos] = useState(false);
  const [pagos, setPagos] = useState<{ metodoPagoId: number; monto: string }[]>([]);
  const [esCredito, setEsCredito] = useState(false);
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
  const [montoAnticipo, setMontoAnticipo] = useState("");

  // Solo Cotizacion: hasta cuando es valida. Se guarda como yyyy-MM-dd (input type=date nativo).
  const [fechaVigencia, setFechaVigencia] = useState<string>("");
  const [seriesDocumento, setSeriesDocumento] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
      return;
    }
    dispatch(resetSale());
    dispatch(getProducts(0, 0, "", 1, 100, undefined));
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

  // IGV real sumado por linea segun su Tipo IGV (Gravado usa 18%, Exonerado/Inafecto no paga).
  const igvBruto = productsBySale.reduce((acc: number, item: any) => {
    const tipoIgv = (tiposIgv as any[])?.find((t) => t.id === item.tipoIgvId);
    const aplicaImpuesto = tipoIgv ? tipoIgv.aplicaPorcentajeImpuesto : true;
    if (!aplicaImpuesto) return acc;
    const importeLinea = item.precio * item.cantidad;
    return acc + (importeLinea - importeLinea / 1.18);
  }, 0);

  const montoDescuento = descuentoActivo
    ? Math.round(((subtotalBruto * Number(porcentajeDescuento || 0)) / 100) * 100) / 100
    : 0;
  const total = subtotalBruto - montoDescuento;
  const factorDescuento = subtotalBruto > 0 ? total / subtotalBruto : 1;

  const subtotal = (subtotalBruto - igvBruto) * factorDescuento;
  const igv = igvBruto * factorDescuento;

  const vuelto = montoRecibido !== "" ? Number(montoRecibido) - total : 0;
  const totalPagos = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);

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
    setEligioMetodo(true);
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

  // Costo real de esta venta puntual (ej. lo que realmente costo el delivery esta vez), distinto
  // del costo de catalogo del producto -- si se deja vacio, los reportes usan el costo de catalogo.
  const cambiarCosto = (productoId: number, valor: string) => {
    const costoReal = valor === "" ? undefined : parseFloat(valor);
    if (valor !== "" && (costoReal === undefined || isNaN(costoReal) || costoReal < 0)) {
      toast.error("Costo inválido");
      return;
    }
    const actualizados = productsBySale.map((p: any) =>
      p.productoId === productoId ? { ...p, costoReal } : p
    );
    dispatch(updateProductByPrice(actualizados) as any);
  };

  const cambiarTipoIgv = (productoId: number, tipoIgvId: number) => {
    const actualizados = productsBySale.map((p: any) =>
      p.productoId === productoId ? { ...p, tipoIgvId } : p
    );
    dispatch(updateProductByPrice(actualizados) as any);
  };

  const cambiarUnidadMedida = (productoId: number, unidadMedidaId: number) => {
    const actualizados = productsBySale.map((p: any) =>
      p.productoId === productoId ? { ...p, unidadMedidaId } : p
    );
    dispatch(updateProductByPrice(actualizados) as any);
  };

  const agregarLineaPago = () => setPagos([...pagos, { metodoPagoId: 0, monto: "" }]);
  const quitarLineaPago = (index: number) => setPagos(pagos.filter((_, i) => i !== index));
  const cambiarLineaPago = (index: number, campo: "metodoPagoId" | "monto", valor: string) => {
    setPagos(
      pagos.map((p, i) => (i === index ? { ...p, [campo]: campo === "metodoPagoId" ? Number(valor) : valor } : p))
    );
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
    if (razonSocial.trim().length < 3) {
      return toast.error("La Razón Social debe tener al menos 3 caracteres");
    }
    if (/^\d+$/.test(razonSocial.trim())) {
      return toast.error("La Razón Social no puede contener solo números");
    }
    if (numeroDocumento.trim() === "") {
      return toast.error("El número de documento es obligatorio");
    }
    if (tipoDocIdentId === TIPO_DOC_DNI && numeroDocumento.trim().length !== 8) {
      return toast.error("El DNI debe tener 8 dígitos");
    }
    if (tipoDocIdentId === TIPO_DOC_RUC && numeroDocumento.trim().length !== 11) {
      return toast.error("El RUC debe tener 11 dígitos");
    }
    if (tipoDocumentoInicial === "factura" && tipoDocIdentId !== TIPO_DOC_RUC) {
      return toast.error("Para Factura, el tipo de documento debe ser RUC");
    }
    if (celular.trim() !== "" && celular.trim().length !== 9) {
      return toast.error("El número de celular debe tener 9 dígitos");
    }
    if (enviarEmail) {
      if (email.trim() === "") {
        return toast.error("Ingresa el email del cliente o desactiva el envío por email");
      }
      if (!EMAIL_REGEX.test(email.trim())) {
        return toast.error("El email del cliente no es válido");
      }
    }
    if (productsBySale.length === 0) {
      return toast.error("Agrega al menos un producto");
    }
    if (total <= 0) {
      return toast.error("El total de la venta debe ser mayor a 0");
    }

    if (descuentoActivo) {
      if (porcentajeDescuento.trim() === "" || !esDecimalValido(porcentajeDescuento)) {
        return toast.error("Ingresa un porcentaje de descuento válido (máx. 2 decimales)");
      }
      const pct = Number(porcentajeDescuento);
      if (pct <= 0 || pct > 100) {
        return toast.error("El descuento debe ser mayor a 0% y no puede superar 100%");
      }
    }

    if (montoRecibido !== "") {
      if (!esDecimalValido(montoRecibido)) {
        return toast.error("El Total Recibido no es válido (máx. 2 decimales)");
      }
      if (!esCredito && Number(montoRecibido) < total) {
        return toast.error("El Total Recibido es menor al Total a pagar");
      }
    }

    if (campos.tipoCambio && tipoCambio !== "" && !esDecimalValido(tipoCambio)) {
      return toast.error("El Tipo de Cambio no es válido (máx. 2 decimales)");
    }
    if (campos.retencion && montoRetencion !== "" && !esDecimalValido(montoRetencion)) {
      return toast.error("El monto de Retención no es válido (máx. 2 decimales)");
    }
    if (campos.anticipo && montoAnticipo !== "" && !esDecimalValido(montoAnticipo)) {
      return toast.error("El monto de Anticipo no es válido (máx. 2 decimales)");
    }

    let detallePago: { metodoPagoId: number; monto: number; referenciaOperacion: string }[];

    if (multipagos) {
      if (pagos.length === 0) {
        return toast.error("Agrega al menos un método de pago");
      }
      if (pagos.some((p) => !esDecimalValido(p.monto || ""))) {
        return toast.error("Ingresa montos válidos en los pagos (máx. 2 decimales)");
      }
      if (pagos.some((p) => p.metodoPagoId === 0 || Number(p.monto || 0) <= 0)) {
        return toast.error("Completa el método y monto de cada pago");
      }
      if (Math.abs(totalPagos - total) > 0.01) {
        return toast.error("La suma de los pagos debe ser igual al Total (S/. " + total.toFixed(2) + ")");
      }
      detallePago = pagos.map((p) => ({ metodoPagoId: p.metodoPagoId, monto: Number(p.monto), referenciaOperacion: "" }));
    } else {
      if (metodoPagoId === 0) {
        return toast.error("Elige un método de pago");
      }
      detallePago = [{ metodoPagoId, monto: total, referenciaOperacion: "" }];
    }

    // El descuento se prorratea sobre cada linea (el backend valida Total == suma del detalle);
    // el residual de redondeo entre lineas se ajusta en la ultima para que la suma cuadre exacto.
    const detalleComprobante = productsBySale.map((item: any) => {
      const valorUnitarioAjustado = Math.round(item.precio * factorDescuento * 100) / 100;
      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        valorUnitario: valorUnitarioAjustado,
        costoReal: item.costoReal,
        tipoIgvId: item.tipoIgvId,
        unidadMedidaId: item.unidadMedidaId,
      };
    });

    const sumaAjustada = detalleComprobante.reduce((acc, l) => acc + l.valorUnitario * l.cantidad, 0);
    const residual = Math.round((total - sumaAjustada) * 100) / 100;
    if (residual !== 0 && detalleComprobante.length > 0) {
      const ultima = detalleComprobante[detalleComprobante.length - 1];
      ultima.valorUnitario = Math.round((ultima.valorUnitario + residual / ultima.cantidad) * 100) / 100;
    }

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
      efectivo: multipagos ? "MULTIPLE" : metodoPagoSeleccionado?.value?.toUpperCase() || "",
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
      fechaVencimiento: campos.fechaVencimiento ? fechaVencimiento || undefined : undefined,
      numeroOrden: campos.numeroOrden ? numeroOrden.trim() || undefined : undefined,
      colaboradorId: campos.colaborador && colaboradorId !== "" ? colaboradorId : undefined,
      monedaId: campos.tipoMoneda && monedaId !== 0 ? monedaId : undefined,
      tipoCambio: campos.tipoCambio && tipoCambio !== "" ? Number(tipoCambio) : undefined,
      montoRetencion: campos.retencion && montoRetencion !== "" ? Number(montoRetencion) : undefined,
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
    setMultipagos(false);
    setPagos([]);
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

  if (!eligioMetodo) {
    const TITULOS: Record<TipoDocumento, [string, string]> = {
      factura: ["Nueva Factura", "la factura"],
      boleta: ["Nueva Boleta", "la boleta"],
      "nota-venta": ["Nueva Nota de Venta", "la nota de venta"],
      cotizacion: ["Nueva Cotización", "la cotización"],
    };
    const [tituloDoc, nombreDoc] = TITULOS[tipoDocumentoInicial];
    const proximamente = (n: string) => toast(`${n}: próximamente. Por ahora usa Subir XML o Llenar manual.`);
    const opciones = [
      { icon: "🔍", titulo: "Buscar en SUNAT", desc: "Con RUC, serie y correlativo", onClick: () => proximamente("Buscar en SUNAT") },
      { icon: "📄", titulo: leyendoXml ? "Leyendo XML..." : "Subir XML", desc: "Uno o varios archivos .xml", onClick: () => xmlInputRef.current?.click() },
      { icon: "📷", titulo: "Foto o PDF", desc: "La leemos automáticamente", onClick: () => proximamente("Foto o PDF") },
      { icon: "✏️", titulo: "Llenar manual", desc: "Escribir los datos", onClick: () => setEligioMetodo(true) },
    ];
    return (
      <div>
        <Toaster richColors position="top-right" />
        <div className={styles.header}>
          <h3>{tituloDoc}</h3>
        </div>
        <div className={comprasStyles.comoTraerCard}>
          <div className={comprasStyles.comoTraerTitle}>
            <span className={comprasStyles.comoTraerIcon}>⬇️</span> ¿Cómo quieres traer {nombreDoc}?
          </div>
          <div className={comprasStyles.opcionesGrid}>
            {opciones.map((o) => (
              <button key={o.titulo} type="button" className={comprasStyles.opcionCard} onClick={o.onClick}>
                <span className={comprasStyles.opcionIcon}>{o.icon}</span>
                <span className={comprasStyles.opcionTitle}>{o.titulo}</span>
                <span className={comprasStyles.opcionDesc}>{o.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <input ref={xmlInputRef} type="file" accept=".xml" multiple hidden onChange={handleXmlSeleccionado} />
      </div>
    );
  }

  return (
    <div>
      <Toaster richColors position="top-right" />
      <div className={styles.header}>
        <h3>
          {tipoDocumentoInicial === "factura"
            ? "Nueva Factura"
            : tipoDocumentoInicial === "boleta"
            ? "Nueva Boleta"
            : tipoDocumentoInicial === "cotizacion"
            ? "Nueva Cotización"
            : "Nueva Nota de Venta"}
          {totalXml > 1 && (
            <small style={{ marginLeft: 12, fontWeight: 400 }}>
              Documento {totalXml - colaXml.length} de {totalXml}
            </small>
          )}
        </h3>
        <div className={styles.headerActions}>
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
      </div>

      <div className={styles.documentoCodeWrap}>
        <div className={styles.documentoCodeBox}>
          <span className={styles.documentoCodeTipo}>
            {tipoDocumentoInicial === "factura"
              ? "FACTURA"
              : tipoDocumentoInicial === "boleta"
              ? "BOLETA"
              : tipoDocumentoInicial === "cotizacion"
              ? "COTIZACIÓN"
              : "NOTA DE VENTA"}
            {" · Serie "}
            {tipoDocumentoInicial === "factura"
              ? seriesDocumento.factura ?? "..."
              : tipoDocumentoInicial === "boleta"
              ? seriesDocumento.boleta ?? "..."
              : tipoDocumentoInicial === "cotizacion"
              ? seriesDocumento.cotizacion ?? "..."
              : seriesDocumento.notaVenta ?? "..."}
          </span>
          <span className={styles.documentoCodeValor}>{correlative || "Se asigna al guardar"}</span>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h4 className={styles.sectionTitleDivider}>CLIENTE:</h4>

          <div className={styles.formGrid3}>
            <div>
              <label className={styles.fieldLabelIcon}>
                <Icon icon="mdi:account-outline" /> Tipo Doc.Ident.<span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={tipoDocIdentId}
                onChange={(e) => setTipoDocIdentId(Number(e.target.value))}
              >
                {tiposDocumentoDisponibles?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.fieldLabelIcon}>
                <Icon icon="mdi:pencil-outline" /> {labelNumeroDocumento}: <span className={styles.required}>*</span>
              </label>
              <div className={styles.buscarClienteRow}>
                <input
                  placeholder="Número de documento aquí"
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
                />
                <button type="button" className={styles.searchIconBtn} onClick={buscarCliente} disabled={buscando}>
                  <Icon icon="iconamoon:search-bold" />
                </button>
                <button
                  type="button"
                  className={styles.searchIconBtn}
                  onClick={abrirRegistroCliente}
                  title="Registrar nuevo cliente"
                >
                  <Icon icon="mdi:account-plus-outline" />
                </button>
              </div>
            </div>
            <div>
              <label className={styles.fieldLabelIcon}>
                <Icon icon="mdi:card-account-details-outline" /> Razón Social: <span className={styles.required}>*</span>
              </label>
              <input
                placeholder="Nombre o Razón Social aquí"
                value={razonSocial}
                disabled={camposBloqueados.razonSocial}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRazonSocial(e.target.value)}
              />
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

          {(campos.direccionCliente || campos.ubigeo || campos.numeroCelular) && (
            <div className={styles.formGrid3}>
              {campos.direccionCliente && (
                <div>
                  <label className={styles.fieldLabelIcon}>
                    <Icon icon="mdi:home-outline" /> Dirección:
                  </label>
                  <input
                    placeholder="Escribe aquí la dirección completa"
                    value={direccionCliente}
                    disabled={camposBloqueados.direccion}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDireccionCliente(e.target.value)}
                  />
                </div>
              )}
              {campos.ubigeo && (
                <div>
                  <label className={styles.fieldLabelIcon}>
                    <Icon icon="mdi:earth" /> Ubigeo:
                  </label>
                  <SelectUbigeo
                    isSearch
                    disabled={camposBloqueados.ubigeo}
                    placeholder="Selecciona tu código de ubigeo"
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
                <div>
                  <label className={styles.fieldLabelIcon}>
                    <Icon icon="mdi:cellphone" /> Num. Celular:
                  </label>
                  <input
                    placeholder="Escribe el número de celular"
                    value={celular}
                    maxLength={9}
                    disabled={camposBloqueados.celular}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCelular(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              )}
            </div>
          )}

          <div className={styles.formGrid}>
            <div>
              <label className={styles.toggleLabel}>
                <span className={styles.switch}>
                  <input type="checkbox" checked={enviarEmail} onChange={(e) => setEnviarEmail(e.target.checked)} />
                  <span className={styles.switchSlider}></span>
                </span>
                ¿Deseas enviar el comprobante electrónico al email del cliente?
              </label>
              {enviarEmail && (
                <input
                  type="email"
                  placeholder="Email del cliente"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                />
              )}
            </div>
            {campos.fechaDocumento && (
              <div>
                <label>Fecha</label>
                <input
                  type="date"
                  value={fechaVenta}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaVenta(e.target.value)}
                />
              </div>
            )}
            {tipoDocumentoInicial === "cotizacion" && (
              <div>
                <label>Válida hasta (opcional)</label>
                <input
                  type="date"
                  value={fechaVigencia}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaVigencia(e.target.value)}
                />
              </div>
            )}
          </div>

          {(campos.tipoOperacion ||
            campos.sucursal ||
            campos.placaVehiculo ||
            campos.guiaRemisionManual ||
            campos.guiaRemisionElectronica ||
            campos.etiquetas ||
            campos.fechaVencimiento ||
            campos.numeroOrden ||
            campos.colaborador ||
            campos.tipoMoneda ||
            campos.tipoCambio ||
            campos.retencion ||
            campos.anticipo) && (
            <>
              <h4 className={styles.sectionTitleDivider}>DATOS ADICIONALES:</h4>
              <div className={styles.formGrid3}>
                {campos.tipoOperacion && (
                  <div>
                    <label>Tipo de Operación</label>
                    <select className={styles.select} value={tipoOperacionId} onChange={(e) => setTipoOperacionId(Number(e.target.value))}>
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
                  <div>
                    <label>Sucursal</label>
                    <select className={styles.select} value={sucursalId} onChange={(e) => setSucursalId(Number(e.target.value))}>
                      <option value={0}>Selecciona una sucursal</option>
                      {(sucursales as any[])?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.value}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {campos.colaborador && (
                  <div>
                    <label>Colaborador</label>
                    <select className={styles.select} value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)}>
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
                  <div>
                    <label>Tipo de Moneda</label>
                    <select className={styles.select} value={monedaId} onChange={(e) => setMonedaId(Number(e.target.value))}>
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
                  <div>
                    <label>Tipo de Cambio (SUNAT)</label>
                    <input type="text" value={tipoCambio} onChange={(e) => setTipoCambio(sanitizeDecimal(e.target.value))} />
                  </div>
                )}
                {campos.placaVehiculo && (
                  <div>
                    <label>N° Placa Vehículo</label>
                    <input
                      value={placaVehiculo}
                      maxLength={10}
                      onChange={(e) => setPlacaVehiculo(e.target.value.toUpperCase())}
                    />
                  </div>
                )}
                {campos.guiaRemisionManual && (
                  <div>
                    <label>N° Guía Remisión Manual</label>
                    <input value={guiaRemisionManual} maxLength={20} onChange={(e) => setGuiaRemisionManual(e.target.value)} />
                  </div>
                )}
                {campos.guiaRemisionElectronica && (
                  <div>
                    <label>N° Guía Remisión Electrónica</label>
                    <input value={guiaRemisionElectronica} maxLength={20} onChange={(e) => setGuiaRemisionElectronica(e.target.value)} />
                  </div>
                )}
                {campos.numeroOrden && (
                  <div>
                    <label>N° de Orden</label>
                    <input value={numeroOrden} maxLength={30} onChange={(e) => setNumeroOrden(e.target.value)} />
                  </div>
                )}
                {campos.fechaVencimiento && (
                  <div>
                    <label>Fecha Vencimiento del Documento</label>
                    <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
                  </div>
                )}
                {campos.etiquetas && (
                  <div>
                    <label>Etiquetas</label>
                    <input placeholder="Separadas por coma" value={etiquetas} maxLength={200} onChange={(e) => setEtiquetas(e.target.value)} />
                  </div>
                )}
                {campos.retencion && (
                  <div>
                    <label>Retención S/.</label>
                    <input type="text" value={montoRetencion} onChange={(e) => setMontoRetencion(sanitizeDecimal(e.target.value))} />
                  </div>
                )}
                {campos.anticipo && (
                  <div>
                    <label>Anticipo S/.</label>
                    <input type="text" value={montoAnticipo} onChange={(e) => setMontoAnticipo(sanitizeDecimal(e.target.value))} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.productosHeader}>
            <h4>LISTA DE PRODUCTOS:</h4>
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
                    {campos.igvSunat && <th>Tipo IGV</th>}
                    <th>Und. Medida</th>
                    <th>Cantidad</th>
                    <th>P. Unit.</th>
                    <th>Costo real</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {productsBySale.map((item: any) => (
                    <tr key={item.productoId}>
                      <td data-label="Producto">{item.nombre}</td>
                      {campos.igvSunat && (
                        <td data-label="Tipo IGV">
                          <select
                            className={styles.select}
                            value={item.tipoIgvId ?? ""}
                            onChange={(e) => cambiarTipoIgv(item.productoId, Number(e.target.value))}
                          >
                            {(tiposIgv as any[])?.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.codigo} - {t.value}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
                      <td data-label="Und. Medida">
                        <select
                          className={styles.select}
                          value={item.unidadMedidaId ?? ""}
                          onChange={(e) => cambiarUnidadMedida(item.productoId, Number(e.target.value))}
                        >
                          {(unidadesMedida as any[])?.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.codigo}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Cantidad">
                        <div className={styles.qtyControl}>
                          <button type="button" onClick={() => restar(item)}>-</button>
                          <span>{item.cantidad}</span>
                          <button type="button" onClick={() => sumar(item)}>+</button>
                        </div>
                      </td>
                      <td data-label="P. Unit.">S/ {Number(item.precio).toFixed(2)}</td>
                      <td data-label="Costo real">
                        <input
                          type="text"
                          className={styles.costoInput}
                          placeholder="Costo de catálogo"
                          defaultValue={item.costoReal !== undefined ? String(item.costoReal) : ""}
                          onBlur={(e) => cambiarCosto(item.productoId, e.target.value)}
                        />
                      </td>
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
          <div className={styles.multipagosHeader}>
            <label className={styles.toggleLabel}>
              <span className={`${styles.switch} ${styles.switchPurple}`}>
                <input type="checkbox" checked={multipagos} onChange={(e) => setMultipagos(e.target.checked)} />
                <span className={styles.switchSlider}></span>
              </span>
              Multipagos
            </label>
            <button
              type="button"
              className={styles.resumenPagoLink}
              onClick={() => resumenRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
            >
              RESUMEN DE PAGO
            </button>
          </div>

          {multipagos && (
            <div className={styles.multipagosBlock}>
              {pagos.length === 0 ? (
                <div className={styles.multipagosEmpty}>
                  <div className={styles.multipagosEmptyIcon}>
                    <Icon icon="mdi:credit-card-outline" />
                  </div>
                  <div>
                    <p className={styles.multipagosEmptyTitle}>Pagos múltiples no configurados</p>
                    <button type="button" className={styles.multipagosEmptyLink} onClick={agregarLineaPago}>
                      <Icon icon="mdi:plus" /> Agregar métodos de pago
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {pagos.map((p, index) => (
                    <div key={index} className={styles.lineaPago}>
                      <select
                        className={styles.select}
                        value={p.metodoPagoId}
                        onChange={(e) => cambiarLineaPago(index, "metodoPagoId", e.target.value)}
                      >
                        <option value={0}>Método de pago</option>
                        {(payMethods as any[])?.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.value}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Monto S/."
                        value={p.monto}
                        onChange={(e) => cambiarLineaPago(index, "monto", sanitizeDecimal(e.target.value))}
                      />
                      <button type="button" className={styles.removeBtn} onClick={() => quitarLineaPago(index)}>
                        <Icon icon="mdi:trash-can-outline" />
                      </button>
                    </div>
                  ))}
                  <button type="button" className={styles.addLineBtn} onClick={agregarLineaPago}>
                    <Icon icon="mdi:plus" /> Agregar pago
                  </button>
                  <div className={styles.totalesRow}>
                    <span>Suma de pagos</span>
                    <span>S/ {totalPagos.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className={styles.ventaResumenGrid}>
          <div className={styles.ventaResumenLeft}>
            <div className={styles.formGrid}>
              <div>
                <label className={styles.fieldLabel}>¿Es al Crédito?</label>
                <div className={styles.switchRow}>
                  <span className={styles.switch}>
                    <input type="checkbox" checked={esCredito} onChange={(e) => setEsCredito(e.target.checked)} />
                    <span className={styles.switchSlider}></span>
                  </span>
                  <span>{esCredito ? "Sí" : "No"}</span>
                </div>
              </div>
              {!multipagos && (
                <div>
                  <label>Forma de Pago</label>
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
              )}
            </div>

            <div className={styles.formGrid3}>
              <div>
                <label className={styles.toggleLabel}>
                  <span className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={descuentoActivo}
                      onChange={(e) => setDescuentoActivo(e.target.checked)}
                    />
                    <span className={styles.switchSlider}></span>
                  </span>
                  Descuento en %
                </label>
                {descuentoActivo && (
                  <input
                    type="text"
                    value={porcentajeDescuento}
                    onChange={(e) => {
                      const limpio = sanitizeDecimal(e.target.value);
                      setPorcentajeDescuento(limpio !== "" && Number(limpio) > 100 ? "100" : limpio);
                    }}
                  />
                )}
              </div>
              <div>
                <label>Total Recibido S/.</label>
                <input
                  type="text"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(sanitizeDecimal(e.target.value))}
                />
              </div>
              <div>
                <label>Vuelto S/.</label>
                <input type="text" readOnly value={montoRecibido !== "" ? Math.max(vuelto, 0).toFixed(2) : ""} />
              </div>
            </div>

            <div>
              <label>Observación</label>
              <textarea
                className={styles.observacionInput}
                placeholder="Escribe aquí una observación"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.resumenCard} ref={resumenRef}>
            <h4>Resumen:</h4>
            <div className={styles.totalesRow}>
              <span>Gravada:</span>
              <span>S/. {subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.totalesRow}>
              <span>(-) Descuento Total:</span>
              <span className={styles.negativo}>S/. {montoDescuento.toFixed(2)}</span>
            </div>
            <div className={styles.totalesRow}>
              <span>IGV: (18%)</span>
              <span>S/. {igv.toFixed(2)}</span>
            </div>
            <div className={`${styles.totalesRow} ${styles.totalesRowFinal}`}>
              <span>Total:</span>
              <span>S/. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitleDivider}>SELECCIONA EL MODO DE ENVÍO:</h4>
          <div className={styles.modoEnvioRow}>
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

          <div className={styles.buttons}>
            <button type="button" className={styles.cancel} onClick={limpiar}>
              Limpiar
            </button>
            <button type="button" className={styles.submitPill} disabled={enviando} onClick={generarFactura}>
              <Icon icon="mdi:content-save-outline" />
              {enviando ? "Guardando..." : "Guardar documento electrónico (F12)"}
            </button>
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
    </div>
  );
};

export default NuevaFactura;
