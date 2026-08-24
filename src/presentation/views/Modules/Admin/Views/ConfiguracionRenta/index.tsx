import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@tremor/react";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import { getAllRubros } from "../../../../../../redux/reducers/Admin/my-business/myBusiness.reducer";
import {
  getConfiguracionRubro,
  saveConfiguracionRubro,
} from "../../../../../../redux/reducers/Admin/configuracion-renta/configuracionRenta.reducer";
import SelectPro from "../../../../../../components/SelectPro";
import { Toaster } from "sonner";
import styles from "./configuracionRenta.module.css";
import { Skeleton } from "../../../../../../components/Skeleton";

export const ConfiguracionRenta = () => {
  const dispatch = useAppDispatch();
  const { configuracion, loading }: any = useAppSelector(
    (state: RootState) => state.configuracionRenta
  );
  const { rubros }: any = useAppSelector((state: RootState) => state.myBusiness);

  const [rubroId, setRubroId] = useState<number>(0);
  const [tipo, setTipo] = useState("");
  const [turnos, setTurnos] = useState<any[]>([]);
  const [tarifas, setTarifas] = useState<any[]>([]);
  const [recursos, setRecursos] = useState<any[]>([]);

  useEffect(() => {
    dispatch(getAllRubros());
  }, [dispatch]);

  useEffect(() => {
    if (rubroId) {
      dispatch(getConfiguracionRubro(rubroId));
    }
  }, [dispatch, rubroId]);

  useEffect(() => {
    if (configuracion) {
      setTipo(configuracion.tipo ?? "");
      setTurnos(configuracion.turnos ? [...configuracion.turnos] : []);
      setTarifas(configuracion.tarifas ? [...configuracion.tarifas] : []);
      setRecursos(configuracion.recursos ? [...configuracion.recursos] : []);
    }
  }, [configuracion, rubroId]);

  const handleSelectRubro = (idValue: any) => {
    setRubroId(parseInt(idValue) || 0);
  };

  const updateRow = (
    setState: any,
    index: number,
    key: string,
    value: any
  ) => {
    setState((prev: any[]) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const removeRow = (setState: any, index: number) => {
    setState((prev: any[]) => prev.filter((_, i) => i !== index));
  };

  const guardar = () => {
    if (!rubroId) return;
    const payload = {
      tipo,
      turnos,
      tarifas: tarifas.map((t) => ({ ...t, monto: Number(t.monto) })),
      recursos: recursos.map((r) => ({ ...r, zona: Number(r.zona) })),
    };
    dispatch(saveConfiguracionRubro(rubroId, payload));
  };

  const newRubros = rubros?.map((r: any) => ({ id: r.id, value: r.value }));
  const selectedRubro = rubros?.find((r: any) => r.id === rubroId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Configuración de Renta</h2>
          <p className={styles.subtitle}>
            Administra turnos, tarifas y recursos por rubro. Esta plantilla se
            aplica a los nuevos negocios del rubro.
          </p>
        </div>
        <div className={styles.rubroSelector}>
          <SelectPro
            isLabel
            label="Rubro"
            isSearch
            id="rubroId"
            name="rubro"
            defaultValue={selectedRubro?.value ?? ""}
            options={newRubros}
            onChange={handleSelectRubro}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Skeleton height={20} className="w-1/3 mb-4" />
          <Skeleton height={44} className="w-full mb-6" />
          <Skeleton height={20} className="w-1/4 mb-4" />
          <Skeleton height={44} className="w-full mb-2" />
          <Skeleton height={44} className="w-full" />
        </div>
      ) : (
        <>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>General</h3>
            </div>
            <div className={styles.row}>
              <div className={styles.rowInput}>
                <input
                  className={styles.input}
                  name="tipo"
                  value={tipo}
                  placeholder="Tipo (ej. generico)"
                  onChange={(e) => setTipo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Turnos</h3>
              <Button size="sm" onClick={() =>
                setTurnos([
                  ...turnos,
                  { codigo: "", nombre: "", horaInicio: "10:00", horaFin: "17:00" },
                ])
              }>
                Agregar Turno
              </Button>
            </div>
            {turnos.map((turno, index) => (
              <div className={styles.row} key={`turno-${index}`}>
                <div className={styles.rowInputSmall}>
                  <input
                    className={styles.input}
                    value={turno.codigo}
                    placeholder="Código"
                    onChange={(e) =>
                      updateRow(setTurnos, index, "codigo", e.target.value)
                    }
                  />
                </div>
                <div className={styles.rowInput}>
                  <input
                    className={styles.input}
                    value={turno.nombre}
                    placeholder="Nombre del turno"
                    onChange={(e) =>
                      updateRow(setTurnos, index, "nombre", e.target.value)
                    }
                  />
                </div>
                <div className={styles.rowInputSmall}>
                  <input
                    className={styles.input}
                    type="time"
                    value={turno.horaInicio}
                    onChange={(e) =>
                      updateRow(setTurnos, index, "horaInicio", e.target.value)
                    }
                  />
                </div>
                <div className={styles.rowInputSmall}>
                  <input
                    className={styles.input}
                    type="time"
                    value={turno.horaFin}
                    onChange={(e) =>
                      updateRow(setTurnos, index, "horaFin", e.target.value)
                    }
                  />
                </div>
                <button
                  className={styles.removeBtn}
                  title="Eliminar"
                  onClick={() => removeRow(setTurnos, index)}
                >
                  <Icon icon="mdi:trash" />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Tarifas</h3>
              <Button
                size="sm"
                onClick={() =>
                  setTarifas([...tarifas, { turno: "", dias: "", monto: 0 }])
                }
              >
                Agregar Tarifa
              </Button>
            </div>
            {tarifas.map((tarifa, index) => (
              <div className={styles.row} key={`tarifa-${index}`}>
                <div className={styles.rowInputSmall}>
                  <input
                    className={styles.input}
                    value={tarifa.turno}
                    placeholder="Turno"
                    onChange={(e) =>
                      updateRow(setTarifas, index, "turno", e.target.value)
                    }
                  />
                </div>
                <div className={styles.rowInput}>
                  <input
                    className={styles.input}
                    value={tarifa.dias}
                    placeholder="Días (ej. 1,2,3,4,5,6)"
                    onChange={(e) =>
                      updateRow(setTarifas, index, "dias", e.target.value)
                    }
                  />
                </div>
                <div className={styles.rowInputSmall}>
                  <input
                    className={styles.input}
                    type="number"
                    value={tarifa.monto}
                    placeholder="Monto"
                    onChange={(e) =>
                      updateRow(setTarifas, index, "monto", e.target.value)
                    }
                  />
                </div>
                <button
                  className={styles.removeBtn}
                  title="Eliminar"
                  onClick={() => removeRow(setTarifas, index)}
                >
                  <Icon icon="mdi:trash" />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Recursos</h3>
              <Button
                size="sm"
                onClick={() =>
                  setRecursos([...recursos, { descripcion: "", zona: 1, tipo: "cuarto" }])
                }
              >
                Agregar Recurso
              </Button>
            </div>
            {recursos.map((recurso, index) => (
              <div className={styles.row} key={`recurso-${index}`}>
                <div className={styles.rowInput}>
                  <input
                    className={styles.input}
                    value={recurso.descripcion}
                    placeholder="Descripción / número"
                    onChange={(e) =>
                      updateRow(setRecursos, index, "descripcion", e.target.value)
                    }
                  />
                </div>
                <div className={styles.rowInputSmall}>
                  <input
                    className={styles.input}
                    type="number"
                    value={recurso.zona}
                    placeholder="Zona"
                    onChange={(e) =>
                      updateRow(setRecursos, index, "zona", e.target.value)
                    }
                  />
                </div>
                <div className={styles.rowInputSmall}>
                  <input
                    className={styles.input}
                    value={recurso.tipo}
                    placeholder="Tipo"
                    onChange={(e) =>
                      updateRow(setRecursos, index, "tipo", e.target.value)
                    }
                  />
                </div>
                <button
                  className={styles.removeBtn}
                  title="Eliminar"
                  onClick={() => removeRow(setRecursos, index)}
                >
                  <Icon icon="mdi:trash" />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button size="sm" onClick={guardar} disabled={!rubroId}>
              Guardar configuración
            </Button>
          </div>
        </>
      )}
      <Toaster richColors position="top-right" />
    </div>
  );
};
