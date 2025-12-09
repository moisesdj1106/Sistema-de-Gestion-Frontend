import React, { useState } from 'react';

const API = 'https://sistema-de-gestion-backend.onrender.com';

export default function RestablecerPorIdentidad() {
  const [step, setStep] = useState(1);
  const [cedula, setCedula] = useState('');
  const [fechaNac, setFechaNac] = useState(''); // formato YYYY-MM-DD
  const [token, setToken] = useState(null);
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmClave, setConfirmClave] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const verificar = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/verificar-identidad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, fecha_nac: fechaNac })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error');
      setToken(data.token);
      setStep(2);
      setMsg('Identidad verificada. Introduce la nueva contraseña.');
    } catch (err) {
      setMsg(err.message || 'Error de verificación');
    } finally {
      setLoading(false);
    }
  };

  const cambiarContrasena = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!nuevaClave || nuevaClave.length < 6) return setMsg('La contraseña debe tener al menos 6 caracteres');
    if (nuevaClave !== confirmClave) return setMsg('Las contraseñas no coinciden');
    if (!token) return setMsg('Token no disponible');

    setLoading(true);
    try {
      const res = await fetch(`${API}/restablecer/${token}`, {
        method: 'POST', // coincide con el controlador restablecerContrasena que lee req.params.token
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaContrasena: nuevaClave })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al cambiar contraseña');
      setMsg('Contraseña restablecida correctamente. Puedes iniciar sesión.');
      setStep(3);
    } catch (err) {
      setMsg(err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {step === 1 && (
        <form onSubmit={verificar}>
          <h3>Verificar identidad</h3>
          <div>
            <label>Cédula / Documento</label>
            <input value={cedula} onChange={e => setCedula(e.target.value)} required />
          </div>
          <div>
            <label>Fecha de nacimiento</label>
            <input type="date" value={fechaNac} onChange={e => setFechaNac(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Verificando...' : 'Verificar'}</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={cambiarContrasena}>
          <h3>Introducir nueva contraseña</h3>
          <div>
            <label>Nueva contraseña</label>
            <input type="password" value={nuevaClave} onChange={e => setNuevaClave(e.target.value)} required />
          </div>
          <div>
            <label>Confirmar contraseña</label>
            <input type="password" value={confirmClave} onChange={e => setConfirmClave(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Cambiar contraseña'}</button>
        </form>
      )}

      {step === 3 && (
        <div>
          <h3>Listo</h3>
          <p>Contraseña cambiada correctamente.</p>
        </div>
      )}

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}