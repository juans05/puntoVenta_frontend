// Icono "?" con tooltip nativo (title): explica que es un campo, para que sirve y su
// validacion. Sin librerias nuevas -- el navegador ya sabe mostrar el title al pasar el mouse.
export const Ayuda = ({ texto }: { texto: string }) => (
  <span
    title={texto}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 15,
      height: 15,
      borderRadius: "50%",
      background: "#e5e7eb",
      color: "#4b5563",
      fontSize: 10,
      fontWeight: 700,
      marginLeft: 5,
      cursor: "help",
      flexShrink: 0,
      userSelect: "none",
    }}
  >
    ?
  </span>
);
