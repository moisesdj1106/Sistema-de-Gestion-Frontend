import  { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CForm, CFormInput, CButton, CAlert, CContainer, CRow, CCol, CCard, CCardBody, CCardTitle } from "@coreui/react";
  

const SolicitarRecuperacion = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const original = document.body.style.background;
    document.body.style.background = 'url("/src/assets/images/carro.jpg") center center / cover no-repeat fixed';
    return () => { document.body.style.background = original; };
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje(""); setError("");
    try {
      const res = await fetch("http://localhost:4000/solicitar-recuperacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) setMensaje(data.mensaje);
      else setError(data.mensaje);
    } catch {
      setError("Error en la conexión");
    }
  };

  return (
    <CContainer className="py-4" style={{marginTop:'170px'}}>
      <CRow className="justify-content-center">
        <CCol xs={12} md={6}>
          <CCard>
            <CCardBody>
              <CCardTitle>¿Olvidaste tu usuario o contraseña?</CCardTitle>
              <CForm onSubmit={handleSubmit}>
                <CFormInput
                  type="email"
                  placeholder="Correo registrado"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="mb-3"
                />
                <CButton type="submit" style={{backgroundColor:'#ff7043', color:'white'}} className="w-100 mb-2">
                  Enviar enlace de recuperación
                </CButton>
              </CForm>
              <CButton
                color="secondary"
                variant="outline"
                className="w-100"
                onClick={() => navigate("/login")}
              >
                Volver al Login
              </CButton>
              {mensaje && <CAlert color="success" className="mt-3">{mensaje}</CAlert>}
              {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default SolicitarRecuperacion;