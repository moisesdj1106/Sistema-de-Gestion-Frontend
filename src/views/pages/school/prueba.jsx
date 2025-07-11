import React from 'react'
import {
  CCard, CCardBody, CCardHeader, CRow, CCol, CBadge,
  CCarousel, CCarouselItem, CCarouselCaption, CImage
} from '@coreui/react'

// Importa tus imágenes locales
import img1 from 'src/assets/images/epicentro.png'
import img2 from 'src/assets/images/rio.jpg'
import img3 from 'src/assets/images/a3-rio.webp'


const imagenes = [
  {
    src: img1,
    style: { maxHeight: 320, objectFit: 'cover' },
  },
  {
    src: img2,
  },
  {
    src: img3,
  }
]

const MovimientosTierra = () => {
  return (
    <CRow className="justify-content-center mt-4" style={{ marginBottom: '50px' }}>
      <CCol md={10} lg={8}>
        <CCard className="shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.97)' }}>
          <CCardHeader className="bg-info text-white text-center py-4 rounded-top">
            <h2 className="fw-bold mb-1">Movimientos de Tierra y Sismos</h2>
            <span className="fst-italic" style={{ fontSize: 17 }}>
              Información clave para la prevención y respuesta ante desastres geológicos
            </span>
          </CCardHeader>
          <CCardBody className="p-4">
            {/* Carrusel de fotos */}
            <div className="mb-4">
              <CCarousel controls indicators dark>
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
              <h4 className="fw-semibold text-warning mb-2">¿Qué son los movimientos de tierra y sismos?</h4>
              <p>
                Los <b>movimientos de tierra</b> incluyen deslizamientos, derrumbes y aludes, causados por la inestabilidad del suelo, lluvias intensas o actividad sísmica. Un <b>sismo</b> es un movimiento brusco de la corteza terrestre, que puede provocar daños severos en infraestructuras y poner en riesgo vidas humanas.
              </p>
            </section>
            <section className="mb-4">
              <h4 className="fw-semibold text-warning mb-2">Características principales</h4>
              <ul>
                <li><b>Imprevisibilidad:</b> Los sismos pueden ocurrir sin previo aviso.</li>
                <li><b>Desplazamiento de masas:</b> Los deslizamientos pueden arrastrar tierra, rocas y vegetación.</li>
                <li><b>Daños estructurales:</b> Riesgo de colapso de viviendas, puentes y carreteras.</li>
                <li><b>Impacto social:</b> Posibles evacuaciones, heridos y pérdidas materiales.</li>
              </ul>
            </section>
            <section className="mb-4">
              <h4 className="fw-semibold text-warning mb-2">¿Qué hacer antes, durante y después?</h4>
              <CRow>
                <CCol xs={12} md={4} className="mb-3 d-flex flex-column align-items-center">
                  <CBadge
                    color="info"
                    className="mb-2 px-3 py-2 fs-6 w-100 text-center"
                    style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    Antes
                  </CBadge>
                  <ul className="ps-3 text-start w-100" style={{ fontSize: 15 }}>
                    <li>Identifica zonas de riesgo en tu comunidad.</li>
                    <li>Refuerza estructuras y asegura objetos pesados.</li>
                    <li>Prepara un plan de emergencia familiar.</li>
                    <li>Participa en simulacros de evacuación.</li>
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
                    <li>Protégete bajo una mesa resistente o junto a una pared interior.</li>
                    <li>Aléjate de ventanas y objetos que puedan caer.</li>
                    <li>Si estás en la calle, busca un espacio abierto lejos de edificios y cables.</li>
                    <li>Evita usar ascensores.</li>
                  </ul>
                </CCol>
                <CCol xs={12} md={4} className="mb-3 d-flex flex-column align-items-center">
                  <CBadge
                    color="success"
                    className="mb-2 px-3 py-2 fs-6 w-100 text-center"
                    style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    Después
                  </CBadge>
                  <ul className="ps-3 text-start w-100" style={{ fontSize: 15 }}>
                    <li>Verifica tu estado y el de tu familia.</li>
                    <li>Revisa daños estructurales antes de ingresar a edificios.</li>
                    <li>Escucha información oficial y sigue instrucciones.</li>
                    <li>Ayuda a quienes lo necesiten y reporta emergencias.</li>
                  </ul>
                </CCol>
              </CRow>
            </section>
            <section className="mb-4">
              <h4 className="fw-semibold text-warning mb-2">Puntos resaltantes</h4>
              <ul>
                <li><b>La prevención es fundamental:</b> Infórmate y prepara tu entorno.</li>
                <li><b>La calma salva vidas:</b> Mantén la serenidad y actúa con rapidez.</li>
                <li><b>La solidaridad es clave:</b> Apoya a tu comunidad antes, durante y después del evento.</li>
              </ul>
            </section>
            <div className="text-center mt-4">
              <CBadge
                color="warning"
                className="fs-5 px-4 py-2 w-100 w-md-auto text-white text-center"
                style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
              >
                ¡La información y la prevención son tus mejores aliados ante los movimientos de tierra y sismos!
              </CBadge>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default MovimientosTierra