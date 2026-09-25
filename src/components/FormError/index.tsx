import { useState } from "react";

// Patron unico de validacion por campo para todos los formularios: un objeto {campo: mensaje},
// un input en rojo cuando tiene error y un texto chico debajo con el motivo. Sin librerias nuevas.
export type FormErrors = Record<string, string>;

export const useFormErrors = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const setError = (campo: string, mensaje: string) =>
    setErrors((prev) => ({ ...prev, [campo]: mensaje }));

  const clearError = (campo: string) =>
    setErrors((prev) => {
      if (!(campo in prev)) return prev;
      const { [campo]: _, ...resto } = prev;
      return resto;
    });

  const limpiarErrores = () => setErrors({});

  return { errors, setErrors, setError, clearError, limpiarErrores };
};

// Estilo del borde rojo para mezclar en el input/select/textarea con error: style={estiloError(!!errors.x)}
export const estiloError = (tieneError?: boolean): React.CSSProperties =>
  tieneError ? { borderColor: "#F24B89", boxShadow: "0 0 0 1px #F24B89" } : {};

// Texto rojo chico con el motivo, debajo del campo.
export const CampoError = ({ mensaje }: { mensaje?: string }) => {
  if (!mensaje) return null;
  return (
    <span style={{ display: "block", color: "#F24B89", fontSize: 12, marginTop: 4 }}>
      {mensaje}
    </span>
  );
};
