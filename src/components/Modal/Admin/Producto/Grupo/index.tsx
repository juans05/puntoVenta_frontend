import Modal from "react-modal";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { RootState } from "../../../../../redux/rootState";
import styles from "./grupo.module.css";
import { Icons } from "../../../../Svg/iconsPack";
import Svg from "../../../../Svg";
import {
  clearActiveGrupo,
  closeModalGrupos,
  createGroups,
  deleteGrupo,
  updateGrupo,
} from "../../../../../redux/reducers/Admin/productos/producto.reducer";
import SelectPro from "../../../../SelectPro";
import Input from "../../../../Input";
import { Button } from "@tremor/react";
import { toast } from "sonner";
const customStyles = {};
Modal.setAppElement("#root");
export const GrupoModal = () => {
  const initalForm = {
    categoriaId: 0,
    nombre: "",
    category: "",
  };
  const [formValues, setFormValues] = useState(initalForm);

  const { nombre, categoriaId } = formValues;
  const handleInputChange = (e: any) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };
  const handleChangeSelect = (
    idValue: any,
    value: string,
    name: string,
    id: number
  ) => {
    setFormValues({
      ...formValues,
      [name]: value,
      [id]: idValue,
    });
  };
  const { modalGrupos, categorias, activeGrupo }: any = useAppSelector(
    (state: RootState) => state.adminProducts
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (activeGrupo) {
      setFormValues({
        ...initalForm,
        categoriaId: activeGrupo.categoriaId,
        nombre: activeGrupo.nombre,
        category: activeGrupo.categoriaNombre ?? "",
      });
    } else {
      setFormValues(initalForm);
    }
  }, [activeGrupo, modalGrupos]);

  const closeModal = () => {
    dispatch(closeModalGrupos());
    setTimeout(() => dispatch(clearActiveGrupo()), 200);
    setFormValues(initalForm);
  };
  const filterAvoidAllCategorias = categorias?.filter(
    (value: any) => value?.categoriaId !== 0
  );
  const newCategorias = filterAvoidAllCategorias?.map((value: any) => {
    return {
      id: value?.categoriaId,
      value: value?.nombre,
    };
  });

  const guardar = () => {
    if (activeGrupo) {
      dispatch(
        updateGrupo({
          grupoId: activeGrupo.grupoId,
          nombre: nombre.trim(),
          usuarioMofificacion: "admin",
        })
      );
      toast.success("Grupo actualizado exitosamente");
    } else {
      dispatch(
        createGroups({
          ...formValues,
          nombre: nombre.trim(),
          usuarioCreacion: "admin",
        })
      );
      toast.success("Grupo creado exitosamente");
    }
    closeModal();
  };

  const eliminar = () => {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar el grupo "${activeGrupo?.nombre}"?`
    );
    if (!confirmado) return;

    dispatch(deleteGrupo(activeGrupo.grupoId));
    closeModal();
    toast.success("Grupo eliminado correctamente");
  };

  return (
    <Modal
      isOpen={modalGrupos}
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
            <h2>{activeGrupo ? "Editar" : "Crear"} Grupo</h2>
          </div>
          <div className={styles["content"]}>
            <div className={styles["form-input"]}>
              <SelectPro
                isLabel
                label="Seleccione una categoría"
                isSearch
                id="categoriaId"
                name="category"
                defaultValue={formValues.category}
                options={newCategorias}
                onChange={handleChangeSelect}
                disabled={!!activeGrupo}
              />
              <Input
                isLabel
                label="Nombre del grupo"
                name="nombre"
                value={nombre}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles["main-content-buttons"]}>
              {activeGrupo && (
                <Button size="sm" onClick={eliminar}>
                  Eliminar
                </Button>
              )}
              <Button size="sm" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={guardar}
                disabled={categoriaId === 0 || nombre.trim() === ""}
              >
                {activeGrupo ? "Editar" : "Agregar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
