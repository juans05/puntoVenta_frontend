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
import "../../index.css";
import Input from "../../../Input";
import { Button } from "@tremor/react";
import { Toggle } from "../../../Toggle";
import SelectPro from "../../../SelectPro";
import { toast } from "sonner";
import { ImageCropModal } from "../../../ImageCropModal";
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
};
const customStyles = {};
Modal.setAppElement("#root");

const IMAGEN_MAX_BYTES = 5 * 1024 * 1024;
const IMAGEN_EXTENSIONES = ["jpg", "jpeg", "png", "webp"];
const IMAGEN_TIPOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ProductoModal = () => {
  const { modalProducts, activeProducto, categorias, grupos, allGrupos }: any =
    useAppSelector((state: RootState) => state.adminProducts);

  console.log(grupos);
  /*  console.log(activeProducto?.comentarios[0]?.descripcion); */

  const dispatch = useAppDispatch();
  const [formValues, setFormValues] = useState<any>(initialForm);
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
    codigoBarra,
    stock,
    precioVentaSinInpuesto,
    margenGanancia,
    categoriaId,
    grupoId,
    nombreGrupo,
    nombreCategoria,
  } = formValues;
  // const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  // useEffect(() => {
  //   const handleResize = () => {
  //     setWindowHeight(window.innerHeight);
  //   };

  //   window.addEventListener("resize", handleResize);

  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  // const setHeight =
  //   windowHeight >= 953
  //     ? "773px"
  //     : windowHeight >= 804
  //     ? "600px"
  //     : windowHeight <= 803 && windowHeight > 748
  //     ? "773px"
  //     : windowHeight <= 747 && windowHeight > 603
  //     ? "557px"
  //     : windowHeight <= 603 && "410px";
  console.log(categoriaId);
  const [checkedPrecio, setCheckedPrecio] = useState<boolean>(false);
  const [isStock, setIsStock] = useState<boolean>(false);

  useEffect(() => {
    if (activeProducto) {
      setFormValues({
        ...activeProducto,
        /*        comentarios: activeProducto?.comentarios[0]?.descripcion, */
      });
    } else {
      setFormValues(initialForm);
    }
  }, [activeProducto, setFormValues]);
  const handleInputChange = (e: any) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };
  const handleChangeSelect = (
    idValue: any,
    value: string,
    name: string,
    id: number
  ) => {
    console.log(idValue, id, name, value);

    setFormValues({
      ...formValues,
      [name]: value,
      [id]: idValue,
    });
  };

  console.log(categorias);
  const filterAvoidAllCategorias = categorias?.filter(
    (value: any) => value?.categoriaId !== 0
  );
  const newCategorias = filterAvoidAllCategorias?.map((value: any) => {
    return {
      id: value?.categoriaId,
      value: value?.nombre,
    };
  });
  const gruposFilter = allGrupos?.filter(
    (value: any) => `${value?.categoriaId}` === categoriaId
  );
  const gruposFilterAvoidAll = gruposFilter?.filter(
    (value: any) => `${value?.nombre}` !== "Todos"
  );
  console.log(gruposFilter);
  const newGrupos = gruposFilterAvoidAll?.map((value: any) => {
    return {
      id: value?.grupoId,
      value: value?.nombre,
    };
  });
  const suma = (
    Number(precioVentaSinInpuesto) + Number(margenGanancia)
  ).toFixed(2);
  const closeModal = () => {
    if (subiendoImagen || eliminandoImagen) return;

    dispatch(closeModalProducto());

    setTimeout(() => {
      dispatch(clearActiveProducto());
      setIsStock(false);
      setFormValues(initialForm);
      limpiarImagen();
    }, 200);
  };
  const createProduct = async () => {
    if (activeProducto) {
      dispatch(
        updateProducts({
          ...formValues,
          cambioPrecioPermitido: checkedPrecio,
          precioVentaConInpuesto: suma,
          precio: suma,
          proveedorId: null,
          usuarioModificacion: "admin",
          stock: parseInt(stock),
        })
      );
      closeModal();
    } else {
      try {
        const creado: any = await dispatch(
          createProducto({
            ...formValues,
            cambioPrecioPermitido: checkedPrecio,
            precioVentaConInpuesto: suma,
            precio: suma,
            proveedorId: null,
            usuarioCreacion: "admin",
            stock: parseInt(stock),
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

    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar el producto "${activeProducto?.nombre}"?`
    );
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
    const tipoValido =
      IMAGEN_EXTENSIONES.includes(extension) ||
      IMAGEN_TIPOS.includes(archivo.type);

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

  const imagenActual =
    imagenPreview ?? (rutaImagen ? rutaImagen : null);

  return (
    <Modal
      isOpen={modalProducts}
      style={customStyles}
      closeTimeoutMS={200}
      className={
        isStock ? styles.productoWithStock : styles.productoWithoutStock
      }
      overlayClassName="modal-fondo"
    >
      <div className={isStock ? styles["container-stock"] : styles.container}>
        <div className={styles.main}>
          <div className={styles.closeBtn} onClick={closeModal}>
            <Svg icon={Icons.close} />
          </div>
          <div className={styles.encabezado}>
            <h2>{activeProducto ? "Editar" : "Crear"} Producto</h2>
          </div>
          <div className={styles.content}>
            <div className={styles.warning}>
              <Icon icon="pajamas:warning" />
              <div className={styles["warning-text"]}>
                <h3>Tomar en cuenta</h3>
                <p>
                  Todo producto deberá tener asignado una categoría para un
                  mejor control en el sistema de Punto de venta.
                </p>
              </div>
            </div>
            <div className={styles["main-content"]}>
              <div className={styles["main-content-first"]}>
                <div className={styles["imagen-contenedor"]}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={handleSeleccionarImagen}
                  />

                  {archivoParaRecortar && (
                    <ImageCropModal
                      archivo={archivoParaRecortar}
                      onCropped={handleRecorteConfirmado}
                      onCancel={handleRecorteCancelado}
                    />
                  )}

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
                      <img
                        src={imagenActual}
                        alt="Imagen del producto"
                        onClick={abrirDialogoImagen}
                      />
                      <div className={styles["imagen-overlay"]}>
                        <div
                          className={styles["overlay-boton"]}
                          onClick={abrirDialogoImagen}
                        >
                          <Icon icon="solar:pen-linear" />
                          <span>Cambiar imagen</span>
                        </div>
                        {activeProducto && (
                          <div
                            className={`${styles["overlay-boton"]} ${styles["overlay-boton-eliminar"]}`}
                            onClick={eliminarImagen}
                          >
                            <Icon icon="solar:trash-bin-minimalistic-linear" />
                            <span>Eliminar imagen</span>
                          </div>
                        )}
                      </div>
                      {imagenArchivo && !activeProducto && (
                        <div className={styles["imagen-preview-note"]}>
                          <span>Imagen seleccionada para el nuevo producto</span>
                          <button
                            type="button"
                            onClick={limpiarImagen}
                            className={styles["preview-quitar"]}
                          >
                            Quitar imagen
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles["imagen-vacia"]}
                      onClick={abrirDialogoImagen}
                    >
                      <Icon icon="solar:camera-minimalistic-outline" />
                      <span>Agregar imagen</span>
                    </button>
                  )}
                </div>
                <div>
                  <Input
                    name="nombre"
                    value={nombre}
                    label="Nombre de Producto"
                    isLabel
                    type="text"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className={styles["main-content-second"]}>
                <div>
                  <SelectPro
                    isLabel
                    label="Seleccione una categoría"
                    isSearch
                    id="categoriaId"
                    name="category"
                    defaultValue={nombreCategoria}
                    options={newCategorias}
                    onChange={handleChangeSelect}
                  />
                  <SelectPro
                    isLabel
                    label="Seleccione una grupo"
                    isSearch
                    id="grupoId"
                    name="grupo"
                    defaultValue={nombreGrupo}
                    options={newGrupos}
                    onChange={handleChangeSelect}
                  />
                </div>

                <div>
                  <Input
                    name="codigoBarra"
                    value={codigoBarra}
                    label="Código de barras"
                    isLabel
                    type="text"
                    onChange={handleInputChange}
                  />
                  <div
                    style={{ display: "flex", alignItems: "end", gap: "10px" }}
                    className={styles.stock}
                  >
                    <Input
                      name="stock"
                      value={stock}
                      label="Stock"
                      isLabel
                      type="number"
                      onChange={handleInputChange}
                      disabled={!!activeProducto}
                    />
                    {activeProducto && (
                      <Button onClick={showStockForm} type="button">
                        {isStock ? "Cancelar" : "Añadir"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles["main-content-third"]}>
                <div>
                  <Input
                    name="precioVentaSinInpuesto"
                    value={precioVentaSinInpuesto}
                    label="Costo"
                    onChange={handleInputChange}
                    isLabel
                    type="number"
                  />
                  <Input
                    name="margenGanancia"
                    value={margenGanancia}
                    label="Margen de ganancia"
                    isLabel
                    type="number"
                    onChange={handleInputChange}
                  />{" "}
                  {/* un checkbox para habilitar o quitar */}{" "}
                  {/* Editar el IGV */}
                  <Input
                    name="precioVentaConInpuesto"
                    value={suma}
                    label="Precio de Venta"
                    isLabel
                    type="text"
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div>
                  <div className={styles.toggle}>
                    <Toggle
                      isOn={checkedPrecio}
                      handleToggle={() => setCheckedPrecio(!checkedPrecio)}
                      colorOne="#50cd89"
                      colorTwo="#c7ece8"
                      id="switchPrecio"
                    />
                    <span>Cambio de precio</span>
                  </div>
                  {/*   <div className={styles.toggle}>
                    <Toggle
                      isOn={checkedTest}
                      handleToggle={() => setCheckedTest(!checkedTest)}
                      colorOne="#50cd89"
                      colorTwo="#c7ece8"
                      id='switchActivo'
                    />
                    <span>Activo</span>
                  </div> */}
                </div>
              </div>
              <div className={styles["main-content-fourth"]}>
                {/* <Input name="" label="Comentarios" isLabel type="text" /> */}
                <label>Comentarios</label>
                <textarea
                  onChange={handleInputChange}
                  name="comentario"
                  value={comentario}
                ></textarea>
              </div>
              <div className={styles["main-content-buttons"]}>
                {activeProducto && (
                  <Button size="sm" onClick={eliminarProducto}>
                    Eliminar
                  </Button>
                )}
                <Button size="sm" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={createProduct}
                  disabled={
                    subiendoImagen ||
                    eliminandoImagen ||
                    nombre === "" ||
                    categoriaId === 0 ||
                    grupoId === 0 ||
                    precioVentaSinInpuesto === 0
                      ? true
                      : false
                  }
                >
                  {activeProducto ? "Editar" : "Agregar"}
                </Button>
              </div>
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
                    <select
                      value={tipoAjuste}
                      onChange={(e) => setTipoAjuste(Number(e.target.value))}
                    >
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
                      <Button
                        size="sm"
                        onClick={guardarAjusteStock}
                        disabled={guardandoAjuste}
                        type="button"
                      >
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
