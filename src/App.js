import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { CSpinner, useColorModes } from '@coreui/react'
import RestablecerContrasena from "src/components/RestablecerContrasena.js";
import SolicitarRecuperacion from './views/pages/school/contraseña.jsx';
import './scss/style.scss'
import './scss/examples.scss'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  useEffect(() => {
    setColorMode('light')
  }, [setColorMode])

  // Cierre de sesión automático por inactividad (1 minuto)
  useEffect(() => {
    let timeout
    const logout = () => {
      localStorage.clear()
      window.location.href = '/login'
    }
    const resetTimer = () => {
      clearTimeout(timeout)
      timeout = setTimeout(logout, 300 * 1000) // 1 minuto
    }
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
    resetTimer()
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
    }
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="pt-3 text-center"><CSpinner color="primary" variant="grow" /></div>}>
        <Routes>
          {/* Redirección automática al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />
          <Route path="/restablecer/:token" element={<RestablecerContrasena />} />
          <Route path="/contraseña" element={<SolicitarRecuperacion />} />
         

          {/* Rutas privadas: todo lo demás va dentro del layout */}
          <Route path="*" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App