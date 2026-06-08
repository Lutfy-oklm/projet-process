export interface Risk {
  id: string;
  processId: string;
  processCode: string;
  processName: string;
  riskDescription: string;
  riskOwner: string;
  criticality: 1 | 2 | 3;
  probability: 1 | 2 | 3;
  qualification: number; // criticality * probability
  actionPlan: string;
  actionPlanOwner: string;
  deadline: string;
  actionPlanStatus: 'en_cours' | 'realise' | 'a_risque'; // Nouveau statut spécifique au plan d'action
  comments: string;
  dateCreated: string;
  dateUpdated: string;
  category: string;
  impact: string;
  reviewFrequency: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  nextReviewDate: string;
}

export interface RiskFilters {
  processId?: string;
  actionPlanStatus?: string;
  qualification?: string;
  riskOwner?: string;
  actionPlanOwner?: string;
  category?: string;
  searchTerm?: string;
}