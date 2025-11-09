import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CForm, CFormInput, CFormSelect, CButton, CAlert
} from '@coreui/react'

const API = 'https://sistema-de-gestion-backend.onrender.com'

const RegistrarDonante = () => {
  const [tiposDocumento, setTiposDocumento] = useState([])
  const [tiposDonante, setTiposDonante] = useState([])
  const [form, setForm] = useState({
    nombre: '',
    contac: '',
    tipodn: '',
    cedula: '',
    coddoc: ''
  })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // regex helpers (coinciden con validaciones servidor)
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'\-]+$/
  const digitsRegex = /^\d+$/

  useEffect(() => {
    fetch(`${API}/documento`)
      .then(res => res.json())
      .then(setTiposDocumento)
      .catch(() => setTiposDocumento([]))

    fetch(`${API}/tipos-donante`)
      .then(res => res.json())
      .then(setTiposDonante)
      .catch(() => setTiposDonante([]))
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
    setMsg({ type: '', text: '' })
  }

  const validateClient = () => {
    const errors = []
    const fieldErr = {}

    if (!form.coddoc) {
      errors.push('Seleccione tipo de documento')
      fieldErr.coddoc = 'Requerido'
    }

    if (!form.cedula) {
      errors.push('Documento es obligatorio')
      fieldErr.cedula = 'Requerido'
    } else if (!digitsRegex.test(form.cedula)) {
      errors.push('Documento: solo dígitos')
      fieldErr.cedula = 'Solo dígitos'
    }

    if (!form.tipodn) {
      errors.push('Seleccione tipo de donante')
      fieldErr.tipodn = 'Requerido'
    }

    if (!form.nombre) {
      errors.push('Nombre es obligatorio')
      fieldErr.nombre = 'Requerido'
    } else if (!nameRegex.test(form.nombre)) {
      errors.push('Nombre inválido (solo letras y espacios)')
      fieldErr.nombre = 'Formato inválido'
    }

    if (!form.contac) {
      errors.push('Contacto es obligatorio')
      fieldErr.contac = 'Requerido'
    } else if (!digitsRegex.test(form.contac)) {
      errors.push('Contacto: solo dígitos')
      fieldErr.contac = 'Solo dígitos'
    }

    return { errors, fieldErr }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    setFieldErrors({})

    const { errors, fieldErr } = validateClient()
    if (errors.length) {
      setFieldErrors(fieldErr)
      setMsg({ type: 'danger', text: errors.join('\n') })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/donantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setMsg({ type: 'success', text: 'Donante registrado correctamente.' })
        setForm({ nombre: '', contac: '', tipodn: '', cedula: '', coddoc: '' })
        setFieldErrors({})
      } else if (res.status === 400 && (data.codigo === 'VALIDATION_ERROR' || Array.isArray(data.errores))) {
        // servidor devolvió lista de errores
        const mensajes = data.errores || [data.mensaje || 'Error de validación']
        // mapear algunos mensajes a campos
        const mapped = {}
        mensajes.forEach(m => {
          if (/cédula|cedula/i.test(m)) mapped.cedula = m
          if (/nombre/i.test(m)) mapped.nombre = m
          if (/contacto|contac/i.test(m)) mapped.contac = m
          if (/tipo de documento|documento/i.test(m)) mapped.coddoc = mapped.coddoc || m
        })
        setFieldErrors(mapped)
        setMsg({ type: 'danger', text: mensajes.join('\n') })
      } else if (res.status === 409) {
        // conflicto (ej. cédula duplicada)
        const detalles = data.detalles || [data.mensaje || 'Conflicto en datos']
        // mapear a campo si es posible
        const mapped = {}
        detalles.forEach(d => {
          if (/Cédula|cedula/i.test(d)) mapped.cedula = d
          if (/Usuario|usuario/i.test(d)) mapped.usuario = d
          if (/Correo|correo/i.test(d)) mapped.email = d
        })
        setFieldErrors(mapped)
        setMsg({ type: 'danger', text: detalles.join('\n') })
      } else {
        setMsg({ type: 'danger', text: data.mensaje || 'Error al registrar.' })
      }
    } catch (err) {
      setMsg({ type: 'danger', text: 'Error de conexión.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow className="justify-content-center mt-4">
      <CCol xs={12} md={8} lg={7}>
        <CCard className="shadow">
          <CCardBody>
            <h4 className="mb-4 text-center">Registrar Donante</h4>
            <div className="mb-3 text-secondary">
              <strong>¿Cómo registrar un donante?</strong>
              <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                <li>Seleccione el tipo de documento y escriba el número de identificación.</li>
                <li>Elija el tipo de donante (persona o institución).</li>
                <li>Complete el nombre y un contacto válido.</li>
                <li>Presione "Registrar" para guardar el donante.</li>
              </ul>
            </div>
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <CFormSelect
                    label="Tipo de Documento"
                    name="coddoc"
                    value={form.coddoc}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.coddoc}
                  >
                    <option value="">Seleccione tipo</option>
                    {tiposDocumento.map(t => (
                      <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>
                        {t.TMA_NOMBRE}
                      </option>
                    ))}
                  </CFormSelect>
                  {fieldErrors.coddoc && <div className="text-danger small mt-1">{fieldErrors.coddoc}</div>}
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="N° Documento"
                    name="cedula"
                    placeholder='Ejm 1234567'
                    value={form.cedula}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.cedula}
                  />
                  {fieldErrors.cedula && <div className="text-danger small mt-1">{fieldErrors.cedula}</div>}
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormSelect
                    label="Tipo de Donante"
                    name="tipodn"
                    value={form.tipodn}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.tipodn}
                  >
                    <option value="">Seleccione tipo</option>
                    {tiposDonante.map(t => (
                      <option key={t.TTR_TIPODN} value={t.TTR_TIPODN}>
                        {t.TTR_NOMBRE}
                      </option>
                    ))}
                  </CFormSelect>
                  {fieldErrors.tipodn && <div className="text-danger small mt-1">{fieldErrors.tipodn}</div>}
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.nombre}
                  />
                  {fieldErrors.nombre && <div className="text-danger small mt-1">{fieldErrors.nombre}</div>}
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Contacto"
                    name="contac"
                    placeholder='Ejm 04147589857'
                    value={form.contac}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.contac}
                  />
                  {fieldErrors.contac && <div className="text-danger small mt-1">{fieldErrors.contac}</div>}
                </CCol>
                <CCol xs={12} md={6} className="d-flex align-items-end">
                  <CButton disabled={loading} style={{backgroundColor:'#ff7043', color:'white'}} type="submit" className="w-100">
                    {loading ? 'Registrando...' : 'Registrar'}
                  </CButton>
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

export default RegistrarDonante