import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardImage, CCardTitle, CCardText,
  CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormTextarea, CFormSelect, CRow, CCol, CContainer, CAlert
} from '@coreui/react'

/*const API = 'http://localhost:4000'*/
const API = 'https://sistema-de-gestion-backend.onrender.com';

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

const BotonEliminarNoticia = ({ noticiaId, onEliminada }) => {
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleEliminar = async () => {
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`${API}/noticias/${noticiaId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.mensaje || 'Error al eliminar')
      } else {
        setSuccess('Noticia eliminada correctamente')
        if (onEliminada) onEliminada()
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      console.error(err)
    } finally {
      setShowConfirm(false)
    }
  }

  return (
    <>
      <CButton style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }} size="sm" onClick={() => setShowConfirm(true)}>
        Eliminar
      </CButton>

      <CModal visible={showConfirm} onClose={() => setShowConfirm(false)}>
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que deseas eliminar esta noticia?
        </CModalBody>
        <CModalFooter>
          <CButton style={{ backgroundColor: 'white', color: 'blue', borderColor: 'blue' }} onClick={() => setShowConfirm(false)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }} onClick={handleEliminar}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>

      {error && <CAlert color="danger" className="mt-2">{error}</CAlert>}
      {success && <CAlert color="success" className="mt-2">{success}</CAlert>}
    </>
  )
}

const NoticiasBlog = () => {
  const initialForm = {
    titulo: '',
    descripcion: '',
    fuente: '',
    codesa: '',
    imagen: null, // base64 sin prefijo
  }

  const [form, setForm] = useState(initialForm)
  const [preview, setPreview] = useState(null) // dataURL para vista previa
  const [formError, setFormError] = useState(null) // mensaje general
  const [errors, setErrors] = useState({}) // errores por campo
  const [desastres, setDesastres] = useState([])
  const [noticias, setNoticias] = useState([])
  const [recargar, setRecargar] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(null)
  const [modalNoticia, setModalNoticia] = useState(null)
  const [pagina, setPagina] = useState(1)
  const noticiasPorPagina = 6
  const rol = localStorage.getItem('rol') || 'usuario'
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`${API}/desastres`)
      .then(res => res.json())
      .then(data => setDesastres(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    fetch(`${API}/noticias`)
      .then(res => res.json())
      .then(data => setNoticias(data))
      .catch(console.error)
  }, [recargar])

  useEffect(() => {
    const intervalo = setInterval(() => setRecargar(r => !r), 15000)
    return () => clearInterval(intervalo)
  }, [])


  useEffect(() => {
    let onPop = null
    const attach = () => {
      // empuja un estado para interceptar "atrás"
      try { history.pushState(null, '') } catch (e) {}
      onPop = (e) => {
       
        if (visible || !!modalNoticia) {
          try { history.pushState(null, '') } catch (err) {}
        }
      }
      window.addEventListener('popstate', onPop)
    }
    const detach = () => {
      if (onPop) window.removeEventListener('popstate', onPop)
      onPop = null
    }
    if (visible || !!modalNoticia) attach()
    return () => detach()
  }, [visible, modalNoticia])

  const totalPaginas = Math.ceil(noticias.length / noticiasPorPagina)
  const noticiasAMostrar = noticias.slice((pagina - 1) * noticiasPorPagina, pagina * noticiasPorPagina)

  const resetForm = () => {
    setForm(initialForm)
    setPreview(null)
    setErrors({})
    setFormError(null)
    setSubmitting(false)
    setVisible(false)
  }

  const handleChange = e => {
    const { name, value, files } = e.target
    setFormError(null)
    setErrors(prev => ({ ...prev, [name]: null }))

    if (name === 'imagen') {
      if (!files || !files[0]) {
        setForm(prev => ({ ...prev, imagen: null }))
        setPreview(null)
        setErrors(prev => ({ ...prev, imagen: 'La imagen es obligatoria.' }))
        return
      }
      const file = files[0]
      
      if (file.type !== 'image/png') {
        setErrors(prev => ({ ...prev, imagen: 'Solo se permiten imágenes PNG.' }))
        setForm(prev => ({ ...prev, imagen: null }))
        setPreview(null)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, imagen: 'La imagen no puede superar 5 MB.' }))
        setForm(prev => ({ ...prev, imagen: null }))
        setPreview(null)
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target.result
        const base64 = dataUrl.split(',')[1]
        setForm(prev => ({ ...prev, imagen: base64 }))
        setPreview(dataUrl)
        setErrors(prev => ({ ...prev, imagen: null }))
      }
      reader.readAsDataURL(file)
      return
    }

    if (name === 'descripcion') {
      // limitar a 350 caracteres en tiempo real
      const truncated = value.slice(0, 350)
      setForm(prev => ({ ...prev, descripcion: truncated }))
      // marcar error si no llega a 350 (se exige exactamente 350)
      setErrors(prev => ({ ...prev, descripcion: truncated.length === 350 ? null : `Descripción debe tener exactamente 350 caracteres. (${truncated.length}/350)` }))
      return
    }

    const trimmed = value
    setForm(prev => ({ ...prev, [name]: trimmed }))
    validateField(name, trimmed)
  }

  // al salir del textarea, rellenar con espacios hasta 350 para mantener la longitud si el usuario lo desea así
  const handleDescripcionBlur = () => {
    const len = form.descripcion.length
    if (len < 350) {
      // rellenar con espacios para mantener exactamente 350 caracteres (estético)
      const padded = form.descripcion.padEnd(350, ' ')
      setForm(prev => ({ ...prev, descripcion: padded }))
      setErrors(prev => ({ ...prev, descripcion: null }))
    }
  }

  // Validación en vivo por campo
  const validateField = (name, value) => {
    const v = typeof value === 'string' ? value.trim() : value
    setErrors(prev => {
      const next = { ...prev }
      switch (name) {
        case 'titulo':
          if (!v) next.titulo = 'El título es obligatorio.'
          else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(v)) next.titulo = 'El título debe comenzar con una letra.'
          else next.titulo = null
          break
        case 'descripcion':
          // ahora validamos longitud exacta
          next.descripcion = (value && value.length === 350) ? null : 'La descripción debe tener exactamente 350 caracteres.'
          break
        case 'fuente':
          next.fuente = v ? null : 'La fuente es obligatoria.'
          break
        case 'codesa':
          next.codesa = v ? null : 'Seleccione una afectación.'
          break
        case 'telefono':
          if (!v) next.telefono = null
          else if (!/^\d{11}$/.test(v)) next.telefono = 'Teléfono debe tener 11 dígitos'
          else next.telefono = null
          break
        default:
          break
      }
      return next
    })
  }

  const tituloValido = (t) => {
    if (!t) return false
    const trimmed = t.trim()
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(trimmed)
  }

  const validarFormulario = () => {
    const newErrors = {}
    const titulo = (form.titulo || '').trim()
    if (!titulo) newErrors.titulo = 'El título es obligatorio.'
    else if (!tituloValido(titulo)) newErrors.titulo = 'El título debe comenzar con una letra (no números, guiones ni caracteres especiales).'

    if (!form.imagen) newErrors.imagen = 'La imagen es obligatoria (PNG).'

    // ahora exigimos exactamente 350 caracteres
    if (!form.descripcion || form.descripcion.length !== 350) newErrors.descripcion = 'La descripción debe tener exactamente 350 caracteres.'

    if (!form.fuente || !form.fuente.trim()) newErrors.fuente = 'La fuente es obligatoria.'
    if (!form.codesa) newErrors.codesa = 'Seleccione una afectación.'

    setErrors(newErrors)
    if (Object.keys(newErrors).length) {
      setFormError('Corrija los errores del formulario.')
      return false
    }
    setFormError(null)
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setFormError(null)
    setErrors({})
    if (!validarFormulario()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/noticias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.errores && typeof data.errores === 'object') {
          setErrors(data.errores)
          setFormError('Corrija los errores señalados.')
        } else if (Array.isArray(data.detalles)) {
          setFormError(data.detalles.join(' '))
        } else {
          setFormError(data.mensaje || 'Error al publicar la noticia.')
        }
      } else {
        resetForm()
        setRecargar(r => !r)
      }
    } catch (err) {
      console.error(err)
      setFormError('Error al publicar la noticia. Intente nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEliminarNoticia = (id) => {
    setTimeout(() => setRecargar(r => !r), 1000)
    setModalNoticia(null)
  }

  const isPublishDisabled = submitting || !tituloValido(form.titulo) || !form.imagen || !form.descripcion || form.descripcion.length !== 350 || !form.fuente || !form.codesa

  return (
    <CContainer className="py-4" style={{ minHeight: '100vh' }}>
      <CRow className="mb-4">
        <CCol style={{ backgroundColor: 'white', borderColor: '#FF7043', borderRadius: '7px', textAlign: 'center' }}>
          <h2>Sucesos Ocurridos Recientemente</h2>
        </CCol>

        <CCol className="text-end">
          <CButton
            style={{ backgroundColor: '#FF7043', color: 'white' }}
            onClick={() => {
              setVisible(true)
              setFormError(null)
              setErrors({})
              setPreview(null)
              setForm(initialForm)
            }}
          >
            Agregar Noticia
          </CButton>
        </CCol>
      </CRow>

      <CModal visible={visible} onClose={() => resetForm()} alignment="center" backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>Publicar Noticia</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            {formError && <CAlert color="danger" className="mb-3">{formError}</CAlert>}

            <CFormInput
              name="titulo"
              label="Título"
              placeholder="Ingrese el título de la noticia"
              value={form.titulo}
              onChange={handleChange}
              maxLength={100}
              className="mb-1"
            />
            {errors.titulo && <div className="text-danger small mb-2">{errors.titulo}</div>}

            <CFormTextarea
              name="descripcion"
              label={`Descripción`} /*(exactamente 350 caracteres) — ${form.descripcion.length}/350`}*/
              value={form.descripcion}
              onChange={handleChange}
              onBlur={handleDescripcionBlur}
              className="mb-1"
              rows={8}
              maxLength={350}
            />
            {errors.descripcion && <div className="text-danger small mb-2">{errors.descripcion}</div>}

            <CFormInput
              name="fuente"
              label="Fuente"
              placeholder="Ingrese la fuente"
              value={form.fuente}
              onChange={handleChange}
              maxLength={100}
              className="mb-1"
            />
            {errors.fuente && <div className="text-danger small mb-2">{errors.fuente}</div>}

            <CFormSelect
              name="codesa"
              label="Afectación"
              value={form.codesa}
              onChange={handleChange}
              className="mb-1"
            >
              <option value="">Seleccione una afectación</option>
              {desastres.map(d => (
                <option key={d.TMA_CODESA} value={d.TMA_CODESA}>{d.TMA_NOMBRE}</option>
              ))}
            </CFormSelect>
            {errors.codesa && <div className="text-danger small mb-2">{errors.codesa}</div>}

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6 }}>Imagen (PNG obligatoria)</label>
              <CFormInput
                type="file"
                name="imagen"
                accept="image/png"
                onChange={handleChange}
                className="mb-2"
              />
              {errors.imagen && <div className="text-danger small mb-2">{errors.imagen}</div>}
              {preview && (
                <div style={{ marginTop: 8 }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 8 }} />
                </div>
              )}
            </div>
          </CModalBody>

          <CModalFooter>
            <CButton style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }} onClick={() => resetForm()}>
              Cancelar
            </CButton>
            <CButton
              style={{ backgroundColor: submitting ? '#ffd6c9' : '#ff7043', color: submitting ? '#6b6b6b' : '#fff', borderColor: '#ff7043' }}
              type="submit"
              disabled={isPublishDisabled}
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      <CRow className="g-4">
        {noticiasAMostrar.map(noticia => (
          <CCol key={noticia.TTR_CONOTI} xs={12} md={4}>
            <div
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
                  src={`data:image/png;base64,${noticia.imagen}`}
                  alt="Noticia"
                  style={imgStyles}
                />
              )}
              <CCardBody>
                <CCardTitle>{noticia.TTR_TITULO}</CCardTitle>
                <CCardText className="text-muted" style={{ fontSize: '0.95em', textAlign: 'justify' }}>
                  {noticia.TTR_FEPUBL ? new Date(noticia.TTR_FEPUBL).toLocaleDateString() : ''}<br />
                  Fuente: {noticia.TTR_FUENTE}
                </CCardText>
                <CCardText style={{ textAlign: 'justify' }}>{noticia.TTR_DESCRI}</CCardText>
              </CCardBody>
            </div>
          </CCol>
        ))}
      </CRow>

      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <CButton
            style={{ marginRight: 8, color: '#ff7043', borderColor: '#ff7043', backgroundColor: 'white' }}
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
            style={{ marginLeft: 8, color: '#ff7043', borderColor: '#ff7043', backgroundColor: 'white' }}
            variant="outline"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina(pagina + 1)}
          >
            Siguiente
          </CButton>
        </div>
      )}

      <CModal visible={!!modalNoticia} onClose={() => setModalNoticia(null)} size="lg" backdrop="static" keyboard={false}>
        {modalNoticia && (
          <>
            <CModalHeader>
              <CModalTitle>{modalNoticia.TTR_TITULO}</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {modalNoticia.imagen && (
                <img
                  src={`data:image/png;base64,${modalNoticia.imagen}`}
                  alt="Noticia"
                  style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 16, marginBottom: 20 }}
                />
              )}
              <div className="mb-2 text-muted" style={{ fontSize: '1em' }}>
                {modalNoticia.TTR_FEPUBL ? new Date(modalNoticia.TTR_FEPUBL).toLocaleDateString() : ''}<br />
                Fuente: {modalNoticia.TTR_FUENTE}
              </div>
              <div style={{ fontSize: '1.1em', textAlign: 'justify' }}>{modalNoticia.TTR_DESCRI}</div>
            </CModalBody>
            <CModalFooter style={{ alignItems: 'center', justifyContent: 'center' }}>
              {rol === 'admin' && (
                <div className="mt-3">
                  <BotonEliminarNoticia noticiaId={modalNoticia.TTR_CONOTI} onEliminada={() => handleEliminarNoticia(modalNoticia.TTR_CONOTI)} />
                </div>
              )}
              <CButton style={{ backgroundColor: 'white', color: 'blue', borderColor: 'blue' }} className="mt-3" onClick={() => setModalNoticia(null)}>
                Cerrar
              </CButton>
            </CModalFooter>
          </>
        )}
      </CModal>
    </CContainer>
  )
}

export default NoticiasBlog