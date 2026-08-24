import { RootState } from "../../redux/rootState";
import { useAppSelector } from "../../redux/store";
import Loading from "../Loading";
import './styles.css'

const Alert = () => {

   const {
      // errors,
      // message,
      loading,
      // type
   } = useAppSelector((state: RootState) => state.alert)

   return (
      <div>
         {loading && <Loading />}
         {/* {errors && <Toast title="Error" message={errors} type={type} />}
         {message && <Toast title={type === "success" ? "Buen trabajo" : type === "notification" ? "Notificacion" : "Error"} message={message} type={type} />} */}
      </div>
   )
}

export default Alert;
