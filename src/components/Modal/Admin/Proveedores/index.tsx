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
import SelectPro from "../../../SelectPro";
import SelectUbigeo from "../../../SelectPro/SelectUbigeo";
import { Button } from "@tremor/react";
import { toast } from "sonner";
import { IExtensionesState } from "../../../../redux/reducers/extensiones/interfaces";
import axiosInstance from "../../../../utils/axios";

Modal.setAppElement("#root");

// R.U.C. es el id 5 del catalogo TipoDocumento (ver tipodocumento.json) -- un proveedor
// casi siempre se identifica por RUC, asi que arranca preseleccionado como en la referencia.
const TIPO_DOCUMENTO_RUC_ID = 5;
const TIPO_DOCUMENTO_RUC_LABEL = "RUC";

const CODIGO_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0, I/1/l ambiguos
const generarCodigo = (len = 6) =>
  Array.from({ length: len }, () => CODIGO_CHARS[Math.floor(Math.random() * CODIGO_CHARS.length)]).join("");

const initialForm = {
  codigo: generarCodigo(),
  tipoDocumentoId: TIPO_DOCUMENTO_RUC_ID,
  tipoDocumento: TIPO_DOCUMENTO_RUC_LABEL,
  ruc: "",
  nombre: "",
  email: "",
  celular: "",
  direccion: "",
  ubigeo: "",
  ubigeoId: "",
  detalleAdicional: "",
};

export const ProveedorModal = () => {
  const dispatch = useAppDispatch();
  const { modalProveedor, activeProviders }: any = useAppSelector(
    (state: RootState) => state.clientes
  );
  const { ubigeos, typeDocument }: IExtensionesState = useAppSelector(
    (state: RootState) => state.extentions
  );

  const [formValues, setFormValues] = useState(initialForm);
  const [buscandoRuc, setBuscandoRuc] = useState(false);
  const {
    codigo,
    tipoDocumentoId,
    tipoDocumento,
    ruc,
    nombre,
    direccion,
    email,
    celular,
    ubigeo,
    detalleAdicional,
  } = formValues;

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleChangeSelect = (
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
        tipoDocumento:
          (typeDocument as any[])?.find((t: any) => String(t.id) === String(activeProviders?.tipoDocumentoId))?.value ?? "",
        ubigeo: activeProviders?.ubigeo
          ? `${activeProviders.ubigeo?.departamento}/${activeProviders.ubigeo?.provincia}/${activeProviders.ubigeo?.distrito}`
          : "",
        ubigeoId: activeProviders?.ubigeoId ?? "",
        detalleAdicional: activeProviders?.detalleAdicional ?? "",
      });
    } else {
      setFormValues({ ...initialForm, codigo: generarCodigo() });
    }
  }, [activeProviders]);

  const closeModal = () => {
    dispatch(closeModalProveedor());
    setFormValues(initialForm);
    dispatch(clearActiveProveedor());
  };

  // Busca el RUC en SUNAT (proxeado por el backend) y autocompleta razon social, direccion y ubigeo
  // -- mismo endpoint que usa NuevaFactura para autocompletar clientes por RUC.
  const buscarRuc = async () => {
    const rucLimpio = ruc.trim();
    if (rucLimpio.length !== 11) {
      toast.error("El RUC debe tener 11 dígitos");
      return;
    }

    setBuscandoRuc(true);
    try {
      const { data }: any = await axiosInstance.get(`/extensiones/ruc/${rucLimpio}`);
      const info = data?.data;
      if (!info?.razonSocial) {
        toast.error("No se encontró el RUC, completa los datos manualmente");
        return;
      }

      let ubigeoLabel = "";
      let ubigeoId = "";
      if (info.ubigeoId) {
        const encontrado = (ubigeos as any[])?.find((u) => String(u.ubigeoId) === String(info.ubigeoId));
        if (encontrado) {
          ubigeoId = String(encontrado.ubigeoId);
          ubigeoLabel = `${encontrado.departamento}/${encontrado.provincia}/${encontrado.distrito}`;
        }
      }

      setFormValues({
        ...formValues,
        nombre: info.razonSocial,
        direccion: info.direccion || formValues.direccion,
        ubigeoId: ubigeoId || formValues.ubigeoId,
        ubigeo: ubigeoLabel || formValues.ubigeo,
      });
      toast.success("Datos obtenidos de RUC (SUNAT)");
    } catch {
      toast.error("No se encontró el RUC, completa los datos manualmente");
    } finally {
      setBuscandoRuc(false);
    }
  };

  const guardarProveedor = () => {
    if (nombre === "") {
      toast.error("La razón social/nombre es obligatorio");
      return;
    }

    // El backend nombra el campo "Dirección" (con tilde); se traduce acá al enviarlo.
    const payload = {
      codigo,
      tipoDocumentoId,
      ruc,
      nombre,
      dirección: direccion,
      celular,
      email,
      ubigeoId: formValues.ubigeoId || undefined,
      detalleAdicional,
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
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      name="codigo"
                      isLabel
                      label="Código"
                      value={codigo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button size="xs" onClick={() => setFormValues({ ...formValues, codigo: generarCodigo() })}>
                    Generar
                  </Button>
                </div>
                <div>
                  <SelectPro
                    isLabel
                    label="Tipo de Documento de Identidad"
                    isSearch
                    id="tipoDocumentoId"
                    name="tipoDocumento"
                    defaultValue={tipoDocumento}
                    options={typeDocument}
                    onChange={handleChangeSelect}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      name="ruc"
                      isLabel
                      label="R.U.C."
                      value={ruc}
                      onChange={handleInputChange}
                      max={11}
                    />
                  </div>
                  <Button size="xs" onClick={buscarRuc} disabled={buscandoRuc}>
                    <Svg icon={Icons.search} />
                  </Button>
                </div>
                <div>
                  <Input
                    name="nombre"
                    isLabel
                    label="Razón social/Nombre Completo"
                    placeholder="Nombre Comercial"
                    value={nombre}
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
                <div>
                  <Input
                    name="celular"
                    isLabel
                    label="Celular"
                    value={celular}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Input
                    name="direccion"
                    isLabel
                    label="Dirección fiscal"
                    value={direccion}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <SelectUbigeo
                    onChange={handleChangeSelect}
                    options={ubigeos}
                    defaultValue={ubigeo !== null ? ubigeo : "SIN ESPECIFICAR"}
                    isLabel
                    name="ubigeo"
                    id="ubigeoId"
                    label="Ubigeo"
                    isSearch
                  />
                </div>
                <div>
                  <Input
                    name="detalleAdicional"
                    isLabel
                    label="Detalle Adicional"
                    type="textarea"
                    defaultValue={detalleAdicional}
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
