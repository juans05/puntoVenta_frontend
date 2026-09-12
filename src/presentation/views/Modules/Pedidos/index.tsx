import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import jsPDF from "jspdf";
import styles from "./pedidos.module.css";
import { getToken } from "../../../../helpers/auth-helpers";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import { RootState } from "../../../../redux/rootState";
import { IProductsState } from "../../../../redux/reducers/productos/interfaces";
import { getProducts } from "../../../../redux/reducers/Admin/productos/producto.reducer";
import type { IPedido, IPedidoDetalle, IEtiquetaEnvio } from "../../../../redux/reducers/Pedidos/interfaces";
import { fetchPedidos, crearPedidoAction, actualizarEstadoPedidoAction, fetchEtiquetaEnvioAction, resetPedidosAction } from "../../../../redux/reducers/Pedidos/pedidos.actions";
import { ProductoPickerModal } from "./ProductoPickerModal";
import { printTable } from "../../../../helpers/functions/printTitle";
import { title } from "../../../../infraestructure/MData/MData";

type EstadoPedido = "E" | "D" | "P" | "S" | "C" | "T" | "A";

const estadoLabels: Record<EstadoPedido, string> = {
  E: "Enviado",
  D: "Datos completados",
  P: "En preparación",
  S: "Despachado",
  C: "En camino",
  T: "Entregado",
  A: "Cancelado",
};

const estadoColors: Record<EstadoPedido, string> = {
  E: "bg-blue-100 text-blue-800",
  D: "bg-purple-100 text-purple-800",
  P: "bg-yellow-100 text-yellow-800",
  S: "bg-orange-100 text-orange-800",
  C: "bg-indigo-100 text-indigo-800",
  T: "bg-green-100 text-green-800",
  A: "bg-red-100 text-red-800",
};

const transicionesValidas: Record<EstadoPedido, EstadoPedido[]> = {
  E: ["D", "A"],
  D: ["P", "A"],
  P: ["S", "A"],
  S: ["C", "T", "A"],
  C: ["T", "A"],
  T: [],
  A: [],
};

const Pedidos = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { products }: IProductsState = useAppSelector((state: RootState) => state.products);
  const { pedidos, message, code }: any = useAppSelector((state: RootState) => state.pedidos);

  const [page, setPage] = useState(1);
  const [amount] = useState(10);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | "">("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<IPedido | null>(null);
  const [showEtiqueta, setShowEtiqueta] = useState(false);
  const [etiquetaData, setEtiquetaData] = useState<IEtiquetaEnvio | null>(null);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const [enviandoEstado, setEnviandoEstado] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
      return;
    }
    dispatch(resetPedidosAction());
    dispatch(getProducts(0, 0, "", 1, 100, undefined));
    dispatch(fetchPedidos({ page, amount, estadoPedido: estadoFiltro }));
  }, []);

  useEffect(() => {
    printTable(`${title.name}::PEDIDOS`);
  }, []);

  useEffect(() => {
    if (message === "") return;
    if (code === 1) {
      toast.success(message);
      setTimeout(() => dispatch(resetPedidosAction()), 1000);
    }
    if (code === 100) {
      toast.error(message);
      setTimeout(() => dispatch(resetPedidosAction()), 1000);
    }
  }, [message, code]);

  const handleCambiarPagina = (newPage: number) => {
    setPage(newPage);
    dispatch(fetchPedidos({ page: newPage, amount, estadoPedido: estadoFiltro }));
  };

  const handleCambiarFiltro = (nuevoEstado: EstadoPedido | "") => {
    setEstadoFiltro(nuevoEstado);
    setPage(1);
    dispatch(fetchPedidos({ page: 1, amount, estadoPedido: nuevoEstado }));
  };

  const handleAbrirCrear = () => {
    setPedidoSeleccionado(null);
    setIsPickerOpen(true);
  };

  const handleProductosSeleccionados = (seleccionados: any[]) => {
    if (seleccionados.length === 0) return;

    const detalles = seleccionados.map((p) => ({
      productoId: p.productoId,
      cantidad: 1,
      valorUnitario: p.precioVentaConInpuesto || p.precio,
    }));

    const total = detalles.reduce((acc, d) => acc + d.cantidad * d.valorUnitario, 0);

    const payload = {
      sucursalId: 1, // TODO: obtener del contexto del tenant
      total,
      detalles,
    };

    dispatch(crearPedidoAction(payload)).then((result) => {
      if (result) {
        setIsPickerOpen(false);
        setPedidoSeleccionado(result);
        toast.success(`Pedido creado. Token: ${result.token}`);
      }
    });
  };

  const handleVerDetalle = (pedido: IPedido) => {
    setPedidoSeleccionado(pedido);
  };

  const handleImprimirEtiqueta = (pedido: IPedido) => {
    if (pedido.tipoEnvio !== "LOCAL") {
      toast("Para envíos a provincia se imprime la guía del courier", { icon: "ℹ️" });
      return;
    }

    dispatch(fetchEtiquetaEnvioAction(pedido.id)).then((etiqueta: IEtiquetaEnvio | undefined) => {
      if (!etiqueta) return;
      setEtiquetaData(etiqueta);
      setShowEtiqueta(true);
    });
  };

  const handleDescargarEtiquetaPdf = () => {
    if (!etiquetaData) return;

    const doc = new jsPDF({ unit: "mm", format: [100, 150] });
    const marginX = 10;
    const maxWidth = 80;
    let y = 15;

    const writeLine = (text: string, sizePt: number, gap: number) => {
      doc.setFontSize(sizePt);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, marginX, y);
      y += lines.length * gap;
    };

    writeLine("Etiqueta de Envío", 14, 7);
    y += 3;
    writeLine(`Destinatario: ${etiquetaData.nombre}`, 10, 5);
    writeLine(`Teléfono: ${etiquetaData.celular}`, 10, 5);
    writeLine(`Dirección: ${etiquetaData.direccion}`, 10, 5);
    writeLine(`Distrito: ${etiquetaData.distrito}`, 10, 5);

    if (etiquetaData.tipoEnvio === "PROVINCIA" && etiquetaData.codigoSeguimiento) {
      writeLine(`Código Seguimiento: ${etiquetaData.codigoSeguimiento}`, 10, 5);
    }

    y += 3;
    writeLine(`Pedido N° ${etiquetaData.pedidoId}`, 9, 5);
    writeLine(`Fecha: ${new Date().toLocaleDateString("es-PE")}`, 9, 5);

    const slug = (value: string) => value.trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "");
    doc.save(`Etiqueta_${slug(etiquetaData.nombre)}_${slug(etiquetaData.distrito)}.pdf`);
  };

  const handleCambiarEstado = async (pedido: IPedido, nuevoEstado: EstadoPedido) => {
    if (nuevoEstado === "S" && !codigoSeguimiento.trim()) {
      toast.error("Ingresa el código de seguimiento para despachar");
      return;
    }

    setEnviandoEstado(true);
    try {
      await dispatch(actualizarEstadoPedidoAction({
        id: pedido.id,
        estadoPedido: nuevoEstado,
        codigoSeguimiento: nuevoEstado === "S" ? codigoSeguimiento : undefined,
      }));
      setCodigoSeguimiento("");
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar estado");
    } finally {
      setEnviandoEstado(false);
    }
  };

  const getEstadosSiguientes = (estadoActual: EstadoPedido): EstadoPedido[] => {
    return transicionesValidas[estadoActual] || [];
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Pedidos</h1>
        <button className={styles.btnCrear} onClick={handleAbrirCrear}>
          <Icon icon="mdi:plus" className={styles.icon} />
          Nuevo Pedido
        </button>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <div className={styles.filtroGrupo}>
          <label className={styles.label}>Estado:</label>
          <select
            className={styles.select}
            value={estadoFiltro}
            onChange={(e) => handleCambiarFiltro(e.target.value as EstadoPedido | "")}
          >
            <option value="">Todos</option>
            <option value="E">Enviado</option>
            <option value="D">Datos completados</option>
            <option value="P">En preparación</option>
            <option value="S">Despachado</option>
            <option value="C">En camino</option>
            <option value="T">Entregado</option>
            <option value="A">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className={styles.tablaContainer}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>#</th>
              <th>Token</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Tipo Envío</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>No hay pedidos para mostrar</td>
              </tr>
            ) : (
              pedidos.map((pedido: IPedido, idx: number) => (
                <tr key={pedido.id} className={styles.fila}>
                  <td>{idx + 1 + (page - 1) * amount}</td>
                  <td className={styles.token}>{pedido.token.substring(0, 12)}...</td>
                  <td>{pedido.nombre || "Sin nombre"} ({pedido.dni || "Sin DNI"})</td>
                  <td>S/ {pedido.total.toFixed(2)}</td>
                  <td>
                    <span className={`${styles.badge} ${estadoColors[pedido.estadoPedido as EstadoPedido] || ""}`}>
                      {estadoLabels[pedido.estadoPedido as EstadoPedido] || pedido.estadoPedido}
                    </span>
                  </td>
                  <td>{pedido.tipoEnvio || "-"}</td>
                  <td>{pedido.fechaCreacion}</td>
                  <td>
                    <div className={styles.acciones}>
                      <button
                        className={styles.btnAccion}
                        onClick={() => handleVerDetalle(pedido)}
                        title="Ver detalle"
                      >
                        <Icon icon="mdi:eye" />
                      </button>
                      <button
                        className={styles.btnAccion}
                        onClick={() => handleImprimirEtiqueta(pedido)}
                        title="Imprimir etiqueta"
                      >
                        <Icon icon="mdi:printer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {pedidos.length > 0 && (
          <div className={styles.paginacion}>
            <button
              className={styles.btnPagina}
              onClick={() => handleCambiarPagina(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span className={styles.paginaInfo}>
              Página {page} de {Math.ceil((pedidos.length || 0) / amount) || 1}
            </span>
            <button
              className={styles.btnPagina}
              onClick={() => handleCambiarPagina(page + 1)}
              disabled={pedidos.length < amount}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal Product Picker */}
      <ProductoPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleProductosSeleccionados}
        products={products}
      />

      {/* Modal Detalle Pedido */}
      {pedidoSeleccionado && (
        <div className={styles.modalOverlay} onClick={() => setPedidoSeleccionado(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalle del Pedido #{pedidoSeleccionado.id}</h2>
              <button className={styles.btnCerrar} onClick={() => setPedidoSeleccionado(null)}>
                <Icon icon="mdi:close" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Token:</label>
                  <span>{pedidoSeleccionado.token}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Estado:</label>
                  <span className={`${styles.badge} ${estadoColors[pedidoSeleccionado.estadoPedido as EstadoPedido] || ""}`}>
                    {estadoLabels[pedidoSeleccionado.estadoPedido as EstadoPedido] || pedidoSeleccionado.estadoPedido}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Total:</label>
                  <span>S/ {pedidoSeleccionado.total.toFixed(2)}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Tipo Envío:</label>
                  <span>{pedidoSeleccionado.tipoEnvio || "-"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Cliente:</label>
                  <span>{pedidoSeleccionado.nombre || "Sin nombre"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>DNI:</label>
                  <span>{pedidoSeleccionado.dni || "-"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Celular:</label>
                  <span>{pedidoSeleccionado.celular || "-"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Dirección:</label>
                  <span>{pedidoSeleccionado.direccion || "-"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Distrito:</label>
                  <span>{pedidoSeleccionado.ubigeoNombre || "-"}</span>
                </div>
                {pedidoSeleccionado.codigoSeguimiento && (
                  <div className={styles.infoItem}>
                    <label>Código Seguimiento:</label>
                    <span>{pedidoSeleccionado.codigoSeguimiento}</span>
                  </div>
                )}
              </div>

              <div className={styles.detalleSection}>
                <h3>Productos</h3>
                <table className={styles.detalleTabla}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>P. Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidoSeleccionado.pedidoDetalles.map((detalle: IPedidoDetalle) => (
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

              {/* Cambio de estado */}
              <div className={styles.estadoSection}>
                <h3>Cambiar Estado</h3>
                <div className={styles.estadoBotones}>
                  {getEstadosSiguientes(pedidoSeleccionado.estadoPedido as EstadoPedido).map((estado) => (
                    <button
                      key={estado}
                      className={`${styles.btnEstado} ${estadoColors[estado]}`}
                      onClick={() => {
                        if (estado === "S") {
                          // Mostrar input para código de seguimiento
                        }
                        handleCambiarEstado(pedidoSeleccionado!, estado);
                      }}
                      disabled={enviandoEstado}
                    >
                      {estadoLabels[estado]}
                    </button>
                  ))}
                </div>

                {getEstadosSiguientes(pedidoSeleccionado.estadoPedido as EstadoPedido).includes("S") && (
                  <div className={styles.codigoSeguimientoInput}>
                    <input
                      type="text"
                      placeholder="Código de seguimiento (requerido para despachar)"
                      value={codigoSeguimiento}
                      onChange={(e) => setCodigoSeguimiento(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                )}
              </div>

              {/* Link público */}
              <div className={styles.linkSection}>
                <h3>Link Público</h3>
                <div className={styles.linkInput}>
                  <input
                    type="text"
                    value={`${window.location.origin}/pedido/${pedidoSeleccionado.token}`}
                    readOnly
                    className={styles.input}
                  />
                  <button
                    className={styles.btnCopiar}
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/pedido/${pedidoSeleccionado.token}`);
                      toast.success("Link copiado");
                    }}
                  >
                    <Icon icon="mdi:content-copy" />
                    Copiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Etiqueta de Envío */}
      {showEtiqueta && etiquetaData && (
        <div className={styles.modalOverlay} onClick={() => setShowEtiqueta(false)}>
          <div className={`${styles.modal} ${styles.etiquetaModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.etiquetaHeader}>
              <h2>Etiqueta de Envío</h2>
              <div className={styles.etiquetaAcciones}>
                <button className={styles.btnImprimir} onClick={handleDescargarEtiquetaPdf}>
                  <Icon icon="mdi:file-pdf-box" />
                  Descargar PDF
                </button>
                <button className={styles.btnCerrar} onClick={() => setShowEtiqueta(false)}>
                  <Icon icon="mdi:close" />
                </button>
              </div>
            </div>

            <div className={styles.etiquetaContent}>
              <div className={styles.etiquetaRow}>
                <div className={styles.etiquetaCol}>
                  <strong>Destinatario:</strong>
                  <p>{etiquetaData.nombre}</p>
                </div>
                <div className={styles.etiquetaCol}>
                  <strong>Teléfono:</strong>
                  <p>{etiquetaData.celular}</p>
                </div>
              </div>

              <div className={styles.etiquetaRow}>
                <div className={styles.etiquetaCol}>
                  <strong>Dirección:</strong>
                  <p>{etiquetaData.direccion}</p>
                </div>
                <div className={styles.etiquetaCol}>
                  <strong>Distrito:</strong>
                  <p>{etiquetaData.distrito}</p>
                </div>
              </div>

              {etiquetaData.tipoEnvio === "PROVINCIA" && etiquetaData.codigoSeguimiento && (
                <div className={styles.etiquetaRow}>
                  <div className={styles.etiquetaCol}>
                    <strong>Código Seguimiento:</strong>
                    <p className={styles.codigoSeguimiento}>{etiquetaData.codigoSeguimiento}</p>
                  </div>
                </div>
              )}

              <div className={styles.etiquetaFooter}>
                <p>Pedido N° {etiquetaData.pedidoId}</p>
                <p>Fecha: {new Date().toLocaleDateString("es-PE")}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;