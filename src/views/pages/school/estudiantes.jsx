import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CModal, CModalHeader, CModalBody, CModalFooter, CForm, CFormInput, CFormSelect, CAlert, CPagination, CPaginationItem
} from '@coreui/react'

const API = 'http://localhost:4000'

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

  useEffect(() => {
    fetch(`${API}/donaciones`).then(res => res.json()).then(setDonaciones)
    fetch(`${API}/donantesregistrados`).then(res => res.json()).then(setDonantes)
    fetch(`${API}/afectacion`).then(res => res.json()).then(setAfectaciones)
    fetch(`${API}/tipos-estilo-donacion`).then(res => res.json()).then(setTiposDonacion)
  }, [])

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar esta donación?')) return
    const res = await fetch(`${API}/donaciones/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDonaciones(donaciones.filter(d => d.TTR_CODONA !== id))
      setMsg({ type: 'success', text: 'Donación eliminada.' })
    } else {
      setMsg({ type: 'danger', text: 'No se pudo eliminar.' })
    }
  }

  const handleEdit = donacion => {
    setEdit({ ...donacion })
    setShowModal(true)
    setMsg({ type: '', text: '' })
  }

  const handleEditChange = e => {
    const { name, value } = e.target
    setEdit(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async e => {
    e.preventDefault()
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
    const data = await res.json()
    if (res.ok) {
      setDonaciones(donaciones.map(d => d.TTR_CODONA === edit.TTR_CODONA ? { ...d, ...edit } : d))
      setShowModal(false)
      setMsg({ type: 'success', text: 'Donación actualizada.' })
    } else {
      setMsg({ type: 'danger', text: data.mensaje || 'No se pudo actualizar.' })
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

      {/* Modal de edición */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
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
            />
            <CFormInput
              label="Fecha de Donación"
              name="TTR_FEDONA"
              type="date"
              value={edit?.TTR_FEDONA?.slice(0, 10) || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
            />
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
            <CFormInput
              label="Descripción"
              name="TTR_DESCRI"
              value={edit?.TTR_DESCRI || ''}
              onChange={handleEditChange}
              className="mb-2"
              placeholder="Detalle de la donación (opcional)"
            />
            <CModalFooter>
              <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => setShowModal(false)}>Cancelar</CButton>
              <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} type="submit">Guardar</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </CRow>
  )
}

export default Donaciones