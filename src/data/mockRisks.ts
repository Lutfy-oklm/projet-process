import { Risk } from '../types/Risk';

export const mockRisks: Risk[] = [
  {
    id: '1',
    processId: '1',
    processCode: 'BFB-001',
    processName: 'Ouverture de compte particulier',
    riskDescription: 'Risque de fraude lors de la vérification d\'identité',
    riskOwner: 'Sophie Bernard',
    criticality: 3,
    probability: 2,
    qualification: 6,
    actionPlan: 'Mise en place d\'un système de double vérification et formation des équipes',
    actionPlanOwner: 'Jean Martin',
    deadline: '2024-06-30',
    actionPlanStatus: 'en_cours',
    comments: 'Formation en cours, système technique en développement',
    dateCreated: '2024-03-01',
    dateUpdated: '2024-03-20',
    category: 'Fraude',
    impact: 'Perte financière et atteinte à la réputation',
    reviewFrequency: 'quarterly',
    nextReviewDate: '2024-06-01'
  },
  {
    id: '2',
    processId: '2',
    processCode: 'BFB-002',
    processName: 'Évaluation des risques crédit',
    riskDescription: 'Défaillance du système de scoring automatique',
    riskOwner: 'Pierre Leroy',
    criticality: 2,
    probability: 2,
    qualification: 4,
    actionPlan: 'Mise en place d\'un système de backup et procédures manuelles',
    actionPlanOwner: 'Claire Petit',
    deadline: '2024-05-15',
    actionPlanStatus: 'realise',
    comments: 'Système de backup opérationnel, procédures testées',
    dateCreated: '2024-02-15',
    dateUpdated: '2024-03-25',
    category: 'Technique',
    impact: 'Ralentissement des décisions de crédit',
    reviewFrequency: 'monthly',
    nextReviewDate: '2024-04-15'
  },
  {
    id: '3',
    processId: '3',
    processCode: 'BFB-003',
    processName: 'Gestion des incidents IT',
    riskDescription: 'Temps de résolution trop long impactant les services clients',
    riskOwner: 'Thomas Moreau',
    criticality: 2,
    probability: 3,
    qualification: 6,
    actionPlan: 'Renforcement de l\'équipe support et amélioration des outils de monitoring',
    actionPlanOwner: 'Anne Rousseau',
    deadline: '2024-07-31',
    actionPlanStatus: 'a_risque',
    comments: 'Budget approuvé, recrutement en cours mais retards identifiés',
    dateCreated: '2024-03-10',
    dateUpdated: '2024-03-15',
    category: 'Opérationnel',
    impact: 'Insatisfaction client et perte de revenus',
    reviewFrequency: 'monthly',
    nextReviewDate: '2024-04-10'
  }
];

export const riskCategories = [
  'Fraude',
  'Technique',
  'Opérationnel',
  'Réglementaire',
  'Crédit',
  'Marché',
  'Liquidité',
  'Réputation'
];

export const actionPlanStatuses = [
  { value: 'en_cours', label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'realise', label: 'Réalisé', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'a_risque', label: 'À risque (pas commencé)', color: 'bg-red-100 text-red-800 border-red-200' }
];