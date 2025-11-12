import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    CForm,
    CRow,
    CCol,
    CFormInput,
    CFormSelect,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CProgress,
    CBadge
} from '@coreui/react';

import bg  from 'src/assets/images/carro.jpg';

const API = 'https://sistema-de-gestion-backend.onrender.com';

const Formulario = () => {
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
    const [fieldErrors, setFieldErrors] = useState([]); // lista de errores de validación cliente/servidor

    // nuevos estados de error por campo (cedula / telefono)
    const [cedulaError, setCedulaError] = useState('');
    const [telefonoError, setTelefonoError] = useState('');
    const [loading, setLoading] = useState(false);

    // pasos (1 personal, 2 ubicación/cuenta, 3 confirmación)
    const [paso, setPaso] = useState(1);

    const navigate = useNavigate();

    // Regex y helpers (coinciden con validaciones del servidor)
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'\-]+$/;
    const digitsRegex = /^\d+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // prefijos válidos para teléfono
    const validPhonePrefixes = ['0424','0426','0414','0416','0412'];

    // existencia en tiempo real
    const [existsState, setExistsState] = useState({ checking: false, exists: false, message: '' });
    const existTimer = useRef(null);
    const existController = useRef(null);

    // Tipos de documento
    useEffect(() => {
        fetch(`${API}/documento`)
            .then(res => res.json())
            .then(setTipoDocumentos)
            .catch(console.error);
    }, []);

    // Listar países
    useEffect(() => {
        fetch(`${API}/paises`)
            .then(res => res.json())
            .then(setPaises)
            .catch(console.error);
    }, []);

    // Listar estados al seleccionar país
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
        setParroquias([]);
        setCoparr('');
        setComunidades([]);
        setCodcom('');
    }, [codpais]);

    // Listar municipios al seleccionar estado
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
        setParroquias([]);
        setCoparr('');
        setComunidades([]);
        setCodcom('');
    }, [coesta]);

    // Listar parroquias al seleccionar municipio
    useEffect(() => {
        if (comuni) {
            fetch(`${API}/parroquias/${comuni}`)
                .then(res => res.json())
                .then(setParroquias)
                .catch(console.error);
        } else {
            setParroquias([]);
            setCoparr('');
        }
        setComunidades([]);
        setCodcom('');
    }, [comuni]);

    // Listar comunidades al seleccionar parroquia
    useEffect(() => {
        if (coparr) {
            fetch(`${API}/comunidades/${coparr}`)
                .then(res => res.json())
                .then(setComunidades)
                .catch(console.error);
        } else {
            setComunidades([]);
            setCodcom('');
        }
    }, [coparr]);

    // cálculo de fecha máxima (mayor de 18 años)
    const today = new Date();
    const maxBirth = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxFechaNacimiento = maxBirth.toISOString().split('T')[0];

    // reglas por tipo de documento:
    // - si tipodo === 'E' (extranjero) permitir alfanumérico hasta 12
    // - si tipodo === 'P' (pasaporte) permitir alfanumérico, mayúsculas, números, hasta 12
    // - por defecto (V, J, G, etc) solo dígitos entre 7-9
    const docRules = (tipo) => {
        if (!tipo) return { pattern: /^\d+$/, max: 9, min: 7, allowLetters: false };
        if (String(tipo).toUpperCase() === 'E') return { pattern: /^[A-Za-z0-9]+$/, max: 12, min: 4, allowLetters: true };
        if (String(tipo).toUpperCase() === 'P') return { pattern: /^[A-Za-z0-9]+$/, max: 12, min: 4, allowLetters: true };
        // caso por defecto: números 7-9
        return { pattern: /^\d+$/, max: 9, min: 7, allowLetters: false };
    };

    // validación por campo
    const validateClient = (stepCheck) => {
        const errors = [];

        if (stepCheck === 1 || !stepCheck) {
            if (!tipodo) errors.push('Seleccione tipo de documento');
            const rules = docRules(tipodo);
            if (!cedula) errors.push('Documento es obligatorio');
            else {
                if (!rules.pattern.test(cedula)) {
                    errors.push(rules.allowLetters ? 'Documento inválido (solo letras y números)' : 'Documento: solo dígitos');
                }
                if (cedula.length < rules.min || cedula.length > rules.max) {
                    errors.push(`Documento debe tener entre ${rules.min} y ${rules.max} caracteres`);
                }
            }

            if (!nombres) errors.push('Nombres son obligatorios');
            else if (!nameRegex.test(nombres)) errors.push('Nombres inválidos');

            if (!apellidos) errors.push('Apellidos son obligatorios');
            else if (!nameRegex.test(apellidos)) errors.push('Apellidos inválidos');
        }

        if (stepCheck === 2 || !stepCheck) {
            if (!sexo) errors.push('Seleccione sexo');
            if (!fecha_nac) errors.push('Fecha de nacimiento es obligatoria');
            else {
                const f = new Date(fecha_nac);
                if (isNaN(f.getTime())) errors.push('Fecha de nacimiento inválida');
                else {
                    const fechaMax = new Date(maxBirth);
                    fechaMax.setHours(0,0,0,0);
                    f.setHours(0,0,0,0);
                    if (f > fechaMax) errors.push('Debes ser mayor de 18 años');
                }
            }

            if (!usuario) errors.push('Usuario es obligatorio');

            if (!contraseña) errors.push('Contraseña es obligatoria');
            else if (contraseña.length < 6) errors.push('Contraseña mínimo 6 caracteres');

            if (contraseña !== repeatPassword) errors.push('Las contraseñas no coinciden');

            if (!codpais) errors.push('Seleccione país');
            if (!coesta) errors.push('Seleccione estado');
            if (!comuni) errors.push('Seleccione municipio');
            if (!coparr) errors.push('Seleccione parroquia');
            if (!codcom) errors.push('Seleccione comunidad');

            if (!direccion) errors.push('Dirección es obligatoria');

            // teléfono opcional pero validado si se completa
            if (telefono) {
                if (!digitsRegex.test(telefono)) errors.push('Teléfono: solo dígitos');
                else if (telefono.length !== 11) errors.push('Teléfono debe tener exactamente 11 dígitos');
                else {
                    const pref = telefono.slice(0,4);
                    if (!validPhonePrefixes.includes(pref)) errors.push('Teléfono debe comenzar con 0424, 0426, 0414, 0416 o 0412');
                }
            }

            if (!email) errors.push('Correo es obligatorio');
            else if (!emailRegex.test(email)) errors.push('Correo inválido');
        }

        return errors;
    };

    // debounced existence check: se dispara cuando cedula o tipodo cambian y cumplen reglas mínimas
    useEffect(() => {
        // limpiar checks previos
        setExistsState({ checking: false, exists: false, message: '' });
        if (existTimer.current) clearTimeout(existTimer.current);
        if (existController.current) {
            try { existController.current.abort(); } catch {}
            existController.current = null;
        }

        const rules = docRules(tipodo);
        if (!cedula || cedula.length < Math.max(4, rules.min)) return; // esperar mínimo razonable

        existTimer.current = setTimeout(async () => {
            setExistsState({ checking: true, exists: false, message: '' });
            existController.current = new AbortController();
            try {
                // endpoint esperado: /users/existe?tipo=TIPO&documento=VALOR
                // adapta si tu backend usa otra ruta
                const qTipo = encodeURIComponent(tipodo || '');
                const qDoc = encodeURIComponent(cedula);
                const res = await fetch(`${API}/users/existe?tipo=${qTipo}&documento=${qDoc}`, { signal: existController.current.signal, headers: { Accept: 'application/json' } });
                // esperar respuesta JSON { exists: true, mensaje: '...' } o similar
                let data = {};
                try { data = await res.json(); } catch {}
                if (res.ok) {
                    const exists = !!(data.exists || data.existe || data.exists === true);
                    setExistsState({ checking: false, exists, message: exists ? (data.mensaje || 'Usuario ya registrado') : (data.mensaje || 'No existe') });
                } else {
                    // si no hay ruta exacta, intentar buscar por cedula simple
                    // fallback: 404 o 500 -> marcar no verificado
                    setExistsState({ checking: false, exists: false, message: data.mensaje || 'No se pudo verificar existencia' });
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
                setExistsState({ checking: false, exists: false, message: 'Error al verificar existencia' });
            } finally {
                existController.current = null;
            }
        }, 700);

        return () => {
            if (existTimer.current) clearTimeout(existTimer.current);
            if (existController.current) {
                try { existController.current.abort(); } catch {}
                existController.current = null;
            }
        };
    }, [cedula, tipodo]);

    // inputs controlados con reglas por tipo de documento
    const handleCedulaChange = e => {
        const rules = docRules(tipodo);
        let val = e.target.value;
        // normalizar: si permite solo dígitos, eliminar no dígitos; si permite alfanumérico, eliminar espacios y caracteres no alfanuméricos
        if (!rules.allowLetters) {
            val = val.replace(/\D/g, '').slice(0, rules.max);
        } else {
            val = val.replace(/[^A-Za-z0-9]/g, '').slice(0, rules.max).toUpperCase();
        }
        setCedula(val);

        // validación inmediata
        if (val.length > 0 && (val.length < rules.min || val.length > rules.max)) {
            setCedulaError(`Documento debe tener entre ${rules.min} y ${rules.max} caracteres`);
        } else {
            setCedulaError('');
        }
    };

    const handleTelefonoChange = e => {
        // solo dígitos y máximo 11 caracteres
        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
        setTelefono(cleaned);

        // validación inmediata de prefijo y longitud
        if (cleaned.length > 0 && cleaned.length !== 11) {
            setTelefonoError('Teléfono debe tener 11 dígitos');
        } else if (cleaned.length === 11) {
            const pref = cleaned.slice(0,4);
            if (!validPhonePrefixes.includes(pref)) {
                setTelefonoError('Teléfono debe comenzar con 0424, 0426, 0414, 0416 o 0412');
            } else {
                setTelefonoError('');
            }
        } else {
            setTelefonoError('');
        }
    };

    // navegación entre pasos
    const siguientePaso = () => {
        const errors = validateClient(paso);
        if (errors.length) {
            setFieldErrors(errors);
            setModal({ show: true, mensaje: errors.join('\n'), success: false });
            return;
        }
        setFieldErrors([]);
        setPaso(p => Math.min(3, p + 1));
    };
    const anteriorPaso = () => setPaso(p => Math.max(1, p - 1));

    // envío final (igual que antes, con loading y timeout)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        const errors = validateClient();
        if (errors.length) {
            setFieldErrors(errors);
            setModal({ show: true, mensaje: errors.join('\n'), success: false });
            return;
        }

        // si existencia detectada, prevenir envío
        if (existsState.exists) {
            setModal({ show: true, mensaje: 'El documento ya está registrado. Verifique.', success: false });
            return;
        }

        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

        try {
            const response = await fetch(`${API}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    cedula,
                    nombres,
                    apellidos,
                    direccion,
                    telefono,
                    sexo,
                    fecha_nac,
                    usuario,
                    email,
                    contraseña,
                    tipodo,
                    codcom
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            let data = {};
            try { data = await response.json(); } catch {}

            if (response.ok) {
                setModal({ show: true, mensaje: 'Usuario registrado correctamente', success: true });
                setFieldErrors([]);
            } else if (response.status === 409) {
                const detalles = data.detalles || [data.mensaje || 'Registro duplicado'];
                setFieldErrors(detalles);
                setModal({ show: true, mensaje: detalles.join('\n'), success: false });
            } else if (response.status === 400) {
                const mensajes = data.errores || [data.message || 'Error de validación'];
                setFieldErrors(mensajes);
                setModal({ show: true, mensaje: mensajes.join('\n'), success: false });
            } else {
                setModal({ show: true, mensaje: data.message || 'Error al registrar el usuario', success: false });
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                setModal({ show: true, mensaje: 'La petición tardó demasiado y fue cancelada. Intente de nuevo.', success: false });
            } else {
                setModal({ show: true, mensaje: 'Error de conexión al servidor', success: false });
            }
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        const wasSuccess = modal.success;
        setModal({ show: false, mensaje: '', success: false });
        if (wasSuccess) navigate('/login');
    };

    // Refs y handlers de entrada (mantener existentes)
    const cedulaRef = useRef(null);
    const nombresRef = useRef(null);
    const apellidosRef = useRef(null);
    const sexoRef = useRef(null);
    const fechaRef = useRef(null);
    const usuarioRef = useRef(null);
    const passwordRef = useRef(null);
    const repeatRef = useRef(null);
    const paisRef = useRef(null);
    const estadoRef = useRef(null);
    const muniRef = useRef(null);
    const parrRef = useRef(null);
    const comRef = useRef(null);
    const direccionRef = useRef(null);
    const telefonoRef = useRef(null);
    const emailRef = useRef(null);

    const handleEnter = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextRef && nextRef.current) nextRef.current.focus();
        }
    };

    const handleNombresChange = e => {
        setNombre(e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, ''));
    };

    const handleApellidosChange = e => {
        setApellidos(e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, ''));
    };

    // UI: stepper simple y diseño moderno con colores existentes
    const progress = paso === 1 ? 33 : paso === 2 ? 66 : 100;

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: 20
            }}
        >
            <CCard className="shadow" style={{ maxWidth: '900px', width: '100%', borderRadius: 16 }}>
                <CCardHeader className=" text-white" style={{ backgroundColor: '#FF7043', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Registro de Usuario</h4>
                        <div style={{ width: 240 }}>
                            <CProgress value={progress} height="8px" style={{ background: '#ffd8cc' }} color="warning" />
                        </div>
                    </div>
                </CCardHeader>
                <CCardBody>
                    <form onSubmit={handleSubmit}>
                        {paso === 1 && (
                            <div>
                                <h5 style={{ color: '#555' }}>1. Datos personales</h5>
                                <CRow className="g-3">
                                    <CCol md={6}>
                                        <CFormSelect
                                            label="Tipo de Documento"
                                            value={tipodo}
                                            onChange={e => setTipodo(e.target.value)}
                                            required
                                            className="mb-3"
                                        >
                                            <option value="">Seleccione tipo de documento</option>
                                            {tipoDocumentos.map(tipo => (
                                                <option key={tipo.TMA_CODDOC} value={tipo.TMA_CODDOC}>
                                                    {tipo.TMA_NOMBRE}
                                                </option>
                                            ))}
                                            {/* Si desea añadir opciones fijas: <option value="E">Extranjero</option> <option value="P">Pasaporte</option> */}
                                        </CFormSelect>

                                        <CFormInput
                                            type="text"
                                            label="Documento de identidad"
                                            placeholder={docRules(tipodo).allowLetters ? 'Ej: A1234567' : 'Ej: 12345678'}
                                            value={cedula}
                                            onChange={handleCedulaChange}
                                            required
                                            className="mb-3"
                                            ref={cedulaRef}
                                            onKeyDown={e => handleEnter(e, nombresRef)}
                                            maxLength={docRules(tipodo).max}
                                        />
                                        {cedulaError && <div className="text-danger small mb-2">{cedulaError}</div>}
                                        <div className="mb-2">
                                            {existsState.checking ? <CBadge color="secondary">Verificando...</CBadge> :
                                                existsState.exists ? <CBadge color="danger">Ya registrado</CBadge> :
                                                (existsState.message ? <CBadge color="success">{existsState.message}</CBadge> : null)}
                                        </div>

                                        <CFormInput
                                            type="text"
                                            label="Nombres"
                                            placeholder="Ingrese sus nombres"
                                            value={nombres}
                                            onChange={handleNombresChange}
                                            required
                                            className="mb-3"
                                            ref={nombresRef}
                                            onKeyDown={e => handleEnter(e, apellidosRef)}
                                        />

                                        <CFormInput
                                            type="text"
                                            label="Apellidos"
                                            placeholder="Ingrese sus apellidos"
                                            value={apellidos}
                                            onChange={handleApellidosChange}
                                            required
                                            className="mb-3"
                                            ref={apellidosRef}
                                            onKeyDown={e => handleEnter(e, sexoRef)}
                                        />
                                    </CCol>
                                </CRow>
                                <div className="d-flex justify-content-end mt-3">
                                    <CButton style={{ backgroundColor: '#FF7043', color: 'white' }} onClick={siguientePaso}>Siguiente</CButton>
                                </div>
                            </div>
                        )}

                        {paso === 2 && (
                            <div>
                                <h5 style={{ color: '#555' }}>2. Ubicación y cuenta</h5>
                                <CRow className="g-3">
                                    <CCol md={6}>
                                        <CFormSelect
                                            label="País"
                                            value={codpais}
                                            onChange={e => setCodpais(e.target.value)}
                                            required
                                            className="mb-3"
                                        >
                                            <option value="">Seleccione país</option>
                                            {paises.map(pais => (
                                                <option key={pais.TMA_COPAIS} value={pais.TMA_COPAIS}>
                                                    {pais.TMA_NOMBRE}
                                                </option>
                                            ))}
                                        </CFormSelect>

                                        <CFormSelect
                                            label="Estado"
                                            value={coesta}
                                            onChange={e => setCoesta(e.target.value)}
                                            required
                                            className="mb-3"
                                            disabled={!codpais}
                                        >
                                            <option value="">Seleccione estado</option>
                                            {estados.map(edo => (
                                                <option key={edo.TMA_COESTA} value={edo.TMA_COESTA}>
                                                    {edo.TMA_NOMBRE}
                                                </option>
                                            ))}
                                        </CFormSelect>

                                        <CFormSelect
                                            label="Municipio"
                                            value={comuni}
                                            onChange={e => setComuni(e.target.value)}
                                            required
                                            className="mb-3"
                                            disabled={!coesta}
                                        >
                                            <option value="">Seleccione municipio</option>
                                            {municipios.map(muni => (
                                                <option key={muni.TMA_COMUNI} value={muni.TMA_COMUNI}>
                                                    {muni.TMA_NOMBRE}
                                                </option>
                                            ))}
                                        </CFormSelect>

                                        <CFormSelect
                                            label="Parroquia"
                                            value={coparr}
                                            onChange={e => setCoparr(e.target.value)}
                                            required
                                            className="mb-3"
                                            disabled={!comuni}
                                        >
                                            <option value="">Seleccione parroquia</option>
                                            {parroquias.map(parr => (
                                                <option key={parr.TMA_COPARR} value={parr.TMA_COPARR}>
                                                    {parr.TMA_NOMBRE}
                                                </option>
                                            ))}
                                        </CFormSelect>

                                        <CFormSelect
                                            label="Comunidad"
                                            value={codcom}
                                            onChange={e => setCodcom(e.target.value)}
                                            required
                                            className="mb-3"
                                            disabled={!coparr}
                                        >
                                            <option value="">Seleccione comunidad</option>
                                            {comunidades.map(comu => (
                                                <option key={comu.TMA_CODCOM} value={comu.TMA_CODCOM}>
                                                    {comu.TMA_NOMBRE}
                                                </option>
                                            ))}
                                        </CFormSelect>

                                        <CFormInput
                                            type="text"
                                            label="Dirección"
                                            placeholder="Ingrese su dirección"
                                            value={direccion}
                                            onChange={e => setDireccion(e.target.value)}
                                            required
                                            className="mb-3"
                                        />
                                    </CCol>

                                    <CCol md={6}>
                                        <CFormInput
                                            type="text"
                                            label="Teléfono"
                                            placeholder="Ejm 04141234567"
                                            value={telefono}
                                            onChange={handleTelefonoChange}
                                            className="mb-3"
                                            maxLength={11}
                                            inputMode="numeric"
                                        />
                                        {telefonoError && <div className="text-danger small mb-2">{telefonoError}</div>}

                                        <CFormInput
                                            type="email"
                                            label="Correo"
                                            placeholder="Ejm correo@gmail.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            className="mb-3"
                                        />

                                        <CFormInput
                                            type="text"
                                            label="Usuario"
                                            placeholder="Ingrese su usuario"
                                            value={usuario}
                                            onChange={e => setUsuario(e.target.value)}
                                            required
                                            className="mb-3"
                                        />

                                        <CFormInput
                                            type="password"
                                            label="Contraseña"
                                            placeholder="Ingrese su contraseña"
                                            value={contraseña}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            min={6}
                                            className="mb-3"
                                        />

                                        <CFormInput
                                            type="password"
                                            label="Repetir contraseña"
                                            placeholder="Repita su contraseña"
                                            value={repeatPassword}
                                            onChange={e => setRepeatPassword(e.target.value)}
                                            required
                                            className="mb-3"
                                        />
                                    </CCol>
                                </CRow>
                                <div className="d-flex justify-content-between mt-3">
                                    <CButton color="secondary" onClick={anteriorPaso}>Atrás</CButton>
                                    <CButton style={{ backgroundColor: '#FF7043', color: 'white' }} onClick={siguientePaso}>Siguiente</CButton>
                                </div>
                            </div>
                        )}

                        {paso === 3 && (
                            <div>
                                <h5 style={{ color: '#555' }}>3. Confirmación</h5>
                                <div style={{ background: '#faf5f0', padding: 16, borderRadius: 8, marginTop: 12 }}>
                                    <p><strong>Documento:</strong> {tipodo} - {cedula}</p>
                                    <p><strong>Nombre:</strong> {nombres} {apellidos}</p>
                                    <p><strong>Teléfono:</strong> {telefono || 'No proporcionado'}</p>
                                    <p><strong>Correo:</strong> {email}</p>
                                    <p><strong>Dirección:</strong> {direccion}</p>
                                </div>
                                <div className="d-flex justify-content-between mt-3">
                                    <CButton color="secondary" onClick={anteriorPaso}>Atrás</CButton>
                                    <CButton disabled={loading || existsState.exists} style={{ backgroundColor: '#FF7043', color: 'white' }} type="submit">
                                        {loading ? 'Registrando...' : existsState.exists ? 'Documento ya registrado' : 'Registrar'}
                                    </CButton>
                                </div>
                            </div>
                        )}
                    </form>
                </CCardBody>
            </CCard>

            {/* Modal para mensajes */}
            <CModal alignment="center" visible={modal.show} onClose={handleCloseModal}>
                <CModalHeader>
                    <CModalTitle>{modal.success ? 'Registro exitoso' : 'Error'}</CModalTitle>
                </CModalHeader>
                <CModalBody className="text-center" style={{ whiteSpace: 'pre-wrap' }}>
                    {modal.mensaje}
                </CModalBody>
                <CModalFooter>
                    <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={handleCloseModal}>
                        Aceptar
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default Formulario;