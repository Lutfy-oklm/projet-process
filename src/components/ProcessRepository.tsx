import React, { useMemo, useState } from 'react';
import {
  Building,
  Calendar,
  ChevronDown,
  ChevronRight,
  CreditCard as Edit3,
  Eye,
  FileText,
  GitBranch,
  Kanban,
  LayoutGrid,
  Plus,
  Search,
  Tag,
  Trash2,
  User,
  Table2,
  Network
} from 'lucide-react';
import { Process, ProcessFilters } from '../types/Process';
import { Risk } from '../types/Risk';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';
import { useFormOptions } from '../hooks/useFormOptions';
import ProcessForm from './ProcessForm';
import ProcessDetails from './ProcessDetails';

interface ProcessRepositoryProps {
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
  onEditProcess?: (process: Process) => void;
  processes: Process[];
  risks?: Risk[];
  onUpdateProcesses: (processes: Process[]) => void;
}

const ProcessRepository: React.FC<ProcessRepositoryProps> = ({
  onNavigateToHome,
  onGoBack,
  canGoBack = false,
  previousPageTitle,
  onEditProcess,
  processes,
  risks = [],
  onUpdateProcesses
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree' | 'kanban' | 'cards' | 'table' | 'details'>('list');
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<Record<string, boolean>>({
    Entreprise: true
  });
  const { options } = useFormOptions();

  const [filters, setFilters] = useState<ProcessFilters>({
    searchTerm: '',
    direction: '',
    domaine: '',
    macroActivite: '',
    status: ''
  });

  useScrollToTopImmediate(viewMode);
  useScrollToTopImmediate(showForm);

  const getUniqueValuesFromProcesses = (field: keyof Process) => {
    const values = processes.map(process => process[field] as string).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  const getFilterOptions = (field: 'directions' | 'domaines' | 'macroActivites', processField: keyof Process) => {
    const savedOptions = options[field];
    const processValues = getUniqueValuesFromProcesses(processField);
    return Array.from(new Set([...processValues, ...savedOptions])).sort();
  };

  const filteredProcesses = useMemo(() => {
    return processes.filter(process => {
      const searchTerm = filters.searchTerm?.toLowerCase() || '';
      const matchesSearch = !searchTerm ||
        process.libelleProcessMetier.toLowerCase().includes(searchTerm) ||
        process.codeProcessus.toLowerCase().includes(searchTerm) ||
        process.descriptionProcessMetier.toLowerCase().includes(searchTerm);

      const matchesDirection = !filters.direction || process.direction === filters.direction;
      const matchesDomaine = !filters.domaine || process.domaine === filters.domaine;
      const matchesMacroActivite = !filters.macroActivite || process.macroActivite === filters.macroActivite;
      const matchesStatus = !filters.status || process.status === filters.status;

      return matchesSearch && matchesDirection && matchesDomaine && matchesMacroActivite && matchesStatus;
    });
  }, [processes, filters]);

  const activeCount = processes.filter(process => process.status === 'active').length;
  const reviewCount = processes.filter(process => process.status === 'review').length;
  const diagramCount = processes.filter(process => Boolean(process.diagramXML)).length;

  const viewOptions = [
    { id: 'list', label: 'Liste', icon: FileText },
    { id: 'tree', label: 'Arborescence', icon: Network },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'cards', label: 'Cartes', icon: LayoutGrid },
    { id: 'table', label: 'Tableau', icon: Table2 }
  ] as const;

  const toggleTreeNode = (key: string) => {
    setExpandedTreeNodes(previous => ({
      ...previous,
      [key]: !previous[key]
    }));
  };

  const handleCreateProcess = (processData: Omit<Process, 'id' | 'dateCreationProcessus' | 'dateDerniereModification'>) => {
    const newProcess: Process = {
      ...processData,
      id: Date.now().toString(),
      dateCreationProcessus: new Date().toISOString().split('T')[0],
      dateDerniereModification: new Date().toISOString().split('T')[0]
    };

    onUpdateProcesses([...processes, newProcess]);
    setShowForm(false);
  };

  const handleUpdateProcess = (updatedProcess: Process) => {
    const updated = {
      ...updatedProcess,
      dateDerniereModification: new Date().toISOString().split('T')[0]
    };

    onUpdateProcesses(processes.map(process => process.id === updated.id ? updated : process));
    setEditingProcess(null);
    setShowForm(false);
  };

  const handleDeleteProcess = (processId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce processus ?')) {
      onUpdateProcesses(processes.filter(process => process.id !== processId));
    }
  };

  const handleChangeProcessStatus = (processId: string, status: Process['status']) => {
    onUpdateProcesses(processes.map(process => (
      process.id === processId
        ? { ...process, status, dateDerniereModification: new Date().toISOString().split('T')[0] }
        : process
    )));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      direction: '',
      domaine: '',
      macroActivite: '',
      status: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-emerald-200 bg-emerald-100 text-emerald-800';
      case 'draft': return 'border-amber-200 bg-amber-100 text-amber-800';
      case 'review': return 'border-blue-200 bg-blue-100 text-blue-800';
      case 'archived': return 'border-slate-200 bg-slate-100 text-slate-700';
      default: return 'border-slate-200 bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'draft': return 'Brouillon';
      case 'review': return 'En révision';
      case 'archived': return 'Archivé';
      default: return status;
    }
  };

  if (showForm) {
    return (
      <ProcessForm
        process={editingProcess}
        onSave={editingProcess ? handleUpdateProcess : handleCreateProcess}
        onCancel={() => {
          setShowForm(false);
          setEditingProcess(null);
        }}
        onNavigateToHome={onNavigateToHome}
        onGoBack={onGoBack}
        canGoBack={canGoBack}
        previousPageTitle={previousPageTitle}
      />
    );
  }

  if (viewMode === 'details' && selectedProcess) {
    return (
      <ProcessDetails
        process={selectedProcess}
        onBack={() => {
          setViewMode('list');
          setSelectedProcess(null);
        }}
        onEdit={(process) => {
          setEditingProcess(process);
          setShowForm(true);
        }}
        onNavigateToHome={onNavigateToHome}
        onGoBack={onGoBack}
        canGoBack={canGoBack}
        previousPageTitle={previousPageTitle}
        onEditDiagram={onEditProcess}
        risks={risks.filter(risk => risk.processId === selectedProcess.id || risk.processCode === selectedProcess.codeProcessus)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Référentiel</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Processus métier</h1>
            <p className="mt-1 text-sm text-slate-500">
              {processes.length} processus suivis, filtres rapides et diagrammes associés.
            </p>
          </div>

          <button onClick={() => setShowForm(true)} className="app-button-primary">
            <Plus className="h-4 w-4" />
            Nouveau processus
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <SummaryCard label="Actifs" value={activeCount} />
          <SummaryCard label="En révision" value={reviewCount} />
          <SummaryCard label="Avec diagramme" value={diagramCount} />
        </div>

        <section className="app-surface mb-6 rounded-xl p-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, code ou description..."
                value={filters.searchTerm}
                onChange={(event) => setFilters({ ...filters, searchTerm: event.target.value })}
                className="app-input pl-9"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <select
                value={filters.direction}
                onChange={(event) => setFilters({ ...filters, direction: event.target.value })}
                className="app-input"
              >
                <option value="">Toutes les directions</option>
                {getFilterOptions('directions', 'direction').map(direction => (
                  <option key={direction} value={direction}>{direction}</option>
                ))}
              </select>

              <select
                value={filters.domaine}
                onChange={(event) => setFilters({ ...filters, domaine: event.target.value })}
                className="app-input"
              >
                <option value="">Tous les domaines</option>
                {getFilterOptions('domaines', 'domaine').map(domaine => (
                  <option key={domaine} value={domaine}>{domaine}</option>
                ))}
              </select>

              <select
                value={filters.macroActivite}
                onChange={(event) => setFilters({ ...filters, macroActivite: event.target.value })}
                className="app-input"
              >
                <option value="">Toutes les macro-activités</option>
                {getFilterOptions('macroActivites', 'macroActivite').map(activite => (
                  <option key={activite} value={activite}>{activite}</option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                className="app-input"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="draft">Brouillon</option>
                <option value="review">En révision</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {filteredProcesses.length} processus trouvé(s)
              {filteredProcesses.length !== processes.length && (
                <span className="ml-1 font-medium text-blue-700">sur {processes.length} total</span>
              )}
            </span>
            <button onClick={resetFilters} className="font-semibold text-slate-700 hover:text-slate-950">
              Réinitialiser les filtres
            </button>
          </div>
        </section>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {viewOptions.map(option => {
            const Icon = option.icon;
            const active = viewMode === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setViewMode(option.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-[#00030a]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        {viewMode === 'tree' && (
          <TreeView
            processes={filteredProcesses}
            expandedNodes={expandedTreeNodes}
            onToggleNode={toggleTreeNode}
            onOpenDetails={(process) => {
              setSelectedProcess(process);
              setViewMode('details');
            }}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanView
            processes={filteredProcesses}
            onChangeStatus={handleChangeProcessStatus}
            onOpenDetails={(process) => {
              setSelectedProcess(process);
              setViewMode('details');
            }}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        )}

        {viewMode === 'table' && (
          <TableView
            processes={filteredProcesses}
            onOpenDetails={(process) => {
              setSelectedProcess(process);
              setViewMode('details');
            }}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        )}

        {(viewMode === 'list' || viewMode === 'cards') && (
        <section className={`grid gap-4 ${viewMode === 'cards' ? 'xl:grid-cols-2' : ''}`}>
          {filteredProcesses.map((process) => (
            <article key={process.id} className="app-surface overflow-hidden rounded-xl transition hover:shadow-md">
              <div className="p-5">
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                        {process.codeProcessus}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(process.status)}`}>
                        {getStatusLabel(process.status)}
                      </span>
                      {process.diagramXML && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                          <GitBranch className="h-3.5 w-3.5" />
                          Diagramme BPMN
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 truncate text-lg font-semibold text-slate-950">
                      {process.libelleProcessMetier}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                      {process.descriptionProcessMetier}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:ml-4">
                    <IconButton
                      title="Voir les détails"
                      onClick={() => {
                        setSelectedProcess(process);
                        setViewMode('details');
                      }}
                      icon={Eye}
                    />
                    {onEditProcess && (
                      <IconButton
                        title={process.diagramXML ? 'Éditer le diagramme' : 'Créer le diagramme'}
                        onClick={() => onEditProcess(process)}
                        icon={GitBranch}
                      />
                    )}
                    <IconButton
                      title="Modifier"
                      onClick={() => {
                        setEditingProcess(process);
                        setShowForm(true);
                      }}
                      icon={Edit3}
                    />
                    <IconButton
                      title="Supprimer"
                      onClick={() => handleDeleteProcess(process.id)}
                      icon={Trash2}
                      danger
                    />
                  </div>
                </div>

                <div className="grid gap-3 border-t border-slate-100 pt-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                  <InfoItem icon={Building} label="Direction" value={process.direction} tone="blue" />
                  <InfoItem icon={Tag} label="Domaine" value={process.domaine} tone="purple" />
                  <InfoItem icon={User} label="Owner" value={process.ownerProcessMetier} tone="emerald" />
                  <InfoItem
                    icon={Calendar}
                    label="Dernière modification"
                    value={new Date(process.dateDerniereModification).toLocaleDateString('fr-FR')}
                    tone="orange"
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
        )}

        {filteredProcesses.length === 0 && (
          <div className="app-surface mt-6 rounded-xl py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950">Aucun processus trouvé</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {processes.length === 0
                ? "Aucun processus n'a encore été créé."
                : 'Aucun processus ne correspond aux filtres sélectionnés.'}
            </p>
            <button onClick={() => setShowForm(true)} className="app-button-primary mt-5">
              <Plus className="h-4 w-4" />
              Créer le premier processus
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value }) => (
  <div className="app-surface rounded-xl p-4">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
  </div>
);

interface IconButtonProps {
  title: string;
  onClick: () => void;
  icon: React.ElementType;
  danger?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({ title, onClick, icon: Icon, danger = false }) => (
  <button
    onClick={onClick}
    className={`rounded-lg border border-slate-200 p-2 text-slate-500 transition ${
      danger ? 'hover:bg-rose-50 hover:text-rose-700' : 'hover:bg-slate-50 hover:text-slate-900'
    }`}
    title={title}
  >
    <Icon className="h-5 w-5" />
  </button>
);

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: 'blue' | 'purple' | 'emerald' | 'orange';
}

const infoToneClasses: Record<InfoItemProps['tone'], string> = {
  blue: 'text-blue-500 bg-blue-50 border-blue-100',
  purple: 'text-purple-500 bg-purple-50 border-purple-100',
  emerald: 'text-emerald-500 bg-emerald-50 border-emerald-100',
  orange: 'text-orange-500 bg-orange-50 border-orange-100'
};

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-start gap-2">
    <span className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border ${infoToneClasses[tone]}`}>
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <span className="text-xs text-slate-500">{label}</span>
      <p className="truncate font-medium text-slate-900">{value}</p>
    </div>
  </div>
);

interface ProcessViewProps {
  processes: Process[];
  onOpenDetails: (process: Process) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

interface KanbanViewProps extends ProcessViewProps {
  onChangeStatus: (processId: string, status: Process['status']) => void;
}

interface TreeViewProps extends ProcessViewProps {
  expandedNodes: Record<string, boolean>;
  onToggleNode: (key: string) => void;
}

const TreeView: React.FC<TreeViewProps> = ({
  processes,
  expandedNodes,
  onToggleNode,
  onOpenDetails,
  getStatusColor,
  getStatusLabel
}) => {
  const grouped = processes.reduce((directions, process) => {
    const direction = process.direction || 'Direction non renseignee';
    const domaine = process.domaine || 'Domaine non renseigne';
    const macro = process.macroActivite || 'Macro-activite non renseignee';

    directions[direction] ??= {};
    directions[direction][domaine] ??= {};
    directions[direction][domaine][macro] ??= [];
    directions[direction][domaine][macro].push(process);

    return directions;
  }, {} as Record<string, Record<string, Record<string, Process[]>>>);

  const renderToggle = (nodeKey: string, label: string, count: number, level: number) => {
    const expanded = expandedNodes[nodeKey] ?? level < 2;
    const Chevron = expanded ? ChevronDown : ChevronRight;

    return (
      <button
        type="button"
        onClick={() => onToggleNode(nodeKey)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-white"
      >
        <Chevron className="h-4 w-4 text-slate-400 dark:group-hover:text-[#00030a]" />
        <span className="min-w-0 flex-1 truncate font-semibold text-slate-900 dark:text-slate-100">{label}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-[#060d19] dark:text-slate-300">
          {count}
        </span>
      </button>
    );
  };

  return (
    <section className="app-surface rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-slate-100">Vue arborescente</h3>
          <p className="text-sm text-slate-500">Entreprise vers directions, domaines, macro-activites et processus.</p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {processes.length} processus
        </span>
      </div>

      <div className="space-y-1">
        {Object.entries(grouped).map(([direction, domaines]) => {
          const directionKey = `direction-${direction}`;
          const directionCount = Object.values(domaines).flatMap(macros => Object.values(macros).flat()).length;
          const directionOpen = expandedNodes[directionKey] ?? true;

          return (
            <div key={direction} className="rounded-xl border border-slate-100 p-2 dark:border-[#0b1424]">
              {renderToggle(directionKey, direction, directionCount, 0)}
              {directionOpen && (
                <div className="ml-5 mt-1 space-y-1 border-l border-slate-100 pl-3 dark:border-[#0b1424]">
                  {Object.entries(domaines).map(([domaine, macros]) => {
                    const domaineKey = `${directionKey}-domaine-${domaine}`;
                    const domaineCount = Object.values(macros).flat().length;
                    const domaineOpen = expandedNodes[domaineKey] ?? true;

                    return (
                      <div key={domaine}>
                        {renderToggle(domaineKey, domaine, domaineCount, 1)}
                        {domaineOpen && (
                          <div className="ml-5 mt-1 space-y-1 border-l border-slate-100 pl-3 dark:border-[#0b1424]">
                            {Object.entries(macros).map(([macro, macroProcesses]) => {
                              const macroKey = `${domaineKey}-macro-${macro}`;
                              const macroOpen = expandedNodes[macroKey] ?? false;

                              return (
                                <div key={macro}>
                                  {renderToggle(macroKey, macro, macroProcesses.length, 2)}
                                  {macroOpen && (
                                    <div className="ml-5 mt-1 grid gap-2 border-l border-slate-100 pl-3 dark:border-[#0b1424]">
                                      {macroProcesses.map(process => (
                                        <ProcessMiniCard
                                          key={process.id}
                                          process={process}
                                          onOpenDetails={onOpenDetails}
                                          getStatusColor={getStatusColor}
                                          getStatusLabel={getStatusLabel}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const KanbanView: React.FC<KanbanViewProps> = ({ processes, onOpenDetails, onChangeStatus, getStatusColor, getStatusLabel }) => {
  const columns = [
    { id: 'draft' as const, label: 'Brouillon', tone: 'border-amber-200 bg-amber-50 text-amber-800' },
    { id: 'review' as const, label: 'En revision', tone: 'border-blue-200 bg-blue-50 text-blue-800' },
    { id: 'active' as const, label: 'Actif', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
    { id: 'archived' as const, label: 'Archive', tone: 'border-slate-200 bg-slate-100 text-slate-700' }
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-4">
      {columns.map(column => {
        const columnProcesses = processes.filter(process => process.status === column.id);

        return (
          <div
            key={column.id}
            className="app-surface rounded-xl p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const processId = event.dataTransfer.getData('text/process-id');
              if (processId) onChangeStatus(processId, column.id);
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${column.tone}`}>
                {column.label}
              </span>
              <span className="text-sm font-bold text-slate-500">{columnProcesses.length}</span>
            </div>
            <p className="mb-3 text-xs text-slate-500">Glissez une carte ici pour changer son statut.</p>
            <div className="grid gap-3">
              {columnProcesses.map(process => (
                <div
                  key={process.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/process-id', process.id);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <ProcessMiniCard
                    process={process}
                    onOpenDetails={onOpenDetails}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                  />
                </div>
              ))}
              {columnProcesses.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-[#15243a]">
                  Aucun processus
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};

const TableView: React.FC<ProcessViewProps> = ({ processes, onOpenDetails, getStatusColor, getStatusLabel }) => (
  <section className="app-surface overflow-hidden rounded-xl">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-[#0b1424]">
        <thead className="bg-slate-50 dark:bg-[#060d19]">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Processus</th>
            <th className="px-4 py-3">Direction</th>
            <th className="px-4 py-3">Domaine</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Diagramme</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#0b1424]">
          {processes.map(process => (
            <tr key={process.id} className="transition hover:bg-slate-50 dark:hover:bg-white">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-slate-500">{process.codeProcessus}</td>
              <td className="max-w-xs px-4 py-3">
                <p className="truncate font-semibold text-slate-950 dark:text-slate-100">{process.libelleProcessMetier}</p>
                <p className="truncate text-xs text-slate-500">{process.macroActivite}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">{process.direction}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">{process.domaine}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">{process.ownerProcessMetier}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusColor(process.status)}`}>
                  {getStatusLabel(process.status)}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                {process.diagramXML ? (
                  <span className="rounded-full border border-indigo-200 bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-800">Oui</span>
                ) : (
                  <span className="rounded-full border border-orange-200 bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Manquant</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <button type="button" onClick={() => onOpenDetails(process)} className="font-semibold text-blue-700 hover:text-blue-900">
                  Ouvrir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const ProcessMiniCard: React.FC<ProcessViewProps & { process: Process }> = ({
  process,
  onOpenDetails,
  getStatusColor,
  getStatusLabel
}) => (
  <button
    type="button"
    onClick={() => onOpenDetails(process)}
    className="rounded-xl border border-slate-100 bg-white p-3 text-left transition hover:border-slate-300 hover:shadow-sm dark:border-[#0b1424] dark:bg-[#030812] dark:hover:bg-white"
  >
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">{process.codeProcessus}</span>
      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusColor(process.status)}`}>
        {getStatusLabel(process.status)}
      </span>
    </div>
    <p className="line-clamp-2 font-semibold text-slate-950 dark:text-slate-100">{process.libelleProcessMetier}</p>
    <p className="mt-1 truncate text-xs text-slate-500">{process.direction} • {process.domaine}</p>
  </button>
);

export default ProcessRepository;
