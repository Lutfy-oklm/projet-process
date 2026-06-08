import React, { useState, useMemo } from 'react';
import { Shield, AlertTriangle, Plus, Search, Filter, CreditCard as Edit3, Eye, Trash2, Calendar, User, Target, TrendingUp, BarChart3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Risk, RiskFilters } from '../types/Risk';
import { Process } from '../types/Process';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';
import { mockRisks, riskCategories, actionPlanStatuses } from '../data/mockRisks';
import RiskForm from './RiskForm';
import RiskDetails from './RiskDetails';

interface ControlTowerProps {
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
  processes: Process[];
  risks: Risk[];
  onUpdateRisks: (risks: Risk[]) => void;
}

const ControlTower: React.FC<ControlTowerProps> = ({
  onNavigateToHome,
  onGoBack,
  canGoBack = false,
  previousPageTitle,
  processes,
  risks,
  onUpdateRisks
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  
  const [filters, setFilters] = useState<RiskFilters>({
    searchTerm: '',
    processId: '',
    actionPlanStatus: '',
    qualification: '',
    riskOwner: '',
    actionPlanOwner: '',
    category: ''
  });

  useScrollToTopImmediate(viewMode);
  useScrollToTopImmediate(showForm);

  // Statistiques des risques (simplifiées)
  const stats = useMemo(() => {
    const total = risks.length;
    const byStatus = risks.reduce((acc, risk) => {
      acc[risk.actionPlanStatus] = (acc[risk.actionPlanStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byQualification = risks.reduce((acc, risk) => {
      const level = risk.qualification >= 7 ? 'high' : risk.qualification >= 4 ? 'medium' : 'low';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    const overdue = risks.filter(risk => 
      new Date(risk.deadline) < new Date() && risk.actionPlanStatus !== 'realise'
    ).length;

    const avgQualification = total > 0 ? 
      Math.round((risks.reduce((sum, risk) => sum + risk.qualification, 0) / total) * 10) / 10 : 0;

    return {
      total,
      byStatus,
      byQualification,
      overdue,
      avgQualification
    };
  }, [risks]);

  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      const matchesSearch = !filters.searchTerm || 
        risk.riskDescription.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        risk.processName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        risk.processCode.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesProcess = !filters.processId || risk.processId === filters.processId;
      const matchesStatus = !filters.actionPlanStatus || risk.actionPlanStatus === filters.actionPlanStatus;
      const matchesCategory = !filters.category || risk.category === filters.category;
      const matchesRiskOwner = !filters.riskOwner || risk.riskOwner === filters.riskOwner;
      const matchesActionOwner = !filters.actionPlanOwner || risk.actionPlanOwner === filters.actionPlanOwner;
      
      let matchesQualification = true;
      if (filters.qualification) {
        if (filters.qualification === 'high') matchesQualification = risk.qualification >= 7;
        else if (filters.qualification === 'medium') matchesQualification = risk.qualification >= 4 && risk.qualification < 7;
        else if (filters.qualification === 'low') matchesQualification = risk.qualification < 4;
      }

      return matchesSearch && matchesProcess && matchesStatus && matchesCategory && 
             matchesRiskOwner && matchesActionOwner && matchesQualification;
    });
  }, [risks, filters]);

  const matrixCells = useMemo(() => {
    return [3, 2, 1].flatMap(criticality =>
      [1, 2, 3].map(probability => {
        const cellRisks = filteredRisks.filter(risk => risk.criticality === criticality && risk.probability === probability);
        const score = criticality * probability;
        const tone = score >= 7
          ? 'bg-red-100 text-red-900 border-red-200'
          : score >= 4
            ? 'bg-orange-100 text-orange-900 border-orange-200'
            : 'bg-green-100 text-green-900 border-green-200';

        return {
          criticality,
          probability,
          score,
          risks: cellRisks,
          tone
        };
      })
    );
  }, [filteredRisks]);

  const handleCreateRisk = (riskData: Omit<Risk, 'id' | 'dateCreated' | 'dateUpdated'>) => {
    const newRisk: Risk = {
      ...riskData,
      id: Date.now().toString(),
      dateCreated: new Date().toISOString().split('T')[0],
      dateUpdated: new Date().toISOString().split('T')[0]
    };
    
    onUpdateRisks([...risks, newRisk]);
    setShowForm(false);
  };

  const handleUpdateRisk = (updatedRisk: Risk) => {
    const updated = {
      ...updatedRisk,
      dateUpdated: new Date().toISOString().split('T')[0]
    };
    
    onUpdateRisks(risks.map(r => r.id === updated.id ? updated : r));
    setEditingRisk(null);
    setShowForm(false);
  };

  const handleDeleteRisk = (riskId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce risque ?')) {
      onUpdateRisks(risks.filter(r => r.id !== riskId));
    }
  };

  const getQualificationColor = (qualification: number) => {
    if (qualification >= 7) return 'bg-red-100 text-red-800 border-red-200';
    if (qualification >= 4) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getQualificationLabel = (qualification: number) => {
    if (qualification >= 7) return 'Élevé';
    if (qualification >= 4) return 'Moyen';
    return 'Faible';
  };

  const getStatusInfo = (status: string) => {
    return actionPlanStatuses.find(s => s.value === status) || actionPlanStatuses[0];
  };

  const isOverdue = (deadline: string, status: string) => {
    return new Date(deadline) < new Date() && status !== 'realise';
  };

  if (showForm) {
    return (
      <RiskForm
        risk={editingRisk}
        processes={processes}
        onSave={editingRisk ? handleUpdateRisk : handleCreateRisk}
        onCancel={() => {
          setShowForm(false);
          setEditingRisk(null);
        }}
        onNavigateToHome={onNavigateToHome}
        onGoBack={onGoBack}
        canGoBack={canGoBack}
        previousPageTitle={previousPageTitle}
      />
    );
  }

  if (viewMode === 'details' && selectedRisk) {
    return (
      <RiskDetails
        risk={selectedRisk}
        process={processes.find(p => p.id === selectedRisk.processId)}
        onBack={() => {
          setViewMode('list');
          setSelectedRisk(null);
        }}
        onEdit={(risk) => {
          setEditingRisk(risk);
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
                <Shield className="w-6 h-6 mr-2" />
                Tour de Contrôle
              </h1>
              <p className="text-slate-500 text-sm">
                {risks.length} risques • Gestion centralisée des risques processus
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowForm(true)}
              className="app-button-primary"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Nouveau risque</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <RiskKpiCard label="Risques suivis" value={stats.total.toString()} icon={Shield} tone="blue" />
          <RiskKpiCard label="Criticite moyenne" value={stats.avgQualification.toString()} icon={BarChart3} tone="purple" />
          <RiskKpiCard label="Risques eleves" value={stats.byQualification.high.toString()} icon={AlertTriangle} tone="red" />
          <RiskKpiCard label="Plans en retard" value={stats.overdue.toString()} icon={Clock} tone="orange" />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="app-surface rounded-xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="flex items-center text-lg font-bold text-gray-900">
                  <BarChart3 className="mr-2 h-5 w-5 text-red-600" />
                  Matrice Impact x Probabilite
                </h2>
                <p className="mt-1 text-sm text-gray-500">Lecture immediate de l'exposition aux risques filtres.</p>
              </div>
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {filteredRisks.length} risque(s)
              </span>
            </div>

            <div className="grid grid-cols-[90px_repeat(3,minmax(0,1fr))] gap-2">
              <div />
              {[1, 2, 3].map(probability => (
                <div key={probability} className="text-center text-xs font-semibold text-gray-500">
                  Prob. {probability}
                </div>
              ))}
              {[3, 2, 1].map(criticality => (
                <React.Fragment key={criticality}>
                  <div className="flex items-center text-xs font-semibold text-gray-500">
                    Impact {criticality}
                  </div>
                  {matrixCells
                    .filter(cell => cell.criticality === criticality)
                    .map(cell => (
                      <button
                        key={`${cell.criticality}-${cell.probability}`}
                        type="button"
                        onClick={() => setFilters({ ...filters, qualification: cell.score >= 7 ? 'high' : cell.score >= 4 ? 'medium' : 'low' })}
                        className={`min-h-24 rounded-xl border p-3 text-left transition hover:scale-[1.01] ${cell.tone}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">Score {cell.score}</span>
                          <span className="text-lg font-bold">{cell.risks.length}</span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-xs opacity-80">
                          {cell.risks.length > 0 ? cell.risks[0].riskDescription : 'Aucun risque'}
                        </p>
                      </button>
                    ))}
                </React.Fragment>
              ))}
            </div>
          </section>

          <section className="app-surface rounded-xl p-6">
            <h2 className="mb-5 flex items-center text-lg font-bold text-gray-900">
              <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
              Synthese de criticite
            </h2>
            <div className="space-y-4">
              <RiskLevelRow label="Eleve" value={stats.byQualification.high} total={stats.total} color="bg-red-500" />
              <RiskLevelRow label="Moyen" value={stats.byQualification.medium} total={stats.total} color="bg-orange-500" />
              <RiskLevelRow label="Faible" value={stats.byQualification.low} total={stats.total} color="bg-green-500" />
            </div>
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-[#0b1424] dark:bg-[#060d19]">
              <p className="text-sm font-semibold text-gray-900">Priorite de traitement</p>
              <p className="mt-1 text-sm text-gray-600">
                Les cases rouges combinent impact et probabilite eleves. Cliquez une case pour filtrer rapidement la liste.
              </p>
            </div>
          </section>
        </div>
        {/* Filtres et recherche - directement après l'en-tête */}
        <div className="app-surface rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par description, processus..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>
            
            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.processId}
                onChange={(e) => setFilters({ ...filters, processId: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="">Tous les processus</option>
                {processes.map(process => (
                  <option key={process.id} value={process.id}>
                    {process.codeProcessus} - {process.libelleProcessMetier}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.actionPlanStatus}
                onChange={(e) => setFilters({ ...filters, actionPlanStatus: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="">Tous les statuts</option>
                {actionPlanStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              
              <select
                value={filters.qualification}
                onChange={(e) => setFilters({ ...filters, qualification: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="">Toutes qualifications</option>
                <option value="high">Élevé (≥7)</option>
                <option value="medium">Moyen (4-6)</option>
                <option value="low">Faible (1-3)</option>
              </select>
              
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="">Toutes catégories</option>
                {riskCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredRisks.length} risque(s) trouvé(s)
              {filteredRisks.length !== risks.length && (
                <span className="text-red-600 ml-1">
                  sur {risks.length} total
                </span>
              )}
            </span>
            <button
              onClick={() => setFilters({ searchTerm: '', processId: '', actionPlanStatus: '', qualification: '', riskOwner: '', actionPlanOwner: '', category: '' })}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        {/* Liste des risques */}
        <div className="grid gap-6">
          {filteredRisks.map((risk) => {
            const statusInfo = getStatusInfo(risk.actionPlanStatus);
            const overdue = isOverdue(risk.deadline, risk.actionPlanStatus);
            
            return (
              <div key={risk.id} className="app-surface rounded-xl transition hover:shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {risk.processCode}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getQualificationColor(risk.qualification)}`}>
                          {getQualificationLabel(risk.qualification)} ({risk.qualification}/9)
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                          {risk.category}
                        </span>
                        {overdue && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">
                            <Clock className="w-3 h-3 mr-1" />
                            En retard
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {risk.processName}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        <strong>Risque:</strong> {risk.riskDescription}
                      </p>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        <strong>Plan d'action:</strong> {risk.actionPlan}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedRisk(risk);
                          setViewMode('details');
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setEditingRisk(risk);
                          setShowForm(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRisk(risk.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="text-gray-500">Responsable risque:</span>
                        <p className="font-medium">{risk.riskOwner}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <div>
                        <span className="text-gray-500">Responsable action:</span>
                        <p className="font-medium">{risk.actionPlanOwner}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <div>
                        <span className="text-gray-500">Échéance:</span>
                        <p className={`font-medium ${overdue ? 'text-red-600' : ''}`}>
                          {new Date(risk.deadline).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <div>
                        <span className="text-gray-500">Criticité × Probabilité:</span>
                        <p className="font-medium">{risk.criticality} × {risk.probability} = {risk.qualification}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRisks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Shield className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun risque trouvé</h3>
            <p className="text-gray-600 mb-6">
              {risks.length === 0 
                ? "Aucun risque n'a encore été identifié."
                : "Aucun risque ne correspond à vos critères de recherche."
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="app-button-primary"
            >
              <Plus className="w-5 h-5" />
              <span>Identifier le premier risque</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface RiskKpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: 'blue' | 'purple' | 'red' | 'orange';
}

const riskKpiTones: Record<RiskKpiCardProps['tone'], string> = {
  blue: 'border-blue-100 bg-blue-50 text-blue-700',
  purple: 'border-purple-100 bg-purple-50 text-purple-700',
  red: 'border-red-100 bg-red-50 text-red-700',
  orange: 'border-orange-100 bg-orange-50 text-orange-700'
};

const RiskKpiCard: React.FC<RiskKpiCardProps> = ({ label, value, icon: Icon, tone }) => (
  <div className={`rounded-xl border p-4 ${riskKpiTones[tone]}`}>
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/70">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
    <p className="mt-1 text-3xl font-bold">{value}</p>
  </div>
);

interface RiskLevelRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const RiskLevelRow: React.FC<RiskLevelRowProps> = ({ label, value, total, color }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">{value} ({percentage}%)</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#0b1424]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default ControlTower;
