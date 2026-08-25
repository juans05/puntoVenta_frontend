import Modal from "react-modal";
import styles from "./producto.module.css";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Icons } from "../../../Svg/iconsPack";
import Svg from "../../../Svg";
import { RootState } from "../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import {
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
import { UserTable } from "../../../../presentation/views/Modules/Admin/Views/Usuarios/UserTable";
import { IHeaderTable } from "../../../../application/models/Header/IHeaderTable";
import { ITableHeaderProps } from "../../../Datatable/table/TableHeader/TableHeader";
import { ITableButton } from "../../../Datatable/table/TableButton";
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
  const showStockForm = () => {
    setIsStock(!isStock);
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
  const header: IHeaderTable[] = [
   
    { type: "id", alias: "N°" },
    { type: "fechaRegistro", alias: "Fecha de Registro" },
    { type: "fechaVencimiento", alias: "Fecha de Vencimiento" },
    { type: "cantidad", alias: "Cantidad" },
    { type: "lote", alias: "Lote" },
    { type: "accion", alias: "Accion" },
  ];

  const [headerClients] = useState<IHeaderTable[] | ITableHeaderProps[] | any>(
    header
  );

  const newDataStock=[
    {
      "id": "1",
      "fechaRegistro": "2022-01-01",
      "fechaVencimiento": "2023-01-01",
      "cantidad": 10,
      "lote": "A123456789"
    },
    {
      "id": "2",
      "fechaRegistro": "2022-02-01",
      "fechaVencimiento": "2023-02-01",
      "cantidad": 10,
      "lote": "B987654321"
    },
    {
      "id": "3",
      "fechaRegistro": "2022-03-01",
      "fechaVencimiento": "2023-03-01",
      "cantidad": 10,
      "lote": "C246813579"
    },
    {
      "id": "4",
      "fechaRegistro": "2022-04-01",
      "fechaVencimiento": "2023-04-01",
      "cantidad": 10,
      "lote": "D975318642"
    },
    {
      "id": "5",
      "fechaRegistro": "2022-05-01",
      "fechaVencimiento": "2023-05-01",
      "cantidad": 10,
      "lote": "E654987321"
    },
    {
      "id": "6",
      "fechaRegistro": "2022-06-01",
      "fechaVencimiento": "2023-06-01",
      "cantidad": 10,
      "lote": "F321654987"
    },
    {
      "id": "7",
      "fechaRegistro": "2022-07-01",
      "fechaVencimiento": "2023-07-01",
      "cantidad": 10,
      "lote": "G258147369"
    },
    {
      "id": "8",
      "fechaRegistro": "2022-08-01",
      "fechaVencimiento": "2023-08-01",
      "cantidad": 10,
      "lote": "H753951468"
    },
    {
      "id": "9",
      "fechaRegistro": "2022-09-01",
      "fechaVencimiento": "2023-09-01",
      "cantidad": 10,
      "lote": "I123456789"
    },
    {
      "id": "10",
      "fechaRegistro": "2022-10-01",
      "fechaVencimiento": "2023-10-01",
      "cantidad": 10,
      "lote": "J987654321"
    }
  ]

  const buttonsStock: ITableButton[] = [
    {
      title: "Descargar Pdf",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      handleOnClick: ()=>undefined,
      iconify: "vaadin:pencil",

      /* ri:ball-pen-line */
    }
  ];

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
                    />
                    <Button onClick={showStockForm} type="button">
                      {isStock ? "Cancelar" : "Añadir"}
                    </Button>
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
                    <Input
                      name="cantidad"
                      // defaultValue={stock}
                      label="Cantidad"
                      isLabel
                      type="number"
                      onChange={handleInputChange}
                    />
                    <div className={styles["secondDiv-stock"]}>
                      <Input
                        name="fechaVencimiento"
                        // defaultValue={stock}
                        label="Fecha de Vencimiento"
                        isLabel
                        // type="number"
                        onChange={handleInputChange}
                      />
                      <Input
                        name="lote"
                        // defaultValue={stock}
                        label="Lote"
                        isLabel
                        type="number"
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles["main-content-buttons"]}>
                      <Button size="sm" onClick={() => undefined}>
                        Limpiar
                      </Button>
                      <Button size="sm" onClick={() => undefined}>
                        Agregar Stock
                      </Button>
                    </div>
                  </div>
                  <div className={styles['second-card-stock']}>
                  <UserTable
              header={headerClients}
              body={newDataStock}
              actions={buttonsStock}
              idTable={'stock'}
            />

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
