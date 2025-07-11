import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCol, CRow, CCardHeader,
} from '@coreui/react'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, ChartDataLabels)

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    fetch('https://sistema-de-gestion-backend.onrender.com/dashboard')
      .then(res => res.json())
      .then(setDashboard)
  }, [])

  if (!dashboard) return <div>Cargando...</div>

  const { resumen, desastresPorTipo, estadosSalud, perdidasPorTipo } = dashboard

  // Gráfica de barras: cantidad de desastres por tipo
  const barData = {
    labels: desastresPorTipo.map(d => d.tipo),
    datasets: [
      {
        label: 'Cantidad de Desastres',
        data: desastresPorTipo.map(d => d.cantidad),
        backgroundColor: ['#0d6efd', '#ffc107', '#dc3545', '#20c997', '#6f42c1'],
        borderRadius: 8,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Cantidad de Desastres por Tipo' },
    },
    scales: {
      y: { beginAtZero: true, stepSize: 1 },
    },
  }

  // Gráfica de torta: estados de salud de damnificados + víctimas fatales
  const totalEstados = estadosSalud.reduce((acc, e) => acc + e.cantidad, 0)
  const estadosSaludPieData = {
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
          '#343a40', // gris oscuro para "Fallecidos" si quieres
        ],
      },
    ],
  }

  const estadosSaludPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Estados de Salud de Damnificados y Fallecidos' },
      datalabels: {
        color: 'white',
        font: { weight: 'bold' },
        formatter: (value, context) => {
          const percent = totalEstados ? (value / totalEstados * 100) : 0
          return percent > 0 ? percent.toFixed(1) + '%' : ''
        }
      }
    },
  }

  // Gráfica de torta: pérdidas por tipo
  const totalPerdidas = perdidasPorTipo.reduce((acc, d) => acc + d.cantidad, 0)
  const perdidasPieData = {
    labels: perdidasPorTipo.map(d => d.tipo),
    datasets: [
      {
        label: 'Pérdidas por tipo',
        data: perdidasPorTipo.map(d => d.cantidad),
        backgroundColor: [
          '#0d6efd',
          '#20c997',
          '#ffc107',
          '#dc3545',
          '#6f42c1'
        ],
      },
    ],
  }

  const perdidasPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Pérdidas por Tipo' },
      datalabels: {
        color: 'white',
        font: { weight: 'bold' },
        formatter: (value, context) => {
          const percent = totalPerdidas ? (value / totalPerdidas * 100) : 0
          return percent > 0 ? percent.toFixed(1) + '%' : ''
        }
      }
    },
  }

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
              <h5 className="text-primary mb-2">Desastre más frecuente</h5>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{resumen.desastreMasFrecuente}</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={6} className="mb-4">
          <CCard className="shadow">
            <CCardHeader className="fw-bold">Desastres por Tipo</CCardHeader>
            <CCardBody>
              <Bar data={barData} options={barOptions} height={300} />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6} className="mb-4">
          <CCard className="shadow">
            <CCardHeader className="fw-bold">Estados de Salud de Damnificados y Fallecidos</CCardHeader>
            <CCardBody>
              <div style={{ width: 300, height: 300, margin: "0 auto"}}>
                <Pie data={estadosSaludPieData} options={estadosSaludPieOptions} plugins={[ChartDataLabels]} />
              </div>
              <div style={{ width: 300, height: 300, margin: "20px auto 0 auto" }}>
                <Pie data={perdidasPieData} options={perdidasPieOptions} plugins={[ChartDataLabels]} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard