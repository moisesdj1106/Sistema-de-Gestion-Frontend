import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import logo1 from 'src/assets/images/logodesastres.jpg'
import getNav from '../_nav'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CButton,
} from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import { useNavigate } from 'react-router-dom'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const nav = getNav()
   const logoSize = unfoldable ? { height: 60, width: 60 } : { height: 155, width: 160 }
  const logoStyle = { 
              borderRadius: '100%',
              objectFit: 'cover',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'block',
              margin: '0 25px',
              transition: 'all 0.3s',
              ...logoSize
  }
  const navigate = useNavigate()
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
    <CSidebar
      className="border-end"
      style={{ background: '#FF7043' }}
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom" style={{ background: '#FF7043' }}>
        <CSidebarBrand
          to="/"
          className="logo1 d-flex justify-content-center align-items-center"
          style={{ height: 140 }}
        >
          <img
            src={logo1}
            alt="Logo"
            style={logoStyle}
          />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={nav} />
      <CSidebarFooter className="border-top d-flex flex-column align-items-center" style={{ background: '#FF7043' }}>
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
        
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)