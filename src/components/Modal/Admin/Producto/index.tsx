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
  createProducto,
  deleteProducts,
  eliminarImagenProducto,
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

const BTN_PRIMARY =
  "bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const BTN_SECONDARY =
  "border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors";

const TASA_IGV_DEFAULT = 0.18;

const DETRACCION_OPCIONES = [
  { id: 0, value: "Ninguno" },
  { id: 4, value: "4%" },
  { id: 10, value: "10%" },
  { id: 12, value: "12%" },
  { id: 15, value: "15%" },
];

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

const initialForm = {
  nombreCategoria: "",
  categoriaId: 0,
  nombreGrupo: "",
  grupoId: 0,
  nombre: "",
  rutaImagen: "",
  cloudinaryPublicId: "",
  comentario: "",
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
};

type TabId = "general" | "lotes" | "presentaciones" | "multiprecio" | "imagenes";

const customStyles = {};
Modal.setAppElement("#root");

const IMAGEN_MAX_BYTES = 5 * 1024 * 1024;
const IMAGEN_EXTENSIONES = ["jpg", "jpeg", "png", "webp"];
const IMAGEN_TIPOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ProductoModal = () => {
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
  } = formValues;

  const [isStock, setIsStock] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getSucursales() as any);
    dispatch(getMonedas() as any);
    dispatch(getTiposIgv() as any);
    dispatch(getUnidadesMedida() as any);
  }, [dispatch]);

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
    if (activeProducto) {
      dispatch(
        updateProducts({
          ...buildPayload(),
          usuarioModificacion: "admin",
        })
      );
      closeModal();
    } else {
      try {
        const creado: any = await dispatch(
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

  // ---- Multi-precio (tab) ----
  const [formPrecioAlt, setFormPrecioAlt] = useState<{ nombre: string; precioVenta: string } | null>(null);

  const abrirNuevoPrecioAlt = (preset?: string) => {
    setFormPrecioAlt({ nombre: preset ?? "", precioVenta: "" });
  };

  const guardarPrecioAlt = () => {
    if (!formPrecioAlt?.nombre.trim()) return toast.error("El nombre del precio es obligatorio");
    if (!formPrecioAlt?.precioVenta || Number(formPrecioAlt.precioVenta) <= 0)
      return toast.error("Ingresa un precio de venta válido");

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

  const guardarPresentacion = () => {
    if (!formPresentacion) return;
    if (!formPresentacion.nombre.trim()) return toast.error("El nombre de la presentación es obligatorio");
    if (!formPresentacion.unidadMedidaId) return toast.error("Elige la unidad de medida");
    if (!formPresentacion.factor || Number(formPresentacion.factor) <= 0)
      return toast.error("Indica cuántas unidades trae");
    if (!formPresentacion.precioVenta || Number(formPresentacion.precioVenta) <= 0)
      return toast.error("Ingresa un precio de venta válido");

    setPresentaciones([...presentaciones, { ...formPresentacion }]);
    setFormPresentacion(null);
  };

  const eliminarPresentacion = (index: number) => {
    setPresentaciones(presentaciones.filter((_, i) => i !== index));
  };

  const tabs: { id: TabId; label: string; disabled?: boolean }[] = [
    { id: "general", label: "General" },
    { id: "lotes", label: "Lotes", disabled: !gestionLotes },
    { id: "presentaciones", label: "Presentaciones" },
    { id: "multiprecio", label: "Multi-precio" },
    { id: "imagenes", label: "Imágenes" },
  ];

  return (
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
                        <Input name="codigo" value={codigo} label="Código" isLabel required type="text" onChange={handleInputChange} />
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
                        value={unidadMedida}
                        options={unidadesMedidaOptions}
                        onChange={handleChangeSelect}
                      />
                    </div>
                    <Input name="nombre" value={nombre} label="Nombre del producto" isLabel required type="text" onChange={handleInputChange} />
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
                    value={nombreCategoria}
                    options={newCategorias}
                    onChange={handleChangeSelect}
                  />
                  <SelectPro
                    isLabel
                    label="Sucursal"
                    required
                    isSearch
                    id="sucursalId"
                    name="sucursal"
                    value={sucursal}
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
                    value={moneda}
                    options={monedasOptions}
                    onChange={handleChangeSelect}
                  />
                  <SelectPro
                    isLabel
                    label="Afectación IGV"
                    required
                    isSearch
                    id="tipoIgvId"
                    name="tipoIgv"
                    value={tipoIgv}
                    options={tiposIgvOptions}
                    onChange={handleChangeSelect}
                  />
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Detracción</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                      value={porcentajeDetraccion}
                      onChange={(e) => setFormValues({ ...formValues, porcentajeDetraccion: Number(e.target.value) })}
                    >
                      {DETRACCION_OPCIONES.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.value}
                        </option>
                      ))}
                    </select>
                  </div>

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
                        onChange={(e: any) => setFormPresentacion({ ...formPresentacion, nombre: e.target.value })}
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
                      <SelectPro
                        isLabel
                        label="Unidad de medida"
                        isSearch
                        id="unidadMedidaId"
                        name="unidadMedida"
                        value={formPresentacion.unidadMedida}
                        options={unidadesMedidaOptions}
                        onChange={handleChangePresentacionSelect}
                      />
                      <Input
                        name="factor"
                        value={formPresentacion.factor}
                        label="¿Cuántas unidades trae?"
                        isLabel
                        type="number"
                        onChange={(e: any) => setFormPresentacion({ ...formPresentacion, factor: e.target.value })}
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
                        onChange={(e: any) => setFormPresentacion({ ...formPresentacion, precioVenta: e.target.value })}
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
                        onChange={(e: any) => setFormPrecioAlt({ ...formPrecioAlt, nombre: e.target.value })}
                      />
                      <Input
                        name="precioVenta"
                        value={formPrecioAlt.precioVenta}
                        label="Precio venta (con IGV)"
                        isLabel
                        type="number"
                        onChange={(e: any) => setFormPrecioAlt({ ...formPrecioAlt, precioVenta: e.target.value })}
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
  );
};
