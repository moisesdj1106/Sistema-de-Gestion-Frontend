import { useState, useEffect } from 'react';
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
    const navigate = useNavigate();

    // Tipos de documento
    useEffect(() => {
        fetch('http://localhost:4000/documento')
            .then(res => res.json())
            .then(setTipoDocumentos)
            .catch(console.error);
    }, []);

    // Listar países
    useEffect(() => {
        fetch('http://localhost:4000/paises')
            .then(res => res.json())
            .then(setPaises)
            .catch(console.error);
    }, []);

    // Listar estados al seleccionar país
    useEffect(() => {
        if (codpais) {
            fetch(`http://localhost:4000/estados/${codpais}`)
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
            fetch(`http://localhost:4000/municipios/${coesta}`)
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
            fetch(`http://localhost:4000/parroquias/${comuni}`)
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
            fetch(`http://localhost:4000/comunidades/${coparr}`)
                .then(res => res.json())
                .then(setComunidades)
                .catch(console.error);
        } else {
            setComunidades([]);
            setCodcom('');
        }
    }, [coparr]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (contraseña !== repeatPassword) {
            setModal({ show: true, mensaje: 'Las contraseñas no coinciden', success: false });
            return;
        }
        try {
            const response = await fetch('http://localhost:4000/users', {
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
            } else {
                const data = await response.json();
                setModal({ show: true, mensaje: data.message || 'Error al registrar el usuario', success: false });
            }
        } catch (error) {
            setModal({ show: true, mensaje: 'Error al registrar el usuario', success: false });
        }
    };

    const handleCloseModal = () => {
        setModal({ show: false, mensaje: '', success: false });
        if (modal.success) {
            navigate('/login');
        }
    };

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
                                {/* Orden lógico: Tipo de documento, Cédula, Nombres, Apellidos, Sexo, Fecha de nacimiento, Usuario, Contraseña, Repetir contraseña */}
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
                                </CFormSelect>
                                <CFormInput
                                    type="text"
                                    label="Documento de identidad"
                                    placeholder="Ingrese el N° documento"
                                    value={cedula}
                                    onChange={e => setCedula(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="text"
                                    label="Nombres"
                                    placeholder="Ingrese sus nombres"
                                    value={nombres}
                                    onChange={e => setNombre(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="text"
                                    label="Apellidos"
                                    placeholder="Ingrese sus apellidos"
                                    value={apellidos}
                                    onChange={e => setApellidos(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                                <CFormSelect
                                    label="Sexo"
                                    value={sexo}
                                    onChange={e => setSexo(e.target.value)}
                                    required
                                    className="mb-3"
                                >
                                    <option value="">Seleccione sexo</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </CFormSelect>
                                <CFormInput
                                    type="date"
                                    label="Fecha de Nacimiento"
                                    placeholder="Ingrese su fecha de nacimiento"
                                    value={fecha_nac}
                                    onChange={e => setFechaNacimiento(e.target.value)}
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
                            <CCol md={6}>
                                {/* Orden lógico: País, Estado, Municipio, Parroquia, Comunidad, Dirección, Teléfono, Email */}
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
                                <CFormInput
                                    type="text"
                                    label="Teléfono"
                                    placeholder="Ejm 04147415896"
                                    value={telefono}
                                    onChange={e => setTelefono(e.target.value)}
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="email"
                                    label="Correo"
                                    placeholder="Ejm correo@gmail.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="mb-3"
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
                <CModalBody className="text-center">
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