import { useEffect, useState } from "react";
import { Button } from "@tremor/react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import Input from "../../../../../../components/Input";
import styles from "./mybusiness.module.css";

const vacio = { usuarioSol: "", claveSol: "", clientId: "", clientSecret: "" };

// Credenciales para la API de SUNAT (SIRE): con ellas el sistema podra traer las compras y ventas
// registradas en SUNAT. Los secretos nunca vuelven al navegador: vacio = se mantiene lo guardado.
export const ClaveSol = () => {
  const [form, setForm] = useState(vacio);
  const [estado, setEstado] = useState({ ruc: "", tieneClaveSol: false, tieneClientSecret: false });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [probando, setProbando] = useState(false);

  const cargar = async () => {
    try {
      const { data }: any = await axiosInstance.get("/sunat/credenciales");
      const c = data?.data ?? {};
      setForm({ ...vacio, usuarioSol: c.usuarioSol ?? "", clientId: c.clientId ?? "" });
      setEstado({ ruc: c.ruc ?? "", tieneClaveSol: !!c.tieneClaveSol, tieneClientSecret: !!c.tieneClientSecret });
      setError("");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "No se pudieron cargar las credenciales");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const onChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e: any) => {
    e.preventDefault();
    if (!form.usuarioSol.trim() || !form.clientId.trim()) return toast.error("Completa el usuario SOL y el client ID");
    if (!estado.tieneClaveSol && !form.claveSol) return toast.error("Ingresa la clave SOL");
    if (!estado.tieneClientSecret && !form.clientSecret) return toast.error("Ingresa el client secret");
    setGuardando(true);
    try {
      await axiosInstance.put("/sunat/credenciales", form);
      toast.success("Credenciales guardadas");
      cargar();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudieron guardar las credenciales");
    } finally {
      setGuardando(false);
    }
  };

  const probar = async () => {
    setProbando(true);
    try {
      const { data }: any = await axiosInstance.post("/sunat/probar-conexion");
      toast.success(data?.message ?? "Conexión con SUNAT correcta");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo conectar con SUNAT");
    } finally {
      setProbando(false);
    }
  };

  if (error) {
    return (
      <div>
        <h4 className={styles.contenidoTitulo}>Certificado y Clave SOL</h4>
        <p className={styles.contenidoDesc}>{error}</p>
      </div>
    );
  }

  return (
    <form onSubmit={guardar}>
      <h4 className={styles.contenidoTitulo}>Certificado y Clave SOL</h4>
      <p className={styles.contenidoDesc}>
        Conecta tu empresa con SUNAT para traer las facturas y boletas de compras y ventas registradas a tu RUC
        {estado.ruc ? ` (${estado.ruc})` : ""}. El client ID y el client secret se generan en SUNAT Operaciones en Línea,
        menú «Credenciales de API SUNAT». La clave SOL y el client secret se guardan cifrados.
      </p>

      <div className={styles.seccionInterna}>
        <span className={styles.seccionEtiqueta}>CLAVE SOL</span>
        <div className={styles.grid}>
          <Input isLabel label="Usuario SOL" name="usuarioSol" value={form.usuarioSol} onChange={onChange} />
          <Input
            isLabel
            type="password"
            label={estado.tieneClaveSol ? "Clave SOL (guardada, deja vacío para no cambiarla)" : "Clave SOL"}
            name="claveSol"
            value={form.claveSol}
            onChange={onChange}
          />
        </div>
      </div>

      <div className={styles.seccionInterna}>
        <span className={styles.seccionEtiqueta}>CREDENCIALES DE API SUNAT</span>
        <div className={styles.grid}>
          <Input isLabel label="Client ID" name="clientId" value={form.clientId} onChange={onChange} />
          <Input
            isLabel
            type="password"
            label={estado.tieneClientSecret ? "Client secret (guardado, deja vacío para no cambiarlo)" : "Client secret"}
            name="clientSecret"
            value={form.clientSecret}
            onChange={onChange}
          />
        </div>
      </div>

      <div className={styles.botones}>
        <button
          type="button"
          className="border border-gray-300 bg-white text-gray-700 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          onClick={probar}
          disabled={probando || !estado.tieneClaveSol}
        >
          {probando ? "Probando..." : "Probar conexión"}
        </button>
        <Button size="sm" type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
};
