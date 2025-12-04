import React, { useEffect, useState } from 'react';
import { CContainer, CCard, CCardHeader, CCardBody, CFormInput, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';
/*const API = 'http://localhost:4000';*/

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  // Modal edición
  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [formEdit, setFormEdit] = useState({
    nombres: '', apellidos: '', direccion: '', telefono: '', correo: '', usuario: '', rol: ''
  });
  const [editMsg, setEditMsg] = useState('');
  const [errors, setErrors] = useState({});

  // Modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  // Cargar usuarios
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios`);
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      setEditMsg('Error al cargar usuarios');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Filtrado
  const usuariosFiltrados = usuarios.filter(u =>
    (u.nombres?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
    (u.apellidos?.toLowerCase() || '').includes(busqueda.toLowerCase())
  );

  // Paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / porPagina);
  const usuariosAMostrar = usuariosFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  // Validación de campos
  const validateFields = () => {
    const newErrors = {};
    if (!formEdit.nombres) newErrors.nombres = 'Nombres son obligatorios';
    if (!formEdit.apellidos) newErrors.apellidos = 'Apellidos son obligatorios';
    if (!formEdit.telefono || formEdit.telefono.length !== 11) newErrors.telefono = 'Teléfono debe tener 11 dígitos';
    if (!formEdit.correo) newErrors.correo = 'Correo es obligatorio';
    if (!formEdit.usuario) newErrors.usuario = 'Usuario es obligatorio';
    if (!formEdit.rol) newErrors.rol = 'Rol es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Eliminar usuario
  const handleEliminar = (cedula) => {
    setUsuarioAEliminar(cedula);
    setModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (usuarioAEliminar) {
      try {
        const res = await fetch(`${API}/usuarios/${usuarioAEliminar}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (res.ok) {
          fetchUsuarios();
        } else {
          setEditMsg(data.mensaje || 'Error al eliminar usuario');
        }
      } catch (error) {
        setEditMsg('Error al eliminar usuario');
      }
    }
    setModalEliminar(false);
  };

  // Editar usuario
  const handleEditar = (usuario) => {
    setUsuarioEditar(usuario);
    setFormEdit({
      nombres: usuario.nombres || '',
      apellidos: usuario.apellidos || '',
      direccion: usuario.direccion || '',
      telefono: usuario.telefono || '',
      correo: usuario.correo || '',
      usuario: usuario.usuario || '',
      rol: usuario.rol || ''
    });
    setEditMsg('');
    setErrors({});
    setModalEditar(true);
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setFormEdit(prev => ({ ...prev, [name]: value }));
    validateFields(); // Validar en tiempo real
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    if (!validateFields()) return; // Validar antes de enviar
    setEditMsg('');
    try {
      const res = await fetch(`${API}/usuarios/${usuarioEditar.cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdit)
      });
      const data = await res.json();
      if (res.ok) {
        setEditMsg('Usuario actualizado correctamente');
        setModalEditar(false);
        fetchUsuarios();
      } else {
        setEditMsg(data.mensaje || 'Error al actualizar usuario');
      }
    } catch {
      setEditMsg('Error de conexión');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <CContainer className="py-4">
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
          <div style={{ overflowX: 'auto' }}>
            <table
              border="1"
              cellPadding={8}
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 600,
                fontSize: '0.97rem',
                textAlign: 'center'
              }}
            >
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
                      <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2">
                        <CButton style={{ color:'#ff7043', borderColor:'#ff7043', backgroundColor:'white' }} size="sm" onClick={() => handleEditar(u)}>
                          Editar
                        </CButton>
                        <CButton
                          style={{ color:'red', borderColor:'red', backgroundColor:'white' }}
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
                  color={pagina === idx + 1 ? "primary" : "secondary"}
                  variant={pagina === idx + 1 ? "solid" : "outline"}
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

          {/* Modal editar */}
          <CModal visible={modalEditar} onClose={() => setModalEditar(false)} backdrop="static" keyboard={false}>
            <CModalHeader>
              <CModalTitle>Editar Usuario</CModalTitle>
            </CModalHeader>
            <form onSubmit={handleEditSubmit}>
              <CModalBody>
                <CFormInput
                  label="Nombres"
                  name="nombres"
                  value={formEdit.nombres}
                  onChange={handleEditChange}
                  className="mb-2"
                  required
                />
                {errors.nombres && <div className="text-danger">{errors.nombres}</div>}
                <CFormInput
                  label="Apellidos"
                  name="apellidos"
                  value={formEdit.apellidos}
                  onChange={handleEditChange}
                  className="mb-2"
                  required
                />
                {errors.apellidos && <div className="text-danger">{errors.apellidos}</div>}
                <CFormInput
                  label="Dirección"
                  name="direccion"
                  value={formEdit.direccion}
                  onChange={handleEditChange}
                  className="mb-2"
                />
                <CFormInput
                  label="Teléfono"
                  name="telefono"
                  value={formEdit.telefono}
                  onChange={handleEditChange}
                  className="mb-2"
                  maxLength={11}
                  minLength={11}
                />
                {errors.telefono && <div className="text-danger">{errors.telefono}</div>}
                <CFormInput
                  label="Correo"
                  name="correo"
                  value={formEdit.correo}
                  onChange={handleEditChange}
                  className="mb-2"
                />
                {errors.correo && <div className="text-danger">{errors.correo}</div>}
                <CFormInput
                  label="Usuario"
                  name="usuario"
                  value={formEdit.usuario}
                  onChange={handleEditChange}
                  className="mb-2"
                  required
                />
                {errors.usuario && <div className="text-danger">{errors.usuario}</div>}
                <CFormInput
                  label="Rol"
                  name="rol"
                  value={formEdit.rol}
                  onChange={handleEditChange}
                  className="mb-2"
                  required
                />
                {errors.rol && <div className="text-danger">{errors.rol}</div>}
                {editMsg && <div className="text-danger mt-2">{editMsg}</div>}
              </CModalBody>
              <CModalFooter>
                <CButton  style={{ color:'red', borderColor:'red', backgroundColor:'white' }} onClick={() => setModalEditar(false)}>
                  Cancelar
                </CButton>
                <CButton style={{ color:'#ff7043', borderColor:'#ff7043', backgroundColor:'white' }} type="submit">
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
              <CButton color="danger" onClick={confirmarEliminar}>Eliminar</CButton>
            </CModalFooter>
          </CModal>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default Usuarios;