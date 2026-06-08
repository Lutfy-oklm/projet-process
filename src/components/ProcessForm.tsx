import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Building, 
  Tag, 
  User, 
  FileText,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Home,
  Settings
} from 'lucide-react';
import { Process } from '../types/Process';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';
import { useFormOptions } from '../hooks/useFormOptions';
import EditableSelect from './EditableSelect';

interface ProcessFormProps {
  process?: Process | null;
  onSave: (process: Process | Omit<Process, 'id' | 'dateCreationProcessus' | 'dateDerniereModification'>) => void;
  onCancel: () => void;
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
}

const ProcessForm: React.FC<ProcessFormProps> = ({ 
  process, 
  onSave, 
  onCancel, 
  onNavigateToHome,
  onGoBack,
  canGoBack = false,
  previousPageTitle
}) => {
  const [formData, setFormData] = useState({
    codeProcessus: '',
    direction: '',
    domaine: '',
    macroActivite: '',
    responsableService: '',
    ownerProcessMetier: '',
    libelleProcessMetier: '',
    descriptionProcessMetier: '',
    dateRevueProcessus: '',
    status: 'draft' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { options, addOption } = useFormOptions();

  // Scroll vers le haut au chargement du formulaire
  useScrollToTopImmediate();

  useEffect(() => {
    if (process) {
      setFormData({
        codeProcessus: process.codeProcessus,
        direction: process.direction,
        domaine: process.domaine,
        macroActivite: process.macroActivite,
        responsableService: process.responsableService,
        ownerProcessMetier: process.ownerProcessMetier,
        libelleProcessMetier: process.libelleProcessMetier,
        descriptionProcessMetier: process.descriptionProcessMetier,
        dateRevueProcessus: process.dateRevueProcessus,
        status: process.status
      });
    }
  }, [process]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codeProcessus.trim()) {
      newErrors.codeProcessus = 'Le code processus est requis';
    }
    if (!formData.direction.trim()) {
      newErrors.direction = 'La direction est requise';
    }
    if (!formData.domaine.trim()) {
      newErrors.domaine = 'Le domaine est requis';
    }
    if (!formData.macroActivite.trim()) {
      newErrors.macroActivite = 'La macro-activité est requise';
    }
    if (!formData.responsableService.trim()) {
      newErrors.responsableService = 'Le responsable de service est requis';
    }
    if (!formData.ownerProcessMetier.trim()) {
      newErrors.ownerProcessMetier = 'L\'owner du processus métier est requis';
    }
    if (!formData.libelleProcessMetier.trim()) {
      newErrors.libelleProcessMetier = 'Le libellé du processus métier est requis';
    }
    if (!formData.descriptionProcessMetier.trim()) {
      newErrors.descriptionProcessMetier = 'La description du processus métier est requise';
    }
    if (!formData.dateRevueProcessus) {
      newErrors.dateRevueProcessus = 'La date de revue est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll vers le premier champ avec erreur
      const firstErrorField = document.querySelector('.border-red-300');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Ajouter automatiquement les nouvelles valeurs aux options si elles n'existent pas
    if (formData.direction.trim()) {
      addOption('directions', formData.direction.trim());
    }
    if (formData.domaine.trim()) {
      addOption('domaines', formData.domaine.trim());
    }
    if (formData.macroActivite.trim()) {
      addOption('macroActivites', formData.macroActivite.trim());
    }

    if (process) {
      onSave({
        ...process,
        ...formData
      });
    } else {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-slate-950 px-6 py-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            {/* Navigation spécifique : Accueil + Référentiel */}
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
              title="Retour au référentiel"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Référentiel</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold">
                  {process ? 'Modifier le processus' : 'Nouveau processus'}
                </h1>
                <p className="text-slate-500 text-sm">Référentiel de processus</p>
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
        {/* Aide contextuelle simplifiée */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Settings className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Saisie intelligente</h3>
              <p className="text-sm text-blue-700">
                Vous pouvez saisir librement dans les champs Direction, Domaine et Macro-activité. 
                Vos nouvelles valeurs seront automatiquement sauvegardées pour faciliter les prochaines saisies.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations générales */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Informations générales</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code processus *
                </label>
                <input
                  type="text"
                  value={formData.codeProcessus}
                  onChange={(e) => handleInputChange('codeProcessus', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.codeProcessus ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Ex: BFB-001"
                />
                {errors.codeProcessus && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.codeProcessus}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="draft">Brouillon</option>
                  <option value="active">Actif</option>
                  <option value="review">En révision</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Organisation */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Organisation</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <EditableSelect
                value={formData.direction}
                onChange={(value) => handleInputChange('direction', value)}
                options={options.directions}
                onAddOption={(value) => addOption('directions', value)}
                placeholder="Sélectionner ou saisir une direction"
                label="Direction"
                error={errors.direction}
              />
              
              <EditableSelect
                value={formData.domaine}
                onChange={(value) => handleInputChange('domaine', value)}
                options={options.domaines}
                onAddOption={(value) => addOption('domaines', value)}
                placeholder="Sélectionner ou saisir un domaine"
                label="Domaine"
                error={errors.domaine}
              />
              
              <EditableSelect
                value={formData.macroActivite}
                onChange={(value) => handleInputChange('macroActivite', value)}
                options={options.macroActivites}
                onAddOption={(value) => addOption('macroActivites', value)}
                placeholder="Sélectionner ou saisir une macro-activité"
                label="Macro-activité"
                error={errors.macroActivite}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de revue processus *
                </label>
                <input
                  type="date"
                  value={formData.dateRevueProcessus}
                  onChange={(e) => handleInputChange('dateRevueProcessus', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.dateRevueProcessus ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors.dateRevueProcessus && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.dateRevueProcessus}
                  </p>
                )}
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
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable du service *
                </label>
                <input
                  type="text"
                  value={formData.responsableService}
                  onChange={(e) => handleInputChange('responsableService', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.responsableService ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Nom du responsable"
                />
                {errors.responsableService && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.responsableService}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner du processus métier *
                </label>
                <input
                  type="text"
                  value={formData.ownerProcessMetier}
                  onChange={(e) => handleInputChange('ownerProcessMetier', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.ownerProcessMetier ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Nom de l'owner"
                />
                {errors.ownerProcessMetier && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.ownerProcessMetier}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="app-surface rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Description du processus</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Libellé du processus métier *
                </label>
                <input
                  type="text"
                  value={formData.libelleProcessMetier}
                  onChange={(e) => handleInputChange('libelleProcessMetier', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.libelleProcessMetier ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Titre du processus"
                />
                {errors.libelleProcessMetier && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.libelleProcessMetier}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du processus métier *
                </label>
                <textarea
                  value={formData.descriptionProcessMetier}
                  onChange={(e) => handleInputChange('descriptionProcessMetier', e.target.value)}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.descriptionProcessMetier ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Description détaillée du processus, ses objectifs, ses étapes principales..."
                />
                {errors.descriptionProcessMetier && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.descriptionProcessMetier}
                  </p>
                )}
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
              <span>{process ? 'Mettre à jour' : 'Créer le processus'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessForm;