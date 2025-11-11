import React, { useEffect, useState, useRef } from 'react';
import {
  CCard, CCardBody, CCardHeader, CContainer, CRow, CCol,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CInputGroup, CFormInput, CModal, CModalHeader, CModalBody, CModalFooter, CFormSelect, CAlert,
  CPagination,
  CPaginationItem,
} from '@coreui/react';

const API = 'https://sistema-de-gestion-backend.onrender.com';

const ListaPerdidas = () => {
  const [perdidas, setPerdidas] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [editPerdida, setEditPerdida] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [tiposPerdida, setTiposPerdida] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]);
  const [afectaciones, setAfectaciones] = useState([]);

  // Validación / refs para modal editar
  const [errorsEdit, setErrorsEdit] = useState({});
  const afectRef = useRef(null);
  const docRef = useRef(null);
  const ceduRef = useRef(null);
  const nombreRef = useRef(null);
  const apelliRef = useRef(null);
  const tipoPerRef = useRef(null);
  const vaestiRef = useRef(null);
  const saveRef = useRef(null);

  // Cargar datos
  const fetchPerdidas = async () => {
    try {
      const res = await fetch(`${API}/perdidas/lista?search=${search}&page=${page}`);
      const data = await res.json();
      setPerdidas(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchPerdidas(); }, [search, page]);

  useEffect(() => {
    fetch(`${API}/tipos-perdida`).then(res => res.json()).then(setTiposPerdida).catch(console.error);
    fetch(`${API}/tipos-documento`).then(res => res.json()).then(setTiposDoc).catch(console.error);
    fetch(`${API}/afectacion`).then(res => res.json()).then(setAfectaciones).catch(console.error);
  }, []);

  // Helpers de sanitización
  const onlyDigits = s => String(s ?? '').replace(/\D/g, '');
  const onlyLetters = s => String(s ?? '').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g, '');
  const onlyDecimal = s => String(s ?? '').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

  const handleEdit = (perdida) => {
    // normalizar campo names para edición (trabajar sobre copia)
    setEditPerdida({
      ...perdida,
      TTR_VAESTI: String(perdida.TTR_VAESTI ?? ''),
      TTR_CEDULA: String(perdida.TTR_CEDULA ?? ''),
      TTR_NOMBRE: perdida.TTR_NOMBRE ?? '',
      TTR_APELLI: perdida.TTR_APELLI ?? '',
      TTR_CODDOC: String(perdida.TTR_CODDOC ?? ''),
      TTR_COTIPO: String(perdida.TTR_COTIPO ?? ''),
      TTR_COAFEC: String(perdida.TTR_COAFEC ?? '')
    });
    setErrorsEdit({});
    setMsg({ type: '', text: '' });
    setModalEdit(true);
    setTimeout(() => { if (afectRef.current) afectRef.current.focus(); }, 120);
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    if (!editPerdida) return;
    let val = value;
    if (name === 'TTR_CEDULA') val = onlyDigits(value);
    if (name === 'TTR_VAESTI') val = onlyDecimal(value);
    if (name === 'TTR_NOMBRE' || name === 'TTR_APELLI') val = onlyLetters(value);
    // selects: keep as string
    setEditPerdida(prev => ({ ...prev, [name]: val }));
    validateEditField(name, val);
    setMsg({ type: '', text: '' });
  };

  const handleEnter = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) nextRef.current.focus();
    }
  };

  const validateEditField = (name, value) => {
    const v = String(value ?? '').trim();
    let msgErr = '';

    if (name === 'TTR_COAFEC') {
      if (!v) msgErr = 'Seleccione afectación';
    }
    if (name === 'TTR_CODDOC') {
      if (!v) msgErr = 'Seleccione tipo de documento';
    }
    if (name === 'TTR_CEDULA') {
      if (!v) msgErr = 'Cédula obligatoria';
      else if (!/^\d{7,9}$/.test(v)) msgErr = 'Cédula inválida (7-9 dígitos)';
    }
    if (name === 'TTR_NOMBRE') {
      if (!v) msgErr = 'Nombre obligatorio';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(v)) msgErr = 'Nombre inválido';
    }
    if (name === 'TTR_APELLI') {
      if (!v) msgErr = 'Apellido obligatorio';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,}$/.test(v)) msgErr = 'Apellido inválido';
    }
    if (name === 'TTR_COTIPO') {
      if (!v) msgErr = 'Seleccione tipo de pérdida';
    }
    if (name === 'TTR_VAESTI') {
      if (!v) msgErr = 'Valor estimado obligatorio';
      else if (isNaN(v) || Number(v) <= 0) msgErr = 'Valor estimado inválido (> 0)';
    }

    setErrorsEdit(prev => ({ ...prev, [name]: msgErr }));
    return msgErr === '';
  };

  const validateEditAll = () => {
    if (!editPerdida) return false;
    const fields = ['TTR_COAFEC','TTR_CODDOC','TTR_CEDULA','TTR_NOMBRE','TTR_APELLI','TTR_COTIPO','TTR_VAESTI'];
    const newErr = {};
    fields.forEach(f => {
      const ok = validateEditField(f, editPerdida[f]);
      if (!ok) newErr[f] = true;
    });
    return Object.keys(newErr).length === 0;
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!editPerdida) return;

    // validar todos los campos
    const order = ['TTR_COAFEC','TTR_CODDOC','TTR_CEDULA','TTR_NOMBRE','TTR_APELLI','TTR_COTIPO','TTR_VAESTI'];
    const newErr = {};
    for (const f of order) {
      const ok = validateEditField(f, editPerdida[f]);
      if (!ok) newErr[f] = true;
    }
    setErrorsEdit(prev => ({ ...prev })); // mensajes ya seteados

    const firstError = order.find(f => errorsEdit[f] || newErr[f]);
    if (firstError) {
      const map = {
        TTR_COAFEC: afectRef,
        TTR_CODDOC: docRef,
        TTR_CEDULA: ceduRef,
        TTR_NOMBRE: nombreRef,
        TTR_APELLI: apelliRef,
        TTR_COTIPO: tipoPerRef,
        TTR_VAESTI: vaestiRef
      };
      if (map[firstError] && map[firstError].current) map[firstError].current.focus();
      return;
    }

    // payload
    const payload = {
      coafec: Number(editPerdida.TTR_COAFEC),
      cotipo: Number(editPerdida.TTR_COTIPO),
      vaesti: Number(editPerdida.TTR_VAESTI),
      coddoc: Number(editPerdida.TTR_CODDOC),
      cedula: editPerdida.TTR_CEDULA,
      nombre: editPerdida.TTR_NOMBRE,
      apelli: editPerdida.TTR_APELLI
    };

    try {
      const res = await fetch(`${API}/perdidas/editar/${editPerdida.TTR_COPERD}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ type: 'success', text: 'Pérdida actualizada correctamente.' });
        setModalEdit(false);
        fetchPerdidas();
      } else {
        setMsg({ type: 'danger', text: data.message || 'Error al editar.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'danger', text: 'Error de conexión.' });
    }
  };

  // Eliminar
  const handleDelete = async () => {
    if (!editPerdida) return;
    try {
      const res = await fetch(`${API}/perdidas/eliminar/${editPerdida.TTR_COPERD}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ type: 'success', text: 'Pérdida eliminada correctamente.' });
        setModalDelete(false);
        fetchPerdidas();
      } else {
        setMsg({ type: 'danger', text: data.message || 'Error al eliminar.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'danger', text: 'Error de conexión.' });
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <CContainer className="py-4" style={{ maxWidth: '100%', width: '100%' }}>
      <CRow className="justify-content-center">
        <CCol xs={12} style={{ maxWidth: '100%' }}>
          <CCard className="shadow-sm">
            <CCardHeader>
              <h5 className="mb-0">Listado de Pérdidas</h5>
            </CCardHeader>
            <CCardBody>
              <CInputGroup className="mb-3" style={{ width: '100%' }}>
                <CFormInput
                  placeholder="Buscar por nombre, apellido, cédula o lugar"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </CInputGroup>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Tipo Doc.</CTableHeaderCell>
                    <CTableHeaderCell>Cédula</CTableHeaderCell>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Apellido</CTableHeaderCell>
                    <CTableHeaderCell>Tipo Pérdida</CTableHeaderCell>
                    <CTableHeaderCell>Valor Estimado Bs</CTableHeaderCell>
                    <CTableHeaderCell>Lugar</CTableHeaderCell>
                    <CTableHeaderCell>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {perdidas.map((p) => (
                    <CTableRow key={p.TTR_COPERD}>
                      <CTableDataCell>{p.tipo_documento}</CTableDataCell>
                      <CTableDataCell>{p.TTR_CEDULA}</CTableDataCell>
                      <CTableDataCell>{p.TTR_NOMBRE}</CTableDataCell>
                      <CTableDataCell>{p.TTR_APELLI}</CTableDataCell>
                      <CTableDataCell>{p.tipo_perdida}</CTableDataCell>
                      <CTableDataCell>{p.TTR_VAESTI}</CTableDataCell>
                      <CTableDataCell>{p.comunidad}</CTableDataCell>
                      <CTableDataCell>
                        <CButton size="sm" style={{backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}} onClick={() => handleEdit(p)}>Editar</CButton>{' '}
                        <CButton size="sm" style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => { setEditPerdida(p); setModalDelete(true); }}>Eliminar</CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              {/* Paginación centrada con números */}
              <CPagination align="center" className="mt-3">
                {[...Array(totalPages)].map((_, idx) => (
                  <CPaginationItem
                    key={idx + 1}
                    active={page === idx + 1}
                    onClick={() => setPage(idx + 1)}
                    style={{ cursor: 'pointer' }}
                  >
                    {idx + 1}
                  </CPaginationItem>
                ))}
              </CPagination>
              {/* Modal Editar */}
              <CModal visible={modalEdit} onClose={() => setModalEdit(false)}>
                <CModalHeader closeButton>Editar Pérdida</CModalHeader>
                <CModalBody>
                  {editPerdida && (
                    <form onSubmit={handleEditSubmit}>
                      <CFormSelect
                        label="Afectación"
                        name="TTR_COAFEC"
                        value={editPerdida.TTR_COAFEC}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                        ref={afectRef}
                        onKeyDown={e => handleEnter(e, docRef)}
                      >
                        <option value="">Seleccione afectación</option>
                        {afectaciones.map(a => (
                          <option key={a.TTR_COAFEC} value={a.TTR_COAFEC}>
                            {a.comunidad} - {a.TTR_FEAFEC ? (() => {
                              const fechaStr = a.TTR_FEAFEC.includes('T') ? a.TTR_FEAFEC : `${a.TTR_FEAFEC}T00:00:00`;
                              return new Date(fechaStr).toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
                            })() : ''}
                          </option>
                        ))}
                      </CFormSelect>
                      {errorsEdit.TTR_COAFEC && <div className="text-danger small mb-2">{errorsEdit.TTR_COAFEC}</div>}

                      <CFormSelect
                        label="Tipo de documento"
                        name="TTR_CODDOC"
                        value={editPerdida.TTR_CODDOC}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                        ref={docRef}
                        onKeyDown={e => handleEnter(e, ceduRef)}
                      >
                        <option value="">Seleccione tipo de documento</option>
                        {tiposDoc.map(t => (
                          <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>
                        ))}
                      </CFormSelect>
                      {errorsEdit.TTR_CODDOC && <div className="text-danger small mb-2">{errorsEdit.TTR_CODDOC}</div>}

                      <CFormInput
                        label="Cédula"
                        name="TTR_CEDULA"
                        value={editPerdida.TTR_CEDULA}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                        maxLength={9}
                        minLength={7}
                        inputMode="numeric"
                        pattern="^\d{7,9}$"
                        title="7 a 9 dígitos"
                        ref={ceduRef}
                        onKeyDown={e => handleEnter(e, nombreRef)}
                      />
                      {errorsEdit.TTR_CEDULA && <div className="text-danger small mb-2">{errorsEdit.TTR_CEDULA}</div>}

                      <CFormInput
                        label="Nombre"
                        name="TTR_NOMBRE"
                        value={editPerdida.TTR_NOMBRE}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                        ref={nombreRef}
                        onKeyDown={e => handleEnter(e, apelliRef)}
                        pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$"
                        title="Solo letras y espacios"
                      />
                      {errorsEdit.TTR_NOMBRE && <div className="text-danger small mb-2">{errorsEdit.TTR_NOMBRE}</div>}

                      <CFormInput
                        label="Apellido"
                        name="TTR_APELLI"
                        value={editPerdida.TTR_APELLI}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                        ref={apelliRef}
                        onKeyDown={e => handleEnter(e, tipoPerRef)}
                        pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$"
                        title="Solo letras y espacios"
                      />
                      {errorsEdit.TTR_APELLI && <div className="text-danger small mb-2">{errorsEdit.TTR_APELLI}</div>}

                      <CFormSelect
                        label="Tipo de pérdida"
                        name="TTR_COTIPO"
                        value={editPerdida.TTR_COTIPO}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                        ref={tipoPerRef}
                        onKeyDown={e => handleEnter(e, vaestiRef)}
                      >
                        <option value="">Seleccione tipo de pérdida</option>
                        {tiposPerdida.map(t => (
                          <option key={t.TTR_COTIPO} value={t.TTR_COTIPO}>{t.TTR_NOMBRE}</option>
                        ))}
                      </CFormSelect>
                      {errorsEdit.TTR_COTIPO && <div className="text-danger small mb-2">{errorsEdit.TTR_COTIPO}</div>}

                      <CFormInput
                        label="Valor estimado"
                        name="TTR_VAESTI"
                        type="number"
                        min="1"
                        step="0.01"
                        value={editPerdida.TTR_VAESTI}
                        onChange={handleEditChange}
                        className="mb-2"
                        required
                        ref={vaestiRef}
                        onKeyDown={e => handleEnter(e, saveRef)}
                      />
                      {errorsEdit.TTR_VAESTI && <div className="text-danger small mb-2">{errorsEdit.TTR_VAESTI}</div>}

                      <CModalFooter>
                        <CButton color="primary" type="submit" ref={saveRef}>Guardar</CButton>
                        <CButton color="secondary" onClick={() => setModalEdit(false)}>Cancelar</CButton>
                      </CModalFooter>
                    </form>
                  )}
                </CModalBody>
              </CModal>
              {/* Modal Eliminar */}
              <CModal visible={modalDelete} onClose={() => setModalDelete(false)}>
                <CModalHeader closeButton>Eliminar Pérdida</CModalHeader>
                <CModalBody>
                  ¿Seguro que desea eliminar esta pérdida?
                </CModalBody>
                <CModalFooter>
                  <CButton color="danger" onClick={handleDelete}>Eliminar</CButton>
                  <CButton color="secondary" onClick={() => setModalDelete(false)}>Cancelar</CButton>
                </CModalFooter>
              </CModal>
              {msg.text && (
                <CAlert color={msg.type} className="mt-3">{msg.text}</CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ListaPerdidas;