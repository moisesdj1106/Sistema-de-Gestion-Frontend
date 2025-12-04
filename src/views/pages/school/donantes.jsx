import React, { useEffect, useState, useRef } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CForm, CFormInput, CFormSelect, CButton, CAlert
} from '@coreui/react'

const API = 'https://sistema-de-gestion-backend.onrender.com';
/*const API = 'http://localhost:4000'*/

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

  const cedulaRef = useRef(null)
  const tipodnRef = useRef(null)
  const nombreRef = useRef(null)
  const contacRef = useRef(null)
  const submitRef = useRef(null)

 
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'\-]+$/
  const digitsOnly = /^\d+$/
  const passportRegex = /^[A-Za-z0-9\-]{6,15}$/ // permite letras/números/guion para pasaporte
  const allowedPhonePrefixes = ['0412', '0414', '0416', '0424', '0426'] // prefijos válidos

  const getDocNameById = (id) =>
    tiposDocumento && tiposDocumento.length
      ? tiposDocumento.find((t) => String(t.TMA_CODDOC) === String(id))?.TMA_NOMBRE || ''
      : ''


  const isPassportType = (id) => {
    const idStr = String(id || '').trim().toUpperCase()
    if (idStr === 'P' || idStr === '3' || idStr === '03') return true
    const name = getDocNameById(id) || ''
    return /pasap|pasaporte/i.test(name)
  }


  const validateCedulaField = (value, coddoc) => {
    // normalizar coddoc
    const cod = String(coddoc || '').trim()
    // detectar pasaporte por tipo seleccionado o, como respaldo, por la presencia de letras en el valor
    const passportByType = isPassportType(cod)
    const passportByValue = /[A-Za-z]/.test(String(value || ''))
    const passport = passportByType || passportByValue

    if (!cod && !passportByValue) return 'Seleccione tipo de documento'

    if (passport) {
      if (!value) return 'Número de pasaporte requerido'
      if (!passportRegex.test(value)) return 'Formato inválido (letras y números, y guion)'
      if (value.startsWith('-') || value.endsWith('-')) return 'Guion no puede estar al inicio o final'
      if (/--/.test(value)) return 'Guiones consecutivos no permitidos'
      return ''
    } else {
      if (!value) return 'Documento es obligatorio'
      if (!digitsOnly.test(value)) return 'Solo dígitos'
      if (value.length < 7 || value.length > 9) return '7-9 dígitos'
      return ''
    }
  }

  // valida teléfono en tiempo real (prefijo + 11 dígitos)
  const validatePhoneField = (value) => {
    if (!value) return 'Contacto es obligatorio'
    if (!digitsOnly.test(value)) return 'Solo dígitos'
    if (value.length !== 11) return 'Debe tener 11 dígitos'
    const pref = value.slice(0, 4)
    if (!allowedPhonePrefixes.includes(pref)) return `Prefijo inválido (${allowedPhonePrefixes.join(', ')})`
    return ''
  }

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
    // Si cambia el tipo de documento, actualizar y revalidar la cédula según el nuevo tipo
    if (name === 'coddoc') {
      const newCoddoc = value
      setForm(prev => ({ ...prev, coddoc: newCoddoc }))
      // revalidar cedula actual con el nuevo coddoc
      const cedErr = validateCedulaField(form.cedula, newCoddoc)
      setFieldErrors(prev => ({ ...prev, coddoc: '', cedula: cedErr }))
      setMsg({ type: '', text: '' })
      return
    }

    setForm(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
    setMsg({ type: '', text: '' })
    // validación en directo para algunos campos
    if (name === 'nombre') {
      if (value && !nameRegex.test(value)) setFieldErrors(prev => ({ ...prev, nombre: 'Formato inválido' }))
    }
    if (name === 'contac') {
      const phoneErr = value ? validatePhoneField(value) : ''
      setFieldErrors(prev => ({ ...prev, contac: phoneErr }))
    }
  }

  // helpers de sanitización en tiempo real
  const handleCedulaChange = (e) => {
    let value = e.target.value
    // obtener el tipo de documento más actualizado (select o estado en form)
    const selectCoddoc = document.querySelector('select[name="coddoc"]')?.value
    const coddoc = String(selectCoddoc || form.coddoc || '')
    if (isPassportType(coddoc)) {
      // permitir letras y números y guion; mantener mayúsculas para pasaporte
      value = value.replace(/[^A-Za-z0-9\-]/g, '').toUpperCase()
      if (value.length > 15) value = value.slice(0, 15)
    } else {
      // solo dígitos para cédula venezolana
      value = value.replace(/\D/g, '')
      if (value.length > 9) value = value.slice(0, 9)
    }
    setForm(prev => ({ ...prev, cedula: value }))
    const cedErr = validateCedulaField(value, coddoc)
    setFieldErrors(prev => ({ ...prev, cedula: cedErr }))
    setMsg({ type: '', text: '' })
  }

  const handleNombreChange = (e) => {
    // solo letras, espacios, guiones y apóstrofe, incluyendo tildes y ñ
    const value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'\-]/g, '')
    setForm(prev => ({ ...prev, nombre: value }))
    // validación en directo
    setFieldErrors(prev => ({ ...prev, nombre: value && !nameRegex.test(value) ? 'Formato inválido' : '' }))
    setMsg({ type: '', text: '' })
  }

  const handleContactoChange = (e) => {
    let value = e.target.value.replace(/\D/g, '') // solo dígitos
    if (value.length > 11) value = value.slice(0, 11)
    setForm(prev => ({ ...prev, contac: value }))
    // validación en tiempo real para prefijo y longitud
    const phoneErr = value ? validatePhoneField(value) : ''
    setFieldErrors(prev => ({ ...prev, contac: phoneErr }))
    setMsg({ type: '', text: '' })
  }

  const handleEnter = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (nextRef && nextRef.current) nextRef.current.focus()
    }
  }

  const validateClient = () => {
    const errors = []
    const fieldErr = {}

    if (!form.coddoc) {
      errors.push('Seleccione tipo de documento')
      fieldErr.coddoc = 'Requerido'
    }

    const cedulaError = validateCedulaField(form.cedula, form.coddoc)
    if (cedulaError) {
      errors.push(cedulaError)
      fieldErr.cedula = cedulaError
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

    const phoneError = validatePhoneField(form.contac)
    if (phoneError) {
      errors.push(phoneError)
      fieldErr.contac = phoneError
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
                    type="text"
                    placeholder={isPassportType(form.coddoc) ? 'Ejm AB12345' : 'Ejm 1234567'}
                    value={form.cedula}
                    onChange={handleCedulaChange}
                    ref={cedulaRef}
                    onKeyDown={e => handleEnter(e, tipodnRef)}
                    aria-invalid={!!fieldErrors.cedula}
                    title={isPassportType(form.coddoc) ? 'Pasaporte: letras y números (4-15)' : 'Solo números (7-9 dígitos)'}
                    maxLength={isPassportType(form.coddoc) ? 15 : 9}
                    autoComplete="off"
                  />
                  {fieldErrors.cedula && <div className="text-danger small mt-1">{fieldErrors.cedula}</div>}
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormSelect
                    label="Tipo de Donante"
                    name="tipodn"
                    value={form.tipodn}
                    onChange={handleChange}
                    ref={tipodnRef}
                    onKeyDown={e => handleEnter(e, nombreRef)}
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
                    onChange={handleNombreChange}
                    ref={nombreRef}
                    onKeyDown={e => handleEnter(e, contacRef)}
                    aria-invalid={!!fieldErrors.nombre}
                    pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'\-]+$"
                    title="Solo letras y espacios"
                  />
                  {fieldErrors.nombre && <div className="text-danger small mt-1">{fieldErrors.nombre}</div>}
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Contacto"
                    name="contac"
                    placeholder='Ejm 04141234567'
                    value={form.contac}
                    onChange={handleContactoChange}
                    inputMode="numeric"
                    pattern="\d*"
                    ref={contacRef}
                    onKeyDown={e => handleEnter(e, submitRef)}
                    aria-invalid={!!fieldErrors.contac}
                    title="Solo números (11 dígitos)"
                    maxLength={11}
                  />
                  {fieldErrors.contac && <div className="text-danger small mt-1">{fieldErrors.contac}</div>}
                </CCol>
                <CCol xs={12} md={6} className="d-flex align-items-end">
                  <CButton disabled={loading} style={{backgroundColor:'#ff7043', color:'white'}} type="submit" className="w-100" ref={submitRef}>
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