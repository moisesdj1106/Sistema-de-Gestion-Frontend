import React, { useEffect, useState, useRef } from 'react';
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

  useEffect(() => { fetchData(); }, [search, page]);
  useEffect(() => {
    fetch(`${API}/documento`).then(res => res.json()).then(setTiposDoc).catch(console.error);
    fetch(`${API}/afectacion`).then(res => res.json()).then(setAfectaciones).catch(console.error);
  }, []);

  const totalPages = Math.ceil(total / 10);

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
    setErrorsEdit({});
    setApiError('');
    setEditId(d.TTR_CODAMN);
    setVisible(true);
    setTimeout(() => { if (tipodoRef.current) tipodoRef.current.focus(); }, 120);
  };

  // --- refs y helpers para navegación y sanitización ---
  const tipodoRef = useRef(null);
  const cedulaRef = useRef(null);
  const nombreRef = useRef(null);
  const apelliRef = useRef(null);
  const fenaciRef = useRef(null);
  const contacRef = useRef(null);
  const coafecRef = useRef(null);
  const esaludRef = useRef(null);
  const saveRef = useRef(null);

  const handleEnter = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) nextRef.current.focus();
    }
  };

  const onlyDigits = s => String(s ?? '').replace(/\D/g, '');
  const onlyLetters = s => String(s ?? '').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, '');

  // evitar desfase de zona horaria para max date local YYYY-MM-DD
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  const maxFechaNacimiento = localToday.toISOString().split('T')[0];

  // cambio con limpieza y validación en tiempo real
  const handleEditChange = e => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cedula' || name === 'contac') val = onlyDigits(value);
    if (name === 'nombre' || name === 'apelli' || name === 'esalud') val = onlyLetters(value);
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
      if (!v) msg = 'Cédula obligatoria';
      else if (!/^\d{6,9}$/.test(v)) msg = 'Cédula inválida (6-9 dígitos)';
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
      if (!v) msg = 'Contacto obligatorio';
      else if (!/^\d{7,11}$/.test(v)) msg = 'Contacto inválido (7-11 dígitos)';
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
      <CModal visible={visible} onClose={() => { setVisible(false); setErrorsEdit({}); setApiError(''); }}>
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

            <CFormInput className="mb-2" label="Cédula" name="cedula" value={editForm.cedula} onChange={handleEditChange} required inputMode="numeric" ref={cedulaRef} onKeyDown={e => handleEnter(e, nombreRef)} />
            {errorsEdit.cedula && <div className="text-danger small mb-2">{errorsEdit.cedula}</div>}

            <CFormInput className="mb-2" label="Nombre" name="nombre" value={editForm.nombre} onChange={handleEditChange} required ref={nombreRef} onKeyDown={e => handleEnter(e, apelliRef)} />
            {errorsEdit.nombre && <div className="text-danger small mb-2">{errorsEdit.nombre}</div>}

            <CFormInput className="mb-2" label="Apellido" name="apelli" value={editForm.apelli} onChange={handleEditChange} required ref={apelliRef} onKeyDown={e => handleEnter(e, fenaciRef)} />
            {errorsEdit.apelli && <div className="text-danger small mb-2">{errorsEdit.apelli}</div>}

            <CFormInput className="mb-2" label="Fecha de nacimiento" type="date" name="fenaci" value={editForm.fenaci} onChange={handleEditChange} required max={maxFechaNacimiento} ref={fenaciRef} onKeyDown={e => handleEnter(e, contacRef)} />
            {errorsEdit.fenaci && <div className="text-danger small mb-2">{errorsEdit.fenaci}</div>}

            <CFormInput className="mb-2" label="Contacto" name="contac" value={editForm.contac} onChange={handleEditChange} required inputMode="numeric" ref={contacRef} onKeyDown={e => handleEnter(e, esaludRef)} />
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
              <CButton color="primary" type="submit" ref={saveRef}>Guardar</CButton>
              <CButton color="secondary" onClick={() => setVisible(false)}>Cancelar</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </CCard>
  );
};

export default DamnificadosModulo;