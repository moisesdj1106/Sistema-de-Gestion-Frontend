import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
  CSpinner,
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormSelect,
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';

const ListarAfectados = () => {
  const [afectados, setAfectados] = useState([]);
  const [afectaciones, setAfectaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [selectedAfectado, setSelectedAfectado] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    TTR_TIPODO: '',
    TTR_CEDULA: '',
    TTR_NOMBRE: '',
    TTR_APELLI: '',
    TTR_TELEFO: '',
    TTR_COAFEC: '',
  });

  const [errors, setErrors] = useState({});


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resA, resF] = await Promise.all([
          fetch(`${API}/afectados`),
          fetch(`${API}/afectacion`),
        ]);

        if (!resA.ok || !resF.ok) throw new Error('Error al cargar datos');

        setAfectados(await resA.json());
        setAfectaciones(await resF.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const getComunidad = (coafec) => {
    const af = afectaciones.find((a) => String(a.TTR_COAFEC) === String(coafec));
    return af ? af.comunidad : 'N/A';
  };

  const mostrarTipoDocumento = (tipo) => {
    switch (String(tipo)) {
      case '1':
        return 'V';
      case '2':
        return 'E';
      case '3':
        return 'P';
      case 'V':
      case 'E':
      case 'P':
        return tipo;
      default:
        return 'N/A';
    }
  };

  const validateField = (name, value, data) => {
    let error = '';

    if (name === 'TTR_TIPODO' && !value) {
      error = 'Seleccione el tipo de documento';
    }

    if (name === 'TTR_CEDULA') {
      if (data.TTR_TIPODO === '1' || data.TTR_TIPODO === '2') {
        if (!/^\d+$/.test(value)) {
          error = 'Solo se permiten números';
        }
      }
      if (data.TTR_TIPODO === '3') {
        if (!/^[A-Z]{2}-\d{3}$/.test(value)) {
          error = 'Formato pasaporte inválido (AA-999)';
        }
      }
    }

    if (name === 'TTR_TELEFO') {
      if (!/^(0412|0414|0416|0424|0426|0422)\d{7}$/.test(value)) {
        error = 'Prefijo telefónico inválido';
      }
    }

    if ((name === 'TTR_NOMBRE' || name === 'TTR_APELLI') && value.length < 3) {
      error = 'Debe tener al menos 3 caracteres';
    }

    if (name === 'TTR_COAFEC' && !value) {
      error = 'Seleccione una afectación';
    }

    return error;
  };


  const handleEdit = (a) => {
    setSelectedAfectado(a);
    setFormData({
      TTR_TIPODO: a.TTR_TIPODO,
      TTR_CEDULA: a.TTR_CEDULA,
      TTR_NOMBRE: a.TTR_NOMBRE,
      TTR_APELLI: a.TTR_APELLI,
      TTR_TELEFO: a.TTR_TELEFO,
      TTR_COAFEC: a.TTR_COAFEC,
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    const error = validateField(name, value, newData);

    setFormData(newData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key], formData);
      if (err) validationErrors[key] = err;
    });

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const res = await fetch(
        `${API}/afectados/${selectedAfectado.TTR_COHERI}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error();

      setAfectados((prev) =>
        prev.map((a) =>
          a.TTR_COHERI === selectedAfectado.TTR_COHERI
            ? { ...a, ...formData }
            : a
        )
      );

      setShowEditModal(false);
    } catch {
      alert('Error al actualizar');
    }
  };

  const handleDelete = (a) => {
    setSelectedAfectado(a);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `${API}/afectados/${selectedAfectado.TTR_COHERI}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error();

      setAfectados((prev) =>
        prev.filter((a) => a.TTR_COHERI !== selectedAfectado.TTR_COHERI)
      );

      setShowDeleteModal(false);
    } catch {
      alert('Error al eliminar');
    }
  };


  const filteredAfectados = afectados.filter(
    (a) =>
      a.TTR_NOMBRE?.toLowerCase().includes(search.toLowerCase()) ||
      a.TTR_APELLI?.toLowerCase().includes(search.toLowerCase()) ||
      a.TTR_CEDULA?.includes(search)
  );

  return (
    <CCard>
      <CCardHeader>
        <strong>Lista de Afectados</strong>
      </CCardHeader>

      <CCardBody>
        <CFormInput
          placeholder="Buscar..."
          className="mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && <CSpinner />}
        {error && <CAlert color="danger">{error}</CAlert>}

        {!loading && (
          <CTable bordered hover responsive>
            <CTableHead>
              <CTableRow>
                
                <CTableHeaderCell>Tipo</CTableHeaderCell>
                <CTableHeaderCell>Documento</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Apellido</CTableHeaderCell>
                <CTableHeaderCell>Teléfono</CTableHeaderCell>
                <CTableHeaderCell>Comunidad</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {filteredAfectados.map((a, i) => (
                <CTableRow key={a.TTR_COHERI}>
                  
                  <CTableDataCell className="text-center">
                    {mostrarTipoDocumento(a.TTR_TIPODO)}
                  </CTableDataCell>
                  <CTableDataCell>{a.TTR_CEDULA}</CTableDataCell>
                  <CTableDataCell>{a.TTR_NOMBRE}</CTableDataCell>
                  <CTableDataCell>{a.TTR_APELLI}</CTableDataCell>
                  <CTableDataCell>{a.TTR_TELEFO}</CTableDataCell>
                  <CTableDataCell>{getComunidad(a.TTR_COAFEC)}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}}
                      size="sm"
                      onClick={() => handleEdit(a)}
                      className="me-2"
                    >
                      Editar
                    </CButton>
                    <CButton
                      style={{backgroundColor:'white', color:'red', borderColor:'red'}}
                      size="sm"
                      onClick={() => handleDelete(a)}
                    >
                      Eliminar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      {/* MODAL EDITAR */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <CModalHeader>Editar Afectado</CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleEditSubmit}>
            <CFormSelect
              label="Tipo Documento"
              name="TTR_TIPODO"
              value={formData.TTR_TIPODO}
              onChange={handleInputChange}
            >
              <option value="">Seleccione</option>
              <option value="1">V</option>
              <option value="2">E</option>
              <option value="3">P</option>
            </CFormSelect>
            {errors.TTR_TIPODO && <div className="text-danger small">{errors.TTR_TIPODO}</div>}

            <CFormInput label="Documento" name="TTR_CEDULA" value={formData.TTR_CEDULA} onChange={handleInputChange} />
            {errors.TTR_CEDULA && <div className="text-danger small">{errors.TTR_CEDULA}</div>}

            <CFormInput label="Nombre" name="TTR_NOMBRE" value={formData.TTR_NOMBRE} onChange={handleInputChange} />
            {errors.TTR_NOMBRE && <div className="text-danger small">{errors.TTR_NOMBRE}</div>}

            <CFormInput label="Apellido" name="TTR_APELLI" value={formData.TTR_APELLI} onChange={handleInputChange} />
            {errors.TTR_APELLI && <div className="text-danger small">{errors.TTR_APELLI}</div>}

            <CFormInput label="Teléfono" name="TTR_TELEFO" value={formData.TTR_TELEFO} onChange={handleInputChange} />
            {errors.TTR_TELEFO && <div className="text-danger small">{errors.TTR_TELEFO}</div>}

            <CFormSelect label="Afectación" name="TTR_COAFEC" value={formData.TTR_COAFEC} onChange={handleInputChange}>
              <option value="">Seleccione</option>
              {afectaciones.map((af) => (
                <option key={af.TTR_COAFEC} value={af.TTR_COAFEC}>
                  {af.comunidad} - {new Date(af.TTR_FEAFEC).toLocaleDateString('es-VE')}
                </option>
              ))}
            </CFormSelect>
            {errors.TTR_COAFEC && <div className="text-danger small">{errors.TTR_COAFEC}</div>}

            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowEditModal(false)}>
                Cancelar
              </CButton>
              <CButton color="primary" type="submit">
                Guardar
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>

      {/* MODAL ELIMINAR */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader>Eliminar</CModalHeader>
        <CModalBody>
          ¿Eliminar a <strong>{selectedAfectado?.TTR_NOMBRE}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default ListarAfectados;
