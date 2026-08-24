import styles from './indicadores.module.css'
import { Icon } from '@iconify/react';

interface IElement {
    id: number;
    icon: string;
    description: string;
    value: string;
    index: number;
    background?: string;
    data?:any;
}
export const Indicador = ({  icon, description, value, background }: IElement) => {
  return (
<div className={`${styles[`${background}`]} ${styles.element}`} >
            <div className={styles.iconMain}>
                <div className={styles.icon}>
                    <Icon icon={icon} />
                </div>
            </div>

            <div className={styles.text}>
                <p>{description}</p>
                <h3>{value}</h3>
            </div>

        </div>
  )
}
