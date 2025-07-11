import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CContainer, CRow, CCol, CCardGroup, CCard, CCardBody, CForm,
  CInputGroup, CInputGroupText, CFormInput, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilLockLocked } from '@coreui/icons';
import imgBackground from 'src/assets/images/carro.jpg'
const Login = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [modal, setModal] = useState({ show: false, mensaje: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contraseña }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuario', usuario);
        localStorage.setItem('rol', data.rol);
        navigate('/docents');
      } else {
        setModal({ show: true, mensaje: data.mensaje || 'Error al iniciar sesión' });
      }
    } catch (error) {
      setModal({ show: true, mensaje: 'Error de conexión con el servidor' });
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-row align-items-center"
      style={{ 
        backgroundImage: `url(${imgBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4" style={{ background: '#fff', borderRight: '4px solidrgb(255, 255, 255)' }}>
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1 className="text-black fw-bold mb-3">Iniciar Sesión</h1>
                    <p className="mb-4" style={{ color: '#1976D2', fontWeight: 500 }}>
                      Accede a la plataforma de gestión de desastres
                    </p>
                    <div className="mb-3 text-secondary" style={{ fontStyle: 'italic', fontSize: 15 }}>
                      "Preparados para ayudar, unidos para salvar"
                    </div>
                    <CInputGroup className="mb-3">
                      <CInputGroupText style={{ background: '#FF7043', color: '#fff' }}>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Usuario"
                        autoComplete="username"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText style={{ background: '#FF7043', color: '#fff' }}>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="info" className="px-4 text-white fw-bold" type="submit">
                          Ingresar
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <Link to="/contraseña" className="text-decoration-none">
                          <CButton color="link" className="px-0 text-secondary fw-bold">
                            ¿Olvidaste tu contraseña?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard
                className="text-white py-5 d-none d-md-block"
                style={{
                  width: '44%',
                  background: 'linear-gradient(135deg, #1976D2 60%, #FF7043 100%)',
                  border: 'none',
                }}
              >
                <CCardBody className="text-center d-flex flex-column justify-content-center align-items-center h-100">
                  <div>
                    <h2 className="fw-bold mb-3">¡Bienvenido!</h2>
                    <p className="mb-4" style={{ fontSize: 17 }}>
                      Únete a nuestra comunidad y contribuye a la gestión y prevención de desastres en tu localidad.
                    </p>
                    <Link to="/register">
                      <CButton color="light" className="mt-3 fw-bold text-black" active tabIndex={-1}>
                        ¡Regístrate ahora!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
      {/* Modal para mostrar errores */}
      <CModal alignment="center" visible={modal.show} onClose={() => setModal({ show: false, mensaje: '' })}>
        <CModalHeader>
          <CModalTitle>Error de inicio de sesión</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center">
          {modal.mensaje}
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={() => setModal({ show: false, mensaje: '' })}>
            Aceptar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Login;