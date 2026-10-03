import { CatalogoCrudTable } from "../CatalogosDocumentos";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import Input from "../../../../../../components/Input";
import styles from "./mybusiness.module.css";
import { Button } from "@tremor/react";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import SelectUbigeo from "../../../../../../components/SelectPro/SelectUbigeo";
import { updateTenant } from "../../../../../../redux/reducers/Admin/my-business/myBusiness.reducer";
import { getAllUbigeos } from "../../../../../../redux/reducers/extensiones/extensiones..reducer";
import axiosInstance from "../../../../../../utils/axios";
import { useFormErrors, CampoError } from "../../../../../../components/FormError";
import { Toaster, toast } from "sonner";
import { Logotipos } from "./Logotipos";
import { RedesSociales } from "./RedesSociales";
import { Proximamente } from "./Proximamente";

export interface IEmpresa {
  tenantNombre: string;
  direccion: string;
  ubigeo: string;
  ubigeoId: string;
  ruc: string;
  razonSocial: string;
  telefono: string;
  celular: string;
  email: string;
  sitioWeb: string;
  imagenPortada: string;
  gifCarga: string;
  logoSidebar: string;
  logo: string;
  nombreComercial: string;
  regimenTributario: string;
  logoCuadrado: string;
  logoRectangular: string;
  urbanizacion: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  x: string;
}

const initialForm: IEmpresa = {
  tenantNombre: "",
  direccion: "",
  ubigeo: "",
  ubigeoId: "",
  ruc: "",
  razonSocial: "",
  telefono: "",
  celular: "",
  email: "",
  sitioWeb: "",
  imagenPortada: "",
  gifCarga: "",
  logoSidebar: "",
  logo: "",
  nombreComercial: "",
  regimenTributario: "",
  logoCuadrado: "",
  logoRectangular: "",
  urbanizacion: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  x: "",
};

const REGIMENES = ["Régimen General", "Régimen Especial (RER)", "Régimen MYPE Tributario (RMT)", "Nuevo RUS"];

type Seccion = "datos" | "logotipos" | "redes" | "impuestos" | "proximamente";

const SECCIONES_PROXIMAMENTE: Record<string, string> = {
  "emision-sunat": "Emisión a SUNAT",
  "certificado-sol": "Certificado y Clave SOL",
  "proveedor-ose": "Proveedor OSE",
  "servicios-sunat": "Servicios de SUNAT",
  "conectar-sistema": "Conectar otro sistema",
};

export const MyBusiness = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<IEmpresa>(initialForm);
  const { activeTenant }: any = useAppSelector((state: RootState) => state.myBusiness);
  const { ubigeos }: any = useAppSelector((state: RootState) => state.extentions);

  const [seccion, setSeccion] = useState<Seccion>("datos");
  const [itemProximamente, setItemProximamente] = useState("emision-sunat");
  const [buscandoRuc, setBuscandoRuc] = useState(false);

  const {
    direccion,
    ubigeo,
    ruc,
    razonSocial,
    celular,
    email,
    nombreComercial,
    regimenTributario,
    urbanizacion,
  } = formValues;

  useEffect(() => {
    if (activeTenant) {
      setFormValues({ ...initialForm, ...activeTenant });
    } else {
      setFormValues(initialForm);
    }
  }, [JSON.stringify(activeTenant)]);

  useEffect(() => {
    printTable(`${title.name}::MI EMPRESA`);
    dispatch(getAllUbigeos() as any);
  }, []);

  const { errors, setError, clearError, limpiarErrores } = useFormErrors();

  const handleOnChange = (e: any) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
    clearError(e.target.name);
  };

  const handleInputSelect = (idValue: string, value: string, name: string, id: any) => {
    setFormValues({ ...formValues, [name]: value, [id]: idValue });
    clearError(id);
  };

  // El backend reemplaza el registro completo de Empresa con lo que llegue en el payload
  // (no ignora nulls), asi que siempre se envia formValues completo -- nunca solo el campo
  // que cambio -- para no borrar sin querer los datos de las otras secciones.
  const guardar = (cambios?: Partial<IEmpresa>) => {
    const valores = { ...formValues, ...cambios };
    setFormValues(valores);
    dispatch(
      updateTenant({
        ...valores,
        tenant: activeTenant?.tenantNombre,
        id: activeTenant?.id,
      }) as any
    );
  };

  const guardarDatos = (e: any) => {
    e.preventDefault();
    limpiarErrores();
    if (!ruc.trim() || ruc.trim().length !== 11) setError("ruc", "El RUC debe tener 11 dígitos");
    if (!razonSocial.trim()) setError("razonSocial", "La razón social es obligatoria");
    if (!direccion.trim()) setError("direccion", "La dirección es obligatoria");
    if (!formValues.ubigeoId) setError("ubigeoId", "Elige el departamento, provincia y distrito");
    if (!ruc.trim() || ruc.trim().length !== 11 || !razonSocial.trim() || !direccion.trim() || !formValues.ubigeoId) {
      return toast.error("Completa los campos obligatorios");
    }
    guardar();
  };

  const buscarEnSunat = async () => {
    if (!ruc || ruc.trim().length !== 11) {
      return toast.error("Ingresa un RUC válido de 11 dígitos");
    }
    setBuscandoRuc(true);
    try {
      const { data }: any = await axiosInstance.get(`/extensiones/ruc/${ruc.trim()}`);
      const info = data?.data;
      if (!info?.razonSocial) {
        return toast.error("No se encontró el RUC en SUNAT");
      }
      let ubigeoEncontrado = { ubigeo: "", ubigeoId: "" };
      if (info.ubigeoId) {
        const u = (ubigeos as any[])?.find((x) => String(x.ubigeoId) === String(info.ubigeoId));
        if (u) ubigeoEncontrado = { ubigeo: `${u.departamento}/${u.provincia}/${u.distrito}`, ubigeoId: String(u.ubigeoId) };
      }
      setFormValues({
        ...formValues,
        razonSocial: info.razonSocial,
        direccion: info.direccion ?? formValues.direccion,
        ...ubigeoEncontrado,
      });
      toast.success("Datos obtenidos de SUNAT — revisa y guarda los cambios");
    } catch {
      toast.error("No se encontró el RUC en SUNAT");
    } finally {
      setBuscandoRuc(false);
    }
  };

  const seccionCompleta = {
    datos: !!(razonSocial && nombreComercial && ruc && direccion && formValues.ubigeoId),
    logotipos: !!(formValues.logoCuadrado || formValues.logoRectangular),
    redes: true,
  };
  const completadas = Object.values(seccionCompleta).filter(Boolean).length;
  const porcentaje = Math.round((completadas / 3) * 100);

  const irA = (s: Seccion, itemProx?: string) => {
    if (itemProx) setItemProximamente(itemProx);
    setSeccion(s);
  };

  return (
    <div className={styles.page}>
      <div className={styles.resumenCard}>
        <div>
          <h3>{razonSocial || "Tu empresa"}</h3>
          <p className={styles.resumenSub}>
            R.U.C. <strong>{ruc || "-"}</strong>
            {ubigeo && ` · ${ubigeo.split("/").reverse().join(", ")}`}
          </p>
        </div>
        <div className={styles.progresoWrap}>
          <div className={styles.progresoBadge}>{porcentaje}%</div>
          <div>
            <strong>{completadas} de 3 secciones listas</strong>
            <p>Completa tus datos para emitir comprobantes</p>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <div className={styles.grupo}>
            <span className={styles.grupoTitulo}>TU EMPRESA</span>
            <button className={seccion === "datos" ? styles.itemActivo : styles.item} onClick={() => irA("datos")}>
              <span className={`${styles.dot} ${seccionCompleta.datos ? styles.dotOk : ""}`} /> Datos de la empresa
            </button>
            <button className={seccion === "logotipos" ? styles.itemActivo : styles.item} onClick={() => irA("logotipos")}>
              <span className={`${styles.dot} ${seccionCompleta.logotipos ? styles.dotOk : ""}`} /> Logotipos
            </button>
            <button className={seccion === "redes" ? styles.itemActivo : styles.item} onClick={() => irA("redes")}>
              <span className={`${styles.dot} ${styles.dotOk}`} /> Redes sociales
            </button>
            <button className={seccion === "impuestos" ? styles.itemActivo : styles.item} onClick={() => irA("impuestos")}>
              <span className={`${styles.dot} ${styles.dotOk}`} /> Impuestos
            </button>
          </div>

          <div className={styles.grupo}>
            <span className={styles.grupoTitulo}>FACTURACIÓN ELECTRÓNICA</span>
            {Object.entries(SECCIONES_PROXIMAMENTE)
              .slice(0, 4)
              .map(([key, label]) => (
                <button
                  key={key}
                  className={seccion === "proximamente" && itemProximamente === key ? styles.itemActivo : styles.item}
                  onClick={() => irA("proximamente", key)}
                >
                  <span className={styles.dot} /> {label}
                </button>
              ))}
          </div>

          <div className={styles.grupo}>
            <span className={styles.grupoTitulo}>CÓMO TRABAJA TU NEGOCIO</span>
            <button className={styles.item} onClick={() => navigate("/dashboard/documentos-facturados")}>
              <span className={`${styles.dot} ${styles.dotOk}`} /> Ventas y comprobantes
            </button>
            <button className={styles.item} onClick={() => navigate("/dashboard/productos")}>
              <span className={`${styles.dot} ${styles.dotOk}`} /> Productos e inventario
            </button>
            <button
              className={seccion === "proximamente" && itemProximamente === "conectar-sistema" ? styles.itemActivo : styles.item}
              onClick={() => irA("proximamente", "conectar-sistema")}
            >
              <span className={styles.dot} /> Conectar otro sistema
            </button>
          </div>
        </div>

        <div className={styles.contenido}>
          {seccion === "datos" && (
            <form onSubmit={guardarDatos}>
              <h4 className={styles.contenidoTitulo}>Datos de la empresa</h4>
              <p className={styles.contenidoDesc}>
                Son los datos que salen impresos en cada factura y boleta que emites. Deben coincidir exactamente con los que
                tienes registrados en SUNAT.
              </p>

              <div className={styles.seccionInterna}>
                <span className={styles.seccionEtiqueta}>IDENTIFICACIÓN</span>
                <div className={styles.grid}>
                  <div className={styles.buscarRucRow}>
                    <Input isLabel label="R.U.C. de tu empresa" name="ruc" value={ruc} error={errors.ruc} onChange={handleOnChange} />
                    <button type="button" className={styles.buscarBtn} onClick={buscarEnSunat} disabled={buscandoRuc}>
                      {buscandoRuc ? "Buscando..." : "Traer datos de SUNAT"}
                    </button>
                  </div>
                  <div className={styles.full}>
                    <Input isLabel label="Razón social" name="razonSocial" value={razonSocial} error={errors.razonSocial} onChange={handleOnChange} />
                  </div>
                  <div className={styles.full}>
                    <Input
                      isLabel
                      label="Nombre comercial"
                      name="nombreComercial"
                      value={nombreComercial}
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className={styles.full}>
                    <label>Régimen tributario</label>
                    <select className={styles.select} name="regimenTributario" value={regimenTributario} onChange={handleOnChange}>
                      <option value="">Selecciona un régimen</option>
                      {REGIMENES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.seccionInterna}>
                <span className={styles.seccionEtiqueta}>CONTACTO</span>
                <div className={styles.grid}>
                  <div>
                    <Input isLabel label="Teléfono" name="celular" value={celular} onChange={handleOnChange} />
                  </div>
                  <div>
                    <Input isLabel label="Correo de la empresa" name="email" value={email} onChange={handleOnChange} />
                  </div>
                </div>
              </div>

              <div className={styles.seccionInterna}>
                <span className={styles.seccionEtiqueta}>DIRECCIÓN FISCAL</span>
                <div className={styles.grid}>
                  <div className={styles.full}>
                    <SelectUbigeo
                      isSearch
                      isLabel
                      label="Departamento, provincia y distrito"
                      defaultValue={ubigeo}
                      name="ubigeo"
                      id="ubigeoId"
                      options={ubigeos}
                      onChange={handleInputSelect}
                      placeholder="Escribe tu distrito para encontrarlo más rápido"
                    />
                    <CampoError mensaje={errors.ubigeoId} />
                  </div>
                  <div>
                    <Input isLabel label="Urbanización o sector" name="urbanizacion" value={urbanizacion} onChange={handleOnChange} />
                  </div>
                  <div>
                    <Input isLabel label="Dirección" name="direccion" value={direccion} error={errors.direccion} onChange={handleOnChange} />
                  </div>
                </div>
              </div>

              <div className={styles.botones}>
                <Button size="sm" type="submit" disabled={Object.keys(errors).length > 0}>
                  Guardar cambios
                </Button>
              </div>
            </form>
          )}

          {seccion === "logotipos" && <Logotipos formValues={formValues} onGuardar={guardar} />}
          {seccion === "redes" && <RedesSociales formValues={formValues} onChange={handleOnChange} onGuardar={guardar} />}
          {seccion === "impuestos" && (
            <CatalogoCrudTable
              titulo="Impuestos"
              descripcion="Tipos de afectación del IGV (gravado, exonerado, inafecto, etc.) que se aplican a los productos y comprobantes. Los de SUNAT vienen de base; aquí puedes agregar los propios."
              listUrl="/extensiones/tipos-igv/listar"
              createUrl="/extensiones/tipos-igv/crear"
              updateUrl={(id) => `/extensiones/tipos-igv/${id}`}
              estadoUrl={(id) => `/extensiones/tipos-igv/${id}/estado`}
              fields={[
                { key: "codigo", label: "Código", type: "text" },
                { key: "descripcion", label: "Descripción", type: "text" },
                { key: "aplicaPorcentajeImpuesto", label: "Aplica IGV (18%)", type: "checkbox" },
              ]}
            />
          )}
          {seccion === "proximamente" && <Proximamente titulo={SECCIONES_PROXIMAMENTE[itemProximamente] ?? "Próximamente"} />}
        </div>
      </div>

      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
