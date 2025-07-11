import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CForm, CFormInput, CFormSelect, CButton, CAlert
} from '@coreui/react'

const API = 'http://localhost:4000'

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

  useEffect(() => {
    fetch(`${API}/documento`)
      .then(res => res.json())
      .then(setTiposDocumento)
    fetch(`${API}/tipos-donante`)
      .then(res => res.json())
      .then(setTiposDonante)
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    if (!form.nombre || !form.contac || !form.tipodn || !form.cedula || !form.coddoc) {
      setMsg({ type: 'danger', text: 'Todos los campos son obligatorios.' })
      return
    }
    try {
      const res = await fetch(`${API}/donantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ type: 'success', text: 'Donant registrado correctamente.' })
        setForm({ nombre: '', contac: '', tipodn: '', cedula: '', coddoc: '' })
      } else {
        setMsg({ type: 'danger', text: data.mensaje || 'Error al registrar.' })
      }
    } catch {
      setMsg({ type: 'danger', text: 'Error de conexión.' })
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
                    required
                  >
                    <option value="">Seleccione tipo</option>
                    {tiposDocumento.map(t => (
                      <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>
                        {t.TMA_NOMBRE}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="N° Documento"
                    name="cedula"
                    placeholder='Ejm 1234567'
                    value={form.cedula}
                    onChange={handleChange}
                    required
                  />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormSelect
                    label="Tipo de Donante"
                    name="tipodn"
                    value={form.tipodn}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione tipo</option>
                    {tiposDonante.map(t => (
                      <option key={t.TTR_TIPODN} value={t.TTR_TIPODN}>
                        {t.TTR_NOMBRE}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Contacto"
                    name="contac"
                    placeholder='Ejm 04147589857'
                    value={form.contac}
                    onChange={handleChange}
                    required
                  />
                </CCol>
                <CCol xs={12} md={6} className="d-flex align-items-end">
                  <CButton style={{backgroundColor:'#ff7043', color:'white'}} type="submit" className="w-100">Registrar</CButton>
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

export default RegistrarDonante