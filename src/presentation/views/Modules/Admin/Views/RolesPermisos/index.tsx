import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Toaster } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import Input from "../../../../../../components/Input";
import { Button } from "@tremor/react";
import { TableSkeleton } from "../../../../../../components/Skeleton";

Modal.setAppElement("#root");

const modalStyle = {
  overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999 },
  content: {
    top: "50%", left: "50%", right: "auto", bottom: "auto",
    marginRight: "-50%", transform: "translate(-50%, -50%)",
    width: "min(92vw, 560px)", maxHeight: "85vh", overflowY: "auto",
    borderRadius: "1rem", padding: "0", border: "none",
  },
} as any;

interface ISubModuloDetalle {
  subModulo: string;
  subModuloNombre: string;
}

interface IAccesosDetalle {
  modulo: string;
  moduloNombre: string;
  subModulos: ISubModuloDetalle[];
}

interface IRole {
  id: string;
  nombre: string;
  rutaPorDefecto?: string | null;
  prioridad: number;
  cantidadUsuarios: number;
  submoduleIds: string[];
}

interface IUsuario {
  id: string;
  usuario: string;
  nombres: string;
  apellidos: string;
  estado: boolean;
}

// Roles y Permisos: el backend ya traia un RoleRepository completo (Role/RoleSubmodule, con
// tests) pero nunca estuvo conectado a un service/controller ni a esta pantalla -- la unica
// forma de dar acceso era el reparto automatico de TODOS los submodulos al crear un tenant
// (TenantRepository.AsociarModuleUser). Esta pantalla es la que faltaba: crear roles con un
// subconjunto de submodulos y asignarselos a usuarios puntuales.
export const RolesPermisos = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [catalogo, setCatalogo] = useState<IAccesosDetalle[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<IRole | null>(null);
  const [nombre, setNombre] = useState("");
  const [rutaPorDefecto, setRutaPorDefecto] = useState("");
  const [prioridad, setPrioridad] = useState(100);
  const [submoduleIds, setSubmoduleIds] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [roleIdsUsuario, setRoleIdsUsuario] = useState<string[]>([]);
  const [asignando, setAsignando] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, catalogoRes, usuariosRes]: any = await Promise.all([
        axiosInstance.get("/roles/listar"),
        axiosInstance.get("/roles/catalogo-submodulos"),
        axiosInstance.get("/user/listar-usuarios"),
      ]);
      setRoles(rolesRes.data?.data ?? []);
      setCatalogo(catalogoRes.data?.data ?? []);
      setUsuarios(usuariosRes.data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const abrirNuevo = () => {
    setEditando(null);
    setNombre("");
    setRutaPorDefecto("");
    setPrioridad(100);
    setSubmoduleIds([]);
    setModalOpen(true);
  };

  const abrirEditar = (role: IRole) => {
    setEditando(role);
    setNombre(role.nombre);
    setRutaPorDefecto(role.rutaPorDefecto ?? "");
    setPrioridad(role.prioridad);
    setSubmoduleIds(role.submoduleIds ?? []);
    setModalOpen(true);
  };

  const toggleSubmodulo = (id: string) => {
    setSubmoduleIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) return toast.error("El nombre del rol es obligatorio");

    const payload = {
      nombre: nombre.trim(),
      rutaPorDefecto: rutaPorDefecto.trim() || null,
      prioridad,
      submoduleIds,
    };

    setGuardando(true);
    try {
      if (editando) {
        await axiosInstance.put(`/roles/${editando.id}`, payload);
        toast.success("Rol actualizado exitosamente");
      } else {
        await axiosInstance.post("/roles/crear", payload);
        toast.success("Rol creado exitosamente");
      }
      setModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al guardar el rol");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (role: IRole) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el rol "${role.nombre}"?`)) return;
    try {
      await axiosInstance.delete(`/roles/${role.id}`);
      toast.success("Rol eliminado");
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al eliminar el rol");
    }
  };

  const seleccionarUsuario = async (userId: string) => {
    setUsuarioSeleccionado(userId);
    setRoleIdsUsuario([]);
    if (!userId) return;
    try {
      const { data }: any = await axiosInstance.get(`/roles/usuario/${userId}`);
      setRoleIdsUsuario(data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al obtener los roles del usuario");
    }
  };

  const toggleRoleUsuario = (roleId: string) => {
    setRoleIdsUsuario((prev) => (prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]));
  };

  const guardarRolesUsuario = async () => {
    if (!usuarioSeleccionado) return toast.error("Selecciona un usuario");
    setAsignando(true);
    try {
      await axiosInstance.post("/roles/asignar-usuario", { userId: usuarioSeleccionado, roleIds: roleIdsUsuario });
      toast.success("Roles asignados correctamente");
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al asignar los roles");
    } finally {
      setAsignando(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <Icon icon="mdi:arrow-left" width={16} />
          Volver
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Roles</h3>
          <p className="text-sm text-gray-500">Cada rol agrupa un subconjunto de accesos que luego se asigna a los usuarios.</p>
        </div>
        <Button size="sm" onClick={abrirNuevo}>Nuevo rol</Button>
      </div>

      <div className="relative overflow-x-auto sm:rounded-lg border border-gray-200 mb-8">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Nombre</th>
              <th scope="col" className="px-4 py-3">Ruta por defecto</th>
              <th scope="col" className="px-4 py-3">Prioridad</th>
              <th scope="col" className="px-4 py-3">Accesos</th>
              <th scope="col" className="px-4 py-3">Usuarios</th>
              <th scope="col" className="px-4 py-3"></th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr><td colSpan={6} style={{ padding: 0 }}><TableSkeleton columns={6} /></td></tr>
            </tbody>
          ) : (
            <tbody>
              {roles.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center">No hay roles todavía</td></tr>
              )}
              {roles.map((role) => (
                <tr key={role.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{role.nombre}</td>
                  <td className="px-4 py-3">{role.rutaPorDefecto || "—"}</td>
                  <td className="px-4 py-3">{role.prioridad}</td>
                  <td className="px-4 py-3">{role.submoduleIds?.length ?? 0}</td>
                  <td className="px-4 py-3">{role.cantidadUsuarios}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="xs" variant="secondary" onClick={() => abrirEditar(role)}>Editar</Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        disabled={role.cantidadUsuarios > 0}
                        onClick={() => handleEliminar(role)}
                        title={role.cantidadUsuarios > 0 ? "No se puede eliminar: tiene usuarios asignados" : undefined}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Asignar roles a un usuario</h3>
        <p className="text-sm text-gray-500">Un usuario puede tener varios roles; su acceso final es la unión de los accesos de todos.</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 mb-8">
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Usuario</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={usuarioSeleccionado}
            onChange={(e) => seleccionarUsuario(e.target.value)}
          >
            <option value="">Selecciona un usuario...</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>{u.usuario} — {u.nombres} {u.apellidos}</option>
            ))}
          </select>
        </div>

        {usuarioSeleccionado && (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              {roles.length === 0 && <p className="text-sm text-gray-400">No hay roles creados todavía</p>}
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2">
                  <input
                    type="checkbox"
                    checked={roleIdsUsuario.includes(role.id)}
                    onChange={() => toggleRoleUsuario(role.id)}
                  />
                  {role.nombre}
                </label>
              ))}
            </div>
            <Button size="sm" onClick={guardarRolesUsuario} disabled={asignando}>
              {asignando ? "Guardando..." : "Guardar roles del usuario"}
            </Button>
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} style={modalStyle}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editando ? "Editar rol" : "Nuevo rol"}</h3>
          <div className="flex flex-col gap-3">
            <Input isLabel label="Nombre" name="nombre" value={nombre} onChange={(e: any) => setNombre(e.target.value)} />
            <Input
              isLabel
              label="Ruta por defecto (opcional)"
              name="rutaPorDefecto"
              value={rutaPorDefecto}
              onChange={(e: any) => setRutaPorDefecto(e.target.value)}
            />
            <div>
              <label className="block text-sm text-gray-700 mb-1">Prioridad (menor número = mayor prioridad)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={prioridad}
                onChange={(e) => setPrioridad(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Accesos del rol</label>
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {catalogo.length === 0 && <p className="text-sm text-gray-400">No hay submódulos en el catálogo</p>}
                {catalogo.map((grupo) => (
                  <div key={grupo.modulo}>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{grupo.moduloNombre}</p>
                    <div className="flex flex-col gap-1 pl-2">
                      {grupo.subModulos.map((sub) => (
                        <label key={sub.subModulo} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={submoduleIds.includes(sub.subModulo)}
                            onChange={() => toggleSubmodulo(sub.subModulo)}
                          />
                          {sub.subModuloNombre}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button size="sm" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSubmit} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </Modal>

      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
