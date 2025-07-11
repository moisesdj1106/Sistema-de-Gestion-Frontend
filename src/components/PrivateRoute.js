import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
  const usuario = localStorage.getItem('usuario')
  return usuario ? children : <Navigate to="/login" />
}

export default PrivateRoute