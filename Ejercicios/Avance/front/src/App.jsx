import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  HeartPulse, 
  User, 
  Pill, 
  ClipboardList,
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  Loader2 
} from 'lucide-react';
import { api } from './services/api';
import Modal from './components/Modal';
import Toast from './components/Toast';
import './App.css';

function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [medicos, setMedicos] = useState([]);
  const [enfermeros, setEnfermeros] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [prescripciones, setPrescripciones] = useState([]);
  
  // Health & Loading States
  const [healthStatus, setHealthStatus] = useState({ status: 'UNKNOWN', application: 'Hospital Control API', version: '1.0.0' });
  const [isLoading, setIsLoading] = useState(false);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  
  // Selected detail views
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [medicoPrescripciones, setMedicoPrescripciones] = useState([]);
  
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [pacientePrescripciones, setPacientePrescripciones] = useState([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'medico' | 'enfermero' | 'paciente' | 'medicamento' | 'prescripcion'
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form field states
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    gerencia: '',
    especialidad: '',
    medicoId: '',
    pacienteId: '',
    medicamentoId: '',
    nombreMedicamento: '',
    descripcion: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    observaciones: ''
  });

  // Load health check status on mount
  useEffect(() => {
    checkSystemHealth();
    // Poll health status every 20 seconds
    const interval = setInterval(checkSystemHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data depending on active tab
  useEffect(() => {
    fetchActiveTabData();
    setSearchQuery('');
    setSelectedMedico(null);
    setSelectedPaciente(null);
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const checkSystemHealth = async () => {
    setIsHealthLoading(true);
    try {
      const data = await api.getHealthStatus();
      setHealthStatus(data);
    } catch (err) {
      setHealthStatus({ status: 'DOWN', application: 'Hospital Control API', version: 'Unknown' });
    } finally {
      setIsHealthLoading(false);
    }
  };

  const fetchActiveTabData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const [meds, enf, pacs, drugs, prescs] = await Promise.all([
          api.getMedicos().catch(() => []),
          api.getEnfermeros().catch(() => []),
          api.getPacientes().catch(() => []),
          api.getMedicamentos().catch(() => []),
          api.getPrescripciones().catch(() => [])
        ]);
        setMedicos(meds);
        setEnfermeros(enf);
        setPacientes(pacs);
        setMedicamentos(drugs);
        setPrescripciones(prescs);
      } else if (activeTab === 'medicos') {
        const data = await api.getMedicos();
        setMedicos(data);
      } else if (activeTab === 'enfermeros') {
        const data = await api.getEnfermeros();
        setEnfermeros(data);
      } else if (activeTab === 'pacientes') {
        const [pacs, meds] = await Promise.all([
          api.getPacientes(),
          api.getMedicos().catch(() => [])
        ]);
        setPacientes(pacs);
        setMedicos(meds);
      } else if (activeTab === 'medicamentos') {
        const data = await api.getMedicamentos();
        setMedicamentos(data);
      } else if (activeTab === 'prescripciones') {
        const [prescs, meds, pacs, drugs] = await Promise.all([
          api.getPrescripciones(),
          api.getMedicos().catch(() => []),
          api.getPacientes().catch(() => []),
          api.getMedicamentos().catch(() => [])
        ]);
        setPrescripciones(prescs);
        setMedicos(meds);
        setPacientes(pacs);
        setMedicamentos(drugs);
      }
    } catch (err) {
      showToast(`Error al cargar datos: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Find assigned doctor for a patient (historical fallback/lookup)
  const getAssignedDoctor = (patientId) => {
    const doctor = medicos.find(m => m.pacientes && m.pacientes.some(p => p.id === patientId));
    return doctor ? `Dr. ${doctor.nombre} ${doctor.apellido}` : 'No asignado';
  };

  // Detail panel trigger for Medico (loads written prescriptions)
  const handleSelectMedico = async (medico) => {
    setSelectedMedico(medico);
    setSelectedPaciente(null);
    setIsLoading(true);
    try {
      const pm = await api.getPrescripcionesByMedico(medico.id);
      setMedicoPrescripciones(pm);
    } catch (err) {
      setMedicoPrescripciones([]);
      showToast(`Error al cargar prescripciones del médico: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Detail panel trigger for Paciente (loads active prescriptions)
  const handleSelectPaciente = async (paciente) => {
    setSelectedPaciente(paciente);
    setSelectedMedico(null);
    setIsLoading(true);
    try {
      const pp = await api.getPrescripcionesByPaciente(paciente.id);
      setPacientePrescripciones(pp);
    } catch (err) {
      setPacientePrescripciones([]);
      showToast(`Error al cargar prescripciones del paciente: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Modal Helper
  const openModal = (type, edit = false, item = null) => {
    setModalType(type);
    setIsEditMode(edit);
    
    if (edit && item) {
      setEditingId(item.id);
      if (type === 'medico') {
        setFormData({ nombre: item.nombre, apellido: item.apellido, gerencia: item.gerencia });
      } else if (type === 'enfermero') {
        setFormData({ nombre: item.nombre, apellido: item.apellido, especialidad: item.especialidad });
      } else if (type === 'paciente') {
        const doctor = medicos.find(m => m.pacientes && m.pacientes.some(p => p.id === item.id));
        setFormData({ 
          nombre: item.nombre, 
          apellido: item.apellido, 
          medicoId: doctor ? doctor.id.toString() : '' 
        });
      } else if (type === 'medicamento') {
        setFormData({ nombreMedicamento: item.nombreMedicamento, descripcion: item.descripcion });
      }
    } else {
      setEditingId(null);
      // Pre-populate selectors if available
      const defaultMedicoId = medicos.length > 0 ? medicos[0].id.toString() : '';
      const defaultPacienteId = pacientes.length > 0 ? pacientes[0].id.toString() : '';
      const defaultMedicamentoId = medicamentos.length > 0 ? medicamentos[0].id.toString() : '';

      setFormData({
        nombre: '',
        apellido: '',
        gerencia: '',
        especialidad: '',
        medicoId: defaultMedicoId,
        pacienteId: defaultPacienteId,
        medicamentoId: defaultMedicamentoId,
        nombreMedicamento: '',
        descripcion: '',
        dosis: '',
        frecuencia: '',
        duracion: '',
        observaciones: ''
      });
    }
    
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (modalType === 'medico') {
        if (isEditMode) {
          await api.updateMedico(editingId, {
            nombre: formData.nombre,
            apellido: formData.apellido,
            gerencia: formData.gerencia
          });
          showToast('Médico actualizado con éxito');
        } else {
          await api.createMedico({
            nombre: formData.nombre,
            apellido: formData.apellido,
            gerencia: formData.gerencia
          });
          showToast('Médico creado con éxito');
        }
      } else if (modalType === 'enfermero') {
        if (isEditMode) {
          await api.updateEnfermero(editingId, {
            nombre: formData.nombre,
            apellido: formData.apellido,
            especialidad: formData.especialidad
          });
          showToast('Enfermero actualizado con éxito');
        } else {
          await api.createEnfermero({
            nombre: formData.nombre,
            apellido: formData.apellido,
            especialidad: formData.especialidad
          });
          showToast('Enfermero creado con éxito');
        }
      } else if (modalType === 'paciente') {
        if (isEditMode) {
          await api.updatePaciente(editingId, {
            nombre: formData.nombre,
            apellido: formData.apellido,
            medicoId: parseInt(formData.medicoId, 10)
          });
          showToast('Paciente actualizado con éxito');
        } else {
          await api.createPaciente({
            nombre: formData.nombre,
            apellido: formData.apellido,
            medicoId: parseInt(formData.medicoId, 10)
          });
          showToast('Paciente registrado con éxito');
        }
      } else if (modalType === 'medicamento') {
        if (isEditMode) {
          await api.updateMedicamento(editingId, {
            nombreMedicamento: formData.nombreMedicamento,
            descripcion: formData.descripcion
          });
          showToast('Medicamento actualizado con éxito');
        } else {
          await api.createMedicamento({
            nombreMedicamento: formData.nombreMedicamento,
            descripcion: formData.descripcion
          });
          showToast('Medicamento creado con éxito');
        }
      } else if (modalType === 'prescripcion') {
        // Prescriptions do not have update mapping in controller, they are immutable recipes.
        await api.createPrescripcion({
          medicamentoId: formData.medicamentoId,
          pacienteId: formData.pacienteId,
          medicoId: formData.medicoId,
          dosis: formData.dosis,
          frecuencia: formData.frecuencia,
          duracion: formData.duracion,
          observaciones: formData.observaciones
        });
        showToast('Prescripción médica emitida con éxito');
      }
      setIsModalOpen(false);
      fetchActiveTabData();
    } catch (err) {
      showToast(`Error al guardar: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro?')) return;
    
    setIsLoading(true);
    try {
      if (type === 'medico') {
        await api.deleteMedico(id);
        showToast('Médico eliminado con éxito');
      } else if (type === 'enfermero') {
        await api.deleteEnfermero(id);
        showToast('Enfermero eliminado con éxito');
      } else if (type === 'paciente') {
        await api.deletePaciente(id);
        showToast('Paciente eliminado con éxito');
      } else if (type === 'medicamento') {
        await api.deleteMedicamento(id);
        showToast('Medicamento eliminado con éxito');
      } else if (type === 'prescripcion') {
        await api.deletePrescripcion(id);
        showToast('Prescripción cancelada y eliminada con éxito');
      }
      fetchActiveTabData();
      
      // Close active details if the deleted item was selected
      if (selectedMedico && selectedMedico.id === id && type === 'medico') {
        setSelectedMedico(null);
      }
      if (selectedPaciente && selectedPaciente.id === id && type === 'paciente') {
        setSelectedPaciente(null);
      }
    } catch (err) {
      showToast(`Error al eliminar: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Search filtering logic
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      if (activeTab === 'medicos') return medicos;
      if (activeTab === 'enfermeros') return enfermeros;
      if (activeTab === 'pacientes') return pacientes;
      if (activeTab === 'medicamentos') return medicamentos;
      if (activeTab === 'prescripciones') return prescripciones;
      return [];
    }

    if (activeTab === 'medicos') {
      return medicos.filter(
        (m) =>
          m.nombre.toLowerCase().includes(query) ||
          m.apellido.toLowerCase().includes(query) ||
          m.gerencia.toLowerCase().includes(query)
      );
    }
    if (activeTab === 'enfermeros') {
      return enfermeros.filter(
        (e) =>
          e.nombre.toLowerCase().includes(query) ||
          e.apellido.toLowerCase().includes(query) ||
          e.especialidad.toLowerCase().includes(query)
      );
    }
    if (activeTab === 'pacientes') {
      return pacientes.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query) ||
          p.apellido.toLowerCase().includes(query) ||
          getAssignedDoctor(p.id).toLowerCase().includes(query)
      );
    }
    if (activeTab === 'medicamentos') {
      return medicamentos.filter(
        (m) =>
          m.nombreMedicamento.toLowerCase().includes(query) ||
          m.descripcion.toLowerCase().includes(query)
      );
    }
    if (activeTab === 'prescripciones') {
      return prescripciones.filter(
        (p) =>
          p.nombreMedicamento.toLowerCase().includes(query) ||
          p.nombrePaciente.toLowerCase().includes(query) ||
          p.apellidoPaciente.toLowerCase().includes(query) ||
          p.nombreMedico.toLowerCase().includes(query) ||
          p.apellidoMedico.toLowerCase().includes(query) ||
          (p.observaciones && p.observaciones.toLowerCase().includes(query))
      );
    }
    return [];
  };

  const filteredItems = getFilteredData();

  // Date Formatting Helper
  const formatPrescriptionDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">H</div>
          <span className="logo-text">SanoControl</span>
        </div>
        
        <nav className="sidebar-menu">
          <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18} />
              <span>Panel General</span>
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'medicos' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('medicos')}>
              <Stethoscope size={18} />
              <span>Médicos</span>
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'enfermeros' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('enfermeros')}>
              <HeartPulse size={18} />
              <span>Enfermeros</span>
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'pacientes' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('pacientes')}>
              <User size={18} />
              <span>Pacientes</span>
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'medicamentos' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('medicamentos')}>
              <Pill size={18} />
              <span>Medicamentos</span>
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'prescripciones' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('prescripciones')}>
              <ClipboardList size={18} />
              <span>Prescripciones</span>
            </button>
          </li>
        </nav>
        
        <div className="sidebar-footer">
          <div className="api-health-container">
            <span className={`health-dot ${healthStatus.status === 'UP' ? 'up' : 'down'}`}></span>
            <span className="health-label">
              API: {healthStatus.status === 'UP' ? 'En línea' : 'Desconectado'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Header section */}
        <header className="content-header">
          <div className="header-title-section">
            <h1 className="main-title">
              {activeTab === 'dashboard' && 'Panel General'}
              {activeTab === 'medicos' && 'Gestión de Médicos'}
              {activeTab === 'enfermeros' && 'Gestión de Enfermeros'}
              {activeTab === 'pacientes' && 'Gestión de Pacientes'}
              {activeTab === 'medicamentos' && 'Control de Medicamentos'}
              {activeTab === 'prescripciones' && 'Prescripciones Médicas'}
            </h1>
            <p className="header-subtitle">
              {activeTab === 'dashboard' && 'Estadísticas y estado de la red hospitalaria.'}
              {activeTab === 'medicos' && 'Administre los profesionales médicos de la institución.'}
              {activeTab === 'enfermeros' && 'Administre el equipo de enfermería y especialidades.'}
              {activeTab === 'pacientes' && 'Registre nuevos pacientes y asigne su médico tratante.'}
              {activeTab === 'medicamentos' && 'Inventario y descripción de medicamentos autorizados.'}
              {activeTab === 'prescripciones' && 'Historial de recetas y medicamentos prescritos a pacientes por facultativos.'}
            </p>
          </div>
          
          <button className="btn btn-secondary btn-sm" onClick={checkSystemHealth} disabled={isHealthLoading}>
            <Activity size={14} className={isHealthLoading ? 'animate-spin' : ''} />
            <span>Refrescar API</span>
          </button>
        </header>

        {/* Loading Spinner for main view updates */}
        {isLoading && (
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary)' }} />
            <span>Procesando datos del servidor...</span>
          </div>
        )}

        {/* Tab view routing */}
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="dashboard-grid">
              
              <div className="card-stat glass-panel" style={{ '--accent-gradient-start': '#06b6d4', '--accent-gradient-end': '#0891b2' }}>
                <div className="stat-info">
                  <div className="stat-value">{medicos.length}</div>
                  <div className="stat-label">Médicos Activos</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: '#06b6d4' }}>
                  <Stethoscope size={24} />
                </div>
              </div>
              
              <div className="card-stat glass-panel" style={{ '--accent-gradient-start': '#6366f1', '--accent-gradient-end': '#4f46e5' }}>
                <div className="stat-info">
                  <div className="stat-value">{enfermeros.length}</div>
                  <div className="stat-label">Enfermeros Registrados</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: '#6366f1' }}>
                  <HeartPulse size={24} />
                </div>
              </div>
              
              <div className="card-stat glass-panel" style={{ '--accent-gradient-start': '#10b981', '--accent-gradient-end': '#059669' }}>
                <div className="stat-info">
                  <div className="stat-value">{pacientes.length}</div>
                  <div className="stat-label">Pacientes Totales</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: '#10b981' }}>
                  <User size={24} />
                </div>
              </div>

              <div className="card-stat glass-panel" style={{ '--accent-gradient-start': '#ec4899', '--accent-gradient-end': '#db2777' }}>
                <div className="stat-info">
                  <div className="stat-value">{prescripciones.length}</div>
                  <div className="stat-label">Prescripciones Emitidas</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: '#ec4899' }}>
                  <ClipboardList size={24} />
                </div>
              </div>
              
              <div className="card-stat glass-panel" style={{ '--accent-gradient-start': '#f59e0b', '--accent-gradient-end': '#d97706' }}>
                <div className="stat-info">
                  <div className="stat-value">{medicamentos.length}</div>
                  <div className="stat-label">Catálogo Medicamentos</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: '#f59e0b' }}>
                  <Pill size={24} />
                </div>
              </div>
            </div>

            {/* Quick overview panels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <div className="glass-panel data-section">
                <div className="section-header">
                  <h2 className="section-title">Información de Conexión</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Aplicación:</span>
                    <span style={{ fontWeight: '600' }}>{healthStatus.application}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Versión Backend:</span>
                    <span style={{ fontWeight: '600' }}>{healthStatus.version}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Estado:</span>
                    <span className={`badge ${healthStatus.status === 'UP' ? 'badge-success' : 'badge-danger'}`}>
                      {healthStatus.status === 'UP' ? 'Operativo' : 'Caído'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Servidor URL:</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>http://localhost:8080</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel data-section">
                <div className="section-header">
                  <h2 className="section-title">Últimas Prescripciones</h2>
                </div>
                <div className="table-container" style={{ maxHeight: '180px' }}>
                  {prescripciones.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No hay prescripciones registradas.</p>
                  ) : (
                    <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Paciente</th>
                          <th>Medicamento</th>
                          <th>Dosis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescripciones.slice(-3).reverse().map((p) => (
                          <tr key={p.id}>
                            <td>{p.nombrePaciente} {p.apellidoPaciente}</td>
                            <td style={{ color: 'var(--primary)', fontWeight: '600' }}>{p.nombreMedicamento}</td>
                            <td>{p.dosis}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCE CRUD TABS */}
        {activeTab !== 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Actions Bar (Search and Add) */}
            <div className="actions-bar">
              <div className="search-box">
                <Search className="search-icon" size={16} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder={`Buscar ${
                    activeTab === 'medicos' ? 'médicos' : 
                    activeTab === 'enfermeros' ? 'enfermeros' : 
                    activeTab === 'pacientes' ? 'pacientes' : 
                    activeTab === 'prescripciones' ? 'prescripciones' : 'medicamentos'
                  }...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" onClick={() => openModal({ medicos: 'medico', enfermeros: 'enfermero', pacientes: 'paciente', medicamentos: 'medicamento', prescripciones: 'prescripcion' }[activeTab])}>
                <Plus size={16} />
                <span>
                  {activeTab === 'medicos' && 'Nuevo Médico'}
                  {activeTab === 'enfermeros' && 'Nuevo Enfermero'}
                  {activeTab === 'pacientes' && 'Nuevo Paciente'}
                  {activeTab === 'medicamentos' && 'Nuevo Medicamento'}
                  {activeTab === 'prescripciones' && 'Nueva Prescripción'}
                </span>
              </button>
            </div>

            {/* List and Details Layout */}
            <div className={(selectedMedico && activeTab === 'medicos') || (selectedPaciente && activeTab === 'pacientes') ? 'detail-grid' : ''}>
              
              {/* Main table container */}
              <div className="glass-panel table-container">
                {filteredItems.length === 0 ? (
                  <div className="empty-state">
                    <Search size={40} className="empty-state-icon" />
                    <div className="empty-state-text">No se encontraron resultados</div>
                    <div className="empty-state-desc">Intente otra consulta o registre un nuevo elemento en el botón lateral.</div>
                  </div>
                ) : (
                  <table className="custom-table">
                    <thead>
                      <tr>
                        {activeTab === 'medicos' && (
                          <>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Gerencia</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                          </>
                        )}
                        {activeTab === 'enfermeros' && (
                          <>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Especialidad</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                          </>
                        )}
                        {activeTab === 'pacientes' && (
                          <>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Médico de Control</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                          </>
                        )}
                        {activeTab === 'medicamentos' && (
                          <>
                            <th>ID</th>
                            <th>Medicamento</th>
                            <th>Descripción</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                          </>
                        )}
                        {activeTab === 'prescripciones' && (
                          <>
                            <th>ID</th>
                            <th>Paciente</th>
                            <th>Médico</th>
                            <th>Medicamento</th>
                            <th>Dosis / Frecuencia</th>
                            <th>Duración</th>
                            <th>Fecha</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr 
                          key={item.id} 
                          style={
                            (selectedMedico && selectedMedico.id === item.id) || 
                            (selectedPaciente && selectedPaciente.id === item.id) 
                              ? { backgroundColor: 'rgba(6, 182, 212, 0.05)' } 
                              : {}
                          }
                        >
                          {activeTab === 'medicos' && (
                            <>
                              <td>#{item.id}</td>
                              <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                              <td>{item.apellido}</td>
                              <td><span className="badge badge-success">{item.gerencia}</span></td>
                            </>
                          )}
                          {activeTab === 'enfermeros' && (
                            <>
                              <td>#{item.id}</td>
                              <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                              <td>{item.apellido}</td>
                              <td><span className="badge badge-success">{item.especialidad}</span></td>
                            </>
                          )}
                          {activeTab === 'pacientes' && (
                            <>
                              <td>#{item.id}</td>
                              <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                              <td>{item.apellido}</td>
                              <td>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Stethoscope size={14} style={{ color: 'var(--primary)' }} />
                                  {getAssignedDoctor(item.id)}
                                </span>
                              </td>
                            </>
                          )}
                          {activeTab === 'medicamentos' && (
                            <>
                              <td>#{item.id}</td>
                              <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.nombreMedicamento}</td>
                              <td style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                                {item.descripcion}
                              </td>
                            </>
                          )}
                          {activeTab === 'prescripciones' && (
                            <>
                              <td>#{item.id}</td>
                              <td style={{ fontWeight: 600 }}>{item.nombrePaciente} {item.apellidoPaciente}</td>
                              <td>Dr. {item.nombreMedico} {item.apellidoMedico}</td>
                              <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.nombreMedicamento}</td>
                              <td>
                                <div style={{ fontSize: '0.9rem' }}>{item.dosis}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.frecuencia}</div>
                              </td>
                              <td>{item.duracion}</td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatPrescriptionDate(item.fechaPrescripcion)}</td>
                            </>
                          )}
                          <td style={{ textAlign: 'right' }}>
                            <div className="row-actions">
                              {activeTab === 'medicos' && (
                                <button 
                                  className="action-btn action-btn-edit" 
                                  title="Ver detalles e historial"
                                  onClick={() => handleSelectMedico(item)}
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                              {activeTab === 'pacientes' && (
                                <button 
                                  className="action-btn action-btn-edit" 
                                  title="Ver receta activa"
                                  onClick={() => handleSelectPaciente(item)}
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                              {activeTab !== 'prescripciones' && (
                                <button 
                                  className="action-btn action-btn-edit" 
                                  title="Editar"
                                  onClick={() => openModal({ medicos: 'medico', enfermeros: 'enfermero', pacientes: 'paciente', medicamentos: 'medicamento', prescripciones: 'prescripcion' }[activeTab], true, item)}
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              <button 
                                className="action-btn action-btn-delete" 
                                title={activeTab === 'prescripciones' ? 'Eliminar Prescripción' : 'Eliminar'}
                                onClick={() => handleDelete(activeTab.slice(0, -1), item.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Side Detail Card for Doctors (shows their patients & prescriptions written) */}
              {activeTab === 'medicos' && selectedMedico && (
                <div className="glass-panel detail-info-card" style={{ animation: 'fadeIn var(--transition-fast)' }}>
                  <div className="detail-avatar-section">
                    <div className="detail-avatar">
                      <Stethoscope size={36} />
                    </div>
                    <div className="detail-name">Dr. {selectedMedico.nombre} {selectedMedico.apellido}</div>
                    <div className="detail-role">Médico Control</div>
                  </div>
                  
                  <div className="detail-fields">
                    <div className="detail-field">
                      <span className="detail-field-label">Departamento / Gerencia</span>
                      <span className="detail-field-value">{selectedMedico.gerencia}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field-label">ID Sistema</span>
                      <span className="detail-field-value">#{selectedMedico.id}</span>
                    </div>
                    
                    {/* Patients List */}
                    <div className="detail-field" style={{ marginTop: '12px' }}>
                      <span className="detail-field-label">Pacientes a Cargo ({selectedMedico.pacientes ? selectedMedico.pacientes.length : 0})</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', maxHeight: '130px', overflowY: 'auto' }}>
                        {(!selectedMedico.pacientes || selectedMedico.pacientes.length === 0) ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Sin pacientes asignados actualmente
                          </span>
                        ) : (
                          selectedMedico.pacientes.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                              <User size={12} style={{ color: 'var(--secondary)' }} />
                              <span>{p.nombre} {p.apellido}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Prescriptions Written List */}
                    <div className="detail-field" style={{ marginTop: '12px' }}>
                      <span className="detail-field-label">Prescripciones Emitidas ({medicoPrescripciones.length})</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                        {medicoPrescripciones.length === 0 ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No ha recetado medicamentos aún.
                          </span>
                        ) : (
                          medicoPrescripciones.map(pm => (
                            <div key={pm.id} style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                                <span style={{ color: 'var(--primary)' }}>{pm.nombreMedicamento}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{pm.dosis}</span>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Paciente: {pm.nombrePaciente} {pm.apellidoPaciente}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={() => setSelectedMedico(null)}>
                    Cerrar Detalles
                  </button>
                </div>
              )}

              {/* Side Detail Card for Patients (shows active prescriptions details) */}
              {activeTab === 'pacientes' && selectedPaciente && (
                <div className="glass-panel detail-info-card" style={{ animation: 'fadeIn var(--transition-fast)' }}>
                  <div className="detail-avatar-section">
                    <div className="detail-avatar" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)', color: 'var(--secondary)' }}>
                      <User size={36} />
                    </div>
                    <div className="detail-name">{selectedPaciente.nombre} {selectedPaciente.apellido}</div>
                    <div className="detail-role">Paciente</div>
                  </div>
                  
                  <div className="detail-fields">
                    <div className="detail-field">
                      <span className="detail-field-label">Médico Asignado</span>
                      <span className="detail-field-value" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Stethoscope size={14} style={{ color: 'var(--primary)' }} />
                        {getAssignedDoctor(selectedPaciente.id)}
                      </span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field-label">ID Sistema</span>
                      <span className="detail-field-value">#{selectedPaciente.id}</span>
                    </div>
                    
                    {/* Active Prescriptions */}
                    <div className="detail-field" style={{ marginTop: '12px' }}>
                      <span className="detail-field-label">Prescripciones / Recetas Activas ({pacientePrescripciones.length})</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                        {pacientePrescripciones.length === 0 ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Sin prescripciones de medicamentos activas.
                          </span>
                        ) : (
                          pacientePrescripciones.map(pp => (
                            <div key={pp.id} style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem' }}>{pp.nombreMedicamento}</span>
                                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{pp.duracion}</span>
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Dosis:</span> {pp.dosis} | <span style={{ color: 'var(--text-secondary)' }}>Frecuencia:</span> {pp.frecuencia}
                              </div>
                              {pp.observaciones && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '4px', marginTop: '2px', fontStyle: 'italic' }}>
                                  Obs: {pp.observaciones}
                                </div>
                              )}
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '2px' }}>
                                Recetado por: Dr. {pp.nombreMedico} {pp.apellidoMedico}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={() => setSelectedPaciente(null)}>
                    Cerrar Detalles
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* CRUD Creation/Editing Form Modals */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={
          (modalType === 'prescripcion' ? 'Emitir Receta Médica' : 
           (isEditMode ? 'Editar ' : 'Registrar ') + (
            modalType === 'medico' ? 'Médico' : 
            modalType === 'enfermero' ? 'Enfermero' : 
            modalType === 'paciente' ? 'Paciente' : 'Medicamento'
          ))
        }
      >
        <form onSubmit={handleFormSubmit}>
          
          {/* MEDICO FORM */}
          {modalType === 'medico' && (
            <>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input 
                  type="text" 
                  name="nombre"
                  className="form-input" 
                  placeholder="Ej. Juan"
                  required
                  value={formData.nombre}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input 
                  type="text" 
                  name="apellido"
                  className="form-input" 
                  placeholder="Ej. Pérez"
                  required
                  value={formData.apellido}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Departamento / Gerencia</label>
                <input 
                  type="text" 
                  name="gerencia"
                  className="form-input" 
                  placeholder="Ej. Cardiología"
                  required
                  value={formData.gerencia}
                  onChange={handleFormChange}
                />
              </div>
            </>
          )}

          {/* ENFERMERO FORM */}
          {modalType === 'enfermero' && (
            <>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input 
                  type="text" 
                  name="nombre"
                  className="form-input" 
                  placeholder="Ej. María"
                  required
                  value={formData.nombre}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input 
                  type="text" 
                  name="apellido"
                  className="form-input" 
                  placeholder="Ej. Gómez"
                  required
                  value={formData.apellido}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Especialidad</label>
                <input 
                  type="text" 
                  name="especialidad"
                  className="form-input" 
                  placeholder="Ej. Pediatría"
                  required
                  value={formData.especialidad}
                  onChange={handleFormChange}
                />
              </div>
            </>
          )}

          {/* PACIENTE FORM */}
          {modalType === 'paciente' && (
            <>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input 
                  type="text" 
                  name="nombre"
                  className="form-input" 
                  placeholder="Ej. Carlos"
                  required
                  value={formData.nombre}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input 
                  type="text" 
                  name="apellido"
                  className="form-input" 
                  placeholder="Ej. Silva"
                  required
                  value={formData.apellido}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Médico Tratante</label>
                {medicos.length === 0 ? (
                  <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'left' }}>
                    Debe registrar al menos un médico antes de crear un paciente.
                  </p>
                ) : (
                  <select 
                    name="medicoId"
                    className="form-select" 
                    required
                    value={formData.medicoId}
                    onChange={handleFormChange}
                  >
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>
                        Dr. {m.nombre} {m.apellido} ({m.gerencia})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </>
          )}

          {/* MEDICAMENTO FORM */}
          {modalType === 'medicamento' && (
            <>
              <div className="form-group">
                <label className="form-label">Nombre del Medicamento</label>
                <input 
                  type="text" 
                  name="nombreMedicamento"
                  className="form-input" 
                  placeholder="Ej. Ibuprofeno 400mg"
                  required
                  value={formData.nombreMedicamento}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea 
                  name="descripcion"
                  className="form-textarea" 
                  rows="3"
                  placeholder="Instrucciones o descripción del uso químico..."
                  required
                  value={formData.descripcion}
                  onChange={handleFormChange}
                ></textarea>
              </div>
            </>
          )}

          {/* PRESCRIPCION FORM */}
          {modalType === 'prescripcion' && (
            <>
              <div className="form-group">
                <label className="form-label">Paciente Receptor</label>
                {pacientes.length === 0 ? (
                  <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'left' }}>
                    Debe registrar pacientes en el sistema antes de emitir recetas.
                  </p>
                ) : (
                  <select 
                    name="pacienteId"
                    className="form-select" 
                    required
                    value={formData.pacienteId}
                    onChange={handleFormChange}
                  >
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellido} (ID: #{p.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Médico Prescriptor</label>
                {medicos.length === 0 ? (
                  <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'left' }}>
                    Debe registrar médicos en el sistema antes de emitir recetas.
                  </p>
                ) : (
                  <select 
                    name="medicoId"
                    className="form-select" 
                    required
                    value={formData.medicoId}
                    onChange={handleFormChange}
                  >
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>
                        Dr. {m.nombre} {m.apellido} ({m.gerencia})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Medicamento a Recetar</label>
                {medicamentos.length === 0 ? (
                  <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'left' }}>
                    Debe agregar medicamentos al catálogo antes de recetar.
                  </p>
                ) : (
                  <select 
                    name="medicamentoId"
                    className="form-select" 
                    required
                    value={formData.medicamentoId}
                    onChange={handleFormChange}
                  >
                    {medicamentos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombreMedicamento} (ID: #{m.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Dosis</label>
                  <input 
                    type="text" 
                    name="dosis"
                    className="form-input" 
                    placeholder="Ej. 1 tableta, 500mg"
                    required
                    value={formData.dosis}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Frecuencia</label>
                  <input 
                    type="text" 
                    name="frecuencia"
                    className="form-input" 
                    placeholder="Ej. Cada 8 horas"
                    required
                    value={formData.frecuencia}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duración del Tratamiento</label>
                <input 
                  type="text" 
                  name="duracion"
                  className="form-input" 
                  placeholder="Ej. 7 días, 1 mes"
                  required
                  value={formData.duracion}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Observaciones / Instrucciones</label>
                <textarea 
                  name="observaciones"
                  className="form-textarea" 
                  rows="2"
                  placeholder="Tomar después de las comidas..."
                  value={formData.observaciones}
                  onChange={handleFormChange}
                ></textarea>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={
                (modalType === 'paciente' && medicos.length === 0) ||
                (modalType === 'prescripcion' && (pacientes.length === 0 || medicos.length === 0 || medicamentos.length === 0))
              }
            >
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Floating Notifications Area */}
      <div className="toast-area">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
