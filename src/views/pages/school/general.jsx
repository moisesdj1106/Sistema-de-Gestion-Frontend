import React, { useState } from 'react';
import {
  CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CContainer, CForm, CFormInput
} from '@coreui/react';

const API = 'http://localhost:4000';

const ResumenAfectacionesPorFecha = () => {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [afectaciones, setAfectaciones] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const buscar = async (e) => {
    e.preventDefault();
    if (!desde || !hasta) return;
    setBuscando(true);
    const res = await fetch(`${API}/afectaciones/resumen?desde=${desde}&hasta=${hasta}`);
    const data = await res.json();
    setAfectaciones(data);
    setBuscando(false);
  };

  return (
    <CContainer className="py-4 d-flex justify-content-center">
      <CCard style={{ maxWidth: 950, width: '100%', margin: '0 auto', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <CCardHeader className="text-center" style={{ background: '#f5f5f5', borderRadius: '18px 18px 0 0' }}>
          <strong>Resumen de Afectaciones por Rango de Fechas</strong>
        </CCardHeader>
        <CCardBody style={{textAlign:'center'}}>
          <CForm className="row g-3 mb-4 justify-content-center" onSubmit={buscar}>
            <div className="col-12 col-md-5">
              <CFormInput
                type="date"
                label="Desde"
                value={desde}
                onChange={e => setDesde(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-5">
              <CFormInput
                type="date"
                label="Hasta"
                value={hasta}
                onChange={e => setHasta(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-2 d-flex align-items-end">
              <CButton type="submit" color="primary" className="w-100" disabled={buscando}>
                {buscando ? 'Buscando...' : 'Buscar'}
              </CButton>
            </div>
          </CForm>
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
                    <CTableDataCell>
                      {a.tiene_damnificados ? 'Sí' : 'No'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {a.tiene_victimas ? 'Sí' : 'No'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {a.tiene_perdidas ? 'Sí' : 'No'}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
          <div className="d-flex justify-content-center mt-4">
            <CButton
              style={{ color:'white', borderColor:'#ff7043', backgroundColor:'#ff7043' }}
              disabled={!desde || !hasta}
              onClick={() => {
                window.open(`${API}/afectaciones/resumen/pdf?desde=${desde}&hasta=${hasta}`, '_blank');
              }}
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