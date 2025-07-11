import React, { useState } from "react";
import {
  CCard, CCardBody, CCardHeader, CForm, CFormInput, CFormLabel, CFormTextarea, CFormSelect, CButton, CCol, CRow, CAlert
} from "@coreui/react";

// Simulación de desastres que vendrían de la base de datos
const desastresDB = [
  "Inundación",
  "Deslizamiento",
  "Incendio",
  "Sismo"
];

const Suceso = () => {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    imagen: null,
    fuente: "",
    desastre: ""
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  // Validación de campos
  const validate = () => {
    const newErrors = {};
    if (!form.titulo.trim()) newErrors.titulo = "Título requerido";
    if (!form.descripcion.trim()) newErrors.descripcion = "Descripción requerida";
    if (!form.fecha) newErrors.fecha = "Fecha requerida";
    if (!form.imagen) newErrors.imagen = "Imagen requerida";
    if (!form.fuente.trim()) newErrors.fuente = "Fuente requerida";
    if (!form.desastre) newErrors.desastre = "Seleccione un desastre";
    return newErrors;
  };

  // Manejo de cambios
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      const file = files[0];
      setForm({ ...form, imagen: file });
      setErrors({ ...errors, imagen: undefined });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setForm({ ...form, [name]: value });
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = validate();
    if (Object.keys(val).length) {
      setErrors(val);
      return;
    }
    
    setForm({
      titulo: "",
      descripcion: "",
      fecha: "",
      imagen: null,
      fuente: "",
      desastre: ""
    });
    setPreview(null);
    setErrors({});
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "90vh", marginBottom: "50px" }}>
      <CCard className="shadow-lg w-100" style={{ maxWidth: 600 }}>
        <CCardHeader className="bg-info text-white text-center">
          <h4 className="mb-0">Registrar Suceso</h4>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit} autoComplete="off">
            <CCol className="mb-3">
              <CFormLabel>Título</CFormLabel>
              <CFormInput
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                maxLength={60}
                placeholder="Título del suceso"
                invalid={!!errors.titulo}
                required
              />
              {errors.titulo && <CAlert color="danger" className="py-1 my-1">{errors.titulo}</CAlert>}
            </CCol>
            <CCol className="mb-3">
              <CFormLabel>Descripción</CFormLabel>
              <CFormTextarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                maxLength={300}
                placeholder="Describa el suceso"
                invalid={!!errors.descripcion}
                required
                rows={4}
              />
              {errors.descripcion && <CAlert color="danger" className="py-1 my-1">{errors.descripcion}</CAlert>}
            </CCol>
            <CCol className="mb-3">
              <CFormLabel>Fecha</CFormLabel>
              <CFormInput
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                invalid={!!errors.fecha}
                required
              />
              {errors.fecha && <CAlert color="danger" className="py-1 my-1">{errors.fecha}</CAlert>}
            </CCol>
            <CCol className="mb-3">
              <CFormLabel>Imagen</CFormLabel>
              <CFormInput
                type="file"
                name="imagen"
                accept="image/*"
                onChange={handleChange}
                invalid={!!errors.imagen}
                required
              />
              {preview && (
                <div className="mt-2 text-center">
                  <img src={preview} alt="Vista previa" style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8 }} />
                </div>
              )}
              {errors.imagen && <CAlert color="danger" className="py-1 my-1">{errors.imagen}</CAlert>}
            </CCol>
            <CCol className="mb-3">
              <CFormLabel>Fuente</CFormLabel>
              <CFormInput
                name="fuente"
                value={form.fuente}
                onChange={handleChange}
                maxLength={80}
                placeholder="Ej: Diario local, testigo, etc."
                invalid={!!errors.fuente}
                required
              />
              {errors.fuente && <CAlert color="danger" className="py-1 my-1">{errors.fuente}</CAlert>}
            </CCol>
            <CCol className="mb-3">
              <CFormLabel>Desastre</CFormLabel>
              <CFormSelect
                name="desastre"
                value={form.desastre}
                onChange={handleChange}
                invalid={!!errors.desastre}
                required
              >
                <option value="">Seleccione un desastre...</option>
                {desastresDB.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </CFormSelect>
              {errors.desastre && <CAlert color="danger" className="py-1 my-1">{errors.desastre}</CAlert>}
            </CCol>
            <CRow className="mt-4">
              <CCol className="d-flex justify-content-center">
                <CButton color="info text-white" type="submit">
                  Registrar Suceso
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default Suceso;