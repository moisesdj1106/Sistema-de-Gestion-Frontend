import React, { useEffect, useState, useRef } from 'react';
import {
  CContainer, CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CInputGroup, CInputGroupText, CFormInput,
  CPagination, CPaginationItem, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormSelect, CCardTitle, CCardText
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';

const ListadoAfectaciones = () => {
  const [afectaciones, setAfectaciones] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [desastres, setDesastres] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modales y edición
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ codcom: '', feafec: '', codesa: '' });
  const [showEdit, setShowEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', color: 'success' });

  // validación editar
  const [errorsEdit, setErrorsEdit] = useState({});
  const [isSmall, setIsSmall] = useState(window.innerWidth < 768);

  // refs y navegación Enter
  const codcomRef = useRef(null);
  const codesaRef = useRef(null);
  const feafecRef = useRef(null);
  const saveRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchAll = () => {
    fetch(`${API}/afectaciones`).then(res => res.json()).then(setAfectaciones).catch(console.error);
    fetch(`${API}/comunidades`).then(res => res.json()).then(setComunidades).catch(console.error);
    fetch(`${API}/parroquias`).then(res => res.json()).then(setParroquias).catch(console.error);
    fetch(`${API}/desastres`).then(res => res.json()).then(setDesastres).catch(console.error);
  };

  useEffect(() => { fetchAll(); }, []);

  // Mapas para acceso rápido
  const comunidadesMap = Object.fromEntries(comunidades.map(c => [c.TMA_CODCOM, c]));
  const parroquiasMap = Object.fromEntries(parroquias.map(p => [p.TMA_COPARR, p]));
  const desastresMap = Object.fromEntries(desastres.map(d => [d.TMA_CODESA, d]));

  // Filtrado por búsqueda
  const afectacionesFiltradas = afectaciones.filter(afec => {
    const comunidad = comunidadesMap[afec.TTR_CODCOM]?.TMA_NOMBRE || '';
    const parroquia = parroquiasMap[comunidadesMap[afec.TTR_CODCOM]?.TMA_COPARR]?.TMA_NOMBRE || '';
    return (
      comunidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      parroquia.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(afectacionesFiltradas.length / itemsPerPage));
  const afectacionesToShow = afectacionesFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Editar
  const handleEditOpen = (afec) => {
    setEditId(afec.TTR_COAFEC);
    setEditForm({
      codcom: afec.TTR_CODCOM,
      feafec: afec.TTR_FEAFEC ? afec.TTR_FEAFEC.split('T')[0] : '',
      codesa: afec.TTR_CODESA
    });
    setErrorsEdit({});
    setShowEdit(true);
    setTimeout(() => { if (codcomRef.current) codcomRef.current.focus(); }, 120);
  };

  // helpers: fecha máxima local YYYY-MM-DD para bloquear futuras
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  const maxFechaLocal = localToday.toISOString().split('T')[0];

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    validateEditField(name, value);
  };

  const validateEditField = (name, value) => {
    const v = String(value ?? '').trim();
    let msg = '';
    if (name === 'codcom') {
      if (!v) msg = 'Seleccione comunidad';
    }
    if (name === 'codesa') {
      if (!v) msg = 'Seleccione desastre';
    }
    if (name === 'feafec') {
      if (!v) msg = 'Fecha obligatoria';
      else if (v > maxFechaLocal) msg = 'La fecha no puede ser futura';
    }
    setErrorsEdit(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const validateEditAll = () => {
    const fields = ['codcom', 'codesa', 'feafec'];
    const newErr = {};
    fields.forEach(f => {
      const ok = validateEditField(f, editForm[f]);
      if (!ok) newErr[f] = true;
    });
    setErrorsEdit(prev => ({ ...prev })); // individual messages already set
    return Object.keys(newErr).length === 0;
  };

  const handleEditSave = async () => {
    // validar
    const fieldsOrder = ['codcom','codesa','feafec'];
    const invalid = fieldsOrder.find(f => !validateEditField(f, editForm[f]));
    if (invalid) {
      // enfocar primer error
      const map = { codcom: codcomRef, codesa: codesaRef, feafec: feafecRef };
      if (map[invalid] && map[invalid].current) map[invalid].current.focus();
      setToast({ show: false, message: '', color: 'danger' });
      return;
    }

    // enviar
    try {
      const res = await fetch(`${API}/afectaciones/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TTR_CODCOM: editForm.codcom,
          TTR_FEAFEC: editForm.feafec,
          TTR_CODESA: editForm.codesa
        })
      });
      if (res.ok) {
        setToast({ show: true, message: 'Afectación actualizada', color: 'info' });
        setShowEdit(false);
        fetchAll();
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({ show: true, message: err.mensaje || 'Error al actualizar', color: 'danger' });
      }
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Error de conexión', color: 'danger' });
    }
  };

  // Eliminar
  const handleDelete = async () => {
    const res = await fetch(`${API}/afectaciones/${deleteId}`, { method: 'DELETE' });
    if (res.ok) {
      setToast({ show: true, message: 'Afectación eliminada', color: 'warning' });
      setShowDelete(false);
      fetchAll();
    } else {
      setToast({ show: true, message: 'Error al eliminar', color: 'danger' });
    }
  };

  return (
    <CContainer className="py-4">
      {/* Modal centrado para éxito o error */}
      <CModal
        alignment="center"
        visible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      >
        <CModalHeader>
          <CModalTitle>{toast.color === 'danger' ? 'Error' : 'Mensaje'}</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center">
          <span style={{ color: toast.color === 'danger' ? 'red' : (toast.color === 'warning' ? '#ff7043' : 'green') }}>
            {toast.message}
          </span>
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={() => setToast({ ...toast, show: false })}>
            Aceptar
          </CButton>
        </CModalFooter>
      </CModal>

      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Afectaciones Registradas</strong>
          <CInputGroup style={{ width: isSmall ? '100%' : 300 }}>
            <CInputGroupText>Buscar</CInputGroupText>
            <CFormInput
              size="sm"
              placeholder="Comunidad o Parroquia"
              value={busqueda}
              onChange={e => {
                setBusqueda(e.target.value);
                setCurrentPage(1);
              }}
            />
          </CInputGroup>
        </CCardHeader>
        <CCardBody style={{ padding: 0 }}>
          {/* Responsive: cards en pantallas pequeñas */}
          {isSmall ? (
            <div className="p-3 d-flex flex-column gap-3">
              {afectacionesToShow.map(afec => {
                const comunidad = comunidadesMap[afec.TTR_CODCOM];
                const parroquia = parroquiasMap[comunidad?.TMA_COPARR];
                const desastre = desastresMap[afec.TTR_CODESA];
                return (
                  <CCard key={afec.TTR_COAFEC} className="p-2">
                    <CCardBody className="p-2">
                      <CCardTitle style={{ fontSize: 16, marginBottom: 4 }}>{comunidad?.TMA_NOMBRE || afec.TTR_CODCOM}</CCardTitle>
                      <CCardText style={{ marginBottom: 6, fontSize: 13 }}>
                        <strong>Parroquia:</strong> {parroquia?.TMA_NOMBRE || '-'} <br />
                        <strong>Desastre:</strong> {desastre?.TMA_NOMBRE || '-'} <br />
                        <strong>Fecha:</strong> {afec.TTR_FEAFEC ? afec.TTR_FEAFEC.split('T')[0] : '-'}
                      </CCardText>
                      <div className="d-flex gap-2">
                        <CButton size="sm" style={{ backgroundColor: 'white', color: '#ff7043', borderColor: '#ff7043' }} onClick={() => handleEditOpen(afec)}>Editar</CButton>
                        <CButton size="sm" style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }} onClick={() => { setDeleteId(afec.TTR_COAFEC); setShowDelete(true); }}>Eliminar</CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                );
              })}
            </div>
          ) : (
            <CTable
              align="middle"
              hover
              className="mb-0"
              style={{
                tableLayout: 'auto',
                fontSize: '0.93rem',
                textAlign: 'center',
                width: '100%',
              }}
            >
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Comunidad</CTableHeaderCell>
                  <CTableHeaderCell>Parroquia</CTableHeaderCell>
                  <CTableHeaderCell>Desastre</CTableHeaderCell>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {afectacionesToShow.map(afec => {
                  const comunidad = comunidadesMap[afec.TTR_CODCOM];
                  const parroquia = parroquiasMap[comunidad?.TMA_COPARR];
                  const desastre = desastresMap[afec.TTR_CODESA];
                  return (
                    <CTableRow key={afec.TTR_COAFEC}>
                      <CTableDataCell>{comunidad?.TMA_NOMBRE || afec.TTR_CODCOM}</CTableDataCell>
                      <CTableDataCell>{parroquia?.TMA_NOMBRE || ''}</CTableDataCell>
                      <CTableDataCell>{desastre?.TMA_NOMBRE || afec.TTR_CODESA}</CTableDataCell>
                      <CTableDataCell>{afec.TTR_FEAFEC ? afec.TTR_FEAFEC.split('T')[0] : ''}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex flex-column align-items-center">
                          <CButton
                            style={{
                              backgroundColor: 'white',
                              color: '#ff7043',
                              minWidth: 90,
                              maxWidth: 90,
                              borderColor: '#ff7043'
                            }}
                            size="sm"
                            className="mb-1"
                            onClick={() => handleEditOpen(afec)}
                          >
                            Editar
                          </CButton>
                          <CButton
                            size="sm"
                            style={{
                              minWidth: 90,
                              maxWidth: 90,
                              backgroundColor: 'white',
                              color: 'red',
                              borderColor: 'red'
                            }}
                            onClick={() => { setDeleteId(afec.TTR_COAFEC); setShowDelete(true); }}
                          >
                            Eliminar
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>
          )}

          {/* Paginación */}
          <div className="d-flex justify-content-center my-3">
            <CPagination align="center" className="mb-0">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                &laquo;
              </CPaginationItem>
              {[...Array(totalPages)].map((_, idx) => (
                <CPaginationItem
                  key={idx + 1}
                  active={currentPage === idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                &raquo;
              </CPaginationItem>
            </CPagination>
          </div>
        </CCardBody>
      </CCard>

      {/* Modal Editar */}
      <CModal visible={showEdit} onClose={() => { setShowEdit(false); setErrorsEdit({}); }}>
        <CModalHeader>
          <CModalTitle>Editar Afectación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect
              label="Comunidad"
              name="codcom"
              value={editForm.codcom}
              onChange={handleEditChange}
              required
              className="mb-3"
              ref={codcomRef}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (codesaRef.current) codesaRef.current.focus(); } }}
            >
              <option value="">Seleccione comunidad</option>
              {comunidades.map(c => (
                <option key={c.TMA_CODCOM} value={c.TMA_CODCOM}>{c.TMA_NOMBRE}</option>
              ))}
            </CFormSelect>
            {errorsEdit.codcom && <div className="text-danger small mb-2">{errorsEdit.codcom}</div>}

            <CFormSelect
              label="Desastre"
              name="codesa"
              value={editForm.codesa}
              onChange={handleEditChange}
              required
              className="mb-3"
              ref={codesaRef}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (feafecRef.current) feafecRef.current.focus(); } }}
            >
              <option value="">Seleccione desastre</option>
              {desastres.map(d => (
                <option key={d.TMA_CODESA} value={d.TMA_CODESA}>{d.TMA_NOMBRE}</option>
              ))}
            </CFormSelect>
            {errorsEdit.codesa && <div className="text-danger small mb-2">{errorsEdit.codesa}</div>}

            <CFormInput
              label="Fecha de Afectación"
              name="feafec"
              type="date"
              value={editForm.feafec}
              onChange={handleEditChange}
              required
              className="mb-3"
              max={maxFechaLocal}
              ref={feafecRef}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (saveRef.current) saveRef.current.focus(); } }}
            />
            {errorsEdit.feafec && <div className="text-danger small mb-2">{errorsEdit.feafec}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={handleEditSave} ref={saveRef}>Guardar</CButton>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => setShowEdit(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={showDelete} onClose={() => setShowDelete(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar Afectación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que deseas eliminar esta afectación?
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={handleDelete}>Eliminar</CButton>
          <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={() => setShowDelete(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListadoAfectaciones;