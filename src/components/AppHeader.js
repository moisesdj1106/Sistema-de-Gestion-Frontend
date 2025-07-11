import React, { useEffect, useRef } from 'react'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMenu,
  cilMoon,
  cilSun,
  cilAccountLogout,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

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
          <span>"Plataforma para la gestion de Desastres Naturales"</span>
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