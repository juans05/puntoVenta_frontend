import { useEffect } from "react";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import styles from "./formasPago.module.css";
import { Button } from "@tremor/react";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";
export const FormasPago = () => {
  useEffect(() => {
    printTable(`${title.name}::FORMAS DE PAGO`);
  }, []);
  const dataFormaPago = [
    {
      id: 1,
      title: "Efectivo",
      textoAlternativo: "Efectivo",
      img: "https://static.vecteezy.com/system/resources/previews/002/393/119/non_2x/wallet-with-money-dollars-and-coins-cirrensy-cash-shopping-finance-money-wealth-concept-stock-illustration-isolated-on-white-background-in-cartoon-flat-style-vector.jpg",
      estado: "Activo",
    },
    {
      id: 2,
      title: "Visa",
      textoAlternativo: "Visa",
      img: "https://logotipoz.com/wp-content/uploads/2023/01/Visa_Inc._logo.png",
      estado: "Activo",
    },
    {
      id: 1,
      title: "Mastercard",
      textoAlternativo: "Mastercard",
      img: "https://1000marcas.net/wp-content/uploads/2019/12/logo-Mastercard.png",
      estado: "Activo",
    },
    {
      id: 1,
      title: "Gift Card",
      textoAlternativo: "Gift Card",
      img: "https://www.deepcreekgc.com/wp-content/uploads/2021/04/giftcard.png",
      estado: "Activo",
    },
    {
      id: 1,
      title: "Yape",
      textoAlternativo: "Yape",
      img: "https://play-lh.googleusercontent.com/y5S3ZIz-ohg3FirlISnk3ca2yQ6cd825OpA0YK9qklc5W8MLSe0NEIEqoV-pZDvO0A8",
      estado: "Activo",
    },
    {
      id: 1,
      title: "Plin",
      textoAlternativo: "Plin",
      img: "https://logosenvector.com/logo/img/plin-interbank-4391.jpg",
      estado: "Activo",
    },
  ];

  return (
    <div>
      <div className={styles.encabezado}>
        <div className={styles.text}>
          <h3>Formas de pago</h3>
          <span>Lista de formas de pago</span>
        </div>
        <div className={styles["btn-add"]}>
          <Button
            icon={CreditCardIcon}
            size="sm"
            variant="secondary"
            onClick={() => console.log("clicked")}
          >
            Nueva Forma de Pago
          </Button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.items}>
          {dataFormaPago?.map((value) => {
            return (
              <div className={styles.item} /* onClick={()=>onClick(data)} */>
                <div className={styles.dots}>
                  <Icon icon="pepicons-pop:dots-x" />
                </div>
                <img src={value?.img} alt={value?.textoAlternativo} />

                <p>{value?.title}</p>
                <span>{value?.estado}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
