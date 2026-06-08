import { Process } from '../types/Process';

export const mockProcesses: Process[] = [
  {
    id: '1',
    codeProcessus: 'BFB-001',
    direction: 'Direction Commerciale',
    domaine: 'Relation Client',
    macroActivite: 'Onboarding',
    responsableService: 'Marie Dubois',
    ownerProcessMetier: 'Jean Martin',
    libelleProcessMetier: 'Ouverture de compte particulier',
    descriptionProcessMetier: 'Processus complet d\'ouverture de compte pour les particuliers incluant la vérification d\'identité, l\'évaluation des risques et la validation finale.',
    dateCreationProcessus: '2024-01-15',
    dateRevueProcessus: '2024-06-15',
    dateDerniereModification: '2024-03-20',
    status: 'active'
  },
  {
    id: '2',
    codeProcessus: 'BFB-002',
    direction: 'Direction des Risques',
    domaine: 'Conformité',
    macroActivite: 'Contrôle',
    responsableService: 'Pierre Leroy',
    ownerProcessMetier: 'Sophie Bernard',
    libelleProcessMetier: 'Évaluation des risques crédit',
    descriptionProcessMetier: 'Processus d\'évaluation et de validation des demandes de crédit selon les critères internes et réglementaires.',
    dateCreationProcessus: '2024-02-01',
    dateRevueProcessus: '2024-08-01',
    dateDerniereModification: '2024-03-15',
    status: 'active'
  },
  {
    id: '3',
    codeProcessus: 'BFB-003',
    direction: 'Direction IT',
    domaine: 'Système d\'Information',
    macroActivite: 'Support',
    responsableService: 'Thomas Moreau',
    ownerProcessMetier: 'Claire Petit',
    libelleProcessMetier: 'Gestion des incidents IT',
    descriptionProcessMetier: 'Processus de traitement et résolution des incidents techniques affectant les services bancaires.',
    dateCreationProcessus: '2024-01-10',
    dateRevueProcessus: '2024-07-10',
    dateDerniereModification: '2024-03-25',
    status: 'review'
  },
  {
    id: '4',
    codeProcessus: 'BFB-004',
    direction: 'Direction Opérationnelle',
    domaine: 'Back Office',
    macroActivite: 'Traitement',
    responsableService: 'Anne Rousseau',
    ownerProcessMetier: 'Michel Blanc',
    libelleProcessMetier: 'Traitement des virements internationaux',
    descriptionProcessMetier: 'Processus de validation et exécution des virements internationaux avec contrôles de conformité.',
    dateCreationProcessus: '2024-02-20',
    dateRevueProcessus: '2024-08-20',
    dateDerniereModification: '2024-03-10',
    status: 'active'
  },
  {
    id: '5',
    codeProcessus: 'BFB-005',
    direction: 'Direction Commerciale',
    domaine: 'Produits',
    macroActivite: 'Vente',
    responsableService: 'Julien Garnier',
    ownerProcessMetier: 'Isabelle Roux',
    libelleProcessMetier: 'Souscription assurance vie',
    descriptionProcessMetier: 'Processus de souscription et validation des contrats d\'assurance vie pour les clients particuliers.',
    dateCreationProcessus: '2024-01-25',
    dateRevueProcessus: '2024-07-25',
    dateDerniereModification: '2024-03-05',
    status: 'draft'
  }
];

// Ces valeurs par défaut sont maintenant gérées par le hook useFormOptions
// mais on les garde ici pour la compatibilité
export const directions = [
  'Direction Commerciale',
  'Direction des Risques',
  'Direction IT',
  'Direction Opérationnelle',
  'Direction Juridique',
  'Direction RH'
];

export const domaines = [
  'Relation Client',
  'Conformité',
  'Système d\'Information',
  'Back Office',
  'Produits',
  'Ressources Humaines'
];

export const macroActivites = [
  'Onboarding',
  'Contrôle',
  'Support',
  'Traitement',
  'Vente',
  'Formation'
];