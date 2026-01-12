import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CRow, CCol, CFormInput, CFormSelect, CButton, CCard, CCardBody, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CProgress
} from '@coreui/react';
import bg from 'src/assets/images/carro.jpg';


/*const API = 'http://localhost:4000';*/
const API = 'https://sistema-de-gestion-backend.onrender.com';

const HelpButton = ({ videoUrl }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      <CButton style={{backgroundColor:'blue', color:'white'}} onClick={() => setShowHelp(true)}>
        Ayuda
      </CButton>

      {showHelp && !isMinimized && (
        <CModal visible={showHelp} onClose={() => setShowHelp(false)}>
          <CModalHeader>
            <CModalTitle>Ayuda</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <video controls width="100%" style={{ borderRadius: '8px' }}>
              <source src={videoUrl} type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowHelp(false)}>
              Cerrar
            </CButton>
            <CButton color="warning" onClick={() => setIsMinimized(true)}>
              Minimizar
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {isMinimized && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '300px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          overflow: 'hidden',
          zIndex: 1050
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f7f7f7', borderBottom: '1px solid #ddd' }}>
            <span style={{ fontWeight: 'bold' }}>Ayuda</span>
            <div>
              <CButton size="sm" color="info" onClick={() => setShowHelp(true)} style={{ marginRight: '8px' }}>
                Maximizar
              </CButton>
              <CButton size="sm" color="danger" onClick={() => { setShowHelp(false); setIsMinimized(false); }}>
                Cerrar
              </CButton>
            </div>
          </div>
          <video controls width="100%" style={{ borderRadius: '0 0 8px 8px' }}>
            <source src={videoUrl} type="video/mp4" />
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>
      )}
    </>
  );
};

const Formulario = () => {
  const [step, setStep] = useState(1);
  const [cedula, setCedula] = useState('');
  const [nombres, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sexo, setSexo] = useState('');
  const [fecha_nac, setFechaNacimiento] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [tipodo, setTipodo] = useState('');
  const [codpais, setCodpais] = useState('');
  const [coesta, setCoesta] = useState('');
  const [comuni, setComuni] = useState('');
  const [coparr, setCoparr] = useState('');
  const [codcom, setCodcom] = useState('');
  const [tipoDocumentos, setTipoDocumentos] = useState([]);
  const [paises, setPaises] = useState([]);
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [modal, setModal] = useState({ show: false, mensaje: '', success: false });
  const [fieldErrors, setFieldErrors] = useState([]);
  const [cedulaError, setCedulaError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [loading, setLoading] = useState(false);

  const [existsMsg, setExistsMsg] = useState('');
  const [existsState, setExistsState] = useState(null);
  const existTimer = useRef(null);
  const existController = useRef(null);

  const [errors, setErrors] = useState({}); // errores por campo

  const navigate = useNavigate();

  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'\-]+$/;
  const digitsRegex = /^\d+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validPhonePrefixes = ['0424','0426','0414','0416','0412','0422'];

  useEffect(() => {
    const fetchSafe = async (url, setter) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Fetch error', url, res.status);
          setter([]); // asegurar array
          return;
        }
        const data = await res.json();
        setter(Array.isArray(data) ? data : []); // garantizar array
      } catch (err) {
        console.error('Fetch failed', url, err);
        setter([]);
      }
    };
    fetchSafe(`${API}/documento`, setTipoDocumentos);
    fetchSafe(`${API}/paises`, setPaises);
  }, []);

  useEffect(() => {
    if (codpais) fetch(`${API}/estados/${codpais}`).then(r=>r.json()).then(setEstados).catch(()=>{});
    else setEstados([]);
    setMunicipios([]); setComuni(''); setParroquias([]); setCoparr(''); setComunidades([]); setCodcom('');
  }, [codpais]);

  useEffect(() => {
    if (coesta) fetch(`${API}/municipios/${coesta}`).then(r=>r.json()).then(setMunicipios).catch(()=>{});
    else setMunicipios([]);
    setParroquias([]); setCoparr(''); setComunidades([]); setCodcom('');
  }, [coesta]);

  useEffect(() => {
    if (comuni) fetch(`${API}/parroquias/${comuni}`).then(r=>r.json()).then(setParroquias).catch(()=>{});
    else setParroquias([]);
    setComunidades([]); setCodcom('');
  }, [comuni]);

  useEffect(() => {
    if (coparr) fetch(`${API}/comunidades/${coparr}`).then(r=>r.json()).then(setComunidades).catch(()=>{});
    else setComunidades([]);
    setCodcom('');
  }, [coparr]);

  const today = new Date();
  const maxBirth = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxFechaNacimiento = maxBirth.toISOString().split('T')[0];

  // Helper para detectar pasaporte: tipodo puede ser 'P' o código '3'
  const isPassportType = (t) => {
    const v = String(t || '').trim().toUpperCase();
    return v === 'P' || v === '3' || v === '03';
  };

  // Validación en vivo por campo
  const validateField = (name, value) => {
    const v = typeof value === 'string' ? value.trim() : value;
    setErrors(prev => {
      const next = { ...prev };
      switch (name) {
        case 'tipodo':
          next.tipodo = v ? null : 'Seleccione tipo de documento';
          break;
        case 'cedula':
          if (!v) next.cedula = 'Documento obligatorio';
          else if (isPassportType(tipodo)) {
            if (!/^[A-Za-z0-9-]{8,10}$/.test(v)) next.cedula = 'Pasaporte inválido (7-10 caracteres; letras, números y guiones)';
            else if (v.startsWith('-') || v.endsWith('-')) next.cedula = 'Guion no puede estar al inicio o final';
            else if (/--/.test(v)) next.cedula = 'Guiones consecutivos no permitidos';
            else if (!/[A-Za-z]/.test(v)) next.cedula = 'Debe incluir al menos una letra';
            else if (!/\d/.test(v)) next.cedula = 'Debe incluir al menos un número';
            else next.cedula = null;
          } else {
            next.cedula = /^\d{7,9}$/.test(v) ? null : 'Documento inválido (7-9 dígitos)';
          }
          break;
        case 'nombres':
          next.nombres = v ? (nameRegex.test(v) ? null : 'Nombres no permiten números ni símbolos') : 'Nombres obligatorios';
          break;
        case 'apellidos':
          next.apellidos = v ? (nameRegex.test(v) ? null : 'Apellidos no permiten números ni símbolos') : 'Apellidos obligatorios';
          break;
        case 'sexo':
          next.sexo = v ? null : 'Seleccione sexo';
          break;
        case 'fecha_nac':
          if (!v) next.fecha_nac = 'Fecha de nacimiento obligatoria';
          else {
            const f = new Date(v);
            if (isNaN(f.getTime())) next.fecha_nac = 'Fecha inválida';
            else {
              const fechaMax = new Date(maxBirth); fechaMax.setHours(0,0,0,0); f.setHours(0,0,0,0);
              next.fecha_nac = f > fechaMax ? 'Debes ser mayor de 18 años' : null;
            }
          }
          break;
        case 'codpais':
          next.codpais = v ? null : 'Seleccione país';
          break;
        case 'coesta':
          next.coesta = v ? null : 'Seleccione estado';
          break;
        case 'comuni':
          next.comuni = v ? null : 'Seleccione municipio';
          break;
        case 'coparr':
          next.coparr = v ? null : 'Seleccione parroquia';
          break;
        case 'codcom':
          next.codcom = v ? null : 'Seleccione comunidad';
          break;
        case 'direccion':
          next.direccion = v ? null : 'Dirección obligatoria';
          break;
        case 'telefono':
          next.telefono = v ? (/^\d{11}$/.test(v) ? (validPhonePrefixes.includes(v.slice(0,4)) ? null : 'Prefijo inválido 0414-0424-0416-0422-0426-0412') : 'Teléfono debe tener 11 dígitos') : null;
          break;
        case 'email':
          next.email = v ? (emailRegex.test(v) ? null : 'Correo inválido') : 'Correo obligatorio';
          break;
        case 'usuario':
          next.usuario = v ? null : 'Usuario obligatorio';
          break;
        case 'contraseña':
          next.contraseña = v ? (v.length >= 6 ? null : 'Contraseña mínimo 6 caracteres') : 'Contraseña obligatoria';
          break;
        case 'repeatPassword':
          next.repeatPassword = v ? (v === contraseña ? null : 'Contraseñas no coinciden') : 'Confirme la contraseña';
          break;
        default:
          break;
      }
      return next;
    });
  };

  // Verifica existencia automáticamente con debounce (ahora SIN distinguir por tipo)
  useEffect(() => {
    setExistsMsg(''); setExistsState(null);
    if (!cedula) return; // si no hay documento, salir
    const passport = isPassportType(tipodo);
    if (passport) {
      if (cedula.length < 1) return;
    } else {
      if (!/^\d{3,}$/.test(cedula)) return;
    }

    if (existTimer.current) clearTimeout(existTimer.current);
    if (existController.current) {
      try { existController.current.abort(); } catch {}
      existController.current = null;
    }

    existTimer.current = setTimeout(async () => {
      existController.current = new AbortController();
      try {
        // <-- ELIMINADO: envío del tipo. Ahora se consulta sólo por documento.
        const q = `${API}/existe?documento=${encodeURIComponent(cedula)}`;
        const res = await fetch(q, { signal: existController.current.signal, headers: { Accept: 'application/json' } });
        const data = await res.json().catch(()=>({}));
        if (res.ok) {
          setExistsState(Boolean(data.exists));
          setExistsMsg(data.exists ? 'Documento ya registrado' : 'Documento disponible');
          setCedulaError('');
          // marcar error inline si existe, sin importar tipo
          setErrors(prev => ({ ...prev, cedula: data.exists ? 'Documento ya registrado' : prev.cedula }));
        } else {
          setExistsState(null);
          setExistsMsg(data.mensaje || 'No se pudo verificar');
        }
      } catch (e) {
        if (e.name === 'AbortError') return;
        setExistsState(null);
        setExistsMsg('Error verificando existencia');
      } finally {
        existController.current = null;
      }
    }, 600);

    return () => {
      if (existTimer.current) clearTimeout(existTimer.current);
      if (existController.current) {
        try { existController.current.abort(); } catch {}
        existController.current = null;
      }
    };
  }, [cedula]); // ahora solo depende de cedula

  // Manejo cedula: permite letras si pasaporte (8-10), alfanum y guiones, no sólo letras
  const handleCedulaChange = e => {
    const val = e.target.value;
    const passport = isPassportType(tipodo);
    if (passport) {
      const cleaned = val.replace(/[^A-Za-z0-9-]/g, '').slice(0, 10).toUpperCase();
      setCedula(cleaned);
      validateField('cedula', cleaned);
    } else {
      const cleaned = val.replace(/\D/g, '').slice(0, 9);
      setCedula(cleaned);
      validateField('cedula', cleaned);
    }
  };

  const handleTipodoChange = e => {
    const v = e.target.value;
    setTipodo(v);
    // al cambiar tipo, revalidar cédula y tipodo
    validateField('tipodo', v);
    validateField('cedula', cedula);
  };

  const handleNombresChange = e => {
    const v = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, '');
    setNombre(v);
    validateField('nombres', v);
  };
  const handleApellidosChange = e => {
    const v = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, '');
    setApellidos(v);
    validateField('apellidos', v);
  };

  const handleSexoChange = e => { setSexo(e.target.value); validateField('sexo', e.target.value); };
  const handleFechaChange = e => { setFechaNacimiento(e.target.value); validateField('fecha_nac', e.target.value); };

  const handleCodpais = e => { setCodpais(e.target.value); validateField('codpais', e.target.value); };
  const handleCoesta = e => { setCoEsta(e.target.value); validateField('coesta', e.target.value); };
  const handleComuni = e => { setComuni(e.target.value); validateField('comuni', e.target.value); };
  const handleCoparr = e => { setCoparr(e.target.value); validateField('coparr', e.target.value); };
  const handleCodcom = e => { setCodcom(e.target.value); validateField('codcom', e.target.value); };

  const handleDireccionChange = e => { setDireccion(e.target.value); validateField('direccion', e.target.value); };

  const handleTelefonoChange = e => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
    setTelefono(cleaned);
    validateField('telefono', cleaned);
    setTelefonoError(cleaned && (cleaned.length < 11) ? 'Teléfono debe tener 11 dígitos' : '');
  };

  const handleEmailChange = e => { setEmail(e.target.value); validateField('email', e.target.value); };

  const handleUsuarioChange = e => { setUsuario(e.target.value); validateField('usuario', e.target.value); };
  const handlePasswordChange = e => { setPassword(e.target.value); validateField('contraseña', e.target.value); validateField('repeatPassword', repeatPassword); };
  const handleRepeatPasswordChange = e => { setRepeatPassword(e.target.value); validateField('repeatPassword', e.target.value); };

  const validateStep = (s) => {
    const errs = [];
    if (s === 1) {
      if (!tipodo) errs.push('Seleccione tipo de documento');
      if (!cedula) errs.push('Documento obligatorio');
      else if (isPassportType(tipodo)) {
        if (!/^[A-Za-z0-9-]{7,10}$/.test(cedula)) errs.push('Pasaporte inválido (7-10 caracteres; letras, números y guiones)');
        else if (cedula.startsWith('-') || cedula.endsWith('-')) errs.push('Pasaporte no puede empezar o terminar con guion');
        else if (/--/.test(cedula)) errs.push('Pasaporte no puede tener guiones consecutivos');
        else if (!/[A-Za-z]/.test(cedula)) errs.push('Pasaporte debe incluir al menos una letra');
        else if (!/\d/.test(cedula)) errs.push('Pasaporte debe incluir al menos un número');
      } else if (!/^\d{7,9}$/.test(cedula)) errs.push('Documento inválido (7-9 dígitos)');
      if (!nombres) errs.push('Nombres obligatorios');
      if (!apellidos) errs.push('Apellidos obligatorios');
      if (!sexo) errs.push('Seleccione sexo');
      if (!fecha_nac) errs.push('Fecha de nacimiento obligatoria');
      else {
        const f = new Date(fecha_nac);
        if (isNaN(f.getTime())) errs.push('Fecha inválida');
        else {
          const fechaMax = new Date(maxBirth); fechaMax.setHours(0,0,0,0); f.setHours(0,0,0,0);
          if (f > fechaMax) errs.push('Debes ser mayor de 18 años');
        }
      }
      if (existsState === true) errs.push('Documento ya registrado');
    }
    if (s === 2) {
      if (!codpais) errs.push('Seleccione país');
      if (!coesta) errs.push('Seleccione estado');
      if (!comuni) errs.push('Seleccione municipio');
      if (!coparr) errs.push('Seleccione parroquia');
      if (!codcom) errs.push('Seleccione comunidad');
      if (!direccion) errs.push('Dirección obligatoria');
      if (telefono && !/^\d{11}$/.test(telefono)) errs.push('Teléfono inválido');
      if (!email) errs.push('Correo obligatorio');
      else if (!emailRegex.test(email)) errs.push('Correo inválido');
    }
    if (s === 3) {
      if (!usuario) errs.push('Usuario obligatorio');
      if (!contraseña) errs.push('Contraseña obligatoria');
      else if (contraseña.length < 6) errs.push('Contraseña mínimo 6 caracteres');
      if (contraseña !== repeatPassword) errs.push('Contraseñas no coinciden');
    }
    return errs;
  };

  const next = () => {
    const errs = validateStep(step);
    if (errs.length) {
      setFieldErrors(errs);
      setModal({ show: true, mensaje: errs.join('\n'), success: false });
      return;
    }
    setFieldErrors([]);
    setStep(s => Math.min(3, s + 1));
  };
  const back = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs1 = validateStep(1), errs2 = validateStep(2), errs3 = validateStep(3);
    const all = [...errs1, ...errs2, ...errs3];
    if (all.length) {
      setFieldErrors(all);
      setModal({ show: true, mensaje: all.join('\n'), success: false });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula, nombres, apellidos, direccion, telefono, sexo, fecha_nac,
          usuario, email, contraseña, tipodo, codcom
        })
      });
      const data = await res.json().catch(()=>({}));
      if (res.ok) {
        setModal({ show: true, mensaje: 'Usuario registrado correctamente', success: true });
      } else {
        const detalles = data.detalles || data.errores || [data.message || 'Error'];
        setFieldErrors(detalles);
        setModal({ show: true, mensaje: detalles.join('\n'), success: false });
      }
    } catch (err) {
      setModal({ show: true, mensaje: 'Error de conexión al servidor', success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    const wasSuccess = modal.success;
    setModal({ show: false, mensaje: '', success: false });
    if (wasSuccess) navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      padding: 24
    }}>
      <CCard className="shadow" style={{ width: '900px', maxWidth: '95%', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'linear-gradient(90deg,#ff8a65,#ff7043)', color: '#fff' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 700, letterSpacing: '0.2px' }}>Registro de Usuario</h3>
            <div style={{ fontSize: 13, opacity: 0.95 }}>Rellena los datos en los tres pasos</div>
          </div>
        </div>

        <CCardBody style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {[1,2,3].map(n => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap:8 }}>
                  <div style={{
                    width:30, height:30, borderRadius: 8,
                    background: step === n ? '#FF7043' : '#FFE8DE',
                    color: step === n ? '#fff' : '#ff7043',
                    display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700
                  }}>{n}</div>
                  <div style={{ fontSize:12, color: step === n ? '#333' : '#777' }}>{n === 1 ? 'Datos de Persona' : n===2 ? 'Datos de Residencia' : 'Datos de Cuenta'}</div>
                </div>
              ))}
            </div>

            <div style={{ width: 260 }}>
              <CProgress value={step === 1 ? 33 : step === 2 ? 66 : 100} height="8px" color="warning" />
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ maxWidth: 820, margin: '0 auto' }}>
            {step === 1 && (
              <div style={{ display:'flex', justifyContent:'center' }}>
                <div style={{ width: 760 }}>
                  <CRow className="g-3">
                    <CCol md={6} style={{ margin: '0 auto' }}>
                      <label style={{ display:'block', fontSize:13, color:'#555', marginBottom:6 }}>1.1 Tipo de Documento</label>
                      <CFormSelect value={tipodo} onChange={handleTipodoChange} className="mb-1" style={{ borderRadius:10, padding:'10px 12px' }}>
                        <option value="">Seleccione tipo de documento</option>
                        {tipoDocumentos.map(t => <option key={t.TMA_CODDOC} value={String(t.TMA_CODDOC)}>{t.TMA_NOMBRE}</option>)}
                      </CFormSelect>
                      {errors.tipodo && <div className="text-danger small mb-2">{errors.tipodo}</div>}

                      <label style={{ display:'block', fontSize:13, color:'#555', marginBottom:6 }}>1.2 Documento de identidad</label>
                      <CFormInput type="text" value={cedula} onChange={handleCedulaChange} className="mb-1" placeholder='31800900 - BF950025'  style={{ borderRadius:10, padding:'10px 12px' }} maxLength={isPassportType(tipodo) ? 10 : 9} />
                      <div style={{ minHeight: '22px', marginBottom: 8 }}>
                        {errors.cedula ? <div className="text-danger small">{errors.cedula}</div>
                          : existsState === true ? <div className="text-danger small">{existsMsg}</div>
                          : existsState === false ? <div className="text-success small">{existsMsg}</div>
                          : <div style={{ visibility: 'hidden' }} className="small">placeholder</div>}
                      </div>

                      <label style={{ display:'block', fontSize:13, color:'#555', marginBottom:6 }}>1.3 Nombres</label>
                      <CFormInput type="text" value={nombres} onChange={handleNombresChange} className="mb-1" placeholder='' style={{ borderRadius:10, padding:'10px 12px' }} />
                      {errors.nombres && <div className="text-danger small mb-2">{errors.nombres}</div>}

                      <label style={{ display:'block', fontSize:13, color:'#555', marginBottom:6 }}>1.4 Apellidos</label>
                      <CFormInput type="text" value={apellidos} onChange={handleApellidosChange} className="mb-1" placeholder='' style={{ borderRadius:10, padding:'10px 12px' }} />
                      {errors.apellidos && <div className="text-danger small mb-2">{errors.apellidos}</div>}

                      <label style={{ display:'block', fontSize:13, color:'#555', marginBottom:6 }}>1.5 Sexo</label>
                      <CFormSelect value={sexo} onChange={handleSexoChange} className="mb-1" style={{ borderRadius:10, padding:'10px 12px' }}>
                        <option value="">Seleccione sexo</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </CFormSelect>
                      {errors.sexo && <div className="text-danger small mb-2">{errors.sexo}</div>}

                      <label style={{ display:'block', fontSize:13, color:'#555', marginBottom:6 }}>1.6 Fecha de Nacimiento</label>
                      <CFormInput type="date" value={fecha_nac} onChange={handleFechaChange} max={maxFechaNacimiento} className="mb-1" style={{ borderRadius:10, padding:'10px 12px' }} />
                      {errors.fecha_nac && <div className="text-danger small mb-2">{errors.fecha_nac}</div>}
                    </CCol>
                  </CRow>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display:'flex', justifyContent:'center' }}>
                <div style={{ width: 760 }}>
                  <CRow className="g-3">
                    <CCol md={6} style={{ margin: '0 auto' }}>
                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>2.1 País</label>
                      <CFormSelect value={codpais} onChange={handleCodpais} className="mb-1" style={{ borderRadius:10, padding:'10px 12px' }}>
                        <option value="">Seleccione país</option>
                        {paises.map(p=> <option key={p.TMA_COPAIS} value={p.TMA_COPAIS}>{p.TMA_NOMBRE}</option>)}
                      </CFormSelect>
                      {errors.codpais && <div className="text-danger small mb-2">{errors.codpais}</div>}

                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>2.2 Estado</label>
                      <CFormSelect value={coesta} onChange={handleCoesta} className="mb-1" disabled={!codpais} style={{ borderRadius:10, padding:'10px 12px' }}>
                        <option value="">Seleccione estado</option>
                        {estados.map(e=> <option key={e.TMA_COESTA} value={e.TMA_COESTA}>{e.TMA_NOMBRE}</option>)}
                      </CFormSelect>
                      {errors.coesta && <div className="text-danger small mb-2">{errors.coesta}</div>}

                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>2.3 Municipio</label>
                      <CFormSelect value={comuni} onChange={handleComuni} className="mb-1" disabled={!coesta} style={{ borderRadius:10, padding:'10px 12px' }}>
                        <option value="">Seleccione municipio</option>
                        {municipios.map(m=> <option key={m.TMA_COMUNI} value={m.TMA_COMUNI}>{m.TMA_NOMBRE}</option>)}
                      </CFormSelect>
                      {errors.comuni && <div className="text-danger small mb-2">{errors.comuni}</div>}

                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>2.4 Parroquia</label>
                      <CFormSelect value={coparr} onChange={handleCoparr} className="mb-1" disabled={!comuni} style={{ borderRadius:10, padding:'10px 12px' }}>
                        <option value="">Seleccione parroquia</option>
                        {parroquias.map(p=> <option key={p.TMA_COPARR} value={p.TMA_COPARR}>{p.TMA_NOMBRE}</option>)}
                      </CFormSelect>
                      {errors.coparr && <div className="text-danger small mb-2">{errors.coparr}</div>}

                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>2.5 Comunidad</label>
                      <CFormSelect value={codcom} onChange={handleCodcom} className="mb-1" disabled={!coparr} style={{ borderRadius:10, padding:'10px 12px' }}>
                        <option value="">Seleccione comunidad</option>
                        {comunidades.map(c=> <option key={c.TMA_CODCOM} value={c.TMA_CODCOM}>{c.TMA_NOMBRE}</option>)}
                      </CFormSelect>
                      {errors.codcom && <div className="text-danger small mb-2">{errors.codcom}</div>}

                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>2.6 Dirección</label>
                      <CFormInput type="text" value={direccion} onChange={handleDireccionChange} className="mb-1" style={{ borderRadius:10, padding:'10px 12px' }} />
                      {errors.direccion && <div className="text-danger small mb-2">{errors.direccion}</div>}

                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>2.7 Teléfono</label>
                      <CFormInput type="text" value={telefono} onChange={handleTelefonoChange} className="mb-1" style={{ borderRadius:10, padding:'10px 12px' }} />
                      {errors.telefono && <div className="text-danger small mb-2">{errors.telefono}</div>}

                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>2.8 Correo</label>
                      <CFormInput type="email" value={email} onChange={handleEmailChange} className="mb-1" style={{ borderRadius:10, padding:'10px 12px' }} />
                      {errors.email && <div className="text-danger small mb-2">{errors.email}</div>}
                    </CCol>
                  </CRow>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display:'flex', justifyContent:'center' }}>
                <div style={{ width: 760 }}>
                  <CRow className="g-3">
                    <CCol md={6} style={{ margin: '0 auto' }}>
                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>3.1 Usuario</label>
                      <CFormInput type="text" value={usuario} onChange={handleUsuarioChange} className="mb-1" style={{ borderRadius:10, padding:'10px 12px' }} />
                      {errors.usuario && <div className="text-danger small mb-2">{errors.usuario}</div>}

                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>3.2 Contraseña</label>
                      <CFormInput type="password" value={contraseña} onChange={handlePasswordChange} className="mb-1" style={{ borderRadius:10, padding:'10px 12px' }} />
                      {errors.contraseña && <div className="text-danger small mb-2">{errors.contraseña}</div>}

                      <label style={{ fontSize:13, color:'#555', marginBottom:6 }}>3.3 Repetir contraseña</label>
                      <CFormInput type="password" value={repeatPassword} onChange={handleRepeatPasswordChange} className="mb-1" style={{ borderRadius:10, padding:'10px 12px' }} />
                      {errors.repeatPassword && <div className="text-danger small mb-2">{errors.repeatPassword}</div>}
                    </CCol>
                  </CRow>
                </div>
              </div>
            )}

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 18 }}>
              <div>
                {step > 1 && (
                  <CButton onClick={back} style={{ backgroundColor:'#fff', color:'#FF7043', borderColor:'#FF7043' }}>Anterior</CButton>
                )}
              </div>

              <div style={{ display:'flex', gap: 12 }}>
                {step < 3 && (
                  <CButton onClick={next} disabled={validateStep(step).length > 0} style={{
                    backgroundColor: validateStep(step).length > 0 ? '#ffd6c9' : '#FF7043',
                    color: '#fff'
                  }}>
                    Siguiente
                  </CButton>
                )}

                {step === 3 && (
                  <CButton type="submit" disabled={loading || validateStep(3).length > 0} style={{ backgroundColor: '#FF7043', color: '#fff' }}>
                    {loading ? 'Enviando...' : 'Registrar'}
                  </CButton>
                )}
                <Link to="/login"><CButton style={{ backgroundColor: 'transparent', color: '#6b6b6b' }}>Login</CButton></Link>
                <HelpButton videoUrl="/videos/video.mp4" />
              </div>
            </div>
          </form>
        </CCardBody>
      </CCard>

      <CModal alignment="center" visible={modal.show} onClose={handleCloseModal}>
        <CModalHeader><CModalTitle>{modal.success ? 'Registro exitoso' : 'Error'}</CModalTitle></CModalHeader>
        <CModalBody className="text-center" style={{ whiteSpace: 'pre-wrap' }}>{modal.mensaje}</CModalBody>
        <CModalFooter><CButton style={{backgroundColor:'white', color:'#ff7043'}} onClick={handleCloseModal}>Aceptar</CButton></CModalFooter>
      </CModal>

      
    </div>
  );
};

export default Formulario;