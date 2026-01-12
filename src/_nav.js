import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilBullhorn,
  cilHome,
  cilBuilding,
  cilRain,
  cilList,
  cilGift,
  cilHeart,
  cilHospital,
  cilGlobeAlt,
  cilMap,
  cilDisabled,
  cilMedicalCross,
  cilSofa,
  cilArrowThickBottom,
  cilChevronBottom,
  cilShareBoxed,
  cilPrint
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

export default function getNav() {
  const rol = localStorage.getItem('rol') || 'usuario'
  return [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      badge: {
        color: 'info',
      },
    },
    {
      component: CNavTitle,
      name: 'GESTIÓN',
    },

    ...(rol === 'admin'
      ? [
        
        
        {
          component: CNavItem,
          name: 'Inicio',
          to: '/docents',
          icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
        },
        
        {
          component: CNavItem,
          name: 'Movimientos de tierra',
          to: '/prueba',
          icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Desbordamientos de Rios',
          to: '/desbordes',
          icon: <CIcon icon={cilRain} customClassName="nav-icon" />,
        },
        {
          component: CNavGroup,
          name: 'Registrar',
          icon: <CIcon icon={cilChevronBottom} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Comunidad',
              to: '/comunidad',
              icon: <CIcon icon={cilGlobeAlt} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Noticias',
              to: '/noticias',
              icon: <CIcon icon={cilBullhorn} customClassName="nav-icon" />,
            },
           
            
          ],
        },
        {
          component: CNavGroup,
          name: 'Afectaciones',
          icon: <CIcon icon={cilChevronBottom} customClassName="nav-icon" />,
          items: [
            {
          component: CNavItem,
          name: 'Nueva',
          to: '/afectaciones',
          icon: <CIcon icon={cilHospital} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Damnificados',
          to: '/damnificados',
          icon: <CIcon icon={cilDisabled} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Victimas Fatales',
          to: '/victimas',
          icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
        },
        {
              component: CNavItem,
              name: 'Afectados',
              to: '/afectados',
              icon: <CIcon icon={cilGift} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Perdidas Materiales',
          to: '/perdidas',
          icon: <CIcon icon={cilSofa} customClassName="nav-icon" />,
        },
            
          ],
        },
        
        {
          component: CNavGroup,
          name: 'Listados',
          icon: <CIcon icon={cilChevronBottom} customClassName="nav-icon" />,
          items: [
           
        {
          component: CNavItem,
          name: 'Listado Afectaciones',
          to: '/listadoafectaciones',
          icon: <CIcon icon={cilList} customClassName="nav-icon" />,
        },

       
  
            
          ],
        },

                {
          component: CNavGroup,
          name: 'Reportes',
          icon: <CIcon icon={cilChevronBottom} customClassName="nav-icon" />,
          items: [

         {
          component: CNavItem,
          name: 'Reporte Individual',
          to: '/documentos',
          icon: <CIcon icon={cilPrint} customClassName="nav-icon" />,
        },
         {
          component: CNavItem,
          name: 'Reporte General',
          to: '/general',
          icon: <CIcon icon={cilShareBoxed} customClassName="nav-icon" />,
        },
       
  
            
          ],
        },

        {
          component: CNavItem,
          name: 'Zonas De Riesgo',
          to: '/zonas',
          icon: <CIcon icon={cilMap} customClassName="nav-icon" />,
        },

        {
          component: CNavItem,
          name: 'Editar Usuarios',
          to: '/editarusuario',
          icon: <CIcon icon={cilList} customClassName="nav-icon" />,
        },

        
        
      ]
      : []
    ),
        ...(rol === 'usuario'
      ? [
        {
          component: CNavItem,
          name: 'Inicio',
          to: '/docents',
          icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
        },
      
        {
          component: CNavItem,
          name: 'Movimientos de tierra',
          to: '/prueba',
          icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Desbordamientos de Rios',
          to: '/desbordes',
          icon: <CIcon icon={cilRain} customClassName="nav-icon" />,
        },
          {
          component: CNavItem,
          name: 'Noticias',
          to: '/noticias',
          icon: <CIcon icon={cilBullhorn} customClassName="nav-icon" />,
        },
        /*{
          component: CNavItem,
          name: 'Registrar Comunidad',
          to: '/comunidad',
          icon: <CIcon icon={cilGlobeAlt} customClassName="nav-icon" />,
        },*/
        {
          component: CNavItem,
          name: 'afectaciones',
          to: '/afectaciones',
          icon: <CIcon icon={cilHospital} customClassName="nav-icon" />,
        },
       
         /*{
          component: CNavItem,
          name: 'Donantes',
          to: '/donantes',
          icon: <CIcon icon={cilHeart} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Donaciones',
          to: '/donaciones',
          icon: <CIcon icon={cilGift} customClassName="nav-icon" />,
        },*/
       
        {
          component: CNavItem,
          name: 'Zonas De Riesgo',
          to: '/zonas',
          icon: <CIcon icon={cilMap} customClassName="nav-icon" />,
        },

      ]
      : []
    ),



  ]
}