import styles from "./mybusiness.module.css";

interface IProps {
  titulo: string;
}

export const Proximamente = ({ titulo }: IProps) => {
  return (
    <div className={styles.proximamente}>
      <div className={styles.proximamenteIcono}>🔒</div>
      <h4>{titulo}</h4>
      <p>Esta sección todavía no está disponible — requiere integración directa con SUNAT. La estamos preparando.</p>
    </div>
  );
};
