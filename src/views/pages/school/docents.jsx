import React from 'react'
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText,
  CCarousel, CCarouselItem, CImage, CBadge
} from '@coreui/react'
import '@coreui/coreui/dist/css/coreui.min.css'

// Importa tus imágenes locales
import img1 from 'src/assets/images/rio.jpg'
import img2 from 'src/assets/images/rio2.png'
import img3 from 'src/assets/images/torbes.jpg'

const DisasterInfo = () => {
  return (
    <CContainer className="mt-5">
      <CRow className="justify-content-center">
        <CCol md={10} lg={8}>
          <CCard className="p-3 shadow-lg border-0">
            <CCardBody>
              <CCardTitle className="fs-2 fw-bold text-center mb-3" style={{ color: '#FF7043' }}>
                ¿Qué es una afectación natural?
              </CCardTitle>
              <CCardText style={{ textAlign: 'justify', fontSize: 17 }}>
                Es un evento provocado por fuerzas de la naturaleza que causa daños significativos a personas, bienes y al entorno. Estos eventos pueden ser repentinos o desarrollarse con el tiempo, y suelen estar fuera del control humano. Ejemplos incluyen terremotos, inundaciones, huracanes, deslizamientos de tierra, tsunamis y erupciones volcánicas.
              </CCardText>
              <CCardText className="mt-3" style={{ textAlign: 'justify', fontSize: 16 }}>
                <b>Puntos resaltantes:</b>
              </CCardText>
              <ul style={{ marginTop: 8 }}>
                <li><b>Impacto humano y material:</b> Pueden causar pérdidas de vidas, desplazamientos y daños a infraestructuras.</li>
                <li><b>Prevención y preparación:</b> La educación y la planificación son claves para reducir riesgos.</li>
                <li><b>Respuesta rápida:</b> La actuación oportuna de autoridades y comunidades salva vidas.</li>
                <li><b>Solidaridad:</b> La ayuda mutua y la cooperación son fundamentales en situaciones de emergencia.</li>
              </ul>
              <div className="text-center mt-4">
                <CBadge
                  color="info"
                  className="fs-5 px-4 py-2 w-100 w-md-auto text-center"
                  style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  ¡La información y la prevención son tus mejores aliados ante los desastres naturales!
                </CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="justify-content-center mt-4">
        <CCol md={10} lg={8}>
          <CCarousel controls indicators interval={3500} pause="hover">
            <CCarouselItem>
              <CImage className="d-block w-100" src={img1} alt="Inundación de río" style={{ maxHeight: 320, objectFit: 'cover' }} />
            </CCarouselItem>
            <CCarouselItem>
              <CImage className="d-block w-100" src={img2} alt="Desbordamiento" style={{ maxHeight: 320, objectFit: 'cover' }} />
            </CCarouselItem>
            <CCarouselItem>
              <CImage className="d-block w-100" src={img3} alt="Daños por desastre" style={{ maxHeight: 320, objectFit: 'cover' }} />
            </CCarouselItem>
          </CCarousel>
          {/* Espacio extra antes del footer */}
          <div style={{ marginBottom: '2.5rem' }} />
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default DisasterInfo