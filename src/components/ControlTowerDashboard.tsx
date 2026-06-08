import React, { useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Activity,
  Calendar,
  Users,
  FileText,
  ArrowUp,
  ArrowDown,
  Minus,
  Trophy,
  Medal,
  Award
} from 'lucide-react';
import { Risk } from '../types/Risk';
import { Process } from '../types/Process';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';

interface ControlTowerDashboardProps {
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
  processes: Process[];
  risks: Risk[];
  onNavigateToControlTower: () => void; // MODIFIÉ: Maintenant va vers la gestion des risques
}

interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface TrendData {
  period: string;
  value: number;
  change?: number;
}

const ControlTowerDashboard: React.FC<ControlTowerDashboardProps> = ({
  onNavigateToHome,
  onGoBack,
  canGoBack = false,
  previousPageTitle,
  processes,
  risks,
  onNavigateToControlTower // MODIFIÉ: Maintenant va vers la gestion des risques
}) => {
  useScrollToTopImmediate();

  // Calculs des statistiques avancées
  const stats = useMemo(() => {
    const total = risks.length;
    
    // Répartition par statut - CORRECTION: Initialiser tous les statuts possibles
    const byStatus = {
      'en_cours': 0,
      'realise': 0,
      'a_risque': 0
    };

    // Compter chaque statut
    risks.forEach(risk => {
      if (byStatus.hasOwnProperty(risk.actionPlanStatus)) {
        byStatus[risk.actionPlanStatus]++;
      }
    });

    // Debug: Afficher les statuts trouvés
    console.log('Statuts des risques:', risks.map(r => ({ id: r.id, status: r.actionPlanStatus })));
    console.log('Répartition par statut:', byStatus);

    // Répartition par qualification
    const byQualification = risks.reduce((acc, risk) => {
      const level = risk.qualification >= 7 ? 'high' : risk.qualification >= 4 ? 'medium' : 'low';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    // Répartition par catégorie
    const byCategory = risks.reduce((acc, risk) => {
      acc[risk.category] = (acc[risk.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Répartition par responsable de risque
    const byRiskOwner = risks.reduce((acc, risk) => {
      acc[risk.riskOwner] = (acc[risk.riskOwner] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Répartition par responsable d'action
    const byActionOwner = risks.reduce((acc, risk) => {
      acc[risk.actionPlanOwner] = (acc[risk.actionPlanOwner] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Risques en retard
    const overdue = risks.filter(risk => 
      new Date(risk.deadline) < new Date() && risk.actionPlanStatus !== 'realise'
    ).length;

    // Risques à échéance proche (30 jours)
    const upcoming = risks.filter(risk => {
      const deadline = new Date(risk.deadline);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return deadline >= now && deadline <= thirtyDaysFromNow && risk.actionPlanStatus !== 'realise';
    }).length;

    // Qualification moyenne
    const avgQualification = total > 0 ? 
      Math.round((risks.reduce((sum, risk) => sum + risk.qualification, 0) / total) * 10) / 10 : 0;

    // Taux de réalisation
    const completionRate = total > 0 ? 
      Math.round((byStatus.realise || 0) / total * 100) : 0;

    // Processus avec le plus de risques
    const processRiskCount = risks.reduce((acc, risk) => {
      acc[risk.processId] = (acc[risk.processId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const riskiestProcessId = Object.entries(processRiskCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    const riskiestProcess = riskiestProcessId ? 
      processes.find(p => p.id === riskiestProcessId) : null;

    // Évolution temporelle (simulation basée sur les dates)
    const monthlyTrends = risks.reduce((acc, risk) => {
      const month = new Date(risk.dateCreated).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcul des pourcentages pour la qualification
    const qualificationPercentages = {
      low: total > 0 ? Math.round((byQualification.low / total) * 100) : 0,
      medium: total > 0 ? Math.round((byQualification.medium / total) * 100) : 0,
      high: total > 0 ? Math.round((byQualification.high / total) * 100) : 0
    };

    return {
      total,
      byStatus,
      byQualification,
      qualificationPercentages,
      byCategory,
      byRiskOwner,
      byActionOwner,
      overdue,
      upcoming,
      avgQualification,
      completionRate,
      riskiestProcess,
      monthlyTrends,
      processRiskCount
    };
  }, [risks, processes]);

  // CORRECTION: Données pour les graphiques - Afficher TOUS les statuts même avec 0 valeur
  const statusData: ChartData[] = [
    { label: 'En cours', value: stats.byStatus.en_cours, color: '#3B82F6' },
    { label: 'Réalisé', value: stats.byStatus.realise, color: '#10B981' },
    { label: 'À risque (pas commencé)', value: stats.byStatus.a_risque, color: '#EF4444' }
  ]; // Suppression du .filter() pour afficher tous les statuts

  const categoryData: ChartData[] = Object.entries(stats.byCategory)
    .map(([label, value], index) => ({
      label,
      value,
      color: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
      ][index % 8]
    }))
    .sort((a, b) => b.value - a.value);

  const topRiskOwners = Object.entries(stats.byRiskOwner)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topActionOwners = Object.entries(stats.byActionOwner)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top 3 processus les plus risqués par qualification moyenne
  const top3ProcessesByQualification = Object.entries(stats.processRiskCount)
    .map(([processId, count]) => {
      const process = processes.find(p => p.id === processId);
      const processRisks = risks.filter(r => r.processId === processId);
      const avgQualification = processRisks.reduce((sum, r) => sum + r.qualification, 0) / count;
      
      return {
        process,
        count,
        avgQualification: Math.round(avgQualification * 10) / 10
      };
    })
    .filter(item => item.process)
    .sort((a, b) => b.avgQualification - a.avgQualification) // Tri par qualification décroissante
    .slice(0, 3); // Top 3

  // CORRECTION: Composant de graphique en barres amélioré avec texte spécifique pour les catégories
  const BarChart: React.FC<{ data: ChartData[]; title: string; showPercentage?: boolean; isCategory?: boolean; showTotal?: boolean }> = ({ 
    data, 
    title, 
    showPercentage = false, 
    isCategory = false,
    showTotal = true
  }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Minimum 1 pour éviter division par 0
    
    return (
      <div className="app-surface rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
          {title}
        </h3>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">
                  {item.value} {isCategory ? 'risque' : 'action'}{item.value > 1 ? 's' : ''}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: item.value > 0 ? `${Math.max((item.value / maxValue) * 100, 8)}%` : '0%', // Minimum 8% pour la visibilité
                    backgroundColor: item.color
                  }}
                >
                  {item.value > 0 && (
                    <span className="text-xs font-medium text-white">
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
              {item.value === 0 && (
                <div className="text-xs text-gray-400 italic">
                  Aucun{isCategory ? ' risque' : 'e action'} dans cette catégorie
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Résumé total - seulement si showTotal est true */}
        {showTotal && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Total</span>
              <span className="font-bold text-gray-900">
                {data.reduce((sum, item) => sum + item.value, 0)} {isCategory ? 'risque' : 'action'}{data.reduce((sum, item) => sum + item.value, 0) > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Fonction pour obtenir l'icône de classement
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <div className="w-5 h-5" />;
    }
  };

  // Fonction pour obtenir la couleur de qualification
  const getQualificationColor = (qualification: number) => {
    if (qualification >= 7) return 'text-red-600 bg-red-50 border-red-200';
    if (qualification >= 4) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête */}
      <header className="border-b border-slate-200 bg-white text-slate-950 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" />
                Tableau de Bord - Tour de Contrôle
              </h1>
              <p className="text-slate-500 text-sm">Analyse des risques et plans d'action</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateToControlTower}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm">Gestion des risques</span> {/* MODIFIÉ */}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="app-surface rounded-xl p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-100">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Total Risques</h3>
            <p className="text-xs text-gray-500">Tous processus</p>
          </div>

          <div className="app-surface rounded-xl p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Actions en Retard</h3>
            <p className="text-xs text-gray-500">Échéances dépassées</p>
          </div>

          <div className="app-surface rounded-xl p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{stats.byStatus.realise || 0}</div>
                <div className="text-sm font-medium text-green-600">{stats.completionRate}%</div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Actions Réalisées</h3>
            <p className="text-xs text-gray-500">Taux de réalisation: {stats.completionRate}%</p>
          </div>

          <div className="app-surface rounded-xl p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{stats.byStatus.en_cours || 0}</div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Actions en Cours</h3>
            <p className="text-xs text-gray-500">En cours de traitement</p>
          </div>
        </div>

        {/* Indicateur de qualification moyenne avec pourcentages */}
        <div className="grid md:grid-cols-1 gap-6 mb-8">
          <div className="app-surface rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Qualification Moyenne
              </h3>
              <span className={`text-3xl font-bold ${stats.avgQualification >= 7 ? 'text-red-600' : stats.avgQualification >= 4 ? 'text-orange-600' : 'text-green-600'}`}>
                {stats.avgQualification}/9
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.byQualification.low}</div>
                <div className="text-sm text-gray-600">Faible</div>
                <div className="text-xs text-gray-500">(1-3)</div>
                <div className="text-lg font-semibold text-green-600 mt-2">{stats.qualificationPercentages.low}%</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600 mb-1">{stats.byQualification.medium}</div>
                <div className="text-sm text-gray-600">Moyen</div>
                <div className="text-xs text-gray-500">(4-6)</div>
                <div className="text-lg font-semibold text-orange-600 mt-2">{stats.qualificationPercentages.medium}%</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-600 mb-1">{stats.byQualification.high}</div>
                <div className="text-sm text-gray-600">Élevé</div>
                <div className="text-xs text-gray-500">(7-9)</div>
                <div className="text-lg font-semibold text-red-600 mt-2">{stats.qualificationPercentages.high}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques de répartition - SANS TOTAUX */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <BarChart data={statusData} title="Répartition par Statut d'Action" isCategory={false} showTotal={false} />
          <BarChart data={categoryData} title="Risques par Catégorie" isCategory={true} showTotal={false} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Top Responsables Risques */}
          <div className="app-surface rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Top Responsables de Risques
            </h3>
            <div className="space-y-3">
              {topRiskOwners.map((owner, index) => (
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
                    <span className="text-xs text-gray-500">risques</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Processus critiques - VERSION COMPACTE */}
          <div className="app-surface rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              Top Processus critiques
            </h3>
            <div className="space-y-3">
              {top3ProcessesByQualification.map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-rose-50 rounded-lg border border-red-100">
                  {/* Icône de classement compacte */}
                  <div className="flex items-center justify-center w-8 h-8 mr-3">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  {/* Informations du processus compactes */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded border">
                        {item.process!.codeProcessus}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getQualificationColor(item.avgQualification)}`}>
                        {item.avgQualification}/9
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {item.process!.libelleProcessMetier}
                    </h4>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span className="flex items-center">
                        <Shield className="w-3 h-3 mr-1 text-red-500" />
                        {item.count} risque{item.count > 1 ? 's' : ''}
                      </span>
                      <span className="truncate">{item.process!.direction}</span>
                    </div>
                  </div>
                  
                  {/* Badge de position compact */}
                  <div className="text-right ml-2">
                    <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {top3ProcessesByQualification.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun processus avec des risques identifiés</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-1 gap-6 mb-8">
          {/* Top Responsables Actions */}
          <div className="app-surface rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Top Responsables d'Actions
            </h3>
            <div className="space-y-3">
              {topActionOwners.map((owner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{owner.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">{owner.count}</span>
                    <span className="text-xs text-gray-500">actions</span>
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
              onClick={onNavigateToControlTower}
              className="flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Gérer les Risques</div>
                <div className="text-sm text-gray-600">Gestion des risques</div> {/* MODIFIÉ */}
              </div>
            </button>

            <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Actions en Retard</div>
                <div className="text-sm text-gray-600">{stats.overdue} à traiter</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Performance</div>
                <div className="text-sm text-gray-600">{stats.completionRate}% de réalisation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlTowerDashboard;