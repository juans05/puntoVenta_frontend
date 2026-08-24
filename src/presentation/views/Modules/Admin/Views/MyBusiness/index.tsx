import { useEffect, useState } from "react";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import Input from "../../../../../../components/Input";
import styles from "./mybusiness.module.css";
import { Button } from "@tremor/react";
import { Image } from "../../../../../../components/Image";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import SelectUbigeo from "../../../../../../components/SelectPro/SelectUbigeo";
/* import SelectPro from "../../../../../../components/SelectPro"; */
import {/*  getAllRubros, getAllUbigeos, getTenantEmpresa, */ updateTenant } from "../../../../../../redux/reducers/Admin/my-business/myBusiness.reducer";
import { Toaster } from "sonner";
/* import { useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState"; */

interface IEmpresa{
  tenantNombre:string,
  direccion:string,
  ubigeo:string,
  ruc:string,
  razonSocial:string,
  telefono:string,
  celular:string,
  email:string,
  sitioWeb:string,
  imagenPortada:string,
  gifCarga:string,
  logoSidebar:string,
  logo:string,
  ubigeoId:string,
  rubro: string;
  rubroId: number;
  nombreComercial: string;
}

const initialForm:IEmpresa={
  tenantNombre:'',
  direccion:'',
  ubigeo:'',
  ruc:'',
  razonSocial:'',
  telefono:'',
  celular:'',
  email:'',
  sitioWeb:'',
  imagenPortada:'',
  gifCarga:'',
  logoSidebar:'',
  logo:'',
  ubigeoId:'',
  rubro: "",
  rubroId: 0,
  nombreComercial: "",
}

export const MyBusiness = () => {
  const dispatch = useAppDispatch();
/*   const { myBusinessMain }: any = useAppSelector((state: RootState) => state.myBusiness); */
  const [formValues, setFormValues]=useState<IEmpresa>(initialForm)
  const {
    tenantNombre,
direccion,
ubigeo,
ruc,
razonSocial,
/* telefono, */
celular,
email,
sitioWeb,
imagenPortada,
gifCarga,
logoSidebar,
logo,
nombreComercial,
/* rubro */
/* ubigeoId, */
  }=formValues;

  const { activeTenant, ubigeos/* , rubros  */}: any = useAppSelector(
    (state: RootState) => state.myBusiness
  );
  const handleOnChange=(e:any)=>{
    setFormValues({
      ...formValues,
      [e.target.name]:e.target.value
    })
  }
  const handleImageChange = (newImageUrl: string) => {
    setFormValues({
      ...formValues,
      imagenPortada: newImageUrl, // Actualiza el enlace generado en el estado
    });
  };
  const handleImageChange1 = (newImageUrl: string) => {
    setFormValues({
      ...formValues,
      gifCarga: newImageUrl, // Actualiza el enlace generado en el estado
    });
  };
  const handleImageChange2 = (newImageUrl: string) => {
    setFormValues({
      ...formValues,
      logoSidebar: newImageUrl, // Actualiza el enlace generado en el estado
    });
  };
  const handleImageChange3 = (newImageUrl: string) => {
    setFormValues({
      ...formValues,
      logo: newImageUrl, // Actualiza el enlace generado en el estado
    });
  };
  const saveChanges=(e:any)=>{
    e.preventDefault();


    dispatch(
      updateTenant({
        ...formValues,
        tenant:activeTenant?.tenantNombre,
        id: activeTenant?.id,
      })
    );
 
  }
  const handleInputSelect = (
    idValue: string,
    value: string,
    name: string,
    id: any
  ) => {
    setFormValues({
      ...formValues,
      [name]: value,
      [id]: Number(idValue),
    });
  };
  useEffect(() => {
    if (activeTenant) {
      setFormValues(activeTenant);
    } else {
      setFormValues(initialForm);
    }
  }, [JSON.stringify(activeTenant), setFormValues]);


  /* useEffect(() => {
    dispatch(getTenantEmpresa('cucas'));
  }, [dispatch]) */
  


  useEffect(() => {
    printTable(`${title.name}::MI EMPRESA`);
  }, []);
  return (
    <div>
      <div className={styles["card-header"]}>
        <div>
          <h3>Mi empresa</h3>
        </div>
      </div>

      <div>
        <form onSubmit={saveChanges}>
        <div className={`${styles["section"]} ${styles["section1"]}`}>
          <h3>General</h3>
          <div>
            <div>
              <Input
                isLabel
                label="Tenant"
                name="tenantNombre"
                value={tenantNombre}
                onChange={handleOnChange}
                disabled={activeTenant ? true : false}
              />
            </div>

            <div>
              <Input
                isLabel
                label="Dirección"
                name="direccion"
                value={direccion}
                onChange={handleOnChange}
              />
            </div>
            <div>
              <SelectUbigeo
                isSearch
                isLabel
                label="Ubigeo Direccion"
                defaultValue={ubigeo}
                name="ubigeo"
                id="ubigeoId"
                options={ubigeos}
                onChange={handleInputSelect}
                placeholder=""
              />
            </div>
          </div>
          <div>
            <div>
              <Input
                isLabel
                label="RUC"
                name="ruc"
                value={ruc}
                onChange={handleOnChange}
              />
            </div>
            <div>
              <Input
                isLabel
                label="Nombre Comercial"
                name="nombreComercial"
                value={nombreComercial}
                onChange={handleOnChange}
              />
            </div>
          {/*   <div>
              <SelectPro
                isLabel
                isSearch
                label="Rubro"
                id="rubroId"
                name="rubro"
                defaultValue={rubro}
                options={rubros}
                onChange={handleInputSelect}
              />
            </div> */}
            <div>
              <Input
                isLabel
                label="Razón Social"
                name="razonSocial"
                value={razonSocial}
                onChange={handleOnChange}
              />
            </div>
          </div>
        </div>

        <div className={`${styles["section"]} ${styles["section2"]}`}>
          <h3>Contacto</h3>
          <div>
            <div>
              <Input
                isLabel
                label="Celular"
                name="celular"
                value={celular}
                onChange={handleOnChange}
              />
            </div>

            <div>
              <Input
                isLabel
                label="Email"
                name="email"
                value={email}
                onChange={handleOnChange}
              />
            </div>
            <div>
              <Input
                isLabel
                label="Sitio Web"
                name="sitioWeb"
                value={sitioWeb}
                onChange={handleOnChange}
              />
            </div>
          </div>
        </div>
        <div className={styles["section-images"]}>
          <div className={`${styles["section"]} ${styles["section3"]}`}>
            <h3>Login</h3>
            <div>
              <Image
                isLabel
                label={"Imagen de Portada"}
                accept=".png, .jpg, .jpeg, .svg"
                textAllowed={"Archivos permitidos: png, jpg, jpeg, svg."}
                name={"imagenPortada"}
                value={imagenPortada}
                onImageChange={handleImageChange}
              />

              <Image
                isLabel
                label={"Logo"}
                accept=".png, .jpg, .jpeg, .svg"
                textAllowed={"Archivos permitidos: png, jpg, jpeg, svg."}
                name={"logo"}
                value={logo}
                onImageChange={handleImageChange3}
              />

              <Image
                isLabel
                label={"Gif de Carga"}
                accept=".gif"
                textAllowed={"Archivos permitidos: gif"}
                name={"gifCarga"}
                value={gifCarga}
                onImageChange={handleImageChange1}
              />
            </div>
          </div>

          <div className={`${styles["section"]} ${styles["section4"]}`}>
            <h3>Principal</h3>
            <div>
              <div>
                <Image
                  isLabel
                  label={"Logo Sidebar"}
                  accept=".png, .jpg, .jpeg, .svg"
                  textAllowed={"Archivos permitidos: png, jpg, jpeg, svg."}
                  name={"logoSidebar"}
                  value={logoSidebar}
                  onImageChange={handleImageChange2}
                />
              </div>
            </div>
          </div>
        </div>

          <div className={styles["main-content-buttons"]}>
            <Button size="sm" onClick={() => undefined}>
              Cancelar
            </Button>
            <Button size="sm" type="submit">
              Guardar cambios
            </Button>
          </div>

          <input type="hidden" />
        </form>
      </div>
      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
