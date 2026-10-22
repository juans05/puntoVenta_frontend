import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import axiosInstance from "../../../utils/axios";
import { setToken } from "../../../helpers/auth-helpers";

const formVacio = {
  nombres: "",
  apellidos: "",
  email: "",
  celular: "",
  usuario: "",
  password: "",
  razonSocial: "",
  nombreComercial: "",
  ruc: "",
  rubroId: "",
};

const celda = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1";
const etiqueta = "text-xs font-semibold text-gray-600";

// Registro publico: crea la cuenta del dueño y su primera empresa, y entra directo al sistema.
const Registro = () => {
  const [form, setForm] = useState(formVacio);
  const [rubros, setRubros] = useState<{ id: number; value: string }[]>([]);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    axiosInstance
      .get("/extensiones/rubros")
      .then(({ data }: any) => setRubros(data?.data ?? []))
      .catch(() => setRubros([]));
  }, []);

  const set = (campo: keyof typeof formVacio) => (e: any) => setForm({ ...form, [campo]: e.target.value });

  const crear = async (e: any) => {
    e.preventDefault();
    if (!form.nombres.trim() || !form.email.trim() || !form.usuario.trim()) return toast.error("Completa tus nombres, correo y usuario");
    if (form.password.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres");
    if (!form.razonSocial.trim()) return toast.error("Ingresa la razón social de tu empresa");
    if (!form.rubroId) return toast.error("Elige el rubro de tu empresa");

    setCreando(true);
    try {
      await axiosInstance.post("/tenant/registro", { ...form, rubroId: Number(form.rubroId), ruc: form.ruc || undefined });
      // Cuenta creada: se inicia sesion con lo que acaba de ingresar.
      const { data }: any = await axiosInstance.post("/autenticacion/token", { userName: form.usuario, password: form.password });
      setToken(data.data.token);
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo crear la cuenta");
      setCreando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Toaster position="top-right" richColors />
      <form onSubmit={crear} className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900">Crea tu cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">Registra tus datos y tu empresa. Luego podrás agregar más empresas y usuarios.</p>

        <h3 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-2">Tus datos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={etiqueta}>Nombres *</label>
            <input className={celda} value={form.nombres} onChange={set("nombres")} />
          </div>
          <div>
            <label className={etiqueta}>Apellidos</label>
            <input className={celda} value={form.apellidos} onChange={set("apellidos")} />
          </div>
          <div>
            <label className={etiqueta}>Correo electrónico *</label>
            <input className={celda} type="email" value={form.email} onChange={set("email")} />
          </div>
          <div>
            <label className={etiqueta}>Celular</label>
            <input className={celda} value={form.celular} onChange={set("celular")} />
          </div>
          <div>
            <label className={etiqueta}>Usuario para ingresar *</label>
            <input className={celda} value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value.replace(/\s/g, "") })} />
          </div>
          <div>
            <label className={etiqueta}>Contraseña * (mínimo 6 caracteres)</label>
            <input className={celda} type="password" value={form.password} onChange={set("password")} />
          </div>
        </div>

        <h3 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-2">Tu empresa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={etiqueta}>Razón social *</label>
            <input className={celda} value={form.razonSocial} onChange={set("razonSocial")} />
          </div>
          <div>
            <label className={etiqueta}>Nombre comercial</label>
            <input className={celda} value={form.nombreComercial} onChange={set("nombreComercial")} />
          </div>
          <div>
            <label className={etiqueta}>RUC</label>
            <input className={celda} maxLength={11} value={form.ruc}
              onChange={(e) => setForm({ ...form, ruc: e.target.value.replace(/\D/g, "") })} />
          </div>
          <div className="sm:col-span-2">
            <label className={etiqueta}>Rubro *</label>
            <select className={celda} value={form.rubroId} onChange={set("rubroId")}>
              <option value="">Elige el rubro de tu negocio</option>
              {rubros.map((r) => (
                <option key={r.id} value={r.id}>{r.value}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={creando}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg py-3 disabled:opacity-60">
          {creando ? "Creando tu cuenta..." : "Crear cuenta"}
        </button>
        <p className="text-sm text-gray-500 text-center mt-4">
          ¿Ya tienes cuenta? <a href="/" className="text-blue-600 font-semibold hover:underline">Inicia sesión</a>
        </p>
      </form>
    </div>
  );
};

export default Registro;
