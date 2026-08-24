import { Icon } from "@iconify/react";
import styles from "./indicador.module.css";

interface IIndicador {
  icon: string;
  value: string;
  amount: any;
  colorBg?:string;
  color?:string;
}
export const Indicador = ({ icon, value, amount,color,colorBg }: IIndicador) => {
  return (
    <div className={styles["indicador"]}>
      <div className={styles["icon"]} >
        <div className={styles["icon-main"]} style={{backgroundColor:`${colorBg}`/* , border:`1px solid ${color}` */}}>
          <Icon icon={icon} style={{color:`${color}`}}/>
        </div>
      </div>

      <div className={styles["text"]}>
        <p>{value}</p>
        <h3>{amount}</h3>
      </div>
    </div>
  );
};
