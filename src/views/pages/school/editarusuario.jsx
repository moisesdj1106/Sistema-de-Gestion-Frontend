import React, { useEffect, useState } from 'react';
import { CContainer, CCard, CCardHeader, CCardBody, CFormInput, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';

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

  // Cargar usuarios
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios`);
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      alert('Error al cargar usuarios');
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

  // Eliminar usuario
  const handleEliminar = async (cedula) => {
    if (window.confirm('¿Seguro que deseas eliminar este usuario?')) {
      try {
        const res = await fetch(`${API}/usuarios/${cedula}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (res.ok) {
          fetchUsuarios();
        } else {
          alert(data.mensaje || 'Error al eliminar usuario');
        }
      } catch (error) {
        alert('Error al eliminar usuario');
      }
    }
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
    setModalEditar(true);
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setFormEdit(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
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
            <table border="1" cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
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
                      <CButton style={{ color:'white', borderColor:'#ff7043', backgroundColor:'#ff7043' }} size="sm" onClick={() => handleEditar(u)}>Editar</CButton>
                      <CButton
                        color="danger text-white"
                        size="sm"
                        style={{ marginLeft: 8 }}
                        onClick={() => handleEliminar(u.cedula)}
                      >
                        Eliminar
                      </CButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-4">
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
          <CModal visible={modalEditar} onClose={() => setModalEditar(false)}>
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
                <CFormInput
                  label="Apellidos"
                  name="apellidos"
                  value={formEdit.apellidos}
                  onChange={handleEditChange}
                  className="mb-2"
                  required
                />
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
                />
                <CFormInput
                  label="Correo"
                  name="correo"
                  value={formEdit.correo}
                  onChange={handleEditChange}
                  className="mb-2"
                />
                <CFormInput
                  label="Usuario"
                  name="usuario"
                  value={formEdit.usuario}
                  onChange={handleEditChange}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Rol"
                  name="rol"
                  value={formEdit.rol}
                  onChange={handleEditChange}
                  className="mb-2"
                  required
                />
                {editMsg && <div className="text-danger mt-2">{editMsg}</div>}
              </CModalBody>
              <CModalFooter>
                <CButton color="danger text-white" onClick={() => setModalEditar(false)}>
                  Cancelar
                </CButton>
                <CButton style={{ color:'white', borderColor:'#ff7043', backgroundColor:'#ff7043' }} type="submit">
                  Guardar
                </CButton>
              </CModalFooter>
            </form>
          </CModal>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default Usuarios;