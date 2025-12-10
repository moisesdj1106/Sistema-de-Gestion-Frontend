import React, { useEffect, useState, useRef } from 'react';
import {
  CContainer, CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CInputGroup, CInputGroupText, CFormInput,
  CPagination, CPaginationItem, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormSelect, CCardTitle, CCardText
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';
/*const API = 'http://localhost:4000';*/

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
    const res = await fetch(`${API}/afectaciones/${deleteId}`, { method: 'DELETE' });
    if (res.ok) {
      setToast({ show: true, message: 'Afectación eliminada', color: 'warning' });
      setShowDelete(false);
      fetchAll();
    } else {
      setToast({ show: true, message: 'Error al eliminar', color: 'danger' });
    }
  };

  useEffect(() => {
    const modalOpen = showEdit || showDelete;
    if (modalOpen && !historyPushedRef.current) {
      try { window.history.pushState({ modalOpen: true }, ''); historyPushedRef.current = true; } catch (e) {}
      const onPop = () => {
        try { window.history.pushState({ modalOpen: true }, ''); } catch (e) {}
      };
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

  const btnBase = { minWidth: 90, maxWidth: 140, height: 36, borderRadius: 6, padding: '6px 10px' };

  return (
    <CContainer className="py-4">
      <style>{`
        /* botones uniformes */
        .btn-uniform { min-width:90px; height:36px; border-radius:6px; padding:6px 10px; }

        /* Responsive: tarjetas sólo en móviles <576px, tabla intacta en >=576px */
        @media (max-width: 575px) {
          .desktop-table { display:none !important; }
          .mobile-card { display:block; padding: 0 12px; box-sizing: border-box; }
          .mobile-actions { display:flex; flex-direction:column; gap:8px; }
          .mobile-actions .CButton { width:100%; }
        }
        @media (min-width: 576px) {
          .desktop-table { display:block; width:100%; }
          .mobile-card { display:none; }
        }

        /* wrapper para scroll horizontal si la tabla excede ancho */
        .table-wrapper { width:100%; overflow-x:auto; -webkit-overflow-scrolling: touch; padding: 0 8px; box-sizing: border-box; }

        /* centrar acciones en tabla */
        .actions-column { display:flex; align-items:center; justify-content:center; }

        .mobile-card { border:1px solid rgba(0,0,0,0.06); border-radius:8px; padding:10px; margin-bottom:10px; background:#fff; }
        .mobile-field { display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.95rem; }
      `}</style>

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
              onChange={e => { setBusqueda(e.target.value); setCurrentPage(1); }}
            />
          </CInputGroup>
        </CCardHeader>
        <CCardBody style={{ padding: 0 }}>
          {isSmall ? (
            <div className="p-3 d-flex flex-column gap-3">
              {afectacionesToShow.map(afec => {
                const comunidad = comunidadesMap[afec.TTR_CODCOM];
                const parroquia = parroquiasMap[comunidad?.TMA_COPARR];
                const desastre = desastresMap[afec.TTR_CODESA];
                return (
                  <CCard key={afec.TTR_COAFEC} className="p-2 mobile-card">
                    <CCardBody className="p-2">
                      <CCardTitle style={{ fontSize: 16, marginBottom: 4 }}>{comunidad?.TMA_NOMBRE || afec.TTR_CODCOM}</CCardTitle>
                      <CCardText style={{ marginBottom: 6, fontSize: 13 }}>
                        <strong>Parroquia:</strong> {parroquia?.TMA_NOMBRE || '-'} <br />
                        <strong>Desastre:</strong> {desastre?.TMA_NOMBRE || '-'} <br />
                        <strong>Fecha:</strong> {afec.TTR_FEAFEC ? afec.TTR_FEAFEC.split('T')[0] : '-'}
                      </CCardText>

                      <div className="d-flex justify-content-center gap-2 mobile-actions">
                        <CButton size="sm" style={{ ...btnBase, backgroundColor: 'white', color: '#ff7043', borderColor: '#ff7043', width: '48%' }} onClick={() => handleEditOpen(afec)}>Editar</CButton>
                        <CButton size="sm" style={{ ...btnBase, backgroundColor: 'white', color: 'red', borderColor: 'red', width: '48%' }} onClick={() => { setDeleteId(afec.TTR_COAFEC); setShowDelete(true); }}>Eliminar</CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                );
              })}
            </div>
          ) : (
            <div className="table-wrapper desktop-table">
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
                    <CTableHeaderCell style={{ textAlign: 'left' }}>Comunidad</CTableHeaderCell>
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
                        <CTableDataCell style={{ textAlign: 'left' }}>{comunidad?.TMA_NOMBRE || afec.TTR_CODCOM}</CTableDataCell>
                        <CTableDataCell>{parroquia?.TMA_NOMBRE || ''}</CTableDataCell>
                        <CTableDataCell>{desastre?.TMA_NOMBRE || afec.TTR_CODESA}</CTableDataCell>
                        <CTableDataCell>{afec.TTR_FEAFEC ? afec.TTR_FEAFEC.split('T')[0] : ''}</CTableDataCell>
                        <CTableDataCell className="actions-column">
                          <div className="d-flex flex-column align-items-center">
                            <CButton
                              style={{ ...btnBase, backgroundColor: 'white', color: '#ff7043', borderColor: '#ff7043', marginBottom: 6 }}
                              size="sm"
                              onClick={() => handleEditOpen(afec)}
                            >
                              Editar
                            </CButton>
                            <CButton
                              size="sm"
                              style={{ ...btnBase, minWidth: 90, maxWidth: 120, backgroundColor: 'white', color: 'red', borderColor: 'red' }}
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
          )}

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

      <CModal visible={showEdit} onClose={() => { setShowEdit(false); setErrorsEdit({}); }} backdrop="static" keyboard={false}>
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
              className="mb-3"
              ref={codesaRef}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (feafecRef.current) feafecRef.current.focus(); } }}
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
              className="mb-3"
              max={maxFechaLocal}
              ref={feafecRef}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (saveRef.current) saveRef.current.focus(); } }}
            />
            {errorsEdit.feafec && <div className="text-danger small mb-2">{errorsEdit.feafec}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton style={{...btnBase, backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={handleEditSave} ref={saveRef}>Guardar</CButton>
          <CButton style={{...btnBase, backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => setShowEdit(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showDelete} onClose={() => setShowDelete(false)} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>Eliminar Afectación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que deseas eliminar esta afectación?
        </CModalBody>
        <CModalFooter>
          <CButton style={{...btnBase, backgroundColor:'white', color:'red', borderColor:'red'}} onClick={handleDelete}>Eliminar</CButton>
          <CButton style={{...btnBase, backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={() => setShowDelete(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListadoAfectaciones;