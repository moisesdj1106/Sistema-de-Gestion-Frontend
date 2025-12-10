import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CCard, CCardBody, CCardHeader, CRow, CCol, CForm, CFormInput, CFormLabel, CButton, CAlert, CProgress,
} from '@coreui/react'
import imgBackground from 'src/assets/images/carro.jpg'

const API = 'https://sistema-de-gestion-backend.onrender.com'

export default function RestablecerPorIdentidad() {
  const [step, setStep] = useState(1)
  const [cedula, setCedula] = useState('')
  const [fechaNac, setFechaNac] = useState('') // YYYY-MM-DD
  const [token, setToken] = useState(null)
  const [nuevaClave, setNuevaClave] = useState('')
  const [confirmClave, setConfirmClave] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [errors, setErrors] = useState({})

  const today = new Date().toISOString().split('T')[0]

  const clearMsgs = () => {
    setMsg(null)
    setErrors({})
  }

  const verificar = async (e) => {
    e.preventDefault()
    clearMsgs()
    const fieldErr = {}
    if (!cedula.trim()) fieldErr.cedula = 'Documento requerido'
    if (!fechaNac) fieldErr.fechaNac = 'Fecha de nacimiento requerida'
    else if (fechaNac > today) fieldErr.fechaNac = 'Fecha no puede ser futura'
    if (Object.keys(fieldErr).length) {
      setErrors(fieldErr)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/verificar-identidad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: cedula.trim(), fecha_nac: fechaNac }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.mensaje || 'No se pudo verificar')
      setToken(data.token)
      setStep(2)
      setMsg({ type: 'success', text: 'Identidad verificada. Introduce la nueva contraseña.' })
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Error de verificación' })
    } finally {
      setLoading(false)
    }
  }

  const cambiarContrasena = async (e) => {
    e.preventDefault()
    clearMsgs()
    const fieldErr = {}
    if (!nuevaClave || nuevaClave.length < 6) fieldErr.nuevaClave = 'Mínimo 6 caracteres'
    if (nuevaClave !== confirmClave) fieldErr.confirmClave = 'Contraseñas no coinciden'
    if (!token) fieldErr.token = 'Token no disponible. Repite verificación'
    if (Object.keys(fieldErr).length) {
      setErrors(fieldErr)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/restablecer/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaContrasena: nuevaClave }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.mensaje || 'Error al cambiar contraseña')
      setMsg({ type: 'success', text: 'Contraseña restablecida correctamente. Puedes iniciar sesión.' })
      setStep(3)
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Error al cambiar contraseña' })
    } finally {
      setLoading(false)
    }
  }

  return (
    // contenedor a pantalla completa con fondo y centrar contenido
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${imgBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <CCard style={{
        width: 520,
        maxWidth: '95%',
        borderRadius: 12,
        boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
        position: 'relative', // para posicionar el boton login dentro del formulario
        overflow: 'visible'
      }}>
        <CCardHeader style={{ background: 'linear-gradient(90deg,#ff8a65,#ff7043)', color: '#fff', fontWeight: 700 }}>
          Restablecer contraseña
          <div style={{ float: 'right', width: 160 }}>
            <CProgress value={step === 1 ? 33 : step === 2 ? 66 : 100} height="8px" color="light" />
          </div>
        </CCardHeader>

        <CCardBody style={{ padding: 22 }}>
          {msg && <CAlert color={msg.type} className="mb-3">{msg.text}</CAlert>}

          {step === 1 && (
            <CForm onSubmit={verificar}>
              <CRow className="mb-3">
                <CCol xs={12}>
                  <CFormLabel>Documento (cédula o pasaporte)</CFormLabel>
                  <CFormInput
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ej: 12345678 o AB12345"
                    invalid={!!errors.cedula}
                  />
                  {errors.cedula && <div className="text-danger small mt-1">{errors.cedula}</div>}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol xs={12}>
                  <CFormLabel>Fecha de nacimiento</CFormLabel>
                  <CFormInput
                    type="date"
                    value={fechaNac}
                    onChange={(e) => setFechaNac(e.target.value)}
                    max={today}
                    invalid={!!errors.fechaNac}
                  />
                  {errors.fechaNac && <div className="text-danger small mt-1">{errors.fechaNac}</div>}
                </CCol>
              </CRow>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap'
              }}>
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link to="/login"><CButton
                    size="sm"
                    color="light"
                    onClick={() => { setCedula(''); setFechaNac(''); setErrors({}); setMsg(null) }}
                    style={{ minWidth: 110, height: 38, borderRadius: 8 }}
                  >
                    Login
                  </CButton></Link>
                  <CButton
                    size="sm"
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: '#ff7043', borderColor: '#ff7043', color: '#fff', minWidth: 140, height: 38, borderRadius: 8 }}
                  >
                    {loading ? 'Verificando...' : 'Verificar identidad'}
                  </CButton>
                </div>
              </div>
            </CForm>
          )}

          {step === 2 && (
            <CForm onSubmit={cambiarContrasena}>
              <CRow className="mb-3">
                <CCol xs={12}>
                  <CFormLabel>Nueva contraseña</CFormLabel>
                  <CFormInput
                    type="password"
                    value={nuevaClave}
                    onChange={(e) => setNuevaClave(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    invalid={!!errors.nuevaClave}
                  />
                  {errors.nuevaClave && <div className="text-danger small mt-1">{errors.nuevaClave}</div>}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol xs={12}>
                  <CFormLabel>Confirmar contraseña</CFormLabel>
                  <CFormInput
                    type="password"
                    value={confirmClave}
                    onChange={(e) => setConfirmClave(e.target.value)}
                    invalid={!!errors.confirmClave}
                  />
                  {errors.confirmClave && <div className="text-danger small mt-1">{errors.confirmClave}</div>}
                </CCol>
              </CRow>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap'
              }}>
              
                <div style={{ display: 'flex', gap: 10 }}>
                  <CButton
                    size="sm"
                    color="light"
                    onClick={() => { setStep(1); setToken(null); setMsg(null); setErrors({}) }}
                    style={{ minWidth: 110, height: 38, borderRadius: 8 }}
                  >
                    Volver
                  </CButton>
                  <CButton
                    size="sm"
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: 'white', borderColor: '#ff7043', color: '#ff7043', minWidth: 140, height: 38, borderRadius: 8 }}
                  >
                    {loading ? 'Guardando...' : 'Cambiar contraseña'}
                  </CButton>
                </div>
              </div>
            </CForm>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <h4 style={{ marginBottom: 6 }}>¡Listo!</h4>
              <p className="small text-muted">La contraseña fue actualizada correctamente.</p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginTop: 12,
                flexWrap: 'wrap'
              }}>
                
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Link to = "/login">
                  <CButton onClick={() => { setStep(1); setCedula(''); setFechaNac(''); setToken(null); setMsg(null); setErrors({}) }} style={{ minWidth: 110, height: 38, borderRadius: 8, backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043' }}>
                    Login
                  </CButton>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}