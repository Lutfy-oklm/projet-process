import React from 'react';
import { TrendingUp, Clock, Users, BarChart3, Target, Activity, Calendar, ArrowLeft, Home, CreditCard as Edit3, AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';
import { ProcessProjection } from '../types/Projection';
import { Process } from '../types/Process';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';
import { growthAssumptions } from '../data/mockProjections';

interface ProjectionDetailsProps {
  projection: ProcessProjection;
  process?: Process;
  onBack: () => void;
  onEdit: (projection: ProcessProjection) => void;
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
}

const ProjectionDetails: React.FC<ProjectionDetailsProps> = ({ 
  projection, 
  process,
  onBack, 
  onEdit, 
  onNavigateToHome,
  onGoBack,
  canGoBack = false,
  previousPageTitle
}) => {
  useScrollToTopImmediate();

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

  // Calculer les évolutions année par année
  const getYearOverYearGrowth = (currentYear: string, previousYear: string) => {
    const current = projection.projections[currentYear];
    const previous = projection.projections[previousYear];
    
    if (!current || !previous) return null;
    
    const casesGrowth = ((current.estimatedCases - previous.estimatedCases) / previous.estimatedCases) * 100;
    const workloadGrowth = ((current.workloadHours - previous.workloadHours) / previous.workloadHours) * 100;
    const fteGrowth = ((current.requiredFTE - previous.requiredFTE) / previous.requiredFTE) * 100;
    
    return {
      casesGrowth: Math.round(casesGrowth),
      workloadGrowth: Math.round(workloadGrowth),
      fteGrowth: Math.round(fteGrowth)
    };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-slate-950 px-6 py-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={onNavigateToHome}
              className="flex items-center space-x-2 px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200"
              title="Retour à l'accueil"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Accueil</span>
            </button>
            
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200"
              title="Retour aux projections"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Projections</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Détails de la projection
                </h1>
                <p className="text-slate-500 text-sm">{projection.processCode}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(projection)}
              className="app-button-primary"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm font-medium">Modifier</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* En-tête de la projection */}
        <div className="app-surface rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {projection.processCode}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                  <Activity className="w-3 h-3 mr-1" />
                  Projection de charge
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {projection.processName}
              </h1>
              {process && (
                <p className="text-gray-600 leading-relaxed">
                  {process.descriptionProcessMetier}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Données de base 2025 */}
          <div className="app-surface rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-slate-900">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Données de base 2025</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Temps moyen par dossier</h3>
                  <p className="text-xl font-bold text-gray-900">{projection.avgTimePerCase} minutes</p>
                  <p className="text-xs text-gray-500">Temps de traitement unitaire</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Employés dédiés</h3>
                  <p className="text-xl font-bold text-gray-900">{projection.dedicatedEmployees} ETP</p>
                  <p className="text-xs text-gray-500">
                    Capacité: {projection.dedicatedEmployees * 8 * 22} heures/mois
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Volume de base 2025</h3>
                  <p className="text-xl font-bold text-gray-900">
                    {projection.casesPerMonth2025.toLocaleString('fr-FR')} dossiers/mois
                  </p>
                  <p className="text-xs text-gray-500">Point de départ des projections</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations du processus */}
          {process && (
            <div className="app-surface rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-slate-900">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Informations du processus</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Direction</h3>
                  <p className="text-gray-600">{process.direction}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Domaine</h3>
                  <p className="text-gray-600">{process.domaine}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Macro-activité</h3>
                  <p className="text-gray-600">{process.macroActivite}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Owner du processus</h3>
                  <p className="text-gray-600">{process.ownerProcessMetier}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Responsable du service</h3>
                  <p className="text-gray-600">{process.responsableService}</p>
                </div>
              </div>
            </div>
          )}

          {/* Projections par année */}
          <div className="lg:col-span-2">
            <div className="app-surface rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-slate-900">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Projections 2025-2028</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(projection.projections).map(([year, data]) => {
                  const previousYear = (parseInt(year) - 1).toString();
                  const growth = getYearOverYearGrowth(year, previousYear);
                  const growthData = growthAssumptions[year as keyof typeof growthAssumptions];
                  
                  return (
                    <div key={year} className="bg-slate-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{year}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(data.criticality)}`}>
                          {getCriticalityIcon(data.criticality)}
                          <span className="ml-1">{getCriticalityLabel(data.criticality)}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Croissance clients */}
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Clients</span>
                            <span className="text-xs font-medium text-blue-600">
                              x{data.clientGrowthFactor}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {growthData?.clients.toLocaleString('fr-FR')}
                          </p>
                        </div>
                        
                        {/* Volume de dossiers */}
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Dossiers/mois</span>
                            {growth && (
                              <span className={`text-xs font-medium ${growth.casesGrowth > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                {growth.casesGrowth > 0 ? `+${growth.casesGrowth}%` : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {data.estimatedCases.toLocaleString('fr-FR')}
                          </p>
                        </div>
                        
                        {/* Charge de travail */}
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Charge (h/mois)</span>
                            {growth && (
                              <span className={`text-xs font-medium ${growth.workloadGrowth > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                                {growth.workloadGrowth > 0 ? `+${growth.workloadGrowth}%` : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {data.workloadHours.toLocaleString('fr-FR')}
                          </p>
                        </div>
                        
                        {/* ETP nécessaires */}
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">ETP nécessaires</span>
                            {growth && (
                              <span className={`text-xs font-medium ${growth.fteGrowth > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {growth.fteGrowth > 0 ? `+${growth.fteGrowth}%` : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900">{data.requiredFTE}</p>
                          <p className={`text-xs font-medium ${
                            data.requiredFTE > projection.dedicatedEmployees 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {data.requiredFTE > projection.dedicatedEmployees 
                              ? `+${(data.requiredFTE - projection.dedicatedEmployees).toFixed(1)} ETP`
                              : 'Capacité suffisante'
                            }
                          </p>
                        </div>
                        
                        {/* Utilisation de la capacité */}
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Utilisation capacité</span>
                            <span className={`font-medium ${
                              data.capacityUtilization >= 100 ? 'text-red-600' :
                              data.capacityUtilization >= 80 ? 'text-orange-600' :
                              data.capacityUtilization >= 60 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {data.capacityUtilization}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                data.capacityUtilization >= 100 ? 'bg-red-500' :
                                data.capacityUtilization >= 80 ? 'bg-orange-500' :
                                data.capacityUtilization >= 60 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(data.capacityUtilization, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Historique */}
          <div className="app-surface rounded-xl p-6 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-slate-900">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Historique de la projection</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Projection créée</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(projection.dateCreated).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Dernière mise à jour</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(projection.dateUpdated).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectionDetails;