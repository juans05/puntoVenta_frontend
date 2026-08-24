import Modal from "react-modal";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { RootState } from "../../../../../redux/rootState";
import styles from "../Grupo/grupo.module.css";
import { Icons } from "../../../../Svg/iconsPack";
import Svg from "../../../../Svg";
import Input from "../../../../Input";
import { Button } from "@tremor/react";
import { toast } from "sonner";
import {
  clearActiveCategoria,
  closeModalCategorias,
  createCategory,
  updateCategory,
} from "../../../../../redux/reducers/Admin/productos/producto.reducer";

const customStyles = {};
Modal.setAppElement("#root");
export const CategoriaModal = () => {
  const { modalCategorias, activeCategoria }: any = useAppSelector(
    (state: RootState) => state.adminProducts
  );
  const dispatch = useAppDispatch();
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    setNombre(activeCategoria?.nombre ?? "");
  }, [activeCategoria, modalCategorias]);

  const closeModal = () => {
    dispatch(closeModalCategorias());
    setTimeout(() => dispatch(clearActiveCategoria()), 200);
    setNombre("");
  };

  const guardar = () => {
    if (nombre.trim() === "") return;

    if (activeCategoria) {
      dispatch(
        updateCategory({
          categoriaId: activeCategoria.categoriaId,
          nombre: nombre.trim(),
          usuarioMofificacion: "admin",
        })
      );
      toast.success("Categoría actualizada correctamente");
    } else {
      dispatch(createCategory({ nombre: nombre.trim(), usuarioCreacion: "admin" }));
      toast.success("Categoría creada correctamente");
    }

    closeModal();
  };

  return (
    <Modal
      isOpen={modalCategorias}
      style={customStyles}
      closeTimeoutMS={200}
      className={styles.grupo}
      overlayClassName="modal-fondo"
    >
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.closeBtn} onClick={closeModal}>
            <Svg icon={Icons.close} />
          </div>
          <div className={styles.encabezado}>
            <h2>{activeCategoria ? "Editar" : "Crear"} Categoría</h2>
          </div>
          <div className={styles["content"]}>
            <div className={styles["form-input"]}>
              <Input
                isLabel
                label="Nombre de la categoría"
                name="nombre"
                value={nombre}
                onChange={(e: any) => setNombre(e.target.value)}
              />
            </div>

            <div className={styles["main-content-buttons"]}>
              <Button size="sm" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={guardar}
                disabled={nombre.trim() === ""}
              >
                {activeCategoria ? "Editar" : "Agregar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
