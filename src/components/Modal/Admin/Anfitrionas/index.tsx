import { useState, useEffect } from "react";
import Modal from "react-modal";
import styles from "./anfitriona.module.css";
import { RootState } from "../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import {
  clearActiveAnfitriona,
  closeModalAnfitriona,
  createAnfitrionaMain,
  updateAnfitriona,
} from "../../../../redux/reducers/Admin/clientes-proveedores/clientesProveedoresAnfitrionas.reducer";
import Svg from "../../../Svg";
import { Icons } from "../../../Svg/iconsPack";
import SelectPro from "../../../SelectPro";
import Input from "../../../Input";
import { Button } from "@tremor/react";
import { toast } from "sonner";
import { IExtensionesState } from "../../../../redux/reducers/extensiones/interfaces";

const customStyles = {};
Modal.setAppElement("#root");

const initialForm = {
  nombres: "",
  nacionalidadId: 0,
  nacionalidadDescripcion: "",
  direccion: "",
  celular: "",
};
export const AnfitrionaModal = () => {
  const dispatch = useAppDispatch();
  const { modalAnfitriona, activeAnfitrionas }: any = useAppSelector(
    (state: RootState) => state.clientes
  );
  const { nacionality }: IExtensionesState = useAppSelector((state: RootState) => state.extentions);
  console.log(nacionality);
  const [formValues, setFormValues] = useState(initialForm);
  const {
    nombres,
    nacionalidadDescripcion,
    direccion,
    /* nacionalidadId, */
    celular,
  } = formValues;
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

  useEffect(() => {
    if (activeAnfitrionas) {
      setFormValues({
        ...activeAnfitrionas,
        /*        comentarios: activeProducto?.comentarios[0]?.descripcion, */
      });
    } else {
      setFormValues(initialForm);
    }
  }, [activeAnfitrionas, setFormValues]);

  const closeModal = () => {
    dispatch(closeModalAnfitriona());
    setFormValues(initialForm);
    dispatch(clearActiveAnfitriona());
    /*  setTimeout(() => {
      dispatch(clearActiveProducto())
    }, 200); */
  };
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
     const setHeight = (windowHeight >= 953) ? "773px" : windowHeight >= 804 ? "600px" : (

        windowHeight <= 803 && windowHeight > 748
    
      )
        ? "773px" : (windowHeight <= 747 && windowHeight > 603 ? "557px" : windowHeight <= 603 && "410px");

/*   const nacionalidadOptions = [
    {
      id: 1,
      value: "PERUANA",
    },
    {
      id: 2,
      value: "COLOMBIANA",
    },
  ]; */

  const createAnfitriona = () => {
    if (activeAnfitrionas) {
      dispatch(
        updateAnfitriona({
          ...formValues,
          foto: "",
          usuarioModificacion: "admin",
          /* comentarios: [
          {
            item: 1,
            descripcion: comentarios
          }
        ], */
        })
      );
      closeModal();
      toast.success("Se modificó los datos de la anfitriona");
    } else {
      console.log(formValues);

      dispatch(
        createAnfitrionaMain({
          ...formValues,
          usuarioCreacion: "admin",
          foto: "",
        })
      );
      closeModal();
      toast.success("Se agregó un nueva anfitriona");
      setFormValues(initialForm);
    }
  };

  return (
    <Modal
      isOpen={modalAnfitriona}
      style={customStyles}
      closeTimeoutMS={200}
      className={styles.anfitriona}
      overlayClassName="modal-fondo"
    >
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.closeBtn} onClick={closeModal}>
            <Svg icon={Icons.close} />
          </div>
          <div className={styles["content-main-modal"]}>
            <div className={`${styles["encabezado"]}`}>
              <h3>
                Nueva anfitriona
                <small>Agrega los datos de una anfitriona</small>
              </h3>
            </div>

            <div className={styles.content}>
              <div style={{ height: `${setHeight}` }}>
                <div>
                  <Input
                    name="nombres"
                    isLabel
                    label="Nombre o Alias"
                    value={nombres}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <SelectPro
                    isLabel
                    label="Nacionalidad"
                    isSearch
                    id="nacionalidadId"
                    name="nacionalidadDescripcion"
                    defaultValue={nacionalidadDescripcion}
                    /*    defaultValue={nombreCategoria} */
                    options={nacionality}
                    onChange={handleChangeSelect}
                  />
                </div>
                <div>
                  <Input
                    name="direccion"
                    isLabel
                    label="Dirección"
                    value={direccion}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Input
                    name="celular"
                    isLabel
                    label="Celular"
                    value={celular}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className={styles["main-content-buttons"]}>
              <Button size="sm" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" onClick={createAnfitriona}>
                {activeAnfitrionas ? "Editar" : "Agregar"} anfitriona
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
