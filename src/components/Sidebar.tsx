import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  GitBranch,
  HelpCircle,
  Home,
  List,
  Settings,
  Shield,
  TrendingUp,
  User
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigateToHome: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToProcessList: () => void;
  onNavigateToProcessMap: () => void;
  onNavigateToEditor: () => void;
  onNavigateToRiskManagement: () => void;
  onNavigateToRiskDashboard: () => void;
  onNavigateToProjections: () => void;
  onNavigateToSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  description: string;
  hasSubmenu?: boolean;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  submenu?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigateToHome,
  onNavigateToDashboard,
  onNavigateToProcessList,
  onNavigateToProcessMap,
  onNavigateToEditor,
  onNavigateToRiskManagement,
  onNavigateToRiskDashboard,
  onNavigateToProjections,
  onNavigateToSettings,
  isCollapsed,
  onToggleCollapse
}) => {
  const [repositoryExpanded, setRepositoryExpanded] = useState(true);
  const [controlTowerExpanded, setControlTowerExpanded] = useState(true);

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      onClick: onNavigateToHome,
      description: 'Vue principale'
    },
    {
      id: 'repository',
      label: 'Référentiel',
      icon: FileText,
      onClick: () => {
        if (isCollapsed) {
          onToggleCollapse(false);
          setRepositoryExpanded(true);
          onNavigateToProcessList();
          return;
        }
        setRepositoryExpanded(!repositoryExpanded);
      },
      description: 'Processus et patrimoine',
      hasSubmenu: true,
      expanded: repositoryExpanded,
      onToggleExpanded: () => setRepositoryExpanded(!repositoryExpanded),
      submenu: [
        {
          id: 'process-list',
          label: 'Liste processus',
          icon: List,
          onClick: onNavigateToProcessList,
          description: 'Gestion des processus'
        },
        {
          id: 'dashboard',
          label: 'Tableau de bord',
          icon: BarChart3,
          onClick: onNavigateToDashboard,
          description: 'Indicateurs processus'
        },
        {
          id: 'process-map',
          label: 'Cartographie',
          icon: GitBranch,
          onClick: onNavigateToProcessMap,
          description: 'Vue interactive'
        }
      ]
    },
    {
      id: 'control-tower',
      label: 'Tour de contrôle',
      icon: Shield,
      onClick: () => {
        if (isCollapsed) {
          onToggleCollapse(false);
          setControlTowerExpanded(true);
          onNavigateToRiskManagement();
          return;
        }
        setControlTowerExpanded(!controlTowerExpanded);
      },
      description: 'Risques et contrôles',
      hasSubmenu: true,
      expanded: controlTowerExpanded,
      onToggleExpanded: () => setControlTowerExpanded(!controlTowerExpanded),
      submenu: [
        {
          id: 'risk-management',
          label: 'Gestion risques',
          icon: Shield,
          onClick: onNavigateToRiskManagement,
          description: 'Registre des risques'
        },
        {
          id: 'risk-dashboard',
          label: 'Dashboard risques',
          icon: TrendingUp,
          onClick: onNavigateToRiskDashboard,
          description: 'Analyse des risques'
        }
      ]
    },
    {
      id: 'projections',
      label: 'Projections',
      icon: Activity,
      onClick: onNavigateToProjections,
      description: 'Charge et capacité'
    },
    {
      id: 'editor',
      label: 'Éditeur BPMN',
      icon: GitBranch,
      onClick: onNavigateToEditor,
      description: 'Diagrammes'
    }
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      onClick: onNavigateToSettings,
      description: 'Configuration'
    },
    {
      id: 'help',
      label: 'Aide',
      icon: HelpCircle,
      onClick: () => console.log('Aide'),
      description: 'Documentation'
    }
  ];

  const isActive = (itemId: string) => currentPage === itemId;
  const isSubmenuActive = (submenu?: MenuItem[]) => Boolean(submenu?.some(item => isActive(item.id)));
  const isParentActive = (item: MenuItem) => item.id !== 'repository' && item.id !== 'control-tower' && isActive(item.id);

  React.useEffect(() => {
    if (currentPage === 'dashboard' || currentPage === 'process-list') {
      setRepositoryExpanded(true);
    }
  }, [currentPage]);

  React.useEffect(() => {
    if (currentPage === 'risk-management' || currentPage === 'risk-dashboard') {
      setControlTowerExpanded(true);
    }
  }, [currentPage]);

  const renderTooltip = (label: string) => (
    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
      {label}
    </div>
  );

  return (
    <>
      <aside className={`
        fixed left-0 top-0 z-40 flex h-full flex-col border-r border-slate-200 bg-white/95 shadow-sm backdrop-blur
        dark:border-[#0b1424] dark:bg-[#00040c] dark:text-slate-100
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="h-4 flex-shrink-0" />

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isParentActive(item);
            const childActive = isSubmenuActive(item.submenu);
            const parentHighlighted = childActive && !active;

            return (
              <div key={item.id}>
                <button
                  onClick={item.onClick}
                  className={`
                    group relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                    ${active
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-[#00030a] dark:shadow-none'
                      : parentHighlighted
                        ? 'bg-slate-100 text-slate-900 dark:bg-[#060d19] dark:text-slate-100 dark:hover:bg-white dark:hover:text-[#00030a]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white dark:hover:text-[#00030a]'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white dark:text-[#00030a]' : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-[#00030a]'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 min-w-0 flex-1 truncate text-left">{item.label}</span>
                      {item.hasSubmenu && (
                        item.expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </>
                  )}
                  {isCollapsed && renderTooltip(item.label)}
                </button>

                {item.submenu && !isCollapsed && item.expanded && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-2 dark:border-[#0b1424]">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const subActive = isActive(subItem.id);

                      return (
                        <button
                          key={subItem.id}
                          onClick={subItem.onClick}
                          className={`
                            flex w-full items-center rounded-md px-2.5 py-2 text-sm transition-colors
                            ${subActive
                              ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-white dark:text-[#00030a]'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-white dark:hover:text-[#00030a]'
                            }
                          `}
                        >
                          <SubIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-2 dark:border-[#0b1424]">
          <div className={`mb-2 flex items-center rounded-lg bg-slate-50 p-2 dark:bg-[#040a14] ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 dark:bg-white">
              <User className="h-4 w-4 text-white dark:text-[#00030a]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">Utilisateur</p>
                <p className="truncate text-xs text-slate-500">Équipe Processus</p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`group relative flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-white dark:hover:text-[#00030a] ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
                  {isCollapsed && renderTooltip(item.label)}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => onToggleCollapse(!isCollapsed)}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-900 dark:border-[#0b1424] dark:bg-[#040a14] dark:text-slate-400 dark:shadow-none dark:hover:bg-white dark:hover:text-[#00030a]"
          title={isCollapsed ? 'Déplier le menu' : 'Réduire le menu'}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {!isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/20 dark:bg-black/50 lg:hidden"
          onClick={() => onToggleCollapse(true)}
        />
      )}
    </>
  );
};

export default Sidebar;
