import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./pedidoPublico.module.css";
import axiosInstance from "../../../../utils/axios";
import { IPedidoPublico } from "../../../../redux/reducers/Pedidos/interfaces";

const PedidoPublico = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState<IPedidoPublico | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    celular: "",
    ubigeoId: "",
    direccion: "",
    referencia: "",
    latitud: null as number | null,
    longitud: null as number | null,
  });
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [esLima, setEsLima] = useState(false);

  useEffect(() => {
    if (token) {
      cargarPedido(token);
      cargarUbigeos();
    }
  }, [token]);

  const cargarPedido = async (token: string) => {
    try {
      const { data }: any = await axiosInstance.get(`/pedidos/publico/${token}`);
      setPedido(data);
      setCargando(false);
    } catch {
      toast.error("Pedido no encontrado o cancelado");
      setCargando(false);
    }
  };

  const cargarUbigeos = async () => {
    try {
      const { data }: any = await axiosInstance.get("/ubigeo/listar?page=1&amount=2000");
      const items = data?.data?.items || [];
      setUbicaciones(items);
    } catch {
      toast.error("Error al cargar ubicaciones");
    }
  };

  useEffect(() => {
    if (formData.ubigeoId) {
      const ubicacion = ubicaciones.find((u) => u.ubigeoId === formData.ubigeoId);
      if (ubicacion) {
        const esLimaUbicacion = ubicacion.departamento === "LIMA" && ubicacion.provincia === "LIMA";
        setEsLima(esLimaUbicacion);
      }
    }
  }, [formData.ubigeoId, ubicaciones]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: value ? parseFloat(value) : null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.dni.trim() || !formData.celular.trim() || !formData.ubigeoId) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (formData.dni.length !== 8) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    if (esLima && !formData.direccion.trim()) {
      toast.error("La dirección es obligatoria para envíos en Lima");
      return;
    }

    setEnviando(true);
    try {
      const { data }: any = await axiosInstance.post(`/pedidos/publico/${token}`, formData);
      if (data.exito) {
        toast.success("Datos registrados exitosamente. Revisa tu WhatsApp para la contraseña.");
        setTimeout(() => {
          navigate("/mi-cuenta/login");
        }, 3000);
      } else {
        toast.error(data.message || "Error al registrar datos");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al procesar formulario");
    } finally {
      setEnviando(false);
    }
  };

  const usarUbicacionActual = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no soportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        }));
        toast.success("Ubicación obtenida");
      },
      () => {
        toast.error("No se pudo obtener la ubicación");
      }
    );
  };

  if (cargando) {
    return (
      <div className={styles.loading}>
        <Icon icon="mdi:loading" className={styles.spinner} />
        <p>Cargando pedido...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className={styles.notFound}>
        <Icon icon="mdi:package-variant-closed" className={styles.icon} />
        <h2>Pedido no encontrado</h2>
        <p>Este enlace ha expirado o el pedido fue cancelado.</p>
      </div>
    );
  }

  const total = pedido.pedidoDetalles.reduce((acc, d) => acc + d.cantidad * d.valorUnitario, 0);

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Icon icon="mdi:cart" className={styles.logoIcon} />
            <span>Confirmar Pedido</span>
          </div>
        </div>

        <div className={styles.resumen}>
          <h3>Detalle del Pedido</h3>
          <table className={styles.tablaResumen}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>P. Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.pedidoDetalles.map((detalle) => (
                <tr key={detalle.productoId}>
                  <td>{detalle.productoNombre}</td>
                  <td>{detalle.cantidad}</td>
                  <td>S/ {detalle.valorUnitario.toFixed(2)}</td>
                  <td>S/ {(detalle.cantidad * detalle.valorUnitario).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className={styles.totalLabel}>Total</td>
                <td className={styles.totalValue}>S/ {total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h3>Tus Datos</h3>

          <div className={styles.fieldGroup}>
            <label htmlFor="nombre">Nombre completo *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="dni">DNI *</label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="12345678"
              maxLength={8}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="celular">Celular *</label>
            <input
              type="tel"
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="999 999 999"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Ubicación *</label>
            <div className={styles.ubigeoSelects}>
              <select
                name="ubigeoId"
                value={formData.ubigeoId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar ubicación</option>
                {ubicaciones.map((u: any) => (
                  <option key={u.ubigeoId} value={u.ubigeoId}>
                    {u.departamento} - {u.provincia} - {u.distrito}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {esLima && (
            <div className={styles.fieldGroup}>
              <label htmlFor="direccion">Dirección *</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Av. Principal 123"
                required
              />
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label htmlFor="referencia">Referencia</label>
            <input
              type="text"
              id="referencia"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
              placeholder="Frente al parque, casa azul, etc."
            />
          </div>

          <div className={styles.ubicacionBtn}>
            <button
              type="button"
              onClick={usarUbicacionActual}
              className={styles.btnUbicacion}
              disabled={enviando}
            >
              <Icon icon="mdi:crosshairs-gps" />
              Usar mi ubicación actual
            </button>
            {formData.latitud && formData.longitud && (
              <span className={styles.ubicacionInfo}>
                <Icon icon="mdi:map-marker" /> {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
              </span>
            )}
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={enviando}>
            {enviando ? (
              <>
                <Icon icon="mdi:loading" className={styles.spinIcon} /> Enviando...
              </>
            ) : (
              "Confirmar y Enviar Datos"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Al enviar tus datos, se creará una cuenta para que puedas rastrear tu pedido.</p>
          <p>La contraseña te llegará por WhatsApp al número registrado.</p>
        </div>
      </div>
    </div>
  );
};

export default PedidoPublico;