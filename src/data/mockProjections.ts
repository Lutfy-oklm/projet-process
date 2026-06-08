import { ProcessProjection, GrowthAssumptions } from '../types/Projection';

export const growthAssumptions: GrowthAssumptions = {
  2025: { clients: 300000, factor: 1 },
  2026: { clients: 1200000, factor: 4 },
  2027: { clients: 2000000, factor: 6.67 },
  2028: { clients: 3000000, factor: 10 }
};

// Fonction pour calculer la criticité basée sur l'utilisation de la capacité
export const calculateCriticality = (utilizationPercent: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (utilizationPercent >= 100) return 'critical';
  if (utilizationPercent >= 80) return 'high';
  if (utilizationPercent >= 60) return 'medium';
  return 'low';
};

// Fonction pour calculer les projections d'un processus
export const calculateProjections = (
  avgTimePerCase: number,
  dedicatedEmployees: number,
  casesPerMonth2025: number
) => {
  const projections: any = {};
  
  Object.entries(growthAssumptions).forEach(([year, { factor }]) => {
    const estimatedCases = Math.round(casesPerMonth2025 * factor);
    const workloadHours = (estimatedCases * avgTimePerCase) / 60;
    const availableCapacityHours = dedicatedEmployees * 8 * 22; // 8h/jour × 22 jours ouvrés
    const requiredFTE = workloadHours / (8 * 22);
    const capacityUtilization = (workloadHours / availableCapacityHours) * 100;
    
    projections[year] = {
      year: parseInt(year),
      clientGrowthFactor: factor,
      estimatedCases,
      workloadHours: Math.round(workloadHours),
      availableCapacityHours,
      requiredFTE: Math.round(requiredFTE * 10) / 10,
      criticality: calculateCriticality(capacityUtilization),
      capacityUtilization: Math.round(capacityUtilization)
    };
  });
  
  return projections;
};

export const mockProjections: ProcessProjection[] = [
  {
    id: '1',
    processId: '1',
    processCode: 'BFB-001',
    processName: 'Ouverture de compte particulier',
    avgTimePerCase: 45, // 45 minutes par dossier
    dedicatedEmployees: 5,
    casesPerMonth2025: 2500,
    projections: calculateProjections(45, 5, 2500),
    dateCreated: '2024-03-01',
    dateUpdated: '2024-03-20'
  },
  {
    id: '2',
    processId: '2',
    processCode: 'BFB-002',
    processName: 'Évaluation des risques crédit',
    avgTimePerCase: 30,
    dedicatedEmployees: 3,
    casesPerMonth2025: 1800,
    projections: calculateProjections(30, 3, 1800),
    dateCreated: '2024-02-15',
    dateUpdated: '2024-03-25'
  },
  {
    id: '3',
    processId: '3',
    processCode: 'BFB-003',
    processName: 'Gestion des incidents IT',
    avgTimePerCase: 120, // 2h par incident
    dedicatedEmployees: 4,
    casesPerMonth2025: 800,
    projections: calculateProjections(120, 4, 800),
    dateCreated: '2024-03-10',
    dateUpdated: '2024-03-15'
  },
  {
    id: '4',
    processId: '4',
    processCode: 'BFB-004',
    processName: 'Traitement des virements internationaux',
    avgTimePerCase: 15,
    dedicatedEmployees: 2,
    casesPerMonth2025: 3200,
    projections: calculateProjections(15, 2, 3200),
    dateCreated: '2024-02-20',
    dateUpdated: '2024-03-10'
  },
  {
    id: '5',
    processId: '5',
    processCode: 'BFB-005',
    processName: 'Souscription assurance vie',
    avgTimePerCase: 60,
    dedicatedEmployees: 3,
    casesPerMonth2025: 1200,
    projections: calculateProjections(60, 3, 1200),
    dateCreated: '2024-01-25',
    dateUpdated: '2024-03-05'
  }
];