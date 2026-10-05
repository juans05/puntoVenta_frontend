import Modal from "react-modal";
import styles from "./producto.module.css";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Icons } from "../../../Svg/iconsPack";
import Svg from "../../../Svg";
import { RootState } from "../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import {
  ajustarStock,
  clearActiveProducto,
  closeModalProducto,
  createCategory,
  createProducto,
  deleteCategory,
  deleteProducts,
  eliminarImagenProducto,
  getCategorias,
  getProducts,
  subirImagenProducto,
  updateProducts,
} from "../../../../redux/reducers/Admin/productos/producto.reducer";
import {
  getMonedas,
  getSucursales,
  getTiposIgv,
  getUnidadesMedida,
} from "../../../../redux/reducers/extensiones/extensiones..reducer";
import { IExtensionesState } from "../../../../redux/reducers/extensiones/interfaces";
import "../../index.css";
import Input from "../../../Input";
import { Button } from "@tremor/react";
import { Toggle } from "../../../Toggle";
import SelectPro from "../../../SelectPro";
import { toast } from "sonner";
import { ImageCropModal } from "../../../ImageCropModal";
import { useFormErrors } from "../../../FormError";
import axiosInstance from "../../../../utils/axios";

const BTN_PRIMARY =
  "bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const BTN_SECONDARY =
  "border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors";

const TASA_IGV_DEFAULT = 0.18;

const DESTINO_PREPARACION_OPCIONES = ["Ninguno", "Cocina", "Barra"];

const PRESET_PRECIOS_ALTERNATIVOS = [
  { label: "MAYORISTA", emoji: "🍾" },
  { label: "VIP", emoji: "⭐" },
  { label: "DISTRIBUIDOR", emoji: "📦" },
];

const PRESET_PRESENTACIONES = [
  { label: "CAJA", emoji: "📦" },
  { label: "BLÍSTER", emoji: "💊" },
  { label: "BOTELLA", emoji: "🧴" },
];

const CODIGO_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generarCodigo = (len = 6) =>
  Array.from({ length: len }, () => CODIGO_CHARS[Math.floor(Math.random() * CODIGO_CHARS.length)]).join("");

const VIDEO_TIPOS = ["video/mp4", "video/webm"];
const VIDEO_MAX_MB = 30;
const GALERIA_MAX = 5;
const GALERIA_MAX_MB = 3;

const initialForm = {
  nombreCategoria: "",
  categoriaId: 0,
  nombreGrupo: "",
  grupoId: 0,
  nombre: "",
  rutaImagen: "",
  cloudinaryPublicId: "",
  videoUrl: "",
  galeria: "[]",
  comentario: "",
  descripcion: "",
  codigoBarra: "",
  stock: 0,
  precioVentaSinInpuesto: 0,
  precioVentaConInpuesto: 0,
  margenGanancia: 0,
  cambioPrecioPermitido: false,
  estado: true,

  codigo: "",
  marca: "",
  sucursalId: 0,
  sucursal: "",
  monedaId: 0,
  moneda: "",
  tipoIgvId: 0,
  tipoIgv: "",
  unidadMedidaId: 0,
  unidadMedida: "",
  precioMinimo: "",
  stockMinimo: "",
  pesoKg: "",
  icbper: false,
  porcentajeDetraccion: 0,
  destinoPreparacion: "Ninguno",
  gestionLotes: false,
  multiPrecioActivo: false,
  esServicio: false,
  seVende: true,
  seCompra: true,
  cuentaIngresoId: 0,
  cuentaInventarioId: 0,
  cuentaCostoId: 0,
  cuentaIngresoDebeId: 0,
  cuentaGastoHaberId: 0,
  cuentasInventarioMovimiento: {} as Record<number, number>,
};

// Ids = TipoMovimientoInventario del backend.
const MOVIMIENTOS_INVENTARIO = [
  { id: 1, label: "Compra" },
  { id: 2, label: "Venta" },
  { id: 3, label: "Ajuste de entrada" },
  { id: 4, label: "Ajuste de salida" },
  { id: 5, label: "Devolución de compra" },
  { id: 6, label: "Devolución de venta" },
];

const parseMovimientos = (json?: string): Record<number, number> => {
  try { return json ? JSON.parse(json) : {}; } catch { return {}; }
};

type TabId = "general" | "lotes" | "presentaciones" | "multiprecio" | "contabilidad" | "imagenes";

const customStyles = {};
Modal.setAppElement("#root");

const IMAGEN_MAX_BYTES = 5 * 1024 * 1024;
const IMAGEN_EXTENSIONES = ["jpg", "jpeg", "png", "webp"];
const IMAGEN_TIPOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
interface IProductoModalProps {
  onGuardado?: (producto: any) => void;
}
export const ProductoModal = ({ onGuardado }: IProductoModalProps = {}) => {
  const { modalProducts, activeProducto, categorias }: any =
    useAppSelector((state: RootState) => state.adminProducts);
  const { sucursales, monedas, tiposIgv, unidadesMedida }: IExtensionesState = useAppSelector(
    (state: RootState) => state.extentions
  );

  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<TabId>("general");
  const [formValues, setFormValues] = useState<any>(initialForm);
  const [preciosAlternativos, setPreciosAlternativos] = useState<any[]>([]);
  const [presentaciones, setPresentaciones] = useState<any[]>([]);
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [archivoParaRecortar, setArchivoParaRecortar] = useState<File | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState<boolean>(false);
  const [eliminandoImagen, setEliminandoImagen] = useState<boolean>(false);
  const [cuentasContables, setCuentasContables] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    nombre,
    rutaImagen,
    comentario,
    stock,
    precioVentaSinInpuesto,
    precioVentaConInpuesto,
    nombreCategoria,
    codigo,
    marca,
    sucursal,
    moneda,
    tipoIgv,
    unidadMedida,
    precioMinimo,
    stockMinimo,
    pesoKg,
    icbper,
    porcentajeDetraccion,
    destinoPreparacion,
    gestionLotes,
    multiPrecioActivo,
    esServicio,
    seVende,
    seCompra,
  } = formValues;

  // Solo ultimo nivel (Nivel 5 = 8 digitos): la unica hoja que admite asientos. El buscador del
  // SelectPro filtra por el texto "codigo - nombre", asi que tambien busca por numero de cuenta.
  const cuentasUltimoNivel = cuentasContables.filter((c: any) => c.nivel === 5);
  const cuentasOptions = cuentasUltimoNivel.map((c: any) => ({ id: c.id, value: `${c.codigo} - ${c.nombre}` }));
  const textoCuenta = (id?: number) => {
    const c = id ? cuentasContables.find((x: any) => x.id === id) : null;
    return c ? `${c.codigo} - ${c.nombre}` : "";
  };

  const [isStock, setIsStock] = useState<boolean>(false);
  const [paises, setPaises] = useState<any[]>([]);
  const [tiposDetraccion, setTiposDetraccion] = useState<any[]>([]);
  const [detraccionNueva, setDetraccionNueva] = useState<{ porcentaje: string; descripcion: string } | null>(null);
  // "+ Agregar" de Moneda / Afectación IGV: a diferencia de Categoria (solo nombre), estos
  // catalogos tienen mas de un campo obligatorio -- se resuelven con un mini-formulario propio
  // en vez de alta inmediata desde el droplist.
  const [monedaNueva, setMonedaNueva] = useState<{ codigo: string; simbolo: string; locale: string; paisId: number } | null>(null);
  const [tipoIgvNuevo, setTipoIgvNuevo] = useState<{ codigo: string; descripcion: string; aplicaPorcentajeImpuesto: boolean } | null>(null);
  const [guardandoCatalogo, setGuardandoCatalogo] = useState(false);

  useEffect(() => {
    dispatch(getSucursales() as any);
    dispatch(getMonedas() as any);
    dispatch(getTiposIgv() as any);
    dispatch(getUnidadesMedida() as any);
    axiosInstance.get("/cuentas-contables/listar").then((r: any) => setCuentasContables(r.data?.data ?? [])).catch(() => {});
    axiosInstance.get("/extensiones/paises").then((r: any) => setPaises(r.data?.data ?? [])).catch(() => {});
    cargarTiposDetraccion();
  }, [dispatch]);

  const cargarTiposDetraccion = () => {
    axiosInstance.get("/extensiones/tipos-detraccion").then((r: any) => setTiposDetraccion(r.data?.data ?? [])).catch(() => {});
  };

  const guardarDetraccionNueva = async () => {
    if (!detraccionNueva) return;
    const porcentaje = Number(detraccionNueva.porcentaje);
    if (!detraccionNueva.porcentaje.trim() || Number.isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      return toast.error("Escribe un porcentaje válido (0-100)");
    }
    setGuardandoCatalogo(true);
    try {
      await axiosInstance.post("/extensiones/tipos-detraccion/crear", { porcentaje, descripcion: detraccionNueva.descripcion || undefined });
      cargarTiposDetraccion();
      setFormValues((prev: any) => ({ ...prev, porcentajeDetraccion: porcentaje }));
      toast.success("Porcentaje de detracción creado");
      setDetraccionNueva(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo crear el porcentaje de detracción");
    } finally {
      setGuardandoCatalogo(false);
    }
  };
  // El droplist muestra el % como id (mismo contrato que antes con la lista fija), pero eliminar
  // necesita el id real de la fila en BD -- se busca por porcentaje en la lista ya cargada.
  const eliminarDetraccion = async (porcentaje: number) => {
    const fila = tiposDetraccion.find((t: any) => Number(t.porcentaje) === porcentaje);
    if (!fila) return;
    try {
      await axiosInstance.put(`/extensiones/tipos-detraccion/${fila.id}/estado`, { estado: false });
      cargarTiposDetraccion();
      toast.success("Porcentaje de detracción eliminado");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo eliminar");
    }
  };

  const guardarMonedaNueva = async () => {
    if (!monedaNueva) return;
    if (!monedaNueva.codigo.trim() || !monedaNueva.simbolo.trim() || !monedaNueva.locale.trim() || !monedaNueva.paisId) {
      return toast.error("Completa código, símbolo, locale y país");
    }
    setGuardandoCatalogo(true);
    try {
      const { data }: any = await axiosInstance.post("/extensiones/monedas/crear", monedaNueva);
      const creada = data?.data;
      dispatch(getMonedas() as any);
      if (creada?.id) setFormValues((prev: any) => ({ ...prev, monedaId: creada.id, moneda: creada.simbolo }));
      toast.success("Moneda creada");
      setMonedaNueva(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo crear la moneda");
    } finally {
      setGuardandoCatalogo(false);
    }
  };
  const eliminarMoneda = async (id: number) => {
    try {
      await axiosInstance.put(`/extensiones/monedas/${id}/estado`, { estado: false });
      dispatch(getMonedas() as any);
      toast.success("Moneda eliminada");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo eliminar");
    }
  };

  const guardarTipoIgvNuevo = async () => {
    if (!tipoIgvNuevo) return;
    if (!tipoIgvNuevo.codigo.trim() || !tipoIgvNuevo.descripcion.trim()) {
      return toast.error("Completa código y descripción");
    }
    setGuardandoCatalogo(true);
    try {
      const { data }: any = await axiosInstance.post("/extensiones/tipos-igv/crear", tipoIgvNuevo);
      const creado = data?.data;
      dispatch(getTiposIgv() as any);
      if (creado?.id) setFormValues((prev: any) => ({ ...prev, tipoIgvId: creado.id, tipoIgv: `${creado.codigo} - ${creado.descripcion}` }));
      toast.success("Código de Afectación IGV creado");
      setTipoIgvNuevo(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo crear el código IGV");
    } finally {
      setGuardandoCatalogo(false);
    }
  };
  const eliminarTipoIgv = async (id: number) => {
    try {
      await axiosInstance.put(`/extensiones/tipos-igv/${id}/estado`, { estado: false });
      dispatch(getTiposIgv() as any);
      toast.success("Código de Afectación IGV eliminado");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo eliminar");
    }
  };

  useEffect(() => {
    if (activeProducto) {
      setFormValues({
        ...initialForm,
        ...activeProducto,
        codigo: activeProducto.codigo || "",
        sucursalId: activeProducto.sucursalId || 0,
        sucursal:
          (sucursales as any[])?.find((s: any) => Number(s.id) === Number(activeProducto.sucursalId))?.value ?? "",
        monedaId: activeProducto.monedaId || 0,
        moneda:
          (monedas as any[])?.find((m: any) => Number(m.id) === Number(activeProducto.monedaId))?.value ?? "",
        tipoIgvId: activeProducto.tipoIgvId || 0,
        tipoIgv: activeProducto.nombreTipoIgv
          ? `${(tiposIgv as any[])?.find((t: any) => Number(t.id) === Number(activeProducto.tipoIgvId))?.codigo ?? ""} - ${activeProducto.nombreTipoIgv}`
          : "",
        unidadMedidaId: activeProducto.unidadMedidaId || 0,
        unidadMedida: activeProducto.nombreUnidadMedida ?? "",
        destinoPreparacion: activeProducto.destinoPreparacion || "Ninguno",
        cuentasInventarioMovimiento: parseMovimientos(activeProducto.cuentasInventarioMovimiento),
      });
      setPreciosAlternativos(activeProducto.preciosAlternativos ?? []);
      setPresentaciones(
        (activeProducto.presentaciones ?? []).map((p: any) => ({
          ...p,
          unidadMedida: p.unidadMedidaNombre,
        }))
      );
    } else {
      setFormValues({ ...initialForm, codigo: generarCodigo() });
      setPreciosAlternativos([]);
      setPresentaciones([]);
    }
    setTab("general");
  }, [activeProducto]);

  const handleInputChange = (e: any) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };
  const handleChangeSelect = (idValue: any, value: string, name: string, id: number) => {
    setFormValues({
      ...formValues,
      [name]: value,
      [id]: idValue,
    });
  };

  const filterAvoidAllCategorias = categorias?.filter((value: any) => value?.categoriaId !== 0);
  const newCategorias = filterAvoidAllCategorias?.map((value: any) => ({
    id: value?.categoriaId,
    value: value?.nombre,
  }));

  // "+ Agregar categoria" del droplist: alta rapida (solo nombre, sin abrir otro modal) ya que
  // Categoria no tiene mas campos obligatorios -- ver CategoriaModal para el mismo alta.
  const crearCategoriaRapida = async (busqueda: string) => {
    if (!busqueda.trim()) return toast.error("Escribe un nombre para la categoría");
    const creada: any = await dispatch(createCategory({ nombre: busqueda.trim(), usuarioCreacion: "admin" }) as any);
    if (creada?.categoriaId) {
      setFormValues((prev: any) => ({ ...prev, categoriaId: creada.categoriaId, nombreCategoria: creada.nombre }));
      toast.success("Categoría creada");
    }
    dispatch(getCategorias() as any);
  };
  const eliminarCategoriaRapida = (id: number) => {
    dispatch(deleteCategory(id) as any);
    dispatch(getCategorias() as any);
    toast.success("Categoría eliminada");
  };

  const sucursalesOptions = (sucursales as any[])?.map((s: any) => ({ id: s.id, value: s.value })) ?? [];
  const monedasOptions = (monedas as any[])?.map((m: any) => ({ id: m.id, value: m.value })) ?? [];
  const tiposIgvOptions = (tiposIgv as any[])?.map((t: any) => ({ id: t.id, value: `${t.codigo} - ${t.value}` })) ?? [];
  const unidadesMedidaOptions = (unidadesMedida as any[])?.map((u: any) => ({ id: u.id, value: u.value })) ?? [];

  const precioVentaNum = Number(precioVentaConInpuesto) || 0;
  const precioCompraNum = Number(precioVentaSinInpuesto) || 0;
  const tipoIgvSeleccionado = (tiposIgv as any[])?.find((t: any) => Number(t.id) === Number(formValues.tipoIgvId));
  const aplicaIgv = tipoIgvSeleccionado ? tipoIgvSeleccionado.aplicaPorcentajeImpuesto : true;
  const precioVentaSinIgv = aplicaIgv ? precioVentaNum / (1 + TASA_IGV_DEFAULT) : precioVentaNum;
  const gananciaMonto = precioVentaNum > 0 && precioCompraNum > 0 ? precioVentaSinIgv - precioCompraNum : null;
  const margenPct = precioCompraNum > 0 && gananciaMonto !== null ? (gananciaMonto / precioCompraNum) * 100 : 0;

  const closeModal = () => {
    if (subiendoImagen || eliminandoImagen) return;

    dispatch(closeModalProducto());

    setTimeout(() => {
      dispatch(clearActiveProducto());
      setIsStock(false);
      setFormValues(initialForm);
      setPreciosAlternativos([]);
      setPresentaciones([]);
      limpiarImagen();
    }, 200);
  };

  const buildPayload = () => ({
    ...formValues,
    precioVentaConInpuesto: precioVentaNum,
    precio: precioVentaNum,
    margenGanancia: margenPct,
    proveedorId: null,
    stock: parseInt(stock),
    stockMinimo: stockMinimo === "" ? undefined : Number(stockMinimo),
    precioMinimo: precioMinimo === "" ? undefined : Number(precioMinimo),
    pesoKg: pesoKg === "" ? undefined : Number(pesoKg),
    marca: marca || undefined,
    comentario: comentario || undefined,
    categoriaId: formValues.categoriaId || undefined,
    sucursalId: formValues.sucursalId || undefined,
    monedaId: formValues.monedaId || undefined,
    tipoIgvId: formValues.tipoIgvId || undefined,
    unidadMedidaId: formValues.unidadMedidaId || undefined,
    cuentaIngresoId: formValues.cuentaIngresoId || undefined,
    cuentaInventarioId: formValues.cuentaInventarioId || undefined,
    cuentaCostoId: formValues.cuentaCostoId || undefined,
    cuentaIngresoDebeId: formValues.cuentaIngresoDebeId || undefined,
    cuentaGastoHaberId: formValues.cuentaGastoHaberId || undefined,
    cuentasInventarioMovimiento: JSON.stringify(
      Object.fromEntries(Object.entries(formValues.cuentasInventarioMovimiento ?? {}).filter(([, v]) => v))
    ),
    porcentajeDetraccion: porcentajeDetraccion || undefined,
    destinoPreparacion: destinoPreparacion === "Ninguno" ? undefined : destinoPreparacion,
    preciosAlternativos: preciosAlternativos.map((p) => ({ nombre: p.nombre, precioVenta: Number(p.precioVenta) })),
    presentaciones: presentaciones.map((p) => ({
      nombre: p.nombre,
      codigo: p.codigo || undefined,
      unidadMedidaId: p.unidadMedidaId,
      factor: Number(p.factor),
      precioVenta: Number(p.precioVenta),
      precioMinimo: p.precioMinimo ? Number(p.precioMinimo) : undefined,
    })),
  });

  const createProduct = async () => {
    // Pares Debe/Haber de ingreso y de gasto: obligatorios.
    const faltantes = [
      ["cuenta de ingreso (Debe)", formValues.cuentaIngresoDebeId], ["cuenta de ingreso (Haber)", formValues.cuentaIngresoId],
      ["cuenta de gasto (Debe)", formValues.cuentaCostoId], ["cuenta de gasto (Haber)", formValues.cuentaGastoHaberId],
    ].filter(([, v]) => !v).map(([n]) => n);
    if (faltantes.length) {
      setTab("contabilidad");
      return toast.error(`Falta elegir: ${faltantes.join(", ")} (pestaña Contabilidad)`);
    }
    if (activeProducto) {
      dispatch(
        updateProducts({
          ...buildPayload(),
          usuarioModificacion: "admin",
        })
      );
      closeModal();

      // Refrescar la lista de productos después de actualizar uno
      setTimeout(() => {
        dispatch(getProducts(0, 0, "", 1, 20) as any);
      }, 300);
    } else {
      let creado: any = null;
      try {
        creado = await dispatch(
          createProducto({
            ...buildPayload(),
            usuarioCreacion: "admin",
          })
        );

        if (creado?.productoId && imagenArchivo) {
          setSubiendoImagen(true);
          try {
            await dispatch(subirImagenProducto(creado.productoId, imagenArchivo));
            toast.success("Imagen del producto subida");
          } catch {
            // el toast de error lo muestra la acción
          }
          setSubiendoImagen(false);
        }
      } catch {
        // el toast de error lo muestra la acción
      }

      closeModal();
      toast.success("Se creó un nuevo producto");
      limpiarImagen();
      setFormValues(initialForm);
      if (creado?.productoId) onGuardado?.(creado);

      // Refrescar la lista de productos después de crear uno nuevo (con pequeño delay)
      setTimeout(() => {
        dispatch(getProducts(0, 0, "", 1, 20) as any);
      }, 300);
    }
  };
  const [tipoAjuste, setTipoAjuste] = useState<number>(3); // AjusteEntrada
  const [cantidadAjuste, setCantidadAjuste] = useState<string>("");
  const [motivoAjuste, setMotivoAjuste] = useState<string>("");
  const [guardandoAjuste, setGuardandoAjuste] = useState(false);

  const showStockForm = () => {
    setIsStock(!isStock);
    setCantidadAjuste("");
    setMotivoAjuste("");
    setTipoAjuste(3);
  };

  const guardarAjusteStock = async () => {
    const cantidad = parseInt(cantidadAjuste, 10);
    if (!cantidad || cantidad <= 0) {
      return toast.error("Ingresa una cantidad válida");
    }
    setGuardandoAjuste(true);
    const resultado = await dispatch(
      ajustarStock(activeProducto, tipoAjuste, cantidad, motivoAjuste) as any
    );
    setGuardandoAjuste(false);
    if (resultado) {
      toast.success("Stock actualizado correctamente");
      setFormValues((prev: any) => ({ ...prev, stock: resultado.stockPosterior }));
      setCantidadAjuste("");
      setMotivoAjuste("");
    }
  };

  const eliminarProducto = () => {
    if (subiendoImagen || eliminandoImagen) return;

    const confirmado = window.confirm(`¿Seguro que deseas eliminar el producto "${activeProducto?.nombre}"?`);
    if (!confirmado) return;

    dispatch(deleteProducts(activeProducto?.productoId));
    closeModal();
    toast.success("Producto eliminado correctamente");
  };

  const abrirDialogoImagen = () => {
    if (subiendoImagen || eliminandoImagen) return;
    fileInputRef.current?.click();
  };

  const limpiarImagen = () => {
    if (imagenPreview) URL.revokeObjectURL(imagenPreview);
    setImagenPreview(null);
    setImagenArchivo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSeleccionarImagen = async (e: any) => {
    const archivo: File | undefined = e?.target?.files?.[0];
    if (!archivo) return;

    const extension = archivo.name.split(".").pop()?.toLowerCase() ?? "";
    const tipoValido = IMAGEN_EXTENSIONES.includes(extension) || IMAGEN_TIPOS.includes(archivo.type);

    if (!tipoValido) {
      toast.error("La imagen debe ser JPG, PNG o WEBP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (archivo.size > IMAGEN_MAX_BYTES) {
      toast.error("La imagen no puede superar los 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setArchivoParaRecortar(archivo);
  };

  const handleRecorteConfirmado = async (archivoRecortado: File) => {
    setArchivoParaRecortar(null);

    if (imagenPreview) URL.revokeObjectURL(imagenPreview);

    const previewUrl = URL.createObjectURL(archivoRecortado);
    setImagenArchivo(archivoRecortado);
    setImagenPreview(previewUrl);

    if (activeProducto?.productoId) {
      await subirImagen(activeProducto.productoId, archivoRecortado);
    }
  };

  const handleRecorteCancelado = () => {
    setArchivoParaRecortar(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const subirImagen = async (productoId: any, archivo: File) => {
    setSubiendoImagen(true);
    try {
      const data: any = await dispatch(subirImagenProducto(productoId, archivo));
      if (data) {
        setFormValues((prev: any) => ({
          ...prev,
          rutaImagen: data.rutaImagen,
          cloudinaryPublicId: data.cloudinaryPublicId,
        }));
        toast.success("Imagen del producto actualizada");
      }
    } catch {
      // el toast de error lo muestra la acción
    } finally {
      limpiarImagen();
      setSubiendoImagen(false);
    }
  };

  const eliminarImagen = async () => {
    if (!activeProducto?.productoId || subiendoImagen || eliminandoImagen) return;

    const confirmado = window.confirm("¿Eliminar la imagen del producto?");
    if (!confirmado) return;

    setEliminandoImagen(true);
    try {
      await dispatch(eliminarImagenProducto(activeProducto.productoId));
      setFormValues((prev: any) => ({
        ...prev,
        rutaImagen: null,
        cloudinaryPublicId: null,
      }));
      toast.success("Imagen eliminada correctamente");
    } catch {
      // el toast de error lo muestra la acción
    } finally {
      setEliminandoImagen(false);
    }
  };

  const imagenActual = imagenPreview ?? (rutaImagen ? rutaImagen : null);

  // ---- Video y galeria para la tienda web: se suben directo a Cloudinary (preset sin firma) ----
  const [subiendoMedia, setSubiendoMedia] = useState<"" | "video" | "galeria">("");
  const galeria: string[] = (() => { try { return JSON.parse(formValues.galeria || "[]"); } catch { return []; } })();
  const subirACloudinary = async (archivo: File, recurso: "image" | "video") => {
    const form = new FormData();
    form.append("file", archivo);
    form.append("upload_preset", "4devs-images");
    const r = await fetch(`https://api.cloudinary.com/v1_1/devs4/${recurso}/upload`, { method: "POST", body: form });
    if (!r.ok) throw new Error();
    return (await r.json()).secure_url as string;
  };
  const subirVideo = async (archivo?: File) => {
    if (!archivo) return;
    if (!VIDEO_TIPOS.includes(archivo.type)) return void toast.error("El video debe ser MP4 o WebM");
    if (archivo.size > VIDEO_MAX_MB * 1024 * 1024) return void toast.error(`El video no puede superar ${VIDEO_MAX_MB} MB (pesa ${(archivo.size / 1048576).toFixed(1)} MB)`);
    setSubiendoMedia("video");
    try {
      setFormValues((p: any) => ({ ...p, videoUrl: "" }));
      const url = await subirACloudinary(archivo, "video");
      setFormValues((p: any) => ({ ...p, videoUrl: url }));
    } catch { toast.error("No se pudo subir el video"); } finally { setSubiendoMedia(""); }
  };
  const subirGaleria = async (archivos: File[]) => {
    if (!archivos.length) return;
    if (galeria.length + archivos.length > GALERIA_MAX) return void toast.error(`La galería admite hasta ${GALERIA_MAX} imágenes (ya hay ${galeria.length})`);
    const invalida = archivos.find((a) => !IMAGEN_TIPOS.includes(a.type) || a.size > GALERIA_MAX_MB * 1024 * 1024);
    if (invalida) return void toast.error(`"${invalida.name}": solo JPG, PNG o WebP de hasta ${GALERIA_MAX_MB} MB`);
    setSubiendoMedia("galeria");
    try {
      const urls = await Promise.all(archivos.map((a) => subirACloudinary(a, "image")));
      setFormValues((p: any) => ({ ...p, galeria: JSON.stringify([...galeria, ...urls]) }));
    } catch { toast.error("No se pudo subir alguna imagen"); } finally { setSubiendoMedia(""); }
  };
  const quitarDeGaleria = (i: number) => setFormValues((p: any) => ({ ...p, galeria: JSON.stringify(galeria.filter((_, k) => k !== i)) }));

  // ---- Multi-precio (tab) ----
  const [formPrecioAlt, setFormPrecioAlt] = useState<{ nombre: string; precioVenta: string } | null>(null);

  const abrirNuevoPrecioAlt = (preset?: string) => {
    setFormPrecioAlt({ nombre: preset ?? "", precioVenta: "" });
  };

  const { errors: erroresPrecioAlt, setError: setErrorPrecioAlt, clearError: clearErrorPrecioAlt } = useFormErrors();

  const guardarPrecioAlt = () => {
    if (!formPrecioAlt?.nombre.trim()) {
      setErrorPrecioAlt("nombre", "El nombre del precio es obligatorio");
      return toast.error("El nombre del precio es obligatorio");
    }
    if (!formPrecioAlt?.precioVenta || Number(formPrecioAlt.precioVenta) <= 0) {
      setErrorPrecioAlt("precioVenta", "Ingresa un precio de venta válido");
      return toast.error("Ingresa un precio de venta válido");
    }

    setPreciosAlternativos([...preciosAlternativos, { ...formPrecioAlt, precioVenta: Number(formPrecioAlt.precioVenta) }]);
    setFormPrecioAlt(null);
  };

  const eliminarPrecioAlt = (index: number) => {
    setPreciosAlternativos(preciosAlternativos.filter((_, i) => i !== index));
  };

  // ---- Presentaciones (tab) ----
  const initialPresentacionForm = {
    nombre: "",
    codigo: generarCodigo(),
    unidadMedidaId: 0,
    unidadMedida: "",
    factor: "",
    precioVenta: "",
    precioMinimo: "",
  };
  const [formPresentacion, setFormPresentacion] = useState<typeof initialPresentacionForm | null>(null);

  const abrirNuevaPresentacion = () => {
    setFormPresentacion({ ...initialPresentacionForm, codigo: generarCodigo() });
  };

  const handleChangePresentacionSelect = (idValue: any, value: string, name: string, id: string) => {
    if (!formPresentacion) return;
    setFormPresentacion({ ...formPresentacion, [name]: value, [id]: idValue });
  };

  const { errors: erroresPresentacion, setError: setErrorPresentacion, clearError: clearErrorPresentacion } = useFormErrors();

  const guardarPresentacion = () => {
    if (!formPresentacion) return;
    if (!formPresentacion.nombre.trim()) {
      setErrorPresentacion("nombre", "El nombre de la presentación es obligatorio");
      return toast.error("El nombre de la presentación es obligatorio");
    }
    if (!formPresentacion.unidadMedidaId) {
      setErrorPresentacion("unidadMedidaId", "Elige la unidad de medida");
      return toast.error("Elige la unidad de medida");
    }
    if (!formPresentacion.factor || Number(formPresentacion.factor) <= 0) {
      setErrorPresentacion("factor", "Indica cuántas unidades trae");
      return toast.error("Indica cuántas unidades trae");
    }
    if (!formPresentacion.precioVenta || Number(formPresentacion.precioVenta) <= 0) {
      setErrorPresentacion("precioVenta", "Ingresa un precio de venta válido");
      return toast.error("Ingresa un precio de venta válido");
    }

    setPresentaciones([...presentaciones, { ...formPresentacion }]);
    setFormPresentacion(null);
  };

  const eliminarPresentacion = (index: number) => {
    setPresentaciones(presentaciones.filter((_, i) => i !== index));
  };

  // Lotes y Presentaciones son conceptos de inventario (SAP: solo aplican a un "Inventory Item") --
  // un servicio no maneja stock, asi que ambas pestañas se ocultan por completo en vez de deshabilitarse.
  const tabs: { id: TabId; label: string; disabled?: boolean }[] = [
    { id: "general", label: "General" },
    ...(esServicio ? [] : [{ id: "lotes" as TabId, label: "Lotes", disabled: !gestionLotes }]),
    ...(esServicio ? [] : [{ id: "presentaciones" as TabId, label: "Presentaciones" }]),
    { id: "multiprecio", label: "Multi-precio" },
    { id: "contabilidad", label: "Contabilidad" },
    { id: "imagenes", label: "Imágenes" },
  ];

  return (
    <>
    <Modal
      isOpen={modalProducts}
      style={customStyles}
      closeTimeoutMS={200}
      onRequestClose={closeModal}
      className={isStock ? styles.productoWithStock : styles.productoWithoutStock}
      overlayClassName="modal-fondo"
    >
      <div className={isStock ? styles["container-stock"] : styles.container}>
        <div className={styles.main}>
          <div className={styles.closeBtn} onClick={closeModal}>
            <Svg icon={Icons.close} />
          </div>
          <div className={styles.encabezado}>
            <h2>{activeProducto ? "Editar producto" : "Nuevo producto"}</h2>
          </div>

          <div className="flex gap-6 border-b border-gray-100 px-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={t.disabled}
                onClick={() => setTab(t.id)}
                className={`text-[15px] font-semibold px-1 py-3 border-b-2 -mb-px ${
                  t.disabled
                    ? "text-gray-300 cursor-not-allowed border-transparent"
                    : tab === t.id
                    ? "text-indigo-600 border-indigo-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleSeleccionarImagen}
          />

          {archivoParaRecortar && (
            <ImageCropModal archivo={archivoParaRecortar} onCropped={handleRecorteConfirmado} onCancel={handleRecorteCancelado} />
          )}

          <div className={styles.content} style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {tab === "general" && (
              <>
                <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 mx-1 mt-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500 shrink-0">
                    <Icon icon={esServicio ? "mdi:account-hard-hat-outline" : "mdi:package-variant-closed"} width={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">¿Es un servicio?</p>
                    <p className="text-xs text-gray-400">
                      Un servicio no maneja stock: se ocultan Stock, Peso, ICBPER, Lotes, Presentaciones y Destino de preparación.
                    </p>
                  </div>
                  <Toggle
                    isOn={esServicio}
                    handleToggle={() => setFormValues({ ...formValues, esServicio: !esServicio })}
                    colorOne="#7c3aed"
                    colorTwo="#ede9fe"
                    id="switchEsServicio"
                  />
                </div>

                <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 mx-1 mt-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <Icon icon="mdi:cart-arrow-up" width={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">Vender esto</p>
                    <p className="text-xs text-gray-400">
                      Permite agregar este producto o servicio a las Facturas.
                    </p>
                  </div>
                  <Toggle
                    isOn={seVende}
                    handleToggle={() => setFormValues({ ...formValues, seVende: !seVende })}
                    colorOne="#3b82f6"
                    colorTwo="#dbeafe"
                    id="switchSeVende"
                  />
                </div>

                <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 mx-1 mt-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                    <Icon icon="mdi:cart-arrow-down" width={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">Comprar esto</p>
                    <p className="text-xs text-gray-400">
                      Permite agregar este producto o servicio a las Compras.
                    </p>
                  </div>
                  <Toggle
                    isOn={seCompra}
                    handleToggle={() => setFormValues({ ...formValues, seCompra: !seCompra })}
                    colorOne="#f59e0b"
                    colorTwo="#fef3c7"
                    id="switchSeCompra"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 px-1 py-3">
                  <button type="button" className={styles["general-photo-drop"]} onClick={abrirDialogoImagen}>
                    {imagenActual ? (
                      <img src={imagenActual} alt="Producto" />
                    ) : (
                      <>
                        <Icon icon="solar:camera-minimalistic-outline" className={styles["general-photo-drop-icon"]} />
                        <span className={styles["general-photo-drop-title"]}>Suelta foto del producto</span>
                        <span className={styles["general-photo-drop-desc"]}>
                          Queda como imagen del producto. La IA rellena nombre y marca.
                        </span>
                        <span className={styles["general-photo-drop-hint"]}>JPG, PNG o WEBP · 5 MB max</span>
                      </>
                    )}
                  </button>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <Input name="codigo" value={codigo} label="Código" isLabel required type="text" error={codigo === "" ? "Obligatorio" : undefined} onChange={handleInputChange} />
                        <button
                          type="button"
                          title="Generar código"
                          onClick={() => setFormValues({ ...formValues, codigo: generarCodigo() })}
                          className="absolute right-3 top-[34px] text-indigo-400 hover:text-indigo-600"
                        >
                          <Icon icon="solar:magic-stick-3-bold" width={16} />
                        </button>
                      </div>
                      <SelectPro
                        isLabel
                        label="Unidad de medida"
                        required
                        isSearch
                        id="unidadMedidaId"
                        name="unidadMedida"
                        defaultValue={unidadMedida}
                        options={unidadesMedidaOptions}
                        onChange={handleChangeSelect}
                      />
                    </div>
                    <Input name="nombre" value={nombre} label="Nombre del producto" isLabel required type="text" error={nombre === "" ? "Obligatorio" : undefined} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-1 py-3">
                  <Input name="marca" value={marca} label="Marca" isLabel type="text" onChange={handleInputChange} />
                  <SelectPro
                    isLabel
                    label="Categoría"
                    isSearch
                    id="categoriaId"
                    name="nombreCategoria"
                    defaultValue={nombreCategoria}
                    options={newCategorias}
                    onChange={handleChangeSelect}
                    onAgregarNuevo={crearCategoriaRapida}
                    agregarNuevoLabel="categoría"
                    onEliminarOpcion={eliminarCategoriaRapida}
                  />
                  <SelectPro
                    isLabel
                    label="Sucursal"
                    required
                    isSearch
                    id="sucursalId"
                    name="sucursal"
                    defaultValue={sucursal}
                    options={sucursalesOptions}
                    onChange={handleChangeSelect}
                  />

                  <SelectPro
                    isLabel
                    label="Moneda"
                    required
                    isSearch
                    id="monedaId"
                    name="moneda"
                    defaultValue={moneda}
                    options={monedasOptions}
                    onChange={handleChangeSelect}
                    onAgregarNuevo={(busqueda) => setMonedaNueva({ codigo: busqueda.toUpperCase(), simbolo: "", locale: "es-PE", paisId: 0 })}
                    agregarNuevoLabel="moneda"
                    onEliminarOpcion={eliminarMoneda}
                  />
                  <SelectPro
                    isLabel
                    label="Afectación IGV"
                    required
                    isSearch
                    id="tipoIgvId"
                    name="tipoIgv"
                    defaultValue={tipoIgv}
                    options={tiposIgvOptions}
                    onChange={handleChangeSelect}
                    onAgregarNuevo={(busqueda) => setTipoIgvNuevo({ codigo: busqueda, descripcion: "", aplicaPorcentajeImpuesto: true })}
                    agregarNuevoLabel="código de Afectación IGV"
                    onEliminarOpcion={eliminarTipoIgv}
                  />
                  <SelectPro
                    isLabel
                    label="Detracción"
                    isSearch
                    defaultValue={
                      tiposDetraccion.find((t: any) => Number(t.porcentaje) === Number(porcentajeDetraccion))?.value ??
                      (Number(porcentajeDetraccion) === 0 ? "Ninguno" : `${porcentajeDetraccion}%`)
                    }
                    options={tiposDetraccion.map((t: any) => ({ id: t.porcentaje, value: t.value }))}
                    onChange={(idValue: any) => setFormValues({ ...formValues, porcentajeDetraccion: Number(idValue) })}
                    onAgregarNuevo={(busqueda) => setDetraccionNueva({ porcentaje: busqueda.replace("%", ""), descripcion: "" })}
                    agregarNuevoLabel="porcentaje de detracción"
                    onEliminarOpcion={(id) => eliminarDetraccion(Number(id))}
                  />

                  <Input
                    name="precioVentaSinInpuesto"
                    value={precioVentaSinInpuesto}
                    label="Precio compra"
                    onChange={handleInputChange}
                    isLabel
                    type="number"
                    prefix="S/"
                  />
                  <Input
                    name="precioVentaConInpuesto"
                    value={precioVentaConInpuesto}
                    label="Precio venta (con IGV)"
                    isLabel
                    required
                    type="number"
                    onChange={handleInputChange}
                    prefix="S/"
                  />
                  <Input
                    name="precioMinimo"
                    value={precioMinimo}
                    label="Precio mínimo"
                    isLabel
                    type="number"
                    onChange={handleInputChange}
                    prefix="S/"
                  />
                </div>

                <div className="flex flex-wrap gap-2 px-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-3 py-1.5">
                    <Icon icon="mdi:chevron-right" width={12} />
                    sin IGV: <span className="font-bold text-gray-900">S/ {precioVentaSinIgv.toFixed(2)}</span>
                    <Icon icon="mdi:pencil-outline" width={12} className="text-gray-400" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-3 py-1.5">
                    <Icon icon="mdi:chevron-right" width={12} />
                    Ganancia:{" "}
                    <span className="font-bold text-gray-900">
                      {gananciaMonto !== null ? `S/ ${gananciaMonto.toFixed(2)}` : "—"}
                    </span>
                    <Icon icon="mdi:pencil-outline" width={12} className="text-gray-400" />
                  </span>
                </div>

                {!esServicio && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-1 py-3">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Input
                            name="stock"
                            value={stock}
                            label="Stock inicial"
                            isLabel
                            type="number"
                            onChange={handleInputChange}
                            disabled={!!activeProducto}
                            suffix="UND"
                          />
                        </div>
                        {activeProducto && (
                          <button type="button" onClick={showStockForm} className={BTN_SECONDARY}>
                            {isStock ? "Cancelar" : "Añadir"}
                          </button>
                        )}
                      </div>
                      <Input
                        name="stockMinimo"
                        value={stockMinimo}
                        label="Stock mínimo"
                        isLabel
                        type="number"
                        onChange={handleInputChange}
                        suffix="UND"
                      />
                      <Input name="pesoKg" value={pesoKg} label="Peso (Kg)" isLabel type="number" onChange={handleInputChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-1 py-2">
                      <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                          <Icon icon="mdi:bag-personal-outline" width={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">¿Afecto a ICBPER?</p>
                          <p className="text-xs text-gray-400">Impuesto a bolsas plásticas</p>
                        </div>
                        <Toggle
                          isOn={icbper}
                          handleToggle={() => setFormValues({ ...formValues, icbper: !icbper })}
                          colorOne="#50cd89"
                          colorTwo="#c7ece8"
                          id="switchIcbper"
                        />
                      </div>
                      <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                          <Icon icon="mdi:clock-outline" width={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">Gestión de lotes y vencimientos</p>
                          <p className="text-xs text-gray-400">Controla vencimientos y vende primero lo que vence antes</p>
                        </div>
                        <Toggle
                          isOn={gestionLotes}
                          handleToggle={() => setFormValues({ ...formValues, gestionLotes: !gestionLotes })}
                          colorOne="#50cd89"
                          colorTwo="#c7ece8"
                          id="switchLotes"
                        />
                      </div>
                    </div>

                    <div className="px-1">
                      <label className="text-xs font-semibold text-gray-500">Destino de preparación (Restaurante)</label>
                      <select
                        className="w-full md:w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                        value={destinoPreparacion}
                        onChange={(e) => setFormValues({ ...formValues, destinoPreparacion: e.target.value })}
                      >
                        {DESTINO_PREPARACION_OPCIONES.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className={styles["main-content-fourth"]}>
                  <label>Descripción (la ve el cliente en la tienda web)</label>
                  <textarea onChange={handleInputChange} name="descripcion" value={formValues.descripcion ?? ""} maxLength={2000}></textarea>
                </div>

                <div className={styles["main-content-fourth"]}>
                  <label>Detalle (para uso interno del negocio)</label>
                  <textarea onChange={handleInputChange} name="comentario" value={comentario}></textarea>
                </div>
              </>
            )}

            {tab === "presentaciones" && (
              <div className="px-1 py-3">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Presentaciones del producto</h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Registra los empaques en los que vendes este producto. Ej.: una caja de 100 unidades, un blíster de 10.
                    </p>
                  </div>
                  {!formPresentacion && (
                    <button type="button" className={`${BTN_PRIMARY} whitespace-nowrap`} onClick={abrirNuevaPresentacion}>
                      + Nueva presentación
                    </button>
                  )}
                </div>

                {formPresentacion && (
                  <div className="border border-indigo-200 rounded-xl p-4 mb-4 bg-indigo-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        name="nombre"
                        value={formPresentacion.nombre}
                        label="Nombre"
                        isLabel
                        type="text"
                        error={erroresPresentacion.nombre}
                        onChange={(e: any) => { setFormPresentacion({ ...formPresentacion, nombre: e.target.value }); clearErrorPresentacion("nombre"); }}
                      />
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Input
                            name="codigo"
                            value={formPresentacion.codigo}
                            label="Código"
                            isLabel
                            type="text"
                            onChange={(e: any) => setFormPresentacion({ ...formPresentacion, codigo: e.target.value })}
                          />
                        </div>
                        <button
                          type="button"
                          className={BTN_SECONDARY}
                          onClick={() => setFormPresentacion({ ...formPresentacion, codigo: generarCodigo() })}
                        >
                          Generar
                        </button>
                      </div>
                      <div>
                        <SelectPro
                          isLabel
                          label="Unidad de medida"
                          isSearch
                          id="unidadMedidaId"
                          name="unidadMedida"
                          defaultValue={formPresentacion.unidadMedida}
                          options={unidadesMedidaOptions}
                          onChange={(idValue: any, value: string, name: string, id: string) => { handleChangePresentacionSelect(idValue, value, name, id); clearErrorPresentacion("unidadMedidaId"); }}
                        />
                        {erroresPresentacion.unidadMedidaId && <span className="text-xs" style={{ color: "#F24B89" }}>{erroresPresentacion.unidadMedidaId}</span>}
                      </div>
                      <Input
                        name="factor"
                        value={formPresentacion.factor}
                        label="¿Cuántas unidades trae?"
                        isLabel
                        type="number"
                        error={erroresPresentacion.factor}
                        onChange={(e: any) => { setFormPresentacion({ ...formPresentacion, factor: e.target.value }); clearErrorPresentacion("factor"); }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 bg-white border border-gray-100 rounded-lg px-3 py-2 my-3">
                      1 {formPresentacion.nombre || "presentación"} → {formPresentacion.factor || "—"} unidades
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        name="precioVenta"
                        value={formPresentacion.precioVenta}
                        label="Precio venta (con IGV)"
                        isLabel
                        type="number"
                        error={erroresPresentacion.precioVenta}
                        onChange={(e: any) => { setFormPresentacion({ ...formPresentacion, precioVenta: e.target.value }); clearErrorPresentacion("precioVenta"); }}
                      />
                      <Input
                        name="precioMinimo"
                        value={formPresentacion.precioMinimo}
                        label="Precio mínimo"
                        isLabel
                        type="number"
                        onChange={(e: any) => setFormPresentacion({ ...formPresentacion, precioMinimo: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button type="button" className={BTN_SECONDARY} onClick={() => setFormPresentacion(null)}>
                        Cancelar
                      </button>
                      <button type="button" className={BTN_PRIMARY} onClick={guardarPresentacion}>
                        Guardar presentación
                      </button>
                    </div>
                  </div>
                )}

                {presentaciones.length === 0 && !formPresentacion ? (
                  <div className="bg-gray-50 rounded-2xl px-6 py-8 text-center">
                    <div className="flex justify-center gap-3 mb-4">
                      {PRESET_PRESENTACIONES.map((preset) => (
                        <div
                          key={preset.label}
                          className="w-28 bg-white border border-gray-100 rounded-xl shadow-sm px-3 py-4 flex flex-col items-center gap-2"
                        >
                          <span className="text-3xl leading-none">{preset.emoji}</span>
                          <span className="text-xs font-bold text-gray-500 tracking-wide">{preset.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Define los empaques para tu producto</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                      Caja x100, Blíster x10, Display x24, Pack x6...{" "}
                      <span className="font-semibold text-gray-700">
                        Tus vendedores podrán elegir el empaque correcto al cobrar
                      </span>{" "}
                      y el stock se descuenta automáticamente.
                    </p>
                    <button type="button" className={`${BTN_PRIMARY} mt-4`} onClick={abrirNuevaPresentacion}>
                      + Crear primera presentación
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {presentaciones.map((p, i) => (
                      <div key={i} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{p.nombre}</p>
                          <p className="text-xs text-gray-500">
                            {p.factor} {p.unidadMedida} · S/ {Number(p.precioVenta).toFixed(2)}
                          </p>
                        </div>
                        <button type="button" onClick={() => eliminarPresentacion(i)} className="text-gray-400 hover:text-red-600">
                          <Icon icon="mdi:trash-can-outline" width={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "multiprecio" && (
              <div className="px-1 py-3">
                <div className="flex items-center justify-between border border-teal-200 bg-teal-50/40 rounded-xl px-4 py-3 mb-4">
                  <div>
                    <p className="font-bold text-gray-900">Multi-precio</p>
                    <p className="text-xs text-gray-500">
                      {multiPrecioActivo ? "Activo" : "Inactivo"} - los cajeros podrán elegir el precio al cobrar
                    </p>
                  </div>
                  <Toggle
                    isOn={multiPrecioActivo}
                    handleToggle={() => setFormValues({ ...formValues, multiPrecioActivo: !multiPrecioActivo })}
                    colorOne="#50cd89"
                    colorTwo="#c7ece8"
                    id="switchMultiPrecio"
                  />
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Precio estándar del producto</p>
                  <p className="text-xs text-gray-400 mt-0.5">Se configura en la pestaña General. Los precios alternativos se comparan contra éste.</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">S/ {precioVentaNum.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900">Precios alternativos</h4>
                  {!formPrecioAlt && preciosAlternativos.length > 0 && (
                    <button type="button" className={BTN_PRIMARY} onClick={() => abrirNuevoPrecioAlt()}>
                      + Nuevo precio
                    </button>
                  )}
                </div>

                {formPrecioAlt && (
                  <div className="border border-indigo-200 rounded-xl p-4 mb-4 bg-indigo-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        name="nombre"
                        value={formPrecioAlt.nombre}
                        label="Nombre del precio"
                        isLabel
                        type="text"
                        error={erroresPrecioAlt.nombre}
                        onChange={(e: any) => { setFormPrecioAlt({ ...formPrecioAlt, nombre: e.target.value }); clearErrorPrecioAlt("nombre"); }}
                      />
                      <Input
                        name="precioVenta"
                        value={formPrecioAlt.precioVenta}
                        label="Precio venta (con IGV)"
                        isLabel
                        type="number"
                        error={erroresPrecioAlt.precioVenta}
                        onChange={(e: any) => { setFormPrecioAlt({ ...formPrecioAlt, precioVenta: e.target.value }); clearErrorPrecioAlt("precioVenta"); }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 bg-white border border-gray-100 rounded-lg px-3 py-2 my-3">
                      Comparación vs precio estándar (S/ {precioVentaNum.toFixed(2)}):{" "}
                      {formPrecioAlt.precioVenta
                        ? `${(Number(formPrecioAlt.precioVenta) - precioVentaNum).toFixed(2)}`
                        : "— aún no hay precio ingresado"}
                    </p>
                    <div className="flex justify-end gap-2">
                      <button type="button" className={BTN_SECONDARY} onClick={() => setFormPrecioAlt(null)}>
                        Cancelar
                      </button>
                      <button type="button" className={BTN_PRIMARY} onClick={guardarPrecioAlt}>
                        Guardar precio
                      </button>
                    </div>
                  </div>
                )}

                {preciosAlternativos.length === 0 && !formPrecioAlt ? (
                  <div className="bg-gray-50 rounded-2xl px-6 py-8 text-center">
                    <div className="flex justify-center gap-3 mb-4">
                      {PRESET_PRECIOS_ALTERNATIVOS.map((preset) => (
                        <div
                          key={preset.label}
                          className="w-28 bg-white border border-gray-100 rounded-xl shadow-sm px-3 py-4 flex flex-col items-center gap-2"
                        >
                          <span className="text-3xl leading-none">{preset.emoji}</span>
                          <span className="text-xs font-bold text-gray-500 tracking-wide">{preset.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Aún no tienes precios alternativos</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                      Define precios para clientes mayoristas, VIP, distribuidores o por campañas. El cajero podrá elegir al momento de cobrar.
                    </p>
                    <button type="button" className={`${BTN_PRIMARY} mt-4`} onClick={() => abrirNuevoPrecioAlt()}>
                      + Crear primer precio alternativo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {preciosAlternativos.map((p, i) => (
                      <div key={i} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2">
                        <p className="text-sm font-semibold text-gray-800">{p.nombre}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-700">S/ {Number(p.precioVenta).toFixed(2)}</span>
                          <button type="button" onClick={() => eliminarPrecioAlt(i)} className="text-gray-400 hover:text-red-600">
                            <Icon icon="mdi:trash-can-outline" width={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "contabilidad" && (
              <div className="px-1 py-3">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-gray-900">Cuentas contables</h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Solo cuentas de último nivel (8 dígitos) del Plan de Cuentas. Puedes buscar por número de cuenta.
                    Los pares Debe/Haber de ingreso y de gasto son obligatorios.
                  </p>
                </div>

                <h5 className="text-sm font-bold text-gray-800 mb-2">Cuenta de ingreso (venta)</h5>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <SelectPro
                    isLabel
                    label="Debe *"
                    isSearch
                    id="cuentaIngresoDebeId"
                    name="cuentaIngresoDebeIgnorar"
                    defaultValue={textoCuenta(formValues.cuentaIngresoDebeId)}
                    options={cuentasOptions}
                    onChange={(idValue: any) => setFormValues({ ...formValues, cuentaIngresoDebeId: idValue })}
                  />
                  <SelectPro
                    isLabel
                    label="Haber *"
                    isSearch
                    id="cuentaIngresoId"
                    name="cuentaIngresoIgnorar"
                    defaultValue={textoCuenta(formValues.cuentaIngresoId)}
                    options={cuentasOptions}
                    onChange={(idValue: any) => setFormValues({ ...formValues, cuentaIngresoId: idValue })}
                  />
                </div>

                <h5 className="text-sm font-bold text-gray-800 mb-2">{esServicio ? "Cuenta de gasto" : "Cuenta de costo de venta / gasto"}</h5>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <SelectPro
                    isLabel
                    label="Debe *"
                    isSearch
                    id="cuentaCostoId"
                    name="cuentaCostoIgnorar"
                    defaultValue={textoCuenta(formValues.cuentaCostoId)}
                    options={cuentasOptions}
                    onChange={(idValue: any) => setFormValues({ ...formValues, cuentaCostoId: idValue })}
                  />
                  <SelectPro
                    isLabel
                    label="Haber *"
                    isSearch
                    id="cuentaGastoHaberId"
                    name="cuentaGastoHaberIgnorar"
                    defaultValue={textoCuenta(formValues.cuentaGastoHaberId)}
                    options={cuentasOptions}
                    onChange={(idValue: any) => setFormValues({ ...formValues, cuentaGastoHaberId: idValue })}
                  />
                </div>

                {!esServicio && (
                  <>
                    <h5 className="text-sm font-bold text-gray-800 mb-2">Cuenta de inventario por movimiento</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {MOVIMIENTOS_INVENTARIO.map((m) => (
                        <SelectPro
                          key={`${m.id}-${activeProducto?.productoId ?? 0}`}
                          isLabel
                          label={m.label}
                          isSearch
                          id={`cuentaInv${m.id}`}
                          name={`cuentaInv${m.id}Ignorar`}
                          defaultValue={textoCuenta(formValues.cuentasInventarioMovimiento?.[m.id])}
                          options={cuentasOptions}
                          onChange={(idValue: any) => setFormValues({
                            ...formValues,
                            cuentasInventarioMovimiento: { ...(formValues.cuentasInventarioMovimiento ?? {}), [m.id]: idValue },
                          })}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "imagenes" && (
              <div className="px-1 py-3">
                <div className={styles["imagen-contenedor"]}>
                  {subiendoImagen ? (
                    <div className={styles["imagen-estado"]}>
                      <span className={styles["imagen-spinner"]}></span>
                      <p>Subiendo imagen...</p>
                    </div>
                  ) : eliminandoImagen ? (
                    <div className={styles["imagen-estado"]}>
                      <span className={styles["imagen-spinner"]}></span>
                      <p>Eliminando imagen...</p>
                    </div>
                  ) : imagenActual ? (
                    <div className={styles["imagen-con-overlay"]}>
                      <img src={imagenActual} alt="Imagen del producto" onClick={abrirDialogoImagen} />
                      <div className={styles["imagen-overlay"]}>
                        <div className={styles["overlay-boton"]} onClick={abrirDialogoImagen}>
                          <Icon icon="solar:pen-linear" />
                          <span>Cambiar imagen</span>
                        </div>
                        {activeProducto && (
                          <div className={`${styles["overlay-boton"]} ${styles["overlay-boton-eliminar"]}`} onClick={eliminarImagen}>
                            <Icon icon="solar:trash-bin-minimalistic-linear" />
                            <span>Eliminar imagen</span>
                          </div>
                        )}
                      </div>
                      {imagenArchivo && !activeProducto && (
                        <div className={styles["imagen-preview-note"]}>
                          <span>Imagen seleccionada para el nuevo producto</span>
                          <button type="button" onClick={limpiarImagen} className={styles["preview-quitar"]}>
                            Quitar imagen
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button type="button" className={styles["imagen-vacia"]} onClick={abrirDialogoImagen}>
                      <Icon icon="solar:camera-minimalistic-outline" />
                      <span>Agregar imagen</span>
                    </button>
                  )}
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-sm font-bold text-gray-900">Galería para la tienda web</p>
                  <p className="text-xs text-gray-400 mb-2">Hasta {GALERIA_MAX} imágenes adicionales · JPG, PNG o WebP · máx. {GALERIA_MAX_MB} MB c/u</p>
                  <div className="flex flex-wrap gap-2">
                    {galeria.map((u, i) => (
                      <div key={u} className="relative w-20 h-20">
                        <img src={u} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                        <button type="button" onClick={() => quitarDeGaleria(i)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs leading-5">×</button>
                      </div>
                    ))}
                    {galeria.length < GALERIA_MAX && (
                      <label className="w-20 h-20 border border-dashed rounded-lg flex items-center justify-center text-xs text-indigo-600 cursor-pointer text-center">
                        {subiendoMedia === "galeria" ? "Subiendo..." : "+ Agregar"}
                        <input type="file" multiple hidden accept={IMAGEN_TIPOS.join(",")} disabled={!!subiendoMedia}
                          onChange={(e) => { subirGaleria(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-sm font-bold text-gray-900">Video del producto</p>
                  <p className="text-xs text-gray-400 mb-2">MP4 o WebM · máx. {VIDEO_MAX_MB} MB. Se muestra en la tienda web.</p>
                  {formValues.videoUrl && <video src={formValues.videoUrl} controls className="w-64 rounded-lg border mb-2" />}
                  <label className="text-xs text-indigo-600 cursor-pointer">
                    {subiendoMedia === "video" ? "Subiendo video..." : formValues.videoUrl ? "Cambiar video" : "Subir video"}
                    <input type="file" hidden accept={VIDEO_TIPOS.join(",")} disabled={!!subiendoMedia}
                      onChange={(e) => { subirVideo(e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                  {formValues.videoUrl && !subiendoMedia && (
                    <button type="button" className="ml-3 text-xs text-gray-500" onClick={() => setFormValues((p: any) => ({ ...p, videoUrl: "" }))}>Quitar</button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            {activeProducto ? (
              <button
                type="button"
                onClick={eliminarProducto}
                className="text-sm font-semibold text-red-600 hover:text-red-700 rounded-lg px-4 py-2.5 hover:bg-red-50"
              >
                Eliminar
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-gray-50"
              >
                Cancelar
                <span className="text-[10px] font-semibold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">Esc</span>
              </button>
              <button
                type="button"
                onClick={createProduct}
                disabled={
                  !!subiendoMedia ||
                  subiendoImagen ||
                  eliminandoImagen ||
                  nombre === "" ||
                  codigo === "" ||
                  !formValues.unidadMedidaId ||
                  !formValues.sucursalId ||
                  !formValues.monedaId ||
                  !formValues.tipoIgvId ||
                  precioVentaNum <= 0
                }
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-4 py-2.5"
              >
                {activeProducto ? "Guardar cambios" : "Crear producto"}
                <span className="flex items-center justify-center text-white/80 border border-white/30 rounded px-1.5 py-0.5">
                  <Icon icon="mdi:keyboard-return" width={12} />
                </span>
              </button>
            </div>
            {(() => {
              const faltantes = [
                nombre === "" && "el nombre",
                codigo === "" && "el código",
                !formValues.unidadMedidaId && "la unidad de medida",
                !formValues.sucursalId && "la sucursal",
                !formValues.monedaId && "la moneda",
                !formValues.tipoIgvId && "el IGV",
                precioVentaNum <= 0 && "un precio de venta mayor a 0",
              ].filter(Boolean);
              return faltantes.length > 0 ? (
                <p className="text-xs text-right mt-1" style={{ color: "#F24B89" }}>
                  Falta completar: {faltantes.join(", ")}.
                </p>
              ) : null;
            })()}
          </div>
        </div>
        {isStock && (
          <div className={styles["pay-table"]}>
            <div className={styles["content-main-modal"]}>
              <div className={styles.encabezadoPay}>
                <h2>
                  Agregar Stock
                  <span>
                    <span>Agrega cantidades para el stock</span>
                  </span>
                </h2>
              </div>
              <div className={styles["content-stock"]}>
                <div>
                  <div className={styles["first-card-stock"]}>
                    <p>Stock actual: {stock}</p>
                    <select value={tipoAjuste} onChange={(e) => setTipoAjuste(Number(e.target.value))}>
                      <option value={3}>Entrada (agregar)</option>
                      <option value={4}>Salida (quitar)</option>
                    </select>
                    <Input
                      name="cantidadAjuste"
                      value={cantidadAjuste}
                      label="Cantidad"
                      isLabel
                      type="number"
                      onChange={(e: any) => setCantidadAjuste(e.target.value)}
                    />
                    <div className={styles["secondDiv-stock"]}>
                      <Input
                        name="motivoAjuste"
                        value={motivoAjuste}
                        label="Motivo (opcional)"
                        isLabel
                        onChange={(e: any) => setMotivoAjuste(e.target.value)}
                      />
                    </div>
                    <div className={styles["main-content-buttons"]}>
                      <Button size="sm" onClick={showStockForm} type="button">
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={guardarAjusteStock} disabled={guardandoAjuste} type="button">
                        {guardandoAjuste ? "Guardando..." : "Agregar Stock"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>

    {monedaNueva && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setMonedaNueva(null)}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, width: "min(420px, 100%)" }} onClick={(e) => e.stopPropagation()}>
          <h4 style={{ margin: "0 0 12px" }}>Nueva moneda</h4>
          <div style={{ display: "grid", gap: 10 }}>
            <Input isLabel label="Código (ej. USD)" name="codigo" value={monedaNueva.codigo} onChange={(e: any) => setMonedaNueva({ ...monedaNueva, codigo: e.target.value.toUpperCase() })} />
            <Input isLabel label="Símbolo (ej. $)" name="simbolo" value={monedaNueva.simbolo} onChange={(e: any) => setMonedaNueva({ ...monedaNueva, simbolo: e.target.value })} />
            <Input isLabel label="Locale (ej. en-US)" name="locale" value={monedaNueva.locale} onChange={(e: any) => setMonedaNueva({ ...monedaNueva, locale: e.target.value })} />
            <SelectPro
              isLabel
              label="País"
              isSearch
              options={(paises as any[]).map((p: any) => ({ id: p.id, value: p.nombre ?? p.value }))}
              onChange={(idValue: any) => setMonedaNueva({ ...monedaNueva, paisId: Number(idValue) })}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
            <Button size="sm" onClick={() => setMonedaNueva(null)} type="button">Cancelar</Button>
            <Button size="sm" onClick={guardarMonedaNueva} disabled={guardandoCatalogo} type="button">
              {guardandoCatalogo ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    )}

    {detraccionNueva && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setDetraccionNueva(null)}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, width: "min(420px, 100%)" }} onClick={(e) => e.stopPropagation()}>
          <h4 style={{ margin: "0 0 4px" }}>Nuevo porcentaje de detracción</h4>
          <p style={{ fontSize: 12, color: "#9c6f00", background: "#fff8e1", padding: 8, borderRadius: 6, margin: "0 0 12px" }}>
            ⚠️ Debe corresponder a un porcentaje real de detracción SUNAT. Uno inventado puede invalidar el comprobante.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            <Input isLabel label="Porcentaje (ej. 6)" name="porcentaje" value={detraccionNueva.porcentaje} onChange={(e: any) => setDetraccionNueva({ ...detraccionNueva, porcentaje: e.target.value })} />
            <Input isLabel label="Descripción (opcional)" name="descripcion" value={detraccionNueva.descripcion} onChange={(e: any) => setDetraccionNueva({ ...detraccionNueva, descripcion: e.target.value })} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
            <Button size="sm" onClick={() => setDetraccionNueva(null)} type="button">Cancelar</Button>
            <Button size="sm" onClick={guardarDetraccionNueva} disabled={guardandoCatalogo} type="button">
              {guardandoCatalogo ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    )}

    {tipoIgvNuevo && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setTipoIgvNuevo(null)}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, width: "min(420px, 100%)" }} onClick={(e) => e.stopPropagation()}>
          <h4 style={{ margin: "0 0 4px" }}>Nuevo código de Afectación IGV</h4>
          <p style={{ fontSize: 12, color: "#9c6f00", background: "#fff8e1", padding: 8, borderRadius: 6, margin: "0 0 12px" }}>
            ⚠️ Debe corresponder a un código real de la Tabla 07 de SUNAT. Un código inventado puede invalidar el comprobante.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            <Input isLabel label="Código SUNAT (ej. 10, 20, 30)" name="codigo" value={tipoIgvNuevo.codigo} onChange={(e: any) => setTipoIgvNuevo({ ...tipoIgvNuevo, codigo: e.target.value })} />
            <Input isLabel label="Descripción" name="descripcion" value={tipoIgvNuevo.descripcion} onChange={(e: any) => setTipoIgvNuevo({ ...tipoIgvNuevo, descripcion: e.target.value })} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={tipoIgvNuevo.aplicaPorcentajeImpuesto} onChange={(e) => setTipoIgvNuevo({ ...tipoIgvNuevo, aplicaPorcentajeImpuesto: e.target.checked })} />
              Gravado (aplica el % de IGV del tenant)
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
            <Button size="sm" onClick={() => setTipoIgvNuevo(null)} type="button">Cancelar</Button>
            <Button size="sm" onClick={guardarTipoIgvNuevo} disabled={guardandoCatalogo} type="button">
              {guardandoCatalogo ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
