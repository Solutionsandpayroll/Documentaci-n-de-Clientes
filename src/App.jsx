import React, { useState, useEffect } from 'react';

const initialFormData = {
  id: null,
  // Información del cliente (del primer código)
  companyName: '',
  identificationNumber: '',
  legalRepresentative: '',
  economicActivity: '',
  address: '',
  city: '',
  country: '',
  client: '',
  contactName: '',
  contactEmail: '',
  payrollLink: '',
  // Resumen y generalidades (del primer código)
  summary: '',
  payrollGeneralities: '',
  allowances: [],
  // Reportes de Nómina y Seguridad Social (nuevo)
  payrollReportsInfo: '',
  day31Info: '',
  ssDueDate: '',
  ssARL: '',
  ssCajas: '',
  ssGeneralNotes: '',
  costsProvisionsReport: '',
  monthlyReports: [],
  affiliationsNotes: '',
  // Servicios adicionales (nuevo)
  additionalServices: [],
  // Reglas e instructivo (del segundo código)
  considerations: '',
  instructions: '',
  // Anexos
  images: [],
  lastUpdated: '',
};

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [openSections, setOpenSections] = useState({
    info: true,
    resumen: false,
    reportes: false,
    servicios: false,
    consideraciones: false,
    instrucciones: false,
    anexos: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const savedDocs = localStorage.getItem('sp_client_documents');
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs));
      } catch (err) {
        console.error('Error cargando documentos de localStorage:', err);
      }
    }
  }, []);

  const saveToStorage = (updatedDocs) => {
    setDocuments(updatedDocs);
    localStorage.setItem('sp_client_documents', JSON.stringify(updatedDocs));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---- Auxilios (repetibles, cada uno con su propio resumen y su propia tabla) ----
  const handleAllowanceChange = (index, field, value) => {
    const updated = [...formData.allowances];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, allowances: updated }));
  };

  const addAllowanceRow = () => {
    setFormData((prev) => ({
      ...prev,
      allowances: [...prev.allowances, { id: Date.now() + Math.random(), title: '', description: '', conceptRows: [] }],
    }));
  };

  const removeAllowanceRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== index),
    }));
  };

  // ---- Tabla propia de cada Auxilio ----
  const handleAllowanceConceptChange = (allowanceIndex, conceptIndex, field, value) => {
    setFormData((prev) => {
      const updatedAllowances = [...prev.allowances];
      const current = updatedAllowances[allowanceIndex];
      const updatedRows = [...(current.conceptRows || [])];
      updatedRows[conceptIndex] = { ...updatedRows[conceptIndex], [field]: value };
      updatedAllowances[allowanceIndex] = { ...current, conceptRows: updatedRows };
      return { ...prev, allowances: updatedAllowances };
    });
  };

  const addAllowanceConceptRow = (allowanceIndex) => {
    setFormData((prev) => {
      const updatedAllowances = [...prev.allowances];
      const current = updatedAllowances[allowanceIndex];
      updatedAllowances[allowanceIndex] = {
        ...current,
        conceptRows: [...(current.conceptRows || []), { id: Date.now() + Math.random(), code: '', name: '', observation: '' }],
      };
      return { ...prev, allowances: updatedAllowances };
    });
  };

  const removeAllowanceConceptRow = (allowanceIndex, conceptIndex) => {
    setFormData((prev) => {
      const updatedAllowances = [...prev.allowances];
      const current = updatedAllowances[allowanceIndex];
      updatedAllowances[allowanceIndex] = {
        ...current,
        conceptRows: (current.conceptRows || []).filter((_, i) => i !== conceptIndex),
      };
      return { ...prev, allowances: updatedAllowances };
    });
  };

  // ---- Reportes Mensuales (repetibles, con imágenes propias) ----
  const handleMonthlyReportChange = (index, field, value) => {
    const updated = [...formData.monthlyReports];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, monthlyReports: updated }));
  };

  const addMonthlyReportRow = () => {
    setFormData((prev) => ({
      ...prev,
      monthlyReports: [
        ...prev.monthlyReports,
        { id: Date.now() + Math.random(), title: '', fileName: '', description: '', route: '', images: [] },
      ],
    }));
  };

  const removeMonthlyReportRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      monthlyReports: prev.monthlyReports.filter((_, i) => i !== index),
    }));
  };

  const handleReportImageUpload = (index, e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = { id: Date.now() + Math.random(), url: reader.result, name: file.name };
        setFormData((prev) => {
          const updated = [...prev.monthlyReports];
          updated[index] = { ...updated[index], images: [...(updated[index].images || []), newImage] };
          return { ...prev, monthlyReports: updated };
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveReportImage = (reportIndex, imageId) => {
    setFormData((prev) => {
      const updated = [...prev.monthlyReports];
      updated[reportIndex] = {
        ...updated[reportIndex],
        images: (updated[reportIndex].images || []).filter((img) => img.id !== imageId),
      };
      return { ...prev, monthlyReports: updated };
    });
  };

  // ---- Servicios adicionales (repetibles) ----
  const handleAdditionalServiceChange = (index, field, value) => {
    const updated = [...formData.additionalServices];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, additionalServices: updated }));
  };

  const addAdditionalServiceRow = () => {
    setFormData((prev) => ({
      ...prev,
      additionalServices: [...prev.additionalServices, { id: Date.now() + Math.random(), title: '', description: '' }],
    }));
  };

  const removeAdditionalServiceRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      additionalServices: prev.additionalServices.filter((_, i) => i !== index),
    }));
  };

  // ---- Imágenes (anexos generales) ----
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = { id: Date.now() + Math.random(), url: reader.result, name: file.name };
        setFormData((prev) => ({ ...prev, images: [...prev.images, newImage] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (id) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((img) => img.id !== id) }));
  };

  // ---- Guardar / seleccionar / eliminar documentos ----
  const handleSaveDocument = (e) => {
    if (e) e.preventDefault();

    if (!formData.companyName.trim()) {
      alert('Por favor, ingresa el nombre de la compañía.');
      return;
    }

    const now = new Date().toLocaleString('es-CO');
    let updatedDocs;
    let savedDoc;

    if (formData.id) {
      savedDoc = { ...formData, lastUpdated: now };
      updatedDocs = documents.map((doc) => (doc.id === formData.id ? savedDoc : doc));
      alert(`Documentación de "${formData.companyName}" actualizada.`);
    } else {
      savedDoc = { ...formData, id: Date.now(), lastUpdated: now };
      updatedDocs = [savedDoc, ...documents];
      alert(`Documentación de "${formData.companyName}" guardada.`);
    }

    setFormData(savedDoc);
    saveToStorage(updatedDocs);
  };

  const handleSelectDocument = (doc) => {
    setFormData({ ...initialFormData, ...doc });
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
  };

  const handleDeleteDocument = (id, companyName) => {
    if (confirm(`¿Eliminar la documentación de "${companyName}"?`)) {
      const filtered = documents.filter((doc) => doc.id !== id);
      saveToStorage(filtered);
      if (formData.id === id) handleNewDocument();
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const filteredDocuments = documents.filter((doc) =>
    (doc.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.client || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pequeño helper para no repetir la condición "solo imprime si tiene valor"
  const PrintField = ({ label, value }) =>
    value && value.toString().trim() ? (
      <div className="print-field-row">
        <strong>{label}:</strong> {value}
      </div>
    ) : null;

  const PrintTextBlock = ({ heading, value }) =>
    value && value.toString().trim() ? (
      <div className="print-field-block">
        <div className="print-section-heading">{heading}</div>
        <div className="print-only-text print-text-block">{value}</div>
      </div>
    ) : null;

  // ---- Flags para no imprimir títulos de secciones vacías ----
  const hasClientInfo = [
    formData.companyName,
    formData.identificationNumber,
    formData.legalRepresentative,
    formData.economicActivity,
    formData.address,
    formData.city,
    formData.country,
    formData.client,
    formData.contactName,
    formData.contactEmail,
    formData.payrollLink,
  ].some((v) => v && v.toString().trim());

  const hasConsiderations = formData.considerations && formData.considerations.trim();
  const hasInstructions = formData.instructions && formData.instructions.trim();
  const hasAnexos = formData.images && formData.images.length > 0;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', Calibri, Roboto, Helvetica, Arial, sans-serif", color: '#0f172a' }}>

      {/* REGLAS CSS PARA IMPRESIÓN — imitan el formato del documento Word (DDS) */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .main-layout { display: block !important; }
          .print-full {
            width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important;
            box-shadow: none !important; border: none !important; border-radius: 0 !important; background-color: white !important;
          }
          html, body { margin: 0 !important; padding: 0 !important; background-color: white !important; }

          /* Logo del PDF: forma parte del flujo normal para que quede ARRIBA del título. */
          .print-logo-header {
            display: flex !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 0 8px 0 !important;
            padding: 0 !important;
            align-items: center;
            justify-content: center;
            z-index: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-logo-header img {
            height: 55px;
            width: auto;
            display: block;
            object-fit: contain;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            filter: none !important;
            -webkit-filter: none !important;
          }

          .print-doc-title { display: block !important; text-align: center; font-weight: 700; font-size: 15px; color: #000000; margin: 0 0 6px 0; }

          .print-updated-row { display: block !important; text-align: center; font-size: 11px; color: #334155; margin: 0 0 20px 0; }

          .print-section-heading { display: block !important; font-weight: 700; font-size: 13px; color: #000000; margin: 18px 0 8px 0; }

          .print-full label { color: #000000 !important; font-size: 12.5px !important; font-weight: 700 !important; text-transform: none !important; }

          .print-field-row { display: block !important; font-size: 12.5px; color: #000000; margin: 3px 0; line-height: 1.5; }

          .print-only-text { display: block !important; }
          .print-text-block {
            background: none !important; border: none !important; border-radius: 0 !important; padding: 0 !important;
            font-size: 12.5px !important; color: #000000 !important; line-height: 1.5 !important; text-align: justify;
            white-space: pre-wrap; word-break: break-word; page-break-inside: avoid;
          }

          .print-form-element { display: none !important; }

          .print-field-block { page-break-inside: avoid; margin-bottom: 16px; }

          .print-image-card { border: 1px solid #000000 !important; border-radius: 0 !important; background: white !important; box-shadow: none !important; page-break-inside: avoid; }

          .print-doc-table { display: table !important; width: 100%; border-collapse: collapse; margin-top: 6px; page-break-inside: avoid; }
          .print-doc-table td { border: 1px solid #000000; padding: 5px 8px; font-size: 12px; color: #000000; }

          /* Las secciones desplegables siempre se imprimen completas, sin importar si están cerradas en pantalla */
          .collapsible-body { display: block !important; padding: 0 !important; }
          .collapsible-section { border: none !important; border-radius: 0 !important; margin-bottom: 0 !important; }

          /* El margen de @page reserva en CADA hoja el espacio de arriba para el logo (evita depender del flujo normal,
             que solo pintaba el logo en la primera página y dejaba un remanente que generaba una hoja en blanco).
             Los bloques @bottom-center agregan la numeración de página en el pie de cada hoja.
             Nota: el soporte de estos "margin boxes" depende del motor de impresión del navegador;
             en Chrome/Edge recientes se ven al imprimir o exportar a PDF. */
          @page {
            size: letter;
            margin: 3.3cm 2.5cm 2.5cm 2.5cm;
            @bottom-center {
              content: "Página " counter(page) " de " counter(pages);
              font-size: 9px;
              color: #475569;
            }
          }
        }
        @media screen {
          .print-logo-header, .print-doc-table { display: none; }
          .print-only-text, .print-doc-title, .print-updated-row, .print-section-heading, .print-field-row { display: none; }
        }
      `}</style>

      {/* NAVBAR SUPERIOR CORPORATIVO (solo pantalla) */}
      <header className="no-print" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '10px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!logoError ? (
            <img src="/logo.jpeg" alt="Solutions & Payroll" style={{ height: '82px', objectFit: 'contain' }} onError={() => setLogoError(true)} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', fontWeight: '800', lineHeight: '1.1', fontSize: '26px' }}>
              <span style={{ color: '#0f172a' }}>Solutions</span>
              <span style={{ color: '#0f172a' }}><span style={{ color: '#e11d48' }}>&</span> Payroll</span>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '8px 22px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '15px', color: '#1e293b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Bienvenido, Usuario</span>
        </div>
      </header>

      <div className="print-full" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>

        {/* ENCABEZADO DE PANTALLA (no imprime) */}
        <div className="no-print" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
            Gestión de Documentación e Instructivos
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
            Administra la información del cliente, reglas, instructivos paso a paso y anexos de soporte.
          </p>
        </div>

        {/* TARJETA INFORMATIVA (no imprime) */}
        <div className="no-print" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px 24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowInstructions(!showInstructions)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: '#1e40af', fontSize: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>¿Cómo usar esta aplicación?</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showInstructions ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {showInstructions && (
            <div style={{ marginTop: '14px', fontSize: '13.5px', color: '#1e3a8a', lineHeight: '1.6' }}>
              <p style={{ margin: '4px 0' }}><strong>1. Seleccionar o Crear Cliente:</strong> Usa el buscador lateral para seleccionar un cliente existente o haz clic en "+ Nuevo Cliente".</p>
              <p style={{ margin: '4px 0' }}><strong>2. Completar la información:</strong> Datos de la compañía, resumen, reglas e instructivo paso a paso.</p>
              <p style={{ margin: '4px 0' }}><strong>3. Reportes de Nómina:</strong> Registra generalidades de seguridad social, reporte de costos y provisiones, y cada reporte mensual con su ruta e imágenes de referencia.</p>
              <p style={{ margin: '4px 0' }}><strong>4. Tabla de conceptos y Servicios Adicionales:</strong> Agrega las filas que necesites.</p>
              <p style={{ margin: '4px 0' }}><strong>5. Adjuntar Imágenes:</strong> Carga capturas o anexos visuales.</p>
              <p style={{ margin: '4px 0' }}><strong>6. Guardar y Exportar:</strong> Almacena los datos en el sistema o genera un reporte imprimible en PDF.</p>
            </div>
          )}
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="main-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* PANEL LATERAL: CLIENTES REGISTRADOS (no imprime) */}
          <div className="no-print" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

            <button onClick={handleNewDocument} style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Nuevo Cliente</span>
            </button>

            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por compañía o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>
              Clientes ({filteredDocuments.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
              {filteredDocuments.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No hay clientes guardados.</p>
              ) : (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDocument(doc)}
                    style={{
                      padding: '12px', borderRadius: '8px',
                      backgroundColor: formData.id === doc.id ? '#f1f5f9' : '#ffffff',
                      border: formData.id === doc.id ? '1px solid #94a3b8' : '1px solid #f1f5f9',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13.5px', color: '#0f172a' }}>{doc.companyName || 'Sin Nombre'}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{doc.client}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id, doc.companyName); }}
                      title="Eliminar cliente"
                      style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PANEL PRINCIPAL / FORMULARIO */}
          <div className="print-full" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                  {formData.id ? `Editando: ${formData.companyName}` : 'Nueva Documentación de Cliente'}
                </span>
                {formData.lastUpdated && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Última actualización: {formData.lastUpdated}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={handleExportPDF} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span>Exportar PDF</span>
                </button>

                <button type="button" onClick={handleSaveDocument} style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>Guardar</span>
                </button>
              </div>
            </div>

            {/* LOGO DE IMPRESIÓN — aparece arriba del título al imprimir */}
            <div className="print-logo-header">
              {!logoError ? (
                <img src="/logo.jpeg" alt="Solutions & Payroll" />
              ) : (
                <div style={{ fontWeight: '800', fontSize: '22px', color: '#0f172a' }}>
                  Solutions <span style={{ color: '#e11d48' }}>&</span> Payroll
                </div>
              )}
            </div>

            {/* TÍTULO DEL DOCUMENTO — solo visible al imprimir */}
            <div className="print-doc-title">Ficha de Documentación e Instructivos</div>

            {/* FECHA/HORA DE ACTUALIZACIÓN — solo visible al imprimir */}
            {formData.lastUpdated && (
              <div className="print-updated-row">
                <strong>Última actualización:</strong> {formData.lastUpdated}
              </div>
            )}

            {hasClientInfo && (
              <>
                <div className="print-section-heading">Información del Cliente</div>
                <PrintField label="Nombre de la Compañía" value={formData.companyName} />
                <PrintField label="Número de Identificación" value={formData.identificationNumber} />
                <PrintField label="Representante Legal" value={formData.legalRepresentative} />
                <PrintField label="Actividad Económica" value={formData.economicActivity} />
                <PrintField label="Dirección" value={formData.address} />
                <PrintField label="Ciudad" value={formData.city} />
                <PrintField label="País" value={formData.country} />
                <PrintField label="Cliente" value={formData.client} />
                <PrintField label="Contacto" value={formData.contactName} />
                <PrintField label="Correo Electrónico Contacto" value={formData.contactEmail} />
                <PrintField label="Enlace de Nómina" value={formData.payrollLink} />
              </>
            )}

            <form onSubmit={handleSaveDocument}>

              {/* --- Información del cliente --- */}
              <CollapsibleSection title="Información del Cliente" isOpen={openSections.info} onToggle={() => toggleSection('info')} printHidden>
                <FieldInput label="Nombre de la Compañía *" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Ej: Cliente ABC S.A.S" required />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldInput label="Número de Identificación" name="identificationNumber" value={formData.identificationNumber} onChange={handleChange} />
                  <FieldInput label="Actividad Económica" name="economicActivity" value={formData.economicActivity} onChange={handleChange} />
                </div>

                <FieldInput label="Representante Legal" name="legalRepresentative" value={formData.legalRepresentative} onChange={handleChange} />
                <FieldInput label="Dirección" name="address" value={formData.address} onChange={handleChange} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldInput label="Ciudad" name="city" value={formData.city} onChange={handleChange} />
                  <FieldInput label="País" name="country" value={formData.country} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldInput label="Cliente" name="client" value={formData.client} onChange={handleChange} />
                  <FieldInput label="Contacto" name="contactName" value={formData.contactName} onChange={handleChange} />
                </div>

                <FieldInput label="Correo Electrónico Contacto" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} />
                <FieldInput label="Enlace de Nómina" name="payrollLink" value={formData.payrollLink} onChange={handleChange} />
              </CollapsibleSection>

              {/* --- Resumen y generalidades (incluye auxilios y tabla de conceptos) --- */}
              <PrintTextBlock heading="Resumen" value={formData.summary} />
              <PrintTextBlock heading="Generalidades de Nómina" value={formData.payrollGeneralities} />

              {formData.allowances.some((a) =>
                (a.title && a.title.trim()) ||
                (a.description && a.description.trim()) ||
                (a.conceptRows && a.conceptRows.some((r) => (r.code && r.code.trim()) || (r.name && r.name.trim()) || (r.observation && r.observation.trim())))
              ) && (
                <div className="print-field-block">
                  <div className="print-section-heading">Auxilios</div>
                  {formData.allowances.map((a, index) => {
                    const hasText = (a.title && a.title.trim()) || (a.description && a.description.trim());
                    const rows = (a.conceptRows || []).filter((r) => (r.code && r.code.trim()) || (r.name && r.name.trim()) || (r.observation && r.observation.trim()));
                    if (!hasText && rows.length === 0) return null;
                    return (
                      <div key={a.id || index} className="print-field-block">
                        {a.title && a.title.trim() && (
                          <div className="print-only-text" style={{ fontWeight: 700, fontSize: '12.5px', margin: '6px 0 2px 0' }}>{a.title}</div>
                        )}
                        {a.description && a.description.trim() && (
                          <div className="print-only-text print-text-block">{a.description}</div>
                        )}
                        {rows.length > 0 && (
                          <table className="print-doc-table">
                            <tbody>
                              {rows.map((row, rIndex) => (
                                <tr key={row.id || rIndex}>
                                  <td style={{ width: '45%' }}>{row.code} {row.name}</td>
                                  <td style={{ width: '55%' }}>{row.observation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <CollapsibleSection title="Resumen y Generalidades" isOpen={openSections.resumen} onToggle={() => toggleSection('resumen')} printHidden>
                <FieldTextarea label="Resumen" name="summary" value={formData.summary} onChange={handleChange} rows={3} />
                <FieldTextarea label="Generalidades de Nómina" name="payrollGeneralities" value={formData.payrollGeneralities} onChange={handleChange} rows={3} />

                {/* --- Auxilios (repetibles) --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Auxilios</label>
                  <button
                    type="button"
                    onClick={addAllowanceRow}
                    style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + Agregar Auxilio
                  </button>
                </div>

                {formData.allowances.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0' }}>No hay auxilios agregados.</p>
                ) : (
                  formData.allowances.map((allowance, index) => (
                    <div key={allowance.id || index} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '10px', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => removeAllowanceRow(index)}
                        style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        X
                      </button>
                      <FieldInput
                        label="Título del Auxilio / Detalle"
                        name={`allowanceTitle-${index}`}
                        value={allowance.title}
                        onChange={(e) => handleAllowanceChange(index, 'title', e.target.value)}
                        placeholder="Ej: Auxilio de Alimentación"
                      />
                      <FieldTextarea
                        label="Descripción del Auxilio"
                        name={`allowanceDescription-${index}`}
                        value={allowance.description}
                        onChange={(e) => handleAllowanceChange(index, 'description', e.target.value)}
                        rows={3}
                      />

                      {/* --- Tabla propia de este Auxilio --- */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Tabla del Auxilio</label>
                        <button
                          type="button"
                          onClick={() => addAllowanceConceptRow(index)}
                          style={{ padding: '5px 10px', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          + Agregar Fila
                        </button>
                      </div>

                      {(allowance.conceptRows || []).length === 0 ? (
                        <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '0 0 4px 0' }}>Sin filas en la tabla de este auxilio.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {(allowance.conceptRows || []).map((row, rIndex) => (
                            <div key={row.id || rIndex} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 28px', gap: '6px', alignItems: 'center' }}>
                              <input
                                type="text"
                                placeholder="Código"
                                value={row.code}
                                onChange={(e) => handleAllowanceConceptChange(index, rIndex, 'code', e.target.value)}
                                style={{ padding: '7px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', outline: 'none' }}
                              />
                              <input
                                type="text"
                                placeholder="Nombre concepto"
                                value={row.name}
                                onChange={(e) => handleAllowanceConceptChange(index, rIndex, 'name', e.target.value)}
                                style={{ padding: '7px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', outline: 'none' }}
                              />
                              <input
                                type="text"
                                placeholder="Observación"
                                value={row.observation}
                                onChange={(e) => handleAllowanceConceptChange(index, rIndex, 'observation', e.target.value)}
                                style={{ padding: '7px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', outline: 'none' }}
                              />
                              <button
                                type="button"
                                onClick={() => removeAllowanceConceptRow(index, rIndex)}
                                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', fontSize: '11px' }}
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CollapsibleSection>

              {/* --- Reportes de Nómina, Seguridad Social y Reportes Mensuales (NUEVO) --- */}
              <PrintTextBlock heading="Reportes de Nómina" value={formData.payrollReportsInfo} />
              <PrintTextBlock heading="Nómina Día 31" value={formData.day31Info} />

              {(formData.ssDueDate.trim() || formData.ssARL.trim() || formData.ssCajas.trim() || formData.ssGeneralNotes.trim()) && (
                <div className="print-field-block">
                  <div className="print-section-heading">Generalidades de Seguridad Social</div>
                  <PrintField label="Fecha Vencimiento" value={formData.ssDueDate} />
                  <PrintField label="ARL" value={formData.ssARL} />
                  <PrintField label="Múltiples Cajas" value={formData.ssCajas} />
                  {formData.ssGeneralNotes.trim() && (
                    <div className="print-only-text print-text-block">{formData.ssGeneralNotes}</div>
                  )}
                </div>
              )}

              <PrintTextBlock heading="Reporte Costos y Provisiones" value={formData.costsProvisionsReport} />

              {formData.monthlyReports.some((r) => (r.title && r.title.trim()) || (r.description && r.description.trim())) && (
                <div className="print-field-block">
                  <div className="print-section-heading">Reportes Mensuales</div>
                  {formData.monthlyReports.map((r, index) =>
                    (r.title && r.title.trim()) || (r.description && r.description.trim()) ? (
                      <div key={r.id || index} className="print-field-block">
                        <div className="print-only-text" style={{ fontWeight: 700, fontSize: '12.5px', margin: '6px 0 2px 0' }}>
                          {r.title}{r.fileName ? ` (${r.fileName})` : ''}
                        </div>
                        {r.description && r.description.trim() && (
                          <div className="print-only-text print-text-block">{r.description}</div>
                        )}
                        {r.route && r.route.trim() && (
                          <div className="print-only-text print-text-block"><strong>Ruta: </strong>{r.route}</div>
                        )}
                        {r.images && r.images.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                            {r.images.map((img) => (
                              <div key={img.id} className="print-image-card" style={{ border: '1px solid #e2e8f0', padding: '4px', borderRadius: '6px' }}>
                                <img src={img.url} alt={img.name} style={{ maxWidth: '260px', maxHeight: '170px', objectFit: 'contain' }} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              )}

              <PrintTextBlock heading="Afiliaciones a Seguridad Social" value={formData.affiliationsNotes} />

              <CollapsibleSection title="Reportes de Nómina y Seguridad Social" isOpen={openSections.reportes} onToggle={() => toggleSection('reportes')} printHidden>
                <FieldTextarea label="Reportes de Nómina (introducción / ruta general)" name="payrollReportsInfo" value={formData.payrollReportsInfo} onChange={handleChange} rows={3} />
                <FieldTextarea label="Nómina Día 31" name="day31Info" value={formData.day31Info} onChange={handleChange} rows={2} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldInput label="Fecha Vencimiento (Seg. Social)" name="ssDueDate" value={formData.ssDueDate} onChange={handleChange} placeholder="Ej: 9 día hábil" />
                  <FieldInput label="ARL" name="ssARL" value={formData.ssARL} onChange={handleChange} />
                </div>
                <FieldInput label="Múltiples Cajas" name="ssCajas" value={formData.ssCajas} onChange={handleChange} />
                <FieldTextarea label="Generalidades de Autoliquidación / Notas" name="ssGeneralNotes" value={formData.ssGeneralNotes} onChange={handleChange} rows={3} />

                <FieldTextarea label="Reporte Costos y Provisiones" name="costsProvisionsReport" value={formData.costsProvisionsReport} onChange={handleChange} rows={3} />

                {/* --- Reportes Mensuales (repetibles, con imágenes) --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Reportes Mensuales</label>
                  <button
                    type="button"
                    onClick={addMonthlyReportRow}
                    style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + Agregar Reporte
                  </button>
                </div>

                {formData.monthlyReports.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0' }}>No hay reportes mensuales agregados.</p>
                ) : (
                  formData.monthlyReports.map((report, index) => (
                    <div key={report.id || index} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '10px', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => removeMonthlyReportRow(index)}
                        style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        X
                      </button>
                      <FieldInput
                        label="Título del Reporte"
                        name={`reportTitle-${index}`}
                        value={report.title}
                        onChange={(e) => handleMonthlyReportChange(index, 'title', e.target.value)}
                        placeholder="Ej: Aportes Voluntarios"
                      />
                      <FieldInput
                        label="Nombre de Archivo / Código"
                        name={`reportFileName-${index}`}
                        value={report.fileName}
                        onChange={(e) => handleMonthlyReportChange(index, 'fileName', e.target.value)}
                        placeholder="Ej: SherwinCO_AAAAMM_APVol_Skandia"
                      />
                      <FieldTextarea
                        label="Descripción"
                        name={`reportDescription-${index}`}
                        value={report.description}
                        onChange={(e) => handleMonthlyReportChange(index, 'description', e.target.value)}
                        rows={2}
                      />
                      <FieldTextarea
                        label="Ruta en el sistema"
                        name={`reportRoute-${index}`}
                        value={report.route}
                        onChange={(e) => handleMonthlyReportChange(index, 'route', e.target.value)}
                        rows={2}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Imágenes de referencia</label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', backgroundColor: '#e2e8f0', color: '#0f172a', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}>
                          + Añadir imagen
                          <input type="file" accept="image/*" multiple onChange={(e) => handleReportImageUpload(index, e)} style={{ display: 'none' }} />
                        </label>
                      </div>

                      {report.images && report.images.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                          {report.images.map((img) => (
                            <div key={img.id} style={{ border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', backgroundColor: '#fff', position: 'relative' }}>
                              <img src={img.url} alt={img.name} style={{ width: '100%', maxHeight: '110px', objectFit: 'contain', borderRadius: '4px' }} />
                              <button
                                type="button"
                                onClick={() => handleRemoveReportImage(index, img.id)}
                                style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px' }}
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}

                <FieldTextarea label="Afiliaciones a Seguridad Social" name="affiliationsNotes" value={formData.affiliationsNotes} onChange={handleChange} rows={3} />
              </CollapsibleSection>

              {/* --- Servicios Adicionales (NUEVO) --- */}
              {formData.additionalServices.some((s) => (s.title && s.title.trim()) || (s.description && s.description.trim())) && (
                <div className="print-field-block">
                  <div className="print-section-heading">Servicios Adicionales</div>
                  {formData.additionalServices.map((s, index) =>
                    (s.title && s.title.trim()) || (s.description && s.description.trim()) ? (
                      <div key={s.id || index} className="print-only-text print-text-block" style={{ marginBottom: '8px' }}>
                        <strong>{s.title ? `${s.title}: ` : 'Servicio: '}</strong>
                        {s.description}
                      </div>
                    ) : null
                  )}
                </div>
              )}

              <CollapsibleSection title="Servicios Adicionales" isOpen={openSections.servicios} onToggle={() => toggleSection('servicios')} printHidden>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Servicios Adicionales</label>
                  <button
                    type="button"
                    onClick={addAdditionalServiceRow}
                    style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + Agregar Servicio
                  </button>
                </div>

                {formData.additionalServices.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0' }}>No hay servicios adicionales agregados.</p>
                ) : (
                  formData.additionalServices.map((service, index) => (
                    <div key={service.id || index} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '10px', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => removeAdditionalServiceRow(index)}
                        style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        X
                      </button>
                      <FieldInput
                        label="Título del Servicio"
                        name={`serviceTitle-${index}`}
                        value={service.title}
                        onChange={(e) => handleAdditionalServiceChange(index, 'title', e.target.value)}
                        placeholder="Ej: Contratación"
                      />
                      <FieldTextarea
                        label="Descripción"
                        name={`serviceDescription-${index}`}
                        value={service.description}
                        onChange={(e) => handleAdditionalServiceChange(index, 'description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  ))
                )}
              </CollapsibleSection>

              {/* --- Consideraciones y reglas --- */}
              {hasConsiderations && (
                <div className="print-section-heading">Consideraciones y Reglas del Cliente</div>
              )}
              <CollapsibleSection title="Consideraciones y Reglas del Cliente" isOpen={openSections.consideraciones} onToggle={() => toggleSection('consideraciones')}>
                <p className="no-print" style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px 0' }}>
                  Detalles a considerar (correos de copia, fechas límite de entrega, requerimientos especiales).
                </p>
                <textarea
                  name="considerations"
                  rows={4}
                  value={formData.considerations}
                  onChange={handleChange}
                  placeholder="Ej: Copiar siempre a gestion@cliente.com. Enviar reportes antes de las 5:00 PM..."
                  className="no-print"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
                />
                {hasConsiderations && (
                  <div className="print-only-text print-text-block">{formData.considerations}</div>
                )}
              </CollapsibleSection>

              {/* --- Instrucciones operativas --- */}
              {hasInstructions && (
                <div className="print-section-heading">Instrucciones Operativas / Paso a Paso</div>
              )}
              <CollapsibleSection title="Instrucciones Operativas / Paso a Paso" isOpen={openSections.instrucciones} onToggle={() => toggleSection('instrucciones')}>
                <p className="no-print" style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px 0' }}>
                  Secuencia detallada que se debe ejecutar para la atención o procesamiento del cliente.
                </p>
                <textarea
                  name="instructions"
                  rows={5}
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Paso 1: Descargar archivo base. Paso 2: Verificar datos de entrada..."
                  className="no-print"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
                />
                {hasInstructions && (
                  <div className="print-only-text print-text-block">{formData.instructions}</div>
                )}
              </CollapsibleSection>

              {/* --- Anexos e imágenes --- */}
              {hasAnexos && (
                <div className="print-section-heading">Anexos</div>
              )}
              <CollapsibleSection title="Capturas de Pantalla y Anexos Visuales" isOpen={openSections.anexos} onToggle={() => toggleSection('anexos')}>
                <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#0f172a', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Añadir más imágenes</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {formData.images.length === 0 ? (
                  <div className="no-print" style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '24px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <label style={{ cursor: 'pointer', fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>
                      Haz clic para subir imágenes
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                      Adjunta capturas de pantalla, comprobantes o diagramas (PNG, JPG).
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                    {formData.images.map((img) => (
                      <div key={img.id} className="print-image-card" style={{ border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', backgroundColor: '#fff', position: 'relative' }}>
                        <img src={img.url} alt={img.name} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '6px' }} />
                        <button
                          type="button"
                          className="no-print"
                          onClick={() => handleRemoveImage(img.id)}
                          style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '6px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {img.name}
                        </p>
                      </div>
                    ))}

                    <label className="no-print" style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', minHeight: '160px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '6px' }}>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Añadir más</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                )}
              </CollapsibleSection>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Sección desplegable (colapsa en pantalla) ----
// printHidden=true  -> el contenido NUNCA se imprime (usar cuando el resumen ya se imprime aparte, ej. datos simples)
// printHidden=false -> el contenido SIEMPRE se imprime completo, sin importar si está cerrada en pantalla
//                       (usar cuando dentro de la sección hay texto/tabla/imágenes que sí deben imprimirse)
function CollapsibleSection({ title, isOpen, onToggle, children, printHidden = false }) {
  return (
    <div className="collapsible-section" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '16px', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={onToggle}
        className="no-print"
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', backgroundColor: '#f8fafc', border: 'none', borderBottom: isOpen ? '1px solid #e2e8f0' : 'none',
          cursor: 'pointer', fontSize: '13.5px', fontWeight: '700', color: '#0f172a', textAlign: 'left',
        }}
      >
        <span>{title}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className={printHidden ? 'print-form-element' : 'collapsible-body'}
        style={{ display: isOpen ? 'block' : 'none', padding: isOpen ? '16px' : '0 16px' }}
      >
        {children}
      </div>
    </div>
  );
}

// ---- Subcomponentes de campo reutilizables (solo pantalla) ----
function FieldInput({ label, name, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box', outline: 'none' }}
      />
    </div>
  );
}

function FieldTextarea({ label, name, value, onChange, rows = 3 }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}
      />
    </div>
  );
}