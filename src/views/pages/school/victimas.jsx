import React, { useEffect, useState, useRef } from 'react';
import {
  CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CFormInput, CPagination, CPaginationItem, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormSelect
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';
/*const API = 'http://localhost:4000';*/
const VictimasModulo = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal edición
  const [visible, setVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    cedula: '', tipodo: '', nombre: '', apelli: '', coafec: '', certif: ''
  });
  const [tiposDoc, setTiposDoc] = useState([]);
  const [afectaciones, setAfectaciones] = useState([]);
  const [editId, setEditId] = useState(null);

  // errores y api error
  const [errorsEdit, setErrorsEdit] = useState({});
  const [apiError, setApiError] = useState('');

  const fetchData = () => {
    fetch(`${API}/victimas/lista?search=${search}&page=${page}`)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setTotal(res.total);
      }).catch(console.error);
  };

  useEffect(() => { fetchData(); }, [search, page]);
  useEffect(() => {
    fetch(`${API}/documento`).then(res => res.json()).then(setTiposDoc).catch(console.error);
    fetch(`${API}/afectacion`).then(res => res.json()).then(setAfectaciones).catch(console.error);
  }, []);

  const totalPages = Math.ceil(total / 10);

  const openEdit = (v) => {
    setEditForm({
      cedula: v.TTR_CEDULA || '',
      tipodo: v.TTR_TIPODO || '',
      nombre: v.TTR_NOMBRE || '',
      apelli: v.TTR_APELLI || '',
      coafec: v.TTR_COAFEC || '',
      certif: v.TTR_CERTIF || ''
    });
    setEditId(v.TTR_COVICT);
    setErrorsEdit({});
    setApiError('');
    setVisible(true);
    setTimeout(() => { if (nombreRef.current) nombreRef.current.focus(); }, 120);
  };

  // refs y helpers
  const tipodoRef = useRef(null);
  const cedulaRef = useRef(null);
  const nombreRef = useRef(null);
  const apelliRef = useRef(null);
  const coafecRef = useRef(null);
  const certifRef = useRef(null);
  const saveRef = useRef(null);

  const handleEnter = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) nextRef.current.focus();
    }
  };

  const onlyDigits = s => String(s ?? '').replace(/\D/g, '');
  const onlyLetters = s => String(s ?? '').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, '');

  // Helpers pasaporte
  const isPassportId = (id) => {
    if (id === null || id === undefined) return false;
    const s = String(id).trim();
    if (!s) return false;
    if (s.toLowerCase() === 'p' || s === '3') return true;
    const found = tiposDoc.find(t => String(t.TMA_CODDOC) === s || /pasap|pasaporte/i.test(String(t.TMA_NOMBRE)));
    return !!(found && /pasap|pasaporte/i.test(String(found.TMA_NOMBRE)));
  };
  const sanitizePassport = s => String(s ?? '').toUpperCase().replace(/[^A-Z0-9 .\-\/]/g, '');
  const sanitizeCertif = s => String(s ?? '').toUpperCase().replace(/[^A-Z0-9-]/g, '');

  // Validación de certificado: vacío o 1-9 chars A-Z0-9-
  const validateCertif = (v) => {
    const s = String(v ?? '').trim();
    if (!s) return '';
    if (!/^[A-Z0-9-]{1,9}$/.test(s)) return 'Certificado inválido (A-Z, 0-9, -) máximo 9';
    return '';
  };

  // Bloquear botón atrás del navegador mientras el modal de edición esté abierto
  useEffect(() => {
    let onPop = null;
    const attach = () => {
      try { history.pushState(null, '') } catch (e) {}
      onPop = () => {
        if (visible) {
          try { history.pushState(null, '') } catch (err) {}
        }
      };
      window.addEventListener('popstate', onPop);
    };
    const detach = () => {
      if (onPop) window.removeEventListener('popstate', onPop);
      onPop = null;
    };
    if (visible) attach();
    return () => detach();
  }, [visible]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar víctima?')) {
      await fetch(`${API}/victimas/eliminar/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    let val = value;

    // nombres/apellidos: solo letras en tiempo real
    if (name === 'nombre' || name === 'apelli') {
      val = onlyLetters(value);
      setEditForm(prev => ({ ...prev, [name]: val }));
      validateEditField(name, val);
      setApiError('');
      return;
    }

    // tipo de documento: al cambiar, sanear cédula según nuevo tipo
    if (name === 'tipodo') {
      setEditForm(prev => {
        const newTip = val;
        const passport = isPassportId(newTip);
        const newCed = passport ? sanitizePassport(prev.cedula) : onlyDigits(prev.cedula);
        // revalidar cédula inmediatamente
        setTimeout(() => validateEditField('cedula', newCed), 0);
        return { ...prev, tipodo: newTip, cedula: newCed };
      });
      validateEditField('tipodo', val);
      setApiError('');
      return;
    }

 
    if (name === 'cedula') {
      const passport = isPassportId(editForm.tipodo);
      if (passport) {
        val = sanitizePassport(value);
        setEditForm(prev => ({ ...prev, cedula: val }));
        validateEditField('cedula', val);
      } else {
        val = onlyDigits(value);
        setEditForm(prev => ({ ...prev, cedula: val }));
        validateEditField('cedula', val);
      }
      setApiError('');
      return;
    }

    // certificado convertir a mayúsculas y sanitizar (A-Z0-9-)
    if (name === 'certif') {
      const v = sanitizeCertif(value).slice(0, 9);
      setEditForm(prev => ({ ...prev, certif: v }));
      setErrorsEdit(prev => ({ ...prev, certif: validateCertif(v) }));
      setApiError('');
      return;
    }


    setEditForm(prev => ({ ...prev, [name]: val }));
    validateEditField(name, val);
    setApiError('');
  };

  const validateEditField = (name, value) => {
    const v = String(value ?? '').trim();
    let msg = '';

    if (name === 'tipodo') {
      if (!v) msg = 'Seleccione tipo de documento';
    }
    if (name === 'cedula') {
      if (!v) msg = 'Documento obligatorio';
      else if (isPassportId(editForm.tipodo)) {
        
        if (!/^[A-Z0-9 .\-\/]{3,20}$/.test(v)) {
          msg = 'Pasaporte inválido (3-9: letras, números, espacio, - / .)';
        } else if (!/[A-Z]/.test(v)) {
          msg = 'Pasaporte debe contener al menos una letra';
        } else if (!/\d/.test(v)) {
          msg = 'Pasaporte debe contener al menos un número';
        }
      } else {
        if (!/^\d{7,9}$/.test(v)) msg = 'Cédula inválida (7-9 dígitos)';
      }
    }
    if (name === 'nombre') {
      if (!v) msg = 'Nombre obligatorio';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(v)) msg = 'Nombre inválido';
    }
    if (name === 'apelli') {
      if (!v) msg = 'Apellido obligatorio';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(v)) msg = 'Apellido inválido';
    }
    if (name === 'coafec') {
      if (!v) msg = 'Seleccione afectación';
    }
    if (name === 'certif') {
      msg = validateCertif(v);
    }

    setErrorsEdit(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const validateEditAll = () => {
    const fields = ['nombre','apelli','cedula','tipodo','coafec','certif'];
    const newErr = {};
    fields.forEach(f => {
      const ok = validateEditField(f, editForm[f]);
      if (!ok) newErr[f] = true;
    });
    return Object.keys(newErr).length === 0;
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setApiError('');
    // validar todos los campos
    const fieldsOrder = ['nombre','apelli','cedula','tipodo','certif','coafec'];
    const newErrors = {};
    for (const f of fieldsOrder) {
      const ok = validateEditField(f, editForm[f]);
      if (!ok) newErrors[f] = true;
    }
    setErrorsEdit(prev => ({ ...prev })); // mensajes ya establecidos por validateEditField

    const firstError = fieldsOrder.find(f => errorsEdit[f] || newErrors[f]);
    if (firstError) {
      const map = { nombre: nombreRef, apelli: apelliRef, cedula: cedulaRef, tipodo: tipodoRef, certif: certifRef, coafec: coafecRef };
      if (map[firstError] && map[firstError].current) map[firstError].current.focus();
      return;
    }

    // enviar
    try {
      const payload = {
        ...editForm,
        // asegurar tipodo como número si viene numérico
        tipodo: (isNaN(Number(editForm.tipodo)) ? editForm.tipodo : Number(editForm.tipodo))
      };
      const res = await fetch(`${API}/victimas/editar/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setVisible(false);
        fetchData();
        // limpiar después de guardar
        setEditForm({ cedula: '', tipodo: '', nombre: '', apelli: '', coafec: '', certif: '' });
        setErrorsEdit({});
        setEditId(null);
      } else {
        const err = await res.json().catch(() => ({}));
        setApiError(err.mensaje || 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      setApiError('Error de conexión');
    }
  };

  // Eliminación con modal de confirmación (evita window.confirm)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const confirmDelete = (id) => { setDeleteTarget(id); setShowDeleteModal(true); };
  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    await fetch(`${API}/victimas/eliminar/${deleteTarget}`, { method: 'DELETE' });
    setShowDeleteModal(false);
    setDeleteTarget(null);
    fetchData();
  };

  return (
    <CCard>
      <CCardHeader>
        <strong>Víctimas</strong>
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
              <CTableHeaderCell>Comunidad afectada</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead >
          <CTableBody style={{textAlign:'center'}}>
            {data.map(v => (
              <CTableRow key={v.TTR_COVICT}>
                <CTableDataCell>{tiposDoc.find(t => t.TMA_CODDOC === v.TTR_TIPODO)?.TMA_NOMBRE || ''}</CTableDataCell>
                <CTableDataCell>{v.TTR_CEDULA}</CTableDataCell>
                <CTableDataCell>{v.TTR_NOMBRE}</CTableDataCell>
                <CTableDataCell>{v.TTR_APELLI}</CTableDataCell>
                <CTableDataCell>
                  {afectaciones.find(a => a.TTR_COAFEC === v.TTR_COAFEC)?.comunidad || v.TTR_COAFEC}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} size="sm" className="me-2" onClick={() => openEdit(v)}>Editar</CButton>
                  <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} size="sm" onClick={() => confirmDelete(v.TTR_COVICT)}>Eliminar</CButton>
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
      <CModal visible={visible} onClose={() => { setVisible(false); setErrorsEdit({}); setApiError(''); setEditForm({ cedula:'', tipodo:'', nombre:'', apelli:'', coafec:'', certif:'' }); setEditId(null); }} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>Editar Víctima</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleEditSubmit}>
            
            <CFormSelect className="mb-2" label="Tipo de documento" name="tipodo" value={editForm.tipodo} onChange={handleEditChange} required ref={tipodoRef} onKeyDown={e => handleEnter(e, certifRef)}>
              <option value="">Seleccione tipo</option>
              {tiposDoc.map(t => (
                <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>
              ))}
            </CFormSelect>
       
            {(() => {
              const passport = isPassportId(editForm.tipodo);
              return (
                <CFormInput
                  className="mb-2"
                  label="Documento"
                  name="cedula"
                  value={editForm.cedula}
                  onChange={handleEditChange}
                  required
                  ref={cedulaRef}
                  onKeyDown={e => handleEnter(e, tipodoRef)}
                  inputMode={passport ? 'text' : 'numeric'}
                  maxLength={passport ? 9 : 9}
                  minLength={passport ? 4 : 7}
                  placeholder={passport ? 'Ej: A12-3456 / AB1234' : 'Ej: 12345678'}
                />
              )
            })()}
             {errorsEdit.cedula && <div className="text-danger small mb-2">{errorsEdit.cedula}</div>}


            <CFormInput className="mb-2" label="Nombre" name="nombre" value={editForm.nombre} onChange={handleEditChange} required ref={nombreRef} maxLength={25} minLength={3} onKeyDown={e => handleEnter(e, apelliRef)}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$" title="Solo letras y espacios" />
            {errorsEdit.nombre && <div className="text-danger small mb-2">{errorsEdit.nombre}</div>}

            <CFormInput className="mb-2" label="Apellido" name="apelli" value={editForm.apelli} onChange={handleEditChange} required ref={apelliRef} maxLength={25} minLength={3} onKeyDown={e => handleEnter(e, cedulaRef)}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$" title="Solo letras y espacios" />
            {errorsEdit.apelli && <div className="text-danger small mb-2">{errorsEdit.apelli}</div>}
            {errorsEdit.tipodo && <div className="text-danger small mb-2">{errorsEdit.tipodo}</div>}

            <CFormInput
              className="mb-2"
              label="Certificado"
              name="certif"
              maxLength={9}
              value={editForm.certif}
              onChange={handleEditChange}
              ref={certifRef}
              onKeyDown={e => handleEnter(e, coafecRef)}
              inputMode="text"
              pattern="^[A-Z0-9-]{0,9}$"
              title="Solo letras mayúsculas, números y guion (máx. 9)"
              placeholder="Ej: ABC-1234"
            />
            {errorsEdit.certif && <div className="text-danger small mb-2">{errorsEdit.certif}</div>}

            <CFormSelect className="mb-2" label="Comunidad afectada" name="coafec" value={editForm.coafec} onChange={handleEditChange} required ref={coafecRef} onKeyDown={e => handleEnter(e, saveRef)}>
              <option value="">Seleccione afectación</option>
              {afectaciones.map(a => (
                <option key={a.TTR_COAFEC} value={a.TTR_COAFEC}>{a.comunidad}</option>
              ))}
            </CFormSelect>
            {errorsEdit.coafec && <div className="text-danger small mb-2">{errorsEdit.coafec}</div>}

            {apiError && <div className="text-danger small mb-2">{apiError}</div>}

            <CModalFooter>
              <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} type="submit" ref={saveRef}>Guardar</CButton>
              <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => { setVisible(false); setErrorsEdit({}); setApiError(''); setEditForm({ cedula:'', tipodo:'', nombre:'', apelli:'', coafec:'', certif:'' }); setEditId(null); }}>Cancelar</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
      
      <CModal visible={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>Confirmar eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>¿Seguro que deseas eliminar esta víctima?</CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>Cancelar</CButton>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={handleDeleteConfirmed}>Eliminar</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default VictimasModulo;