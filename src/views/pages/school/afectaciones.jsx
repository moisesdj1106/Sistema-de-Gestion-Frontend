import React, { useEffect, useState, useRef } from 'react';
import {
  CCard, CCardBody, CCardHeader, CForm, CFormSelect, CFormInput, CButton, CContainer, CRow, CCol, CModal, CModalHeader, CModalBody, CAlert, CModalFooter, CFormCheck
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';

const RegistrarAfectacion = () => {
  // Afectación
  const [comunidades, setComunidades] = useState([]);
  const [desastres, setDesastres] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]);
  const [ultimaAfectacion, setUltimaAfectacion] = useState(null);
  const [formAfectacion, setFormAfectacion] = useState({
    codcom: '',
    feafec: '',
    codesa: ''
  });

  // Formularios modales
  const [formDamnificado, setFormDamnificado] = useState({
    cedula: '',
    tipodo: '',
    nombre: '',
    apelli: '',
    fenaci: '',
    contac: '',
    esalud: '',
    coafec: ''
  });
  const [errorsDamnificado, setErrorsDamnificado] = useState({});

  const [formVictima, setFormVictima] = useState({
    cedula: '',
    tipodo: '',
    nombre: '',
    apelli: '',
    certif: '',
    coafec: ''
  });
  const [errorsVictima, setErrorsVictima] = useState({});

  // Pérdidas
  const [modalPerdida, setModalPerdida] = useState(false);
  const [tiposPerdida, setTiposPerdida] = useState([]);
  const [formPerdida, setFormPerdida] = useState({
    coafec: '',
    coddoc: '',
    cedula: '',
    nombre: '',
    apelli: '',
    perdidas: []
  });
  const [errorsPerdida, setErrorsPerdida] = useState({});
  const [msgPerdida, setMsgPerdida] = useState({ type: '', text: '' });

  // Mensajes de estado
  const [msgAfectacion, setMsgAfectacion] = useState({ type: '', text: '' });
  const [msgDamnificado, setMsgDamnificado] = useState({ type: '', text: '' });
  const [msgVictima, setMsgVictima] = useState({ type: '', text: '' });

  // Modales
  const [modalDamnificado, setModalDamnificado] = useState(false);
  const [modalVictima, setModalVictima] = useState(false);

  // Buscador de comunidades
  const [comunidadSearch, setComunidadSearch] = useState('');
  const comunidadInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/comunidades/nombres`).then(res => res.json()).then(setComunidades);
    fetch(`${API}/desastres/nombres`).then(res => res.json()).then(setDesastres);
    fetch(`${API}/documento`).then(res => res.json()).then(setTiposDoc);
    fetch(`${API}/afectaciones/ultima`).then(res => res.json()).then(data => setUltimaAfectacion(data && data.TTR_COAFEC ? data : null));
  }, []);

  // Cargar tipos de pérdida y tipos de documento al abrir el modal
  useEffect(() => {
    if (modalPerdida) {
      fetch(`${API}/tipos-perdida`).then(res => res.json()).then(setTiposPerdida);
      fetch(`${API}/tipos-documento`).then(res => res.json()).then(setTiposDoc);
    }
  }, [modalPerdida]);

  // Filtrar comunidades según búsqueda
  const comunidadesFiltradas = comunidades.filter(c =>
    c.TMA_NOMBRE.toLowerCase().includes(comunidadSearch.toLowerCase())
  );

  const today = new Date();
  const maxFecha = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];

  // Helpers de sanitización
  const onlyDigits = (s) => String(s).replace(/\D/g, '');
  const onlyLetters = (s) => String(s).replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, '');
  const onlyDecimal = (s, allowNegative = true) => {
    // permite un signo negativo al inicio y un punto decimal
    let v = String(s).replace(/[^0-9.\-]/g, '');
    // solo un minus al inicio
    v = v.replace(/(?!^)-/g, '');
    // solo un punto
    const parts = v.split('.');
    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
    // si no se permiten negativos, eliminar minus
    if (!allowNegative) v = v.replace(/-/g, '');
    return v;
  };

  // Refs para atajos Enter -> next
  const damnCeduRef = useRef(null);
  const damnTipoRef = useRef(null);
  const damnNombreRef = useRef(null);
  const damnApelliRef = useRef(null);
  const damnFenaciRef = useRef(null);
  const damnContacRef = useRef(null);
  const damnEsaludRef = useRef(null);
  const damnCoafecRef = useRef(null);

  const victTipoRef = useRef(null);
  const victCeduRef = useRef(null);
  const victNombreRef = useRef(null);
  const victApelliRef = useRef(null);
  const victCertifRef = useRef(null);
  const victCoafecRef = useRef(null);

  const perCoafecRef = useRef(null);
  const perCoddocRef = useRef(null);
  const perCeduRef = useRef(null);
  const perNombreRef = useRef(null);
  const perApelliRef = useRef(null);

  const handleEnter = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) nextRef.current.focus();
    }
  };

  // ---------- DAMNIFICADO: handlers y validación ----------
  const handleDamnChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cedula' || name === 'contac') val = onlyDigits(value);
    if (name === 'nombre' || name === 'apelli' || name === 'esalud') val = onlyLetters(value);
    setFormDamnificado(prev => ({ ...prev, [name]: val }));
    setErrorsDamnificado(prev => ({ ...prev, [name]: '' }));
    setMsgDamnificado({ type: '', text: '' });
  };

  const validateDamnificado = () => {
    const errs = {};
    if (!formDamnificado.tipodo) errs.tipodo = 'Seleccione tipo de documento';
    if (!formDamnificado.cedula) errs.cedula = 'Cédula obligatoria';
    if (!/^\d{7,9}$/.test(formDamnificado.cedula)) errs.cedula = 'Cédula inválida (7-9 dígitos)';
    if (!formDamnificado.nombre) errs.nombre = 'Nombre obligatorio';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(formDamnificado.nombre)) errs.nombre = 'Nombre inválido';
    if (!formDamnificado.apelli) errs.apelli = 'Apellido obligatorio';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(formDamnificado.apelli)) errs.apelli = 'Apellido inválido';
    if (!formDamnificado.fenaci) errs.fenaci = 'Fecha de nacimiento obligatoria';
    if (formDamnificado.fenaci && formDamnificado.fenaci > maxFecha) errs.fenaci = 'Fecha no puede ser futura';
    if (!formDamnificado.contac) errs.contac = 'Contacto obligatorio';
    if (!/^\d{7,11}$/.test(formDamnificado.contac)) errs.contac = 'Número de contacto inválido';
    if (!formDamnificado.esalud) errs.esalud = 'Estado de salud obligatorio';
    if (!formDamnificado.coafec) errs.coafec = 'Seleccione afectación';
    setErrorsDamnificado(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitDamnificado = async (e) => {
    e.preventDefault();
    setMsgDamnificado({ type: '', text: '' });
    if (!validateDamnificado()) {
      // enfocar primer error
      const order = ['tipodo','cedula','nombre','apelli','fenaci','contac','esalud','coafec'];
      for (const k of order) {
        if (errorsDamnificado[k] || !validateDamnificado() && k in errorsDamnificado) {
          // try refs mapping
          const map = {
            tipodo: damnTipoRef, cedula: damnCeduRef, nombre: damnNombreRef, apelli: damnApelliRef,
            fenaci: damnFenaciRef, contac: damnContacRef, esalud: damnEsaludRef, coafec: damnCoafecRef
          };
          if (map[k] && map[k].current) map[k].current.focus();
          break;
        }
      }
      return;
    }

    const payload = {
      cedula: formDamnificado.cedula,
      tipodo: formDamnificado.tipodo,
      nombre: formDamnificado.nombre,
      apelli: formDamnificado.apelli,
      fenaci: formDamnificado.fenaci,
      contac: formDamnificado.contac,
      esalud: formDamnificado.esalud,
      coafec: Number(formDamnificado.coafec)
    };

    try {
      const res = await fetch(`${API}/damnificados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMsgDamnificado({ type: 'success', text: 'Damnificado registrado correctamente.' });
        setFormDamnificado({ cedula: '', tipodo: '', nombre: '', apelli: '', fenaci: '', contac: '', esalud: '', coafec: '' });
        setErrorsDamnificado({});
        setModalDamnificado(false);
      } else {
        setMsgDamnificado({ type: 'danger', text: data.mensaje || 'Error al registrar damnificado.' });
      }
    } catch {
      setMsgDamnificado({ type: 'danger', text: 'Error de conexión al registrar damnificado.' });
    }
  };


  const handleVictChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cedula' || name === 'certif') val = onlyDigits(value);
    if (name === 'nombre' || name === 'apelli') val = onlyLetters(value);
    setFormVictima(prev => ({ ...prev, [name]: val }));
    setErrorsVictima(prev => ({ ...prev, [name]: '' }));
    setMsgVictima({ type: '', text: '' });
  };

  const validateVictima = () => {
    const errs = {};
    if (!formVictima.tipodo) errs.tipodo = 'Seleccione tipo de documento';
    if (!formVictima.cedula) errs.cedula = 'Cédula obligatoria';
    if (!/^\d{7,9}$/.test(formVictima.cedula)) errs.cedula = 'Cédula inválida (7-9 dígitos)';
    if (!formVictima.nombre) errs.nombre = 'Nombre obligatorio';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(formVictima.nombre)) errs.nombre = 'Nombre inválido';
    if (!formVictima.apelli) errs.apelli = 'Apellido obligatorio';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(formVictima.apelli)) errs.apelli = 'Apellido inválido';
    if (formVictima.certif && !/^\d{1,9}$/.test(formVictima.certif)) errs.certif = 'Certificado inválido (1-9 dígitos)';
    if (!formVictima.coafec) errs.coafec = 'Seleccione afectación';
    setErrorsVictima(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitVictima = async (e) => {
    e.preventDefault();
    setMsgVictima({ type: '', text: '' });
    if (!validateVictima()) {
      // enfocar primer error
      const map = { tipodo: victTipoRef, cedula: victCeduRef, nombre: victNombreRef, apelli: victApelliRef, certif: victCertifRef, coafec: victCoafecRef };
      const order = ['tipodo','cedula','nombre','apelli','certif','coafec'];
      for (const k of order) {
        if (errorsVictima[k]) { if (map[k] && map[k].current) map[k].current.focus(); break; }
      }
      return;
    }

    const payload = {
      cedula: formVictima.cedula,
      tipodo: formVictima.tipodo,
      nombre: formVictima.nombre,
      apelli: formVictima.apelli,
      certif: formVictima.certif,
      coafec: Number(formVictima.coafec)
    };
    try {
      const res = await fetch(`${API}/victimas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMsgVictima({ type: 'success', text: 'Víctima registrada correctamente.' });
        setFormVictima({ cedula: '', tipodo: '', nombre: '', apelli: '', certif: '', coafec: '' });
        setErrorsVictima({});
        setModalVictima(false);
      } else {
        setMsgVictima({ type: 'danger', text: data.mensaje || 'Error al registrar víctima.' });
      }
    } catch {
      setMsgVictima({ type: 'danger', text: 'Error de conexión al registrar víctima.' });
    }
  };


  const handleChangePerdida = e => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cedula') val = onlyDigits(value);
    if (name === 'nombre' || name === 'apelli') val = onlyLetters(value);
    if (name === 'coddoc' || name === 'coafec') val = value;
    setFormPerdida(prev => ({ ...prev, [name]: val }));
    setErrorsPerdida(prev => ({ ...prev, [name]: '' }));
    setMsgPerdida({ type: '', text: '' });
  };

  const handleCheckPerdida = (cotipo) => {
    setFormPerdida(prev => {
      const exists = prev.perdidas.find(p => p.cotipo === cotipo);
      if (exists) {
        return { ...prev, perdidas: prev.perdidas.filter(p => p.cotipo !== cotipo) };
      } else {
        return { ...prev, perdidas: [...prev.perdidas, { cotipo, vaesti: '' }] };
      }
    });
  };

  const handleValorPerdida = (cotipo, value) => {
    // permitir solo números y punto
    const v = String(value).replace(/[^0-9.]/g, '');
    setFormPerdida(prev => ({
      ...prev,
      perdidas: prev.perdidas.map(p =>
        p.cotipo === cotipo ? { ...p, vaesti: v } : p
      )
    }));
  };

  const validatePerdida = () => {
    const errs = {};
    if (!formPerdida.coafec) errs.coafec = 'Seleccione afectación';
    if (!formPerdida.coddoc) errs.coddoc = 'Seleccione tipo de documento';
    if (!formPerdida.cedula) errs.cedula = 'Cédula obligatoria';
    if (!/^\d{7,9}$/.test(formPerdida.cedula)) errs.cedula = 'Cédula inválida (7-9 dígitos)';
    if (!formPerdida.nombre) errs.nombre = 'Nombre obligatorio';
    if (!formPerdida.apelli) errs.apelli = 'Apellido obligatorio';
    if (!formPerdida.perdidas || formPerdida.perdidas.length === 0) errs.perdidas = 'Seleccione al menos una pérdida';
    else {
      formPerdida.perdidas.forEach((p, idx) => {
        if (!p.vaesti || isNaN(p.vaesti) || Number(p.vaesti) <= 0) {
          errs[`perdida_${p.cotipo}`] = 'Valor estimado inválido';
        }
      });
    }
    setErrorsPerdida(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitPerdida = async (e) => {
    e.preventDefault();
    setMsgPerdida({ type: '', text: '' });
    if (!validatePerdida()) {
      // enfocar primer error
      const map = { coafec: perCoafecRef, coddoc: perCoddocRef, cedula: perCeduRef, nombre: perNombreRef, apelli: perApelliRef };
      const order = ['coafec','coddoc','cedula','nombre','apelli'];
      for (const k of order) { if (errorsPerdida[k]) { if (map[k] && map[k].current) map[k].current.focus(); break; } }
      return;
    }

    try {
      const res = await fetch(`${API}/perdidas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coafec: Number(formPerdida.coafec),
          coddoc: Number(formPerdida.coddoc),
          cedula: formPerdida.cedula,
          nombre: formPerdida.nombre,
          apelli: formPerdida.apelli,
          perdidas: formPerdida.perdidas.map(p => ({ cotipo: Number(p.cotipo), vaesti: Number(p.vaesti) }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsgPerdida({ type: 'success', text: 'Pérdidas registradas correctamente.' });
        setFormPerdida({ coafec: '', coddoc: '', cedula: '', nombre: '', apelli: '', perdidas: [] });
        setErrorsPerdida({});
        setModalPerdida(false);
      } else {
        setMsgPerdida({ type: 'danger', text: data.mensaje || 'Error al registrar pérdidas.' });
      }
    } catch {
      setMsgPerdida({ type: 'danger', text: 'Error de conexión al registrar pérdidas.' });
    }
  };

  // Para mostrar la comunidad y fecha en los selects de afectación
  const comunidadUltima = comunidades.find(c => c.TMA_CODCOM === (ultimaAfectacion?.TTR_CODCOM));
  const desastreUltima = desastres.find(d => d.TMA_CODESA === (ultimaAfectacion?.TTR_CODESA));


  const handleChange = (setter, form) => e => {
    const { name, value } = e.target;
    setter({ ...form, [name]: value });
  };

  const handleSubmitAfectacion = async e => {
    e.preventDefault();
    setMsgAfectacion({ type: '', text: '' });
    try {
      const res = await fetch(`${API}/afectaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formAfectacion)
      });
      const data = await res.json();
      if (res.ok) {
        setMsgAfectacion({ type: 'success', text: 'Afectación registrada correctamente.' });
        setFormAfectacion({ codcom: '', feafec: '', codesa: '' });
        fetch(`${API}/afectaciones/ultima`).then(res => res.json()).then(data => setUltimaAfectacion(data && data.TTR_COAFEC ? data : null));
      } else {
        setMsgAfectacion({ type: 'danger', text: data.mensaje || 'Error al registrar afectación.' });
      }
    } catch {
      setMsgAfectacion({ type: 'danger', text: 'Error de conexión al registrar afectación.' });
    }
  };

  return (
    <CContainer className="py-4">
      <style>{`
        .btn-hover-white { color: #212529 !important; transition: color 0.2s; }
        .btn-hover-white:hover, .btn-hover-white:focus { color: #fff !important; }
      `}</style>
      <CRow className="g-4 justify-content-center align-items-start">
        <CCol xs={12} md={10} lg={8} className="mx-auto">
          <CCard className="shadow-sm flex-fill d-flex flex-column" style={{ minHeight: 320 }}>
            <CCardHeader className="text-center py-2" style={{ background: '#f5f5f5' }}>
              <strong>Registrar Afectación</strong>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmitAfectacion}>
                <CFormInput
                  placeholder="Buscar comunidad..."
                  value={comunidadSearch}
                  onChange={e => setComunidadSearch(e.target.value)}
                  className="mb-2"
                />
                <CFormSelect
                  label="Comunidad"
                  name="codcom"
                  value={formAfectacion.codcom}
                  onChange={handleChange(setFormAfectacion, formAfectacion)}
                  required
                  className="mb-2"
                  inputRef={comunidadInputRef}
                >
                  <option value="">Seleccione comunidad</option>
                  {comunidadesFiltradas.map(c => (
                    <option key={c.TMA_CODCOM} value={c.TMA_CODCOM}>{c.TMA_NOMBRE}</option>
                  ))}
                </CFormSelect>
                <CFormInput
                  label="Fecha de afectación"
                  type="date"
                  name="feafec"
                  value={formAfectacion.feafec}
                  onChange={handleChange(setFormAfectacion, formAfectacion)}
                  max={maxFecha}
                  required
                  className="mb-2"
                />
                <CFormSelect
                  label="Desastre"
                  name="codesa"
                  value={formAfectacion.codesa}
                  onChange={handleChange(setFormAfectacion, formAfectacion)}
                  required
                  className="mb-3"
                >
                  <option value="">Seleccione desastre</option>
                  {desastres.map(d => (
                    <option key={d.TMA_CODESA} value={d.TMA_CODESA}>{d.TMA_NOMBRE}</option>
                  ))}
                </CFormSelect>
                {msgAfectacion.text && (
                  <CAlert color={msgAfectacion.type} className="mt-2 mb-1 py-2 text-center">
                    {msgAfectacion.text}
                  </CAlert>
                )}
                <CButton style={{backgroundColor:'#ff7043', color:'white'}} type="submit" className="w-100 mt-2">
                  Registrar afectación
                </CButton>
              </CForm>

              <div className="text-center mt-4">
                <div className="mb-3" style={{fontSize: '1rem'}}>
                  <strong>¿Tienes personas afectadas?</strong>
                  <div style={{fontSize: '0.95rem', marginTop: 8}}>
                    Si tienes damnificados, víctimas o pérdidas, regístralos aquí:
                  </div>
                </div>
                <CButton variant="outline" style={{ minWidth: 180, backgroundColor:'white', color:'green', borderColor:'green' }} onClick={() => setModalDamnificado(true)}>
                  Registrar Damnificado
                </CButton>
                <CButton variant="outline" style={{ minWidth: 180 , marginLeft:'10px',backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => setModalVictima(true)}>
                  Registrar Víctima
                </CButton>
                <CButton variant="outline" style={{ minWidth: 180 , marginLeft:'10px',backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={() => setModalPerdida(true)}>
                  Registrar Pérdida
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal Damnificado */}
      <CModal visible={modalDamnificado} onClose={() => { setModalDamnificado(false); setMsgDamnificado({ type: '', text: '' }); setErrorsDamnificado({}); }} size="lg">
        <CModalHeader closeButton><strong>Registrar Damnificado</strong></CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={6} className="border-end">
              <div className="mb-3 text-secondary">
                <strong>¿Quién es un damnificado?</strong>
                <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                  <li>Persona afectada directamente por el suceso.</li>
                  <li>Debe tener sus datos personales y de contacto completos.</li>
                  <li>Recuerda registrar el tipo y número de documento correctamente.</li>
                </ul>
              </div>
            </CCol>
            <CCol md={6}>
              <CForm className="d-flex flex-column h-100 justify-content-center" onSubmit={handleSubmitDamnificado}>
                <CFormSelect
                  label="Tipo de documento"
                  name="tipodo"
                  value={formDamnificado.tipodo}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  ref={damnTipoRef}
                  onKeyDown={e => handleEnter(e, damnCeduRef)}
                >
                  <option value="">Seleccione tipo</option>
                  {tiposDoc.map(t => (<option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>))}
                </CFormSelect>
                {errorsDamnificado.tipodo && <div className="text-danger small mb-2">{errorsDamnificado.tipodo}</div>}

                <CFormInput
                  label="Cédula"
                  name="cedula"
                  placeholder='Ejm 1234567'
                  value={formDamnificado.cedula}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  max={9}
                  min={7}
                  ref={damnCeduRef}
                  onKeyDown={e => handleEnter(e, damnNombreRef)}
                  inputMode="numeric"
                />
                {errorsDamnificado.cedula && <div className="text-danger small mb-2">{errorsDamnificado.cedula}</div>}

                <CFormInput
                  label="Nombre"
                  name="nombre"
                  placeholder='Ejm Daniel'
                  value={formDamnificado.nombre}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  ref={damnNombreRef}
                  onKeyDown={e => handleEnter(e, damnApelliRef)}
                />
                {errorsDamnificado.nombre && <div className="text-danger small mb-2">{errorsDamnificado.nombre}</div>}

                <CFormInput
                  label="Apellido"
                  name="apelli"
                  placeholder='Ejm Rangel'
                  value={formDamnificado.apelli}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  ref={damnApelliRef}
                  onKeyDown={e => handleEnter(e, damnFenaciRef)}
                />
                {errorsDamnificado.apelli && <div className="text-danger small mb-2">{errorsDamnificado.apelli}</div>}

                <CFormInput
                  label="Fecha de nacimiento"
                  type="date"
                  name="fenaci"
                  value={formDamnificado.fenaci}
                  onChange={handleDamnChange}
                  className="mb-2"
                  max={maxFecha}
                  required
                  ref={damnFenaciRef}
                  onKeyDown={e => handleEnter(e, damnContacRef)}
                />
                {errorsDamnificado.fenaci && <div className="text-danger small mb-2">{errorsDamnificado.fenaci}</div>}

                <CFormInput
                  label="Contacto"
                  name="contac"
                  placeholder='Ejm 04147146605'
                  value={formDamnificado.contac}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  max={11}
                  min={11}
                  ref={damnContacRef}
                  onKeyDown={e => handleEnter(e, damnEsaludRef)}
                  inputMode="numeric"
                />
                {errorsDamnificado.contac && <div className="text-danger small mb-2">{errorsDamnificado.contac}</div>}

                <CFormInput
                  label="Estado de salud"
                  name="esalud"
                  placeholder='Ejm Estable'
                  value={formDamnificado.esalud}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  ref={damnEsaludRef}
                  onKeyDown={e => handleEnter(e, damnCoafecRef)}
                />
                {errorsDamnificado.esalud && <div className="text-danger small mb-2">{errorsDamnificado.esalud}</div>}

                <CFormSelect
                  label="Afectación"
                  name="coafec"
                  value={formDamnificado.coafec}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  ref={damnCoafecRef}
                >
                  <option value="">Seleccione afectación</option>
                  {ultimaAfectacion && (
                    <option value={ultimaAfectacion.TTR_COAFEC}>
                      {(comunidadUltima?.TMA_NOMBRE || ultimaAfectacion.TTR_CODCOM) + ' - ' +
                        (ultimaAfectacion.TTR_FEAFEC ? new Date(ultimaAfectacion.TTR_FEAFEC).toLocaleDateString('es-VE') : '')}
                    </option>
                  )}
                </CFormSelect>
                {errorsDamnificado.coafec && <div className="text-danger small mb-2">{errorsDamnificado.coafec}</div>}

                {msgDamnificado.text && <CAlert color={msgDamnificado.type} className="mt-2 mb-1 py-2 text-center">{msgDamnificado.text}</CAlert>}
                <CButton color="success text-white" type="submit" className="w-100 mt-2">Registrar damnificado</CButton>
              </CForm>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>

      {/* Modal Víctima */}
      <CModal visible={modalVictima} onClose={() => { setModalVictima(false); setMsgVictima({ type: '', text: '' }); setErrorsVictima({}); }} size="lg">
        <CModalHeader closeButton><strong>Registrar Víctima</strong></CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={6} className="border-end">
              <div className="mb-3 text-secondary">
                <strong>¿Quién es una víctima?</strong>
                <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                  <li>Persona que fallecio a causa del suceso.</li>
                  <li>Debes registrar el tipo de documento, nombre, apellido y certificado de defuncion.</li>
                </ul>
                <hr className="my-2" />
              </div>
            </CCol>
            <CCol md={6}>
              <CForm className="d-flex flex-column h-100 justify-content-center" onSubmit={handleSubmitVictima}>
                <CFormSelect
                  label="Tipo de documento"
                  name="tipodo"
                  value={formVictima.tipodo}
                  onChange={handleVictChange}
                  className="mb-2"
                  required
                  ref={victTipoRef}
                  onKeyDown={e => handleEnter(e, victCeduRef)}
                >
                  <option value="">Seleccione tipo</option>
                  {tiposDoc.map(t => (<option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>))}
                </CFormSelect>
                {errorsVictima.tipodo && <div className="text-danger small mb-2">{errorsVictima.tipodo}</div>}

                <CFormInput
                  label="Cédula"
                  name="cedula"
                  placeholder='Ejm 1234567'
                  value={formVictima.cedula}
                  onChange={handleVictChange}
                  className="mb-2"
                  required
                  max={9}
                  min={7}
                  ref={victCeduRef}
                  onKeyDown={e => handleEnter(e, victNombreRef)}
                  inputMode="numeric"
                />
                {errorsVictima.cedula && <div className="text-danger small mb-2">{errorsVictima.cedula}</div>}

                <CFormInput
                  label="Nombre"
                  name="nombre"
                  placeholder='Ejm Daniel'
                  value={formVictima.nombre}
                  onChange={handleVictChange}
                  className="mb-2"
                  required
                  ref={victNombreRef}
                  onKeyDown={e => handleEnter(e, victApelliRef)}
                />
                {errorsVictima.nombre && <div className="text-danger small mb-2">{errorsVictima.nombre}</div>}

                <CFormInput
                  label="Apellido"
                  name="apelli"
                  placeholder='Ejm Rangel'
                  value={formVictima.apelli}
                  onChange={handleVictChange}
                  className="mb-2"
                  required
                  ref={victApelliRef}
                  onKeyDown={e => handleEnter(e, victCertifRef)}
                />
                {errorsVictima.apelli && <div className="text-danger small mb-2">{errorsVictima.apelli}</div>}

                <CFormInput
                  label="Certificado de defunción"
                  name="certif"
                  placeholder='Ejm 1234567'
                  value={formVictima.certif}
                  onChange={handleVictChange}
                  className="mb-2"
                  max={9}
                  min={7}
                  ref={victCertifRef}
                  onKeyDown={e => handleEnter(e, victCoafecRef)}
                  inputMode="numeric"
                />
                {errorsVictima.certif && <div className="text-danger small mb-2">{errorsVictima.certif}</div>}

                <CFormSelect
                  label="Afectación"
                  name="coafec"
                  value={formVictima.coafec}
                  onChange={handleVictChange}
                  className="mb-2"
                  required
                  ref={victCoafecRef}
                >
                  <option value="">Seleccione afectación</option>
                  {ultimaAfectacion && (
                    <option value={ultimaAfectacion.TTR_COAFEC}>
                      {(comunidadUltima?.TMA_NOMBRE || ultimaAfectacion.TTR_CODCOM) + ' - ' +
                        (ultimaAfectacion.TTR_FEAFEC ? new Date(ultimaAfectacion.TTR_FEAFEC).toLocaleDateString('es-VE') : '')}
                    </option>
                  )}
                </CFormSelect>
                {errorsVictima.coafec && <div className="text-danger small mb-2">{errorsVictima.coafec}</div>}

                {msgVictima.text && <CAlert color={msgVictima.type} className="mt-2 mb-1 py-2 text-center">{msgVictima.text}</CAlert>}
                <CButton color="danger text-white" type="submit" className="w-100 mt-2">Registrar víctima</CButton>
              </CForm>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>

      {/* Modal Registrar Pérdida */}
      <CModal visible={modalPerdida} onClose={() => { setModalPerdida(false); setMsgPerdida({ type: '', text: '' }); setErrorsPerdida({}); }} size="lg">
        <CModalHeader closeButton><strong>Registrar Pérdidas</strong></CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={5} className="border-end">
              <div className="mb-3 text-secondary">
                <strong>¿Cómo registrar una pérdida?</strong>
                <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                  <li>Selecciona la afectación a la que corresponde la pérdida.</li>
                  <li>Completa los datos personales de la persona afectada.</li>
                  <li>Marca uno o varios tipos de pérdida y coloca el valor estimado de cada una.</li>
                </ul>
              </div>
            </CCol>
            <CCol md={7}>
              <CForm onSubmit={handleSubmitPerdida}>
                <CFormSelect
                  label="Afectación"
                  name="coafec"
                  value={formPerdida.coafec}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                  ref={perCoafecRef}
                  onKeyDown={e => handleEnter(e, perCoddocRef)}
                >
                  <option value="">Seleccione afectación</option>
                  {ultimaAfectacion && (
                    <option value={ultimaAfectacion.TTR_COAFEC}>
                      {(comunidadUltima?.TMA_NOMBRE || ultimaAfectacion.TTR_CODCOM) + ' - ' +
                        (ultimaAfectacion.TTR_FEAFEC ? new Date(ultimaAfectacion.TTR_FEAFEC).toLocaleDateString('es-VE') : '')}
                    </option>
                  )}
                </CFormSelect>
                {errorsPerdida.coafec && <div className="text-danger small mb-2">{errorsPerdida.coafec}</div>}

                <CFormSelect
                  label="Tipo de documento"
                  name="coddoc"
                  value={formPerdida.coddoc}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                  ref={perCoddocRef}
                  onKeyDown={e => handleEnter(e, perCeduRef)}
                >
                  <option value="">Seleccione tipo de documento</option>
                  {tiposDoc.map(t => (<option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>))}
                </CFormSelect>
                {errorsPerdida.coddoc && <div className="text-danger small mb-2">{errorsPerdida.coddoc}</div>}

                <CFormInput
                  label="Cédula"
                  name="cedula"
                  placeholder='Ejm 1234567'
                  value={formPerdida.cedula}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                  max={9}
                  min={7}
                  ref={perCeduRef}
                  onKeyDown={e => handleEnter(e, perNombreRef)}
                  inputMode="numeric"
                />
                {errorsPerdida.cedula && <div className="text-danger small mb-2">{errorsPerdida.cedula}</div>}

                <CFormInput
                  label="Nombre"
                  name="nombre"
                  placeholder='Ejm Daniel'
                  value={formPerdida.nombre}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                  ref={perNombreRef}
                  onKeyDown={e => handleEnter(e, perApelliRef)}
                />
                {errorsPerdida.nombre && <div className="text-danger small mb-2">{errorsPerdida.nombre}</div>}

                <CFormInput
                  label="Apellido"
                  name="apelli"
                  placeholder='Ejm Rangel'
                  value={formPerdida.apelli}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                  ref={perApelliRef}
                />
                {errorsPerdida.apelli && <div className="text-danger small mb-2">{errorsPerdida.apelli}</div>}

                <div className="mb-2">
                  <label><strong>Tipos de pérdida</strong></label>
                  {tiposPerdida.map(tipo => (
                    <div key={tipo.TTR_COTIPO} className="d-flex align-items-center mb-2">
                      <CFormCheck
                        type="checkbox"
                        id={`tipo-${tipo.TTR_COTIPO}`}
                        checked={!!formPerdida.perdidas.find(p => p.cotipo === tipo.TTR_COTIPO)}
                        onChange={() => handleCheckPerdida(tipo.TTR_COTIPO)}
                        label={tipo.TTR_NOMBRE}
                      />
                      {formPerdida.perdidas.find(p => p.cotipo === tipo.TTR_COTIPO) && (
                        <CFormInput
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="Valor estimado"
                          value={formPerdida.perdidas.find(p => p.cotipo === tipo.TTR_COTIPO)?.vaesti || ''}
                          onChange={e => handleValorPerdida(tipo.TTR_COTIPO, e.target.value)}
                          style={{ width: 140, marginLeft: 12 }}
                          required
                        />
                      )}
                      {errorsPerdida[`perdida_${tipo.TTR_COTIPO}`] && <div className="text-danger small ms-2">{errorsPerdida[`perdida_${tipo.TTR_COTIPO}`]}</div>}
                    </div>
                  ))}
                  {errorsPerdida.perdidas && <div className="text-danger small">{errorsPerdida.perdidas}</div>}
                </div>
                {msgPerdida.text && <CAlert color={msgPerdida.type} className="mt-2 mb-1 py-2 text-center">{msgPerdida.text}</CAlert>}
                <CModalFooter>
                  <CButton color="warning text-white" type="submit">Registrar pérdidas</CButton>
                </CModalFooter>
              </CForm>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>
    </CContainer>
  );
};

export default RegistrarAfectacion;