import { useEffect, useState } from "react";
import Modal from "react-modal";
import styles from "./nuevaEmpresa.module.css";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  createEmpresa,
  createSucursal,
  createTenants,
  getAllRubros,
} from "../../../../../../redux/reducers/Admin/my-business/myBusiness.reducer";
import { getAllUbigeos } from "../../../../../../redux/reducers/extensiones/extensiones..reducer";
import Input from "../../../../../../components/Input";
import SelectPro from "../../../../../../components/SelectPro";
import SelectUbigeo from "../../../../../../components/SelectPro/SelectUbigeo";
import { toast } from "sonner";

Modal.setAppElement("#root");

const initialForm = {
  nombre: "",
  rubro: "",
  rubroId: 0,
  ruc: "",
  razonSocial: "",
  nombreComercial: "",
  direccion: "",
  telefono: "",
  celular: "",
  email: "",
  ubigeo: "",
  ubigeoId: "",
  nombreSede: "",
};

interface INuevaEmpresaProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevaEmpresaModal = ({ isOpen, onClose }: INuevaEmpresaProps) => {
  const dispatch = useAppDispatch();
  const { rubros }: any = useAppSelector((state: RootState) => state.myBusiness);
  const { ubigeos }: any = useAppSelector(
    (state: RootState) => state.extentions
  );

  const [formValues, setFormValues] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormValues(initialForm);
      dispatch(getAllRubros());
      dispatch(getAllUbigeos());
    }
  }, [isOpen, dispatch]);

  const handleOnChange = (e: any) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelect = (
    idValue: any,
    value: string,
    name: string,
    id: string
  ) => {
    setFormValues({
      ...formValues,
      [name]: value,
      [id]: Number(idValue),
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formValues.nombre.trim() || !formValues.rubroId) {
      return toast.error("Nombre (tenant key) y Rubro son obligatorios");
    }

    setLoading(true);
    try {
      const identificador = await dispatch(
        createTenants({
          nombre: formValues.nombre,
          rubroId: Number(formValues.rubroId),
        }) as any
      );

      if (!identificador) return;

      await dispatch(
        createEmpresa({
          ruc: formValues.ruc,
          razonSocial: formValues.razonSocial,
          nombreComercial: formValues.nombreComercial,
          direccion: formValues.direccion,
          telefono: formValues.telefono,
          celular: formValues.celular,
          email: formValues.email,
          ubigeoId: formValues.ubigeoId,
          tenantId: identificador,
        }) as any
      );

      await dispatch(
        createSucursal({
          nombre: formValues.nombreSede || formValues.nombreComercial,
          direccion: formValues.direccion,
          ubigeoId: formValues.ubigeoId,
          tenantId: formValues.nombre,
          rubroId: Number(formValues.rubroId),
        }) as any
      );

      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      closeTimeoutMS={200}
      className={styles.panel}
      overlayClassName={styles.overlay}
    >
      <div className={styles.encabezado}>
        <h3>
          Nueva empresa
          <small>Crea un tenant, su empresa y su primera sede</small>
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          x
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h3>Tenant</h3>
          <div className={styles.grid}>
            <div>
              <Input
                isLabel
                label="Nombre (tenant key)"
                name="nombre"
                value={formValues.nombre}
                onChange={handleOnChange}
              />
            </div>
            <div className={styles.full}>
              <SelectPro
                isLabel
                isSearch
                label="Rubro"
                id="rubroId"
                name="rubro"
                defaultValue={formValues.rubro}
                options={rubros}
                onChange={handleSelect}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Empresa</h3>
          <div className={styles.grid}>
            <div>
              <Input
                isLabel
                label="RUC"
                name="ruc"
                value={formValues.ruc}
                onChange={handleOnChange}
              />
            </div>
            <div>
              <Input
                isLabel
                label="Razón Social"
                name="razonSocial"
                value={formValues.razonSocial}
                onChange={handleOnChange}
              />
            </div>
            <div>
              <Input
                isLabel
                label="Nombre Comercial"
                name="nombreComercial"
                value={formValues.nombreComercial}
                onChange={handleOnChange}
              />
            </div>
            <div className={styles.full}>
              <Input
                isLabel
                label="Dirección"
                name="direccion"
                value={formValues.direccion}
                onChange={handleOnChange}
              />
            </div>
            <div className={styles.full}>
              <SelectUbigeo
                isSearch
                isLabel
                label="Ubigeo"
                name="ubigeo"
                id="ubigeoId"
                defaultValue={formValues.ubigeo}
                options={ubigeos}
                onChange={handleSelect}
              />
            </div>
            <div>
              <Input
                isLabel
                label="Teléfono"
                name="telefono"
                value={formValues.telefono}
                onChange={handleOnChange}
              />
            </div>
            <div>
              <Input
                isLabel
                label="Celular"
                name="celular"
                value={formValues.celular}
                onChange={handleOnChange}
              />
            </div>
            <div className={styles.full}>
              <Input
                isLabel
                label="Email"
                name="email"
                value={formValues.email}
                onChange={handleOnChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Primera sede</h3>
          <div className={styles.grid}>
            <div className={styles.full}>
              <Input
                isLabel
                label="Nombre de la sede"
                name="nombreSede"
                value={formValues.nombreSede}
                onChange={handleOnChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.buttons}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "Creando..." : "Crear empresa"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
