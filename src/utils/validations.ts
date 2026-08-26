export const onlyNumbers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const regex = /^[0-9\b]+$/; // Expresión regular que solo permite números
    if (event.target.value === "" || regex.test(event.target.value)) {
        return event.target.value
    }
}

export interface ITipoDocumentoRule {
    label: string;
    minLength: number;
    maxLength: number;
    onlyNumbers: boolean;
}

// Longitudes y validación según el Catálogo N° 06 (Tipo de Documento de Identidad) de SUNAT.
export const TIPO_DOCUMENTO_RULES: Record<number, ITipoDocumentoRule> = {
    1: { label: "DNI", minLength: 8, maxLength: 8, onlyNumbers: true },
    2: { label: "Pasaporte", minLength: 1, maxLength: 12, onlyNumbers: false },
    3: { label: "Carnet de Extranjeria", minLength: 1, maxLength: 12, onlyNumbers: false },
    4: { label: "Libre", minLength: 0, maxLength: 150, onlyNumbers: false },
    5: { label: "RUC", minLength: 11, maxLength: 11, onlyNumbers: true },
    6: { label: "Partida de Nacimiento", minLength: 1, maxLength: 15, onlyNumbers: false },
};

export const getNumeroDocumentoError = (tipoDocumentoId: number, numero: string): string | null => {
    const value = (numero ?? "").trim();
    const rule = TIPO_DOCUMENTO_RULES[tipoDocumentoId];
    if (!rule) return null;
    if (value === "") return "El número de documento es obligatorio";
    if (rule.onlyNumbers && !/^\d+$/.test(value)) return `El ${rule.label} solo puede contener números`;
    if (value.length < rule.minLength) return `El ${rule.label} debe tener ${rule.minLength} dígitos`;
    if (value.length > rule.maxLength) return `El ${rule.label} debe tener máximo ${rule.maxLength} caracteres`;
    return null;
}

export const validateEmail = (text: string) => {
    const expresionRegular = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresionRegular.test(text);
}

export const validateDate = (date1: string, date2: string): boolean => {
    const [day1, month1, year1] = date1.split("/");
    const [day2, month2, year2] = date2.split("/");

    const dateObj1 = new Date(`${month1}/${day1}/${year1}`);
    const dateObj2 = new Date(`${month2}/${day2}/${year2}`);

    return dateObj1 > dateObj2;
}

export const formateDate = (date: any) => {
    const fechaString = date;
    const fechaParts = fechaString.split("/");
    const fechaNuevaString = fechaParts[1] + "/" + fechaParts[0] + "/" + fechaParts[2];
    const fecha = new Date(fechaNuevaString);
    const diaSemana = fecha.toLocaleString("en-US", { weekday: "short" });
    const mes = fecha.toLocaleString("en-US", { month: "short" });
    const diaMes = fecha.getDate();
    const ano = fecha.getFullYear();
    const fechaFormateada = diaSemana + " " + mes + " " + diaMes + " " + ano + " 00:00:00 GMT-0500 (hora estándar de Perú)";
    const dateFormat = new Date(fechaFormateada)
    return dateFormat
}