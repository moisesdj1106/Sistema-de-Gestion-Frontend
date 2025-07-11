import React, { useEffect, useState } from 'react';
import {
  CCard, CCardBody, CCardHeader, CContainer, CRow, CCol,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CInputGroup, CFormInput, CModal, CModalHeader, CModalBody, CModalFooter, CFormSelect, CAlert,
  CPagination,
  CPaginationItem,
} from '@coreui/react';

const API = 'http://localhost:4000';

const ListaPerdidas = () => {
  const [perdidas, setPerdidas] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [editPerdida, setEditPerdida] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [tiposPerdida, setTiposPerdida] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]);
  const [afectaciones, setAfectaciones] = useState([]);

  // Cargar datos
  const fetchPerdidas = async () => {
    const res = await fetch(`${API}/perdidas/lista?search=${search}&page=${page}`);
    const data = await res.json();
    setPerdidas(data.data);
    setTotal(data.total);
  };

  useEffect(() => { fetchPerdidas(); }, [search, page]);

  useEffect(() => {
    fetch(`${API}/tipos-perdida`).then(res => res.json()).then(setTiposPerdida);
    fetch(`${API}/tipos-documento`).then(res => res.json()).then(setTiposDoc);
    fetch(`${API}/afectacion`).then(res => res.json()).then(setAfectaciones);
  }, []);

  // Editar
  const handleEdit = (perdida) => {
    setEditPerdida({ ...perdida });
    setModalEdit(true);
    setMsg({ type: '', text: '' });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditPerdida(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    const payload = {
      coafec: Number(editPerdida.TTR_COAFEC),
      cotipo: Number(editPerdida.TTR_COTIPO),
      vaesti: Number(editPerdida.TTR_VAESTI),
      coddoc: Number(editPerdida.TTR_CODDOC),
      cedula: editPerdida.TTR_CEDULA,
      nombre: editPerdida.TTR_NOMBRE,
      apelli: editPerdida.TTR_APELLI
    };
    const res = await fetch(`${API}/perdidas/editar/${editPerdida.TTR_COPERD}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      setMsg({ type: 'success', text: 'Pérdida actualizada correctamente.' });
      setModalEdit(false);
      fetchPerdidas();
    } else {
      setMsg({ type: 'danger', text: data.message || 'Error al editar.' });
    }
  };

  // Eliminar
  const handleDelete = async () => {
    const res = await fetch(`${API}/perdidas/eliminar/${editPerdida.TTR_COPERD}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      setMsg({ type: 'success', text: 'Pérdida eliminada correctamente.' });
      setModalDelete(false);
      fetchPerdidas();
    } else {
      setMsg({ type: 'danger', text: data.message || 'Error al eliminar.' });
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <CContainer className="py-4" style={{ maxWidth: '100%', width: '100%' }}>
      <CRow className="justify-content-center">
        <CCol xs={12} style={{ maxWidth: '100%' }}>
          <CCard className="shadow-sm">
            <CCardHeader>
              <h5 className="mb-0">Listado de Pérdidas</h5>
            </CCardHeader>
            <CCardBody>
              <CInputGroup className="mb-3" style={{ width: '100%' }}>
                <CFormInput
                  placeholder="Buscar por nombre, apellido, cédula o lugar"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </CInputGroup>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    
                    <CTableHeaderCell>Tipo Doc.</CTableHeaderCell>
                    <CTableHeaderCell>Cédula</CTableHeaderCell>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Apellido</CTableHeaderCell>
                    <CTableHeaderCell>Tipo Pérdida</CTableHeaderCell>
                    <CTableHeaderCell>Valor Estimado Bs</CTableHeaderCell>
                    <CTableHeaderCell>Lugar</CTableHeaderCell>
                    <CTableHeaderCell>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {perdidas.map((p, idx) => (
                    <CTableRow key={p.TTR_COPERD}>
                      
                      <CTableDataCell>{p.tipo_documento}</CTableDataCell>
                      <CTableDataCell>{p.TTR_CEDULA}</CTableDataCell>
                      <CTableDataCell>{p.TTR_NOMBRE}</CTableDataCell>
                      <CTableDataCell>{p.TTR_APELLI}</CTableDataCell>
                      <CTableDataCell>{p.tipo_perdida}</CTableDataCell>
                      <CTableDataCell>{p.TTR_VAESTI}</CTableDataCell>
                      <CTableDataCell>{p.comunidad}</CTableDataCell>
                      <CTableDataCell>
                        <CButton size="sm" style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={() => handleEdit(p)}>Editar</CButton>{' '}
                        <CButton size="sm" style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => { setEditPerdida(p); setModalDelete(true); }}>Eliminar</CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              {/* Paginación centrada con números */}
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
              {/* Modal Editar */}
              <CModal visible={modalEdit} onClose={() => setModalEdit(false)}>
                <CModalHeader closeButton>Editar Pérdida</CModalHeader>
                <CModalBody>
                  {editPerdida && (
                    <form onSubmit={handleEditSubmit}>
                      <CFormSelect
                        label="Afectación"
                        name="TTR_COAFEC"
                        value={editPerdida.TTR_COAFEC}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                      >
                        <option value="">Seleccione afectación</option>
                        {afectaciones.map(a => (
                          <option key={a.TTR_COAFEC} value={a.TTR_COAFEC}>
                            {a.comunidad} - {a.TTR_FEAFEC ? (() => {
                              const fechaStr = a.TTR_FEAFEC.includes('T') ? a.TTR_FEAFEC : `${a.TTR_FEAFEC}T00:00:00`;
                              return new Date(fechaStr).toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
                            })() : ''}
                          </option>
                        ))}
                      </CFormSelect>
                      <CFormSelect
                        label="Tipo de documento"
                        name="TTR_CODDOC"
                        value={editPerdida.TTR_CODDOC}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                      >
                        <option value="">Seleccione tipo de documento</option>
                        {tiposDoc.map(t => (
                          <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>
                        ))}
                      </CFormSelect>
                      <CFormInput
                        label="Cédula"
                        name="TTR_CEDULA"
                        value={editPerdida.TTR_CEDULA}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                      />
                      <CFormInput
                        label="Nombre"
                        name="TTR_NOMBRE"
                        value={editPerdida.TTR_NOMBRE}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                      />
                      <CFormInput
                        label="Apellido"
                        name="TTR_APELLI"
                        value={editPerdida.TTR_APELLI}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                      />
                      <CFormSelect
                        label="Tipo de pérdida"
                        name="TTR_COTIPO"
                        value={editPerdida.TTR_COTIPO}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                      >
                        <option value="">Seleccione tipo de pérdida</option>
                        {tiposPerdida.map(t => (
                          <option key={t.TTR_COTIPO} value={t.TTR_COTIPO}>{t.TTR_NOMBRE}</option>
                        ))}
                      </CFormSelect>
                      <CFormInput
                        label="Valor estimado"
                        name="TTR_VAESTI"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editPerdida.TTR_VAESTI}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                      />
                      <CModalFooter>
                        <CButton color="primary" type="submit">Guardar</CButton>
                        <CButton color="secondary" onClick={() => setModalEdit(false)}>Cancelar</CButton>
                      </CModalFooter>
                    </form>
                  )}
                </CModalBody>
              </CModal>
              {/* Modal Eliminar */}
              <CModal visible={modalDelete} onClose={() => setModalDelete(false)}>
                <CModalHeader closeButton>Eliminar Pérdida</CModalHeader>
                <CModalBody>
                  ¿Seguro que desea eliminar esta pérdida?
                </CModalBody>
                <CModalFooter>
                  <CButton color="danger" onClick={handleDelete}>Eliminar</CButton>
                  <CButton color="secondary" onClick={() => setModalDelete(false)}>Cancelar</CButton>
                </CModalFooter>
              </CModal>
              {msg.text && (
                <CAlert color={msg.type} className="mt-3">{msg.text}</CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ListaPerdidas;