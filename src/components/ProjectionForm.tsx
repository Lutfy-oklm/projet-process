import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  TrendingUp, 
  Clock, 
  Users, 
  BarChart3,
  ArrowLeft,
  Home,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { ProcessProjection } from '../types/Projection';
import { Process } from '../types/Process';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';
import { calculateProjections } from '../data/mockProjections';

interface ProjectionFormProps {
  projection?: ProcessProjection | null;
  processes: Process[];
  onSave: (projection: ProcessProjection | Omit<ProcessProjection, 'id' | 'dateCreated' | 'dateUpdated'>) => void;
  onCancel: () => void;
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
}

const ProjectionForm: React.FC<ProjectionFormProps> = ({ 
  projection, 
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
    avgTimePerCase: 30, // minutes
    dedicatedEmployees: 1,
    casesPerMonth2025: 100
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewProjections, setPreviewProjections] = useState<any>(null);

  useScrollToTopImmediate();

  useEffect(() => {
    if (projection) {
      setFormData({
        processId: projection.processId,
        processCode: projection.processCode,
        processName: projection.processName,
        avgTimePerCase: projection.avgTimePerCase,
        dedicatedEmployees: projection.dedicatedEmployees,
        casesPerMonth2025: projection.casesPerMonth2025
      });
    }
  }, [projection]);

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

  // Calculer les projections en temps réel pour prévisualisation
  useEffect(() => {
    if (formData.avgTimePerCase > 0 && formData.dedicatedEmployees > 0 && formData.casesPerMonth2025 > 0) {
      const projections = calculateProjections(
        formData.avgTimePerCase,
        formData.dedicatedEmployees,
        formData.casesPerMonth2025
      );
      setPreviewProjections(projections);
    } else {
      setPreviewProjections(null);
    }
  }, [formData.avgTimePerCase, formData.dedicatedEmployees, formData.casesPerMonth2025]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.processId) {
      newErrors.processId = 'Le processus est requis';
    }
    if (formData.avgTimePerCase <= 0) {
      newErrors.avgTimePerCase = 'Le temps moyen doit être supérieur à 0';
    }
    if (formData.dedicatedEmployees <= 0) {
      newErrors.dedicatedEmployees = 'Le nombre d\'employés doit être supérieur à 0';
    }
    if (formData.casesPerMonth2025 <= 0) {
      newErrors.casesPerMonth2025 = 'Le nombre de dossiers doit être supérieur à 0';
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

    const projectionData = {
      processId: formData.processId,
      processCode: formData.processCode,
      processName: formData.processName,
      avgTimePerCase: formData.avgTimePerCase,
      dedicatedEmployees: formData.dedicatedEmployees,
      casesPerMonth2025: formData.casesPerMonth2025,
      projections: calculateProjections(
        formData.avgTimePerCase,
        formData.dedicatedEmployees,
        formData.casesPerMonth2025
      )
    };

    if (projection) {
      onSave({
        ...projection,
        ...projectionData
      });
    } else {
      onSave(projectionData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
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
              title="Retour aux projections"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Projections</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {projection ? 'Modifier la projection' : 'Nouvelle projection'}
                </h1>
                <p className="text-slate-500 text-sm">Configuration des données de charge</p>
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sélection du processus */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <BarChart3 className="w-5 h-5 text-white" />
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
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-colors ${
                  errors.processId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'
                }`}
              >
                <option value="">Sélectionner un processus du référentiel</option>
                {processes.map(process => (
                  <option key={process.id} value={process.id}>
                    {process.codeProcessus} - {process.libelleProcessMetier}
                  </option>
                ))}
              </select>
              {errors.processId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.processId}
                </p>
              )}
            </div>
          </div>

          {/* Données de base */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Données de base 2025</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temps moyen par dossier (minutes) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.avgTimePerCase}
                  onChange={(e) => handleInputChange('avgTimePerCase', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-colors ${
                    errors.avgTimePerCase ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'
                  }`}
                  placeholder="30"
                />
                {errors.avgTimePerCase && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.avgTimePerCase}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Temps de traitement moyen d'un dossier
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'employés dédiés *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.dedicatedEmployees}
                  onChange={(e) => handleInputChange('dedicatedEmployees', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-colors ${
                    errors.dedicatedEmployees ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'
                  }`}
                  placeholder="3"
                />
                {errors.dedicatedEmployees && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.dedicatedEmployees}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  ETP actuellement affectés au processus
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dossiers traités par mois en 2025 *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.casesPerMonth2025}
                  onChange={(e) => handleInputChange('casesPerMonth2025', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-colors ${
                    errors.casesPerMonth2025 ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'
                  }`}
                  placeholder="1000"
                />
                {errors.casesPerMonth2025 && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.casesPerMonth2025}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Volume de base pour les projections
                </p>
              </div>
            </div>
          </div>

          {/* Prévisualisation des projections */}
          {previewProjections && (
            <div className="app-surface rounded-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-slate-900">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Prévisualisation des projections</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(previewProjections).map(([year, data]: [string, any]) => (
                  <div key={year} className="bg-slate-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{year}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(data.criticality)}`}>
                        {getCriticalityLabel(data.criticality)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Dossiers/mois</p>
                          <p className="font-semibold">{data.estimatedCases.toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Charge (h/mois)</p>
                          <p className="font-semibold">{data.workloadHours.toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-600">ETP nécessaires</p>
                          <p className="font-semibold">{data.requiredFTE}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Capacité</span>
                          <span className={`font-medium ${
                            data.capacityUtilization >= 100 ? 'text-red-600' :
                            data.capacityUtilization >= 80 ? 'text-orange-600' :
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
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(data.capacityUtilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{projection ? 'Mettre à jour' : 'Créer la projection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectionForm;