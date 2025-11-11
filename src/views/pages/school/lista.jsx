import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CModal, CModalHeader, CModalBody, CModalFooter, CForm, CFormInput, CFormSelect, CAlert, CPagination, CPaginationItem
} from '@coreui/react'

const API = 'https://sistema-de-gestion-backend.onrender.com'

const ListaDonantesFull = () => {
  const [donantes, setDonantes] = useState([])
  const [edit, setEdit] = useState(null)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [showModal, setShowModal] = useState(false)
  const [tiposDonante, setTiposDonante] = useState([])
  const [tiposDocumento, setTiposDocumento] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetch(`${API}/donantesfull`).then(res => res.json()).then(setDonantes)
    fetch(`${API}/tipos-donante`).then(res => res.json()).then(setTiposDonante)
    fetch(`${API}/documento`).then(res => res.json()).then(setTiposDocumento)
  }, [])

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar este donante?')) return
    const res = await fetch(`${API}/donantes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDonantes(donantes.filter(d => d.TMA_CODONT !== id))
      setMsg({ type: 'success', text: 'Donante eliminado.' })
    } else {
      setMsg({ type: 'danger', text: 'No se pudo eliminar.' })
    }
  }

  const handleEdit = donante => {
    setEdit({
      ...donante,
      TMA_TIPODN: tiposDonante.find(t => t.TTR_NOMBRE === donante.tipo_donante)?.TTR_TIPODN || '',
      TMA_CODDOC: tiposDocumento.find(t => t.TMA_NOMBRE === donante.tipo_documento)?.TMA_CODDOC || ''
    })
    setShowModal(true)
    setMsg({ type: '', text: '' })
  }

  const handleEditChange = e => {
    const { name, value } = e.target
    setEdit(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async e => {
    e.preventDefault()
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
    const data = await res.json()
    if (res.ok) {
      fetch(`${API}/donantesfull`).then(res => res.json()).then(setDonantes)
      setShowModal(false)
      setMsg({ type: 'success', text: 'Donante actualizado.' })
    } else {
      setMsg({ type: 'danger', text: data.mensaje || 'No se pudo actualizar.' })
    }
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

      {/* Modal de edición */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
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
            <CFormInput
              label="Contacto"
              name="TMA_CONTAC"
              value={edit?.TMA_CONTAC || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
            />
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
            <CFormInput
              label="Cédula"
              name="TMA_CEDULA"
              value={edit?.TMA_CEDULA || ''}
              onChange={handleEditChange}
              className="mb-2"
              required
              maxLength={9}
              minLength={7}
            />
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

export default ListaDonantesFull