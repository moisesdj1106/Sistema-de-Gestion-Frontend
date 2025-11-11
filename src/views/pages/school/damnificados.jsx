import React, { useEffect, useState } from 'react';
import {
  CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CFormInput, CPagination, CPaginationItem, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormSelect
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';

const DamnificadosModulo = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal edición
  const [visible, setVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '', apelli: '', fenaci: '', contac: '', coafec: '', esalud: '', cedula: '', tipodo: ''
  });
  const [tiposDoc, setTiposDoc] = useState([]);
  const [afectaciones, setAfectaciones] = useState([]);
  const [editId, setEditId] = useState(null);

  const fetchData = () => {
    fetch(`${API}/damnificados/lista?search=${search}&page=${page}`)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setTotal(res.total);
      });
  };

  useEffect(() => { fetchData(); }, [search, page]);
  useEffect(() => {
    fetch(`${API}/documento`).then(res => res.json()).then(setTiposDoc);
    fetch(`${API}/afectacion`).then(res => res.json()).then(setAfectaciones);
  }, []);

  const totalPages = Math.ceil(total / 10);

    const today = new Date();
    const maxBirth = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxFechaNacimiento = maxBirth.toISOString().split('T')[0];


  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar damnificado?')) {
      await fetch(`${API}/damnificados/eliminar/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const openEdit = (d) => {
    setEditForm({
      nombre: d.TTR_NOMBRE || '',
      apelli: d.TTR_APELLI || '',
      fenaci: d.TTR_FENACI ? d.TTR_FENACI.substring(0, 10) : '',
      contac: d.TTR_CONTAC || '',
      coafec: d.TTR_COAFEC || '',
      esalud: d.TTR_ESALUD || '',
      cedula: d.TTR_CEDULA || '',
      tipodo: d.TTR_TIPODO || ''
    });
    setEditId(d.TTR_CODAMN);
    setVisible(true);
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    await fetch(`${API}/damnificados/editar/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setVisible(false);
    fetchData();
  };

  return (
    <CCard>
      <CCardHeader>
        <strong>Damnificados</strong>
      </CCardHeader>
      <CCardBody>
        <CFormInput
          placeholder="Buscar por nombre, apellido o cédula..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="mb-3"
        />
        <CTable responsive hover>
          <CTableHead style={{textAlign:'center'}}>
            <CTableRow>
              <CTableHeaderCell>Tipo Doc</CTableHeaderCell>
              <CTableHeaderCell>Cédula</CTableHeaderCell>
              <CTableHeaderCell>Nombre</CTableHeaderCell>
              <CTableHeaderCell>Apellido</CTableHeaderCell>
              <CTableHeaderCell>Contacto</CTableHeaderCell>
              <CTableHeaderCell>Comunidad afectada</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody style={{textAlign:'center'}}>
            {data.map(d => (
              <CTableRow key={d.TTR_CODAMN}>
                <CTableDataCell>{tiposDoc.find(t => t.TMA_CODDOC === d.TTR_TIPODO)?.TMA_NOMBRE || ''}</CTableDataCell>
                <CTableDataCell>{d.TTR_CEDULA}</CTableDataCell>
                <CTableDataCell>{d.TTR_NOMBRE}</CTableDataCell>
                <CTableDataCell>{d.TTR_APELLI}</CTableDataCell>
                <CTableDataCell>{d.TTR_CONTAC}</CTableDataCell>
                
                <CTableDataCell>
                  {afectaciones.find(a => a.TTR_COAFEC === d.TTR_COAFEC)?.comunidad || d.TTR_COAFEC}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} size="sm" className="me-2" onClick={() => openEdit(d)}>Editar</CButton>
                  <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} size="sm" onClick={() => handleDelete(d.TTR_CODAMN)}>Eliminar</CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        <CPagination align="center" className="mt-3">
          {[...Array(totalPages)].map((_, idx) => (
            <CPaginationItem key={idx+1} active={page === idx+1} onClick={() => setPage(idx+1)}>
              {idx+1}
            </CPaginationItem>
          ))}
        </CPagination>
      </CCardBody>

      {/* Modal editar */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Editar Damnificado</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleEditSubmit}>
            <CFormInput className="mb-2" label="Nombre" name="nombre" value={editForm.nombre} onChange={handleEditChange} required />
            <CFormInput className="mb-2" label="Apellido" name="apelli" value={editForm.apelli} onChange={handleEditChange} required />
            <CFormInput className="mb-2" label="Fecha de nacimiento" type="date" name="fenaci" value={editForm.fenaci} onChange={handleEditChange} required max={maxFechaNacimiento} />
            <CFormInput className="mb-2" label="Contacto" name="contac" value={editForm.contac} onChange={handleEditChange} required min={11} max={11} />
            <CFormSelect className="mb-2" label="Tipo de documento" name="tipodo" value={editForm.tipodo} onChange={handleEditChange} required>
              <option value="">Seleccione tipo</option>
              {tiposDoc.map(t => (
                <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>
              ))}
            </CFormSelect>
            <CFormSelect className="mb-2" label="Comunidad afectada" name="coafec" value={editForm.coafec} onChange={handleEditChange} required>
              <option value="">Seleccione afectación</option>
              {afectaciones.map(a => (
                <option key={a.TTR_COAFEC} value={a.TTR_COAFEC}>{a.comunidad}</option>
              ))}
            </CFormSelect>
            <CFormInput className="mb-2" label="Estado de salud" name="esalud" value={editForm.esalud} onChange={handleEditChange} required />
            <CFormInput className="mb-2" label="Cédula" name="cedula" value={editForm.cedula} onChange={handleEditChange} max={9} min={7} />
            <CModalFooter>
              <CButton color="primary" type="submit">Guardar</CButton>
              <CButton color="secondary" onClick={() => setVisible(false)}>Cancelar</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </CCard>
  );
};

export default DamnificadosModulo;