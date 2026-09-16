import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

// ==========================================================
// CONFIGURACIÓN DE FIREBASE
// Reemplaza estos valores por los de tu proyecto en
// https://console.firebase.google.com  ->  Configuración del proyecto -> "Tus apps"
// ==========================================================
const firebaseConfig = {
  apiKey: 'AIzaSyAZjcxUznPg5s80t07m_I3zOR-hYhX6ocI',
  authDomain: 'solutions-payroll-portal.firebaseapp.com',
  projectId: 'solutions-payroll-portal',
  storageBucket: 'solutions-payroll-portal.firebasestorage.app',
  messagingSenderId: '503526784713',
  appId: '1:503526784713:web:20f7b2022d34f732075718',
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
// Mantiene la sesión iniciada aunque se cierre el navegador
setPersistence(auth, browserLocalPersistence);

const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

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
  // Software de nómina (antes "Enlace de Nómina")
  payrollSoftwareName: '',
  payrollSoftwareOwnership: 'propio', // 'propio' | 'tercero'
  // Documentos del cliente: RUT y Cámara de Comercio
  rutFileName: '',
  rutFileUrl: '',
  rutUpdatedAt: '',
  camaraFileName: '',
  camaraFileUrl: '',
  camaraUpdatedAt: '',
  // Sábana de conceptos (queda como link al Excel, no el archivo en sí)
  sabanaConceptosLink: '',
  // Resumen y generalidades (del primer código)
  summary: '',
  payrollGeneralities: '',
  allowances: [],
  // Provisiones (concepto + fórmula/opción de cálculo)
  provisions: [],
  // Reportes de Nómina y Seguridad Social (nuevo)
  payrollReportsInfo: '',
  day31Info: '',
  ssDueDate: '',
  ssARL: '',
  ssCajas: '',
  ssOperador: '',
  ssGeneralNotes: '',
  costsProvisionsReport: '',
  monthlyReports: [],
  affiliationsNotes: '',
  voluntaryPaymentSupportNotes: '',
  voluntaryPaymentSupportImages: [],
  // Módulo de Autoconsultas
  autoconsultaEnabled: 'no', // 'si' | 'no'
  autoconsultaDescription: '',
  // Envío de Comprobantes
  comprobantesEnabled: 'no', // 'si' | 'no'
  comprobantesDescription: '',
  // Servicios adicionales (nuevo)
  additionalServices: [],
  // Reglas e instructivo (del segundo código)
  considerations: '',
  instructions: '',
  // Anexos
  images: [],
  lastUpdated: '',
};

// ==========================================================
// SECCIONES DEL MENÚ LATERAL (dashboard)
// ==========================================================
const MENU_SECTIONS = [
  { id: 'info', label: 'Información del Cliente', icon: 'building' },
  { id: 'documentos', label: 'Documentos (RUT / C. Comercio)', icon: 'file' },
  { id: 'resumen', label: 'Resumen y Conceptos', icon: 'list' },
  { id: 'provisiones', label: 'Provisiones', icon: 'calc' },
  { id: 'reportes', label: 'Reportes y Seguridad Social', icon: 'chart' },
  { id: 'soportes', label: 'Soportes y Afiliaciones', icon: 'shield' },
  { id: 'autoconsultas', label: 'Autoconsultas y Comprobantes', icon: 'send' },
  { id: 'servicios', label: 'Servicios Adicionales', icon: 'plus' },
  { id: 'consideraciones', label: 'Consideraciones y Reglas', icon: 'alert' },
  { id: 'instrucciones', label: 'Instructivo Paso a Paso', icon: 'steps' },
  { id: 'anexos', label: 'Anexos e Imágenes', icon: 'image' },
];

function MenuIcon({ name }) {
  const common = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'building':
      return <svg {...common}><path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /></svg>;
    case 'file':
      return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
    case 'list':
      return <svg {...common}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
    case 'calc':
      return <svg {...common}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="11" x2="8" y2="11.01" /><line x1="12" y1="11" x2="12" y2="11.01" /><line x1="16" y1="11" x2="16" y2="11.01" /><line x1="8" y1="16" x2="16" y2="16" /></svg>;
    case 'chart':
      return <svg {...common}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case 'shield':
      return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case 'send':
      return <svg {...common}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
    case 'plus':
      return <svg {...common}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
    case 'alert':
      return <svg {...common}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case 'steps':
      return <svg {...common}><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
    case 'image':
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
    default:
      return null;
  }
}

function MainApp({ onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [activeSection, setActiveSection] = useState('info');
  const [showClientList, setShowClientList] = useState(true);

  useEffect(() => {
    const clientsCollection = collection(firestore, 'clients');
    const unsubscribe = onSnapshot(
      clientsCollection,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
        setDocuments(docs);
      },
      (err) => {
        console.error('Error escuchando clientes en Firestore:', err);
      }
    );
    return () => unsubscribe();
  }, []);

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
      allowances: [...prev.allowances, { id: Date.now() + Math.random(), title: '', description: '', salarial: 'no', partidaContrapartida: 'no', conceptRows: [] }],
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

  // ---- Provisiones (repetibles: concepto + fórmula/opción de cálculo) ----
  const handleProvisionChange = (index, field, value) => {
    const updated = [...formData.provisions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, provisions: updated }));
  };

  const addProvisionRow = () => {
    setFormData((prev) => ({
      ...prev,
      provisions: [...prev.provisions, { id: Date.now() + Math.random(), concept: '', description: '' }],
    }));
  };

  const removeProvisionRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      provisions: prev.provisions.filter((_, i) => i !== index),
    }));
  };

  // ---- Carga de RUT y Cámara de Comercio a Firebase Storage ----
  const handleRutUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    const clientId = formData.id || String(Date.now());
    const isNew = !formData.id;

    try {
      const fileRef = ref(storage, `clients/${clientId}/rut_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      setFormData((prev) => ({
        ...prev,
        id: isNew ? clientId : prev.id,
        rutFileName: file.name,
        rutFileUrl: url,
        rutUpdatedAt: new Date().toLocaleString('es-CO'),
      }));
    } catch (err) {
      console.error('Error subiendo RUT a Firebase Storage:', err);
      alert('Hubo un error subiendo el RUT. Intenta de nuevo.');
    }
  };

  const handleRemoveRut = async () => {
    if (formData.rutFileName && formData.id) {
      try {
        const fileRef = ref(storage, `clients/${formData.id}/rut_${formData.rutFileName}`);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('No se pudo borrar el archivo en Storage (puede que ya no exista):', err);
      }
    }
    setFormData((prev) => ({ ...prev, rutFileName: '', rutFileUrl: '', rutUpdatedAt: '' }));
  };

  const handleCamaraUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    const clientId = formData.id || String(Date.now());
    const isNew = !formData.id;

    try {
      const fileRef = ref(storage, `clients/${clientId}/camara_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      setFormData((prev) => ({
        ...prev,
        id: isNew ? clientId : prev.id,
        camaraFileName: file.name,
        camaraFileUrl: url,
        camaraUpdatedAt: new Date().toLocaleString('es-CO'),
      }));
    } catch (err) {
      console.error('Error subiendo Cámara de Comercio a Firebase Storage:', err);
      alert('Hubo un error subiendo la Cámara de Comercio. Intenta de nuevo.');
    }
  };

  const handleRemoveCamara = async () => {
    if (formData.camaraFileName && formData.id) {
      try {
        const fileRef = ref(storage, `clients/${formData.id}/camara_${formData.camaraFileName}`);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('No se pudo borrar el archivo en Storage (puede que ya no exista):', err);
      }
    }
    setFormData((prev) => ({ ...prev, camaraFileName: '', camaraFileUrl: '', camaraUpdatedAt: '' }));
  };

  // ---- Reportes Mensuales (repetibles, con imágenes propias en Firebase Storage) ----
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

  const handleReportImageUpload = async (index, e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    const clientId = formData.id || String(Date.now());
    const isNew = !formData.id;

    for (const file of files) {
      try {
        const imgId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const fileRef = ref(storage, `clients/${clientId}/reports/${imgId}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        const newImage = { id: imgId, url, name: file.name, path: fileRef.fullPath };

        setFormData((prev) => {
          const updated = [...prev.monthlyReports];
          updated[index] = { ...updated[index], images: [...(updated[index].images || []), newImage] };
          return { ...prev, id: isNew ? clientId : prev.id, monthlyReports: updated };
        });
      } catch (err) {
        console.error('Error subiendo imagen de reporte:', err);
        alert(`Hubo un error subiendo "${file.name}".`);
      }
    }
  };

  const handleRemoveReportImage = async (reportIndex, imageId) => {
    const report = formData.monthlyReports[reportIndex];
    const img = (report.images || []).find((i) => i.id === imageId);
    if (img && img.path) {
      try {
        await deleteObject(ref(storage, img.path));
      } catch (err) {
        console.warn('No se pudo borrar la imagen en Storage:', err);
      }
    }
    setFormData((prev) => {
      const updated = [...prev.monthlyReports];
      updated[reportIndex] = {
        ...updated[reportIndex],
        images: (updated[reportIndex].images || []).filter((i) => i.id !== imageId),
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

  // ---- Imágenes (anexos generales) en Firebase Storage ----
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    const clientId = formData.id || String(Date.now());
    const isNew = !formData.id;

    for (const file of files) {
      try {
        const imgId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const fileRef = ref(storage, `clients/${clientId}/anexos/${imgId}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        const newImage = { id: imgId, url, name: file.name, path: fileRef.fullPath };

        setFormData((prev) => ({
          ...prev,
          id: isNew ? clientId : prev.id,
          images: [...prev.images, newImage],
        }));
      } catch (err) {
        console.error('Error subiendo anexo:', err);
        alert(`Hubo un error subiendo "${file.name}".`);
      }
    }
  };

  const handleRemoveImage = async (id) => {
    const img = formData.images.find((i) => i.id === id);
    if (img && img.path) {
      try {
        await deleteObject(ref(storage, img.path));
      } catch (err) {
        console.warn('No se pudo borrar la imagen en Storage:', err);
      }
    }
    setFormData((prev) => ({ ...prev, images: prev.images.filter((i) => i.id !== id) }));
  };

  // ---- Soportes de Pago Voluntarios (imágenes) en Firebase Storage ----
  const handleVoluntaryImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    const clientId = formData.id || String(Date.now());
    const isNew = !formData.id;

    for (const file of files) {
      try {
        const imgId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const fileRef = ref(storage, `clients/${clientId}/voluntarios/${imgId}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        const newImage = { id: imgId, url, name: file.name, path: fileRef.fullPath };

        setFormData((prev) => ({
          ...prev,
          id: isNew ? clientId : prev.id,
          voluntaryPaymentSupportImages: [...prev.voluntaryPaymentSupportImages, newImage],
        }));
      } catch (err) {
        console.error('Error subiendo soporte voluntario:', err);
        alert(`Hubo un error subiendo "${file.name}".`);
      }
    }
  };

  const handleRemoveVoluntaryImage = async (id) => {
    const img = formData.voluntaryPaymentSupportImages.find((i) => i.id === id);
    if (img && img.path) {
      try {
        await deleteObject(ref(storage, img.path));
      } catch (err) {
        console.warn('No se pudo borrar la imagen en Storage:', err);
      }
    }
    setFormData((prev) => ({
      ...prev,
      voluntaryPaymentSupportImages: prev.voluntaryPaymentSupportImages.filter((i) => i.id !== id),
    }));
  };

  // ---- Guardar / seleccionar / eliminar documentos (Firestore) ----
  const handleSaveDocument = async (e) => {
    if (e) e.preventDefault();

    if (!formData.companyName.trim()) {
      alert('Por favor, ingresa el nombre de la compañía.');
      return;
    }

    const now = new Date().toLocaleString('es-CO');
    const isNew = !formData.id;
    const docId = formData.id || String(Date.now());
    const savedDoc = { ...formData, id: docId, lastUpdated: now };

    try {
      const docRef = doc(firestore, 'clients', docId);
      await setDoc(docRef, savedDoc);
      setFormData(savedDoc);
      alert(isNew ? `Documentación de "${formData.companyName}" guardada.` : `Documentación de "${formData.companyName}" actualizada.`);
    } catch (err) {
      console.error('Error guardando en Firestore:', err);
      alert('Hubo un error guardando el cliente. Intenta de nuevo.');
    }
  };

  const handleSelectDocument = (doc) => {
    setFormData({ ...initialFormData, ...doc });
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
  };

  const handleDeleteDocument = async (id, companyName) => {
    if (confirm(`¿Eliminar la documentación de "${companyName}"?`)) {
      try {
        await deleteDoc(doc(firestore, 'clients', id));
        if (formData.id === id) handleNewDocument();
      } catch (err) {
        console.error('Error eliminando en Firestore:', err);
        alert('Hubo un error eliminando el cliente. Intenta de nuevo.');
      }
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
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .no-print { display: none !important; }
          .main-layout { display: block !important; }
          .print-full {
            width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important;
            box-shadow: none !important; border: none !important; border-radius: 0 !important; background-color: white !important;
          }
          body { background-color: white !important; }

          .print-logo-header {
            display: flex !important;
            position: fixed !important;
            top: 0 !important; left: 0 !important; right: 0 !important;
            width: 100% !important; height: 2.5cm !important;
            margin: 0 !important; padding: 0 !important;
            background: #ffffff !important;
            align-items: center !important; justify-content: center !important;
            z-index: 999999 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          }
          .print-logo-header img {
            display: block !important;
            width: auto !important; height: 55px !important;
            max-width: 220px !important; max-height: 55px !important;
            object-fit: contain !important;
            filter: none !important; -webkit-filter: none !important;
            opacity: 1 !important;
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          }
          .print-logo-header div { display: block !important; }

          .print-doc-title { display: block !important; text-align: center; font-weight: 700; font-size: 15px; color: #000000; margin: 0 0 22px 0; }

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

          .section-panel { display: block !important; }
          .section-panel.print-form-element { display: none !important; }
          .app-sidebar, .app-menu { display: none !important; }

          @page { size: letter; margin-top: 3.3cm; margin-right: 2.5cm; margin-bottom: 2.5cm; margin-left: 2.5cm; }
        }
        @media screen {
          .print-logo-header, .print-doc-table { display: none; }
          .print-only-text, .print-doc-title, .print-section-heading, .print-field-row { display: none; }
          .print-only-block { display: none; }
        }

        @media screen and (max-width: 900px) {
          .main-layout { grid-template-columns: 1fr !important; }
          .app-sidebar { position: static !important; }
          .app-menu > div { flex-direction: row !important; flex-wrap: wrap !important; }
          .app-menu button { width: auto !important; flex: 1 1 45% !important; }
        }
        @media screen and (max-width: 640px) {
          .two-col-grid { grid-template-columns: 1fr !important; }
          .app-navbar { padding: 14px 16px !important; }
          .app-panel-header { flex-direction: column; align-items: flex-start !important; }
          .app-header-actions { width: 100%; }
          .app-header-actions button { flex: 1 1 auto; justify-content: center; }
        }
        @media screen and (max-width: 480px) {
          .print-full { padding: 16px 12px !important; }
        }
      `}</style>

      {/* NAVBAR SUPERIOR CORPORATIVO (solo pantalla) */}
      <header className="no-print app-navbar" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!logoError ? (
            <img src="/logo.jpeg" alt="Solutions & Payroll" style={{ height: '60px', objectFit: 'contain' }} onError={() => setLogoError(true)} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', fontWeight: '800', lineHeight: '1.1', fontSize: '26px' }}>
              <span style={{ color: '#0f172a' }}>Solutions</span>
              <span style={{ color: '#0f172a' }}><span style={{ color: '#e11d48' }}>&</span> Payroll</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 22px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '15px', color: '#1e293b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Bienvenido, Usuario</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '16px', padding: '8px 16px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Salir</span>
          </button>
        </div>
      </header>

      <div className="print-full app-shell" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>

        <div className="main-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '22px', alignItems: 'start' }}>

          {/* ===== SIDEBAR: CLIENTES + MENÚ DE SECCIONES ===== */}
          <aside className="no-print app-sidebar" style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <button
                type="button"
                onClick={handleNewDocument}
                style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Nuevo Cliente</span>
              </button>

              <div
                onClick={() => setShowClientList(!showClientList)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showClientList ? '10px' : '0' }}
              >
                <h4 style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
                  Clientes ({filteredDocuments.length})
                </h4>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showClientList ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {showClientList && (
                <>
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }}>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', padding: '9px 9px 9px 34px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12.5px', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                    {filteredDocuments.length === 0 ? (
                      <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>No hay clientes guardados.</p>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleSelectDocument(doc)}
                          style={{
                            padding: '9px 10px', borderRadius: '8px',
                            backgroundColor: formData.id === doc.id ? '#f1f5f9' : '#ffffff',
                            border: formData.id === doc.id ? '1px solid #94a3b8' : '1px solid #f1f5f9',
                            cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px',
                          }}
                        >
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: '600', fontSize: '12.5px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.companyName || 'Sin Nombre'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.client}</div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id, doc.companyName); }}
                            title="Eliminar cliente"
                            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <nav className="app-menu" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h4 style={{ margin: '4px 6px 10px 6px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
                Secciones
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {MENU_SECTIONS.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left',
                        padding: '9px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px',
                        fontWeight: isActive ? '700' : '500',
                        color: isActive ? '#ffffff' : '#475569',
                        backgroundColor: isActive ? '#0f172a' : 'transparent',
                        border: 'none', transition: 'background-color 0.15s',
                      }}
                    >
                      <span style={{ display: 'flex', flexShrink: 0 }}><MenuIcon name={section.icon} /></span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowInstructions(!showInstructions)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#1e40af', fontSize: '12.5px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>¿Cómo se usa?</span>
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showInstructions ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {showInstructions && (
                <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#1e3a8a', lineHeight: '1.55' }}>
                  <p style={{ margin: '3px 0' }}>Elige un cliente (o crea uno nuevo) y navega por las secciones del menú.</p>
                  <p style={{ margin: '3px 0' }}>En <strong>Documentos</strong> se cargan el RUT y la Cámara de Comercio actualizados.</p>
                  <p style={{ margin: '3px 0' }}>Recuerda <strong>Guardar</strong> antes de cambiar de cliente. Con <strong>Exportar PDF</strong> sale la ficha completa, no solo la sección visible.</p>
                </div>
              )}
            </div>
          </aside>

          {/* PANEL PRINCIPAL / FORMULARIO */}
          <div className="print-full" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

            <div className="no-print app-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>
                  {formData.companyName || 'Nueva Documentación de Cliente'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                  {formData.id ? 'Editando ficha existente' : 'Ficha sin guardar'}
                  {formData.lastUpdated ? ` · Última actualización: ${formData.lastUpdated}` : ''}
                </div>
              </div>

              <div className="app-header-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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

            <div className="print-logo-header">
              {!logoError ? (
                <img src="/logo.jpeg" alt="Solutions & Payroll" />
              ) : (
                <div style={{ fontWeight: '800', fontSize: '22px', color: '#0f172a' }}>
                  Solutions <span style={{ color: '#e11d48' }}>&</span> Payroll
                </div>
              )}
            </div>

            <div className="print-doc-title">Ficha de Documentación e Instructivos</div>

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
            <PrintField
              label="Software del Sistema"
              value={formData.payrollSoftwareName ? `${formData.payrollSoftwareName} (${formData.payrollSoftwareOwnership === 'tercero' ? 'Tercero / del cliente' : 'Propio'})` : ''}
            />

            {(formData.rutFileName || formData.camaraFileName || formData.sabanaConceptosLink.trim()) && (
              <div className="print-field-block">
                <div className="print-section-heading">Documentos del Cliente</div>
                <PrintField label="RUT" value={formData.rutFileName ? `${formData.rutFileName} (actualizado: ${formData.rutUpdatedAt})` : ''} />
                <PrintField label="Cámara de Comercio" value={formData.camaraFileName ? `${formData.camaraFileName} (actualizado: ${formData.camaraUpdatedAt})` : ''} />
                <PrintField label="Sábana de Conceptos (link)" value={formData.sabanaConceptosLink} />
              </div>
            )}

            <form onSubmit={handleSaveDocument}>

              <SectionPanel id="info" activeSection={activeSection} title="Información del Cliente" printHidden>
                <FieldInput label="Nombre de la Compañía *" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Ej: Cliente ABC S.A.S" required />

                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldInput label="Número de Identificación" name="identificationNumber" value={formData.identificationNumber} onChange={handleChange} />
                  <FieldInput label="Actividad Económica" name="economicActivity" value={formData.economicActivity} onChange={handleChange} />
                </div>

                <FieldInput label="Representante Legal" name="legalRepresentative" value={formData.legalRepresentative} onChange={handleChange} />
                <FieldInput label="Dirección" name="address" value={formData.address} onChange={handleChange} />

                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldInput label="Ciudad" name="city" value={formData.city} onChange={handleChange} />
                  <FieldInput label="País" name="country" value={formData.country} onChange={handleChange} />
                </div>

                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldInput label="Cliente" name="client" value={formData.client} onChange={handleChange} />
                  <FieldInput label="Contacto" name="contactName" value={formData.contactName} onChange={handleChange} />
                </div>

                <FieldInput label="Correo Electrónico Contacto" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} />

                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldInput label="Software del Sistema" name="payrollSoftwareName" value={formData.payrollSoftwareName} onChange={handleChange} placeholder="Ej: Novasoft, Libra, MIDASOFT, SAP..." />
                  <FieldSelect
                    label="Propio / Tercero"
                    name="payrollSoftwareOwnership"
                    value={formData.payrollSoftwareOwnership}
                    onChange={handleChange}
                    options={[
                      { value: 'propio', label: 'Propio (de nosotros)' },
                      { value: 'tercero', label: 'Tercero (del cliente)' },
                    ]}
                  />
                </div>
              </SectionPanel>

              <SectionPanel id="documentos" activeSection={activeSection} title="Documentos del Cliente" printHidden>
                <p className="no-print" style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>
                  Sube el archivo más reciente. Al reemplazarlo, queda guardada la fecha de actualización.
                </p>

                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FileUploadField
                    label="RUT"
                    fileName={formData.rutFileName}
                    fileUrl={formData.rutFileUrl}
                    updatedAt={formData.rutUpdatedAt}
                    onUpload={handleRutUpload}
                    onRemove={handleRemoveRut}
                  />
                  <FileUploadField
                    label="Cámara de Comercio"
                    fileName={formData.camaraFileName}
                    fileUrl={formData.camaraFileUrl}
                    updatedAt={formData.camaraUpdatedAt}
                    onUpload={handleCamaraUpload}
                    onRemove={handleRemoveCamara}
                  />
                </div>

                <FieldInput
                  label="Sábana de Conceptos (link al Excel)"
                  name="sabanaConceptosLink"
                  value={formData.sabanaConceptosLink}
                  onChange={handleChange}
                  placeholder="Pega aquí el link del Excel (SharePoint, Drive, etc.)"
                />
              </SectionPanel>

              <PrintTextBlock heading="Resumen" value={formData.summary} />
              <PrintTextBlock heading="Generalidades de Nómina" value={formData.payrollGeneralities} />

              {formData.allowances.some((a) =>
                (a.title && a.title.trim()) ||
                (a.description && a.description.trim()) ||
                (a.conceptRows && a.conceptRows.some((r) => (r.code && r.code.trim()) || (r.name && r.name.trim()) || (r.observation && r.observation.trim())))
              ) && (
                <div className="print-field-block">
                  <div className="print-section-heading">Conceptos</div>
                  {formData.allowances.map((a, index) => {
                    const hasText = (a.title && a.title.trim()) || (a.description && a.description.trim());
                    const rows = (a.conceptRows || []).filter((r) => (r.code && r.code.trim()) || (r.name && r.name.trim()) || (r.observation && r.observation.trim()));
                    if (!hasText && rows.length === 0) return null;
                    return (
                      <div key={a.id || index} className="print-field-block">
                        {a.title && a.title.trim() && (
                          <div className="print-only-text" style={{ fontWeight: 700, fontSize: '12.5px', margin: '6px 0 2px 0' }}>{a.title}</div>
                        )}
                        <div className="print-field-row">
                          <strong>Salarial:</strong> {a.salarial === 'si' ? 'Sí' : 'No'} &nbsp;|&nbsp; <strong>Partida/Contrapartida:</strong> {a.partidaContrapartida === 'si' ? 'Sí' : 'No'}
                        </div>
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

              <SectionPanel id="resumen" activeSection={activeSection} title="Resumen y Generalidades" printHidden>
                <FieldTextarea label="Resumen" name="summary" value={formData.summary} onChange={handleChange} rows={3} />
                <FieldTextarea label="Generalidades de Nómina" name="payrollGeneralities" value={formData.payrollGeneralities} onChange={handleChange} rows={3} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Conceptos</label>
                  <button
                    type="button"
                    onClick={addAllowanceRow}
                    style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + Agregar Concepto
                  </button>
                </div>

                {formData.allowances.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0' }}>No hay conceptos agregados.</p>
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
                        label="Título del Concepto"
                        name={`allowanceTitle-${index}`}
                        value={allowance.title}
                        onChange={(e) => handleAllowanceChange(index, 'title', e.target.value)}
                        placeholder="Ej: Auxilio de Alimentación"
                      />

                      <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <FieldSelect
                          label="Salarial / No Salarial"
                          name={`allowanceSalarial-${index}`}
                          value={allowance.salarial || 'no'}
                          onChange={(e) => handleAllowanceChange(index, 'salarial', e.target.value)}
                          options={[
                            { value: 'si', label: 'Salarial' },
                            { value: 'no', label: 'No Salarial' },
                          ]}
                        />
                        <FieldSelect
                          label="Partida / Contrapartida"
                          name={`allowancePartida-${index}`}
                          value={allowance.partidaContrapartida || 'no'}
                          onChange={(e) => handleAllowanceChange(index, 'partidaContrapartida', e.target.value)}
                          options={[
                            { value: 'si', label: 'Sí' },
                            { value: 'no', label: 'No' },
                          ]}
                        />
                      </div>

                      <FieldTextarea
                        label="Descripción del Concepto"
                        name={`allowanceDescription-${index}`}
                        value={allowance.description}
                        onChange={(e) => handleAllowanceChange(index, 'description', e.target.value)}
                        rows={3}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Tabla del Concepto</label>
                        <button
                          type="button"
                          onClick={() => addAllowanceConceptRow(index)}
                          style={{ padding: '5px 10px', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          + Agregar Fila
                        </button>
                      </div>

                      {(allowance.conceptRows || []).length === 0 ? (
                        <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '0 0 4px 0' }}>Sin filas en la tabla de este concepto.</p>
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
              </SectionPanel>

              {formData.provisions.some((p) => (p.concept && p.concept.trim()) || (p.description && p.description.trim())) && (
                <div className="print-field-block">
                  <div className="print-section-heading">Provisiones</div>
                  {formData.provisions.map((p, index) =>
                    (p.concept && p.concept.trim()) || (p.description && p.description.trim()) ? (
                      <div key={p.id || index} className="print-field-block">
                        {p.concept && p.concept.trim() && (
                          <div className="print-only-text" style={{ fontWeight: 700, fontSize: '12.5px', margin: '6px 0 2px 0' }}>{p.concept}</div>
                        )}
                        {p.description && p.description.trim() && (
                          <div className="print-only-text print-text-block">{p.description}</div>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              )}

              <SectionPanel id="provisiones" activeSection={activeSection} title="Provisiones" printHidden>
                <p className="no-print" style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>
                  Provisiones generales de ley (prima, cesantías, intereses de cesantías, vacaciones) y extralegales que maneje el cliente.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Provisiones</label>
                  <button
                    type="button"
                    onClick={addProvisionRow}
                    style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + Agregar Provisión
                  </button>
                </div>

                {formData.provisions.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0' }}>No hay provisiones agregadas.</p>
                ) : (
                  formData.provisions.map((provision, index) => (
                    <div key={provision.id || index} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '10px', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => removeProvisionRow(index)}
                        style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        X
                      </button>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          Concepto
                        </label>
                        <input
                          list="provision-suggestions"
                          type="text"
                          value={provision.concept}
                          onChange={(e) => handleProvisionChange(index, 'concept', e.target.value)}
                          placeholder="Ej: Prima Legal, Cesantías, Vacaciones, Prima Extralegal..."
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box', outline: 'none' }}
                        />
                      </div>
                      <FieldTextarea
                        label="Descripción / Opción de Cálculo"
                        name={`provisionDescription-${index}`}
                        value={provision.description}
                        onChange={(e) => handleProvisionChange(index, 'description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  ))
                )}

                <datalist id="provision-suggestions">
                  <option value="Prima Legal" />
                  <option value="Cesantías" />
                  <option value="Intereses de Cesantías" />
                  <option value="Vacaciones" />
                  <option value="Prima Extralegal" />
                  <option value="Prima de Navidad" />
                  <option value="Vacaciones Convencionales" />
                </datalist>
              </SectionPanel>

              <PrintTextBlock heading="Reportes de Nómina" value={formData.payrollReportsInfo} />
              <PrintTextBlock heading="Nómina Día 31" value={formData.day31Info} />

              {(formData.ssDueDate.trim() || formData.ssARL.trim() || formData.ssCajas.trim() || formData.ssOperador.trim() || formData.ssGeneralNotes.trim()) && (
                <div className="print-field-block">
                  <div className="print-section-heading">Generalidades de Seguridad Social</div>
                  <PrintField label="Fecha Vencimiento" value={formData.ssDueDate} />
                  <PrintField label="ARL" value={formData.ssARL} />
                  <PrintField label="Múltiples Cajas" value={formData.ssCajas} />
                  <PrintField label="Operador de Pago" value={formData.ssOperador} />
                  {formData.ssGeneralNotes.trim() && (
                    <div className="print-only-text print-text-block">{formData.ssGeneralNotes}</div>
                  )}
                </div>
              )}

              <PrintTextBlock heading="Reporte Costos y Provisiones" value={formData.costsProvisionsReport} />

              {formData.monthlyReports.some((r) => (r.title && r.title.trim()) || (r.description && r.description.trim())) && (
                <div className="print-field-block print-only-block">
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

              <SectionPanel id="reportes" activeSection={activeSection} title="Reportes de Nómina y Seguridad Social" printHidden>
                <FieldTextarea label="Reportes de Nómina (introducción / ruta general)" name="payrollReportsInfo" value={formData.payrollReportsInfo} onChange={handleChange} rows={3} />
                <FieldTextarea label="Nómina Día 31" name="day31Info" value={formData.day31Info} onChange={handleChange} rows={2} />

                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '18px', marginBottom: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  Generalidades de Seguridad Social
                </div>

                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldInput label="Fecha Vencimiento (Seg. Social)" name="ssDueDate" value={formData.ssDueDate} onChange={handleChange} placeholder="Ej: 9 día hábil" />
                  <FieldInput label="ARL" name="ssARL" value={formData.ssARL} onChange={handleChange} />
                </div>
                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldInput label="Múltiples Cajas" name="ssCajas" value={formData.ssCajas} onChange={handleChange} />
                  <FieldSelect
                    label="Operador de Pago"
                    name="ssOperador"
                    value={formData.ssOperador}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Seleccionar...' },
                      { value: 'Mi Planilla', label: 'Mi Planilla' },
                      { value: 'Aportes en Línea', label: 'Aportes en Línea' },
                      { value: 'SOI', label: 'SOI' },
                      { value: 'Asopagos', label: 'Asopagos' },
                      { value: 'Otro', label: 'Otro' },
                    ]}
                  />
                </div>
                <FieldTextarea label="Generalidades de Autoliquidación / Notas" name="ssGeneralNotes" value={formData.ssGeneralNotes} onChange={handleChange} rows={3} />

                <FieldTextarea label="Reporte Costos y Provisiones" name="costsProvisionsReport" value={formData.costsProvisionsReport} onChange={handleChange} rows={3} />

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

              </SectionPanel>

              {(formData.voluntaryPaymentSupportNotes.trim() || formData.affiliationsNotes.trim() || formData.voluntaryPaymentSupportImages.length > 0) && (
                <div className="print-field-block">
                  <div className="print-section-heading">Soportes de Pago Voluntarios y Afiliaciones a Seguridad Social</div>
                  {formData.voluntaryPaymentSupportNotes.trim() && (
                    <div className="print-only-text print-text-block">{formData.voluntaryPaymentSupportNotes}</div>
                  )}
                  {formData.affiliationsNotes.trim() && (
                    <div className="print-only-text print-text-block">{formData.affiliationsNotes}</div>
                  )}
                  {formData.voluntaryPaymentSupportImages.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                      {formData.voluntaryPaymentSupportImages.map((img) => (
                        <div key={img.id} className="print-image-card" style={{ border: '1px solid #e2e8f0', padding: '4px', borderRadius: '6px' }}>
                          <img src={img.url} alt={img.name} style={{ maxWidth: '260px', maxHeight: '170px', objectFit: 'contain' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <SectionPanel id="soportes" activeSection={activeSection} title="Soportes de Pago Voluntarios y Afiliaciones a Seguridad Social" printHidden>
                <FieldTextarea label="Soportes de Pago Voluntarios" name="voluntaryPaymentSupportNotes" value={formData.voluntaryPaymentSupportNotes} onChange={handleChange} rows={3} />
                <FieldTextarea label="Afiliaciones a Seguridad Social" name="affiliationsNotes" value={formData.affiliationsNotes} onChange={handleChange} rows={3} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Imágenes de soporte</label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', backgroundColor: '#e2e8f0', color: '#0f172a', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}>
                    + Añadir imagen
                    <input type="file" accept="image/*" multiple onChange={handleVoluntaryImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {formData.voluntaryPaymentSupportImages.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                    {formData.voluntaryPaymentSupportImages.map((img) => (
                      <div key={img.id} style={{ border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', backgroundColor: '#fff', position: 'relative' }}>
                        <img src={img.url} alt={img.name} style={{ width: '100%', maxHeight: '110px', objectFit: 'contain', borderRadius: '4px' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveVoluntaryImage(img.id)}
                          style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px' }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </SectionPanel>

              {(formData.autoconsultaEnabled === 'si' || formData.comprobantesEnabled === 'si') && (
                <div className="print-field-block">
                  <div className="print-section-heading">Autoconsultas y Envío de Comprobantes</div>
                  <PrintField label="Módulo de Autoconsultas" value={formData.autoconsultaEnabled === 'si' ? 'Sí' : 'No'} />
                  {formData.autoconsultaEnabled === 'si' && formData.autoconsultaDescription.trim() && (
                    <div className="print-only-text print-text-block">{formData.autoconsultaDescription}</div>
                  )}
                  <PrintField label="Envío de Comprobantes" value={formData.comprobantesEnabled === 'si' ? 'Sí' : 'No'} />
                  {formData.comprobantesEnabled === 'si' && formData.comprobantesDescription.trim() && (
                    <div className="print-only-text print-text-block">{formData.comprobantesDescription}</div>
                  )}
                </div>
              )}

              <SectionPanel id="autoconsultas" activeSection={activeSection} title="Autoconsultas y Envío de Comprobantes" printHidden>
                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FieldSelect
                    label="Módulo de Autoconsultas"
                    name="autoconsultaEnabled"
                    value={formData.autoconsultaEnabled}
                    onChange={handleChange}
                    options={[
                      { value: 'no', label: 'No' },
                      { value: 'si', label: 'Sí' },
                    ]}
                  />
                  <FieldSelect
                    label="Envío de Comprobantes"
                    name="comprobantesEnabled"
                    value={formData.comprobantesEnabled}
                    onChange={handleChange}
                    options={[
                      { value: 'no', label: 'No' },
                      { value: 'si', label: 'Sí' },
                    ]}
                  />
                </div>
                <FieldTextarea
                  label="Descripción / Detalle de Autoconsultas"
                  name="autoconsultaDescription"
                  value={formData.autoconsultaDescription}
                  onChange={handleChange}
                  rows={2}
                />
                <FieldTextarea
                  label="Descripción / Detalle de Envío de Comprobantes"
                  name="comprobantesDescription"
                  value={formData.comprobantesDescription}
                  onChange={handleChange}
                  rows={2}
                />
              </SectionPanel>

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

              <SectionPanel id="servicios" activeSection={activeSection} title="Servicios Adicionales" printHidden>
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
              </SectionPanel>

              <div className="print-section-heading">Consideraciones y Reglas del Cliente</div>
              <SectionPanel id="consideraciones" activeSection={activeSection} title="Consideraciones y Reglas del Cliente">
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
                {formData.considerations.trim() && (
                  <div className="print-only-text print-text-block">{formData.considerations}</div>
                )}
              </SectionPanel>

              <div className="print-section-heading">Instrucciones Operativas / Paso a Paso</div>
              <SectionPanel id="instrucciones" activeSection={activeSection} title="Instrucciones Operativas / Paso a Paso">
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
                {formData.instructions.trim() && (
                  <div className="print-only-text print-text-block">{formData.instructions}</div>
                )}
              </SectionPanel>

              <div className="print-section-heading">Anexos</div>
              <SectionPanel id="anexos" activeSection={activeSection} title="Capturas de Pantalla y Anexos Visuales">
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
              </SectionPanel>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionPanel({ id, activeSection, title, children, printHidden = false }) {
  const isActive = activeSection === id;
  return (
    <div
      className={printHidden ? 'section-panel print-form-element' : 'section-panel'}
      style={{ display: isActive ? 'block' : 'none' }}
    >
      <h2 className="no-print" style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
        {title}
      </h2>
      <div className="no-print" style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '14px 0 20px 0' }} />
      {children}
    </div>
  );
}

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

function FieldSelect({ label, name, value, onChange, options = [] }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#ffffff', fontFamily: 'inherit' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileUploadField({ label, fileName, fileUrl, updatedAt, onUpload, onRemove }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
        {label}
      </label>

      {fileName ? (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <a
              href={fileUrl}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {fileName}
            </a>
            <button
              type="button"
              onClick={onRemove}
              title="Quitar archivo"
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', flexShrink: 0 }}
            >
              X
            </button>
          </div>
          {updatedAt && (
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              Actualizado: {updatedAt}
            </div>
          )}
          <label style={{ display: 'inline-block', marginTop: '8px', fontSize: '11.5px', color: '#0f172a', backgroundColor: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
            Reemplazar archivo
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={onUpload} style={{ display: 'none' }} />
          </label>
        </div>
      ) : (
        <label
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '18px', backgroundColor: '#f8fafc', cursor: 'pointer',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '6px' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: '600' }}>Subir archivo</span>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>PDF, imagen o Word</span>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={onUpload} style={{ display: 'none' }} />
        </label>
      )}
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: "'Segoe UI', Calibri, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '36px 32px',
          width: '100%',
          maxWidth: '360px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{ fontWeight: '800', fontSize: '22px', color: '#0f172a' }}>
            Solutions <span style={{ color: '#e11d48' }}>&</span> Payroll
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '6px' }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
            Usuario (correo)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        {error && (
          <div style={{ color: '#e11d48', fontSize: '12.5px', marginBottom: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px',
            backgroundColor: loading ? '#94a3b8' : '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'default' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>
        Verificando sesión...
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <MainApp onLogout={handleLogout} />;
}