export interface Process {
  id: string;
  codeProcessus: string;
  direction: string;
  domaine: string;
  macroActivite: string;
  responsableService: string;
  ownerProcessMetier: string;
  libelleProcessMetier: string;
  descriptionProcessMetier: string;
  dateCreationProcessus: string;
  dateRevueProcessus: string;
  dateDerniereModification: string;
  diagramXML?: string; // Pour stocker le diagramme BPMN associé
  status: 'draft' | 'active' | 'review' | 'archived';
}

export interface ProcessFilters {
  direction?: string;
  domaine?: string;
  macroActivite?: string;
  status?: string;
  searchTerm?: string;
}