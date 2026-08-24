import { createStore, combineReducers, applyMiddleware, compose } from 'redux'; //crea el store
import thunk from 'redux-thunk';
import { productoReducer } from '../reducers/Admin/productos/producto.reducer';






//@ts-ignore
const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;



const reducers = combineReducers({

  producto:productoReducer
});


  export const store = createStore(
    reducers,
    composeEnhancers(
        applyMiddleware(thunk)
    )
); 
