import Modal from "react-modal";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./nuevaFactura.module.css";
import axiosInstance from "../../../../utils/axios";

Modal.setAppElement("#root");

const POR_PAGINA = 10;

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSeleccionar: (cliente: any) => void;
  documentoInicial?: string;
  // Reutilizado en Compras para proveedores: otro titulo y endpoint con los mismos filtros Nombre/NumeroDocumento.
  titulo?: string;
  endpoint?: string;
}

// Popup con todos los clientes de la empresa (el backend ya filtra por tenant/sucursal),
// filtrable por nombre y numero de documento y paginado en el servidor.
export const ClientePickerModal = ({ isOpen, onClose, onSeleccionar, documentoInicial = "", titulo = "Buscar cliente", endpoint = "/clientes/listar" }: IProps) => {
  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [pagina, setPagina] = useState(1);
  const [clientes, setClientes] = useState<any[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNombre("");
    setDocumento(documentoInicial);
    setPagina(1);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // Espera a que el usuario deje de escribir antes de consultar.
    const timer = setTimeout(async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams({ Page: String(pagina), Amount: String(POR_PAGINA) });
        if (nombre.trim()) params.set("Nombre", nombre.trim());
        if (documento.trim()) params.set("NumeroDocumento", documento.trim());
        const { data }: any = await axiosInstance.get(`${endpoint}?${params}`);
        setClientes(data?.data?.items ?? []);
        setTotalPaginas(Math.max(1, data?.data?.pages ?? 1));
      } catch {
        // 404 = sin coincidencias
        setClientes([]);
        setTotalPaginas(1);
      } finally {
        setCargando(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, nombre, documento, pagina]);

  const cambiarFiltro = (setter: (v: string) => void) => (valor: string) => {
    setter(valor);
    setPagina(1);
  };

  const elegir = (c: any) => {
    onSeleccionar(c);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      closeTimeoutMS={200}
      className={`${styles.pickerPanel} ${styles.pickerPanelWide}`}
      overlayClassName={styles.overlay}
    >
      <div className={styles.pickerHeader}>
        <h3>{titulo}</h3>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          <Icon icon="mdi:close" width={20} />
        </button>
      </div>

      <div className={styles.pickerFiltros}>
        <div className={styles.pickerSearch}>
          <Icon icon="mdi:account-outline" width={20} />
          <input
            autoFocus
            type="text"
            placeholder="Nombre / Razón social"
            value={nombre}
            onChange={(e) => cambiarFiltro(setNombre)(e.target.value)}
          />
        </div>
        <div className={styles.pickerSearch}>
          <Icon icon="mdi:card-account-details-outline" width={20} />
          <input
            type="text"
            placeholder="RUC / DNI"
            value={documento}
            onChange={(e) => cambiarFiltro(setDocumento)(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
          />
        </div>
      </div>

      <div className={styles.pickerList}>
        {cargando ? (
          <p className={styles.pickerEmpty}>Buscando...</p>
        ) : clientes.length === 0 ? (
          <p className={styles.pickerEmpty}>No se encontraron resultados.</p>
        ) : (
          clientes.map((c) => (
            <div key={c.id ?? c.proveedorId} className={styles.pickerRow} onClick={() => elegir(c)}>
              <Icon icon="mdi:account-circle-outline" width={22} />
              <div className={styles.pickerRowInfo}>
                <span className={styles.pickerRowNombre}>{c.nombre}</span>
                <span className={styles.pickerRowMeta}>
                  {c.numeroDocumento || c.ruc || "Sin documento"}
                  {(c.direccion ?? c.dirección) ? ` · ${c.direccion ?? c.dirección}` : ""}
                </span>
              </div>
              <Icon icon="mdi:chevron-right" width={20} />
            </div>
          ))
        )}
      </div>

      <div className={styles.pickerFooter} style={{ justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          className={styles.cancel}
          disabled={pagina <= 1 || cargando}
          onClick={() => setPagina((p) => p - 1)}
        >
          Anterior
        </button>
        <span className={styles.pickerRowMeta}>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          type="button"
          className={styles.cancel}
          disabled={pagina >= totalPaginas || cargando}
          onClick={() => setPagina((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </Modal>
  );
};
