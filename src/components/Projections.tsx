import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, Clock, AlertTriangle, BarChart3, Plus, Search, Filter, CreditCard as Edit3, Eye, Trash2, Calendar, Target, Activity, Zap, CheckCircle, XCircle } from 'lucide-react';
import { ProcessProjection, ProjectionFilters } from '../types/Projection';
import { Process } from '../types/Process';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';
import { growthAssumptions } from '../data/mockProjections';
import ProjectionForm from './ProjectionForm';
import ProjectionDetails from './ProjectionDetails';

interface ProjectionsProps {
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
  processes: Process[];
  projections: ProcessProjection[];
  onUpdateProjections: (projections: ProcessProjection[]) => void;
}

const Projections: React.FC<ProjectionsProps> = ({
  onNavigateToHome,
  onGoBack,
  canGoBack = false,
  previousPageTitle,
  processes,
  projections,
  onUpdateProjections
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [showForm, setShowForm] = useState(false);
  const [editingProjection, setEditingProjection] = useState<ProcessProjection | null>(null);
  const [selectedProjection, setSelectedProjection] = useState<ProcessProjection | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'projection-details'>('list');
  const [filters, setFilters] = useState<ProjectionFilters>({
    searchTerm: '',
    processId: '',
    criticality: '',
    year: '2025'
  });

  useScrollToTopImmediate(showForm);
  useScrollToTopImmediate(viewMode);

  // Statistiques globales pour l'année sélectionnée
  const yearStats = useMemo(() => {
    const yearProjections = projections.map(p => p.projections[selectedYear]).filter(Boolean);
    
    const totalCases = yearProjections.reduce((sum, p) => sum + p.estimatedCases, 0);
    const totalWorkload = yearProjections.reduce((sum, p) => sum + p.workloadHours, 0);
    const totalCapacity = yearProjections.reduce((sum, p) => sum + p.availableCapacityHours, 0);
    const totalRequiredFTE = yearProjections.reduce((sum, p) => sum + p.requiredFTE, 0);
    const currentEmployees = projections.reduce((sum, p) => sum + p.dedicatedEmployees, 0);
    
    const criticalProcesses = yearProjections.filter(p => p.criticality === 'critical').length;
    const highRiskProcesses = yearProjections.filter(p => p.criticality === 'high').length;
    
    const avgUtilization = yearProjections.length > 0 
      ? Math.round(yearProjections.reduce((sum, p) => sum + p.capacityUtilization, 0) / yearProjections.length)
      : 0;

    return {
      totalCases,
      totalWorkload: Math.round(totalWorkload),
      totalCapacity,
      totalRequiredFTE: Math.round(totalRequiredFTE * 10) / 10,
      currentEmployees,
      additionalFTENeeded: Math.max(0, Math.round((totalRequiredFTE - currentEmployees) * 10) / 10),
      criticalProcesses,
      highRiskProcesses,
      avgUtilization,
      growthFactor: growthAssumptions[selectedYear as keyof typeof growthAssumptions]?.factor || 1
    };
  }, [projections, selectedYear]);

  const filteredProjections = useMemo(() => {
    return projections.filter(projection => {
      const matchesSearch = !filters.searchTerm || 
        projection.processName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        projection.processCode.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesProcess = !filters.processId || projection.processId === filters.processId;
      
      const yearProjection = projection.projections[selectedYear];
      const matchesCriticality = !filters.criticality || 
        (yearProjection && yearProjection.criticality === filters.criticality);

      return matchesSearch && matchesProcess && matchesCriticality;
    });
  }, [projections, filters, selectedYear]);

  const handleCreateProjection = (projectionData: Omit<ProcessProjection, 'id' | 'dateCreated' | 'dateUpdated'>) => {
    const newProjection: ProcessProjection = {
      ...projectionData,
      id: Date.now().toString(),
      dateCreated: new Date().toISOString().split('T')[0],
      dateUpdated: new Date().toISOString().split('T')[0]
    };
    
    onUpdateProjections([...projections, newProjection]);
    setShowForm(false);
  };

  const handleUpdateProjection = (updatedProjection: ProcessProjection) => {
    const updated = {
      ...updatedProjection,
      dateUpdated: new Date().toISOString().split('T')[0]
    };
    
    onUpdateProjections(projections.map(p => p.id === updated.id ? updated : p));
    setEditingProjection(null);
    setShowForm(false);
  };

  const handleDeleteProjection = (projectionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette projection ?')) {
      onUpdateProjections(projections.filter(p => p.id !== projectionId));
    }
  };

  const handleViewProjectionDetails = (projection: ProcessProjection) => {
    setSelectedProjection(projection);
    setViewMode('projection-details');
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCriticalityLabel = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevé';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      default: return criticality;
    }
  };

  const getCriticalityIcon = (criticality: string) => {
    switch (criticality) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (showForm) {
    return (
      <ProjectionForm
        projection={editingProjection}
        processes={processes}
        onSave={editingProjection ? handleUpdateProjection : handleCreateProjection}
        onCancel={() => {
          setShowForm(false);
          setEditingProjection(null);
        }}
        onNavigateToHome={onNavigateToHome}
        onGoBack={onGoBack}
        canGoBack={canGoBack}
        previousPageTitle={previousPageTitle}
      />
    );
  }

  if (viewMode === 'projection-details' && selectedProjection) {
    return (
      <ProjectionDetails
        projection={selectedProjection}
        process={processes.find(p => p.id === selectedProjection.processId)}
        onBack={() => {
          setViewMode('list');
          setSelectedProjection(null);
        }}
        onEdit={(projection) => {
          setEditingProjection(projection);
          setShowForm(true);
        }}
        onNavigateToHome={onNavigateToHome}
        onGoBack={onGoBack}
        canGoBack={canGoBack}
        previousPageTitle={previousPageTitle}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête */}
      <header className="border-b border-slate-200 bg-white text-slate-950 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                Projections de Charge
              </h1>
              <p className="text-slate-500 text-sm">
                Analyse prospective 2025-2028 • {projections.length} projection(s) configurée(s)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Sélecteur d'année */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-white/50"
            >
              <option value="2025" className="text-gray-900">2025</option>
              <option value="2026" className="text-gray-900">2026</option>
              <option value="2027" className="text-gray-900">2027</option>
              <option value="2028" className="text-gray-900">2028</option>
            </select>

            <button
              onClick={() => setShowForm(true)}
              className="app-button-primary"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Nouvelle projection</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Métriques principales pour l'année sélectionnée */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="app-surface rounded-xl p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {growthAssumptions[selectedYear as keyof typeof growthAssumptions]?.clients.toLocaleString('fr-FR')}
                </div>
                <div className="text-sm font-medium text-blue-600">
                  x{yearStats.growthFactor}
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Clients {selectedYear}</h3>
            <p className="text-xs text-gray-500">Croissance vs 2025</p>
          </div>

          <div className="app-surface rounded-xl p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {yearStats.totalCases.toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Dossiers/mois</h3>
            <p className="text-xs text-gray-500">Volume estimé</p>
          </div>

          <div className="app-surface rounded-xl p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {yearStats.totalWorkload.toLocaleString('fr-FR')}h
                </div>
                <div className="text-sm font-medium text-orange-600">
                  {yearStats.avgUtilization}%
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Charge totale</h3>
            <p className="text-xs text-gray-500">Utilisation moyenne</p>
          </div>

          <div className="app-surface rounded-xl p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  +{yearStats.additionalFTENeeded}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {yearStats.currentEmployees} → {yearStats.totalRequiredFTE}
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">ETP supplémentaires</h3>
            <p className="text-xs text-gray-500">Besoin vs capacité actuelle</p>
          </div>
        </div>

        {/* Alertes de criticité */}
        {(yearStats.criticalProcesses > 0 || yearStats.highRiskProcesses > 0) && (
          <div className="bg-rose-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Alertes de capacité pour {selectedYear}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {yearStats.criticalProcesses > 0 && (
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-800">
                        <strong>{yearStats.criticalProcesses}</strong> processus en situation critique (≥100% capacité)
                      </span>
                    </div>
                  )}
                  {yearStats.highRiskProcesses > 0 && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span className="text-orange-800">
                        <strong>{yearStats.highRiskProcesses}</strong> processus à risque élevé (≥80% capacité)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="app-surface rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom ou code processus..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.processId}
                onChange={(e) => setFilters({ ...filters, processId: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                <option value="">Tous les processus</option>
                {processes.map(process => (
                  <option key={process.id} value={process.id}>
                    {process.codeProcessus} - {process.libelleProcessMetier}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.criticality}
                onChange={(e) => setFilters({ ...filters, criticality: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                <option value="">Toutes criticités</option>
                <option value="critical">Critique</option>
                <option value="high">Élevé</option>
                <option value="medium">Moyen</option>
                <option value="low">Faible</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredProjections.length} projection(s) pour {selectedYear}
            </span>
            <button
              onClick={() => setFilters({ searchTerm: '', processId: '', criticality: '', year: selectedYear })}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        {/* Liste des projections */}
        <div className="grid gap-6">
          {filteredProjections.map((projection) => {
            const yearData = projection.projections[selectedYear];
            if (!yearData) return null;
            
            return (
              <div key={projection.id} className="app-surface rounded-xl transition hover:shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {projection.processCode}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(yearData.criticality)}`}>
                          {getCriticalityIcon(yearData.criticality)}
                          <span className="ml-1">{getCriticalityLabel(yearData.criticality)}</span>
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                          {yearData.capacityUtilization}% capacité
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {projection.processName}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewProjectionDetails(projection)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails de la projection"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setEditingProjection(projection);
                          setShowForm(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Modifier la projection"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProjection(projection.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer la projection"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="text-gray-500">Dossiers/mois:</span>
                        <p className="font-medium">{yearData.estimatedCases.toLocaleString('fr-FR')}</p>
                        <p className="text-xs text-gray-400">
                          Base: {projection.casesPerMonth2025.toLocaleString('fr-FR')} (x{yearData.clientGrowthFactor})
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <div>
                        <span className="text-gray-500">Temps moyen:</span>
                        <p className="font-medium">{projection.avgTimePerCase} min</p>
                        <p className="text-xs text-gray-400">Par dossier</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-orange-500" />
                      <div>
                        <span className="text-gray-500">Charge totale:</span>
                        <p className="font-medium">{yearData.workloadHours.toLocaleString('fr-FR')}h</p>
                        <p className="text-xs text-gray-400">Par mois</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <div>
                        <span className="text-gray-500">ETP actuels:</span>
                        <p className="font-medium">{projection.dedicatedEmployees}</p>
                        <p className="text-xs text-gray-400">
                          Capacité: {projection.dedicatedEmployees * 8 * 22}h
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-red-500" />
                      <div>
                        <span className="text-gray-500">ETP nécessaires:</span>
                        <p className="font-medium">{yearData.requiredFTE}</p>
                        <p className={`text-xs font-medium ${
                          yearData.requiredFTE > projection.dedicatedEmployees 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {yearData.requiredFTE > projection.dedicatedEmployees 
                            ? `+${(yearData.requiredFTE - projection.dedicatedEmployees).toFixed(1)} ETP`
                            : 'Capacité suffisante'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barre de progression de la capacité */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Utilisation de la capacité</span>
                      <span className={`font-medium ${
                        yearData.capacityUtilization >= 100 ? 'text-red-600' :
                        yearData.capacityUtilization >= 80 ? 'text-orange-600' :
                        yearData.capacityUtilization >= 60 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {yearData.capacityUtilization}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          yearData.capacityUtilization >= 100 ? 'bg-red-500' :
                          yearData.capacityUtilization >= 80 ? 'bg-orange-500' :
                          yearData.capacityUtilization >= 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(yearData.capacityUtilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProjections.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune projection trouvée</h3>
            <p className="text-gray-600 mb-6">
              {projections.length === 0 
                ? "Aucune projection n'a encore été configurée."
                : "Aucune projection ne correspond à vos critères de recherche pour " + selectedYear + "."
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Créer la première projection</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projections;