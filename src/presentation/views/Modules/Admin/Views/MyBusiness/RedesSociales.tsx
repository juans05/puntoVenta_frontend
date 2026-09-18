import Input from "../../../../../../components/Input";
import { Button } from "@tremor/react";
import styles from "./mybusiness.module.css";
import { IEmpresa } from "./index";

interface IProps {
  formValues: IEmpresa;
  onChange: (e: any) => void;
  onGuardar: () => void;
}

const REDES: { name: keyof IEmpresa; label: string; placeholder: string }[] = [
  { name: "facebook", label: "Facebook", placeholder: "https://facebook.com/tu-negocio" },
  { name: "instagram", label: "Instagram", placeholder: "https://instagram.com/tu-negocio" },
  { name: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@tu-negocio" },
  { name: "youtube", label: "YouTube", placeholder: "https://youtube.com/@tu-negocio" },
  { name: "x", label: "X (antes Twitter)", placeholder: "https://x.com/tu-negocio" },
];

export const RedesSociales = ({ formValues, onChange, onGuardar }: IProps) => {
  const guardar = (e: any) => {
    e.preventDefault();
    onGuardar();
  };

  return (
    <form onSubmit={guardar}>
      <h4 className={styles.contenidoTitulo}>Redes sociales</h4>
      <p className={styles.contenidoDesc}>
        Si completas estos enlaces, aparecen al pie de los comprobantes que envías a tus clientes. Puedes dejar en blanco los
        que no uses.
      </p>

      <div className={styles.seccionInterna}>
        <div className={styles.grid}>
          {REDES.map((r) => (
            <div key={r.name} className={styles.full}>
              <Input isLabel label={r.label} name={r.name} value={formValues[r.name]} onChange={onChange} placeholder={r.placeholder} />
            </div>
          ))}
        </div>
        <div className={styles.avisoAutoGuardado}>
          Si borras un enlace y guardas, deja de aparecer en los comprobantes. Pega la dirección completa, empezando por
          https://.
        </div>
      </div>

      <div className={styles.botones}>
        <Button size="sm" type="submit">
          Guardar cambios
        </Button>
      </div>
    </form>
  );
};
