
import { useEffect } from 'react'
import { getToken } from './helpers/auth-helpers'
import { store, useAppDispatch, useAppSelector } from './redux/store'
import { auhMe } from './redux/reducers/auth/auth.reducer'
import { Provider } from 'react-redux';
import { Dashboard } from './infraestructure/Dashboard'
import { QueryClient, QueryClientProvider } from 'react-query';
import Alert from './components/Alert';
import { getTenantEmpresa } from './redux/reducers/Admin/my-business/myBusiness.reducer';
import { RootState } from './redux/rootState';
import { IAuthState } from './redux/reducers/auth/interfaces';

function App() {
  /* q */
  const { me }: IAuthState = useAppSelector(
    (state: RootState) => state.auth
  );
  const queryClient = new QueryClient();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!getToken()) {
      return
    }
    dispatch(auhMe());
  }, [])
  useEffect(() => {
    if (me) {
      dispatch(getTenantEmpresa(me?.empresa));
    }

  }, [dispatch, me])

  return (

    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Alert />
        <Dashboard />
      </QueryClientProvider>
    </Provider>
  )
}

export default App
