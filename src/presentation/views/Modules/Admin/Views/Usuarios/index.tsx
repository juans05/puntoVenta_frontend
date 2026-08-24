import { useEffect, useState } from "react";
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
};

interface IUsuario {
  id: string;
  usuario: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  estado: boolean;
  fechaCreacion: string;
}

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState(initialForm);

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
      const { status }: any = await axiosInstance.post(`/user/create`, form);
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Usuarios</h3>
          <p className="text-sm text-gray-500">
            Usuarios que pueden iniciar sesión y abrir su caja.
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          Agregar usuario
        </Button>
      </div>

      <div className="relative overflow-x-auto sm:rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">N°</th>
              <th scope="col" className="px-4 py-3">Usuario</th>
              <th scope="col" className="px-4 py-3">Nombres</th>
              <th scope="col" className="px-4 py-3">Apellidos</th>
              <th scope="col" className="px-4 py-3">Email</th>
              <th scope="col" className="px-4 py-3">Teléfono</th>
              <th scope="col" className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr><td colSpan={7} style={{ padding: 0 }}>
                <TableSkeleton columns={7} />
              </td></tr>
            </tbody>
          ) : (
          <tbody>
            {!loading && usuarios.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center">No hay usuarios registrados</td>
              </tr>
            )}
            {!loading &&
              usuarios.map((u, index) => (
                <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.usuario}</td>
                  <td className="px-4 py-3">{u.nombres}</td>
                  <td className="px-4 py-3">{u.apellidos}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.telefono}</td>
                  <td className="px-4 py-3">
                    <span className={u.estado ? "text-green-600" : "text-red-600"}>
                      {u.estado ? "Activo" : "Inactivo"}
                    </span>
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
        style={modalStyle}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo usuario</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input isLabel label="Nombres *" name="firstName" value={form.firstName} onChange={handleChange} />
            </div>
            <div>
              <Input isLabel label="Apellidos" name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
            <div>
              <Input isLabel label="Usuario *" name="userName" value={form.userName} onChange={handleChange} />
            </div>
            <div>
              <Input isLabel label="Contraseña *" name="password" type="password" value={form.password} onChange={handleChange} />
            </div>
            <div>
              <Input isLabel label="Email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <Input isLabel label="Teléfono" name="phone" value={form.phone} onChange={handleChange} />
            </div>
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
