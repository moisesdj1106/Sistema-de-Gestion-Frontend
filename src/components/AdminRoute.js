import { Navigate } from 'react-router-dom'
import Forbidden from '../views/pages/Forbidden'

const AdminRoute = ({ children }) => {
  const usuario = localStorage.getItem('usuario')
  const rol = localStorage.getItem('rol')
  if (!usuario) return <Navigate to="/login" />
  if (rol !== 'admin') return <Forbidden />
  return children
}

export default AdminRoute