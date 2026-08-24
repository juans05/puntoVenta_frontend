import { useState, useEffect } from "react";
import Modal from "react-modal";
import styles from "./clientes.module.css";
import { RootState } from "../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import {
/*   clearActiveAnfitriona, */
  clearActiveClientes,
  closeModalAnfitriona,
  createClienteMain,

/*   updateAnfitriona, */
  updateCliente,
} from "../../../../redux/reducers/Admin/clientes-proveedores/clientesProveedoresAnfitrionas.reducer";
import Svg from "../../../Svg";
import { Icons } from "../../../Svg/iconsPack";
import SelectPro from "../../../SelectPro";
import Input from "../../../Input";
import { Button } from "@tremor/react";
import { toast } from "sonner";
import { IExtensionesState } from "../../../../redux/reducers/extensiones/interfaces";
import SelectUbigeo from "../../../SelectPro/SelectUbigeo";
import { TIPO_DOCUMENTO_RULES, getNumeroDocumentoError } from "../../../../utils/validations";

const customStyles = {};
Modal.setAppElement("#root");

const initialForm = {
  nombre: "",
  numeroDocumento: "",
  fechaNacimiento: "",
  direccion: "",
  telefono: "",
  email: "",
  tipoDocumentoId: 0,
  tipoDocumento: "",
  sexo: "",
  idSexo: 0,
  ubigeo: "",
  ubigeoId: '1000001',
};
export const ClientesModal = () => {
  const dispatch = useAppDispatch();
  const { modalAnfitriona, activeClients }: any = useAppSelector(
    (state: RootState) => state.clientes
  );

  const { nacionality, ubigeos,typeDocument }: IExtensionesState = useAppSelector(
    (state: RootState) => state.extentions
  );
  console.log(nacionality);
  const [formValues, setFormValues] = useState(initialForm);
  const {
    nombre,
    numeroDocumento,
    fechaNacimiento,
    direccion,
    telefono,
    email,
    tipoDocumentoId,
    tipoDocumento,
    sexo,
    idSexo,
    ubigeo,
/*     ubigeoId, */
  } = formValues;
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === "numeroDocumento" && formValues.tipoDocumentoId === 1) {
      nextValue = value.replace(/\D/g, "");
    }
    setFormValues({
      ...formValues,
      [name]: nextValue,
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
    if (activeClients) {
      setFormValues({
        ...activeClients,
       
      });
    } else {
      setFormValues(initialForm);
    }
  }, [activeClients, setFormValues]);

  const closeModal = () => {
    dispatch(closeModalAnfitriona());
    setFormValues(initialForm);
    dispatch(clearActiveClientes());
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
  const setHeight =
    windowHeight >= 953
      ? "773px"
      : windowHeight >= 804
      ? "600px"
      : windowHeight <= 803 && windowHeight > 748
      ? "773px"
      : windowHeight <= 747 && windowHeight > 603
      ? "557px"
      : windowHeight <= 603 && "410px";

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

  const createCliente = () => {
    const numeroDocumentoError = getNumeroDocumentoError(tipoDocumentoId, numeroDocumento);
    if (numeroDocumentoError) {
      toast.error(numeroDocumentoError);
      return;
    }
    if (fechaNacimiento && /^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fecha = new Date(`${fechaNacimiento}T00:00:00`);
      if (isNaN(fecha.getTime())) {
        toast.error("La fecha de nacimiento no es válida");
        return;
      }
      if (fecha > hoy) {
        toast.error("La fecha de nacimiento no puede ser una fecha futura");
        return;
      }
    }
    if (activeClients) {
      dispatch(
        updateCliente({
          ...formValues,
          clienteId:activeClients?.id,
          sexo:idSexo===1?'M':(idSexo===2?'F':'')
       
          /* comentarios: [
          {
            item: 1,
            descripcion: comentarios
          }
        ], */
        })
      );
      closeModal();
      toast.success("Se modificó los datos del cliente");
    } else {
      console.log(formValues);

      dispatch(
        createClienteMain({
          ...formValues,
          sexo:idSexo===1?'M':(idSexo===2?'F':'')
        })
        
      );
      closeModal();
      toast.success("Se agregó un nuevo cliente");
      setFormValues(initialForm);
    }
  };
  const sex = [
    { id: 1, value: "MASCULINO" },
    { id: 2, value: "FEMENINO" },
]

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
                Nuevo Cliente
                <small>Agrega los datos de una cliente</small>
              </h3>
            </div>

            <div className={styles.content}>
              <div style={{ height: `${setHeight}` }}>
                <div>
                  <Input
                    name="nombre"
                    isLabel
                    label="Nombres y apellidos"
                    value={nombre}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <SelectPro
                    isLabel
                    label="Tipo de Documento"
                    isSearch
                    id="tipoDocumentoId"
                    name="tipoDocumento"
                    defaultValue={tipoDocumento}
                    options={typeDocument}
                    onChange={handleChangeSelect}
                  />
                </div>
                <div>
                  <Input
                    name="numeroDocumento"
                    isLabel
                    label="Número de documento"
                    value={numeroDocumento}
                    onChange={handleInputChange}
                    max={TIPO_DOCUMENTO_RULES[tipoDocumentoId || 1]?.maxLength}
                  />
                </div>
                <div>
                  <SelectPro
                    isLabel
                    label="Sexo"
                    isSearch
                    id="idSexo"
                    name="sexo"
                    defaultValue={sexo}
                    options={sex}
                    onChange={handleChangeSelect}
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    withDate
                    name="fechaNacimiento"
                    isLabel
                    label="Fecha de Nacimiento"
                    value={fechaNacimiento}
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
                    onChange={handleChangeSelect}
                    options={ubigeos}
                    defaultValue={
                     ubigeo !== null
                        ? ubigeo
                        : "SIN ESPECIFICAR"
                    }
                    isLabel
                    name="ubigeo"
                    id="ubigeoId"
                    label="Ubigeo"
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
              <Button size="sm" onClick={createCliente}>
                {activeClients ? "Editar" : "Agregar"} cliente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
