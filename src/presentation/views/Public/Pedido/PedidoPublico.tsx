import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./pedidoPublico.module.css";
import axiosInstance from "../../../../utils/axios";
import { IPedidoPublico } from "../../../../redux/reducers/Pedidos/interfaces";

const estadoLabels: Record<string, string> = {
  E: "Esperando datos",
  D: "Datos completos",
  P: "En preparación",
  S: "Despachado",
  C: "En camino",
  T: "Entregado",
  A: "Cancelado",
};

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
    salonId: "",
  });
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [esLima, setEsLima] = useState(false);
  const [salones, setSalones] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      cargarPedido(token);
      cargarUbigeos();
    }
  }, [token]);

  const cargarPedido = async (token: string) => {
    try {
      const { data }: any = await axiosInstance.get(`/pedidos/publico/${token}`);
      setPedido(data?.data ?? null);
      setCargando(false);
    } catch {
      toast.error("Pedido no encontrado o cancelado");
      setCargando(false);
    }
  };

  const cargarUbigeos = async () => {
    try {
      const { data }: any = await axiosInstance.get("/extensiones/ubigeos");
      setUbicaciones(data?.data || []);
    } catch {
      toast.error("Error al cargar ubicaciones");
    }
  };

  const cargarSalones = async (ubigeoId: string) => {
    try {
      const { data }: any = await axiosInstance.get("/extensiones/salones", { params: { ubigeoId } });
      setSalones(data?.data || []);
    } catch {
      toast.error("Error al cargar salones");
      setSalones([]);
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

  useEffect(() => {
    setFormData((prev) => ({ ...prev, salonId: "" }));
    if (formData.ubigeoId && !esLima) {
      cargarSalones(formData.ubigeoId);
    } else {
      setSalones([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.ubigeoId, esLima]);

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

    if (!esLima && !formData.salonId) {
      toast.error("Elige el salón donde recogerás tu pedido");
      return;
    }

    setEnviando(true);
    try {
      const payload = { ...formData, salonId: formData.salonId ? Number(formData.salonId) : null };
      const { data }: any = await axiosInstance.post(`/pedidos/publico/${token}`, payload);
      if (data?.data) {
        toast.success("Datos registrados exitosamente. Revisa tu WhatsApp para la contraseña.");
        setTimeout(() => {
          navigate("/mi-cuenta/login");
        }, 3000);
      } else {
        toast.error(data?.message || "Error al registrar datos");
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
      <div className={styles.page}>
        <div className={styles.miniTicket}>
          <div className={styles.miniTicketCard}>
            <Icon icon="mdi:loading" className={styles.spinner + " " + styles.spinIcon} />
            <p className={styles.loadingLabel}>Imprimiendo tu pedido…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className={styles.page}>
        <div className={styles.miniTicket}>
          <div className={styles.miniTicketCard}>
            <Icon icon="mdi:package-variant-closed" className={styles.icon} />
            <h2>Este pedido no existe</h2>
            <p>El enlace venció o el pedido fue cancelado.</p>
          </div>
        </div>
      </div>
    );
  }

  const total = pedido.pedidoDetalles.reduce((acc, d) => acc + d.cantidad * d.valorUnitario, 0);

  return (
    <div className={styles.page}>
      <Toaster position="top-right" />

      <div className={styles.ticket}>
        <div className={styles.brandRow}>
          <span className={styles.brand}>PuntoVenta</span>
          <span className={styles.orderId}>Pedido Nº {pedido.id}</span>
        </div>
        <div className={styles.stampRow}>
          <span className={`${styles.stamp} ${pedido.estadoPedido === "A" ? styles.alert : ""}`}>
            {estadoLabels[pedido.estadoPedido] || pedido.estadoPedido}
          </span>
        </div>

        <hr className={styles.perforation} />

        <h3 className={styles.sectionTitle}>Tu pedido</h3>
        <div className={styles.lineItems}>
          {pedido.pedidoDetalles.map((detalle) => (
            <div className={styles.lineItem} key={detalle.productoId}>
              <span className={styles.lineQty}>{detalle.cantidad}×</span>
              <span className={styles.lineName}>
                {detalle.productoNombre}
                <span className={styles.lineUnit}>S/ {detalle.valorUnitario.toFixed(2)} c/u</span>
              </span>
              <span className={styles.lineSubtotal}>
                S/ {(detalle.cantidad * detalle.valorUnitario).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>S/ {total.toFixed(2)}</span>
        </div>

        <hr className={styles.perforation} />

        <form onSubmit={handleSubmit} className={styles.form}>
          <h3 className={styles.sectionTitle}>Tus datos</h3>

          <div className={styles.field}>
            <label htmlFor="nombre">Nombre completo</label>
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

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="dni">DNI</label>
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

            <div className={styles.field}>
              <label htmlFor="celular">Celular</label>
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
          </div>

          <div className={styles.field}>
            <label htmlFor="ubigeoId">Ubicación</label>
            <select
              id="ubigeoId"
              name="ubigeoId"
              value={formData.ubigeoId}
              onChange={handleChange}
              required
            >
              <option value="">Elige tu ubicación</option>
              {ubicaciones.map((u: any) => (
                <option key={u.ubigeoId} value={u.ubigeoId}>
                  {u.departamento} - {u.provincia} - {u.distrito}
                </option>
              ))}
            </select>
          </div>

          {esLima && (
            <div className={`${styles.field} ${styles.fieldEnter}`}>
              <label htmlFor="direccion">Dirección</label>
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

          {formData.ubigeoId && !esLima && (
            <>
              <div className={`${styles.field} ${styles.fieldEnter}`}>
                <label>Currier</label>
                <input type="text" value="Shalom" disabled />
              </div>

              <div className={`${styles.field} ${styles.fieldEnter}`}>
                <label htmlFor="salonId">Salón de recojo</label>
                <select
                  id="salonId"
                  name="salonId"
                  value={formData.salonId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Elige el salón</option>
                  {salones.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className={styles.field}>
            <label htmlFor="referencia">Referencia (opcional)</label>
            <input
              type="text"
              id="referencia"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
              placeholder="Frente al parque, casa azul, etc."
            />
          </div>

          <div className={styles.locationRow}>
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
              <>
                <Icon icon="mdi:check-decagram" /> Confirmar pedido
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Al confirmar, creamos tu cuenta para que puedas seguir este pedido. Te enviamos la contraseña por WhatsApp.</p>
        </div>
      </div>
    </div>
  );
};

export default PedidoPublico;