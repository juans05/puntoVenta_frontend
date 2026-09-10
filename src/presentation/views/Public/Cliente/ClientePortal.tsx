import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./clientePortal.module.css";
import axiosInstance from "../../../../utils/axios";
import { IPedido } from "../../../../redux/reducers/Pedidos/interfaces";

const estadoLabels: Record<string, string> = {
  E: "Enviado (esperando datos)",
  D: "Datos completados",
  P: "En preparación",
  S: "Despachado",
  C: "En camino",
  T: "Entregado",
  A: "Cancelado",
};

const estadoColors: Record<string, string> = {
  E: "bg-blue-100 text-blue-800",
  D: "bg-purple-100 text-purple-800",
  P: "bg-yellow-100 text-yellow-800",
  S: "bg-orange-100 text-orange-800",
  C: "bg-indigo-100 text-indigo-800",
  T: "bg-green-100 text-green-800",
  A: "bg-red-100 text-red-800",
};

const ClientePortal = () => {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<IPedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [page, setPage] = useState(1);
  const [amount] = useState(10);
  const [total, setTotal] = useState(0);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<IPedido | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("clienteToken");
    if (!token) {
      navigate("/mi-cuenta/login");
      return;
    }
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const { data }: any = await axiosInstance.get(`/cliente/pedidos?page=${page}&amount=${amount}`);
      setPedidos(data.data.items);
      setTotal(data.data.total);
      setCargando(false);
    } catch {
      toast.error("Error al cargar pedidos");
      setCargando(false);
    }
  };

  const handleVerDetalle = async (pedido: IPedido) => {
    try {
      const { data }: any = await axiosInstance.get(`/cliente/pedidos/${pedido.id}`);
      setPedidoSeleccionado(data);
    } catch {
      toast.error("Error al cargar detalle");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("clienteToken");
    localStorage.removeItem("clienteId");
    navigate("/mi-cuenta/login");
  };

  const handleCambiarPagina = (newPage: number) => {
    setPage(newPage);
    cargarPedidos();
  };

  const totalPages = Math.ceil(total / amount) || 1;

  if (cargando) {
    return (
      <div className={styles.loading}>
        <Icon icon="mdi:loading" className={styles.spinner} />
        <p>Cargando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Icon icon="mdi:package-variant" className={styles.headerIcon} />
          <h1>Mis Pedidos</h1>
        </div>
        <button className={styles.btnLogout} onClick={handleLogout}>
          <Icon icon="mdi:logout" />
          Salir
        </button>
      </div>

      {pedidos.length === 0 ? (
        <div className={styles.empty}>
          <Icon icon="mdi:package-variant-closed" className={styles.emptyIcon} />
          <h2>No tienes pedidos aún</h2>
          <p>Cuando hagas un pedido, aparecerá aquí.</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Tipo Envío</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido, idx) => (
                  <tr key={pedido.id} onClick={() => handleVerDetalle(pedido)}>
                    <td>{idx + 1 + (page - 1) * amount}</td>
                    <td>{pedido.fechaCreacion?.split(" ")[0] || "-"}</td>
                    <td>
                      <span className={`${styles.badge} ${estadoColors[pedido.estadoPedido] || ""}`}>
                        {estadoLabels[pedido.estadoPedido] || pedido.estadoPedido}
                      </span>
                    </td>
                    <td>S/ {pedido.total.toFixed(2)}</td>
                    <td>{pedido.tipoEnvio || "-"}</td>
                    <td>
                      <Icon icon="mdi:chevron-right" className={styles.chevron} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handleCambiarPagina(page - 1)}
                disabled={page === 1}
              >
                <Icon icon="mdi:chevron-left" />
              </button>
              <span className={styles.pageInfo}>
                Página {page} de {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => handleCambiarPagina(page + 1)}
                disabled={page === totalPages}
              >
                <Icon icon="mdi:chevron-right" />
              </button>
            </div>
          )}
        </>
      )}

      {pedidoSeleccionado && (
        <div className={styles.modalOverlay} onClick={() => setPedidoSeleccionado(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalle del Pedido #{pedidoSeleccionado.id}</h2>
              <button className={styles.btnClose} onClick={() => setPedidoSeleccionado(null)}>
                <Icon icon="mdi:close" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Estado</label>
                  <span className={`${styles.badge} ${estadoColors[pedidoSeleccionado.estadoPedido] || ""}`}>
                    {estadoLabels[pedidoSeleccionado.estadoPedido] || pedidoSeleccionado.estadoPedido}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Fecha</label>
                  <span>{pedidoSeleccionado.fechaCreacion}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Total</label>
                  <span>S/ {pedidoSeleccionado.total.toFixed(2)}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Tipo Envío</label>
                  <span>{pedidoSeleccionado.tipoEnvio || "-"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Dirección</label>
                  <span>{pedidoSeleccionado.direccion || "-"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Distrito</label>
                  <span>{pedidoSeleccionado.ubigeoNombre || "-"}</span>
                </div>
                {pedidoSeleccionado.codigoSeguimiento && (
                  <div className={styles.infoItem}>
                    <label>Código Seguimiento</label>
                    <span className={styles.codigoSeguimiento}>{pedidoSeleccionado.codigoSeguimiento}</span>
                  </div>
                )}
                {pedidoSeleccionado.fechaDespacho && (
                  <div className={styles.infoItem}>
                    <label>Fecha Despacho</label>
                    <span>{pedidoSeleccionado.fechaDespacho}</span>
                  </div>
                )}
                {pedidoSeleccionado.fechaEntrega && (
                  <div className={styles.infoItem}>
                    <label>Fecha Entrega</label>
                    <span>{pedidoSeleccionado.fechaEntrega}</span>
                  </div>
                )}
              </div>

              <div className={styles.detalleSection}>
                <h3>Productos</h3>
                <table className={styles.detalleTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>P. Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidoSeleccionado.pedidoDetalles.map((detalle) => (
                      <tr key={detalle.id}>
                        <td>{detalle.productoNombre}</td>
                        <td>{detalle.cantidad}</td>
                        <td>S/ {detalle.valorUnitario.toFixed(2)}</td>
                        <td>S/ {detalle.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientePortal;