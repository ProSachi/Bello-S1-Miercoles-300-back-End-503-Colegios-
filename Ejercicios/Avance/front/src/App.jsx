import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  HeartPulse, 
  User, 
  Pill, 
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
  
  // Health & Loading States
  const [healthStatus, setHealthStatus] = useState({ status: 'UNKNOWN', application: 'Hospital Control API', version: '1.0.0' });
  const [isLoading, setIsLoading] = useState(false);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  
  // Selected detail view (for Doctor details, showing their patients)
  const [selectedMedico, setSelectedMedico] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'medico' | 'enfermero' | 'paciente' | 'medicamento'
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form field states
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    gerencia: '',
    especialidad: '',
    medicoId: '',
    nombreMedicamento: '',
    descripcion: ''
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
        // Load all to update counts
        const [meds, enf, pacs, drugs] = await Promise.all([
          api.getMedicos().catch(() => []),
          api.getEnfermeros().catch(() => []),
          api.getPacientes().catch(() => []),
          api.getMedicamentos().catch(() => [])
        ]);
        setMedicos(meds);
        setEnfermeros(enf);
        setPacientes(pacs);
        setMedicamentos(drugs);
      } else if (activeTab === 'medicos') {
        const data = await api.getMedicos();
        setMedicos(data);
      } else if (activeTab === 'enfermeros') {
        const data = await api.getEnfermeros();
        setEnfermeros(data);
      } else if (activeTab === 'pacientes') {
        // Patients need Medicos list for assigned doctor names
        const [pacs, meds] = await Promise.all([
          api.getPacientes(),
          api.getMedicos().catch(() => [])
        ]);
        setPacientes(pacs);
        setMedicos(meds);
      } else if (activeTab === 'medicamentos') {
        const data = await api.getMedicamentos();
        setMedicamentos(data);
      }
    } catch (err) {
      showToast(`Error al cargar datos: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Find assigned doctor for a patient
  const getAssignedDoctor = (patientId) => {
    const doctor = medicos.find(m => m.pacientes && m.pacientes.some(p => p.id === patientId));
    return doctor ? `Dr. ${doctor.nombre} ${doctor.apellido}` : 'No asignado';
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
        // Find which doctor they belong to
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
      setFormData({
        nombre: '',
        apellido: '',
        gerencia: '',
        especialidad: '',
        medicoId: medicos.length > 0 ? medicos[0].id.toString() : '',
        nombreMedicamento: '',
        descripcion: ''
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
      }
      fetchActiveTabData();
      if (selectedMedico && selectedMedico.id === id) {
        setSelectedMedico(null);
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
    return [];
  };

  const filteredItems = getFilteredData();

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
            </h1>
            <p className="header-subtitle">
              {activeTab === 'dashboard' && 'Estadísticas y estado de la red hospitalaria.'}
              {activeTab === 'medicos' && 'Administre los profesionales médicos de la institución.'}
              {activeTab === 'enfermeros' && 'Administre el equipo de enfermería y especialidades.'}
              {activeTab === 'pacientes' && 'Registre nuevos pacientes y asigne su médico tratante.'}
              {activeTab === 'medicamentos' && 'Inventario y descripción de medicamentos autorizados.'}
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
              
              <div className="card-stat glass-panel" style={{ '--accent-gradient-start': '#f59e0b', '--accent-gradient-end': '#d97706' }}>
                <div className="stat-info">
                  <div className="stat-value">{medicamentos.length}</div>
                  <div className="stat-label">Medicamentos en Catálogo</div>
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
                  <h2 className="section-title">Pacientes por Médico</h2>
                </div>
                <div className="table-container" style={{ maxHeight: '180px' }}>
                  {medicos.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No hay médicos registrados.</p>
                  ) : (
                    <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Médico</th>
                          <th>Pacientes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicos.slice(0, 3).map((m) => (
                          <tr key={m.id}>
                            <td>Dr. {m.nombre} {m.apellido}</td>
                            <td>
                              <span className="badge badge-success">
                                {m.pacientes ? m.pacientes.length : 0}
                              </span>
                            </td>
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
                    activeTab === 'pacientes' ? 'pacientes' : 'medicamentos'
                  }...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" onClick={() => openModal(activeTab.slice(0, -1))}>
                <Plus size={16} />
                <span>
                  {activeTab === 'medicos' && 'Nuevo Médico'}
                  {activeTab === 'enfermeros' && 'Nuevo Enfermero'}
                  {activeTab === 'pacientes' && 'Nuevo Paciente'}
                  {activeTab === 'medicamentos' && 'Nuevo Medicamento'}
                </span>
              </button>
            </div>

            {/* List and Details Layout */}
            <div className={selectedMedico && activeTab === 'medicos' ? 'detail-grid' : ''}>
              
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
                            <th>Médico Tratante</th>
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
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id} style={selectedMedico && selectedMedico.id === item.id ? { backgroundColor: 'rgba(6, 182, 212, 0.05)' } : {}}>
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
                          <td style={{ textAlign: 'right' }}>
                            <div className="row-actions">
                              {activeTab === 'medicos' && (
                                <button 
                                  className="action-btn action-btn-edit" 
                                  title="Ver detalles e historial de pacientes"
                                  onClick={() => setSelectedMedico(item)}
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                              <button 
                                className="action-btn action-btn-edit" 
                                title="Editar"
                                onClick={() => openModal(activeTab.slice(0, -1), true, item)}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="action-btn action-btn-delete" 
                                title="Eliminar"
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

              {/* Side Detail Card for Doctors (shows patients list) */}
              {activeTab === 'medicos' && selectedMedico && (
                <div className="glass-panel detail-info-card" style={{ animation: 'fadeIn var(--transition-fast)' }}>
                  <div className="detail-avatar-section">
                    <div className="detail-avatar">
                      <Stethoscope size={36} />
                    </div>
                    <div className="detail-name">Dr. {selectedMedico.nombre} {selectedMedico.apellido}</div>
                    <div className="detail-role">Médico</div>
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
                    
                    <div className="detail-field" style={{ marginTop: '16px' }}>
                      <span className="detail-field-label">Pacientes Asignados ({selectedMedico.pacientes ? selectedMedico.pacientes.length : 0})</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                        {(!selectedMedico.pacientes || selectedMedico.pacientes.length === 0) ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Sin pacientes asignados actualmente
                          </span>
                        ) : (
                          selectedMedico.pacientes.map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                              <User size={14} style={{ color: 'var(--secondary)', marginTop: '2px' }} />
                              <span>{p.nombre} {p.apellido}</span>
                              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' }}>#{p.id}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }} onClick={() => setSelectedMedico(null)}>
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
          (isEditMode ? 'Editar ' : 'Registrar ') + (
            modalType === 'medico' ? 'Médico' : 
            modalType === 'enfermero' ? 'Enfermero' : 
            modalType === 'paciente' ? 'Paciente' : 'Medicamento'
          )
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
              disabled={modalType === 'paciente' && medicos.length === 0}
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
