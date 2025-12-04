import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CModal, CModalHeader, CModalBody, CModalFooter, CForm, CFormInput, CFormSelect, CAlert, CPagination, CPaginationItem
} from '@coreui/react'

const API = 'https://sistema-de-gestion-backend.onrender.com'
/*const API = 'http://localhost:4000'*/
const Donaciones = () => {
  const [donaciones, setDonaciones] = useState([])
  const [edit, setEdit] = useState(null)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [showModal, setShowModal] = useState(false)
  const [donantes, setDonantes] = useState([])
  const [afectaciones, setAfectaciones] = useState([])
  const [tiposDonacion, setTiposDonacion] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  // nuevos estados
  const [fieldErrors, setFieldErrors] = useState({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState(null)

  useEffect(() => {
    fetch(`${API}/donaciones`).then(res => res.json()).then(setDonaciones).catch(()=>{})
    fetch(`${API}/donantesregistrados`).then(res => res.json()).then(setDonantes).catch(()=>{})
    fetch(`${API}/afectacion`).then(res => res.json()).then(setAfectaciones).catch(()=>{})
    fetch(`${API}/tipos-estilo-donacion`).then(res => res.json()).then(setTiposDonacion).catch(()=>{})
  }, [])

  // eliminar ahora con modal de confirmación
  const handleDelete = async id => {
    // abrir modal de confirmación
    setSelectedDeleteId(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedDeleteId) return
    try {
      const res = await fetch(`${API}/donaciones/${selectedDeleteId}`, { method: 'DELETE' })
      if (res.ok) {
        setDonaciones(prev => prev.filter(d => d.TTR_CODONA !== selectedDeleteId))
        setMsg({ type: 'success', text: 'Donación eliminada.' })
      } else {
        const data = await res.json().catch(()=>({}))
        setMsg({ type: 'danger', text: data.mensaje || 'No se pudo eliminar.' })
      }
    } catch (e) {
      setMsg({ type: 'danger', text: 'Error de conexión al eliminar.' })
    } finally {
      setShowDeleteModal(false)
      setSelectedDeleteId(null)
    }
  }

  const handleEdit = donacion => {
    setEdit({ ...donacion })
    setFieldErrors({})
    setMsg({ type: '', text: '' })
    setShowModal(true)
  }

  const handleEditChange = e => {
    const { name, value } = e.target
    setEdit(prev => ({ ...prev, [name]: value }))
    // validación en directo
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (name === 'TTR_CANTID') {
      if (!value || Number(value) <= 0) setFieldErrors(prev => ({ ...prev, TTR_CANTID: 'Cantidad debe ser mayor a 0' }))
    }
    if (name === 'TTR_FEDONA') {
      const today = new Date().toISOString().split('T')[0]
      if (value && value > today) setFieldErrors(prev => ({ ...prev, TTR_FEDONA: 'La fecha no puede ser futura' }))
    }
    if (name === 'TTR_COAFEC' && !value) setFieldErrors(prev => ({ ...prev, TTR_COAFEC: 'Seleccione afectación' }))
    if (name === 'TTR_CODONT' && !value) setFieldErrors(prev => ({ ...prev, TTR_CODONT: 'Seleccione donante' }))
    if (name === 'TTR_TIPODO' && !value) setFieldErrors(prev => ({ ...prev, TTR_TIPODO: 'Seleccione tipo de donación' }))
  }

  const handleEditSubmit = async e => {
    e.preventDefault()
    if (!edit) return
    // validaciones finales
    const errors = {}
    if (!edit.TTR_CANTID || Number(edit.TTR_CANTID) <= 0) errors.TTR_CANTID = 'Cantidad debe ser mayor a 0'
    if (!edit.TTR_FEDONA) errors.TTR_FEDONA = 'Fecha obligatoria'
    else {
      const today = new Date(); today.setHours(0,0,0,0)
      const sel = new Date(edit.TTR_FEDONA); sel.setHours(0,0,0,0)
      if (sel > today) errors.TTR_FEDONA = 'La fecha no puede ser futura'
    }
    if (!edit.TTR_COAFEC) errors.TTR_COAFEC = 'Seleccione afectación'
    if (!edit.TTR_CODONT) errors.TTR_CODONT = 'Seleccione donante'
    if (!edit.TTR_TIPODO) errors.TTR_TIPODO = 'Seleccione tipo de donación'

    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      setMsg({ type: 'danger', text: 'Corrija los errores del formulario.' })
      return
    }

    try {
      const res = await fetch(`${API}/donaciones/${edit.TTR_CODONA}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cantidad: Number(edit.TTR_CANTID),
          fedona: edit.TTR_FEDONA,
          coafec: Number(edit.TTR_COAFEC),
          codont: Number(edit.TTR_CODONT),
          tipodo: Number(edit.TTR_TIPODO),
          descri: edit.TTR_DESCRI
        })
      })
      const data = await res.json().catch(()=>({}))
      if (res.ok) {
        setDonaciones(prev => prev.map(d => d.TTR_CODONA === edit.TTR_CODONA ? { ...d, ...edit } : d))
        setShowModal(false)
        setMsg({ type: 'success', text: 'Donación actualizada.' })
      } else {
        setMsg({ type: 'danger', text: data.mensaje || 'No se pudo actualizar.' })
      }
    } catch (err) {
      setMsg({ type: 'danger', text: 'Error de conexión al actualizar.' })
    }
  }

  // Filtrado
  const filtered = donaciones.filter(d =>
    (String(d.donante || '').toLowerCase().includes(search.toLowerCase()) ||
      String(d.cedula_donante || '').toLowerCase().includes(search.toLowerCase()) ||
      String(d.tipo_donacion || '').toLowerCase().includes(search.toLowerCase()) ||
      String(d.comunidad || '').toLowerCase().includes(search.toLowerCase()) ||
      String(d.TTR_DESCRI || '').toLowerCase().includes(search.toLowerCase()))
  )

  // Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => {
    // Si el filtro reduce la cantidad de páginas, ajusta la página actual
    if (page > totalPages) setPage(1)
  }, [search, totalPages])

  const today = new Date().toISOString().split('T')[0]

  return (
    <CRow className="mt-4">
      <CCol xs={12}>
        <CCard>
          <CCardBody>
            <h4 className="mb-4">Donaciones Registradas</h4>
            <CFormInput
              placeholder="Buscar por donante, cédula, tipo, comunidad o descripción"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="mb-3"
            />
            {msg.text && <CAlert color={msg.type}>{msg.text}</CAlert>}
            <CTable striped hover responsive>
              <CTableHead style={{textAlign: 'center'}}>
                <CTableRow>
                  
                  <CTableHeaderCell>Cantidad</CTableHeaderCell>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell>Donante</CTableHeaderCell>
                  <CTableHeaderCell>Tipo Donación</CTableHeaderCell>
                  <CTableHeaderCell>Comunidad</CTableHeaderCell>
                  <CTableHeaderCell>Descripción</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody style={{textAlign: 'center'}}>
                {paginated.map((d, i) => (
                  <CTableRow key={d.TTR_CODONA}>
                    
                    <CTableDataCell>{d.TTR_CANTID}</CTableDataCell>
                    <CTableDataCell>{d.TTR_FEDONA?.slice(0, 10)}</CTableDataCell>
                    <CTableDataCell>{d.donante} - {d.cedula_donante}</CTableDataCell>
                    <CTableDataCell>{d.tipo_donacion}</CTableDataCell>
                    <CTableDataCell>{d.comunidad}</CTableDataCell>
                    <CTableDataCell>{d.TTR_DESCRI}</CTableDataCell>
                    <CTableDataCell>
                      <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} size="sm" onClick={() => handleEdit(d)}>Editar</CButton>{' '}
                      <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} size="sm" onClick={() => handleDelete(d.TTR_CODONA)}>Eliminar</CButton>
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

      {/* Modal de edición: no cierra al click fuera ni con ESC, validaciones y errores inline */}
      <CModal visible={showModal} onClose={() => { setShowModal(false); setFieldErrors({}); }} backdrop="static" keyboard={false}>
        <CModalHeader>Editar Donación</CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleEditSubmit}>
            <CFormInput
              label="Cantidad"
              name="TTR_CANTID"
              type="number"
              value={edit?.TTR_CANTID || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
              min={1}
            />
            {fieldErrors.TTR_CANTID && <div className="text-danger small mb-2">{fieldErrors.TTR_CANTID}</div>}

            <CFormInput
              label="Fecha de Donación"
              name="TTR_FEDONA"
              type="date"
              value={edit?.TTR_FEDONA?.slice(0, 10) || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
              max={today}
            />
            {fieldErrors.TTR_FEDONA && <div className="text-danger small mb-2">{fieldErrors.TTR_FEDONA}</div>}

            <CFormSelect
              label="Afectación"
              name="TTR_COAFEC"
              value={edit?.TTR_COAFEC || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
            >
              <option value="">Seleccione afectación</option>
              {afectaciones.map(a => (
                <option key={a.TTR_COAFEC} value={a.TTR_COAFEC}>
                  {a.TTR_COAFEC} - {a.comunidad}
                </option>
              ))}
            </CFormSelect>
            {fieldErrors.TTR_COAFEC && <div className="text-danger small mb-2">{fieldErrors.TTR_COAFEC}</div>}

            <CFormSelect
              label="Donante"
              name="TTR_CODONT"
              value={edit?.TTR_CODONT || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
            >
              <option value="">Seleccione donante</option>
              {donantes.map(d => (
                <option key={d.TMA_CODONT} value={d.TMA_CODONT}>
                  {d.TMA_NOMBRE} - {d.TMA_CEDULA}
                </option>
              ))}
            </CFormSelect>
            {fieldErrors.TTR_CODONT && <div className="text-danger small mb-2">{fieldErrors.TTR_CODONT}</div>}

            <CFormSelect
              label="Tipo de Donación"
              name="TTR_TIPODO"
              value={edit?.TTR_TIPODO || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
            >
              <option value="">Seleccione tipo de donación</option>
              {tiposDonacion.map(t => (
                <option key={t.TTR_ESTIDO} value={t.TTR_ESTIDO}>
                  {t.TTR_NOMBRE}
                </option>
              ))}
            </CFormSelect>
            {fieldErrors.TTR_TIPODO && <div className="text-danger small mb-2">{fieldErrors.TTR_TIPODO}</div>}

            <CFormInput
              label="Descripción"
              name="TTR_DESCRI"
              value={edit?.TTR_DESCRI || ''}
              onChange={handleEditChange}
              className="mb-2"
              placeholder="Detalle de la donación (opcional)"
            />
            {fieldErrors.TTR_DESCRI && <div className="text-danger small mb-2">{fieldErrors.TTR_DESCRI}</div>}

            <CModalFooter className="d-flex justify-content-end gap-2">
              <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => { setShowModal(false); setFieldErrors({}); }}>Cancelar</CButton>
              <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} type="submit">Guardar</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>

      {/* Modal de confirmación de eliminación (sin window.confirm) */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static" keyboard={false}>
        <CModalHeader>Confirmar eliminación</CModalHeader>
        <CModalBody>¿Eliminar esta donación?</CModalBody>
        <CModalFooter className="d-flex justify-content-end gap-2">
          <CButton style={{backgroundColor:'white', color:'#6b6b6b'}} onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={confirmDelete}>Eliminar</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Donaciones