import { Image } from "../../../../../../components/Image";
import styles from "./mybusiness.module.css";
import { IEmpresa } from "./index";

interface IProps {
  formValues: IEmpresa;
  onGuardar: (cambios: Partial<IEmpresa>) => void;
}

export const Logotipos = ({ formValues, onGuardar }: IProps) => {
  return (
    <div>
      <h4 className={styles.contenidoTitulo}>Logotipos</h4>
      <p className={styles.contenidoDesc}>
        Estos dos logos son los que salen impresos en tus facturas, boletas y cotizaciones en PDF. Súbelos con buena
        resolución para que se vean nítidos al imprimir.
      </p>

      <div className={styles.avisoAutoGuardado}>Los logos se guardan apenas los subes: no hace falta que pulses «Guardar».</div>

      <div className={styles.seccionInterna}>
        <span className={styles.seccionEtiqueta}>LOGO CUADRADO</span>
        <p className={styles.contenidoDesc}>Se usa en el ticket del punto de venta y en la app. Tamaño recomendado: 300 × 300 píxeles.</p>
        <Image
          isLabel
          label=""
          accept=".png, .jpg, .jpeg, .svg"
          textAllowed="Formatos JPG o PNG, hasta 5 MB."
          name="logoCuadrado"
          value={formValues.logoCuadrado}
          onImageChange={(url: string) => onGuardar({ logoCuadrado: url })}
        />
      </div>

      <div className={styles.seccionInterna}>
        <span className={styles.seccionEtiqueta}>LOGO RECTANGULAR</span>
        <p className={styles.contenidoDesc}>Se usa en la cabecera de tus facturas y boletas en A4. Tamaño recomendado: 350 × 167 píxeles.</p>
        <Image
          isLabel
          label=""
          accept=".png, .jpg, .jpeg, .svg"
          textAllowed="Formatos JPG o PNG, hasta 5 MB."
          name="logoRectangular"
          value={formValues.logoRectangular}
          onImageChange={(url: string) => onGuardar({ logoRectangular: url })}
        />
      </div>
    </div>
  );
};
