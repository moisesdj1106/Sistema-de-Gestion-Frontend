import { useEffect, useState } from "react";
import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import { CIcon } from "@coreui/icons-react";
import { cilPrint, cilTrash } from "@coreui/icons";

export default function ReporteList() {
  const [reportes, setReportes] = useState([]);
  const [filteredReportes, setFilteredReportes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDireccion, setFilterDireccion] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reporteAEliminar, setReporteAEliminar] = useState(null);

  const itemsPerPage = 10;

  /* =========================
     CARGAR REPORTES
  ========================= */
  useEffect(() => {
    fetch("https://sistema-de-gestion-backend.onrender.com/reportes")
      .then((res) => res.json())
      .then((data) => {
        setReportes(data);
        setFilteredReportes(data);
      });
  }, []);

  /* =========================
     FILTROS
  ========================= */
  const filterReports = (searchValue, dateValue, direccionValue) => {
    let filtered = reportes;

    if (searchValue) {
      filtered = filtered.filter((r) =>
        r.RA_FOLIO_NUMERO.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (dateValue) {
      filtered = filtered.filter((r) => r.RA_FECHA === dateValue);
    }

    if (direccionValue) {
      filtered = filtered.filter((r) =>
        r.RA_DIRECCION.toLowerCase().includes(direccionValue.toLowerCase())
      );
    }

    setFilteredReportes(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    filterReports(v, filterDate, filterDireccion);
  };

  const handleDateFilter = (e) => {
    const v = e.target.value;
    setFilterDate(v);
    filterReports(search, v, filterDireccion);
  };

  const handleDireccionFilter = (e) => {
    const v = e.target.value;
    setFilterDireccion(v);
    filterReports(search, filterDate, v);
  };

  /* =========================
     ACCIONES
  ========================= */
  const imprimir = async (id) => {
    try {
      const res = await fetch(`https://sistema-de-gestion-backend.onrender.com/reportes/${id}/pdf`);
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob));
      setModalMessage("El PDF se generó correctamente.");
    } catch {
      setModalMessage("Error al generar el PDF.");
    } finally {
      setModalVisible(true);
    }
  };

  const abrirConfirmacion = (id) => {
    setReporteAEliminar(id);
    setConfirmVisible(true);
  };

  const confirmarEliminacion = async () => {
    try {
      const res = await fetch(
        `https://sistema-de-gestion-backend.onrender.com/reportes/${reporteAEliminar}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setFilteredReportes((prev) =>
          prev.filter((r) => r.RA_ID !== reporteAEliminar)
        );
        setModalMessage("Reporte eliminado correctamente.");
      } else {
        setModalMessage("Error al eliminar el reporte.");
      }
    } catch {
      setModalMessage("Error de conexión.");
    } finally {
      setConfirmVisible(false);
      setModalVisible(true);
    }
  };

  /* =========================
     FORMATO FECHA
  ========================= */
  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  /* =========================
     PAGINACIÓN
  ========================= */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReportes.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredReportes.length / itemsPerPage);

  return (
    <CRow className="justify-content-center">
      <CCol md={11}>
        <CCard>
          <CCardHeader className="text-center">
            <h3>Lista de Reportes</h3>
          </CCardHeader>

          <CCardBody>
            {/* FILTROS */}
            <CForm className="mb-4">
              <CRow>
                <CCol md={4}>
                  <CFormInput
                    placeholder="Buscar por folio"
                    value={search}
                    onChange={handleSearch}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    type="date"
                    value={filterDate}
                    onChange={handleDateFilter}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    placeholder="Buscar por dirección"
                    value={filterDireccion}
                    onChange={handleDireccionFilter}
                  />
                </CCol>
              </CRow>
            </CForm>

            {/* TABLA */}
            <CTable hover responsive align="middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell>Dirección</CTableHeaderCell>
                  <CTableHeaderCell>Folio</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">
                    Acciones
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {currentItems.map((r) => (
                  <CTableRow key={r.RA_ID}>
                    <CTableDataCell>{formatFecha(r.RA_FECHA)}</CTableDataCell>
                    <CTableDataCell>{r.RA_DIRECCION}</CTableDataCell>
                    <CTableDataCell>{r.RA_FOLIO_NUMERO}</CTableDataCell>
                    <CTableDataCell>
                      <CButtonGroup className="w-100">
                        <CButton
                          style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}}
                          size="sm"
                          className="w-50"
                          onClick={() => imprimir(r.RA_ID)}
                        >
                          <CIcon icon={cilPrint} className="me-1" />
                          PDF
                        </CButton>
                        <CButton
                         style={{backgroundColor:'white', color:'red', borderColor:'red'}}
                          size="sm"
                          className="w-50"
                          onClick={() => abrirConfirmacion(r.RA_ID)}
                        >
                          <CIcon icon={cilTrash} className="me-1" />
                          Eliminar
                        </CButton>
                      </CButtonGroup>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            {/* PAGINACIÓN */}
            <CPagination align="center" className="mt-3">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Anterior
              </CPaginationItem>

              {Array.from({ length: totalPages }, (_, i) => (
                <CPaginationItem
                  key={i}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </CPaginationItem>
              ))}

              <CPaginationItem
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Siguiente
              </CPaginationItem>
            </CPagination>
          </CCardBody>
        </CCard>
      </CCol>

      {/* MODAL INFO */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Información</CModalTitle>
        </CModalHeader>
        <CModalBody>{modalMessage}</CModalBody>
        <CModalFooter>
          <CButton onClick={() => setModalVisible(false)}>Cerrar</CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL CONFIRMACIÓN */}
      <CModal visible={confirmVisible} onClose={() => setConfirmVisible(false)}>
        <CModalHeader>
          <CModalTitle>Confirmar eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que deseas eliminar este reporte?
          <br />
          <strong>Esta acción no se puede deshacer.</strong>
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'gray', borderColor:'gray'}} onClick={() => setConfirmVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={confirmarEliminacion}>
            <CIcon icon={cilTrash} className="me-1" />
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
}
