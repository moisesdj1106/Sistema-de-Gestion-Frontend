import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMenu,
  cilMoon,
  cilSun,
  cilAccountLogout,
  cilInfo,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

const HelpButton = () => {
  const [showHelp, setShowHelp] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Obtener el rol desde el localStorage
  const role = localStorage.getItem('rol')

  // Seleccionar el video según el rol
  const videoUrl = role === 'admin' ? '/videos/usuario.mp4' : '/videos/usuario.mp4'

  return (
    <>
      {showHelp && !isMinimized && (
        <CModal visible={showHelp} onClose={() => setShowHelp(false)}>
          <CModalHeader>
            <CModalTitle>Ayuda</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <video controls width="100%" style={{ borderRadius: '8px' }}>
              <source src={videoUrl} type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>
          </CModalBody>
          <CModalFooter>
            <CButton style={{ backgroundColor: 'white', color: 'blue', borderColor: 'blue' }} onClick={() => setIsMinimized(true)}>
              Minimizar
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {isMinimized && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '300px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            overflow: 'hidden',
            zIndex: 1050,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              backgroundColor: '#f7f7f7',
              borderBottom: '1px solid #ddd',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>Ayuda</span>
            <div>
              <CButton
                size="sm"
                style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }}
                onClick={() => {
                  setShowHelp(false)
                  setIsMinimized(false)
                }}
              >
                Cerrar
              </CButton>
            </div>
          </div>
          <video controls width="100%" style={{ borderRadius: '0 0 8px 8px' }}>
            <source src={videoUrl} type="video/mp4" />
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>
      )}

      <CNavItem>
        <CNavLink
          href="#"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowHelp(true)}
          title="Ayuda del sistema"
        >
          <CIcon icon={cilInfo} size="lg" style={{ color: 'blue' }} />
        </CNavLink>
      </CNavItem>
    </>
  )
}

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])


   const usuario = localStorage.getItem('usuario')
 
   const handleLogout = () => {
     localStorage.clear()
     localStorage.removeItem('usuario')
     navigate('/login')
   }
 
   const handleLogin = () => {
     navigate('/login')
   }

  return (
    <CHeader position="sticky" className="mb-4 p-0 " ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <div className="text-secondary " style={{ fontStyle: 'italic', fontSize: 15 }}>
          <span>"Plataforma para la gestion de Afectaciones Naturales"</span>
        </div>
        <CHeaderNav className="ms-auto" style={{ gap: 12 }}>
          <CNavItem>
            <CNavLink
              href="#"
              style={{ cursor: 'pointer' }}
              onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}
              title="Cambiar modo claro/oscuro"
            >
              <CIcon icon={colorMode === 'dark' ? cilSun : cilMoon} size="lg" />
            </CNavLink>
          </CNavItem>
          <HelpButton />
          <CNavItem>
            {usuario ? (
              <CButton color="danger" variant="outline" onClick={handleLogout}>
                <CIcon icon={cilAccountLogout} className="me-2" />
                Cerrar sesión
              </CButton>
            ) : (
              <CButton color="primary" variant="outline" onClick={handleLogin}>
                <CIcon icon={cilAccountLogout} className="me-2" />
                Iniciar sesión
              </CButton>
            )}
          </CNavItem>
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        {/* Puedes agregar más contenido aquí si lo necesitas */}
      </CContainer>
    </CHeader>
  )
}

export default AppHeader