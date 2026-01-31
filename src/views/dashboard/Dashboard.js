import React, { useEffect, useState } from 'react';
import {
  CCard, CCardBody, CCol, CRow, CCardHeader,
} from '@coreui/react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title, ChartDataLabels);

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetch('https://sistema-de-gestion-backend.onrender.com/dashboard')
      .then(res => res.json())
      .then(setDashboard);
  }, []);

  if (!dashboard) return <div>Cargando...</div>;

  const { resumen, desastresPorTipo, estadosSalud, perdidasPorTipo } = dashboard;

  // Gráfica de barras: cantidad de desastres por tipo
  const barData = {
    labels: desastresPorTipo.map(d => d.tipo),
    datasets: [
      {
        label: 'Cantidad de Afectaciones',
        data: desastresPorTipo.map(d => d.cantidad),
        backgroundColor: ['#0d6efd', '#ffc107', '#dc3545', '#20c997', '#6f42c1'],
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Cantidad de Afectaciones por Tipo' },
      datalabels: {
        color: 'white',
        font: { weight: 'bold' },
        formatter: (value) => value,
      },
    },
    scales: {
      y: { beginAtZero: true, stepSize: 1 },
    },
  };

  // Gráfica de barras: estados de salud de damnificados
  const estadosSaludBarData = {
    labels: estadosSalud.map(e => e.estado),
    datasets: [
      {
        label: 'Estados de Salud',
        data: estadosSalud.map(e => e.cantidad),
        backgroundColor: [
          '#dc3545', // rojo
          '#ffc107', // amarillo
          '#0d6efd', // azul
          '#20c997', // verde
          '#6f42c1', // morado
          '#fd7e14', // naranja
          '#343a40', // gris oscuro
        ],
        borderRadius: 8,
      },
    ],
  };

  const estadosSaludBarOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Estados de Salud de Damnificados' },
      datalabels: {
        color: 'white',
        font: { weight: 'bold' },
        formatter: (value) => value,
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Gráfica de barras: pérdidas por tipo
  const perdidasBarData = {
    labels: perdidasPorTipo.map(p => p.tipo),
    datasets: [
      {
        label: 'Pérdidas por Tipo',
        data: perdidasPorTipo.map(p => p.cantidad),
        backgroundColor: ['#0d6efd', '#ffc107', '#dc3545', '#20c997', '#6f42c1'],
        borderRadius: 8,
      },
    ],
  };

  const perdidasBarOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Pérdidas por Tipo' },
      datalabels: {
        color: 'white',
        font: { weight: 'bold' },
        formatter: (value) => value,
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="container-fluid py-4">
      <CRow className="mb-4">
        <CCol md={6}>
          <CCard className="text-center shadow">
            <CCardBody>
              <h5 className="text-danger mb-2">Fallecidos</h5>
              <div style={{ fontSize: 36, fontWeight: 'bold' }}>{resumen.fallecidos}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard className="text-center shadow">
            <CCardBody>
              <h5 className="text-primary mb-2">Afectación más frecuente</h5>
              <div style={{ fontSize: 32, fontWeight: 'bold' }}>{resumen.desastreMasFrecuente}</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={6} className="mb-4">
          <CCard className="shadow">
            <CCardHeader className="fw-bold">Afectaciones por Tipo</CCardHeader>
            <CCardBody>
              <Bar data={barData} options={barOptions} height={300} />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6} className="mb-4">
          <CCard className="shadow">
            <CCardHeader className="fw-bold">Estados de Salud</CCardHeader>
            <CCardBody>
              <Bar data={estadosSaludBarData} options={estadosSaludBarOptions} height={300} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={6} className="mb-4 mx-auto"> {/* Se agrega mx-auto para centrar la columna */}
          <CCard className="shadow">
            <CCardHeader className="fw-bold">Pérdidas por Tipo</CCardHeader>
            <CCardBody className="d-flex justify-content-center"> {/* Se centra el contenido dentro del cuerpo de la tarjeta */}
              <Bar data={perdidasBarData} options={perdidasBarOptions} height={300} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default Dashboard;