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
    CModalFooter
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
    const navigate = useNavigate();

    // Regex y helpers (coinciden con validaciones del servidor)
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'\-]+$/;
    const digitsRegex = /^\d+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const validateClient = () => {
        const errors = [];

        if (!tipodo) errors.push('Seleccione tipo de documento');
        if (!cedula) errors.push('Documento es obligatorio');
        else if (!digitsRegex.test(cedula)) errors.push('Documento: solo dígitos');

        if (!nombres) errors.push('Nombres son obligatorios');
        else if (!nameRegex.test(nombres)) errors.push('Nombres inválidos');

        if (!apellidos) errors.push('Apellidos son obligatorios');
        else if (!nameRegex.test(apellidos)) errors.push('Apellidos inválidos');

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

        if (telefono && !digitsRegex.test(telefono)) errors.push('Teléfono: solo dígitos');

        if (!email) errors.push('Correo es obligatorio');
        else if (!emailRegex.test(email)) errors.push('Correo inválido');

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors([]);
        const clientErrors = validateClient();
        if (clientErrors.length) {
            setFieldErrors(clientErrors);
            setModal({ show: true, mensaje: clientErrors.join('\n'), success: false });
            return;
        }

        try {
            const response = await fetch(`${API}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                })
            });

            if (response.ok) {
                setModal({ show: true, mensaje: 'Usuario registrado correctamente', success: true });
                setFieldErrors([]);
            } else if (response.status === 400) {
                const data = await response.json();
                const mensajes = data.errores || [data.message || 'Error de validación'];
                setFieldErrors(mensajes);
                setModal({ show: true, mensaje: mensajes.join('\n'), success: false });
            } else if (response.status === 409) {
                const data = await response.json();
                const detalles = data.detalles || [data.mensaje || 'Conflicto en datos'];
                setFieldErrors(detalles);
                setModal({ show: true, mensaje: detalles.join('\n'), success: false });
            } else {
                const data = await response.json().catch(()=>({}));
                setModal({ show: true, mensaje: data.message || 'Error al registrar el usuario', success: false });
            }
        } catch (error) {
            setModal({ show: true, mensaje: 'Error de conexión al servidor', success: false });
        }
    };

    const handleCloseModal = () => {
        const wasSuccess = modal.success;
        setModal({ show: false, mensaje: '', success: false });
        if (wasSuccess) navigate('/login');
    };

    // Refs para navegación con Enter
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

    // función helper para avanzar al siguiente campo cuando presionan Enter
    const handleEnter = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextRef && nextRef.current) nextRef.current.focus();
        }
    };

    // validaciones de entrada en tiempo real (evitan caracteres no permitidos)
    const handleCedulaChange = e => {
        // solo dígitos
        setCedula(e.target.value.replace(/\D/g, ''));
    };

    const handleNombresChange = e => {
        // solo letras, espacios, acentos, guion y apóstrofe
        setNombre(e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, ''));
    };

    const handleApellidosChange = e => {
        setApellidos(e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, ''));
    };

    const handleTelefonoChange = e => {
        setTelefono(e.target.value.replace(/\D/g, ''));
    };

    // cálculo de fecha máxima (mayor de 18 años)
    const maxBirth = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxFechaNacimiento = maxBirth.toISOString().split('T')[0];

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
            }}
        >
            <CCard className="shadow" style={{ maxWidth: '800px', width: '100%' }}>
                <CCardHeader className=" text-white text-center" style={{ backgroundColor: '#FF7043' }}>
                    <h4>Registro de Usuario</h4>
                </CCardHeader>
                <CCardBody>
                    <CForm onSubmit={handleSubmit}>
                        <CRow>
                            <CCol md={6}>
                                <CFormSelect
                                    label="Tipo de Documento"
                                    value={tipodo}
                                    onChange={e => setTipodo(e.target.value)}
                                    required
                                    className="mb-3"
                                    ref={paisRef} /* pequeño ajuste: no afecta el select navigation si no se usa */
                                >
                                    <option value="">Seleccione tipo de documento</option>
                                    {tipoDocumentos.map(tipo => (
                                        <option key={tipo.TMA_CODDOC} value={tipo.TMA_CODDOC}>
                                            {tipo.TMA_NOMBRE}
                                        </option>
                                    ))}
                                </CFormSelect>

                                <CFormInput
                                    type="text"
                                    label="Documento de identidad"
                                    placeholder="Ingrese el N° documento"
                                    value={cedula}
                                    onChange={handleCedulaChange}
                                    required
                                    className="mb-3"
                                    ref={cedulaRef}
                                    onKeyDown={e => handleEnter(e, nombresRef)}
                                />

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

                                <CFormSelect
                                    label="Sexo"
                                    value={sexo}
                                    onChange={e => setSexo(e.target.value)}
                                    required
                                    className="mb-3"
                                    ref={sexoRef}
                                    onKeyDown={e => handleEnter(e, fechaRef)}
                                >
                                    <option value="">Seleccione sexo</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </CFormSelect>

                                <CFormInput
                                    type="date"
                                    label="Fecha de Nacimiento"
                                    value={fecha_nac}
                                    onChange={e => setFechaNacimiento(e.target.value)}
                                    required
                                    className="mb-3"
                                    max={maxFechaNacimiento}
                                    ref={fechaRef}
                                    onKeyDown={e => handleEnter(e, usuarioRef)}
                                />

                                <CFormInput
                                    type="text"
                                    label="Usuario"
                                    placeholder="Ingrese su usuario"
                                    value={usuario}
                                    onChange={e => setUsuario(e.target.value)}
                                    required
                                    className="mb-3"
                                    ref={usuarioRef}
                                    onKeyDown={e => handleEnter(e, passwordRef)}
                                />

                                <CFormInput
                                    type="password"
                                    label="Contraseña"
                                    placeholder="Ingrese su contraseña"
                                    value={contraseña}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="mb-3"
                                    ref={passwordRef}
                                    onKeyDown={e => handleEnter(e, repeatRef)}
                                />

                                <CFormInput
                                    type="password"
                                    label="Repetir contraseña"
                                    placeholder="Repita su contraseña"
                                    value={repeatPassword}
                                    onChange={e => setRepeatPassword(e.target.value)}
                                    required
                                    className="mb-3"
                                    ref={repeatRef}
                                    onKeyDown={e => handleEnter(e, paisRef)}
                                />
                            </CCol>

                            <CCol md={6}>
                                <CFormSelect
                                    label="País"
                                    value={codpais}
                                    onChange={e => setCodpais(e.target.value)}
                                    required
                                    className="mb-3"
                                    ref={paisRef}
                                    onKeyDown={e => handleEnter(e, estadoRef)}
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
                                    ref={estadoRef}
                                    onKeyDown={e => handleEnter(e, muniRef)}
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
                                    ref={muniRef}
                                    onKeyDown={e => handleEnter(e, parrRef)}
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
                                    ref={parrRef}
                                    onKeyDown={e => handleEnter(e, comRef)}
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
                                    ref={comRef}
                                    onKeyDown={e => handleEnter(e, direccionRef)}
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
                                    ref={direccionRef}
                                    onKeyDown={e => handleEnter(e, telefonoRef)}
                                />

                                <CFormInput
                                    type="text"
                                    label="Teléfono"
                                    placeholder="Ejm 04147415896"
                                    value={telefono}
                                    onChange={handleTelefonoChange}
                                    className="mb-3"
                                    ref={telefonoRef}
                                    onKeyDown={e => handleEnter(e, emailRef)}
                                />

                                <CFormInput
                                    type="email"
                                    label="Correo"
                                    placeholder="Ejm correo@gmail.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="mb-3"
                                    ref={emailRef}
                                />
                            </CCol>
                        </CRow>
                        <div className="text-center">
                            <CButton style={{ backgroundColor: '#FF7043', color: 'white' }} type="submit">
                                Enviar
                            </CButton>
                            <Link to="/login">
                                <CButton style={{ backgroundColor: 'white', color: 'black', borderColor: '#FF7043', marginLeft: '10px' }} type="button">
                                    Login
                                </CButton>
                            </Link>
                        </div>
                    </CForm>
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