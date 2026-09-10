import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./clienteLogin.module.css";
import axiosInstance from "../../../../utils/axios";

const ClienteLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Completa todos los campos");
      return;
    }

    setEnviando(true);
    try {
      const { data }: any = await axiosInstance.post("/cliente/auth/login", { email, password });
      localStorage.setItem("clienteToken", data.token);
      localStorage.setItem("clienteId", data.clienteId.toString());
      toast.success("Login exitoso");
      navigate("/mi-cuenta/pedidos");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Credenciales inválidas");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      <div className={styles.card}>
        <div className={styles.header}>
          <Icon icon="mdi:account-circle" className={styles.icon} />
          <h1>Mi Cuenta</h1>
          <p>Inicia sesión para ver tus pedidos</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tudni@puntosventa.local"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

<button type="submit" className={styles.btnSubmit} disabled={enviando}>
            {enviando ? (
              <>
                <Icon icon="mdi:loading" className={styles.spinIcon} /> Iniciando sesi��n...
              </>
            ) : (
              "Iniciar Sesi��n"
            )}
          </button>
        </form>

        <div className={styles.help}>
          <p>¿No tienes contraseña?</p>
          <p>La recibiste por WhatsApp al completar tu pedido.</p>
          <p>Si no la tienes, contacta al negocio para reenviarla.</p>
        </div>
      </div>
    </div>
  );
};

export default ClienteLogin;