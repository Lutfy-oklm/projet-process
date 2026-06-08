import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Shield, 
  AlertTriangle, 
  User, 
  Target,
  Calendar,
  FileText,
  ArrowLeft,
  Home,
  Settings
} from 'lucide-react';
import { Risk } from '../types/Risk';
import { Process } from '../types/Process';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';
import { riskCategories, actionPlanStatuses } from '../data/mockRisks';

interface RiskFormProps {
  risk?: Risk | null;
  processes: Process[];
  onSave: (risk: Risk | Omit<Risk, 'id' | 'dateCreated' | 'dateUpdated'>) => void;
  onCancel: () => void;
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
}

const RiskForm: React.FC<RiskFormProps> = ({ 
  risk, 
  processes,
  onSave, 
  onCancel, 
  onNavigateToHome,
  onGoBack,
  canGoBack = false,
  previousPageTitle
}) => {
  const [formData, setFormData] = useState({
    processId: '',
    processCode: '',
    processName: '',
    riskDescription: '',
    riskOwner: '',
    criticality: 1 as 1 | 2 | 3,
    probability: 1 as 1 | 2 | 3,
    qualification: 1,
    actionPlan: '',
    actionPlanOwner: '',
    deadline: '',
    actionPlanStatus: 'en_cours' as const,
    comments: '',
    category: '',
    impact: '',
    reviewFrequency: 'quarterly' as const,
    nextReviewDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useScrollToTopImmediate();

  useEffect(() => {
    if (risk) {
      setFormData({
        processId: risk.processId,
        processCode: risk.processCode,
        processName: risk.processName,
        riskDescription: risk.riskDescription,
        riskOwner: risk.riskOwner,
        criticality: risk.criticality,
        probability: risk.probability,
        qualification: risk.qualification,
        actionPlan: risk.actionPlan,
        actionPlanOwner: risk.actionPlanOwner,
        deadline: risk.deadline,
        actionPlanStatus: risk.actionPlanStatus,
        comments: risk.comments,
        category: risk.category,
        impact: risk.impact,
        reviewFrequency: risk.reviewFrequency,
        nextReviewDate: risk.nextReviewDate
      });
    }
  }, [risk]);

  // Calculer automatiquement la qualification
  useEffect(() => {
    const newQualification = formData.criticality * formData.probability;
    setFormData(prev => ({ ...prev, qualification: newQualification }));
  }, [formData.criticality, formData.probability]);

  // Mettre à jour les informations du processus sélectionné
  useEffect(() => {
    if (formData.processId) {
      const selectedProcess = processes.find(p => p.id === formData.processId);
      if (selectedProcess) {
        setFormData(prev => ({
          ...prev,
          processCode: selectedProcess.codeProcessus,
          processName: selectedProcess.libelleProcessMetier
        }));
      }
    }
  }, [formData.processId, processes]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.processId) {
      newErrors.processId = 'Le processus est requis';
    }
    if (!formData.riskDescription.trim()) {
      newErrors.riskDescription = 'La description du risque est requise';
    }
    if (!formData.riskOwner.trim()) {
      newErrors.riskOwner = 'Le responsable du risque est requis';
    }
    if (!formData.actionPlan.trim()) {
      newErrors.actionPlan = 'Le plan d\'action est requis';
    }
    if (!formData.actionPlanOwner.trim()) {
      newErrors.actionPlanOwner = 'Le responsable du plan d\'action est requis';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'L\'échéance est requise';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'La catégorie est requise';
    }
    if (!formData.impact.trim()) {
      newErrors.impact = 'L\'impact est requis';
    }
    if (!formData.nextReviewDate) {
      newErrors.nextReviewDate = 'La date de prochaine revue est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstErrorField = document.querySelector('.border-red-300');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (risk) {
      onSave({
        ...risk,
        ...formData
      });
    } else {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
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

  const getQualificationColor = (qualification: number) => {
    if (qualification >= 7) return 'text-red-600 bg-red-50 border-red-200';
    if (qualification >= 4) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-slate-950 px-6 py-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
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
              onClick={onCancel}
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
                  {risk ? 'Modifier le risque' : 'Nouveau risque'}
                </h1>
                <p className="text-slate-500 text-sm">Tour de contrôle des risques</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Annuler</span>
            </button>
            
            <button
              onClick={handleSubmit}
              className="app-button-primary"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium">Sauvegarder</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sélection du processus */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Processus concerné</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processus *
              </label>
              <select
                value={formData.processId}
                onChange={(e) => handleInputChange('processId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-colors ${
                  errors.processId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                }`}
              >
                <option value="">Sélectionner un processus</option>
                {processes.map(process => (
                  <option key={process.id} value={process.id}>
                    {process.codeProcessus} - {process.libelleProcessMetier}
                  </option>
                ))}
              </select>
              {errors.processId && (
                <p className="mt-1 text-sm text-red-600">{errors.processId}</p>
              )}
            </div>
          </div>

          {/* Description du risque */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Identification du risque</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du risque *
                </label>
                <textarea
                  value={formData.riskDescription}
                  onChange={(e) => handleInputChange('riskDescription', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-colors ${
                    errors.riskDescription ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                  }`}
                  placeholder="Décrivez le risque identifié..."
                />
                {errors.riskDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.riskDescription}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-colors ${
                    errors.category ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                  }`}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {riskCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable du risque *
                </label>
                <input
                  type="text"
                  value={formData.riskOwner}
                  onChange={(e) => handleInputChange('riskOwner', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-colors ${
                    errors.riskOwner ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                  }`}
                  placeholder="Nom du responsable"
                />
                {errors.riskOwner && (
                  <p className="mt-1 text-sm text-red-600">{errors.riskOwner}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact *
                </label>
                <textarea
                  value={formData.impact}
                  onChange={(e) => handleInputChange('impact', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-colors ${
                    errors.impact ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                  }`}
                  placeholder="Décrivez l'impact potentiel..."
                />
                {errors.impact && (
                  <p className="mt-1 text-sm text-red-600">{errors.impact}</p>
                )}
              </div>
            </div>
          </div>

          {/* Évaluation du risque */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Évaluation</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Criticité *
                </label>
                <select
                  value={formData.criticality}
                  onChange={(e) => handleInputChange('criticality', parseInt(e.target.value) as 1 | 2 | 3)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value={1}>1 - {getCriticalityLabel(1)}</option>
                  <option value={2}>2 - {getCriticalityLabel(2)}</option>
                  <option value={3}>3 - {getCriticalityLabel(3)}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Probabilité *
                </label>
                <select
                  value={formData.probability}
                  onChange={(e) => handleInputChange('probability', parseInt(e.target.value) as 1 | 2 | 3)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value={1}>1 - {getProbabilityLabel(1)}</option>
                  <option value={2}>2 - {getProbabilityLabel(2)}</option>
                  <option value={3}>3 - {getProbabilityLabel(3)}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification (auto)
                </label>
                <div className={`w-full px-4 py-3 border rounded-xl font-bold text-lg ${getQualificationColor(formData.qualification)}`}>
                  {formData.qualification}/9
                  <span className="text-sm font-normal ml-2">
                    ({formData.criticality} × {formData.probability})
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence de revue *
                </label>
                <select
                  value={formData.reviewFrequency}
                  onChange={(e) => handleInputChange('reviewFrequency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="monthly">Mensuelle</option>
                  <option value="quarterly">Trimestrielle</option>
                  <option value="biannual">Semestrielle</option>
                  <option value="annual">Annuelle</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prochaine revue *
                </label>
                <input
                  type="date"
                  value={formData.nextReviewDate}
                  onChange={(e) => handleInputChange('nextReviewDate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-colors ${
                    errors.nextReviewDate ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                  }`}
                />
                {errors.nextReviewDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.nextReviewDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Plan d'action */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Plan d'action</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan d'action *
                </label>
                <textarea
                  value={formData.actionPlan}
                  onChange={(e) => handleInputChange('actionPlan', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-colors ${
                    errors.actionPlan ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                  }`}
                  placeholder="Décrivez le plan d'action pour traiter ce risque..."
                />
                {errors.actionPlan && (
                  <p className="mt-1 text-sm text-red-600">{errors.actionPlan}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable du plan d'action *
                </label>
                <input
                  type="text"
                  value={formData.actionPlanOwner}
                  onChange={(e) => handleInputChange('actionPlanOwner', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-colors ${
                    errors.actionPlanOwner ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                  }`}
                  placeholder="Nom du responsable"
                />
                {errors.actionPlanOwner && (
                  <p className="mt-1 text-sm text-red-600">{errors.actionPlanOwner}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Échéance *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-colors ${
                    errors.deadline ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
                  }`}
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut du plan d'action *
                </label>
                <select
                  value={formData.actionPlanStatus}
                  onChange={(e) => handleInputChange('actionPlanStatus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  {actionPlanStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Commentaires additionnels..."
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="app-button-primary"
            >
              <Save className="w-5 h-5" />
              <span>{risk ? 'Mettre à jour' : 'Créer le risque'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiskForm;