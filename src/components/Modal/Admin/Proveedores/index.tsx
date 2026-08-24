import { useState, useEffect } from "react";
import Modal from "react-modal";
import styles from "../Clientes/clientes.module.css";
import { RootState } from "../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import {
  clearActiveProveedor,
  closeModalProveedor,
  createProveedorMain,
  updateProveedorMain,
} from "../../../../redux/reducers/Admin/clientes-proveedores/clientesProveedoresAnfitrionas.reducer";
import Svg from "../../../Svg";
import { Icons } from "../../../Svg/iconsPack";
import Input from "../../../Input";
import { Button } from "@tremor/react";
import { toast } from "sonner";
import { IExtensionesState } from "../../../../redux/reducers/extensiones/interfaces";
import SelectUbigeo from "../../../SelectPro/SelectUbigeo";

Modal.setAppElement("#root");

const initialForm = {
  nombre: "",
  direccion: "",
  telefono: "",
  email: "",
  ubigeo: "",
  ubigeoId: "",
};

export const ProveedorModal = () => {
  const dispatch = useAppDispatch();
  const { modalProveedor, activeProviders }: any = useAppSelector(
    (state: RootState) => state.clientes
  );
  const { ubigeos }: IExtensionesState = useAppSelector(
    (state: RootState) => state.extentions
  );

  const [formValues, setFormValues] = useState(initialForm);
  const { nombre, direccion, telefono, email, ubigeo } = formValues;

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleChangeUbigeo = (
    idValue: any,
    value: string,
    name: string,
    id: string
  ) => {
    setFormValues({ ...formValues, [name]: value, [id]: idValue });
  };

  useEffect(() => {
    if (activeProviders) {
      setFormValues({
        ...initialForm,
        ...activeProviders,
        direccion: activeProviders?.dirección ?? "",
        ubigeo: activeProviders?.ubigeo
          ? `${activeProviders.ubigeo?.departamento}/${activeProviders.ubigeo?.provincia}/${activeProviders.ubigeo?.distrito}`
          : "",
        ubigeoId: activeProviders?.ubigeoId ?? "",
      });
    } else {
      setFormValues(initialForm);
    }
  }, [activeProviders]);

  const closeModal = () => {
    dispatch(closeModalProveedor());
    setFormValues(initialForm);
    dispatch(clearActiveProveedor());
  };

  const guardarProveedor = () => {
    if (nombre === "") {
      toast.error("El nombre del proveedor es obligatorio");
      return;
    }

    // El backend nombra el campo "Dirección" (con tilde); se traduce acá al enviarlo.
    const payload = {
      nombre,
      dirección: direccion,
      telefono,
      email,
      ubigeoId: formValues.ubigeoId,
    };

    if (activeProviders) {
      dispatch(
        updateProveedorMain({
          ...payload,
          proveedorId: activeProviders?.proveedorId,
        }) as any
      );
      closeModal();
      toast.success("Se modificó el proveedor");
    } else {
      dispatch(createProveedorMain(payload) as any);
      closeModal();
      toast.success("Se agregó un nuevo proveedor");
    }
  };

  return (
    <Modal
      isOpen={modalProveedor}
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
                {activeProviders ? "Editar proveedor" : "Nuevo proveedor"}
                <small>Agrega los datos del proveedor</small>
              </h3>
            </div>

            <div className={styles.content}>
              <div>
                <div>
                  <Input
                    name="nombre"
                    isLabel
                    label="Nombre del proveedor"
                    value={nombre}
                    onChange={handleInputChange}
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
                  <SelectUbigeo
                    onChange={handleChangeUbigeo}
                    options={ubigeos}
                    defaultValue={ubigeo !== null ? ubigeo : "SIN ESPECIFICAR"}
                    isLabel
                    name="ubigeo"
                    id="ubigeoId"
                    label="Departamento / Provincia / Distrito"
                    isSearch
                  />
                </div>
                <div>
                  <Input
                    name="telefono"
                    isLabel
                    label="Teléfono"
                    value={telefono}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Input
                    name="email"
                    isLabel
                    label="Email"
                    value={email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className={styles["main-content-buttons"]}>
              <Button size="sm" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" onClick={guardarProveedor}>
                {activeProviders ? "Editar" : "Agregar"} proveedor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
