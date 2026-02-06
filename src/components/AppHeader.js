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
  const videoUrl = role === 'admin' ? '/videos/videomanual.mp4' : '/videos/videomanual.mp4'

  const markers = [
    { time: 5, label: 'Introducción' },
    { time: 87, label: 'Modulo Noticias' },
    { time: 205, label: 'Modulo afectación' },
    { time: 261, label: 'Damnificado' },
    { time: 328, label: 'Victima' },
    { time: 350, label: 'Pérdidas' },
    { time: 377, label: 'Afectado' },
    { time: 400, label: 'Zonas de riesgo' },
    { time: 414, label: 'Dashboard' },
  ];

  const jumpToMarker = (time) => {
    const video = document.getElementById('help-video');
    if (video) {
      video.currentTime = time;
      video.play();
    }
  };

  return (
    <>
      {showHelp && !isMinimized && (
        <CModal visible={showHelp} onClose={() => setShowHelp(false)}>
          <CModalHeader>
            <CModalTitle>Ayuda</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <video id="help-video" controls width="100%" style={{ borderRadius: '8px' }}>
              <source src={videoUrl} type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>

            <div style={{ marginTop: '10px' }}>
              <h4>Atajos:</h4>
              <p style={{textAlign:'justify'}}>Si buscas una parte en especifico del sistema, utiliza un atajo para adelantar el tutorial, si es tu primera vez acá te recomiendo ver todo el tutorial</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                {markers.map((marker, index) => (
                  <button 
                    key={index}
                    onClick={() => jumpToMarker(marker.time)}
                    style={{
                      backgroundColor: '#007BFF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '10px 15px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      transition: 'background-color 0.3s ease',
                      flex: '1 1 calc(50% - 10px)', // Dos botones por fila
                      textAlign: 'center'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#007BFF'}
                  >
                    {marker.label} ({marker.time}s)
                  </button>
                ))}
              </div>
              
            </div>
          </CModalBody>
          <CModalFooter>
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {role === 'admin' ? (
                <a href="/manualadmin.pdf" download style={{ textDecoration: 'none' }}>
                  <CButton color="primary" style={{ backgroundColor: '#ff7043', borderColor: '#ff7043' }}>
                    Descargar manual (Admin)
                  </CButton>
                </a>
              ) : (
                <a href="/manualusuario.pdf" download style={{ textDecoration: 'none' }}>
                  <CButton color="primary" style={{ backgroundColor: '#ff7043', borderColor: '#ff7043' }}>
                    Descargar manual (Usuario)
                  </CButton>
                </a>
              )}
            </div>
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
          <video id="help-video" controls width="100%" style={{ borderRadius: '0 0 8px 8px' }}>
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