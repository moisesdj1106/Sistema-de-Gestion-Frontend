import React from 'react'
import {
  CCard, CCardBody, CCardHeader, CRow, CCol, CBadge,
  CCarousel, CCarouselItem, CCarouselCaption, CImage
} from '@coreui/react'

import img2 from 'src/assets/images/rio3.png'
import img3 from 'src/assets/images/rio2.png'


const imagenes = [
  { src: img2 },
  { src: img3 },
]

const Desbordes = () => {
  return (
    <CRow className="justify-content-center mt-4" style={{ marginBottom: '50px' }}>
      <CCol xs={12} md={10} lg={8}>
        <CCard className="shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.97)' }}>
          <CCardHeader className="bg-info text-white text-center py-4 rounded-top">
            <h2 className="fw-bold mb-1">Desbordamientos de afluentes hidrícos</h2>
            <span className="fst-italic" style={{ fontSize: 17 }}>
              Información esencial para la prevención y actuación ante afectaciones hídricos
            </span>
          </CCardHeader>
          <CCardBody className="p-4">
            {/* Carrusel de fotos */}
            <div className="mb-4">
              <CCarousel controls indicators dark interval={2000} pause="hover">
                {imagenes.map((img, idx) => (
                  <CCarouselItem key={idx}>
                    <CImage className="d-block w-100" src={img.src} alt={img.alt} style={{ maxHeight: 320, objectFit: 'cover' }} />
                    <CCarouselCaption className="d-none d-md-block">
                      <h5>{img.texto}</h5>
                    </CCarouselCaption>
                  </CCarouselItem>
                ))}
              </CCarousel>
            </div>
            <section className="mb-4">
              <h4 className="fw-semibold text-primary mb-2">¿Qué es un desbordamiento de cauce?</h4>
              <p>
                Un <b>desbordamiento de cauce</b> ocurre cuando el agua de un río, quebrada o canal supera su capacidad y se sale de su cauce natural, inundando áreas cercanas. Esto puede deberse a lluvias intensas, obstrucciones, deshielos o fallas en infraestructuras hidráulicas.
              </p>
            </section>
            <section className="mb-4">
              <h4 className="fw-semibold text-primary mb-2">Características principales</h4>
              <ul>
                <li><b>Rápida inundación:</b> Puede ocurrir en minutos u horas tras lluvias intensas.</li>
                <li><b>Alto riesgo:</b> Afecta viviendas, cultivos, vías y puede poner en peligro vidas humanas.</li>
                <li><b>Arrastre de materiales:</b> El agua puede llevar lodo, piedras, troncos y escombros.</li>
                <li><b>Impacto social y económico:</b> Daños materiales, desplazamientos y pérdidas económicas.</li>
              </ul>
            </section>
            <section className="mb-4">
              <h4 className="fw-semibold text-primary mb-2">¿Qué hacer antes, durante y después?</h4>
              <CRow>
                <CCol xs={12} md={4} className="mb-3 d-flex flex-column align-items-center">
                  <CBadge
                    color="warning"
                    className="mb-2 px-3 py-2 fs-6 w-100 text-center"
                    style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    Antes
                  </CBadge>
                  <ul className="ps-3 text-start w-100" style={{ fontSize: 15 }}>
                    <li>Infórmate sobre zonas de riesgo en tu comunidad.</li>
                    <li>Prepara un plan de evacuación familiar.</li>
                    <li>Guarda documentos y objetos importantes en lugares seguros y elevados.</li>
                    <li>Mantén a la mano un kit de emergencia.</li>
                  </ul>
                </CCol>
                <CCol xs={12} md={4} className="mb-3 d-flex flex-column align-items-center">
                  <CBadge
                    color="danger"
                    className="mb-2 px-3 py-2 fs-6 w-100 text-center"
                    style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    Durante
                  </CBadge>
                  <ul className="ps-3 text-start w-100" style={{ fontSize: 15 }}>
                    <li>Sigue las indicaciones de las autoridades.</li>
                    <li>Evacúa inmediatamente si es necesario.</li>
                    <li>No cruces zonas inundadas ni a pie ni en vehículo.</li>
                    <li>Desconecta la electricidad si hay riesgo de inundación.</li>
                  </ul>
                </CCol>
                <CCol xs={12} md={4} className="mb-3 d-flex flex-column align-items-center">
                  <CBadge
                    color="info"
                    className="mb-2 px-3 py-2 fs-6 w-100 text-center"
                    style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    Después
                  </CBadge>
                  <ul className="ps-3 text-start w-100" style={{ fontSize: 15 }}>
                    <li>No regreses a tu hogar hasta que sea seguro.</li>
                    <li>Evita el contacto con el agua estancada.</li>
                    <li>Revisa daños estructurales antes de ingresar.</li>
                    <li>Reporta daños y sigue las recomendaciones oficiales.</li>
                  </ul>
                </CCol>
              </CRow>
            </section>
            <section className="mb-4">
              <h4 className="fw-semibold text-primary mb-2">Puntos resaltantes</h4>
              <ul>
                <li><b>La prevención salva vidas:</b> Conoce los planes de emergencia locales.</li>
                <li><b>La educación es clave:</b> Participa en simulacros y charlas comunitarias.</li>
                <li><b>La solidaridad importa:</b> Ayuda a quienes lo necesiten durante y después del evento.</li>
              </ul>
            </section>
            <div className="text-center mt-4">
              <CBadge color="primary" className="fs-5 px-4 py-2 w-100 w-md-auto" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                ¡La información y la prevención son tus mejores aliados ante los desbordamientos!
              </CBadge>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    
  )
}

export default Desbordes