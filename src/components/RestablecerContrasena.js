import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  CForm,
  CFormInput,
  CButton,
  CAlert,
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CCardHeader
} from "@coreui/react";
import bg from "../assets/images/carro.jpg";
console.log("restablecer contra")
const RestablecerContrasena = () => {
  const { token } = useParams();
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [repeat, setRepeat] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // Cambiar fondo del body
useEffect(() => {
  const original = document.body.style.background;
  document.body.style.background = `url(${bg}) center center / cover no-repeat fixed`;
  return () => { document.body.style.background = original; };
}, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje(""); setError("");
    if (nuevaContrasena !== repeat) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      const res = await fetch(`https://sistema-de-gestion-backend.onrender.com/restablecer/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevaContrasena })
      });
      const data = await res.json();
      if (res.ok) setMensaje(data.mensaje);
      else setError(data.mensaje);
    } catch {
      setError("Error en la conexión");
    }
  };

  return (
    <CContainer className="py-5">
      <CRow className="justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
        <CCol xs={12} md={7} lg={5}>
          <CCard className="shadow-lg border-0">
            <CCardHeader className="text-center" style={{ background: "#ff7043" }}>
              <CCardTitle style={{ color: "#fff", fontWeight: 600, fontSize: "1.5rem" }}>
                Restablecer Contraseña
              </CCardTitle>
            </CCardHeader>
            <CCardBody style={{ background: "#f8f9fa" }}>
              <p className="text-center mb-4" style={{ color: "#114c5f" }}>
                Ingresa tu nueva contraseña y confírmala para restablecer el acceso.
              </p>
              <CForm onSubmit={handleSubmit}>
                <CFormInput
                  type="password"
                  placeholder="Nueva contraseña"
                  value={nuevaContrasena}
                  onChange={e => setNuevaContrasena(e.target.value)}
                  required
                  className="mb-3"
                  floatingLabel="Nueva contraseña"
                  autoComplete="new-password"
                />
                <CFormInput
                  type="password"
                  placeholder="Repetir contraseña"
                  value={repeat}
                  onChange={e => setRepeat(e.target.value)}
                  required
                  className="mb-3"
                  floatingLabel="Repetir contraseña"
                  autoComplete="new-password"
                />
                <CButton
                  type="submit"
                  color="primary"
                  className="w-100 py-2"
                  style={{ fontWeight: 600, fontSize: "1.1rem", background: "#ff7043", border: "none", marginBottom: "10px" }}
                >
                  Restablecer
                </CButton>
                <CButton
                  onClick={() => window.location.href = "/login"}
                  type="submit"
                  color="primary"
                  className="w-100 py-2"
                  style={{ fontWeight: 600, fontSize: "1.1rem", background: "white",color:'#ff7043', borderColor: "#ff7043"}}
                >
                  Login
                </CButton>
              </CForm>
              {mensaje && <CAlert color="success" className="mt-3 text-center">{mensaje}</CAlert>}
              {error && <CAlert color="danger" className="mt-3 text-center">{error}</CAlert>}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default RestablecerContrasena;