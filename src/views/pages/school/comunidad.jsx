import React, { useEffect, useState, useRef } from 'react';
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardHeader, CButton, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CForm, CFormInput, CFormSelect, CModal, CModalHeader,
  CModalTitle, CModalBody, CModalFooter, CToast, CToaster, CPagination, CPaginationItem
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';
/*const API = 'http://localhost:4000';*/

const MAX_HABITANTES = 1000000;

const ComunidadesCrudCoreUI = () => {
  // Filtros geográficos para el formulario
  const [paises, setPaises] = useState([]);
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [parroquiasForm, setParroquiasForm] = useState([]);
  const [codpais, setCodpais] = useState('');
  const [coesta, setCoesta] = useState('');
  const [comuni, setComuni] = useState('');
  const [coparr, setCoparr] = useState('');

  // CRUD comunidades
  const [comunidades, setComunidades] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    habita: '',
    coparr: '',
    latitud: '',
    longitud: ''
  });
  const [errors, setErrors] = useState({}); // mensajes por campo
  const [editId, setEditId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', color: 'success' });
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

  // FILTRO en lista
  const [filter, setFilter] = useState('');

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Simulación de rol
  const [rol] = useState(localStorage.getItem('rol') || 'usuario');

  // responsive: show cards on xs
  const [isSmall, setIsSmall] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Refs para atajos (Enter -> next)
  const paisRef = useRef(null);
  const estadoRef = useRef(null);
  const muniRef = useRef(null);
  const parrRef = useRef(null);
  const nombreRef = useRef(null);
  const direccionRef = useRef(null);
  const habitaRef = useRef(null);
  const latRef = useRef(null);
  const longRef = useRef(null);
  const submitRef = useRef(null);

  const handleEnter = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) nextRef.current.focus();
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetch(`${API}/paises`).then(res=>res.json()).then(setPaises).catch(console.error);
    cargarComunidades();
    cargarParroquias();
  }, []);

  const cargarComunidades = () => {
    fetch(`${API}/comunidades`).then(res=>res.json()).then(setComunidades).catch(console.error);
  };
  const cargarParroquias = () => {
    fetch(`${API}/parroquias`).then(res=>res.json()).then(setParroquias).catch(console.error);
  };

  // Cargar estados, municipios y parroquias según selección
  useEffect(() => {
    if (codpais) {
      fetch(`${API}/estados/${codpais}`).then(r=>r.json()).then(setEstados).catch(console.error);
    } else {
      setEstados([]); setCoesta('');
    }
    setMunicipios([]); setComuni(''); setParroquiasForm([]); setCoparr('');
  }, [codpais]);

  useEffect(() => {
    if (coesta) {
      fetch(`${API}/municipios/${coesta}`).then(r=>r.json()).then(setMunicipios).catch(console.error);
    } else {
      setMunicipios([]); setComuni('');
    }
    setParroquiasForm([]); setCoparr('');
  }, [coesta]);

  useEffect(() => {
    if (comuni) {
      fetch(`${API}/parroquias/${comuni}`).then(r=>r.json()).then(setParroquiasForm).catch(console.error);
    } else {
      setParroquiasForm([]); setCoparr('');
    }
  }, [comuni]);

  useEffect(() => {
    setForm(f => ({ ...f, coparr }));
  }, [coparr]);

  // Validación por campo -> devuelve true si válido y actualiza errors
  const validateField = (name, value) => {
    let msg = '';
    const v = String(value ?? '').trim();

    if (name === 'nombre') {
      if (!v) msg = 'Nombre es obligatorio';
      else if (v.length < 3) msg = 'Nombre demasiado corto';
    }

    if (name === 'direccion') {
      if (!v) msg = 'Dirección es obligatoria';
    }

    if (name === 'habita') {
      if (!v) msg = 'Habitantes es obligatorio';
      else if (!/^\d+$/.test(v)) msg = 'Solo números enteros';
      else if (parseInt(v, 10) < 1) msg = 'Debe ser mayor que 0';
      else if (parseInt(v, 10) > MAX_HABITANTES) msg = `Número excesivo (máx ${MAX_HABITANTES.toLocaleString()})`;
    }

    if (name === 'coparr') {
      if (!v) msg = 'Seleccione una parroquia';
    }

    if (name === 'latitud') {
      if (!v) msg = 'Latitud es obligatoria';
    
      else if (!/^-?\d+\.\d+$/.test(v)) msg = 'La latitud debe tener decimales (ej. 7.1548 o -7.1548)';
      else {
        const num = parseFloat(v);
        if (num < -90 || num > 90) msg = 'Latitud debe estar entre -90 y 90';
      }
    }

    if (name === 'longitud') {
      if (!v) msg = 'Longitud es obligatoria';
      else if (!/^-\d+(\.\d+)?$/.test(v)) msg = 'La longitud debe ser un número negativo (ej. -72.1245)';
      else {
        const num = parseFloat(v);
        if (num < -180 || num >= 0) msg = 'Longitud debe estar entre -180 y 0 (negativa)';
      }
    }

    setErrors(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  // validar todo antes de enviar -> devuelve array de campos inválidos
  const validateAll = (useFormCoparr = true) => {
    const fields = ['nombre', 'direccion', 'habita', 'coparr', 'latitud', 'longitud'];
    const invalids = [];
    // validar uno por uno y recoger los que fallan
    fields.forEach(f => {
      // usar form.coparr si está disponible (edición en modal)
      const value = f === 'coparr' ? (useFormCoparr ? (form.coparr ?? coparr) : coparr) : form[f];
      const ok = validateField(f, value);
      if (!ok) invalids.push(f);
    });
    return invalids;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'habita') {
      const cleaned = value.replace(/\D/g, '');
      val = cleaned ? (parseInt(cleaned, 10) > MAX_HABITANTES ? String(MAX_HABITANTES) : cleaned) : '';
    }
    if (name === 'latitud' || name === 'longitud') {
      val = value.replace(/[^0-9\.\-]/g, '');
      const partsMinus = val.split('-');
      if (partsMinus.length > 2) val = '-' + partsMinus.slice(1).join('');
      if (val.indexOf('-') > 0) val = val.replace(/-/g, '');
      const dots = val.split('.');
      if (dots.length > 2) val = dots.slice(0, 2).join('.');
    }

    setForm(prev => ({ ...prev, [name]: val }));
    if (name === 'coparr') setCoparr(val);

    // validar en tiempo real (actualiza errores visibles)
    validateField(name, name === 'coparr' ? val : val);
  };

  // Crear comunidad
  const handleSubmit = async e => {
    e.preventDefault();
    const invalids = validateAll();
    if (invalids.length > 0) {
      // enfocar el primer campo con error
      const map = { nombre: nombreRef, direccion: direccionRef, habita: habitaRef, coparr: parrRef, latitud: latRef, longitud: longRef };
      const first = invalids[0];
      if (map[first] && map[first].current) map[first].current.focus();
      return;
    }

    const res = await fetch(`${API}/comunidades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setToast({ show: true, message: 'Comunidad registrada', color: 'success' });
      setForm({ nombre: '', direccion: '', habita: '', coparr: '', latitud: '', longitud: '' });
      setCodpais(''); setCoesta(''); setComuni(''); setCoparr(''); setErrors({});
      cargarComunidades();
      if (paisRef.current) paisRef.current.focus();
    } else {
      const error = await res.json();
      setErrorModal({ show: true, message: error.message || 'Error al registrar' });
    }
  };

  // Abrir modal para editar
  const handleEditar = comunidad => {
    setForm({
      nombre: comunidad.TMA_NOMBRE,
      direccion: comunidad.TMA_DIRECC,
      habita: comunidad.TMA_HABITA,
      coparr: comunidad.TMA_COPARR,
      latitud: comunidad.TMA_LATITU || '',
      longitud: comunidad.TMA_LONGIT || ''
    });
    setEditId(comunidad.TMA_CODCOM);
    setVisible(true);
    setTimeout(() => {
      const el = document.querySelector('#modal-nombre');
      if (el) el.focus();
    }, 150);
  };

  // Guardar edición
  const handleUpdate = async () => {
    const invalids = validateAll(true);
    if (invalids.length === 0) {
      try {
        const res = await fetch(`${API}/comunidades/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        if (res.ok) {
          setToast({ show: true, message: 'Comunidad actualizada', color: 'info' });
          setVisible(false); setEditId(null);
          setForm({ nombre: '', direccion: '', habita: '', coparr: '', latitud: '', longitud: '' });
          cargarComunidades();
        } else {
          const error = await res.json().catch(()=>({}));
          setErrorModal({ show: true, message: error.message || 'Error al actualizar' });
        }
      } catch (err) {
        setErrorModal({ show: true, message: 'Error de conexión al servidor' });
      }
    } else {
      // foco al primer error del modal y mantener visible
      const map = { nombre: nombreRef, direccion: direccionRef, habita: habitaRef, coparr: parrRef, latitud: latRef, longitud: longRef };
      const first = invalids[0];
      if (map[first] && map[first].current) map[first].current.focus();
      setVisible(true);
    }
  };

  // Eliminar comunidad
  const handleEliminar = async codcom => {
    setErrorModal({
      show: true,
      message: (
        <span>
          ¿Seguro que deseas eliminar esta comunidad?
          <div className="mt-3 d-flex flex-column align-items-end">
            <CButton size="sm" className="mb-2"
              style={{ minWidth: 70, backgroundColor:'white',color:'#ff7043', borderColor:'#ff7043' }}
              onClick={async () => {
                const res = await fetch(`${API}/comunidades/${codcom}`, { method: 'DELETE' });
                if (res.ok) {
                  setErrorModal({ show: false, message: '' });
                  setToast({ show: true, message: 'Comunidad eliminada', color: 'warning' });
                  cargarComunidades();
                } else {
                  const error = await res.json();
                  setErrorModal({ show: true, message: error.message || 'No se puede eliminar, ya contiene registros importantes' });
                }
              }}>
              Eliminar
            </CButton>
            <CButton size="sm" style={{ minWidth: 70,backgroundColor:'white',color:'red', borderColor:'red' }} onClick={() => setErrorModal({ show: false, message: '' })}>
              Cancelar
            </CButton>
          </div>
        </span>
      )
    });
  };

  // FILTRADO y PAGINACIÓN
  const filteredComunidades = comunidades.filter(comu => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    const parroquiaNombre = parroquias.find(p => p.TMA_COPARR === comu.TMA_COPARR)?.TMA_NOMBRE || '';
    return (
      (comu.TMA_NOMBRE || '').toLowerCase().includes(q) ||
      (comu.TMA_DIRECC || '').toLowerCase().includes(q) ||
      (parroquiaNombre || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredComunidades.length / itemsPerPage));
  const comunidadesToShow = filteredComunidades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Placeholder helpers (limpia placeholder al focus y lo restaura en blur si está vacío)
  const handleFocusClear = e => {
    try {
      e.target.dataset.ph = e.target.placeholder || '';
      e.target.placeholder = '';
    } catch {}
  };
  const handleBlurRestore = e => {
    try {
      if (!e.target.value) e.target.placeholder = e.target.dataset.ph || '';
    } catch {}
  };

  return (
    <CContainer className="py-4">
      {/* Modal centrado para éxito y error */}
      <CModal
        alignment="center"
        visible={toast.show || errorModal.show}
        onClose={() => {
          setToast({ ...toast, show: false });
          setErrorModal({ show: false, message: '' });
        }}
      >
        <CModalHeader>
          <CModalTitle>{toast.show ? 'Éxito' : 'Mensaje'}</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center">
          {toast.show && <span style={{ color: toast.color === 'success' ? 'green' : '#ff7043' }}>{toast.message}</span>}
          {errorModal.show && <span style={{ color: 'red' }}>{typeof errorModal.message === 'string' ? errorModal.message : ''}</span>}
          {typeof errorModal.message !== 'string' && errorModal.show && errorModal.message}
        </CModalBody>
        {(toast.show || (errorModal.show && typeof errorModal.message === 'string')) && (
          <CModalFooter>
            <CButton style={{backgroundColor:'white',color:'#ff7043', borderColor:'#ff7043'}} onClick={() => { setToast({ ...toast, show: false }); setErrorModal({ show: false, message: '' }); }}>
              Aceptar
            </CButton>
          </CModalFooter>
        )}
      </CModal>

      <CRow className="g-3">
        {/* FORM */}
        <CCol xs={12} md={5}>
          <CCard className="shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Registrar Comunidad</strong>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <CRow className="g-2 mb-2">
                  <CCol xs={6} sm={3}>
                    <CFormSelect
                      size="sm"
                      value={codpais}
                      onChange={e => setCodpais(e.target.value)}
                      aria-label="País"
                      required
                      ref={paisRef}
                      onKeyDown={e => handleEnter(e, estadoRef)}
                    >
                      <option value="">País</option>
                      {paises.map(p => <option key={p.TMA_COPAIS} value={p.TMA_COPAIS}>{p.TMA_NOMBRE}</option>)}
                    </CFormSelect>
                  </CCol>
                  <CCol xs={6} sm={3}>
                    <CFormSelect
                      size="sm"
                      value={coesta}
                      onChange={e => setCoesta(e.target.value)}
                      aria-label="Estado"
                      required
                      disabled={!codpais}
                      ref={estadoRef}
                      onKeyDown={e => handleEnter(e, muniRef)}
                    >
                      <option value="">Estado</option>
                      {estados.map(e => <option key={e.TMA_COESTA} value={e.TMA_COESTA}>{e.TMA_NOMBRE}</option>)}
                    </CFormSelect>
                  </CCol>
                  <CCol xs={6} sm={3}>
                    <CFormSelect
                      size="sm"
                      value={comuni}
                      onChange={e => setComuni(e.target.value)}
                      aria-label="Municipio"
                      required
                      disabled={!coesta}
                      ref={muniRef}
                      onKeyDown={e => handleEnter(e, parrRef)}
                    >
                      <option value="">Municipio</option>
                      {municipios.map(m => <option key={m.TMA_COMUNI} value={m.TMA_COMUNI}>{m.TMA_NOMBRE}</option>)}
                    </CFormSelect>
                  </CCol>
                  <CCol xs={6} sm={3}>
                    <CFormSelect
                      size="sm"
                      value={coparr}
                      onChange={e => { setCoparr(e.target.value); setForm(prev => ({ ...prev, coparr: e.target.value })); }}
                      aria-label="Parroquia"
                      required
                      disabled={!comuni}
                      name="coparr"
                      ref={parrRef}
                      onKeyDown={e => handleEnter(e, nombreRef)}
                    >
                      <option value="">Parroquia</option>
                      {parroquiasForm.map(p => <option key={p.TMA_COPARR} value={p.TMA_COPARR}>{p.TMA_NOMBRE}</option>)}
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CFormInput
                  label="Nombre"
                  name="nombre"
                  placeholder='Ejm Barrio San Andrés'
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  maxLength={50}
                  minLength={10}
                  className="mb-1"
                  ref={nombreRef}
                  onKeyDown={e => handleEnter(e, direccionRef)}
                  onFocus={handleFocusClear}
                  onBlur={handleBlurRestore}
                />
                {errors.nombre && <div className="text-danger small mb-2">{errors.nombre}</div>}

                <CFormInput
                  label="Dirección"
                  name="direccion"
                  placeholder='Ejm Urb san cristobal sector la machiri'
                  value={form.direccion}
                  onChange={handleChange}
                  required
                  max={100}
                  minLength={5}
                  className="mb-1"
                  ref={direccionRef}
                  onKeyDown={e => handleEnter(e, habitaRef)}
                  onFocus={handleFocusClear}
                  onBlur={handleBlurRestore}
                />
                {errors.direccion && <div className="text-danger small mb-2">{errors.direccion}</div>}

                <CFormInput
                  label="Habitantes"
                  name="habita"
                  placeholder='Ejm 500'
                  type="number"
                  value={form.habita}
                  onChange={handleChange}
                  required
                  min={1}
                  max={MAX_HABITANTES}
                  className="mb-1"
                  ref={habitaRef}
                  onKeyDown={e => handleEnter(e, latRef)}
                  onFocus={handleFocusClear}
                  onBlur={handleBlurRestore}
                />
                {errors.habita && <div className="text-danger small mb-2">{errors.habita}</div>}

                <CFormInput
                  label="Latitud"
                  name="latitud"
                  placeholder='Ejm 7.1548'
                  value={form.latitud}
                  onChange={handleChange}
                  className="mb-1"
                  ref={latRef}
                  maxLength={6}
                  onKeyDown={e => handleEnter(e, longRef)}
                  pattern="^-?\d+\.\d+$"
                  title="Formato decimal obligatorio. Ej: 7.1548 o -7.1548. Rango -90 a 90."
                  onFocus={handleFocusClear}
                  onBlur={handleBlurRestore}
                />
                {errors.latitud && <div className="text-danger small mb-2">{errors.latitud}</div>}

                <CFormInput
                  label="Longitud"
                  name="longitud"
                  placeholder='Ejm -72.1245'
                  value={form.longitud}
                  onChange={handleChange}
                  className="mb-1"
                  ref={longRef}
                  maxLength={8}
                  onKeyDown={e => handleEnter(e, submitRef)}
                  pattern="^-\d+(\.\d+)?$"
                  title="Debe ser un número decimal negativo. Ej: -72.1245. Rango -180 a 0."
                  onFocus={handleFocusClear}
                  onBlur={handleBlurRestore}
                />
                {errors.longitud && <div className="text-danger small mb-2">{errors.longitud}</div>}

                <div className="d-grid mt-2">
                  <CButton ref={submitRef} style={{ backgroundColor: '#FF7043', color: 'white' }} type="submit">
                    Registrar
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        
        <CCol xs={12} md={7}>
          <CCard className="shadow-sm" style={{ maxWidth: 900, margin: '0 auto' }}>
            <CCardHeader className="d-flex flex-column gap-2 align-items-center">
              <strong>Comunidades Registradas</strong>
              <div style={{ width: '100%', maxWidth: 700 }}>
                <CFormInput
                  size="sm"
                  placeholder="Filtrar por nombre, dirección o parroquia..."
                  value={filter}
                  onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
                  onFocus={handleFocusClear}
                  onBlur={handleBlurRestore}
                />
              </div>
            </CCardHeader>
            <CCardBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {isSmall ? (
                <div className="d-flex flex-column gap-3" style={{ width: '100%', maxWidth: 760 }}>
                  {comunidadesToShow.map(comu => (
                    <CCard key={comu.TMA_CODCOM} className="p-3" style={{ borderRadius: 10, width: '100%' }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ textAlign: 'left' }}>
                          <h6 style={{ margin: 0 }}>{comu.TMA_NOMBRE}</h6>
                          <small className="text-muted">
                            {parroquias.find(p => p.TMA_COPARR === comu.TMA_COPARR)?.TMA_NOMBRE || comu.TMA_COPARR}
                          </small>
                          <p className="mb-1" style={{ fontSize: 13 }}>{comu.TMA_DIRECC}</p>
                          <div style={{ fontSize: 13 }}><strong>Habitantes:</strong> {comu.TMA_HABITA}</div>
                        </div>
                        {rol === 'admin' && (
                          <div className="d-flex flex-column align-items-end">
                            <CButton size="sm" className="mb-2" style={{ backgroundColor: 'white', color: '#ff7043', borderColor: '#ff7043' }} onClick={() => handleEditar(comu)}>Editar</CButton>
                            <CButton size="sm" style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }} onClick={() => handleEliminar(comu.TMA_CODCOM)}>Eliminar</CButton>
                          </div>
                        )}
                      </div>
                    </CCard>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <CTable align="middle" hover className="mb-0" style={{ minWidth: 760, margin: '0 auto' }}>
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>Nombre</CTableHeaderCell>
                        <CTableHeaderCell>Dirección</CTableHeaderCell>
                        <CTableHeaderCell style={{ textAlign: 'center' }}>Habitantes</CTableHeaderCell>
                        <CTableHeaderCell>Parroquia</CTableHeaderCell>
                        <CTableHeaderCell style={{ textAlign: 'center' }}>Latitud</CTableHeaderCell>
                        <CTableHeaderCell style={{ textAlign: 'center' }}>Longitud</CTableHeaderCell>
                        {rol === 'admin' && <CTableHeaderCell style={{ textAlign: 'center' }}>Acciones</CTableHeaderCell>}
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {comunidadesToShow.map(comu => (
                        <CTableRow key={comu.TMA_CODCOM}>
                          <CTableDataCell style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{comu.TMA_NOMBRE}</CTableDataCell>
                          <CTableDataCell style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{comu.TMA_DIRECC}</CTableDataCell>
                          <CTableDataCell style={{ textAlign: 'center' }}>{comu.TMA_HABITA}</CTableDataCell>
                          <CTableDataCell>{parroquias.find(p => p.TMA_COPARR === comu.TMA_COPARR)?.TMA_NOMBRE || comu.TMA_COPARR}</CTableDataCell>
                          <CTableDataCell style={{ textAlign: 'center' }}>{comu.TMA_LATITU}</CTableDataCell>
                          <CTableDataCell style={{ textAlign: 'center' }}>{comu.TMA_LONGIT}</CTableDataCell>
                          {rol === 'admin' && (
                            <CTableDataCell style={{ textAlign: 'center' }}>
                              <div className="d-flex gap-2 justify-content-center">
                                <CButton size="sm" style={{ backgroundColor: 'white', color: '#ff7043', borderColor: '#ff7043' }} onClick={() => handleEditar(comu)}>Editar</CButton>
                                <CButton size="sm" style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }} onClick={() => handleEliminar(comu.TMA_CODCOM)}>Eliminar</CButton>
                              </div>
                            </CTableDataCell>
                          )}
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}

              {/* Paginación */}
              <div className="d-flex justify-content-center my-3" style={{ width: '100%' }}>
                <CPagination align="center" className="mb-0">
                  <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&laquo;</CPaginationItem>
                  {[...Array(totalPages)].map((_, idx) => (
                    <CPaginationItem key={idx + 1} active={currentPage === idx + 1} onClick={() => setCurrentPage(idx + 1)} style={ currentPage === idx + 1 ? { backgroundColor: '#ff7043', color: 'white', borderColor: '#ff7043', borderRadius: 6 } : {}}>{idx + 1}</CPaginationItem>
                  ))}
                  <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>&raquo;</CPaginationItem>
                </CPagination>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      
      <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static" keyboard={false}>
        <CModalHeader><CModalTitle>Editar Comunidad</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput id="modal-nombre" label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required className="mb-3" maxLength={40} minLength={5} onFocus={handleFocusClear} onBlur={handleBlurRestore} />
            {errors.nombre && <div className="text-danger small mb-2">{errors.nombre}</div>}
            <CFormInput label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} required className="mb-3" maxLength={100} minLength={10} onFocus={handleFocusClear} onBlur={handleBlurRestore} />
            {errors.direccion && <div className="text-danger small mb-2">{errors.direccion}</div>}
            <CFormInput label="Habitantes" name="habita" type="number" value={form.habita} onChange={handleChange} required className="mb-3" min={1} max={MAX_HABITANTES} onFocus={handleFocusClear} onBlur={handleBlurRestore} />
            {errors.habita && <div className="text-danger small mb-2">{errors.habita}</div>}
            <CFormSelect label="Parroquia" name="coparr" value={form.coparr} onChange={handleChange} required className="mb-3">
              <option value="">Seleccione una parroquia</option>
              {parroquias.map(p => <option key={p.TMA_COPARR} value={p.TMA_COPARR}>{p.TMA_NOMBRE}</option>)}
            </CFormSelect>
            <CFormInput label="Latitud" name="latitud" value={form.latitud} onChange={handleChange} className="mb-3" maxLength={6} onFocus={handleFocusClear} onBlur={handleBlurRestore} />
            {errors.latitud && <div className="text-danger small mb-2">{errors.latitud}</div>}
            <CFormInput label="Longitud" name="longitud" value={form.longitud} onChange={handleChange} className="mb-3" onFocus={handleFocusClear} onBlur={handleBlurRestore} />
            {errors.longitud && <div className="text-danger small mb-2">{errors.longitud}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={handleUpdate}>Guardar</CButton>
          <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={() => setVisible(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ComunidadesCrudCoreUI;