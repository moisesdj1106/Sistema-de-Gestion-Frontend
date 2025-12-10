import React, { useEffect, useState } from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody, CFormInput, CButton, CModal, CModalHeader,
  CModalTitle, CModalBody, CModalFooter, CRow, CCol, CForm
} from '@coreui/react'

const API = 'https://sistema-de-gestion-backend.onrender.com'
/*const API = 'http://localhost:4000';*/

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const porPagina = 10

  // Modal edición
  const [modalEditar, setModalEditar] = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState(null)
  const [formEdit, setFormEdit] = useState({
    nombres: '', apellidos: '', direccion: '', telefono: '', correo: '', usuario: '', rol: ''
  })
  const [editMsg, setEditMsg] = useState('')
  const [errors, setErrors] = useState({})

  // Modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState(false)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null)

  // Cargar usuarios
  const fetchUsuarios = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/usuarios`)
      if (!res.ok) throw new Error('Error al obtener usuarios')
      const data = await res.json()
      setUsuarios(Array.isArray(data) ? data : [])
    } catch (error) {
      setEditMsg('Error al cargar usuarios')
      setUsuarios([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  // Filtrado
  const usuariosFiltrados = usuarios.filter(u =>
    (u.nombres?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
    (u.apellidos?.toLowerCase() || '').includes(busqueda.toLowerCase())
  )

  // Paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / porPagina)
  const usuariosAMostrar = usuariosFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  )

  useEffect(() => {
    setPagina(1)
  }, [busqueda])

  // Validación de campos
  const validateFields = () => {
    const newErrors = {}
    if (!formEdit.nombres) newErrors.nombres = 'Nombres son obligatorios'
    if (!formEdit.apellidos) newErrors.apellidos = 'Apellidos son obligatorios'
    if (!formEdit.telefono || String(formEdit.telefono).trim().length !== 11) newErrors.telefono = 'Teléfono debe tener 11 dígitos'
    if (!formEdit.correo) newErrors.correo = 'Correo es obligatorio'
    if (!formEdit.usuario) newErrors.usuario = 'Usuario es obligatorio'
    if (!formEdit.rol) newErrors.rol = 'Rol es obligatorio'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Eliminar usuario
  const handleEliminar = (cedula) => {
    setUsuarioAEliminar(cedula)
    setModalEliminar(true)
  }

  const confirmarEliminar = async () => {
    if (usuarioAEliminar) {
      try {
        const res = await fetch(`${API}/usuarios/${usuarioAEliminar}`, {
          method: 'DELETE'
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          fetchUsuarios()
        } else {
          setEditMsg(data.mensaje || 'Error al eliminar usuario')
        }
      } catch (error) {
        setEditMsg('Error al eliminar usuario')
      }
    }
    setModalEliminar(false)
  }

  // Editar usuario
  const handleEditar = (usuario) => {
    setUsuarioEditar(usuario)
    setFormEdit({
      nombres: usuario.nombres || '',
      apellidos: usuario.apellidos || '',
      direccion: usuario.direccion || '',
      telefono: usuario.telefono || '',
      correo: usuario.correo || '',
      usuario: usuario.usuario || '',
      rol: usuario.rol || ''
    })
    setEditMsg('')
    setErrors({})
    setModalEditar(true)
  }

  const handleEditChange = e => {
    const { name, value } = e.target
    setFormEdit(prev => ({ ...prev, [name]: value }))
    // validar en directo de manera ligera
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleEditSubmit = async e => {
    e.preventDefault()
    if (!validateFields()) return
    setEditMsg('')
    try {
      const res = await fetch(`${API}/usuarios/${usuarioEditar.cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdit)
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setEditMsg('Usuario actualizado correctamente')
        setModalEditar(false)
        fetchUsuarios()
      } else {
        setEditMsg(data.mensaje || 'Error al actualizar usuario')
      }
    } catch {
      setEditMsg('Error de conexión')
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <CContainer className="py-4">
      {/* estilos simples para responsividad y botones uniformes */}
      <style>{`
        .usuarios-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .usuarios-table th, .usuarios-table td { padding: 8px; text-align: center; vertical-align: middle; }
        .actions-row { display: flex; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap; }
        .action-btn { min-width: 96px; height: 34px; border-radius: 6px; padding: 6px 8px; }
        @media (max-width: 768px) {
          .usuarios-table { min-width: 0; font-size: 0.92rem; }
          .table-wrapper { overflow-x: auto; }
          /* en pantallas pequeñas usamos layout en columna para cada fila: */
          .row-card { display: grid; grid-template-columns: 1fr; gap: 6px; padding: 10px; border-bottom: 1px solid rgba(0,0,0,0.06); text-align: left; }
          .row-card .field { font-size: 0.92rem; color: #333; }
          .row-card .field strong{ display:inline-block; width: 110px; color:#555; }
          .desktop-only { display: none; }
        }
        @media (min-width: 769px) {
          .mobile-card { display: none; }
        }
      `}</style>

      <CCard>
        <CCardHeader>
          <strong>Listado de Usuarios</strong>
        </CCardHeader>
        <CCardBody>
          <CFormInput
            placeholder="Buscar por nombre o apellido..."
            className="mb-3"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />

          {/* tabla para desktop/mediana */}
          <div className="table-wrapper">
            <table className="usuarios-table desktop-only" border="1" style={{ borderCollapse: 'collapse', fontSize: '0.97rem' }}>
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosAMostrar.map(u => (
                  <tr key={u.cedula}>
                    <td>{u.cedula}</td>
                    <td>{u.nombres}</td>
                    <td>{u.apellidos}</td>
                    <td>{u.direccion}</td>
                    <td>{u.telefono}</td>
                    <td>{u.correo}</td>
                    <td>{u.usuario}</td>
                    <td>{u.rol}</td>
                    <td>
                      <div className="actions-row">
                        <CButton
                          className="action-btn"
                          style={{ color: '#ff7043', borderColor: '#ff7043', backgroundColor: 'white' }}
                          size="sm"
                          onClick={() => handleEditar(u)}
                        >
                          Editar
                        </CButton>
                        <CButton
                          className="action-btn"
                          style={{ color: 'red', borderColor: 'red', backgroundColor: 'white' }}
                          size="sm"
                          onClick={() => handleEliminar(u.cedula)}
                        >
                          Eliminar
                        </CButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* tarjetas para mobile */}
            <div className="mobile-card">
              {usuariosAMostrar.map(u => (
                <div key={u.cedula} className="row-card">
                  <div className="field"><strong>Cédula:</strong> {u.cedula}</div>
                  <div className="field"><strong>Nombre:</strong> {u.nombres} {u.apellidos}</div>
                  <div className="field"><strong>Teléfono:</strong> {u.telefono}</div>
                  <div className="field"><strong>Correo:</strong> {u.correo}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <CButton
                      className="action-btn"
                      style={{ color: '#ff7043', borderColor: '#ff7043', backgroundColor: 'white', flex: 1 }}
                      size="sm"
                      onClick={() => handleEditar(u)}
                    >
                      Editar
                    </CButton>
                    <CButton
                      className="action-btn"
                      style={{ color: 'red', borderColor: 'red', backgroundColor: 'white', flex: 1 }}
                      size="sm"
                      onClick={() => handleEliminar(u.cedula)}
                    >
                      Eliminar
                    </CButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-4 flex-wrap">
              <CButton
                style={{ marginRight: 8 }}
                color="secondary"
                variant="outline"
                disabled={pagina === 1}
                onClick={() => setPagina(pagina - 1)}
              >
                Anterior
              </CButton>
              {[...Array(totalPaginas)].map((_, idx) => (
                <CButton
                  key={idx}
                  color={pagina === idx + 1 ? 'primary' : 'secondary'}
                  variant={pagina === idx + 1 ? 'solid' : 'outline'}
                  style={{ margin: '0 4px' }}
                  onClick={() => setPagina(idx + 1)}
                >
                  {idx + 1}
                </CButton>
              ))}
              <CButton
                style={{ marginLeft: 8 }}
                color="secondary"
                variant="outline"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(pagina + 1)}
              >
                Siguiente
              </CButton>
            </div>
          )}

          {/* Modal editar: campos en grid para responsividad */}
          <CModal visible={modalEditar} onClose={() => setModalEditar(false)} backdrop="static" keyboard={false} size="lg">
            <CModalHeader>
              <CModalTitle>Editar Usuario</CModalTitle>
            </CModalHeader>
            <form onSubmit={handleEditSubmit}>
              <CModalBody>
                <CRow className="g-2">
                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Nombres"
                      name="nombres"
                      value={formEdit.nombres}
                      onChange={handleEditChange}
                      required
                    />
                    {errors.nombres && <div className="text-danger">{errors.nombres}</div>}
                  </CCol>
                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Apellidos"
                      name="apellidos"
                      value={formEdit.apellidos}
                      onChange={handleEditChange}
                      required
                    />
                    {errors.apellidos && <div className="text-danger">{errors.apellidos}</div>}
                  </CCol>
                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Teléfono"
                      name="telefono"
                      value={formEdit.telefono}
                      onChange={handleEditChange}
                      maxLength={11}
                      minLength={11}
                    />
                    {errors.telefono && <div className="text-danger">{errors.telefono}</div>}
                  </CCol>
                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Correo"
                      name="correo"
                      value={formEdit.correo}
                      onChange={handleEditChange}
                    />
                    {errors.correo && <div className="text-danger">{errors.correo}</div>}
                  </CCol>
                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Usuario"
                      name="usuario"
                      value={formEdit.usuario}
                      onChange={handleEditChange}
                      required
                    />
                    {errors.usuario && <div className="text-danger">{errors.usuario}</div>}
                  </CCol>
                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Rol"
                      name="rol"
                      value={formEdit.rol}
                      onChange={handleEditChange}
                      required
                    />
                    {errors.rol && <div className="text-danger">{errors.rol}</div>}
                  </CCol>
                  <CCol xs={12}>
                    <CFormInput
                      label="Dirección"
                      name="direccion"
                      value={formEdit.direccion}
                      onChange={handleEditChange}
                    />
                  </CCol>
                </CRow>
                {editMsg && <div className="text-danger mt-2">{editMsg}</div>}
              </CModalBody>
              <CModalFooter>
                <CButton style={{ color: 'red', borderColor: 'red', backgroundColor: 'white' }} onClick={() => setModalEditar(false)}>
                  Cancelar
                </CButton>
                <CButton style={{ color: '#ff7043', borderColor: '#ff7043', backgroundColor: 'white' }} type="submit">
                  Guardar
                </CButton>
              </CModalFooter>
            </form>
          </CModal>

          {/* Modal de confirmación de eliminación */}
          <CModal visible={modalEliminar} onClose={() => setModalEliminar(false)} backdrop="static" keyboard={false}>
            <CModalHeader>
              <CModalTitle>Confirmar Eliminación</CModalTitle>
            </CModalHeader>
            <CModalBody>
              ¿Seguro que deseas eliminar este usuario?
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setModalEliminar(false)}>Cancelar</CButton>
              <CButton style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }} onClick={confirmarEliminar}>Eliminar</CButton>
            </CModalFooter>
          </CModal>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Usuarios