import React, { useEffect, useState } from 'react';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle } from '@coreui/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const API = 'https://sistema-de-gestion-backend.onrender.com';
/*const API = 'http://localhost:4000';*/

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png", // icono de ubicación genérico
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const ZonasAfectadasMapa = () => {
  const [zonas, setZonas] = useState([]);

  useEffect(() => {
    fetch(`${API}/zonas-afectadas`)
      .then(res => res.json())
      .then(setZonas);
  }, []);

  // Para la gráfica (solo cuenta cuántas veces aparece cada comunidad)
  const zonasPorNombre = zonas.reduce((acc, z) => {
    acc[z.nombre] = (acc[z.nombre] || 0) + 1;
    return acc;
  }, {});
  const labels = Object.keys(zonasPorNombre);
  const data = {
    labels,
    datasets: [
      {
        label: "Cantidad de afectaciones",
        data: labels.map(l => zonasPorNombre[l]),
        backgroundColor: "#007bff",
        borderRadius: 8,
      }
    ]
  };
  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Zonas afectadas (cantidad de eventos)" }
    }
  };

  return (
    <CContainer className="mt-4">
      <CRow className="justify-content-center">
        <CCol md={6}>
          <CCard>
            <CCardBody>
              <CCardTitle className="fs-5 fw-bold mb-3">🗺️ Mapa de Zonas Afectadas</CCardTitle>
              <MapContainer center={[7.766, -72.225]} zoom={12} style={{ height: "350px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {zonas.map((z, idx) => (
                  <Marker key={idx} position={[parseFloat(z.lat), parseFloat(z.lng)]} icon={customIcon}>
                    <Popup>
                      <strong>{z.nombre}</strong>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard>
            <CCardBody>
              <CCardTitle className="fs-5 fw-bold mb-3">📊 Gráfica de Zonas Afectadas</CCardTitle>
              <div style={{ height: 350 }}>
                <Bar data={data} options={options} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ZonasAfectadasMapa;