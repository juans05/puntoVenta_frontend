import { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import Input from "../../../../../../components/Input";
import { Button } from "@tremor/react";
import { TableSkeleton } from "../../../../../../components/Skeleton";

Modal.setAppElement("#root");

const modalStyle = {
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "min(92vw, 480px)",
    borderRadius: "1rem",
    padding: "0",
    border: "none",
  },
} as any;

const initialForm = {
  firstName: "",
  lastName: "",
  userName: "",
  email: "",
  password: "",
  phone: "",
  celular: "",
  sucursalId: 0,
  esAdministrador: true,
  roleId: "",
};

// Caracteres sin ambiguedad visual (sin O/0, I/1/l) para el codigo de usuario autogenerado.
const CODIGO_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generarCodigo = (len = 6) =>
  Array.from({ length: len }, () => CODIGO_CHARS[Math.floor(Math.random() * CODIGO_CHARS.length)]).join("");

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const generarPassword = (len = 10) =>
  Array.from({ length: len }, () => PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)]).join("");

interface IUsuario {
  id: string;
  usuario: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  estado: boolean;
  fechaCreacion: string;
  roles: string[];
}

type TabEstado = "todos" | "activos" | "inactivos";
type FiltroRol = "todos" | "administrador" | "colaborador";

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [creando, setCreando] = useState(false);
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const [busqueda, setBusqueda] = useState("");
  const [tabEstado, setTabEstado] = useState<TabEstado>("todos");
  const [filtroRol, setFiltroRol] = useState<FiltroRol>("todos");

  const [roles, setRoles] = useState<{ id: string; nombre: string }[]>([]);
  const [sucursales, setSucursales] = useState<{ id: number; value: string }[]>([]);
  const [verPassword, setVerPassword] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data }: any = await axiosInstance.get(`/user/listar-usuarios`);
      setUsuarios(data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al listar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const abrirNuevo = async () => {
    setForm({ ...initialForm, userName: generarCodigo(), password: generarPassword() });
    setVerPassword(false);
    setModalOpen(true);
    try {
      const [rolesRes, sucursalesRes]: any[] = await Promise.all([
        axiosInstance.get(`/roles/listar`).catch(() => null),
        axiosInstance.get(`/extensiones/sucursales`).catch(() => null),
      ]);
      setRoles(rolesRes?.data?.data ?? []);
      setSucursales(sucursalesRes?.data?.data ?? []);
    } catch {
      // silencioso: si no cargan, el modal igual funciona solo con "Administrador" y sin sucursal
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.firstName.trim()) return toast.error("Los nombres son obligatorios");
    if (!form.userName.trim()) return toast.error("El usuario es obligatorio");
    if (!form.password.trim()) return toast.error("La contraseña es obligatoria");
    if (form.password.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres");

    setCreando(true);
    try {
      const { status }: any = await axiosInstance.post(`/user/create`, {
        ...form,
        sucursalId: form.sucursalId || undefined,
        roleId: form.esAdministrador ? undefined : form.roleId || undefined,
      });
      if (status === 200) {
        toast.success("Usuario creado exitosamente");
        setModalOpen(false);
        setForm(initialForm);
        loadUsers();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al crear el usuario");
    } finally {
      setCreando(false);
    }
  };

  const cambiarEstado = async (u: IUsuario) => {
    setCambiandoEstadoId(u.id);
    try {
      const { status }: any = await axiosInstance.put(`/user/${u.id}/estado`, { activo: !u.estado });
      if (status === 200) {
        toast.success(u.estado ? "Usuario desactivado" : "Usuario activado");
        setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, estado: !u.estado } : x)));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cambiar el estado");
    } finally {
      setCambiandoEstadoId(null);
    }
  };

  const esAdministrador = (u: IUsuario) => !u.roles || u.roles.length === 0;

  const stats = useMemo(
    () => ({
      total: usuarios.length,
      activos: usuarios.filter((u) => u.estado).length,
      administradores: usuarios.filter(esAdministrador).length,
      colaboradores: usuarios.filter((u) => !esAdministrador(u)).length,
    }),
    [usuarios]
  );

  const usuariosFiltrados = usuarios.filter((u) => {
    if (tabEstado === "activos" && !u.estado) return false;
    if (tabEstado === "inactivos" && u.estado) return false;
    if (filtroRol === "administrador" && !esAdministrador(u)) return false;
    if (filtroRol === "colaborador" && esAdministrador(u)) return false;
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      const texto = `${u.usuario} ${u.nombres} ${u.apellidos} ${u.email}`.toLowerCase();
      if (!texto.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
          <p className="text-sm text-gray-500">Administra tu equipo y lo que cada quién puede hacer.</p>
        </div>
        <Button size="sm" onClick={abrirNuevo}>
          + Nuevo usuario
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="border-l-4 border-indigo-500 bg-white rounded-lg px-4 py-3">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-400 uppercase">Total</div>
        </div>
        <div className="border-l-4 border-green-500 bg-white rounded-lg px-4 py-3">
          <div className="text-2xl font-bold text-gray-900">{stats.activos}</div>
          <div className="text-xs text-gray-400 uppercase">Activos</div>
        </div>
        <div className="border-l-4 border-purple-500 bg-white rounded-lg px-4 py-3">
          <div className="text-2xl font-bold text-gray-900">{stats.administradores}</div>
          <div className="text-xs text-gray-400 uppercase">Administradores</div>
        </div>
        <div className="border-l-4 border-teal-500 bg-white rounded-lg px-4 py-3">
          <div className="text-2xl font-bold text-gray-900">{stats.colaboradores}</div>
          <div className="text-xs text-gray-400 uppercase">Colaboradores</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          className="flex-1 min-w-[220px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
          placeholder="Buscar por nombre, correo o usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(["todos", "activos", "inactivos"] as TabEstado[]).map((t) => (
            <button
              key={t}
              className={`px-3 py-1.5 text-sm rounded-md capitalize ${tabEstado === t ? "bg-white shadow font-semibold text-indigo-600" : "text-gray-500"}`}
              onClick={() => setTabEstado(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value as FiltroRol)}
        >
          <option value="todos">Todos los roles</option>
          <option value="administrador">Administrador</option>
          <option value="colaborador">Colaborador</option>
        </select>
      </div>

      <div className="relative overflow-x-auto sm:rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Usuario</th>
              <th scope="col" className="px-4 py-3">Rol</th>
              <th scope="col" className="px-4 py-3">Email</th>
              <th scope="col" className="px-4 py-3">Teléfono</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr><td colSpan={6} style={{ padding: 0 }}>
                <TableSkeleton columns={6} />
              </td></tr>
            </tbody>
          ) : (
          <tbody>
            {!loading && usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center">No hay usuarios que coincidan con el filtro</td>
              </tr>
            )}
            {!loading &&
              usuariosFiltrados.map((u) => (
                <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {u.nombres} {u.apellidos}
                    </div>
                    <div className="text-xs text-gray-400">@{u.usuario}</div>
                  </td>
                  <td className="px-4 py-3">
                    {esAdministrador(u) ? (
                      <span className="bg-purple-50 text-purple-600 text-xs font-semibold px-2 py-1 rounded-full">Administrador</span>
                    ) : (
                      <span className="bg-teal-50 text-teal-600 text-xs font-semibold px-2 py-1 rounded-full">
                        {u.roles.join(", ")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.telefono}</td>
                  <td className="px-4 py-3">
                    <span className={u.estado ? "text-green-600" : "text-red-600"}>
                      {u.estado ? "● Activo" : "● Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md border ${u.estado ? "border-red-200 text-red-600" : "border-green-200 text-green-600"}`}
                      onClick={() => cambiarEstado(u)}
                      disabled={cambiandoEstadoId === u.id}
                    >
                      {cambiandoEstadoId === u.id ? "..." : u.estado ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
          )}
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        style={{ ...modalStyle, content: { ...modalStyle.content, width: "min(92vw, 560px)" } }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo usuario</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500">Código de usuario</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  title="Generar otro"
                  className="p-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setForm({ ...form, userName: generarCodigo() })}
                >
                  ↺
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Contraseña</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  name="password"
                  type={verPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                />
                <button type="button" title="Mostrar/ocultar" className="p-2 text-gray-400 hover:text-gray-600" onClick={() => setVerPassword(!verPassword)}>
                  {verPassword ? "🙈" : "👁"}
                </button>
                <button
                  type="button"
                  title="Generar otra"
                  className="p-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setForm({ ...form, password: generarPassword() })}
                >
                  ↺
                </button>
              </div>
            </div>
            <div>
              <Input isLabel label="Nombres *" name="firstName" value={form.firstName} onChange={handleChange} />
            </div>
            <div>
              <Input isLabel label="Apellidos" name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <Input isLabel label="Correo electrónico" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <Input isLabel label="Celular" name="celular" value={form.celular} onChange={handleChange} />
            </div>
            <div>
              <Input isLabel label="Teléfono" name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold text-gray-700">Rol del usuario</label>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border text-sm font-semibold ${form.esAdministrador ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600"}`}
                onClick={() => setForm({ ...form, esAdministrador: true, roleId: "" })}
              >
                Administrador
              </button>
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
                    !form.esAdministrador && form.roleId === r.id ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600"
                  }`}
                  onClick={() => setForm({ ...form, esAdministrador: false, roleId: r.id })}
                >
                  {r.nombre}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {form.esAdministrador
                ? "Administrador: acceso completo desde que se crea."
                : form.roleId
                ? "Colaborador: solo puede usar lo que este rol permite."
                : "No hay roles creados todavía — el usuario queda sin acceso hasta que le asignes uno en Roles y Permisos."}
            </p>
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold text-gray-700">Sucursal / almacén asignado</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              value={form.sucursalId}
              onChange={(e) => setForm({ ...form, sucursalId: Number(e.target.value) })}
            >
              <option value={0}>Sin asignar</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.value} (ID: {s.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="sm" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={creando}>
              {creando ? "Creando..." : "Crear usuario"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
