import React, { useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  FileText, 
  GitBranch, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  Target,
  Activity
} from 'lucide-react';
import { Process } from '../types/Process';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';

interface DashboardProps {
  processes: Process[];
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
  onNavigateToRepository: () => void; // MODIFIÉ: Maintenant va vers la liste des processus
  onNavigateToEditor: () => void;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description?: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  processes,
  onNavigateToHome,
  onGoBack,
  canGoBack = false,
  previousPageTitle,
  onNavigateToRepository, // MODIFIÉ: Maintenant va vers la liste des processus
  onNavigateToEditor
}) => {
  useScrollToTopImmediate();

  // Calculs des statistiques
  const stats = useMemo(() => {
    const total = processes.length;
    const withDiagram = processes.filter(p => p.diagramXML).length;
    const withoutDiagram = total - withDiagram;
    
    const byStatus = {
      active: processes.filter(p => p.status === 'active').length,
      draft: processes.filter(p => p.status === 'draft').length,
      review: processes.filter(p => p.status === 'review').length,
      archived: processes.filter(p => p.status === 'archived').length
    };

    const byDirection = processes.reduce((acc, process) => {
      acc[process.direction] = (acc[process.direction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDomaine = processes.reduce((acc, process) => {
      acc[process.domaine] = (acc[process.domaine] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byOwner = processes.reduce((acc, process) => {
      acc[process.ownerProcessMetier] = (acc[process.ownerProcessMetier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Processus récemment modifiés (derniers 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyModified = processes.filter(p => 
      new Date(p.dateDerniereModification) >= thirtyDaysAgo
    ).length;

    const monthlyEvolution = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      const month = date.toLocaleDateString('fr-FR', { month: 'short' });
      const year = date.getFullYear();
      const created = processes.filter(process => {
        const createdAt = new Date(process.dateCreationProcessus);
        return createdAt.getMonth() === date.getMonth() && createdAt.getFullYear() === year;
      }).length;
      const modified = processes.filter(process => {
        const modifiedAt = new Date(process.dateDerniereModification);
        return modifiedAt.getMonth() === date.getMonth() && modifiedAt.getFullYear() === year;
      }).length;

      return { month, created, modified };
    });

    const recentCreations = [...processes]
      .sort((a, b) => new Date(b.dateCreationProcessus).getTime() - new Date(a.dateCreationProcessus).getTime())
      .slice(0, 5);

    const recentUpdates = [...processes]
      .sort((a, b) => new Date(b.dateDerniereModification).getTime() - new Date(a.dateDerniereModification).getTime())
      .slice(0, 5);

    return {
      total,
      withDiagram,
      withoutDiagram,
      byStatus,
      byDirection,
      byDomaine,
      byOwner,
      recentlyModified,
      monthlyEvolution,
      recentCreations,
      recentUpdates,
      diagramCoverage: total > 0 ? Math.round((withDiagram / total) * 100) : 0
    };
  }, [processes]);

  // Cartes de statistiques principales
  const statCards: StatCard[] = [
    {
      title: 'Total Processus',
      value: stats.total,
      icon: <FileText className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Nombre total de processus'
    },
    {
      title: 'Avec Diagramme',
      value: stats.withDiagram,
      icon: <GitBranch className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `${stats.diagramCoverage}% de couverture`
    },
    {
      title: 'Sans Diagramme',
      value: stats.withoutDiagram,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Nécessitent une cartographie'
    },
    {
      title: 'Processus Actifs',
      value: stats.byStatus.active,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'En production'
    },
    {
      title: 'En Révision',
      value: stats.byStatus.review,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'En cours de validation'
    },
    {
      title: 'Brouillons',
      value: stats.byStatus.draft,
      icon: <FileText className="w-6 h-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'En cours de rédaction'
    },
    {
      title: 'Archivés',
      value: stats.byStatus.archived,
      icon: <Archive className="w-6 h-6" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      description: 'Non utilisés'
    },
    {
      title: 'Modifiés (30j)',
      value: stats.recentlyModified,
      icon: <Activity className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Activité récente'
    }
  ];

  // Données pour les graphiques
  const directionData: ChartData[] = Object.entries(stats.byDirection)
    .map(([label, value], index) => ({
      label: label.replace('Direction ', ''),
      value,
      color: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
      ][index % 8]
    }))
    .sort((a, b) => b.value - a.value);

  const domaineData: ChartData[] = Object.entries(stats.byDomaine)
    .map(([label, value], index) => ({
      label,
      value,
      color: [
        '#10B981', '#3B82F6', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
      ][index % 8]
    }))
    .sort((a, b) => b.value - a.value);

  const statusData: ChartData[] = [
    { label: 'Actifs', value: stats.byStatus.active, color: '#10B981' },
    { label: 'Brouillons', value: stats.byStatus.draft, color: '#F59E0B' },
    { label: 'En révision', value: stats.byStatus.review, color: '#3B82F6' },
    { label: 'Archivés', value: stats.byStatus.archived, color: '#6B7280' }
  ].filter(item => item.value > 0);

  const topOwners = Object.entries(stats.byOwner)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Composant de graphique en barres simple
  const BarChart: React.FC<{ data: ChartData[]; title: string }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="app-surface rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          {title}
        </h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-24 text-sm text-gray-600 truncate" title={item.label}>
                {item.label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                <div
                  className="h-3 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
              <div className="w-8 text-sm font-medium text-gray-900">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Composant de graphique en secteurs simple
  const PieChartComponent: React.FC<{ data: ChartData[]; title: string }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="app-surface rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-blue-600" />
          {title}
        </h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
                <span className="text-xs text-gray-500">
                  ({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MonthlyEvolutionChart = () => {
    const maxValue = Math.max(1, ...stats.monthlyEvolution.map(item => Math.max(item.created, item.modified)));

    return (
      <div className="app-surface rounded-xl p-6">
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
          Evolution mensuelle
        </h3>
        <div className="flex h-56 items-end gap-4 border-b border-slate-100 pb-4 dark:border-[#0b1424]">
          {stats.monthlyEvolution.map(item => (
            <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-40 items-end gap-1">
                <div
                  className="w-5 rounded-t-md bg-blue-500 transition-all"
                  style={{ height: `${Math.max(8, (item.created / maxValue) * 150)}px` }}
                  title={`${item.created} cree(s)`}
                />
                <div
                  className="w-5 rounded-t-md bg-emerald-500 transition-all"
                  style={{ height: `${Math.max(8, (item.modified / maxValue) * 150)}px` }}
                  title={`${item.modified} modifie(s)`}
                />
              </div>
              <span className="text-xs font-semibold text-gray-500">{item.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-gray-500">
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-blue-500" />Crees</span>
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-emerald-500" />Modifies</span>
        </div>
      </div>
    );
  };

  const RecentProcessList: React.FC<{ title: string; processes: Process[]; dateField: 'dateCreationProcessus' | 'dateDerniereModification' }> = ({
    title,
    processes,
    dateField
  }) => (
    <div>
      <h4 className="mb-3 text-sm font-bold text-gray-900">{title}</h4>
      <div className="space-y-2">
        {processes.map(process => (
          <button
            key={`${title}-${process.id}`}
            type="button"
            onClick={onNavigateToRepository}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 text-left transition hover:bg-slate-50 dark:border-[#0b1424] dark:hover:bg-white"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-gray-900">{process.libelleProcessMetier}</span>
              <span className="block truncate text-xs text-gray-500">{process.codeProcessus} • {process.direction}</span>
            </span>
            <span className="whitespace-nowrap text-xs font-semibold text-gray-500">
              {new Date(process[dateField]).toLocaleDateString('fr-FR')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête simplifié - sans redondance avec la sidebar */}
      <header className="border-b border-slate-200 bg-white text-slate-950 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold">Tableau de Bord</h1>
              <p className="text-slate-500 text-sm">Vue d'ensemble des processus</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateToRepository}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">Liste processus</span> {/* MODIFIÉ */}
            </button>
            
            <button
              onClick={onNavigateToEditor}
              className="app-button-primary"
            >
              <GitBranch className="w-4 h-4" />
              <span className="text-sm font-medium">Éditeur BPMN</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="app-surface rounded-xl p-6 transition hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <div className={card.color}>
                    {card.icon}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">{card.title}</h3>
              {card.description && (
                <p className="text-xs text-gray-500">{card.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Indicateurs de performance */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="app-surface rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Couverture Diagrammes
              </h3>
              <span className="text-2xl font-bold text-green-600">{stats.diagramCoverage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.diagramCoverage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {stats.withDiagram} processus sur {stats.total} ont un diagramme BPMN
            </p>
          </div>

          <div className="app-surface rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Activité Récente
              </h3>
              <span className="text-2xl font-bold text-blue-600">{stats.recentlyModified}</span>
            </div>
            <p className="text-sm text-gray-600">
              Processus modifiés dans les 30 derniers jours
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">
                {Math.round((stats.recentlyModified / stats.total) * 100)}% du total
              </span>
            </div>
          </div>

          <div className="app-surface rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                Processus Actifs
              </h3>
              <span className="text-2xl font-bold text-emerald-600">{stats.byStatus.active}</span>
            </div>
            <p className="text-sm text-gray-600">
              Processus en production
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-gray-500">
                {Math.round((stats.byStatus.active / stats.total) * 100)}% du total
              </span>
            </div>
          </div>
        </div>

        {/* Graphiques de répartition */}
        <div className="grid gap-6 mb-8 lg:grid-cols-[1.2fr_0.8fr]">
          <MonthlyEvolutionChart />

          <div className="app-surface rounded-xl p-6">
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Activity className="mr-2 h-5 w-5 text-purple-600" />
              Activite processus
            </h3>
            <div className="space-y-4">
              <RecentProcessList title="Derniers processus crees" processes={stats.recentCreations} dateField="dateCreationProcessus" />
              <RecentProcessList title="Dernieres modifications" processes={stats.recentUpdates} dateField="dateDerniereModification" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <BarChart data={directionData} title="Processus par Direction" />
          <BarChart data={domaineData} title="Processus par Domaine" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <PieChartComponent data={statusData} title="Répartition par Statut" />
          
          {/* Top Owners */}
          <div className="app-surface rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Top Owners de Processus
            </h3>
            <div className="space-y-3">
              {topOwners.map((owner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{owner.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">{owner.count}</span>
                    <span className="text-xs text-gray-500">processus</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="app-surface rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={onNavigateToRepository}
              className="quick-action-card flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Gérer les Processus</div>
                <div className="text-sm text-gray-600">Voir la liste des processus</div> {/* MODIFIÉ */}
              </div>
            </button>

            <button
              onClick={onNavigateToEditor}
              className="quick-action-card flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-green-100 group-hover:bg-green-200 rounded-lg">
                <GitBranch className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Créer un Diagramme</div>
                <div className="text-sm text-gray-600">Éditeur BPMN</div>
              </div>
            </button>

            <div className="quick-action-card flex items-center space-x-3 p-4 bg-orange-50 rounded-xl">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Processus à Cartographier</div>
                <div className="text-sm text-gray-600">{stats.withoutDiagram} processus sans diagramme</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
