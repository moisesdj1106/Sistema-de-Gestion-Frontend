import React, { useEffect, useState, useRef } from 'react';
import {
  CCard, CCardBody, CCardHeader, CForm, CFormSelect, CFormInput, CButton, CContainer, CRow, CCol, CModal, CModalHeader, CModalBody, CAlert, CModalFooter, CFormCheck
} from '@coreui/react';

/*const API = 'http://localhost:4000';*/
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
    // cada item: { cotipo, vaesti, descri }
    perdidas: []
  });
  const [errorsPerdida, setErrorsPerdida] = useState({});
  const [msgPerdida, setMsgPerdida] = useState({ type: '', text: '' });

  // Mensajes de estado
  const [msgAfectacion, setMsgAfectacion] = useState({ type: '', text: '' });
  const [msgDamnificado, setMsgDamnificado] = useState({ type: '', text: '' });
  const [msgVictima, setMsgVictima] = useState({ type: '', text: '' });
  const [msgAfectado, setMsgAfectado] = useState({ type: '', text: '' });

  // Modales
  const [modalDamnificado, setModalDamnificado] = useState(false);
  const [modalVictima, setModalVictima] = useState(false);
  const [modalAfectado, setModalAfectado] = useState(false);

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

  // limpiar mensajes autom. después de mostrar éxito/error (4s)
  useEffect(() => {
    const timers = [];
    if (msgAfectacion.text) timers.push(setTimeout(() => setMsgAfectacion({ type: '', text: '' }), 4000));
    if (msgDamnificado.text) timers.push(setTimeout(() => setMsgDamnificado({ type: '', text: '' }), 4000));
    if (msgVictima.text) timers.push(setTimeout(() => setMsgVictima({ type: '', text: '' }), 4000));
    if (msgPerdida.text) timers.push(setTimeout(() => setMsgPerdida({ type: '', text: '' }), 4000));
    return () => timers.forEach(t => clearTimeout(t));
  }, [msgAfectacion.text, msgDamnificado.text, msgVictima.text, msgPerdida.text]);

  // Evitar que botón atrás del navegador cierre modal y evitar clic fuera cierre
  useEffect(() => {
    const handlePop = () => {
      if (modalDamnificado || modalVictima || modalPerdida) {
        window.history.pushState(null, '', window.location.href);
      }
    };
    if (modalDamnificado || modalVictima || modalPerdida) {
      // agrega entrada para bloquear retroceso y escucha
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePop);
    }
    return () => {
      window.removeEventListener('popstate', handlePop);
    };
  }, [modalDamnificado, modalVictima, modalPerdida]);

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

  // Determina si el tipo de documento debe tratarse como "pasaporte"
  const isPassportId = (id) => {
    if (id === null || id === undefined) return false;
    // acepta por nombre (función existente), por id numérico '3' o por valores 'p'/'P'
    return isPassportType(id) || String(id) === '3' || String(id).toLowerCase() === 'p';
  };
  
  // Helpers para tipos de documento (validaciones similares a login)
  const getDocNameById = (id) => tiposDoc && tiposDoc.length ? (tiposDoc.find(t => String(t.TMA_CODDOC) === String(id))?.TMA_NOMBRE || '') : '';
  const isPassportType = (id) => /pasap|pasaporte/i.test(getDocNameById(id));
  const validateIdByDocType = (value, typeId) => {
    if (!value) return 'Documento obligatorio';
    const v = String(value).trim();
    if (isPassportId(typeId)) {
      
      if (!/^[A-Za-z0-9 .\-\/]{3,10}$/.test(v)) {
        return 'Documento inválido para pasaporte (7-10: caracteres permitidos: letras, números, espacio, -  .)';
      }
      if (!/[A-Za-z]/.test(v)) return 'Pasaporte debe contener al menos una letra';
      if (!/\d/.test(v)) return 'Pasaporte debe contener al menos un número';
    } else {
      // documento nacional: solo dígitos, 7-9
      if (!/^\d{7,9}$/.test(v)) return 'Cédula inválida (7-9 dígitos)';
    }
    return '';
  };
  const validatePhone = (value) => {
    if (!value) return 'Teléfono obligatorio';
    if (!/^(0414|0424|0416|0426|0412|0422)\d{7}$/.test(value)) {
      return 'Teléfono inválido. Use prefijos válidos: 0414, 0424, 0416, 0426, 0412, 0422';
    }
    return '';
  };
  const validateCertif = (v) => {
    if (!v) return '';
    if (!/^[A-Za-z0-9\-]{1,9}$/.test(String(v).trim())) return 'Certificado inválido (1-9 caracteres alfanuméricos y "-")';
    return '';
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
    if (name === 'contac') val = onlyDigits(value);
    if (name === 'nombre' || name === 'apelli' || name === 'esalud') val = onlyLetters(value);
    // actualizar estado
    if (name === 'cedula') {
      setFormDamnificado(prev => {
        const passport = isPassportId(prev.tipodo);
        return { ...prev, cedula: passport ? String(val).replace(/[^A-Za-z0-9-]/g, '').toUpperCase() : onlyDigits(val) };
      });
    } else if (name === 'tipodo') {
      // al cambiar tipo, ajustar el contenido del documento según nueva regla
      setFormDamnificado(prev => {
        const newTip = val;
        const passport = isPassportId(newTip);
        return { ...prev, tipodo: newTip, cedula: passport ? (prev.cedula ? String(prev.cedula).toUpperCase() : prev.cedula) : onlyDigits(prev.cedula) };
      });
    } else {
      setFormDamnificado(prev => ({ ...prev, [name]: val }));
    }
 
    // validaciones inmediatas dependientes de tipo de documento / teléfono / nombre/apelli
    if (name === 'contac') {
      setErrorsDamnificado(prev => ({ ...prev, contac: validatePhone(val) }));
    } else if (name === 'cedula' || name === 'tipodo') {
      const typeId = name === 'tipodo' ? val : formDamnificado.tipodo;
      const cedulaValue = name === 'cedula' ? (isPassportId(typeId) ? String(val).replace(/[^A-Za-z0-9-]/g, '').toUpperCase() : onlyDigits(val)) : formDamnificado.cedula;
      setErrorsDamnificado(prev => ({ ...prev, cedula: validateIdByDocType(cedulaValue, typeId) }));
    } else if (name === 'nombre') {
      const err = !val ? 'Nombre obligatorio' : (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\'-]{3,}$/.test(val) ? 'Nombre inválido' : '');
      setErrorsDamnificado(prev => ({ ...prev, nombre: err }));
    } else if (name === 'apelli') {
      const err = !val ? 'Apellido obligatorio' : (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\'-]{3,}$/.test(val) ? 'Apellido inválido' : '');
      setErrorsDamnificado(prev => ({ ...prev, apelli: err }));
    } else {
      setErrorsDamnificado(prev => ({ ...prev, [name]: '' }));
    }
    setMsgDamnificado({ type: '', text: '' });
  };

  const validateDamnificado = () => {
    const errs = {};
    if (!formDamnificado.tipodo) errs.tipodo = 'Seleccione tipo de documento';
    const cedErr = validateIdByDocType(formDamnificado.cedula, formDamnificado.tipodo);
    if (cedErr) errs.cedula = cedErr;
    if (!formDamnificado.nombre) errs.nombre = 'Nombre obligatorio';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{3,}$/.test(formDamnificado.nombre)) errs.nombre = 'Nombre inválido';
    if (!formDamnificado.apelli) errs.apelli = 'Apellido obligatorio';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{3,}$/.test(formDamnificado.apelli)) errs.apelli = 'Apellido inválido';
    if (!formDamnificado.fenaci) errs.fenaci = 'Fecha de nacimiento obligatoria';
    if (formDamnificado.fenaci && formDamnificado.fenaci > maxFecha) errs.fenaci = 'Fecha no puede ser futura';
    const phErr = validatePhone(formDamnificado.contac);
    if (phErr) errs.contac = phErr;
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
        if (errorsDamnificado[k]) {
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
      tipodo: Number(formDamnificado.tipodo),
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
        if (data.errors && typeof data.errors === 'object') setErrorsDamnificado(prev => ({ ...prev, ...data.errors }));
      }
    } catch {
      setMsgDamnificado({ type: 'danger', text: 'Error de conexión al registrar damnificado.' });
    }
  };


  const handleVictChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'certif') {
      // convertir a mayúsculas y permitir solo A-Z, 0-9 y guion en tiempo real
      const v = String(value).toUpperCase().replace(/[^A-Z0-9-]/g, '');
      setFormVictima(prev => ({ ...prev, certif: v }));
      setErrorsVictima(prev => ({ ...prev, certif: validateCertif(v) }));
      setMsgVictima({ type: '', text: '' });
      return; // ya procesado
    }
    if (name === 'nombre' || name === 'apelli') val = onlyLetters(value);
    if (name === 'cedula') {
      setFormVictima(prev => {
        const passport = isPassportId(prev.tipodo);
        return { ...prev, cedula: passport ? String(val).replace(/[^A-Za-z0-9-]/g, '').toUpperCase() : onlyDigits(val) };
      });
    } else if (name === 'tipodo') {
      setFormVictima(prev => {
        const newTip = val;
        const passport = isPassportId(newTip);
        return { ...prev, tipodo: newTip, cedula: passport ? (prev.cedula ? String(prev.cedula).toUpperCase() : prev.cedula) : onlyDigits(prev.cedula) };
      });
    } else {
      setFormVictima(prev => ({ ...prev, [name]: val }));
    }
 
    // validaciones inmediatas
    if (name === 'certif') {
      setErrorsVictima(prev => ({ ...prev, certif: validateCertif(val) }));
    } else if (name === 'cedula' || name === 'tipodo') {
      const typeId = name === 'tipodo' ? val : formVictima.tipodo;
      const cedulaValue = name === 'cedula' ? (isPassportId(typeId) ? String(val).replace(/[^A-Za-z0-9-]/g, '').toUpperCase() : onlyDigits(val)) : formVictima.cedula;
      setErrorsVictima(prev => ({ ...prev, cedula: validateIdByDocType(cedulaValue, typeId) }));
    } else if (name === 'nombre') {
      const err = !val ? 'Nombre obligatorio' : (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\'-]{2,}$/.test(val) ? 'Nombre inválido' : '');
      setErrorsVictima(prev => ({ ...prev, nombre: err }));
    } else if (name === 'apelli') {
      const err = !val ? 'Apellido obligatorio' : (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\'-]{2,}$/.test(val) ? 'Apellido inválido' : '');
      setErrorsVictima(prev => ({ ...prev, apelli: err }));
    } else {
      setErrorsVictima(prev => ({ ...prev, [name]: '' }));
    }
 
    setMsgVictima({ type: '', text: '' });
  };

  const validateVictima = () => {
    const errs = {};
    if (!formVictima.tipodo) errs.tipodo = 'Seleccione tipo de documento';
    const cedErr = validateIdByDocType(formVictima.cedula, formVictima.tipodo);
    if (cedErr) errs.cedula = cedErr;
    if (!formVictima.nombre) errs.nombre = 'Nombre obligatorio';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(formVictima.nombre)) errs.nombre = 'Nombre inválido';
    if (!formVictima.apelli) errs.apelli = 'Apellido obligatorio';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(formVictima.apelli)) errs.apelli = 'Apellido inválido';
    const certErr = validateCertif(formVictima.certif);
    if (certErr) errs.certif = certErr;
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
      tipodo: Number(formVictima.tipodo),
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
        if (data.errors && typeof data.errors === 'object') setErrorsVictima(prev => ({ ...prev, ...data.errors }));
      }
    } catch {
      setMsgVictima({ type: 'danger', text: 'Error de conexión al registrar víctima.' });
    }
  };


  // ---------- AFECTADO: handlers y validación ----------
  const [formAfectado, setFormAfectado] = useState({
    tipodo: '',
    cedula: '',
    nombre: '',
    apelli: '',
    telefono: ''
  });
  const [errorsAfectado, setErrorsAfectado] = useState({});

  const handleChangeAfectado = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === 'cedula') {
      const isPassport = isPassportId(formAfectado.coddoc);
      val = isPassport ? val.replace(/[^A-Za-z0-9-]/g, '').toUpperCase() : val.replace(/\D/g, '');
    }

    if (name === 'telefono') {
      val = val.replace(/\D/g, '');
    }

    setFormAfectado((prev) => ({ ...prev, [name]: val }));

    // Validaciones en tiempo real
    if (name === 'cedula') {
      setErrorsAfectado((prev) => ({ ...prev, cedula: validateIdByDocType(val, formAfectado.coddoc) }));
    } else if (name === 'telefono') {
      setErrorsAfectado((prev) => ({ ...prev, telefono: validatePhone(val) }));
    } else if (name === 'nombre') {
      setErrorsAfectado((prev) => ({ ...prev, nombre: val.trim() ? '' : 'Nombre obligatorio' }));
    } else if (name === 'apelli') {
      setErrorsAfectado((prev) => ({ ...prev, apelli: val.trim() ? '' : 'Apellido obligatorio' }));
    }
  };

  const validateAfectado = () => {
    const errs = {};
    if (!formAfectado.coddoc) errs.coddoc = 'Seleccione tipo de documento';
    if (!formAfectado.cedula) errs.cedula = 'Documento obligatorio';
    if (!formAfectado.nombre) errs.nombre = 'Nombre obligatorio';
    if (!formAfectado.apelli) errs.apelli = 'Apellido obligatorio';
    if (!formAfectado.telefono) errs.telefono = 'Teléfono obligatorio';
    setErrorsAfectado(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitAfectado = async (e) => {
    e.preventDefault();
    if (!validateAfectado()) return;

    const payload = {
      TTR_TIPODO: formAfectado.coddoc,
      TTR_CEDULA: formAfectado.cedula,
      TTR_NOMBRE: formAfectado.nombre,
      TTR_APELLI: formAfectado.apelli,
      TTR_TELEFO: formAfectado.telefono,
      TTR_COAFEC: formAfectado.coafec,
    };

    try {
      const res = await fetch(`${API}/personas-afectadas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMsgAfectado({ type: 'success', text: 'Afectado registrado correctamente.' });
        setFormAfectado({ coddoc: '', cedula: '', nombre: '', apelli: '', telefono: '' });
        setModalAfectado(false);
      } else {
        setMsgAfectado({ type: 'danger', text: data.message || 'Error al registrar afectado.' });
      }
    } catch (error) {
      setMsgAfectado({ type: 'danger', text: 'Error de conexión al registrar afectado.' });
    }
  };

  // VALIDACIÓN EN TIEMPO REAL PARA PÉRDIDAS
  const validatePerdidaField = (name, value, extra) => {
    // name puede ser: coafec, coddoc, cedula, nombre, apelli
    // extra para los campos de perdidas: { tipo: cotipo, field: 'vaesti'|'descri' }
    if (extra && extra.field === 'vaesti') {
      if (value === '' || value === null || isNaN(Number(value)) || Number(value) <= 0) return 'Valor estimado inválido';
      return '';
    }
    if (extra && extra.field === 'descri') {
      if (!value || String(value).trim().length < 3) return 'Descripción corta, mínimo 3 caracteres';
      return '';
    }
    if (name === 'coafec') {
      if (!value) return 'Seleccione afectación';
    }
    if (name === 'coddoc') {
      if (!value) return 'Seleccione tipo de documento';
    }
    if (name === 'cedula') {
      if (!value) return 'Documento obligatorio';
      const cedErr = validateIdByDocType(value, formPerdida.coddoc);
      if (cedErr) return cedErr;
    }
    if (name === 'nombre') {
      if (!value) return 'Nombre obligatorio';
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(value)) return 'Nombre inválido';
    }
    if (name === 'apelli') {
      if (!value) return 'Apellido obligatorio';
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(value)) return 'Apellido inválido';
    }
    return '';
  };

  const handleChangePerdida = e => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'nombre' || name === 'apelli') val = onlyLetters(value);
    if (name === 'cedula') {
      setFormPerdida(prev => {
        const passport = isPassportId(prev.coddoc);
        return { ...prev, cedula: passport ? String(val).replace(/[^A-Za-z0-9-]/g, '').toUpperCase() : onlyDigits(val) };
      });
      // validación inmediata y retorno temprano para no sobres escribir
      const err = validatePerdidaField('cedula', isPassportId(formPerdida.coddoc) ? String(val).replace(/[^A-Za-z0-9-]/g, '').toUpperCase() : onlyDigits(val));
      setErrorsPerdida(prev => ({ ...prev, cedula: err }));
      setMsgPerdida({ type: '', text: '' });
      return;
    }
    if (name === 'nombre' || name === 'apelli') val = onlyLetters(value);
    if (name === 'coddoc' || name === 'coafec') val = value;
    if (name === 'coddoc') {
      // al cambiar tipo de doc, ajustar documento existente
      setFormPerdida(prev => {
        const passport = isPassportId(val);
        return { ...prev, coddoc: val, cedula: passport ? (prev.cedula ? String(prev.cedula).toUpperCase() : prev.cedula) : onlyDigits(prev.cedula) };
      });
      const err = validatePerdidaField('coddoc', val);
      setErrorsPerdida(prev => ({ ...prev, coddoc: err }));
      setMsgPerdida({ type: '', text: '' });
      return;
    }
    setFormPerdida(prev => ({ ...prev, [name]: val }));
    // validación inmediata
    const error = validatePerdidaField(name, val);
    setErrorsPerdida(prev => ({ ...prev, [name]: error }));
    setMsgPerdida({ type: '', text: '' });
  };

  const handleCheckPerdida = (cotipo) => {
    setFormPerdida(prev => {
      const exists = prev.perdidas.find(p => p.cotipo === cotipo);
      if (exists) {
        // eliminar errores asociados
        setErrorsPerdida(prevErr => {
          const copy = { ...prevErr };
          delete copy[`perdida_vaesti_${cotipo}`];
          delete copy[`perdida_descr_${cotipo}`];
          return copy;
        });
        return { ...prev, perdidas: prev.perdidas.filter(p => p.cotipo !== cotipo) };
      } else {
        return { ...prev, perdidas: [...prev.perdidas, { cotipo, vaesti: '', descri: '' }] };
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
    // validación inmediata
    const err = validatePerdidaField(null, v, { tipo: cotipo, field: 'vaesti' });
    setErrorsPerdida(prev => ({ ...prev, [`perdida_vaesti_${cotipo}`]: err }));
    setMsgPerdida({ type: '', text: '' });
  };

  const handleDescrPerdida = (cotipo, value) => {
    // permitir texto libre, pero sanitizar excesos
    const v = String(value);
    setFormPerdida(prev => ({
      ...prev,
      perdidas: prev.perdidas.map(p =>
        p.cotipo === cotipo ? { ...p, descri: v } : p
      )
    }));
    const err = validatePerdidaField(null, v, { tipo: cotipo, field: 'descri' });
    setErrorsPerdida(prev => ({ ...prev, [`perdida_descr_${cotipo}`]: err }));
    setMsgPerdida({ type: '', text: '' });
  };

  const validatePerdida = () => {
    const errs = {};
    if (!formPerdida.coafec) errs.coafec = 'Seleccione afectación';
    if (!formPerdida.coddoc) errs.coddoc = 'Seleccione tipo de documento';
    const cedErr = validateIdByDocType(formPerdida.cedula, formPerdida.coddoc);
    if (cedErr) errs.cedula = cedErr;
    if (!formPerdida.nombre) errs.nombre = 'Nombre obligatorio';
    if (!formPerdida.apelli) errs.apelli = 'Apellido obligatorio';
    if (!formPerdida.perdidas || formPerdida.perdidas.length === 0) errs.perdidas = 'Seleccione al menos una pérdida';
    else {
      formPerdida.perdidas.forEach((p) => {
        if (!p.vaesti || isNaN(p.vaesti) || Number(p.vaesti) <= 0) {
          errs[`perdida_vaesti_${p.cotipo}`] = 'Valor estimado inválido';
        }
        if (!p.descri || String(p.descri).trim().length < 3) {
          errs[`perdida_descr_${p.cotipo}`] = 'Descripción corta, mínimo 3 caracteres';
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
          // enviar descri por cada pérdida
          perdidas: formPerdida.perdidas.map(p => ({ cotipo: Number(p.cotipo), vaesti: Number(p.vaesti), descri: p.descri || '' }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsgPerdida({ type: 'success', text: 'Pérdidas registradas correctamente.' });
        setFormPerdida({ coafec: '', coddoc: '', cedula: '', nombre: '', apelli: '', perdidas: [] });
        setErrorsPerdida({});
        setModalPerdida(false);
      } else {
        // mostrar errores devueltos por el backend si existen
        if (data.errors && typeof data.errors === 'object') {
          setErrorsPerdida(prev => ({ ...prev, ...data.errors }));
        }
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
      <CRow className="g-4 justify-content-center align-items-start">
        <CCol xs={12} md={10} lg={8} className="mx-auto">
          <CCard className="shadow-sm flex-fill d-flex flex-column" style={{ minHeight: 320 }}>
            <CCardHeader className="text-center py-2" style={{ background: '#f5f5f5' }}>
              <strong>Registrar Afectación</strong>
            </CCardHeader>

            {/* Mensajes globales de éxito/error para cada sección (se autoclican tras 4s) */}
            {(msgAfectacion.text || msgDamnificado.text || msgVictima.text || msgPerdida.text) && (
              <div className="p-3">
                {msgAfectacion.text && <CAlert color={msgAfectacion.type || 'success'} className="mb-2 text-center">{msgAfectacion.text}</CAlert>}
                {msgDamnificado.text && <CAlert color={msgDamnificado.type || 'success'} className="mb-2 text-center">{msgDamnificado.text}</CAlert>}
                {msgVictima.text && <CAlert color={msgVictima.type || 'success'} className="mb-2 text-center">{msgVictima.text}</CAlert>}
                {msgPerdida.text && <CAlert color={msgPerdida.type || 'success'} className="mb-2 text-center">{msgPerdida.text}</CAlert>}
              </div>
            )}

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
                  ref={comunidadInputRef}
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
                  label="Afectacion natural"
                  name="codesa"
                  value={formAfectacion.codesa}
                  onChange={handleChange(setFormAfectacion, formAfectacion)}
                  required
                  className="mb-3"
                >
                  <option value="">Seleccione afectacion</option>
                  {desastres.map(d => (
                    <option key={d.TMA_CODESA} value={d.TMA_CODESA}>{d.TMA_NOMBRE}</option>
                  ))}
                </CFormSelect>
               
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
                <CButton variant="outline" style={{ minWidth: 180, marginLeft: '10px', backgroundColor: 'white', color: 'blue', borderColor: 'blue' }} onClick={() => setModalAfectado(true)}>
                  Registrar Afectado
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal Damnificado */}
      <CModal visible={modalDamnificado} onClose={() => {
        setModalDamnificado(false);
        setErrorsDamnificado({});
        // no borrar msgDamnificado aquí para que el mensaje de éxito sea visible en la parte superior
        setFormDamnificado({ cedula: '', tipodo: '', nombre: '', apelli: '', fenaci: '', contac: '', esalud: '', coafec: '' });
      }} size="lg" backdrop="static" keyboard={false}>
        <CModalHeader closeButton><strong>Registrar Damnificado</strong></CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={6} className="border-end">
              <div className="mb-3 text-secondary">
                <strong>¿Quién es un damnificado?</strong>
                <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                  <li>Persona afectada directamente por el suceso y que lo ha perdido prácticamente todo a causa de la afectación.</li>
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
                  label="Documento"
                  name="cedula"
                  placeholder='Ejm 1234567 o A123456'
                  value={formDamnificado.cedula}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  maxLength={9}
                  minLength={7}
                  ref={damnCeduRef}
                  onKeyDown={e => handleEnter(e, damnNombreRef)}
                  inputMode="text"
                />
                {errorsDamnificado.cedula && <div className="text-danger small mb-2">{errorsDamnificado.cedula}</div>}

                <CFormInput
                  label="Nombres"
                  name="nombre"
                  placeholder=''
                  value={formDamnificado.nombre}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  maxLength={25}
                  
                  ref={damnNombreRef}
                  onKeyDown={e => handleEnter(e, damnApelliRef)}
                />
                {errorsDamnificado.nombre && <div className="text-danger small mb-2">{errorsDamnificado.nombre}</div>}

                <CFormInput
                  label="Apellidos"
                  name="apelli"
                  placeholder=''
                  value={formDamnificado.apelli}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  maxLength={20}
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
                  placeholder='Ejm 04141234567'
                  value={formDamnificado.contac}
                  onChange={handleDamnChange}
                  className="mb-2"
                  required
                  maxLength={11}
                  minLength={11}
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
                  maxLength={10}
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
      <CModal visible={modalVictima} onClose={() => {
        setModalVictima(false);
        setErrorsVictima({});
        // mantener msgVictima para mostrar notificación global al cerrar
        setFormVictima({ cedula: '', tipodo: '', nombre: '', apelli: '', certif: '', coafec: '' });
      }} size="lg" backdrop="static" keyboard={false}>
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
                  label="Documento"
                  name="cedula"
                  placeholder='Ejm 1234567 o A123456 '
                  value={formVictima.cedula}
                  onChange={handleVictChange}
                  className="mb-2"
                  required
                  maxLength={9}
                  minLength={7}
                  ref={victCeduRef}
                  onKeyDown={e => handleEnter(e, victNombreRef)}
                  inputMode="text"
                />
                {errorsVictima.cedula && <div className="text-danger small mb-2">{errorsVictima.cedula}</div>}

                <CFormInput
                  label="Nombres"
                  name="nombre"
                  placeholder=''
                  value={formVictima.nombre}
                  onChange={handleVictChange}
                  className="mb-2"
                  required
                  maxLength={25}
                  ref={victNombreRef}
                  onKeyDown={e => handleEnter(e, victApelliRef)}
                />
                {errorsVictima.nombre && <div className="text-danger small mb-2">{errorsVictima.nombre}</div>}

                <CFormInput
                  label="Apellidos"
                  name="apelli"
                  placeholder=''
                  value={formVictima.apelli}
                  onChange={handleVictChange}
                  className="mb-2"
                  maxLength={20}
                  required
                  ref={victApelliRef}
                  onKeyDown={e => handleEnter(e, victCertifRef)}
                />
                {errorsVictima.apelli && <div className="text-danger small mb-2">{errorsVictima.apelli}</div>}

                <CFormInput
                  label="Certificado de defunción"
                  name="certif"
                  placeholder='Ejm 1234567 o ABC-123'
                  value={formVictima.certif}
                  onChange={handleVictChange}
                  className="mb-2"
                  maxLength={9}
                  minLength={9}
                  ref={victCertifRef}
                  onKeyDown={e => handleEnter(e, victCoafecRef)}
                  inputMode="text"
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

      {/* Modal Afectado */}
      <CModal visible={modalAfectado} onClose={() => {
        setModalAfectado(false);
        setErrorsAfectado({});
        setFormAfectado({ coddoc: '', cedula: '', nombre: '', apelli: '', telefono: '' });
      }} size="lg" backdrop="static" keyboard={false}>
        <CModalHeader closeButton><strong>Registrar Afectado</strong></CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={5} className="border-end">
              <div className="mb-3 text-secondary">
                <strong>¿Cómo registrar un afectado?</strong>
                <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                  <li>Seleccione el tipo de documento y complete el número correspondiente.</li>
                  <li>Ingrese los datos personales del afectado, como nombres, apellidos, teléfono y dirección.</li>
                  <li>Verifique que todos los campos estén completos antes de registrar.</li>
                  <li>Afectado nos referimos a esa persona que se ha visto involucrada directamente o indirectamente en la afectación perdiendo algun tipo de bien de sus pertenencias.</li>
                </ul>
              </div>
            </CCol>
            <CCol md={7}>
              <CForm onSubmit={handleSubmitAfectado}>
                <CFormSelect
                  label="Tipo de documento"
                  name="coddoc"
                  value={formAfectado.coddoc}
                  onChange={handleChangeAfectado}
                  className="mb-2"
                  required
                >
                  <option value="">Seleccione tipo de documento</option>
                  {tiposDoc.map(t => (<option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>))}
                </CFormSelect>
                {errorsAfectado.coddoc && <div className="text-danger small mb-2">{errorsAfectado.coddoc}</div>}

                <CFormInput
                  label="Documento"
                  name="cedula"
                  placeholder='Ejm 1234567 o BF-905'
                  value={formAfectado.cedula}
                  onChange={handleChangeAfectado}
                  className="mb-2"
                  required
                  maxLength={10}
                  minLength={7}
                />
                {errorsAfectado.cedula && <div className="text-danger small mb-2">{errorsAfectado.cedula}</div>}

                <CFormInput
                  label="Nombres"
                  name="nombre"
                  placeholder=''
                  value={formAfectado.nombre}
                  onChange={handleChangeAfectado}
                  className="mb-2"
                  required
                  maxLength={20}
                  minLength={4}
                />
                {errorsAfectado.nombre && <div className="text-danger small mb-2">{errorsAfectado.nombre}</div>}

                <CFormInput
                  label="Apellidos"
                  name="apelli"
                  placeholder=''
                  value={formAfectado.apelli}
                  onChange={handleChangeAfectado}
                  className="mb-2"
                  required
                  maxLength={20}
                  minLength={3}
                />
                {errorsAfectado.apelli && <div className="text-danger small mb-2">{errorsAfectado.apelli}</div>}

                <CFormInput
                  label="Teléfono"
                  name="telefono"
                  placeholder='Ejm 04141234567'
                  value={formAfectado.telefono}
                  onChange={handleChangeAfectado}
                  className="mb-2"
                  required
                  maxLength={11}
                  minLength={11}
                />
                {errorsAfectado.telefono && <div className="text-danger small mb-2">{errorsAfectado.telefono}</div>}

                <CFormSelect
                  label="Afectación más reciente"
                  name="coafec"
                  value={formAfectado.coafec}
                  onChange={handleChangeAfectado}
                  className="mb-2"
                  required
                >
                  <option value="">Seleccione afectación</option>
                  {ultimaAfectacion && (
                    <option value={ultimaAfectacion.TTR_COAFEC}>
                      {(comunidadUltima?.TMA_NOMBRE || ultimaAfectacion.TTR_CODCOM) + ' - ' +
                        (ultimaAfectacion.TTR_FEAFEC ? new Date(ultimaAfectacion.TTR_FEAFEC).toLocaleDateString('es-VE') : '')}
                    </option>
                  )}
                </CFormSelect>
                {errorsAfectado.coafec && <div className="text-danger small mb-2">{errorsAfectado.coafec}</div>}

                {msgAfectado.text && <CAlert color={msgAfectado.type} className="mt-2 mb-1 py-2 text-center">{msgAfectado.text}</CAlert>}
                <CModalFooter>
                  <CButton style={{ backgroundColor: 'blue', color: 'white' }} type="submit">Registrar afectado</CButton>
                </CModalFooter>
              </CForm>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>

      {/* Modal Pérdida */}
      <CModal visible={modalPerdida} onClose={() => {
        setModalPerdida(false);
        setErrorsPerdida({});
        setFormPerdida({ coafec: '', coddoc: '', cedula: '', nombre: '', apelli: '', perdidas: [] });
      }} size="lg" backdrop="static" keyboard={false}>
        <CModalHeader closeButton><strong>Registrar Pérdidas</strong></CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={5} className="border-end">
              <div className="mb-3 text-secondary">
                <strong>¿Cómo registrar una pérdida?</strong>
                <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                  <li>Selecciona la afectación a la que corresponde la pérdida.</li>
                  <li>Completa los datos personales de la persona afectada.</li>
                  <li>Marca uno o varios tipos de pérdida y coloca el valor estimado de cada una. Añade además una breve descripción.</li>
                </ul>
              </div>
            </CCol>
            <CCol md={7}>
              <CForm onSubmit={handleSubmitPerdida}>
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
                  label="Documento"
                  name="cedula"
                  placeholder='Ejm 1234567 o A123456'
                  value={formPerdida.cedula}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                  maxLength={9}
                  minLength={7}
                  ref={perCeduRef}
                  onKeyDown={e => handleEnter(e, perNombreRef)}
                  inputMode="text"
                />
                {errorsPerdida.cedula && <div className="text-danger small mb-2">{errorsPerdida.cedula}</div>}

                <CFormInput
                  label="Nombres"
                  name="nombre"
                  placeholder=''
                  value={formPerdida.nombre}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                  maxLength={25}
                  ref={perNombreRef}
                  onKeyDown={e => handleEnter(e, perApelliRef)}
                />
                {errorsPerdida.nombre && <div className="text-danger small mb-2">{errorsPerdida.nombre}</div>}

                <CFormInput
                  label="Apellidos"
                  name="apelli"
                  placeholder=''
                  value={formPerdida.apelli}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                  maxLength={25}
                  ref={perApelliRef}
                />
                {errorsPerdida.apelli && <div className="text-danger small mb-2">{errorsPerdida.apelli}</div>}

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

                <div className="mb-2">
                  <label><strong>Tipos de pérdida</strong></label>
                  {tiposPerdida.map(tipo => (
                    <div key={tipo.TTR_COTIPO} className="d-flex align-items-start mb-2">
                      <div style={{ flex: 1 }}>
                        <CFormCheck
                          type="checkbox"
                          id={`tipo-${tipo.TTR_COTIPO}`}
                          checked={!!formPerdida.perdidas.find(p => p.cotipo === tipo.TTR_COTIPO)}
                          onChange={() => handleCheckPerdida(tipo.TTR_COTIPO)}
                          label={tipo.TTR_NOMBRE}
                        />
                        {formPerdida.perdidas.find(p => p.cotipo === tipo.TTR_COTIPO) && (
                          <div className="d-flex flex-column mt-2">
                            <div className="d-flex align-items-center">
                              <CFormInput
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="Valor estimado"
                                value={formPerdida.perdidas.find(p => p.cotipo === tipo.TTR_COTIPO)?.vaesti || ''}
                                onChange={e => handleValorPerdida(tipo.TTR_COTIPO, e.target.value)}
                                style={{ width: 160, marginRight: 12 }}
                                required
                              />
                              <CFormInput
                                type="text"
                                placeholder="Breve descripción"
                                value={formPerdida.perdidas.find(p => p.cotipo === tipo.TTR_COTIPO)?.descri || ''}
                                onChange={e => handleDescrPerdida(tipo.TTR_COTIPO, e.target.value)}
                                maxLength={50}
                                style={{ flex: 1 }}
                                required
                              />
                            </div>
                            <div className="d-flex">
                              {errorsPerdida[`perdida_vaesti_${tipo.TTR_COTIPO}`] && <div className="text-danger small me-3">{errorsPerdida[`perdida_vaesti_${tipo.TTR_COTIPO}`]}</div>}
                              {errorsPerdida[`perdida_descr_${tipo.TTR_COTIPO}`] && <div className="text-danger small">{errorsPerdida[`perdida_descr_${tipo.TTR_COTIPO}`]}</div>}
                            </div>
                          </div>
                        )}
                      </div>
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