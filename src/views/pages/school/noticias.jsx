import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardImage, CCardTitle, CCardText,
  CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormTextarea, CFormSelect, CRow, CCol, CContainer, CAlert
} from '@coreui/react'


// Componente para eliminar noticia (solo admin) con modal de confirmación
const BotonEliminarNoticia = ({ noticiaId, onEliminada }) => {
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)


  
  const handleEliminar = async () => {
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`https://sistema-de-gestion-backend.onrender.com/noticias/${noticiaId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.mensaje || 'Error al eliminar')
      } else {
        setSuccess('Noticia eliminada correctamente')
        if (onEliminada) onEliminada()
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    }
    setShowConfirm(false)
  }

  return (
    <>
      <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} size="sm" onClick={() => setShowConfirm(true)}>
        Eliminar
      </CButton>
      <CModal visible={showConfirm} onClose={() => setShow
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que deseas eliminar esta noticia?
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'blue', borderColor:'blue'}} onClick={() => setShowConfirm(false)}>
            Cancelar
          </CButton>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={handleEliminar}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
      {error && <CAlert color="danger" className="mt-2">{error}</CAlert>}
      {success && <CAlert color="success" className="mt-2">{success}</CAlert>}
    </>
  )
}

const cardStyles = {
  transition: 'transform 0.2s, box-shadow 0.2s',
  padding: '18px 10px 10px 10px',
  borderRadius: '18px',
  background: '#fff',
  cursor: 'pointer',
}
const cardHoverStyles = {
  transform: 'translateY(-8px) scale(1.03)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  background: '#f8f9fa',
}
const imgStyles = {
  borderRadius: '12px',
  objectFit: 'cover',
  width: '100%',
  height: '260px',
}

const NoticiasBlog = () => {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fuente: '',
    codesa: '',
    imagen: null
  })
  const [desastres, setDesastres] = useState([])
  const [noticias, setNoticias] = useState([])
  const [recargar, setRecargar] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(null)
  const [modalNoticia, setModalNoticia] = useState(null)
  const [pagina, setPagina] = useState(1);
  const noticiasPorPagina = 6;
  const rol = localStorage.getItem('rol') || 'usuario'

  useEffect(() => {
    fetch('https://sistema-de-gestion-backend.onrender.com/desastres')
      .then(res => res.json())
      .then(data => setDesastres(data))
  }, [])

  useEffect(() => {
    fetch('https://sistema-de-gestion-backend.onrender.com/noticias')
      .then(res => res.json())
      .then(data => setNoticias(data))
  }, [recargar])

  // refresco automático cada 15 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setRecargar(r => !r) // fuerza re-ejecución del useEffect que carga noticias
    }, 15000) // 15000 ms = 15s

    return () => clearInterval(intervalo) // limpiar al desmontar
  }, [])

  // Calcular paginación
  const totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);
  const noticiasAMostrar = noticias.slice(
    (pagina - 1) * noticiasPorPagina,
    pagina * noticiasPorPagina
  );

  const handleChange = e => {
    const { name, value, files } = e.target
    if (name === 'imagen') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setForm({ ...form, imagen: ev.target.result.split(',')[1] })
      }
      if (files[0]) reader.readAsDataURL(files[0])
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    await fetch('https://sistema-de-gestion-backend.onrender.com/noticias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({
      titulo: '',
      descripcion: '',
      fuente: '',
      codesa: '',
      imagen: null
    })
    setRecargar(r => !r)
    setVisible(false)
  }

  // Eliminar noticia y recargar
  const handleEliminarNoticia = (id) => {
    setTimeout(() => setRecargar(r => !r), 1000)
    setModalNoticia(null)
  }

  return (
    <CContainer className="py-4" style={{ minHeight: '100vh' }}>
      <CRow className="mb-4">
        <CCol style={{backgroundColor:'white', borderColor:'#FF7043', borderRadius:'7px', textAlign:'center'}}>
          <h2>Sucesos Ocurridos Recientemente</h2>
        </CCol>
        
          <CCol className="text-end">
            <CButton style={{backgroundColor:'#FF7043', color:'white'}} onClick={() => setVisible(true)}>
              Agregar Noticia
            </CButton>
          </CCol>
      
      </CRow>

      {/* Modal para agregar noticia */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Publicar Noticia</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CFormInput
              name="titulo"
              label="Título"
              placeholder='Ingrese el título de la noticia '
              value={form.titulo}
              onChange={handleChange}
              required
              maxLength={25}
              className="mb-3"
            />
            <CFormTextarea
              name="descripcion"
              label="Descripción"
              value={form.descripcion}
              onChange={handleChange}
              required
              maxLength={100}
              className="mb-3"
            />
            <CFormInput
              name="fuente"
              label="Fuente"
              placeholder='Ingrese el título de la noticia '
              value={form.fuente}
              onChange={handleChange}
              required
              maxLength={10}
              className="mb-3"
            />
            <CFormSelect
              name="codesa"
              label="Desastre"
              value={form.codesa}
              onChange={handleChange}
              required
              className="mb-3"
            >
              <option value="">Seleccione un desastre</option>
              {desastres.map(d => (
                <option key={d.TMA_CODESA} value={d.TMA_CODESA}>{d.TMA_NOMBRE}</option>
              ))}
            </CFormSelect>
            <CFormInput
              type="file"
              name="imagen"
              label="Imagen"
              accept="image/*"
              onChange={handleChange}
              className="mb-3"
            />
          </CModalBody>
          <CModalFooter>
            <CButton style={{backgroundColor:'white',color:'red',borderColor:'red'}} onClick={() => setVisible(false)}>
              Cancelar
            </CButton>
            <CButton style={{backgroundColor:'white',color:'#ff7043',borderColor:'#ff7043'}} type="submit">
              Publicar
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Modal para ver noticia en grande */}
      <CModal visible={!!modalNoticia} onClose={() => setModalNoticia(null)} size="lg">
        {modalNoticia && (
          <>
            <CModalHeader>
              <CModalTitle>{modalNoticia.TTR_TITULO}</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {modalNoticia.imagen && (
                <img
                  src={`data:image/jpeg;base64,${modalNoticia.imagen}`}
                  alt="Noticia"
                  style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 16, marginBottom: 20 }}
                />
              )}
              <div className="mb-2 text-muted" style={{ fontSize: '1em' }}>
                {new Date(modalNoticia.TTR_FEPUBL).toLocaleDateString()}<br />
                Fuente: {modalNoticia.TTR_FUENTE}
              </div>
              <div style={{ fontSize: '1.1em', textAlign: 'justify' }}>{modalNoticia.TTR_DESCRI}</div>
             
            </CModalBody>
            <CModalFooter style={{alignItems: 'center', justifyContent: 'center'}}>
               {/* Botón eliminar solo para admin */}
              {rol === 'admin' && (
                <div className="mt-3" >
                  <BotonEliminarNoticia  noticiaId={modalNoticia.TTR_CONOTI} onEliminada={() => handleEliminarNoticia(modalNoticia.TTR_CONOTI)} />
                </div>
              )}
              <CButton style={{backgroundColor:'white', color:'blue', borderColor:'blue'}} className="mt-3" onClick={() => setModalNoticia(null)}>
                Cerrar
              </CButton>
            </CModalFooter>
          </>
        )}
      </CModal>

      {/* Listado de noticias con paginación */}
      <CRow className="g-4">
        {noticiasAMostrar.map(noticia => (
          <CCol key={noticia.TTR_CONOTI} xs={12} md={4}>
            <CCard
              className="h-100"
              style={{
                ...cardStyles,
                ...(hovered === noticia.TTR_CONOTI ? cardHoverStyles : {})
              }}
              onMouseEnter={() => setHovered(noticia.TTR_CONOTI)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setModalNoticia(noticia)}
            >
              {noticia.imagen && (
                <CCardImage
                  orientation="top"
                  src={`data:image/jpeg;base64,${noticia.imagen}`}
                  alt="Noticia"
                  style={imgStyles}
                />
              )}
              <CCardBody>
                <CCardTitle>{noticia.TTR_TITULO}</CCardTitle>
                <CCardText className="text-muted" style={{ fontSize: '0.95em', textAlign: 'justify' }}>
                  {new Date(noticia.TTR_FEPUBL).toLocaleDateString()}<br />
                  Fuente: {noticia.TTR_FUENTE}
                </CCardText>
                <CCardText style={{ textAlign: 'justify' }}>{noticia.TTR_DESCRI}</CCardText>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <CButton
            style={{ marginRight: 8, color:'#ff7043', borderColor:'#ff7043', backgroundColor:'white' }}
            
            variant="outline"
            disabled={pagina === 1}
            onClick={() => setPagina(pagina - 1)}
          >
            Anterior
          </CButton>
          {[...Array(totalPaginas)].map((_, idx) => (
            <CButton
              key={idx}
              color={pagina === idx + 1 ? "primary" : "secondary"}
              variant={pagina === idx + 1 ? "solid" : "outline"}
              style={{ margin: '0 4px' }}
              onClick={() => setPagina(idx + 1)}
            >
              {idx + 1}
            </CButton>
          ))}
          <CButton
            style={{ marginLeft: 8,color:'#ff7043', borderColor:'#ff7043', backgroundColor:'white' }}
            variant="outline"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina(pagina + 1)}
          >
            Siguiente
          </CButton>
        </div>
      )}
    </CContainer>
  );
}

export default NoticiasBlog