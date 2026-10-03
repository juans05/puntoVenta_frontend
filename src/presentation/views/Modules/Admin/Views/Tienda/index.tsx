import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import { useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import { TiendaVista } from "../../../../Public/Tienda/TiendaPublica";

const CONFIG_INICIAL = {
  publicada: false, titulo: "Mi tienda", descripcion: "", logoUrl: "", bannerUrl: "", whatsapp: "",
  colorPrimario: "#4f46e5", colorFondo: "#ffffff", colorTexto: "#111827",
};

const MUESTRA = [
  { id: 1, nombre: "Producto de ejemplo", precio: 25, categoria: "General", agotado: false },
  { id: 2, nombre: "Otro producto", precio: 40.5, categoria: "General", agotado: false },
  { id: 3, nombre: "Producto agotado", precio: 10, categoria: "Ofertas", agotado: true },
];

export const Tienda = () => {
  const { me }: any = useAppSelector((state: RootState) => state.auth);
  const [config, setConfig] = useState<any>(CONFIG_INICIAL);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    axiosInstance.get("/tienda/config").then((r: any) => setConfig({ ...CONFIG_INICIAL, ...r.data }))
      .catch(() => toast.error("No se pudo cargar la configuración de la tienda"));
  }, []);

  const set = (campo: string, valor: any) => setConfig((c: any) => ({ ...c, [campo]: valor }));
  const url = `${window.location.origin}/tienda/${me?.empresa ?? ""}`;

  const guardar = async () => {
    setGuardando(true);
    try {
      await axiosInstance.put("/tienda/config", config);
      toast.success("Tienda guardada");
    } catch (error: any) {
      toast.error(error?.response?.data ?? "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const inp = "w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm mt-0.5";
  const lbl = "text-xs font-semibold text-gray-500 block mt-3";
  const color = (campo: string, etiqueta: string) => (
    <div>
      <label className={lbl}>{etiqueta}</label>
      <div className="flex gap-2 items-center">
        <input type="color" value={config[campo]} onChange={(e) => set(campo, e.target.value)} className="h-9 w-12 p-0 border rounded" />
        <input className={inp} value={config[campo]} onChange={(e) => set(campo, e.target.value)} />
      </div>
    </div>
  );

  return (
    <div className="p-6 grid md:grid-cols-[360px_1fr] gap-6">
      <div>
        <h1 className="text-xl font-bold mb-2">Mi tienda web</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={config.publicada} onChange={(e) => set("publicada", e.target.checked)} /> Tienda publicada
        </label>
        <p className="text-xs text-gray-500 mt-1 break-all">
          Enlace: <a className="text-indigo-600 underline" href={url} target="_blank" rel="noreferrer">{url}</a>
        </p>

        <label className={lbl}>Título</label>
        <input className={inp} value={config.titulo} onChange={(e) => set("titulo", e.target.value)} />
        <label className={lbl}>Descripción</label>
        <input className={inp} value={config.descripcion ?? ""} onChange={(e) => set("descripcion", e.target.value)} />
        <label className={lbl}>URL del logo</label>
        <input className={inp} value={config.logoUrl ?? ""} onChange={(e) => set("logoUrl", e.target.value)} />
        <label className={lbl}>URL del banner</label>
        <input className={inp} value={config.bannerUrl ?? ""} onChange={(e) => set("bannerUrl", e.target.value)} />
        <label className={lbl}>WhatsApp (con código de país)</label>
        <input className={inp} placeholder="51999999999" value={config.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} />
        {color("colorPrimario", "Color principal")}
        {color("colorFondo", "Color de fondo")}
        {color("colorTexto", "Color del texto")}

        <button disabled={guardando} onClick={guardar}
          className="mt-4 bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50">
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Vista previa (con productos de ejemplo)</p>
        <div className="border rounded-xl overflow-hidden"><TiendaVista config={config} productos={MUESTRA} /></div>
      </div>
    </div>
  );
};
