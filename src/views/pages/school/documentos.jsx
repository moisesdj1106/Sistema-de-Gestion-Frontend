import React, { useEffect, useState } from 'react';
import {
  CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CContainer, CFormInput
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';
/*const API = 'http://localhost:4000';*/


const ListarAfectaciones = () => {
  const [afectaciones, setAfectaciones] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [desastres, setDesastres] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  useEffect(() => {
    fetch(`${API}/afectaciones`)
      .then(res => res.json())
      .then(setAfectaciones);

    fetch(`${API}/comunidades/nombres`)
      .then(res => res.json())
      .then(setComunidades);

    fetch(`${API}/desastres/nombres`)
      .then(res => res.json())
      .then(setDesastres);
  }, []);

  const getComunidad = cod => comunidades.find(c => c.TMA_CODCOM === cod)?.TMA_NOMBRE || cod;
  const getDesastre = cod => desastres.find(d => d.TMA_CODESA === cod)?.TMA_NOMBRE || cod;

  const handleImprimir = (id) => {
    fetch(`${API}/afectaciones/${id}/pdf`, {
      method: 'GET'
    })
      .then(response => {
        if (!response.ok) throw new Error('No se pudo generar el PDF');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `afectacion_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Error al generar el PDF'));
  };

  // Filtrado por nombre de comunidad o desastre
  const afectacionesFiltradas = afectaciones.filter(a => {
    const comunidad = String(getComunidad(a.TTR_CODCOM)).toLowerCase();
    const desastre = String(getDesastre(a.TTR_CODESA)).toLowerCase();
    return (
      comunidad.includes(busqueda.toLowerCase()) ||
      desastre.includes(busqueda.toLowerCase())
    );
  });

  // Paginación
  const totalPaginas = Math.ceil(afectacionesFiltradas.length / porPagina);
  const afectacionesAMostrar = afectacionesFiltradas.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  // Resetear página si cambia el filtro
  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  return (
    <CContainer className="py-4">
      <CCard>
        <CCardHeader>
          <strong>Afectaciones registradas</strong>
        </CCardHeader>
        <CCardBody>
          <CFormInput
            placeholder="Buscar por comunidad o desastre..."
            className="mb-3"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <CTable align="middle" hover responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Comunidad</CTableHeaderCell>
                <CTableHeaderCell>Desastre</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {afectacionesAMostrar.map((a, idx) => (
                <CTableRow key={a.TTR_COAFEC}>
                  <CTableDataCell>{(pagina - 1) * porPagina + idx + 1}</CTableDataCell>
                  <CTableDataCell>{getComunidad(a.TTR_CODCOM)}</CTableDataCell>
                  <CTableDataCell>{getDesastre(a.TTR_CODESA)}</CTableDataCell>
                  <CTableDataCell>
                    {a.TTR_FEAFEC ? new Date(a.TTR_FEAFEC).toLocaleDateString('es-VE') : ''}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}}
                      size="sm"
                      onClick={() => handleImprimir(a.TTR_COAFEC)}
                    >
                      Imprimir PDF
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-4">
              <CButton
                style={{ marginRight: 8 }}
                color="secondary"
                variant="outline"
                disabled={pagina === 1}
                onClick={() => setPagina(pagina - 1)}
              >
                Anterior
              </CButton>
              {[...Array(totalPaginas)].map((_, idx) => (
                <CButton
                  key={idx}
                  color={pagina === idx + 1 ? "primary" : "secondary"}
                  variant={pagina === idx + 1 ? "solid" : "outline"}
                  style={{ margin: '0 4px' }}
                  onClick={() => setPagina(idx + 1)}
                >
                  {idx + 1}
                </CButton>
              ))}
              <CButton
                style={{ marginLeft: 8 }}
                color="secondary"
                variant="outline"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(pagina + 1)}
              >
                Siguiente
              </CButton>
            </div>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default ListarAfectaciones;