import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import styles from "../Compras/compras.module.css";
import axiosInstance from "../../../../../../utils/axios";
import { useFormErrors, CampoError } from "../../../../../../components/FormError";

// Jefaturas que aprueban ordenes de compra/servicio sobre el umbral (Configuracion > Flujo de
// compras y ventas > monto de aprobacion). Cada departamento tiene una lista de aprobadores; al
// crear una orden sobre el umbral se elige UNO de ellos (ver NuevaOrden en Compras/Ordenes.tsx).

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};
const modal: React.CSSProperties = {
  background: "#fff", borderRadius: 12, padding: 20, width: "min(480px, 100%)", maxHeight: "90vh", overflow: "auto",
};
const mensajeError = (e: any, def: string) => e?.response?.data?.message ?? def;

export const Departamentos = () => {
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState<any>(null); // null = cerrado; {} = nuevo; {id,...} = editar

  const cargar = async () => {
    setCargando(true);
    try {
      const [depRes, userRes]: any = await Promise.all([
        axiosInstance.get("/departamentos/listar"),
        axiosInstance.get("/user/listar-usuarios"),
      ]);
      setDepartamentos(depRes.data?.data ?? []);
      setUsuarios(userRes.data?.data ?? []);
    } catch (e) {
      toast.error(mensajeError(e, "No se pudieron cargar los departamentos"));
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    cargar();
  }, []);

  const guardar = async (payload: { nombre: string; aprobadorIds: string[] }, id?: number) => {
    try {
      if (id) await axiosInstance.put(`/departamentos/actualizar/${id}`, payload);
      else await axiosInstance.post("/departamentos/crear", payload);
      toast.success("Departamento guardado");
      setEditando(null);
      cargar();
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo guardar"));
    }
  };

  return (
    <div>
      <Toaster richColors position="top-right" />
      <div className={styles.headerTop}>
        <div>
          <h3>Departamentos</h3>
          <p className={styles.subtitle}>Jefaturas que aprueban órdenes de compra o servicio sobre el monto configurado.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.registrarBtn} onClick={() => setEditando({})}>+ Nuevo departamento</button>
        </div>
      </div>

      <div className={`${styles.tableWrap} ${styles.tableWrapTabbed}`}>
        {cargando ? (
          <div className={styles.emptyState}><p>Cargando...</p></div>
        ) : departamentos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏢</div>
            <h4>Sin departamentos</h4>
            <p>Crea uno para poder asignar aprobadores a las órdenes que superen el monto configurado.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Departamento</th><th>Aprobadores</th><th></th></tr></thead>
            <tbody>
              {departamentos.map((d) => (
                <tr key={d.id}>
                  <td data-label="Departamento">{d.nombre}</td>
                  <td data-label="Aprobadores">{d.aprobadores.length === 0 ? "Sin aprobadores" : d.aprobadores.map((a: any) => a.nombre).join(", ")}</td>
                  <td className={styles.accionesCell}>
                    <button className={styles.editarBtn} onClick={() => setEditando(d)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editando && (
        <EditarDepartamento departamento={editando} usuarios={usuarios} onCerrar={() => setEditando(null)}
          onGuardar={(payload: { nombre: string; aprobadorIds: string[] }) => guardar(payload, editando.id)} />
      )}
    </div>
  );
};

const EditarDepartamento = ({ departamento, usuarios, onCerrar, onGuardar }: any) => {
  const [nombre, setNombre] = useState(departamento.nombre ?? "");
  const [aprobadorIds, setAprobadorIds] = useState<string[]>(departamento.aprobadores?.map((a: any) => a.userId) ?? []);
  const { errors, setError, clearError } = useFormErrors();

  const toggleAprobador = (id: string) =>
    setAprobadorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const guardar = () => {
    if (!nombre.trim()) {
      setError("nombre", "El nombre es obligatorio");
      return toast.error("El nombre es obligatorio");
    }
    onGuardar({ nombre: nombre.trim(), aprobadorIds });
  };

  return (
    <div style={overlay} onClick={onCerrar}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{departamento.id ? "Editar departamento" : "Nuevo departamento"}</h3>
          <button onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <label>Nombre</label>
        <input style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 8px", ...(errors.nombre ? { borderColor: "#F24B89" } : {}) }}
          value={nombre} onChange={(e) => { setNombre(e.target.value); clearError("nombre"); }} />
        <CampoError mensaje={errors.nombre} />

        <h4 style={{ margin: "14px 0 6px" }}>Aprobadores</h4>
        <div style={{ maxHeight: 220, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8 }}>
          {usuarios.map((u: any) => (
            <label key={u.id} style={{ display: "block", padding: "4px 0" }}>
              <input type="checkbox" checked={aprobadorIds.includes(u.id)} onChange={() => toggleAprobador(u.id)} /> {u.nombres} {u.apellidos} ({u.usuario})
            </label>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button className={styles.registrarBtn} onClick={guardar} disabled={Object.keys(errors).length > 0}>Guardar</button>
        </div>
      </div>
    </div>
  );
};
