export interface ProcessProjection {
  id: string;
  processId: string;
  processCode: string;
  processName: string;
  
  // Données de base 2025
  avgTimePerCase: number; // en minutes
  dedicatedEmployees: number;
  casesPerMonth2025: number;
  
  // Projections calculées
  projections: {
    [year: string]: {
      year: number;
      clientGrowthFactor: number;
      estimatedCases: number;
      workloadHours: number;
      availableCapacityHours: number;
      requiredFTE: number;
      criticality: 'low' | 'medium' | 'high' | 'critical';
      capacityUtilization: number; // en pourcentage
    };
  };
  
  // Métadonnées
  dateCreated: string;
  dateUpdated: string;
}

export interface ProjectionFilters {
  processId?: string;
  criticality?: string;
  year?: string;
  searchTerm?: string;
}

export interface GrowthAssumptions {
  2025: { clients: number; factor: number };
  2026: { clients: number; factor: number };
  2027: { clients: number; factor: number };
  2028: { clients: number; factor: number };
}