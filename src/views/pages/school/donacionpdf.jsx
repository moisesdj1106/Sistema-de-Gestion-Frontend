// DescargarDonacionesPDF.jsx
import React, { useState } from 'react';
import { CCard, CCardBody, CForm, CFormLabel, CFormInput, CButton, CRow, CCol, CSpinner } from '@coreui/react';

const DescargarDonacionesPDF = () => {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [descargando, setDescargando] = useState(false);

  const handleDescargar = async (e) => {
    e.preventDefault();
    if (!desde || !hasta) {
      alert('Debes seleccionar ambas fechas');
      return;
    }
    setDescargando(true);
    try {
      const res = await fetch(`https://sistema-de-gestion-backend.onrender.com/donaciones/reporte/pdf?desde=${desde}&hasta=${hasta}`);
      if (!res.ok) throw new Error('Error al generar PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donaciones_${desde}_a_${hasta}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('No se pudo descargar el PDF');
    }
    setDescargando(false);
  };

  return (
    <CRow className="justify-content-center">
      <CCol xs={12} md={6}>
        <CCard>
          <CCardBody>
            <h4 className="mb-4">Descargar reporte de donaciones</h4>
            <CForm onSubmit={handleDescargar}>
              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Desde</CFormLabel>
                  <CFormInput type="date" value={desde} onChange={e => setDesde(e.target.value)} required />
                </CCol>
                <CCol>
                  <CFormLabel>Hasta</CFormLabel>
                  <CFormInput type="date" value={hasta} onChange={e => setHasta(e.target.value)} required />
                </CCol>
              </CRow>
              <CButton type="submit" color="primary" disabled={descargando}>
                {descargando ? <CSpinner size="sm" /> : 'Descargar PDF'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default DescargarDonacionesPDF;