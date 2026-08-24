import Modal from "react-modal";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "./gasto.module.css";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import { RootState } from "../../../../redux/rootState";
import { crearGasto } from "../../../../redux/reducers/Admin/gastos/gasto.reducer";
import { getPayMethods } from "../../../../redux/reducers/extensiones/extensiones..reducer";
import axiosInstance from "../../../../utils/axios";
import Input from "../../../Input";
import SelectPro from "../../../SelectPro";
import { toast } from "sonner";

Modal.setAppElement("#root");

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GastoModal = ({ isOpen, onClose }: IProps) => {
  const dispatch = useAppDispatch();
  const { payMethods }: any = useAppSelector((state: RootState) => state.extentions);

  const [categorias, setCategorias] = useState<{ id: number; value: string }[]>([]);
  const [categoria, setCategoria] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [metodoPagoId, setMetodoPagoId] = useState<number>(0);
  const [observacion, setObservacion] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(getPayMethods() as any);
      axiosInstance
        .get("/gastos/categorias/listar")
        .then(({ data }: any) => setCategorias((data?.data ?? []).filter((c: any) => c.estado)))
        .catch(() => setCategorias([]));
      setCategoria("");
      setDescripcion("");
      setMonto("");
      setMetodoPagoId(0);
      setObservacion("");
    }
  }, [isOpen, dispatch]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!categoria.trim()) return toast.error("La categoría es obligatoria");
    if (!(Number(monto) > 0)) return toast.error("El monto debe ser mayor a 0");

    setLoading(true);
    try {
      await dispatch(
        crearGasto(
          {
            categoria,
            descripcion,
            monto: Number(monto),
            metodoPagoId: metodoPagoId > 0 ? metodoPagoId : null,
            observacion,
          },
          onClose
        ) as any
      );
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
          Nuevo gasto
          <small>Registra un gasto del negocio</small>
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          <Icon icon="mdi:close" width={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h3>Datos del gasto</h3>
          <div className={styles.grid}>
            <div>
              <SelectPro
                isLabel
                isSearch
                label="Categoría"
                options={categorias}
                onChange={(_idValue: any, value: string) => setCategoria(value)}
                placeholder="Selecciona una categoría"
              />
            </div>
            <div>
              <Input
                isLabel
                label="Monto"
                type="number"
                name="monto"
                value={monto}
                onChange={(e: any) => setMonto(e.target.value)}
              />
            </div>
            <div className={styles.full}>
              <Input
                isLabel
                label="Descripción"
                name="descripcion"
                value={descripcion}
                onChange={(e: any) => setDescripcion(e.target.value)}
              />
            </div>
            <div>
              <SelectPro
                isLabel
                isSearch
                label="Método de pago (opcional)"
                options={payMethods}
                onChange={(idValue: any) => setMetodoPagoId(Number(idValue))}
                placeholder="Sin especificar"
              />
            </div>
            <div className={styles.full}>
              <Input
                isLabel
                label="Observación"
                name="observacion"
                value={observacion}
                onChange={(e: any) => setObservacion(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.buttons}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "Guardando..." : "Registrar gasto"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
