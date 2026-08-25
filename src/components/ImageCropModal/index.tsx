import { useRef, useState } from "react";
import Modal from "react-modal";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@tremor/react";
import styles from "./imageCropModal.module.css";

interface IImageCropModal {
  archivo: File;
  onCropped: (archivoRecortado: File) => void;
  onCancel: () => void;
}

const customStyles = {};

async function recortarImagen(imagen: HTMLImageElement, crop: PixelCrop, nombreArchivo: string): Promise<File> {
  const escalaX = imagen.naturalWidth / imagen.width;
  const escalaY = imagen.naturalHeight / imagen.height;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width * escalaX);
  canvas.height = Math.round(crop.height * escalaY);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo preparar el recorte de la imagen.");

  ctx.drawImage(
    imagen,
    crop.x * escalaX,
    crop.y * escalaY,
    crop.width * escalaX,
    crop.height * escalaY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar la imagen recortada."));
        return;
      }
      resolve(new File([blob], nombreArchivo, { type: blob.type }));
    }, "image/jpeg", 0.92);
  });
}

export const ImageCropModal = ({ archivo, onCropped, onCancel }: IImageCropModal) => {
  const [imagenSrc] = useState(() => URL.createObjectURL(archivo));
  const [crop, setCrop] = useState<Crop>({ unit: "%", x: 10, y: 10, width: 80, height: 80 });
  const [crocCompleto, setCropCompleto] = useState<PixelCrop | null>(null);
  const [procesando, setProcesando] = useState(false);
  const imagenRef = useRef<HTMLImageElement | null>(null);

  const confirmarRecorte = async () => {
    if (!imagenRef.current || !crocCompleto || crocCompleto.width === 0 || crocCompleto.height === 0) return;

    setProcesando(true);
    try {
      const archivoRecortado = await recortarImagen(imagenRef.current, crocCompleto, archivo.name);
      onCropped(archivoRecortado);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Modal
      isOpen
      style={customStyles}
      className={styles.container}
      overlayClassName="modal-fondo"
      onRequestClose={onCancel}
    >
      <div className={styles.content}>
        <h3>Recorta la imagen</h3>
        <p className={styles.hint}>Arrastra los bordes para ajustar el área a recortar.</p>

        <div className={styles.cropWrapper}>
          <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCropCompleto(c)}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img ref={imagenRef} src={imagenSrc} onLoad={() => URL.revokeObjectURL(imagenSrc)} />
          </ReactCrop>
        </div>

        <div className={styles.buttons}>
          <Button size="sm" onClick={onCancel} disabled={procesando}>
            Cancelar
          </Button>
          <Button size="sm" onClick={confirmarRecorte} disabled={procesando}>
            {procesando ? "Procesando..." : "Confirmar recorte"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
