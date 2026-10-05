import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import { useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import { TiendaVista } from "../../../../Public/Tienda/TiendaPublica";

const CONFIG_INICIAL = {
  publicada: false, titulo: "Mi tienda", descripcion: "", logoUrl: "", bannerUrl: "", whatsapp: "",
  colorPrimario: "#4f46e5", colorFondo: "#ffffff", colorTexto: "#111827",
};

// Limites por imagen: el logo se muestra en 48px (basta algo liviano); el banner ocupa todo el ancho.
const LIMITES: Record<string, { etiqueta: string; maxMb: number; minAncho: number; minAlto: number; maxLado: number }> = {
  logoUrl: { etiqueta: "El logo", maxMb: 1, minAncho: 100, minAlto: 100, maxLado: 2000 },
  bannerUrl: { etiqueta: "El banner", maxMb: 3, minAncho: 1000, minAlto: 200, maxLado: 4000 },
};
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

const dimensiones = (archivo: File) => new Promise<{ w: number; h: number }>((ok, fail) => {
  const url = URL.createObjectURL(archivo);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); ok({ w: img.width, h: img.height }); };
  img.onerror = () => { URL.revokeObjectURL(url); fail(); };
  img.src = url;
});

const MUESTRA = [
  { id: 1, nombre: "Producto de ejemplo", precio: 25, categoria: "General", agotado: false },
  { id: 2, nombre: "Otro producto", precio: 40.5, categoria: "General", agotado: false },
];

export const Tienda = () => {
  const { me }: any = useAppSelector((state: RootState) => state.auth);
  const [config, setConfig] = useState<any>(CONFIG_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState("");

  useEffect(() => {
    axiosInstance.get("/tienda/config").then((r: any) => setConfig({ ...CONFIG_INICIAL, ...r.data }))
      .catch(() => toast.error("No se pudo cargar la configuración de la tienda"));
  }, []);

  const set = (campo: string, valor: any) => setConfig((c: any) => ({ ...c, [campo]: valor }));
  const url = `${window.location.origin}/tienda/${me?.empresa ?? ""}`;

  // Misma subida sin firma a Cloudinary que components/Image: devuelve la URL que ya guarda el backend.
  const subirImagen = async (campo: string, archivo?: File) => {
    if (!archivo) return;
    const l = LIMITES[campo];
    if (!TIPOS.includes(archivo.type)) return void toast.error(`${l.etiqueta} debe ser JPG, PNG o WebP`);
    if (archivo.size > l.maxMb * 1024 * 1024) return void toast.error(`${l.etiqueta} no puede superar ${l.maxMb} MB (el archivo pesa ${(archivo.size / 1048576).toFixed(1)} MB)`);
    setSubiendo(campo);
    try {
      const { w, h } = await dimensiones(archivo).catch(() => ({ w: 0, h: 0 }));
      if (!w) return void toast.error(`${l.etiqueta}: el archivo no es una imagen válida`);
      if (w < l.minAncho || h < l.minAlto) return void toast.error(`${l.etiqueta} debe medir al menos ${l.minAncho}x${l.minAlto} px (mide ${w}x${h})`);
      if (w > l.maxLado || h > l.maxLado) return void toast.error(`${l.etiqueta} no puede superar ${l.maxLado} px por lado (mide ${w}x${h})`);
      const form = new FormData();
      form.append("file", archivo);
      form.append("upload_preset", "4devs-images");
      const r = await fetch("https://api.cloudinary.com/v1_1/devs4/upload", { method: "POST", body: form });
      if (!r.ok) throw new Error();
      set(campo, (await r.json()).secure_url);
    } catch {
      toast.error("No se pudo subir la imagen");
    } finally {
      setSubiendo("");
    }
  };

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
  const imagen = (campo: string, etiqueta: string) => (
    <div>
      <label className={lbl}>{etiqueta}</label>
      <input className={inp} placeholder="Pega una URL o sube un archivo" value={config[campo] ?? ""} onChange={(e) => set(campo, e.target.value)} />
      <label className="inline-block mt-1 text-xs text-indigo-600 cursor-pointer">
        {subiendo === campo ? "Subiendo..." : "Subir imagen"}
        <input type="file" accept={TIPOS.join(",")} hidden disabled={!!subiendo} onChange={(e) => { subirImagen(campo, e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      <p className="text-[11px] text-gray-400">JPG, PNG o WebP · máx. {LIMITES[campo].maxMb} MB · mín. {LIMITES[campo].minAncho}x{LIMITES[campo].minAlto} px</p>
      {config[campo] && <button type="button" className="ml-3 text-xs text-gray-500" onClick={() => set(campo, "")}>Quitar</button>}
    </div>
  );
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
      <Toaster richColors position="top-right" />
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
        {imagen("logoUrl", "Logo")}
        {imagen("bannerUrl", "Banner")}
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
