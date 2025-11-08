import React, { useEffect, useState, useRef } from 'react';
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardHeader, CButton, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CForm, CFormInput, CFormSelect, CModal, CModalHeader,
  CModalTitle, CModalBody, CModalFooter, CToast, CToaster, CPagination, CPaginationItem
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';

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
  const [editId, setEditId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', color: 'success' });
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

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

  // Cargar países al inicio
  useEffect(() => {
    fetch(`${API}/paises`)
      .then(res => res.json())
      .then(setPaises)
      .catch(console.error);
  }, []);

  // Cargar estados al seleccionar país
  useEffect(() => {
    if (codpais) {
      fetch(`${API}/estados/${codpais}`)
        .then(res => res.json())
        .then(setEstados)
        .catch(console.error);
    } else {
      setEstados([]);
      setCoesta('');
    }
    setMunicipios([]);
    setComuni('');
    setParroquiasForm([]);
    setCoparr('');
  }, [codpais]);

  // Cargar municipios al seleccionar estado
  useEffect(() => {
    if (coesta) {
      fetch(`${API}/municipios/${coesta}`)
        .then(res => res.json())
        .then(setMunicipios)
        .catch(console.error);
    } else {
      setMunicipios([]);
      setComuni('');
    }
    setParroquiasForm([]);
    setCoparr('');
  }, [coesta]);

  // Cargar parroquias al seleccionar municipio
  useEffect(() => {
    if (comuni) {
      fetch(`${API}/parroquias/${comuni}`)
        .then(res => res.json())
        .then(setParroquiasForm)
        .catch(console.error);
    } else {
      setParroquiasForm([]);
      setCoparr('');
    }
  }, [comuni]);

  // Cuando cambia coparr en el formulario, actualiza el form principal
  useEffect(() => {
    setForm(f => ({ ...f, coparr }));
  }, [coparr]);

  // Cargar comunidades y parroquias para la tabla y edición
  const cargarComunidades = () => {
    fetch(`${API}/comunidades`)
      .then(res => res.json())
      .then(data => setComunidades(data))
      .catch(console.error);
  };
  const cargarParroquias = () => {
    fetch(`${API}/parroquias`)
      .then(res => res.json())
      .then(data => setParroquias(data))
      .catch(console.error);
  };

  useEffect(() => {
    cargarComunidades();
    cargarParroquias();
  }, []);

  // Manejar cambios en el formulario (con limpieza básica)
  const handleChange = e => {
    const { name, value } = e.target;
    // Si es número de habitantes permitir solo dígitos
    if (name === 'habita') {
      setForm({ ...form, [name]: value.replace(/\D/g, '') });
    } else {
      setForm({ ...form, [name]: value });
    }
    if (name === 'coparr') setCoparr(value);
  };

  // Crear comunidad
  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch(`${API}/comunidades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setToast({ show: true, message: 'Comunidad registrada', color: 'success' });
      setForm({ nombre: '', direccion: '', habita: '', coparr: '', latitud: '', longitud: '' });
      setCodpais('');
      setCoesta('');
      setComuni('');
      setCoparr('');
      cargarComunidades();
      // focus primer campo
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
    // small delay to let modal render then focus
    setTimeout(() => {
      const el = document.querySelector('#modal-nombre');
      if (el) el.focus();
    }, 150);
  };

  // Guardar edición
  const handleUpdate = async () => {
    const res = await fetch(`${API}/comunidades/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setToast({ show: true, message: 'Comunidad actualizada', color: 'info' });
      setVisible(false);
      setEditId(null);
      setForm({ nombre: '', direccion: '', habita: '', coparr: '', latitud: '', longitud: '' });
      cargarComunidades();
    } else {
      const error = await res.json();
      setErrorModal({ show: true, message: error.message || 'Error al actualizar' });
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
            <CButton  size="sm" className="mb-2"
              style={{ minWidth: 70, backgroundColor:'white',color:'#ff7043', borderColor:'#ff7043' }}
              onClick={async () => {
                const res = await fetch(`${API}/comunidades/${codcom}`, { method: 'DELETE' });
                if (res.ok) {
                  setErrorModal({ show: false, message: '' });
                  setToast({ show: true, message: 'Comunidad eliminada', color: 'warning' });
                  cargarComunidades();
                } else {
                  const error = await res.json();
                  setErrorModal({ show: true, message: error.message || 'Error al eliminar' });
                }
              }}>
              Eliminar
            </CButton>
            <CButton  size="sm" style={{ minWidth: 70,backgroundColor:'white',color:'red', borderColor:'red' }} onClick={() => setErrorModal({ show: false, message: '' })}>
              Cancelar
            </CButton>
          </div>
        </span>
      )
    });
  };

  // PAGINACIÓN: calcular datos a mostrar
  const totalPages = Math.ceil(comunidades.length / itemsPerPage) || 1;
  const comunidadesToShow = comunidades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <CContainer className="py-4">
      {/* Modal centrado para éxito y error */}
      <CModal
        alignment="center"
        visible={toast.show || errorModal.show}
        onClose={() => {
          setToast({ ...toast, show: false })
          setErrorModal({ show: false, message: '' })
        }}
      >
        <CModalHeader>
          <CModalTitle>
            {toast.show ? 'Éxito' : 'Mensaje'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center">
          {toast.show && <span style={{ color: toast.color === 'success' ? 'green' : '#ff7043' }}>{toast.message}</span>}
          {errorModal.show && <span style={{ color: 'red' }}>{typeof errorModal.message === 'string' ? errorModal.message : ''}</span>}
          {/* Si es confirmación de eliminar, muestra los botones originales */}
          {typeof errorModal.message !== 'string' && errorModal.show && errorModal.message}
        </CModalBody>
        {(toast.show || (errorModal.show && typeof errorModal.message === 'string')) && (
          <CModalFooter>
            <CButton style={{backgroundColor:'white',color:'#ff7043', borderColor:'#ff7043'}} onClick={() => {
              setToast({ ...toast, show: false })
              setErrorModal({ show: false, message: '' })
            }}>
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
                      {paises.map(p => (
                        <option key={p.TMA_COPAIS} value={p.TMA_COPAIS}>{p.TMA_NOMBRE}</option>
                      ))}
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
                      {estados.map(e => (
                        <option key={e.TMA_COESTA} value={e.TMA_COESTA}>{e.TMA_NOMBRE}</option>
                      ))}
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
                      {municipios.map(m => (
                        <option key={m.TMA_COMUNI} value={m.TMA_COMUNI}>{m.TMA_NOMBRE}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol xs={6} sm={3}>
                    <CFormSelect
                      size="sm"
                      value={coparr}
                      onChange={e => setCoparr(e.target.value)}
                      aria-label="Parroquia"
                      required
                      disabled={!comuni}
                      name="coparr"
                      ref={parrRef}
                      onKeyDown={e => handleEnter(e, nombreRef)}
                    >
                      <option value="">Parroquia</option>
                      {parroquiasForm.map(p => (
                        <option key={p.TMA_COPARR} value={p.TMA_COPARR}>{p.TMA_NOMBRE}</option>
                      ))}
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
                  className="mb-3"
                  ref={nombreRef}
                  onKeyDown={e => handleEnter(e, direccionRef)}
                />
                <CFormInput
                  label="Dirección"
                  name="direccion"
                  placeholder='Ejm Urb san cristobal sector la machiri'
                  value={form.direccion}
                  onChange={handleChange}
                  required
                  className="mb-3"
                  ref={direccionRef}
                  onKeyDown={e => handleEnter(e, habitaRef)}
                />
                <CFormInput
                  label="Habitantes"
                  name="habita"
                  placeholder='Ejm 500'
                  type="number"
                  value={form.habita}
                  onChange={handleChange}
                  required
                  className="mb-3"
                  ref={habitaRef}
                  onKeyDown={e => handleEnter(e, latRef)}
                />
                <CFormInput
                  label="Latitud"
                  name="latitud"
                  placeholder='Ejm 7.1548'
                  value={form.latitud}
                  onChange={handleChange}
                  className="mb-3"
                  ref={latRef}
                  onKeyDown={e => handleEnter(e, longRef)}
                />
                <CFormInput
                  label="Longitud"
                  name="longitud"
                  placeholder='Ejm -72.1245'
                  value={form.longitud}
                  onChange={handleChange}
                  className="mb-3"
                  ref={longRef}
                  onKeyDown={e => handleEnter(e, submitRef)}
                />
                <div className="d-grid">
                  <CButton ref={submitRef} style={{ backgroundColor: '#FF7043', color: 'white' }} type="submit">
                    Registrar
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* LISTADO: tabla para md+ y tarjetas para xs */}
        <CCol xs={12} md={7}>
          <CCard className="shadow-sm">
            <CCardHeader>
              <strong>Comunidades Registradas</strong>
            </CCardHeader>
            <CCardBody>
              {/* Tarjetas para pantallas pequeñas */}
              {isSmall && (
                <div className="d-flex flex-column gap-3">
                  {comunidadesToShow.map(comu => (
                    <CCard key={comu.TMA_CODCOM} className="p-3" style={{ borderRadius: 10 }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 style={{ margin: 0 }}>{comu.TMA_NOMBRE}</h6>
                          <small className="text-muted">{parroquias.find(p => p.TMA_COPARR === comu.TMA_COPARR)?.TMA_NOMBRE || comu.TMA_COPARR}</small>
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
              )}

              {/* Tabla para md+ */}
              {!isSmall && (
                <div style={{ overflowX: 'auto' }}>
                  <CTable align="middle" hover className="mb-0" style={{ minWidth: 650 }}>
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>Nombre</CTableHeaderCell>
                        <CTableHeaderCell>Dirección</CTableHeaderCell>
                        <CTableHeaderCell>Habitantes</CTableHeaderCell>
                        <CTableHeaderCell>Parroquia</CTableHeaderCell>
                        <CTableHeaderCell>Latitud</CTableHeaderCell>
                        <CTableHeaderCell>Longitud</CTableHeaderCell>
                        {rol === 'admin' && <CTableHeaderCell>Acciones</CTableHeaderCell>}
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {comunidadesToShow.map(comu => (
                        <CTableRow key={comu.TMA_CODCOM}>
                          <CTableDataCell>{comu.TMA_NOMBRE}</CTableDataCell>
                          <CTableDataCell>{comu.TMA_DIRECC}</CTableDataCell>
                          <CTableDataCell style={{ textAlign: 'center' }}>{comu.TMA_HABITA}</CTableDataCell>
                          <CTableDataCell>{parroquias.find(p => p.TMA_COPARR === comu.TMA_COPARR)?.TMA_NOMBRE || comu.TMA_COPARR}</CTableDataCell>
                          <CTableDataCell style={{ textAlign: 'center' }}>{comu.TMA_LATITU}</CTableDataCell>
                          <CTableDataCell style={{ textAlign: 'center' }}>{comu.TMA_LONGIT}</CTableDataCell>
                          {rol === 'admin' && (
                            <CTableDataCell>
                              <div className="d-flex gap-2">
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
                      style={ currentPage === idx + 1 ? { backgroundColor: '#ff7043', color: 'white', borderColor: '#ff7043', borderRadius: 6 } : {}}
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
        </CCol>
      </CRow>

      {/* Modal para editar */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Editar Comunidad</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              id="modal-nombre"
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="mb-3"
            />
            <CFormInput
              label="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              required
              className="mb-3"
            />
            <CFormInput
              label="Habitantes"
              name="habita"
              type="number"
              value={form.habita}
              onChange={handleChange}
              required
              className="mb-3"
            />
            <CFormSelect
              label="Parroquia"
              name="coparr"
              value={form.coparr}
              onChange={handleChange}
              required
              className="mb-3"
            >
              <option value="">Seleccione una parroquia</option>
              {parroquias.map(p => (
                <option key={p.TMA_COPARR} value={p.TMA_COPARR}>{p.TMA_NOMBRE}</option>
              ))}
            </CFormSelect>
            <CFormInput
              label="Latitud"
              name="latitud"
              value={form.latitud}
              onChange={handleChange}
              className="mb-3"
            />
            <CFormInput
              label="Longitud"
              name="longitud"
              value={form.longitud}
              onChange={handleChange}
              className="mb-3"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={handleUpdate}>Guardar</CButton>
          <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}}  onClick={() => setVisible(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ComunidadesCrudCoreUI;