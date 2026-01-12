import React, { useState } from 'react';
import {
  CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CContainer, CForm, CFormInput, CAlert
} from '@coreui/react';

/*const API = 'http://localhost:4000';*/
const API = 'https://sistema-de-gestion-backend.onrender.com';

const ResumenAfectacionesPorFecha = () => {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [afectaciones, setAfectaciones] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [errors, setErrors] = useState({ desde: '', hasta: '', rango: '' });
  const [fetchError, setFetchError] = useState('');

  // fecha máxima local YYYY-MM-DD (evita desfase UTC)
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  const maxFechaLocal = localToday.toISOString().split('T')[0];

  const validateField = (name, value, otherValue) => {
    let msg = '';
    if (!value) {
      msg = 'Fecha obligatoria';
    } else if (value > maxFechaLocal) {
      msg = 'Fecha no puede ser futura';
    }
    // validar rango solo si ambos existen
    if (!msg && name === 'desde' && otherValue) {
      if (value > otherValue) msg = 'Desde no puede ser mayor que Hasta';
    }
    if (!msg && name === 'hasta' && otherValue) {
      if (otherValue > value) msg = 'Hasta no puede ser menor que Desde';
    }
    return msg;
  };

  const handleDesdeChange = (e) => {
    const v = e.target.value;
    setDesde(v);
    const msgDesde = validateField('desde', v, hasta);
    const msgHasta = hasta ? validateField('hasta', hasta, v) : errors.hasta;
    setErrors({ ...errors, desde: msgDesde, hasta: msgHasta, rango: (msgDesde || msgHasta) ? 'Corrija las fechas' : '' });
  };

  const handleHastaChange = (e) => {
    const v = e.target.value;
    setHasta(v);
    const msgHasta = validateField('hasta', v, desde);
    const msgDesde = desde ? validateField('desde', desde, v) : errors.desde;
    setErrors({ ...errors, hasta: msgHasta, desde: msgDesde, rango: (msgDesde || msgHasta) ? 'Corrija las fechas' : '' });
  };

  const buscar = async (e) => {
    e.preventDefault();
    setFetchError('');
    // validación final
    const vDesde = validateField('desde', desde, hasta);
    const vHasta = validateField('hasta', hasta, desde);
    if (vDesde || vHasta) {
      setErrors({ desde: vDesde, hasta: vHasta, rango: 'Corrija las fechas antes de buscar' });
      return;
    }
    setErrors({ desde: '', hasta: '', rango: '' });
    setBuscando(true);
    try {
      const res = await fetch(`${API}/afectaciones/resumen?desde=${desde}&hasta=${hasta}`);
      if (!res.ok) throw new Error('Error en la petición');
      const data = await res.json();
      setAfectaciones(data || []);
    } catch (err) {
      console.error(err);
      setFetchError('Error al obtener resultados. Intente nuevamente.');
    } finally {
      setBuscando(false);
    }
  };

  const canDownload = desde && hasta && !errors.desde && !errors.hasta && !errors.rango;

  return (
    <CContainer className="py-4 d-flex justify-content-center">
      <CCard style={{ maxWidth: 950, width: '100%', margin: '0 auto', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <CCardHeader className="text-center" style={{ background: '#f5f5f5', borderRadius: '18px 18px 0 0' }}>
          <strong>Resumen de Afectaciones por Rango de Fechas</strong>
        </CCardHeader>
        <CCardBody style={{ textAlign: 'center' }}>
          <CForm className="row g-3 mb-4 justify-content-center" onSubmit={buscar}>
            <div className="col-12 col-md-5">
              <CFormInput
                type="date"
                label="Desde"
                value={desde}
                onChange={handleDesdeChange}
                required
                max={maxFechaLocal}
              />
              {errors.desde && <div className="text-danger small mt-1">{errors.desde}</div>}
            </div>
            <div className="col-12 col-md-5">
              <CFormInput
                type="date"
                label="Hasta"
                value={hasta}
                onChange={handleHastaChange}
                required
                max={maxFechaLocal}
              />
              {errors.hasta && <div className="text-danger small mt-1">{errors.hasta}</div>}
            </div>
            <div className="col-12 col-md-2 d-flex align-items-end">
              <CButton type="submit" color="primary" className="w-100" disabled={buscando || !!errors.desde || !!errors.hasta}>
                {buscando ? 'Buscando...' : 'Buscar'}
              </CButton>
            </div>
            {errors.rango && <div className="col-12 text-center"><div className="text-danger small">{errors.rango}</div></div>}
          </CForm>

          {fetchError && <CAlert color="danger">{fetchError}</CAlert>}

          <div style={{ overflowX: 'auto' }}>
            <CTable align="middle" hover responsive bordered small>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Comunidad</CTableHeaderCell>
                  <CTableHeaderCell>Desastre</CTableHeaderCell>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell>¿Damnificados?</CTableHeaderCell>
                  <CTableHeaderCell>¿Víctimas?</CTableHeaderCell>
                  <CTableHeaderCell>¿Pérdidas?</CTableHeaderCell>
                  <CTableHeaderCell>¿Afectados?</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {afectaciones.map((a, idx) => (
                  <CTableRow key={a.TTR_COAFEC}>
                    <CTableDataCell>{idx + 1}</CTableDataCell>
                    <CTableDataCell>{a.comunidad}</CTableDataCell>
                    <CTableDataCell>{a.desastre}</CTableDataCell>
                    <CTableDataCell>
                      {a.TTR_FEAFEC ? new Date(a.TTR_FEAFEC).toLocaleDateString('es-VE') : ''}
                    </CTableDataCell>
                    <CTableDataCell>{a.tiene_damnificados ? 'Sí' : 'No'}</CTableDataCell>
                    <CTableDataCell>{a.tiene_victimas ? 'Sí' : 'No'}</CTableDataCell>
                    <CTableDataCell>{a.tiene_perdidas ? 'Sí' : 'No'}</CTableDataCell>
                    <CTableDataCell>{a.tiene_afectados ? 'Sí' : 'No'}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <CButton
              style={{ color: 'white', borderColor: '#ff7043', backgroundColor: '#ff7043' }}
              disabled={!canDownload}
              onClick={() => { window.open(`${API}/afectaciones/resumen/pdf?desde=${desde}&hasta=${hasta}`, '_blank'); }}
            >
              Descargar PDF
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default ResumenAfectacionesPorFecha;