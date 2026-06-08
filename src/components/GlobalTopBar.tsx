import React, { useMemo, useState } from 'react';
import {
  Bell,
  Clock,
  FileText,
  GitBranch,
  Grid3X3,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  User,
  X
} from 'lucide-react';
import { Process } from '../types/Process';
import { Risk } from '../types/Risk';
import { ProcessProjection } from '../types/Projection';

interface GlobalTopBarProps {
  processes: Process[];
  risks: Risk[];
  projections: ProcessProjection[];
  currentPage: string;
  onNavigateToDashboard: () => void;
  onNavigateToProcessList: () => void;
  onNavigateToProcessMap: () => void;
  onNavigateToEditor: () => void;
  onNavigateToRiskManagement: () => void;
  onNavigateToRiskDashboard: () => void;
  onNavigateToProjections: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToSettings: () => void;
}

interface SearchResult {
  id: string;
  type: 'Processus' | 'Diagramme' | 'Risque' | 'Document' | 'Utilisateur' | 'Projection' | 'Action';
  title: string;
  description: string;
  icon: React.ElementType;
  tone: string;
  onClick?: () => void;
}

const pageLabels: Record<string, string> = {
  dashboard: 'Tableau de bord',
  editor: 'Editeur BPMN',
  'process-list': 'Liste processus',
  'process-map': 'Cartographie',
  'risk-management': 'Gestion risques',
  'risk-dashboard': 'Dashboard risques',
  projections: 'Projections',
  settings: 'Parametres',
  notifications: 'Notifications'
};

const GlobalTopBar: React.FC<GlobalTopBarProps> = ({
  processes,
  risks,
  projections,
  currentPage,
  onNavigateToDashboard,
  onNavigateToProcessList,
  onNavigateToProcessMap,
  onNavigateToEditor,
  onNavigateToRiskManagement,
  onNavigateToRiskDashboard,
  onNavigateToProjections,
  onNavigateToNotifications,
  onNavigateToSettings
}) => {
  const [query, setQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const missingDiagramCount = processes.filter(process => !process.diagramXML).length;
  const reviewCount = processes.filter(process => process.status === 'review').length;
  const lateRisks = risks.filter(risk => new Date(risk.deadline) < new Date() && risk.actionPlanStatus !== 'realise').length;

  const notifications = [
    {
      title: `${missingDiagramCount} processus sans diagramme`,
      description: 'Cartographie BPMN a completer',
      tone: 'text-orange-600 bg-orange-50 border-orange-100'
    },
    {
      title: `${reviewCount} processus en revision`,
      description: 'Validation metier attendue',
      tone: 'text-blue-600 bg-blue-50 border-blue-100'
    },
    {
      title: `${lateRisks} risques en retard`,
      description: 'Plans d’action a suivre',
      tone: 'text-red-600 bg-red-50 border-red-100'
    }
  ];

  const quickModules = [
    { label: 'Processus', icon: FileText, onClick: onNavigateToProcessList, tone: 'text-blue-600 bg-blue-50' },
    { label: 'Cartographie', icon: GitBranch, onClick: onNavigateToProcessMap, tone: 'text-cyan-600 bg-cyan-50' },
    { label: 'Dashboard', icon: LayoutDashboard, onClick: onNavigateToDashboard, tone: 'text-indigo-600 bg-indigo-50' },
    { label: 'BPMN', icon: GitBranch, onClick: onNavigateToEditor, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Risques', icon: Shield, onClick: onNavigateToRiskManagement, tone: 'text-red-600 bg-red-50' },
    { label: 'KPI risques', icon: LayoutDashboard, onClick: onNavigateToRiskDashboard, tone: 'text-purple-600 bg-purple-50' },
    { label: 'Projections', icon: Clock, onClick: onNavigateToProjections, tone: 'text-orange-600 bg-orange-50' }
  ];

  const users = useMemo(() => {
    const names = processes.flatMap(process => [process.ownerProcessMetier, process.responsableService]).filter(Boolean);
    return Array.from(new Set(names)).map(name => ({
      id: name,
      name,
      role: processes.some(process => process.ownerProcessMetier === name) ? 'Owner processus' : 'Responsable service'
    }));
  }, [processes]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const processResults = processes
      .filter(process =>
        process.libelleProcessMetier.toLowerCase().includes(normalizedQuery) ||
        process.codeProcessus.toLowerCase().includes(normalizedQuery) ||
        process.direction.toLowerCase().includes(normalizedQuery) ||
        process.domaine.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5)
      .map(process => ({
        id: `process-${process.id}`,
        type: 'Processus' as const,
        title: process.libelleProcessMetier,
        description: `${process.codeProcessus} • ${process.direction}`,
        icon: FileText,
        tone: 'text-blue-600 bg-blue-50',
        onClick: onNavigateToProcessList
      }));

    const diagramResults = processes
      .filter(process =>
        Boolean(process.diagramXML) &&
        (
          process.libelleProcessMetier.toLowerCase().includes(normalizedQuery) ||
          process.codeProcessus.toLowerCase().includes(normalizedQuery) ||
          'diagramme bpmn cartographie flux'.includes(normalizedQuery)
        )
      )
      .slice(0, 4)
      .map(process => ({
        id: `diagram-${process.id}`,
        type: 'Diagramme' as const,
        title: `Diagramme ${process.codeProcessus}`,
        description: process.libelleProcessMetier,
        icon: GitBranch,
        tone: 'text-purple-600 bg-purple-50',
        onClick: onNavigateToEditor
      }));

    const riskResults = risks
      .filter(risk =>
        risk.processName.toLowerCase().includes(normalizedQuery) ||
        risk.riskDescription.toLowerCase().includes(normalizedQuery) ||
        risk.category.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5)
      .map(risk => ({
        id: `risk-${risk.id}`,
        type: 'Risque' as const,
        title: risk.processName,
        description: risk.riskDescription,
        icon: Shield,
        tone: 'text-red-600 bg-red-50',
        onClick: onNavigateToRiskManagement
      }));

    const projectionResults = projections
      .filter(projection =>
        projection.processName.toLowerCase().includes(normalizedQuery) ||
        projection.scenario.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 3)
      .map(projection => ({
        id: `projection-${projection.id}`,
        type: 'Projection' as const,
        title: projection.processName,
        description: projection.scenario,
        icon: Clock,
        tone: 'text-orange-600 bg-orange-50',
        onClick: onNavigateToProjections
      }));

    const documentResults = processes
      .filter(process =>
        process.libelleProcessMetier.toLowerCase().includes(normalizedQuery) ||
        process.codeProcessus.toLowerCase().includes(normalizedQuery) ||
        ['procedure', 'document', 'guide', 'politique', 'controle'].some(keyword => keyword.includes(normalizedQuery))
      )
      .slice(0, 4)
      .map(process => ({
        id: `document-${process.id}`,
        type: 'Document' as const,
        title: `Dossier documentaire ${process.codeProcessus}`,
        description: `Procedures, guides et controles - ${process.libelleProcessMetier}`,
        icon: FileText,
        tone: 'text-cyan-600 bg-cyan-50',
        onClick: onNavigateToProcessList
      }));

    const userResults = users
      .filter(user =>
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.role.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 4)
      .map(user => ({
        id: `user-${user.id}`,
        type: 'Utilisateur' as const,
        title: user.name,
        description: user.role,
        icon: User,
        tone: 'text-slate-700 bg-slate-100',
        onClick: onNavigateToSettings
      }));

    const actionResults = quickModules
      .filter(module => module.label.toLowerCase().includes(normalizedQuery))
      .map(module => ({
        id: `action-${module.label}`,
        type: 'Action' as const,
        title: `Ouvrir ${module.label}`,
        description: 'Acces rapide au module',
        icon: module.icon,
        tone: module.tone,
        onClick: module.onClick
      }));

    return [...processResults, ...diagramResults, ...riskResults, ...documentResults, ...userResults, ...projectionResults, ...actionResults].slice(0, 10);
  }, [query, processes, risks, projections, users]);

  const closeMenus = () => {
    setNotificationsOpen(false);
    setModulesOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-[#0b1424] dark:bg-[#00040c]/92">
      <div className="flex items-center gap-3">
        <div className="hidden min-w-0 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">Gouvernance processus</p>
          <p className="text-[11px] font-medium text-slate-400">Accueil / {pageLabels[currentPage] || 'Plateforme'}</p>
          <h2 className="truncate text-sm font-bold text-slate-950 dark:text-slate-100">
            {pageLabels[currentPage] || 'Plateforme'}
          </h2>
        </div>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher processus, diagrammes, risques, documents, utilisateurs..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#29415f] dark:focus:bg-[#060d19] dark:focus:ring-[#0b1424]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white dark:hover:text-[#00030a]"
              aria-label="Effacer la recherche"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#15243a] dark:bg-[#030812]">
              <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-[#0b1424]">
                Resultats
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {searchResults.map(result => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => {
                        result.onClick?.();
                        setQuery('');
                      }}
                      className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-white"
                    >
                      <span className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${result.tone}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{result.type}</span>
                        <span className="block truncate text-sm font-semibold text-slate-950 dark:text-slate-100">{result.title}</span>
                        <span className="block truncate text-xs text-slate-500">{result.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {query && searchResults.length === 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-xl dark:border-[#15243a] dark:bg-[#030812]">
              Aucun resultat. Essayez un code processus, un owner, un risque ou un document.
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              closeMenus();
              setModulesOpen(!modulesOpen);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]"
            title="Modules"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          {modulesOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-[#15243a] dark:bg-[#030812]">
              <div className="grid grid-cols-2 gap-2">
                {quickModules.map(module => {
                  const Icon = module.icon;
                  return (
                    <button
                      key={module.label}
                      type="button"
                      onClick={() => {
                        module.onClick();
                        setModulesOpen(false);
                      }}
                      className="rounded-lg p-3 text-left transition hover:bg-slate-50 dark:hover:bg-white"
                    >
                      <span className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${module.tone}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="block text-sm font-semibold text-slate-950 dark:text-slate-100">{module.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              closeMenus();
              setNotificationsOpen(!notificationsOpen);
            }}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#030812]" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#15243a] dark:bg-[#030812]">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-[#0b1424]">
                <span className="text-sm font-bold text-slate-950 dark:text-slate-100">Notifications</span>
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">{notifications.length}</span>
              </div>
              <div className="space-y-2 p-2">
                {notifications.map(notification => (
                  <div key={notification.title} className="rounded-lg border border-slate-100 p-3 dark:border-[#0b1424]">
                    <span className={`mb-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${notification.tone}`}>
                      Non lu
                    </span>
                    <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{notification.title}</p>
                    <p className="text-xs text-slate-500">{notification.description}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 p-2 dark:border-[#0b1424]">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToNotifications();
                    setNotificationsOpen(false);
                  }}
                  className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]"
                >
                  Ouvrir le centre de notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              closeMenus();
              setProfileOpen(!profileOpen);
            }}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-left transition hover:bg-slate-50 dark:border-[#15243a] dark:bg-[#030812] dark:hover:bg-white"
            title="Profil"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-[#00030a]">
              <User className="h-4 w-4" />
            </span>
            <span className="hidden pr-1 md:block">
              <span className="block text-xs font-semibold text-slate-950 dark:text-slate-100">Utilisateur</span>
              <span className="block text-[11px] text-slate-500">Admin processus</span>
            </span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-[#15243a] dark:bg-[#030812]">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-[#060d19]">
                <p className="text-sm font-bold text-slate-950 dark:text-slate-100">Utilisateur</p>
                <p className="text-xs text-slate-500">Equipe Processus</p>
              </div>
              <button
                onClick={() => {
                  onNavigateToSettings();
                  setProfileOpen(false);
                }}
                className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]"
              >
                <Settings className="h-4 w-4" />
                Parametres utilisateur
              </button>
              <div className="mt-2 border-t border-slate-100 pt-2 dark:border-[#0b1424]">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Historique recent</p>
                <div className="space-y-1 px-3 pb-2 text-xs text-slate-500">
                  <p>Liste processus consultee</p>
                  <p>Dashboard risques ouvert</p>
                  <p>Diagramme BPMN modifie</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default GlobalTopBar;
