import React from 'react';
import { CreditCard as Edit3, Calendar, User, Shield, Target, AlertTriangle, FileText, ArrowLeft, Home, Clock, BarChart3, CheckCircle, TrendingUp } from 'lucide-react';
import { Risk } from '../types/Risk';
import { Process } from '../types/Process';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';
import { actionPlanStatuses } from '../data/mockRisks';

interface RiskDetailsProps {
  risk: Risk;
  process?: Process;
  onBack: () => void;
  onEdit: (risk: Risk) => void;
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
}

const RiskDetails: React.FC<RiskDetailsProps> = ({ 
  risk, 
  process,
  onBack, 
  onEdit, 
  onNavigateToHome,
  onGoBack,
  canGoBack = false,
  previousPageTitle
}) => {
  useScrollToTopImmediate();

  const getStatusInfo = (status: string) => {
    return actionPlanStatuses.find(s => s.value === status) || actionPlanStatuses[0];
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

  const getCriticalityLabel = (level: number) => {
    switch (level) {
      case 1: return 'Faible';
      case 2: return 'Moyen';
      case 3: return 'Élevé';
      default: return 'Faible';
    }
  };

  const getProbabilityLabel = (level: number) => {
    switch (level) {
      case 1: return 'Rare';
      case 2: return 'Possible';
      case 3: return 'Probable';
      default: return 'Rare';
    }
  };

  const getReviewFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'Mensuelle';
      case 'quarterly': return 'Trimestrielle';
      case 'biannual': return 'Semestrielle';
      case 'annual': return 'Annuelle';
      default: return frequency;
    }
  };

  const isOverdue = new Date(risk.deadline) < new Date() && risk.actionPlanStatus !== 'realise';
  const statusInfo = getStatusInfo(risk.actionPlanStatus);

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
              title="Retour au tour de contrôle"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Tour de contrôle</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Détails du risque
                </h1>
                <p className="text-slate-500 text-sm">{risk.processCode}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(risk)}
              className="app-button-primary"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm font-medium">Modifier</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* En-tête du risque */}
        <div className="app-surface rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-lg font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                  {risk.processCode}
                </span>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getQualificationColor(risk.qualification)}`}>
                  {getQualificationLabel(risk.qualification)} ({risk.qualification}/9)
                </span>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border bg-purple-100 text-purple-800 border-purple-200">
                  {risk.category}
                </span>
                {isOverdue && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border bg-red-100 text-red-800 border-red-200">
                    <Clock className="w-4 h-4 mr-2" />
                    En retard
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {risk.processName}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                <strong>Risque identifié:</strong> {risk.riskDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Informations du processus */}
          {process && (
            <div className="app-surface rounded-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-slate-900">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Processus associé</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Libellé</h3>
                  <p className="text-gray-600">{process.libelleProcessMetier}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                  <p className="text-gray-600">{process.descriptionProcessMetier}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Direction</h3>
                    <p className="text-gray-600">{process.direction}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Domaine</h3>
                    <p className="text-gray-600">{process.domaine}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Évaluation du risque */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Évaluation</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-2xl font-bold text-red-600 mb-1">{risk.criticality}</div>
                  <div className="text-sm text-gray-600">Criticité</div>
                  <div className="text-xs text-gray-500">{getCriticalityLabel(risk.criticality)}</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{risk.probability}</div>
                  <div className="text-sm text-gray-600">Probabilité</div>
                  <div className="text-xs text-gray-500">{getProbabilityLabel(risk.probability)}</div>
                </div>
                
                <div className={`text-center p-4 rounded-xl ${getQualificationColor(risk.qualification)}`}>
                  <div className="text-2xl font-bold mb-1">{risk.qualification}</div>
                  <div className="text-sm">Qualification</div>
                  <div className="text-xs">{getQualificationLabel(risk.qualification)}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Impact</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{risk.impact}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Fréquence de revue</h3>
                <p className="text-gray-600">{getReviewFrequencyLabel(risk.reviewFrequency)}</p>
              </div>
            </div>
          </div>

          {/* Responsabilités */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Responsabilités</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Responsable du risque</h3>
                  <p className="text-gray-600">{risk.riskOwner}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Responsable du plan d'action</h3>
                  <p className="text-gray-600">{risk.actionPlanOwner}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan d'action */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Plan d'action</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg leading-relaxed">{risk.actionPlan}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">Échéance</h3>
                    <p className={`text-gray-600 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      {new Date(risk.deadline).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {isOverdue && ' (En retard)'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">Prochaine revue</h3>
                    <p className="text-gray-600">
                      {new Date(risk.nextReviewDate).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {risk.comments && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Commentaires</h3>
                  <p className="text-gray-600 bg-blue-50 p-4 rounded-lg leading-relaxed">{risk.comments}</p>
                </div>
              )}
            </div>
          </div>

          {/* Historique */}
          <div className="app-surface rounded-xl p-8 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Historique</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Risque créé</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(risk.dateCreated).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Dernière mise à jour</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(risk.dateUpdated).toLocaleDateString('fr-FR', {
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

export default RiskDetails;