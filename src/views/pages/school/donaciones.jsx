import React, { useEffect, useState, useRef } from 'react'
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
  const [fieldErrors, setFieldErrors] = useState({})
  const [busquedaDonante, setBusquedaDonante] = useState('') // Nuevo estado para filtro

  const firstInvalidRef = useRef(null)

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
    (d.TMA_NOMBRE || '').toLowerCase().includes(busquedaDonante.toLowerCase())
  )

  const sanitizeNumber = v => {
    // permite solo dígitos y evita números negativos
    const s = String(v ?? '').replace(/[^\d]/g, '')
    return s
  }

  const handleChange = e => {
    const { name, value } = e.target
    let val = value
    if (name === 'cantidad') val = sanitizeNumber(value)
    setForm(prev => ({ ...prev, [name]: val }))
    // validar en tiempo real solo ese campo
    const err = validateField(name, val)
    setFieldErrors(prev => ({ ...prev, [name]: err }))
    setMsg({ type: '', text: '' })
  }

  const validateField = (name, value) => {
    const v = String(value ?? '').trim()
    if (name === 'codont') {
      if (!v) return 'Seleccione un donante.'
    }
    if (name === 'coafec') {
      if (!v) return 'Seleccione una afectación.'
    }
    if (name === 'tipodo') {
      if (!v) return 'Seleccione tipo de donación.'
    }
    if (name === 'cantidad') {
      if (!v) return 'Cantidad obligatoria.'
      const n = Number(v)
      if (!Number.isFinite(n) || n <= 0) return 'Cantidad debe ser un número mayor que 0.'
      // ejemplo: limitar a 1e9 para evitar entradas absurdas
      if (n > 1e9) return 'Cantidad demasiado grande.'
    }
    if (name === 'fedona') {
      if (!v) return 'Fecha obligatoria.'
      if (v > maxFecha) return 'La fecha no puede ser futura.'
    }
    if (name === 'descri') {
      if (v.length > 500) return 'Descripción demasiado larga (máx 500 caracteres).'
    }
    return ''
  }

  const validateAll = () => {
    const fields = ['codont','coafec','tipodo','cantidad','fedona','descri']
    const errors = {}
    fields.forEach(f => {
      const err = validateField(f, form[f])
      if (err) errors[f] = err
    })
    setFieldErrors(errors)
    return errors
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    const errors = validateAll()
    const firstKey = Object.keys(errors)[0]
    if (firstKey) {
      // enfocar primer campo con error (intenta buscar elemento)
      setTimeout(() => {
        const el = document.querySelector(`[name="${firstKey}"]`)
        if (el) el.focus()
      }, 50)
      // mostrar mensajes concatenados
      const mensajes = Object.values(errors).filter(Boolean)
      setMsg({ type: 'danger', text: mensajes.join('\n') })
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
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMsg({ type: 'success', text: 'Donación registrada correctamente.' })
        setForm({ cantidad: '', fedona: '', coafec: '', codont: '', tipodo: '', descri: '' })
        setFieldErrors({})
      } else {
        // si la API devuelve errores por campo, mapearlos
        // se soportan varias formas: { errores: [{ campo, mensaje }...] } o { errores: { campo: mensaje } } o { mensaje: '...' }
        const fieldErrs = {}
        if (Array.isArray(data.errores)) {
          // array de strings o de objetos
          data.errores.forEach(it => {
            if (typeof it === 'string') {
              // intentar inferir campo
              if (/cedula|contacto|telefono|tel/i.test(it)) fieldErrs.codont = it
              else if (/fecha/i.test(it)) fieldErrs.fedona = it
              else if (/cantidad/i.test(it)) fieldErrs.cantidad = it
            } else if (it.campo && it.mensaje) {
              fieldErrs[it.campo] = it.mensaje
            }
          })
        } else if (data.errores && typeof data.errores === 'object') {
          Object.assign(fieldErrs, data.errores)
        } else if (data.mensaje) {
          // mensaje general
          setMsg({ type: 'danger', text: data.mensaje })
        }

        if (Object.keys(fieldErrs).length) {
          setFieldErrors(prev => ({ ...prev, ...fieldErrs }))
          const mensajes = Object.values(fieldErrs).filter(Boolean)
          setMsg({ type: 'danger', text: mensajes.join('\n') })
        } else if (!data.mensaje) {
          setMsg({ type: 'danger', text: 'Error al registrar. Revise los datos e intente de nuevo.' })
        }
      }
    } catch (err) {
      console.error(err)
      setMsg({ type: 'danger', text: 'Error de conexión. Intente más tarde.' })
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
                  {fieldErrors.codont && <div className="text-danger small mt-1">{fieldErrors.codont}</div>}
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
                  {fieldErrors.coafec && <div className="text-danger small mt-1">{fieldErrors.coafec}</div>}
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
                  {fieldErrors.tipodo && <div className="text-danger small mt-1">{fieldErrors.tipodo}</div>}
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
                  {fieldErrors.cantidad && <div className="text-danger small mt-1">{fieldErrors.cantidad}</div>}
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
                  {fieldErrors.fedona && <div className="text-danger small mt-1">{fieldErrors.fedona}</div>}
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    label="Descripción"
                    name="descri"
                    value={form.descri}
                    onChange={handleChange}
                    placeholder="Detalle de la donación (opcional)"
                  />
                  {fieldErrors.descri && <div className="text-danger small mt-1">{fieldErrors.descri}</div>}
                </CCol>
                <CCol xs={12}>
                  <CButton style={{backgroundColor:'#ff7043', color:'white'}} type="submit" className="w-100">Registrar Donación</CButton>
                </CCol>
              </CRow>
              {msg.text && (
                <CAlert color={msg.type} className="text-center mt-3" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</CAlert>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default RegistrarDonacion