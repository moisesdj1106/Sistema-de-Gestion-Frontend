import React, { useEffect, useState, useRef } from 'react';
import {
  CContainer, CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CInputGroup, CInputGroupText, CFormInput,
  CPagination, CPaginationItem, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormSelect, CCardTitle, CCardText, CRow, CCol, CAlert
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

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ codcom: '', feafec: '', codesa: '' });
  const [showEdit, setShowEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', color: 'success' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [errorsEdit, setErrorsEdit] = useState({});
  const [isSmall, setIsSmall] = useState(window.innerWidth < 576);

  const codcomRef = useRef(null);
  const codesaRef = useRef(null);
  const feafecRef = useRef(null);
  const saveRef = useRef(null);

  const historyHandlerRef = useRef(null);
  const historyPushedRef = useRef(false);

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 576);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchSafe = async (url, setter) => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error('Fetch error', url, res.status);
        setter([]);
        return;
      }
      const data = await res.json().catch(() => []);
      setter(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch failed', url, err);
      setter([]);
    }
  };

  const fetchAll = () => {
    fetchSafe(`${API}/afectaciones`, setAfectaciones);
    fetchSafe(`${API}/comunidades`, setComunidades);
    fetchSafe(`${API}/parroquias`, setParroquias);
    fetchSafe(`${API}/desastres`, setDesastres);
  };

  useEffect(() => { fetchAll(); }, []);

  const comunidadesMap = Object.fromEntries((Array.isArray(comunidades) ? comunidades : []).map(c => [c.TMA_CODCOM, c]));
  const parroquiasMap = Object.fromEntries((Array.isArray(parroquias) ? parroquias : []).map(p => [p.TMA_COPARR, p]));
  const desastresMap = Object.fromEntries((Array.isArray(desastres) ? desastres : []).map(d => [d.TMA_CODESA, d]));

  const afectacionesFiltradas = (Array.isArray(afectaciones) ? afectaciones : []).filter(afec => {
    const comunidad = comunidadesMap[afec.TTR_CODCOM]?.TMA_NOMBRE || '';
    const parroquia = parroquiasMap[comunidadesMap[afec.TTR_CODCOM]?.TMA_COPARR]?.TMA_NOMBRE || '';
    return (
      comunidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      parroquia.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil(afectacionesFiltradas.length / itemsPerPage));
  const afectacionesToShow = afectacionesFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditOpen = (afec) => {
    setEditId(afec.TTR_COAFEC);
    setEditForm({
      codcom: afec.TTR_CODCOM,
      feafec: afec.TTR_FEAFEC ? afec.TTR_FEAFEC.split('T')[0] : '',
      codesa: afec.TTR_CODESA
    });
    setErrorsEdit({});
    setMsg({ type: '', text: '' });
    setShowEdit(true);
    setTimeout(() => { if (codcomRef.current) codcomRef.current.focus(); }, 120);
  };

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
    let msgErr = '';
    if (name === 'codcom') {
      if (!v) msgErr = 'Seleccione comunidad';
    }
    if (name === 'codesa') {
      if (!v) msgErr = 'Seleccione desastre';
    }
    if (name === 'feafec') {
      if (!v) msgErr = 'Fecha obligatoria';
      else if (v > maxFechaLocal) msgErr = 'La fecha no puede ser futura';
    }
    setErrorsEdit(prev => ({ ...prev, [name]: msgErr }));
    return msgErr === '';
  };

  const handleEditSave = async () => {
    const fieldsOrder = ['codcom','codesa','feafec'];
    const invalid = fieldsOrder.find(f => !validateEditField(f, editForm[f]));
    if (invalid) {
      const map = { codcom: codcomRef, codesa: codesaRef, feafec: feafecRef };
      if (map[invalid] && map[invalid].current) map[invalid].current.focus();
      setToast({ show: false, message: '', color: 'danger' });
      return;
    }

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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API}/afectaciones/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({ show: true, message: 'Afectación eliminada', color: 'warning' });
        setShowDelete(false);
        fetchAll();
      } else {
        setToast({ show: true, message: 'Error al eliminar', color: 'danger' });
      }
    } catch (err) {
      setToast({ show: true, message: 'Error de conexión', color: 'danger' });
    } finally {
      setDeleteId(null);
    }
  };

  // bloqueo botón Atrás mientras modales abiertos
  useEffect(() => {
    const modalOpen = showEdit || showDelete;
    if (modalOpen && !historyPushedRef.current) {
      try { window.history.pushState({ modalOpen: true }, ''); historyPushedRef.current = true; } catch (e) {}
      const onPop = () => { try { window.history.pushState({ modalOpen: true }, ''); } catch (e) {} };
      historyHandlerRef.current = onPop;
      window.addEventListener('popstate', onPop);
    }
    if (!modalOpen && historyPushedRef.current) {
      if (historyHandlerRef.current) {
        window.removeEventListener('popstate', historyHandlerRef.current);
        historyHandlerRef.current = null;
      }
      try { window.history.back(); } catch (e) {}
      historyPushedRef.current = false;
    }
    return () => {
      if (historyHandlerRef.current) {
        window.removeEventListener('popstate', historyHandlerRef.current);
        historyHandlerRef.current = null;
        historyPushedRef.current = false;
      }
    };
  }, [showEdit, showDelete]);

  const btnBase = { minWidth: 100, height: 36, borderRadius: 6, padding: '6px 10px' };

  return (
    <CContainer className="py-4">
      <style>{`
        .actions-flex { display:flex; gap:8px; justify-content:center; align-items:center; flex-wrap:wrap; }
        .btn-uniform { min-width:100px; height:36px; border-radius:6px; padding:6px 10px; }

        /* Solo mostrar tarjetas en móviles muy pequeños (<576px). Tabla completa en >=576px */
        @media (max-width: 575px) {
          .desktop-table { display:none !important; }
          .mobile-card { display:block; }
        }
        @media (min-width: 576px) {
          .desktop-table { display:block; width:100%; }
          .mobile-card { display:none; }
        }

        .table-wrapper { width:100%; overflow-x:auto; -webkit-overflow-scrolling: touch; padding: 0 8px; box-sizing: border-box; }
        .mobile-card { border:1px solid rgba(0,0,0,0.06); border-radius:8px; padding:10px; margin-bottom:10px; background:#fff; }
        .mobile-field { display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.95rem; }
      `}</style>

      <CCard>
        <CCardBody>
          <CRow className="mb-3">
            <CCol xs={12} className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Afectaciones Registradas</h4>
              <div style={{ width: isSmall ? '100%' : 300, marginTop: isSmall ? 10 : 0 }}>
                <CInputGroup>
                  <CInputGroupText>Buscar</CInputGroupText>
                  <CFormInput
                    size="sm"
                    placeholder="Comunidad o Parroquia"
                    value={busqueda}
                    onChange={e => { setBusqueda(e.target.value); setCurrentPage(1); }}
                  />
                </CInputGroup>
              </div>
            </CCol>
          </CRow>

          {msg.text && <CAlert color={msg.type} className="mb-3">{msg.text}</CAlert>}

          {/* Desktop table */}
          <div className="table-wrapper desktop-table">
            <CTable striped hover responsive>
              <CTableHead style={{ textAlign: 'center' }}>
                <CTableRow>
                  <CTableHeaderCell style={{ textAlign: 'left' }}>Comunidad</CTableHeaderCell>
                  <CTableHeaderCell>Parroquia</CTableHeaderCell>
                  <CTableHeaderCell>Desastre</CTableHeaderCell>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell style={{ textAlign: 'center' }}>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody style={{ textAlign: 'center' }}>
                {afectacionesToShow.map(afec => {
                  const comunidad = comunidadesMap[afec.TTR_CODCOM];
                  const parroquia = parroquiasMap[comunidad?.TMA_COPARR];
                  const desastre = desastresMap[afec.TTR_CODESA];
                  return (
                    <CTableRow key={afec.TTR_COAFEC}>
                      <CTableDataCell style={{ textAlign: 'left' }}>{comunidad?.TMA_NOMBRE || afec.TTR_CODCOM}</CTableDataCell>
                      <CTableDataCell>{parroquia?.TMA_NOMBRE || ''}</CTableDataCell>
                      <CTableDataCell>{desastre?.TMA_NOMBRE || afec.TTR_CODESA}</CTableDataCell>
                      <CTableDataCell>{afec.TTR_FEAFEC ? afec.TTR_FEAFEC.split('T')[0] : ''}</CTableDataCell>
                      <CTableDataCell>
                        <div className="actions-flex" style={{ justifyContent: 'center' }}>
                          <CButton
                            size="sm"
                            className="btn-uniform"
                            style={{ backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043', ...btnBase }}
                            onClick={() => handleEditOpen(afec)}
                          >
                            Editar
                          </CButton>
                          <CButton
                            size="sm"
                            className="btn-uniform"
                            style={{ backgroundColor:'white', color:'red', borderColor:'red', ...btnBase }}
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
          </div>

          {/* Mobile cards */}
          <div className="mobile-card">
            {afectacionesToShow.map(afec => {
              const comunidad = comunidadesMap[afec.TTR_CODCOM];
              const parroquia = parroquiasMap[comunidad?.TMA_COPARR];
              const desastre = desastresMap[afec.TTR_CODESA];
              return (
                <div key={afec.TTR_COAFEC} className="mobile-card" style={{ marginBottom: 12 }}>
                  <div className="mobile-field"><strong>Comunidad</strong><span>{comunidad?.TMA_NOMBRE || afec.TTR_CODCOM}</span></div>
                  <div className="mobile-field"><strong>Parroquia</strong><span>{parroquia?.TMA_NOMBRE || '-'}</span></div>
                  <div className="mobile-field"><strong>Desastre</strong><span>{desastre?.TMA_NOMBRE || '-'}</span></div>
                  <div className="mobile-field"><strong>Fecha</strong><span>{afec.TTR_FEAFEC ? afec.TTR_FEAFEC.split('T')[0] : '-'}</span></div>
                  <div className="d-flex justify-content-center gap-2 mt-2">
                    <CButton size="sm" style={{ ...btnBase, backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043', flex:1 }} onClick={() => handleEditOpen(afec)}>Editar</CButton>
                    <CButton size="sm" style={{ ...btnBase, backgroundColor:'white', color:'red', borderColor:'red', flex:1 }} onClick={() => { setDeleteId(afec.TTR_COAFEC); setShowDelete(true); }}>Eliminar</CButton>
                  </div>
                </div>
              );
            })}
          </div>

          <CPagination align="center" className="mt-3">
            {[...Array(totalPages)].map((_, idx) => (
              <CPaginationItem
                key={idx + 1}
                active={currentPage === idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                style={{ cursor: 'pointer' }}
              >
                {idx + 1}
              </CPaginationItem>
            ))}
          </CPagination>
        </CCardBody>
      </CCard>

      {/* Modal editar (no cerrar con click fuera ni ESC) */}
      <CModal visible={showEdit} onClose={() => { setShowEdit(false); setErrorsEdit({}); }} backdrop="static" keyboard={false}>
        <CModalHeader><CModalTitle>Editar Afectación</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect
              label="Comunidad"
              name="codcom"
              value={editForm.codcom}
              onChange={handleEditChange}
              required
              className="mb-2"
              ref={codcomRef}
            >
              <option value="">Seleccione comunidad</option>
              {Array.isArray(comunidades) && comunidades.map(c => (
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
              className="mb-2"
              ref={codesaRef}
            >
              <option value="">Seleccione desastre</option>
              {Array.isArray(desastres) && desastres.map(d => (
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
              className="mb-2"
              max={maxFechaLocal}
              ref={feafecRef}
            />
            {errorsEdit.feafec && <div className="text-danger small mb-2">{errorsEdit.feafec}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton style={{ ...btnBase, backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043' }} onClick={handleEditSave} ref={saveRef}>Guardar</CButton>
          <CButton style={{ ...btnBase, backgroundColor:'white', color:'red', borderColor:'red' }} onClick={() => setShowEdit(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal eliminar (no cerrar con click fuera ni ESC) */}
      <CModal visible={showDelete} onClose={() => setShowDelete(false)} backdrop="static" keyboard={false}>
        <CModalHeader><CModalTitle>Eliminar Afectación</CModalTitle></CModalHeader>
        <CModalBody>¿Seguro que deseas eliminar esta afectación?</CModalBody>
        <CModalFooter>
          <CButton style={{ ...btnBase, backgroundColor:'white', color:'red', borderColor:'red' }} onClick={handleDelete}>Eliminar</CButton>
          <CButton style={{ ...btnBase, backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043' }} onClick={() => setShowDelete(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListadoAfectaciones;