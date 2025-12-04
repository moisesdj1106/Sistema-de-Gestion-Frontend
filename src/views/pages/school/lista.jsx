import React, { useEffect, useState, useRef } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CModal, CModalHeader, CModalBody, CModalFooter, CForm, CFormInput, CFormSelect, CAlert, CPagination, CPaginationItem
} from '@coreui/react'

/*const API = 'http://localhost:4000'*/
const API = 'https://sistema-de-gestion-backend.onrender.com'

const ListaDonantesFull = () => {
  const [donantes, setDonantes] = useState([])
  const [edit, setEdit] = useState(null)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState(null)
  const [tiposDonante, setTiposDonante] = useState([])
  const [tiposDocumento, setTiposDocumento] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [fieldErrors, setFieldErrors] = useState({})
  const itemsPerPage = 10

  const historyHandlerRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/donantesfull`).then(res => res.json()).then(setDonantes).catch(()=>{})
    fetch(`${API}/tipos-donante`).then(res => res.json()).then(setTiposDonante).catch(()=>{})
    fetch(`${API}/documento`).then(res => res.json()).then(setTiposDocumento).catch(()=>{})
  }, [])

  // bloqueo del botón atrás mientras modal(s) abiertos
  useEffect(() => {
    const modalOpen = showModal || showDeleteModal
    if (modalOpen) {
      // empujar un estado extra al history y evitar que al dar atrás se salga
      window.history.pushState({ modalOpen: true }, '')
      const onPop = () => {
        // volvemos a empujar para mantener el historial y evitar navegación atrás
        window.history.pushState({ modalOpen: true }, '')
      }
      historyHandlerRef.current = onPop
      window.addEventListener('popstate', onPop)
    }
    return () => {
      if (historyHandlerRef.current) {
        window.removeEventListener('popstate', historyHandlerRef.current)
        historyHandlerRef.current = null
        // retroceder el history que añadimos (si existe)
        try { window.history.back() } catch (e) {}
      }
    }
  }, [showModal, showDeleteModal])

  // Helpers validación
  const getDocNameById = (id) =>
    tiposDocumento && tiposDocumento.length
      ? tiposDocumento.find((t) => String(t.TMA_CODDOC) === String(id))?.TMA_NOMBRE || ''
      : ''

  const isPassportType = (id) => {
    const idStr = String(id || '').trim().toUpperCase()
    if (idStr === 'P' || idStr === '3' || idStr === '03') return true
    const name = getDocNameById(id) || ''
    return /pasap|pasaporte/i.test(name)
  }

  const allowedPhonePrefixes = ['0412', '0414', '0416', '0424', '0426', '0422']

  const validateCedulaField = (value, coddoc) => {
    const v = String(value || '').trim()
    if (!v) return 'Documento obligatorio'
    if (isPassportType(coddoc)) {
      if (!/^[A-Za-z0-9-]{6,15}$/.test(v)) return 'Pasaporte inválido (6-15: letras, números y guiones)'
      if (v.startsWith('-') || v.endsWith('-')) return 'Guion no puede estar al inicio o final'
      if (/--/.test(v)) return 'Guiones consecutivos no permitidos'
      if (!/[A-Za-z]/.test(v)) return 'Debe incluir al menos una letra'
      if (!/\d/.test(v)) return 'Debe incluir al menos un número'
      return ''
    } else {
      if (!/^\d{7,9}$/.test(v)) return 'Documento inválido (7-9 dígitos)'
      return ''
    }
  }

  const validatePhoneField = (value) => {
    const v = String(value || '').trim()
    if (!v) return 'Contacto obligatorio'
    if (!/^\d{11}$/.test(v)) return 'Teléfono debe tener 11 dígitos'
    const pref = v.slice(0,4)
    if (!allowedPhonePrefixes.includes(pref)) return `Prefijo inválido (${allowedPhonePrefixes.join(',')})`
    return ''
  }

  // Edit handlers
  const handleEdit = donante => {
    setEdit({
      ...donante,
      TMA_TIPODN: tiposDonante.find(t => t.TTR_NOMBRE === donante.tipo_donante)?.TTR_TIPODN || '',
      TMA_CODDOC: tiposDocumento.find(t => t.TMA_NOMBRE === donante.tipo_documento)?.TMA_CODDOC || ''
    })
    setFieldErrors({})
    setMsg({ type: '', text: '' })
    setShowModal(true)
  }

  const handleEditChange = e => {
    const { name, value } = e.target
    // actualizar y validar en directo para ciertos campos
    if (name === 'TMA_CEDULA') {
      // obtener tipo doc actual (preferir select si existe en DOM para evitar race)
      const selectCoddoc = document.querySelector('select[name="TMA_CODDOC"]')?.value
      const coddoc = selectCoddoc || (edit && edit.TMA_CODDOC) || ''
      let v = value
      if (isPassportType(coddoc)) {
        v = v.replace(/[^A-Za-z0-9-]/g, '').toUpperCase().slice(0, 15)
      } else {
        v = v.replace(/\D/g, '').slice(0, 9)
      }
      setEdit(prev => ({ ...prev, [name]: v }))
      const err = validateCedulaField(v, coddoc)
      setFieldErrors(prev => ({ ...prev, TMA_CEDULA: err }))
      return
    }
    if (name === 'TMA_CONTAC') {
      let v = value.replace(/\D/g, '').slice(0, 11)
      setEdit(prev => ({ ...prev, [name]: v }))
      const err = v ? validatePhoneField(v) : 'Contacto obligatorio'
      setFieldErrors(prev => ({ ...prev, TMA_CONTAC: err }))
      return
    }
    if (name === 'TMA_CODDOC') {
      // al cambiar tipo documento, actualizar y revalidar cédula
      setEdit(prev => ({ ...prev, [name]: value }))
      const ced = edit?.TMA_CEDULA || ''
      const err = validateCedulaField(ced, value)
      setFieldErrors(prev => ({ ...prev, TMA_CODDOC: '', TMA_CEDULA: err }))
      return
    }
    // defecto
    setEdit(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleEditSubmit = async e => {
    e.preventDefault()
    if (!edit) return
    // validaciones finales
    const cedErr = validateCedulaField(edit.TMA_CEDULA, edit.TMA_CODDOC)
    const phoneErr = validatePhoneField(edit.TMA_CONTAC)
    const errors = {}
    if (cedErr) errors.TMA_CEDULA = cedErr
    if (phoneErr) errors.TMA_CONTAC = phoneErr
    if (!edit.TMA_NOMBRE || !String(edit.TMA_NOMBRE).trim()) errors.TMA_NOMBRE = 'Nombre obligatorio'
    if (!edit.TMA_TIPODN) errors.TMA_TIPODN = 'Tipo de donante obligatorio'
    if (!edit.TMA_CODDOC) errors.TMA_CODDOC = 'Tipo de documento obligatorio'
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      setMsg({ type: 'danger', text: 'Corrige los errores antes de guardar.' })
      return
    }

    const res = await fetch(`${API}/donantes/${edit.TMA_CODONT}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: edit.TMA_NOMBRE,
        contac: edit.TMA_CONTAC,
        tipodn: Number(edit.TMA_TIPODN),
        cedula: edit.TMA_CEDULA,
        coddoc: Number(edit.TMA_CODDOC)
      })
    })
    const data = await res.json().catch(()=>({}))
    if (res.ok) {
      fetch(`${API}/donantesfull`).then(res => res.json()).then(setDonantes).catch(()=>{})
      setShowModal(false)
      setMsg({ type: 'success', text: 'Donante actualizado.' })
    } else {
      setMsg({ type: 'danger', text: data.mensaje || 'No se pudo actualizar.' })
    }
  }

  // Delete: abrir modal de confirmación (no window.confirm)
  const handleDelete = id => {
    setSelectedDeleteId(id)
    setShowDeleteModal(true)
    setMsg({ type: '', text: '' })
  }

  const confirmDelete = async () => {
    if (!selectedDeleteId) return
    const res = await fetch(`${API}/donantes/${selectedDeleteId}`, { method: 'DELETE' })
    if (res.ok) {
      setDonantes(prev => prev.filter(d => d.TMA_CODONT !== selectedDeleteId))
      setMsg({ type: 'success', text: 'Donante eliminado.' })
    } else {
      setMsg({ type: 'danger', text: 'No se pudo eliminar.' })
    }
    setShowDeleteModal(false)
    setSelectedDeleteId(null)
  }

  // Filtrado seguro
  const filtered = donantes.filter(d =>
    (String(d.TMA_NOMBRE || '').toLowerCase().includes(search.toLowerCase()) ||
      String(d.TMA_CONTAC || '').toLowerCase().includes(search.toLowerCase()) ||
      String(d.tipo_donante || '').toLowerCase().includes(search.toLowerCase()) ||
      String(d.TMA_CEDULA || '').toLowerCase().includes(search.toLowerCase()) ||
      String(d.tipo_documento || '').toLowerCase().includes(search.toLowerCase()))
  )

  // Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [search, totalPages])

  return (
    <CRow className="mt-4">
      <CCol xs={12}>
        <CCard>
          <CCardBody>
            <h4 className="mb-4">Donantes Registrados</h4>
            <CFormInput
              placeholder="Buscar por nombre, contacto, tipo, cédula o documento"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="mb-3"
            />
            {msg.text && <CAlert color={msg.type}>{msg.text}</CAlert>}
            <CTable striped hover responsive>
              <CTableHead style={{textAlign: 'center'}}>
                <CTableRow>
                  <CTableHeaderCell>Tipo Documento</CTableHeaderCell>
                  <CTableHeaderCell>Cédula</CTableHeaderCell>
                  <CTableHeaderCell>Nombre</CTableHeaderCell>
                  <CTableHeaderCell>Contacto</CTableHeaderCell>
                  <CTableHeaderCell>Tipo Donante</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody style={{textAlign: 'center'}}>
                {paginated.map((d, i) => (
                  <CTableRow key={d.TMA_CODONT}>
                    <CTableDataCell>{d.tipo_documento}</CTableDataCell>
                    <CTableDataCell>{d.TMA_CEDULA}</CTableDataCell>
                    <CTableDataCell>{d.TMA_NOMBRE}</CTableDataCell>
                    <CTableDataCell>{d.TMA_CONTAC}</CTableDataCell>
                    <CTableDataCell>{d.tipo_donante}</CTableDataCell>
                    <CTableDataCell>
                      <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} size="sm" onClick={() => handleEdit(d)}>Editar</CButton>{' '}
                      <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} size="sm" onClick={() => handleDelete(d.TMA_CODONT)}>Eliminar</CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            <CPagination align="center" className="mt-3">
              {[...Array(totalPages)].map((_, idx) => (
                <CPaginationItem
                  key={idx + 1}
                  active={page === idx + 1}
                  onClick={() => setPage(idx + 1)}
                  style={{ cursor: 'pointer' }}
                >
                  {idx + 1}
                </CPaginationItem>
              ))}
            </CPagination>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal de edición: no cierra al click fuera ni con ESC */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} backdrop="static" keyboard={false}>
        <CModalHeader>Editar Donante</CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleEditSubmit}>
            <CFormInput
              label="Nombre"
              name="TMA_NOMBRE"
              value={edit?.TMA_NOMBRE || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
            />
            {fieldErrors.TMA_NOMBRE && <div className="text-danger small mb-2">{fieldErrors.TMA_NOMBRE}</div>}

            <CFormInput
              label="Contacto"
              name="TMA_CONTAC"
              value={edit?.TMA_CONTAC || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
            />
            {fieldErrors.TMA_CONTAC && <div className="text-danger small mb-2">{fieldErrors.TMA_CONTAC}</div>}

            <CFormSelect
              label="Tipo de Donante"
              name="TMA_TIPODN"
              value={edit?.TMA_TIPODN || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
            >
              <option value="">Seleccione tipo de donante</option>
              {tiposDonante.map(t => (
                <option key={t.TTR_TIPODN} value={t.TTR_TIPODN}>
                  {t.TTR_NOMBRE}
                </option>
              ))}
            </CFormSelect>
            {fieldErrors.TMA_TIPODN && <div className="text-danger small mb-2">{fieldErrors.TMA_TIPODN}</div>}

            <CFormInput
              label="Cédula"
              name="TMA_CEDULA"
              type="text"
              value={edit?.TMA_CEDULA || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
              maxLength={15}
            />
            {fieldErrors.TMA_CEDULA && <div className="text-danger small mb-2">{fieldErrors.TMA_CEDULA}</div>}

            <CFormSelect
              label="Tipo de Documento"
              name="TMA_CODDOC"
              value={edit?.TMA_CODDOC || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
            >
              <option value="">Seleccione tipo de documento</option>
              {tiposDocumento.map(t => (
                <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>
                  {t.TMA_NOMBRE}
                </option>
              ))}
            </CFormSelect>
            {fieldErrors.TMA_CODDOC && <div className="text-danger small mb-2">{fieldErrors.TMA_CODDOC}</div>}

            <CModalFooter>
              <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => { setShowModal(false); setFieldErrors({}); }}>Cancelar</CButton>
              <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} type="submit">Guardar</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>

      {/* Modal de confirmación de eliminación (no cierra al click fuera ni con ESC) */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static" keyboard={false}>
        <CModalHeader>Confirmar eliminación</CModalHeader>
        <CModalBody>¿Eliminar este donante?</CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'#6b6b6b'}} onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={confirmDelete}>Eliminar</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default ListaDonantesFull