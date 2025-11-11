import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CForm, CFormInput, CFormSelect, CButton, CAlert
} from '@coreui/react'

const API = 'https://sistema-de-gestion-backend.onrender.com'

const RegistrarDonacion = () => {
  const [donantes, setDonantes] = useState([])
  const [afectaciones, setAfectaciones] = useState([])
  const [tiposDonacion, setTiposDonacion] = useState([])
  const [form, setForm] = useState({
    cantidad: '',
    fedona: '',
    coafec: '',
    codont: '',
    tipodo: '',
    descri: ''
  })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [busquedaDonante, setBusquedaDonante] = useState('') // Nuevo estado para filtro

  useEffect(() => {
    fetch(`${API}/donantesregistrados`)
      .then(res => res.json())
      .then(setDonantes)
    fetch(`${API}/afectacion`)
      .then(res => res.json())
      .then(setAfectaciones)
    fetch(`${API}/tipos-estilo-donacion`)
      .then(res => res.json())
      .then(setTiposDonacion)
  }, [])

  const today = new Date();
  // corregir por desfase de zona horaria y obtener YYYY-MM-DD local
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  const maxFecha = localToday.toISOString().split('T')[0];

  // Filtrar donantes por nombre
  const donantesFiltrados = donantes.filter(d =>
    d.TMA_NOMBRE.toLowerCase().includes(busquedaDonante.toLowerCase())
  )

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    // validaciones básicas + fecha no futura
    if (!form.cantidad || !form.fedona || !form.coafec || !form.codont || !form.tipodo) {
      setMsg({ type: 'danger', text: 'Todos los campos son obligatorios.' })
      return
    }
    if (form.fedona > maxFecha) {
      setMsg({ type: 'danger', text: 'La fecha no puede ser futura.' })
      return
    }
    try {
      const res = await fetch(`${API}/donaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cantidad: Number(form.cantidad),
          codont: Number(form.codont),
          coafec: Number(form.coafec),
          tipodo: Number(form.tipodo)
        })
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ type: 'success', text: 'Donación registrada correctamente.' })
        setForm({ cantidad: '', fedona: '', coafec: '', codont: '', tipodo: '', descri: '' })
      } else {
        setMsg({ type: 'danger', text: data.mensaje || 'Error al registrar.' })
      }
    } catch {
      setMsg({ type: 'danger', text: 'Error de conexión.' })
    }
  }

  return (
    <CRow className="justify-content-center mt-4">
      <CCol xs={12} md={11} lg={10}>
        <CCard className="shadow">
          <CCardBody>
            <h4 className="mb-4 text-center">Registrar Donación</h4>
            <div className="mb-3 text-secondary">
              <strong>¿Cómo registrar una donación?</strong>
              <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                <li>Seleccione el donante y la afectación a la que va dirigida la donación.</li>
                <li>Elija el tipo de donación y complete la cantidad y fecha.</li>
                <li>Puede agregar una descripción si lo desea.</li>
                <li>Presione "Registrar Donación" para guardar.</li>
              </ul>
            </div>
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-3 align-items-end">
                <CCol md={4}>
                  {/* Filtro de búsqueda */}
                  <CFormInput
                    placeholder="Buscar donante por nombre..."
                    value={busquedaDonante}
                    onChange={e => setBusquedaDonante(e.target.value)}
                    className="mb-2"
                  />
                  <CFormSelect
                    label="Donante"
                    name="codont"
                    value={form.codont}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione donante</option>
                    {donantesFiltrados.map(d => (
                      <option key={d.TMA_CODONT} value={d.TMA_CODONT}>
                        {d.TMA_NOMBRE} - {d.TMA_CEDULA}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    label="Afectación"
                    name="coafec"
                    value={form.coafec}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione afectación</option>
                    {afectaciones.map(a => (
                      <option key={a.TTR_COAFEC} value={a.TTR_COAFEC}>
                         - {a.comunidad ? a.comunidad : ''}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    label="Tipo de Donación"
                    name="tipodo"
                    value={form.tipodo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione tipo de donación</option>
                    {tiposDonacion.map(t => (
                      <option key={t.TTR_ESTIDO} value={t.TTR_ESTIDO}>
                        {t.TTR_NOMBRE}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    label="Cantidad"
                    name="cantidad"
                    placeholder='Ejm 100'
                    type="number"
                    value={form.cantidad}
                    min={1}
                    onChange={handleChange}
                    required
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    label="Fecha de Donación"
                    name="fedona"
                    type="date"
                    value={form.fedona}
                    onChange={handleChange}
                    max={maxFecha}
                    required
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    label="Descripción"
                    name="descri"
                    value={form.descri}
                    onChange={handleChange}
                    placeholder="Detalle de la donación (opcional)"
                  />
                </CCol>
                <CCol xs={12}>
                  <CButton style={{backgroundColor:'#ff7043', color:'white'}} type="submit" className="w-100">Registrar Donación</CButton>
                </CCol>
              </CRow>
              {msg.text && (
                <CAlert color={msg.type} className="text-center mt-3">{msg.text}</CAlert>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default RegistrarDonacion