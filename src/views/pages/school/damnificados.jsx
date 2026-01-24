import React, { useEffect, useState, useRef } from 'react';
import {
  CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CFormInput, CPagination, CPaginationItem, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormSelect
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';
/*const API = 'http://localhost:4000';*/

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

  // errores para el modal editar
  const [errorsEdit, setErrorsEdit] = useState({});
  const [apiError, setApiError] = useState('');

  const fetchData = () => {
    fetch(`${API}/damnificados/lista?search=${search}&page=${page}`)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setTotal(res.total);
      }).catch(console.error);
  };

  
  const openEdit = (d) => {
    setEditForm({
      nombre: d.TTR_NOMBRE || '',
      apelli: d.TTR_APELLI || '',
      fenaci: d.TTR_FENACI || '',
      contac: d.TTR_CONTAC || '',
      coafec: d.TTR_COAFEC || '',
      esalud: d.TTR_ESALUD || '',
      cedula: d.TTR_CEDULA || '',
      tipodo: d.TTR_TIPODO || ''
    });
    setEditId(d.TTR_CODAMN || d.TTR_COVICT || null);
    setErrorsEdit({});
    setApiError('');
    setVisible(true);
   
    setTimeout(() => {
      if (tipodoRef && tipodoRef.current) tipodoRef.current.focus();
    }, 80);
  };

  useEffect(() => { fetchData(); }, [search, page]);
  useEffect(() => {
    fetch(`${API}/documento`).then(res => res.json()).then(setTiposDoc).catch(console.error);
    fetch(`${API}/afectacion`).then(res => res.json()).then(setAfectaciones).catch(console.error);
  }, []);

  const totalPages = Math.ceil(total / 10);

  // refs para el formulario de edición
  const tipodoRef = useRef(null);
  const cedulaRef = useRef(null);
  const nombreRef = useRef(null);
  const apelliRef = useRef(null);
  const fenaciRef = useRef(null);
  const contacRef = useRef(null);
  const esaludRef = useRef(null);
  const coafecRef = useRef(null);
  const saveRef = useRef(null);

  // Fecha máxima permitida para fecha de nacimiento
  const today = new Date();
  const maxFechaNacimiento = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];

 
  const handleEnter = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) nextRef.current.focus();
    }
  };


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const confirmDelete = (id) => { setDeleteTarget(id); setShowDeleteModal(true); };
  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`${API}/damnificados/eliminar/${deleteTarget}`, { method: 'DELETE' });
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error(err);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Cerrar y limpiar formulario de edición
  const closeEdit = () => {
    setVisible(false);
    setErrorsEdit({});
    setApiError('');
    setEditForm({ nombre: '', apelli: '', fenaci: '', contac: '', coafec: '', esalud: '', cedula: '', tipodo: '' });
    setEditId(null);
  };


  const onlyDigits = s => String(s ?? '').replace(/\D/g, '');
  const onlyLetters = s => String(s ?? '').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, '');
  const isPassportId = (id) => {
    if (id === null || id === undefined) return false;
    const s = String(id).trim();
    if (!s) return false;
    if (s.toLowerCase() === 'p' || s === '3') return true;
    if (Array.isArray(tiposDoc) && tiposDoc.length) {
      const found = tiposDoc.find(t => String(t.TMA_CODDOC) === s || /pasap|pasaporte/i.test(String(t.TMA_NOMBRE)));
      return !!(found && /pasap|pasaporte/i.test(String(found.TMA_NOMBRE)));
    }
    return false;
  };
  const sanitizePassport = s => String(s ?? '').toUpperCase().replace(/[^A-Z0-9 .\-\/]/g, '');
  const validatePhoneValue = s => {
    const raw = String(s ?? '').trim();
    if (!raw) return 'Contacto obligatorio';
    const allowedPrefixes = ['0414','0424','0416','0426','0422','0412'];
    const compact = raw.replace(/[\s\-]/g, '');
    const digitsOnly = compact.replace(/^\+/, '').replace(/\D/g, '');
    if (![11,13,15].includes(digitsOnly.length)) return 'Contacto inválido';
    let start = digitsOnly;
    if (digitsOnly.length === 13) start = digitsOnly.slice(2);
    if (digitsOnly.length === 15) start = digitsOnly.slice(4);
    if (!allowedPrefixes.some(p => start.startsWith(p))) return 'Prefijo inválido (0414/0424/0416/0426/0422/0412)';
    const rest = start.slice(4);
    if (!/^\d{7}$/.test(rest)) return 'Contacto inválido (debe tener 7 dígitos después del prefijo)';
    return '';
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    let val = value;
    
    if (name === 'nombre' || name === 'apelli' || name === 'esalud') {
      val = onlyLetters(value);
      setEditForm(prev => ({ ...prev, [name]: val }));
      validateEditField(name, val);
      return;
    }
    
    if (name === 'tipodo') {
      setEditForm(prev => {
        const newTip = value;
        const passport = isPassportId(newTip);
        const newCed = passport ? sanitizePassport(prev.cedula) : onlyDigits(prev.cedula);
        setTimeout(() => validateEditField('cedula', newCed), 0);
        return { ...prev, tipodo: newTip, cedula: newCed };
      });
      validateEditField('tipodo', value);
      return;
    }
    // cedula: permitir pasaporte (texto) o solo dígitos según tipodo
    if (name === 'cedula') {
      const passport = isPassportId(editForm.tipodo);
      if (passport) {
        val = sanitizePassport(value).slice(0, 20);
        setEditForm(prev => ({ ...prev, cedula: val }));
        validateEditField('cedula', val);
      } else {
        val = onlyDigits(value).slice(0, 9);
        setEditForm(prev => ({ ...prev, cedula: val }));
        validateEditField('cedula', val);
      }
      return;
    }
    // contacto: aceptar formatos y validar en vivo
    if (name === 'contac') {
      setEditForm(prev => ({ ...prev, contac: value }));
      setErrorsEdit(prev => ({ ...prev, contac: validatePhoneValue(value) }));
      return;
    }
    // default
    setEditForm(prev => ({ ...prev, [name]: val }));
    validateEditField(name, val);
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
        if (!/^[A-Z0-9 .\-\/]{3,9}$/.test(v)) msg = 'Pasaporte inválido (3-9: letras, números, espacio, -  .)';
        else if (!/[A-Z]/.test(v)) msg = 'Pasaporte debe contener al menos una letra';
        else if (!/\d/.test(v)) msg = 'Pasaporte debe contener al menos un número';
      } else {
        if (!/^\d{6,9}$/.test(v)) msg = 'Cédula inválida (6-9 dígitos)';
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
    if (name === 'fenaci') {
      if (!v) msg = 'Fecha de nacimiento obligatoria';
      else if (v > maxFechaNacimiento) msg = 'La fecha no puede ser futura';
    }
    if (name === 'contac') {
      msg = validatePhoneValue(v);
    }
    if (name === 'coafec') {
      if (!v) msg = 'Seleccione afectación';
    }
    if (name === 'esalud') {
      if (!v) msg = 'Estado de salud obligatorio';
    }
    setErrorsEdit(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const validateEditAll = () => {
    const fields = ['tipodo','cedula','nombre','apelli','fenaci','contac','esalud','coafec'];
    const newErrors = {};
    fields.forEach(f => {
      const ok = validateEditField(f, editForm[f]);
      if (!ok) newErrors[f] = true;
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    // validar todos los campos y actualizar errores
    const fieldOrder = ['tipodo','cedula','nombre','apelli','fenaci','contac','esalud','coafec'];
    const newErrors = {};
    for (const f of fieldOrder) {
      const ok = validateEditField(f, editForm[f]);
      if (!ok) newErrors[f] = true;
    }
    setErrorsEdit(prev => ({ ...prev })); // ensure state updated (individual fields already set)
    // si hay error, enfocar el primero
    const firstError = fieldOrder.find(f => errorsEdit[f] || newErrors[f]);
    if (firstError) {
      const map = { tipodo: tipodoRef, cedula: cedulaRef, nombre: nombreRef, apelli: apelliRef, fenaci: fenaciRef, contac: contacRef, esalud: esaludRef, coafec: coafecRef };
      if (map[firstError] && map[firstError].current) map[firstError].current.focus();
      return;
    }

    // enviar petición
    try {
      const res = await fetch(`${API}/damnificados/editar/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setVisible(false);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        setApiError(err.mensaje || 'Error al guardar. Revisa la consola y la respuesta del servidor.');
      }
    } catch (err) {
      setApiError('Error de conexión. Intenta de nuevo.');
      console.error(err);
    }
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
                  <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} size="sm" onClick={() => confirmDelete(d.TTR_CODAMN)}>Eliminar</CButton>
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
      <CModal visible={visible} onClose={closeEdit} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>Editar Damnificado</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleEditSubmit}>
            <CFormSelect className="mb-2" label="Tipo de documento" name="tipodo" value={editForm.tipodo} onChange={handleEditChange} required ref={tipodoRef} onKeyDown={e => handleEnter(e, cedulaRef)}>
              <option value="">Seleccione tipo</option>
              {tiposDoc.map(t => (
                <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>
              ))}
            </CFormSelect>
            {errorsEdit.tipodo && <div className="text-danger small mb-2">{errorsEdit.tipodo}</div>}

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
                  onKeyDown={e => handleEnter(e, nombreRef)}
                  inputMode={passport ? 'text' : 'numeric'}
                  maxLength={passport ? 20 : 9}
                  minLength={passport ? 3 : 6}
                  placeholder={passport ? 'Ej: A12-3456 / AB1234' : 'Ej: 12345678'}
                />
              );
            })()}
            {errorsEdit.cedula && <div className="text-danger small mb-2">{errorsEdit.cedula}</div>}

            <CFormInput className="mb-2" label="Nombre" name="nombre" value={editForm.nombre} onChange={handleEditChange} required ref={nombreRef} onKeyDown={e => handleEnter(e, apelliRef)} />
            {errorsEdit.nombre && <div className="text-danger small mb-2">{errorsEdit.nombre}</div>}

            <CFormInput className="mb-2" label="Apellido" name="apelli" value={editForm.apelli} onChange={handleEditChange} required ref={apelliRef} onKeyDown={e => handleEnter(e, fenaciRef)} />
            {errorsEdit.apelli && <div className="text-danger small mb-2">{errorsEdit.apelli}</div>}

            <CFormInput className="mb-2" label="Fecha de nacimiento" type="date" name="fenaci" value={editForm.fenaci} onChange={handleEditChange} required max={maxFechaNacimiento} ref={fenaciRef} onKeyDown={e => handleEnter(e, contacRef)} />
            {errorsEdit.fenaci && <div className="text-danger small mb-2">{errorsEdit.fenaci}</div>}

            <CFormInput className="mb-2" label="Contacto" name="contac" maxLength={15} minLength={7} value={editForm.contac} onChange={handleEditChange} required inputMode="tel" ref={contacRef} onKeyDown={e => handleEnter(e, esaludRef)} placeholder="Ej: 04141234567 o +584141234567" />
            {errorsEdit.contac && <div className="text-danger small mb-2">{errorsEdit.contac}</div>}

            <CFormInput className="mb-2" label="Estado de salud" name="esalud" value={editForm.esalud} onChange={handleEditChange} required ref={esaludRef} onKeyDown={e => handleEnter(e, coafecRef)} />
            {errorsEdit.esalud && <div className="text-danger small mb-2">{errorsEdit.esalud}</div>}

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
              <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={closeEdit}>Cancelar</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
      {/* Modal confirmar eliminación */}
      <CModal visible={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>Confirmar eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que deseas eliminar este damnificado?
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>Cancelar</CButton>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={handleDeleteConfirmed}>Eliminar</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default DamnificadosModulo;