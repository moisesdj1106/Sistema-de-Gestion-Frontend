import React, { useState } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormCheck,
  CRow,
  CFormLabel,
  CAlert,
  CContainer,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from "@coreui/react";

export default function ReporteForm() {
  const [form, setForm] = useState({
    fecha: "",
    unidad_numero: "",
    folio_numero: "",
    direccion: "",
    hora_inicio_llamada: "",
    hora_activacion: "",
    hora_en_sitio: "",
    hora_culminacion: "",
    tipos_actividad: [],
    condicion: "",
    acciones_tomadas: [],
    danos: [],
    comision: [
      { posicion: "OPERADOR/DESPACHADOR", nombre: "", organismo: "INAPROCET" },
      { posicion: "JEFE DE COMISION", nombre: "", organismo: "INAPROCET" },
      { posicion: "CONDUCTOR", nombre: "", organismo: "INAPROCET" },
      { posicion: "AUXILIAR", nombre: "", organismo: "INAPROCET" },
      { posicion: "AUXILIAR", nombre: "", organismo: "INAPROCET" },
      { posicion: "AUXILIAR", nombre: "", organismo: "INAPROCET" }
    ],
    observaciones: "",
    elaborado_por: "",
    cargo: "",
    cedula_identidad: ""
  });

  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const toggleArray = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value]
    }));
  };

  const validateField = (field, value) => {
    const currentDate = new Date().toISOString().split("T")[0];
    let error = "";

    if (field === "fecha" && value > currentDate) {
      error = "La fecha no puede ser futura.";
    }

    setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
  };

  const handleChange = (field, value) => {
    validateField(field, value);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateComision = (index, field, value) => {
    setForm((prev) => {
      const updatedComision = [...prev.comision];
      updatedComision[index][field] = value;
      return { ...prev, comision: updatedComision };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fecha) newErrors.fecha = "La fecha es obligatoria.";
    if (!form.unidad_numero) newErrors.unidad_numero = "El número de unidad es obligatorio.";
    if (!form.folio_numero) newErrors.folio_numero = "El número de folio es obligatorio.";
    if (!form.direccion) newErrors.direccion = "La dirección es obligatoria.";
    if (!form.elaborado_por) newErrors.elaborado_por = "Elaborado por es obligatorio.";
    if (!form.cargo) newErrors.cargo = "El cargo es obligatorio.";
    if (!form.cedula_identidad) newErrors.cedula_identidad = "La cédula de identidad es obligatoria.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const guardar = async () => {
    if (!validateForm()) {
      setModalMessage("Por favor completa todos los campos obligatorios antes de guardar.");
      setModalVisible(true);
      return;
    }

    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
      setModalMessage("Por favor corrige los errores antes de guardar.");
      setModalVisible(true);
      return;
    }

    const formattedForm = {
      ...form,
      hora_inicio_llamada: form.hora_inicio_llamada ? form.hora_inicio_llamada.slice(0, 5) : null,
      hora_activacion: form.hora_activacion ? form.hora_activacion.slice(0, 5) : null,
      hora_en_sitio: form.hora_en_sitio ? form.hora_en_sitio.slice(0, 5) : null,
      hora_culminacion: form.hora_culminacion ? form.hora_culminacion.slice(0, 5) : null
    };

    await fetch("https://sistema-de-gestion-backend.onrender.com/reportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedForm)
    });

    setModalMessage("Reporte guardado correctamente.");
    setModalVisible(true);
  };

  const handleCedulaChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setForm((prev) => ({ ...prev, cedula_identidad: numericValue }));
  };

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={12}>
          <CCard>
            <CCardHeader className="text-center">
              <h2>Reporte de Actividades</h2>
            </CCardHeader>
            <CCardBody>
              <CForm>
                {errors.global && <CAlert color="danger">{errors.global}</CAlert>}
                <CRow className="mb-3">
                  <CCol md={4}>
                    <CFormLabel>Fecha</CFormLabel>
                    <CFormInput
                      type="date"
                      value={form.fecha}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleChange("fecha", e.target.value)}
                    />
                    {errors.fecha && <small className="text-danger">{errors.fecha}</small>}
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Unidad Nº</CFormLabel>
                    <CFormInput
                      placeholder="Unidad Nº"
                      value={form.unidad_numero}
                      onChange={(e) => handleChange("unidad_numero", e.target.value)}
                    />
                    {errors.unidad_numero && <small className="text-danger">{errors.unidad_numero}</small>}
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Folio Nº</CFormLabel>
                    <CFormInput
                      placeholder="Folio Nº"
                      value={form.folio_numero}
                      onChange={(e) => handleChange("folio_numero", e.target.value)}
                    />
                    {errors.folio_numero && <small className="text-danger">{errors.folio_numero}</small>}
                  </CCol>
                </CRow>
                <hr />
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Dirección</CFormLabel>
                    <CFormTextarea
                      placeholder="Dirección"
                      value={form.direccion}
                      onChange={(e) => handleChange("direccion", e.target.value)}
                      style={{ resize: "none", overflow: "auto", maxHeight: "150px" }}
                    />
                    {errors.direccion && <small className="text-danger">{errors.direccion}</small>}
                  </CCol>
                </CRow>
                <hr />
                <CRow className="mb-3">
                  <CCol md={3}>
                    <CFormLabel>Hora inicio de llamada</CFormLabel>
                    <CFormInput
                      type="time"
                      value={form.hora_inicio_llamada}
                      onChange={(e) => handleChange("hora_inicio_llamada", e.target.value)}
                    />
                    {errors.hora_inicio_llamada && (
                      <small className="text-danger">{errors.hora_inicio_llamada}</small>
                    )}
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel>Hora activación</CFormLabel>
                    <CFormInput
                      type="time"
                      value={form.hora_activacion}
                      onChange={(e) => handleChange("hora_activacion", e.target.value)}
                    />
                    {errors.hora_activacion && (
                      <small className="text-danger">{errors.hora_activacion}</small>
                    )}
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel>Hora en sitio</CFormLabel>
                    <CFormInput
                      type="time"
                      value={form.hora_en_sitio}
                      onChange={(e) => handleChange("hora_en_sitio", e.target.value)}
                    />
                    {errors.hora_en_sitio && (
                      <small className="text-danger">{errors.hora_en_sitio}</small>
                    )}
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel>Hora culminación</CFormLabel>
                    <CFormInput
                      type="time"
                      value={form.hora_culminacion}
                      onChange={(e) => handleChange("hora_culminacion", e.target.value)}
                    />
                    {errors.hora_culminacion && (
                      <small className="text-danger">{errors.hora_culminacion}</small>
                    )}
                  </CCol>
                </CRow>
                <hr />
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Tipo de Actividad</CFormLabel>
                    <CRow>
                      {[
                        "ACCIDENTE DE TRANSITO",
                        "MAT-PEL",
                        "TALA DE ARBOL",
                        "EMERGENCIAS MEDICAS",
                        "DETRESFA",
                        "BUSQUEDA",
                        "INCENDIO DE ESTRUCTURA",
                        "RECUPERACION DE CADAVER",
                        "POV",
                        "INCENDIO VEHICULAR",
                        "INSPECCION",
                        "EVENTO",
                        "INCENDIO FORESTAL",
                        "RESCATE DE PERSONA",
                        "OTROS"
                      ].map((t) => (
                        <CCol md={4} key={t}>
                          <CFormCheck
                            label={t}
                            checked={form.tipos_actividad.includes(t)}
                            onChange={() => toggleArray("tipos_actividad", t)}
                          />
                        </CCol>
                      ))}
                    </CRow>
                  </CCol>
                </CRow>
                <hr />
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Condición</CFormLabel>
                    <CRow>
                      {[
                        "NORMAL",
                        "URGENTE",
                        "EMERGENCIA",
                        "OTROS"
                      ].map((c) => (
                        <CCol md={3} key={c}>
                          <CFormCheck
                            type="radio"
                            name="condicion"
                            label={c}
                            checked={form.condicion === c}
                            onChange={() => setForm({ ...form, condicion: c })}
                          />
                        </CCol>
                      ))}
                    </CRow>
                  </CCol>
                </CRow>
                <hr />
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Acciones Tomadas</CFormLabel>
                    <CRow>
                      {[
                        "ELIMINACIÓN DE RIESGOS",
                        "ACORDONAMIENTO",
                        "ESTABILIZACIÓN DEL PACIENTE",
                        "INMOVILIZACIÓN DEL PACIENTE",
                        "OTROS"
                      ].map((a) => (
                        <CCol md={4} key={a}>
                          <CFormCheck
                            label={a}
                            checked={form.acciones_tomadas.includes(a)}
                            onChange={() => toggleArray("acciones_tomadas", a)}
                          />
                        </CCol>
                      ))}
                    </CRow>
                  </CCol>
                </CRow>
                <hr />
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Daños</CFormLabel>
                    <CRow>
                      {[
                        "ALUMBRADO PUBLICO",
                        "HIDRANTES",
                        "VIVIENDAS",
                        "PUENTES",
                        "VIAS COMUNICACION",
                        "VEHICULOS",
                        "INST PUB",
                        "INST PRIV",
                        "OTROS"
                      ].map((d) => (
                        <CCol md={4} key={d}>
                          <CFormCheck
                            label={d}
                            checked={form.danos.includes(d)}
                            onChange={() => toggleArray("danos", d)}
                          />
                        </CCol>
                      ))}
                    </CRow>
                  </CCol>
                </CRow>
                <hr />
                <CRow className="mb-3">
                  <CCol className="mt-4">
                    <CFormLabel>Comisión</CFormLabel>
                    {form.comision.map((c, i) => (
                      <CRow key={i} className="mb-3">
                        <CCol md={4}>
                          <CFormLabel>{c.posicion}</CFormLabel>
                        </CCol>
                        <CCol md={8}>
                          <CFormInput
                            placeholder="Nombre"
                            value={c.nombre}
                            onChange={(e) =>
                              updateComision(i, "nombre", e.target.value)
                            }
                          />
                        </CCol>
                      </CRow>
                    ))}
                  </CCol>
                </CRow>
                <hr />
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Observaciones</CFormLabel>
                    <CFormTextarea
                      value={form.observaciones}
                      onChange={(e) => handleChange("observaciones", e.target.value)}
                      style={{ resize: "none", overflow: "auto", maxHeight: "150px" }}
                    />
                  </CCol>
                </CRow>
                <hr />
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel>Elaborado por</CFormLabel>
                    <CFormInput
                      placeholder="Elaborado por"
                      value={form.elaborado_por}
                      onChange={(e) => handleChange("elaborado_por", e.target.value)}
                    />
                    {errors.elaborado_por && <small className="text-danger">{errors.elaborado_por}</small>}
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Cargo</CFormLabel>
                    <CFormInput
                      placeholder="Cargo"
                      value={form.cargo}
                      onChange={(e) => handleChange("cargo", e.target.value)}
                    />
                    {errors.cargo && <small className="text-danger">{errors.cargo}</small>}
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel>Cédula de identidad</CFormLabel>
                    <CFormInput
                      placeholder="Cédula de identidad"
                      maxLength={9}
                      minLength={7}
                      value={form.cedula_identidad}
                      onChange={(e) => handleCedulaChange(e.target.value)}
                    />
                    {errors.cedula_identidad && <small className="text-danger">{errors.cedula_identidad}</small>}
                  </CCol>
                </CRow>
                <CRow className="text-center">
                  <CCol>
                    <CButton style={{backgroundColor:'#ff7043', color:'white', borderColor:'#ff7043'}} onClick={guardar} className="mt-3">
                      Guardar
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Información</CModalTitle>
        </CModalHeader>
        <CModalBody>{modalMessage}</CModalBody>
        <CModalFooter>
          <CButton onClick={() => setModalVisible(false)}>Cerrar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
}
