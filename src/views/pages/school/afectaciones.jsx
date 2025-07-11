import React, { useEffect, useState, useRef } from 'react';
import {
  CCard, CCardBody, CCardHeader, CForm, CFormSelect, CFormInput, CButton, CContainer, CRow, CCol, CModal, CModalHeader, CModalBody, CAlert, CModalFooter, CFormCheck
} from '@coreui/react';

const API = 'http://localhost:4000';

const RegistrarAfectacion = () => {
  // Afectación
  const [comunidades, setComunidades] = useState([]);
  const [desastres, setDesastres] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]);
  const [ultimaAfectacion, setUltimaAfectacion] = useState(null);
  const [formAfectacion, setFormAfectacion] = useState({
    codcom: '',
    feafec: '',
    codesa: ''
  });

  // Formularios modales
  const [formDamnificado, setFormDamnificado] = useState({
    cedula: '',
    tipodo: '',
    nombre: '',
    apelli: '',
    fenaci: '',
    contac: '',
    esalud: '',
    coafec: ''
  });
  const [formVictima, setFormVictima] = useState({
    cedula: '',
    tipodo: '',
    nombre: '',
    apelli: '',
    certif: '',
    coafec: ''
  });

  // Pérdidas
  const [modalPerdida, setModalPerdida] = useState(false);
  const [tiposPerdida, setTiposPerdida] = useState([]);
  const [formPerdida, setFormPerdida] = useState({
    coafec: '',
    coddoc: '',
    cedula: '',
    nombre: '',
    apelli: '',
    perdidas: []
  });
  const [msgPerdida, setMsgPerdida] = useState({ type: '', text: '' });

  // Mensajes de estado
  const [msgAfectacion, setMsgAfectacion] = useState({ type: '', text: '' });
  const [msgDamnificado, setMsgDamnificado] = useState({ type: '', text: '' });
  const [msgVictima, setMsgVictima] = useState({ type: '', text: '' });

  // Modales
  const [modalDamnificado, setModalDamnificado] = useState(false);
  const [modalVictima, setModalVictima] = useState(false);

  // Buscador de comunidades
  const [comunidadSearch, setComunidadSearch] = useState('');
  const comunidadInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/comunidades/nombres`)
      .then(res => res.json())
      .then(setComunidades);
    fetch(`${API}/desastres/nombres`)
      .then(res => res.json())
      .then(setDesastres);
    fetch(`${API}/documento`)
      .then(res => res.json())
      .then(setTiposDoc);
    fetch(`${API}/afectaciones/ultima`)
      .then(res => res.json())
      .then(data => setUltimaAfectacion(data && data.TTR_COAFEC ? data : null));
  }, []);

  // Cargar tipos de pérdida y tipos de documento al abrir el modal
  useEffect(() => {
    if (modalPerdida) {
      fetch(`${API}/tipos-perdida`)
        .then(res => res.json())
        .then(setTiposPerdida);
      fetch(`${API}/tipos-documento`)
        .then(res => res.json())
        .then(setTiposDoc);
    }
  }, [modalPerdida]);

  // Filtrar comunidades según búsqueda
  const comunidadesFiltradas = comunidades.filter(c =>
    c.TMA_NOMBRE.toLowerCase().includes(comunidadSearch.toLowerCase())
  );

  // Handlers generales
  const handleChange = (setter, form) => e => {
    const { name, value } = e.target;
    setter({ ...form, [name]: value });
  };

  // Registrar afectación
  const handleSubmitAfectacion = async e => {
    e.preventDefault();
    setMsgAfectacion({ type: '', text: '' });
    try {
      const res = await fetch(`${API}/afectaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formAfectacion)
      });
      const data = await res.json();
      if (res.ok) {
        setMsgAfectacion({ type: 'success', text: 'Afectación registrada correctamente.' });
        setFormAfectacion({ codcom: '', feafec: '', codesa: '' });
        fetch(`${API}/afectaciones/ultima`)
          .then(res => res.json())
          .then(data => setUltimaAfectacion(data && data.TTR_COAFEC ? data : null));
      } else {
        setMsgAfectacion({ type: 'danger', text: data.mensaje || 'Error al registrar afectación.' });
      }
    } catch {
      setMsgAfectacion({ type: 'danger', text: 'Error de conexión al registrar afectación.' });
    }
  };

  // Registrar damnificado
  const handleSubmitDamnificado = async e => {
    e.preventDefault();
    setMsgDamnificado({ type: '', text: '' });
    const payload = {
      cedula: formDamnificado.cedula,
      tipodo: formDamnificado.tipodo,
      nombre: formDamnificado.nombre,
      apelli: formDamnificado.apelli,
      fenaci: formDamnificado.fenaci,
      contac: formDamnificado.contac,
      esalud: formDamnificado.esalud,
      coafec: Number(formDamnificado.coafec)
    };
    try {
      const res = await fetch(`${API}/damnificados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMsgDamnificado({ type: 'success', text: 'Damnificado registrado correctamente.' });
        setFormDamnificado({
          cedula: '', tipodo: '', nombre: '', apelli: '', fenaci: '', contac: '', esalud: '', coafec: ''
        });
      } else {
        setMsgDamnificado({ type: 'danger', text: data.mensaje || 'Error al registrar damnificado.' });
      }
    } catch {
      setMsgDamnificado({ type: 'danger', text: 'Error de conexión al registrar damnificado.' });
    }
  };

  // Registrar víctima
  const handleSubmitVictima = async e => {
    e.preventDefault();
    setMsgVictima({ type: '', text: '' });
    const payload = {
      cedula: formVictima.cedula,
      tipodo: formVictima.tipodo,
      nombre: formVictima.nombre,
      apelli: formVictima.apelli,
      certif: formVictima.certif,
      coafec: Number(formVictima.coafec)
    };
    try {
      const res = await fetch(`${API}/victimas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMsgVictima({ type: 'success', text: 'Víctima registrada correctamente.' });
        setFormVictima({
          cedula: '', tipodo: '', nombre: '', apelli: '', certif: '', coafec: ''
        });
      } else {
        setMsgVictima({ type: 'danger', text: data.mensaje || 'Error al registrar víctima.' });
      }
    } catch {
      setMsgVictima({ type: 'danger', text: 'Error de conexión al registrar víctima.' });
    }
  };

  // Manejo de checks y valores para pérdidas
  const handleCheckPerdida = (cotipo) => {
    setFormPerdida(prev => {
      const exists = prev.perdidas.find(p => p.cotipo === cotipo);
      if (exists) {
        return { ...prev, perdidas: prev.perdidas.filter(p => p.cotipo !== cotipo) };
      } else {
        return { ...prev, perdidas: [...prev.perdidas, { cotipo, vaesti: '' }] };
      }
    });
  };

  const handleValorPerdida = (cotipo, value) => {
    setFormPerdida(prev => ({
      ...prev,
      perdidas: prev.perdidas.map(p =>
        p.cotipo === cotipo ? { ...p, vaesti: value } : p
      )
    }));
  };

  const handleChangePerdida = e => {
    const { name, value } = e.target;
    setFormPerdida(prev => ({ ...prev, [name]: value }));
  };

  // Registrar varias pérdidas a la vez
  const handleSubmitPerdida = async e => {
    e.preventDefault();
    setMsgPerdida({ type: '', text: '' });
    const { coafec, coddoc, cedula, nombre, apelli, perdidas } = formPerdida;
    if (!coafec || !coddoc || !cedula || !nombre || !apelli || perdidas.length === 0) {
      setMsgPerdida({ type: 'danger', text: 'Complete todos los campos y seleccione al menos un tipo de pérdida.' });
      return;
    }
    for (const p of perdidas) {
      if (!p.vaesti || isNaN(p.vaesti) || Number(p.vaesti) <= 0) {
        setMsgPerdida({ type: 'danger', text: 'Ingrese un valor estimado válido para cada tipo de pérdida.' });
        return;
      }
    }
    try {
      const res = await fetch(`${API}/perdidas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coafec: Number(coafec),
          coddoc: Number(coddoc),
          cedula,
          nombre,
          apelli,
          perdidas: perdidas.map(p => ({
            cotipo: Number(p.cotipo),
            vaesti: Number(p.vaesti)
          }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsgPerdida({ type: 'success', text: 'Pérdidas registradas correctamente.' });
        setFormPerdida({ coafec: '', coddoc: '', cedula: '', nombre: '', apelli: '', perdidas: [] });
      } else {
        setMsgPerdida({ type: 'danger', text: data.mensaje || 'Error al registrar pérdidas.' });
      }
    } catch {
      setMsgPerdida({ type: 'danger', text: 'Error de conexión al registrar pérdidas.' });
    }
  };

  // Para mostrar la comunidad y fecha en los selects de afectación
  const comunidadUltima = comunidades.find(c => c.TMA_CODCOM === (ultimaAfectacion?.TTR_CODCOM));
  const desastreUltima = desastres.find(d => d.TMA_CODESA === (ultimaAfectacion?.TTR_CODESA));

  return (
    <CContainer className="py-4">
      <style>{`
        .btn-hover-white {
          color: #212529 !important;
          transition: color 0.2s;
        }
        .btn-hover-white:hover, .btn-hover-white:focus {
          color: #fff !important;
        }
      `}</style>
      <CRow className="g-4 justify-content-center align-items-start">
        <CCol xs={12} md={10} lg={8} className="mx-auto">
          <CCard className="shadow-sm flex-fill d-flex flex-column" style={{ minHeight: 320 }}>
            <CCardHeader className="text-center py-2" style={{ background: '#f5f5f5' }}>
              <strong>Registrar Afectación</strong>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmitAfectacion}>
                <CFormInput
                  placeholder="Buscar comunidad..."
                  value={comunidadSearch}
                  onChange={e => setComunidadSearch(e.target.value)}
                  className="mb-2"
                />
                <CFormSelect
                  label="Comunidad"
                  name="codcom"
                  value={formAfectacion.codcom}
                  onChange={handleChange(setFormAfectacion, formAfectacion)}
                  required
                  className="mb-2"
                  inputRef={comunidadInputRef}
                >
                  <option value="">Seleccione comunidad</option>
                  {comunidadesFiltradas.map(c => (
                    <option key={c.TMA_CODCOM} value={c.TMA_CODCOM}>{c.TMA_NOMBRE}</option>
                  ))}
                </CFormSelect>
                <CFormInput
                  label="Fecha de afectación"
                  type="date"
                  name="feafec"
                  value={formAfectacion.feafec}
                  onChange={handleChange(setFormAfectacion, formAfectacion)}
                  required
                  className="mb-2"
                />
                <CFormSelect
                  label="Desastre"
                  name="codesa"
                  value={formAfectacion.codesa}
                  onChange={handleChange(setFormAfectacion, formAfectacion)}
                  required
                  className="mb-3"
                >
                  <option value="">Seleccione desastre</option>
                  {desastres.map(d => (
                    <option key={d.TMA_CODESA} value={d.TMA_CODESA}>{d.TMA_NOMBRE}</option>
                  ))}
                </CFormSelect>
                {msgAfectacion.text && (
                  <CAlert color={msgAfectacion.type} className="mt-2 mb-1 py-2 text-center">
                    {msgAfectacion.text}
                  </CAlert>
                )}
                <CButton style={{backgroundColor:'#ff7043', color:'white'}} type="submit" className="w-100 mt-2">
                  Registrar afectación
                </CButton>
              </CForm>
              {/* TEXTO INFORMATIVO Y BOTONES */}
              <div className="text-center mt-4">
                <div className="mb-3" style={{fontSize: '1rem'}}>
                  <strong>¿Tienes personas afectadas?</strong>
                  <div style={{fontSize: '0.95rem', marginTop: 8}}>
                    Si tienes damnificados, víctimas o pérdidas, regístralos aquí:
                  </div>
                </div>
                <CButton
                  variant="outline"
                  style={{ minWidth: 180, backgroundColor:'white', color:'green', borderColor:'green' }}
                  onClick={() => setModalDamnificado(true)}
                >
                  Registrar Damnificado
                </CButton>
                <CButton
                  variant="outline"
                  style={{ minWidth: 180 , marginLeft:'10px',backgroundColor:'white', color:'red', borderColor:'red'}}
                  onClick={() => setModalVictima(true)}
                >
                  Registrar Víctima
                </CButton>
                <CButton
                  variant="outline"
                  style={{ minWidth: 180 , marginLeft:'10px',backgroundColor:'white', color:'#ff7043', borderColor:'#ff7043'}}
                  onClick={() => setModalPerdida(true)}
                >
                  Registrar Pérdida
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal Damnificado */}
      <CModal visible={modalDamnificado} onClose={() => { setModalDamnificado(false); setMsgDamnificado({ type: '', text: '' }); }} size="lg">
        <CModalHeader closeButton>
          <strong>Registrar Damnificado</strong>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={6} className="border-end">
              <div className="mb-3 text-secondary">
                <strong>¿Quién es un damnificado?</strong>
                <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                  <li>Persona afectada directamente por el suceso.</li>
                  <li>Debe tener sus datos personales y de contacto completos.</li>
                  <li>Recuerda registrar el tipo y número de documento correctamente.</li>
                </ul>
              </div>
            </CCol>
            <CCol md={6}>
              <CForm className="d-flex flex-column h-100 justify-content-center" onSubmit={handleSubmitDamnificado}>
                <CFormSelect
                  label="Tipo de documento"
                  name="tipodo"
                  value={formDamnificado.tipodo}
                  onChange={handleChange(setFormDamnificado, formDamnificado)}
                  className="mb-2"
                  required
                >
                  <option value="">Seleccione tipo</option>
                  {tiposDoc.map(t => (
                    <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>
                  ))}
                </CFormSelect>
                <CFormInput
                  label="Cédula"
                  name="cedula"
                  placeholder='Ejm 1234567'
                  value={formDamnificado.cedula}
                  onChange={handleChange(setFormDamnificado, formDamnificado)}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Nombre"
                  name="nombre"
                  placeholder='Ejm Daniel'
                  value={formDamnificado.nombre}
                  onChange={handleChange(setFormDamnificado, formDamnificado)}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Apellido"
                  name="apelli"
                  placeholder='Ejm Rangel'
                  value={formDamnificado.apelli}
                  onChange={handleChange(setFormDamnificado, formDamnificado)}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Fecha de nacimiento"
                  type="date"
                  name="fenaci"
                  value={formDamnificado.fenaci}
                  onChange={handleChange(setFormDamnificado, formDamnificado)}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Contacto"
                  name="contac"
                  placeholder='Ejm 04147146605'
                  value={formDamnificado.contac}
                  onChange={handleChange(setFormDamnificado, formDamnificado)}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Estado de salud"
                  name="esalud"
                  placeholder='Ejm Estable, Grave, Critico'
                  value={formDamnificado.esalud}
                  onChange={handleChange(setFormDamnificado, formDamnificado)}
                  className="mb-2"
                  required
                />
                <CFormSelect
                  label="Afectación"
                  name="coafec"
                  value={formDamnificado.coafec}
                  onChange={handleChange(setFormDamnificado, formDamnificado)}
                  className="mb-2"
                  required
                >
                  <option value="">Seleccione afectación</option>
                  {ultimaAfectacion && (
                    <option value={ultimaAfectacion.TTR_COAFEC}>
                      {(comunidadUltima?.TMA_NOMBRE || ultimaAfectacion.TTR_CODCOM) + ' - ' +
                        (ultimaAfectacion.TTR_FEAFEC ? new Date(ultimaAfectacion.TTR_FEAFEC).toLocaleDateString('es-VE') : '')}
                    </option>
                  )}
                </CFormSelect>
                {msgDamnificado.text && (
                  <CAlert color={msgDamnificado.type} className="mt-2 mb-1 py-2 text-center">
                    {msgDamnificado.text}
                  </CAlert>
                )}
                <CButton color="success text-white" type="submit" className="w-100 mt-2">
                  Registrar damnificado
                </CButton>
              </CForm>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>

      {/* Modal Víctima */}
      <CModal visible={modalVictima} onClose={() => { setModalVictima(false); setMsgVictima({ type: '', text: '' }); }} size="lg">
        <CModalHeader closeButton>
          <strong>Registrar Víctima</strong>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={6} className="border-end">
              <div className="mb-3 text-secondary">
                <strong>¿Quién es una víctima?</strong>
                <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                  <li>Persona que fallecio a causa del suceso.</li>
                  <li>Debes registrar el tipo de documento, nombre, apellido y certificado de defuncion.</li>
                  <li>Si solo fue afectado pero no es víctima, usa el formulario de damnificados.</li>
                </ul>
                <hr className="my-2" />
              </div>
            </CCol>
            <CCol md={6}>
              <CForm className="d-flex flex-column h-100 justify-content-center" onSubmit={handleSubmitVictima}>
                <CFormSelect
                  label="Tipo de documento"
                  name="tipodo"
                  value={formVictima.tipodo}
                  onChange={handleChange(setFormVictima, formVictima)}
                  className="mb-2"
                  required
                >
                  <option value="">Seleccione tipo</option>
                  {tiposDoc.map(t => (
                    <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>
                  ))}
                </CFormSelect>
                <CFormInput
                  label="Cédula"
                  name="cedula"
                  placeholder='Ejm 1234567'
                  value={formVictima.cedula}
                  onChange={handleChange(setFormVictima, formVictima)}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Nombre"
                  name="nombre"
                  placeholder='Ejm Daniel'
                  value={formVictima.nombre}
                  onChange={handleChange(setFormVictima, formVictima)}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Apellido"
                  name="apelli"
                  placeholder='Ejm Rangel'
                  value={formVictima.apelli}
                  onChange={handleChange(setFormVictima, formVictima)}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Certificado de defunción"
                  name="certif"
                  placeholder='Ejm 1234567'
                  value={formVictima.certif}
                  onChange={handleChange(setFormVictima, formVictima)}
                  className="mb-2"
                />
                <CFormSelect
                  label="Afectación"
                  name="coafec"
                  value={formVictima.coafec}
                  onChange={handleChange(setFormVictima, formVictima)}
                  className="mb-2"
                  required
                >
                  <option value="">Seleccione afectación</option>
                  {ultimaAfectacion && (
                    <option value={ultimaAfectacion.TTR_COAFEC}>
                      {(comunidadUltima?.TMA_NOMBRE || ultimaAfectacion.TTR_CODCOM) + ' - ' +
                        (ultimaAfectacion.TTR_FEAFEC ? new Date(ultimaAfectacion.TTR_FEAFEC).toLocaleDateString('es-VE') : '')}
                    </option>
                  )}
                </CFormSelect>
                {msgVictima.text && (
                  <CAlert color={msgVictima.type} className="mt-2 mb-1 py-2 text-center">
                    {msgVictima.text}
                  </CAlert>
                )}
                <CButton color="danger text-white" type="submit" className="w-100 mt-2">
                  Registrar víctima
                </CButton>
              </CForm>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>

      {/* Modal Registrar Pérdida */}
      <CModal visible={modalPerdida} onClose={() => { setModalPerdida(false); setMsgPerdida({ type: '', text: '' }); }} size="lg">
        <CModalHeader closeButton>
          <strong>Registrar Pérdidas</strong>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={5} className="border-end">
              <div className="mb-3 text-secondary">
                <strong>¿Cómo registrar una pérdida?</strong>
                <ul className="text-start" style={{ paddingLeft: 18, marginBottom: 0, marginTop: 8 }}>
                  <li>Selecciona la afectación a la que corresponde la pérdida.</li>
                  <li>Completa los datos personales de la persona afectada.</li>
                  <li>Marca uno o varios tipos de pérdida y coloca el valor estimado de cada una.</li>
                  <li>Puedes registrar varias pérdidas para la misma persona en un solo envío.</li>
                  <li>Verifica que todos los campos estén completos antes de guardar.</li>
                </ul>
              </div>
            </CCol>
            <CCol md={7}>
              <CForm onSubmit={handleSubmitPerdida}>
                <CFormSelect
                  label="Afectación"
                  name="coafec"
                  value={formPerdida.coafec}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                >
                  <option value="">Seleccione afectación</option>
                  {ultimaAfectacion && (
                    <option value={ultimaAfectacion.TTR_COAFEC}>
                      {(comunidadUltima?.TMA_NOMBRE || ultimaAfectacion.TTR_CODCOM) + ' - ' +
                        (ultimaAfectacion.TTR_FEAFEC ? new Date(ultimaAfectacion.TTR_FEAFEC).toLocaleDateString('es-VE') : '')}
                    </option>
                  )}
                </CFormSelect>
                <CFormSelect
                  label="Tipo de documento"
                  name="coddoc"
                  value={formPerdida.coddoc}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                >
                  <option value="">Seleccione tipo de documento</option>
                  {tiposDoc.map(t => (
                    <option key={t.TMA_CODDOC} value={t.TMA_CODDOC}>{t.TMA_NOMBRE}</option>
                  ))}
                </CFormSelect>
                <CFormInput
                  label="Cédula"
                  name="cedula"
                  placeholder='Ejm 1234567'
                  value={formPerdida.cedula}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Nombre"
                  name="nombre"
                  placeholder='Ejm Daniel'
                  value={formPerdida.nombre}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                />
                <CFormInput
                  label="Apellido"
                  name="apelli"
                  placeholder='Ejm Rangel'
                  value={formPerdida.apelli}
                  onChange={handleChangePerdida}
                  className="mb-2"
                  required
                />
                <div className="mb-2">
                  <label><strong>Tipos de pérdida</strong></label>
                  {tiposPerdida.map(tipo => (
                    <div key={tipo.TTR_COTIPO} className="d-flex align-items-center mb-2">
                      <CFormCheck
                        type="checkbox"
                        id={`tipo-${tipo.TTR_COTIPO}`}
                        checked={!!formPerdida.perdidas.find(p => p.cotipo === tipo.TTR_COTIPO)}
                        onChange={() => handleCheckPerdida(tipo.TTR_COTIPO)}
                        label={tipo.TTR_NOMBRE}
                      />
                      {formPerdida.perdidas.find(p => p.cotipo === tipo.TTR_COTIPO) && (
                        <CFormInput
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Valor estimado"
                          value={formPerdida.perdidas.find(p => p.cotipo === tipo.TTR_COTIPO)?.vaesti || ''}
                          onChange={e => handleValorPerdida(tipo.TTR_COTIPO, e.target.value)}
                          style={{ width: 140, marginLeft: 12 }}
                          required
                        />
                      )}
                    </div>
                  ))}
                </div>
                {msgPerdida.text && (
                  <CAlert color={msgPerdida.type} className="mt-2 mb-1 py-2 text-center">
                    {msgPerdida.text}
                  </CAlert>
                )}
                <CModalFooter>
                  <CButton color="warning text-white" type="submit">Registrar pérdidas</CButton>
                </CModalFooter>
              </CForm>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>
    </CContainer>
  );
};

export default RegistrarAfectacion;