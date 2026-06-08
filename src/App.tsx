import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import HomePage from './components/HomePage';
import BpmnEditor from './components/BpmnEditor';
import ProcessRepository from './components/ProcessRepository';
import ProcessMap from './components/ProcessMap';
import Dashboard from './components/Dashboard';
import ControlTower from './components/ControlTower';
import ControlTowerDashboard from './components/ControlTowerDashboard';
import Projections from './components/Projections';
import Sidebar from './components/Sidebar';
import GlobalTopBar from './components/GlobalTopBar';
import SettingsPage from './components/SettingsPage';
import NotificationCenter from './components/NotificationCenter';
import { Process } from './types/Process';
import { Risk } from './types/Risk';
import { ProcessProjection } from './types/Projection';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useScrollToTopImmediate } from './hooks/useScrollToTop';
import { useNavigationHistory } from './hooks/useNavigationHistory';
import { mockProcesses } from './data/mockProcesses';
import { mockRisks } from './data/mockRisks';
import { mockProjections } from './data/mockProjections';

function App() {
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Utiliser localStorage pour persister les processus, risques et projections
  const [processes, setProcesses] = useLocalStorage<Process[]>('bpmn-processes', mockProcesses);
  const [risks, setRisks] = useLocalStorage<Risk[]>('bpmn-risks', mockRisks);
  const [projections, setProjections] = useLocalStorage<ProcessProjection[]>('bpmn-projections', mockProjections);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('bpmn-theme', 'light');

  // Système de navigation avec historique
  const { navigateTo, goBack, canGoBack, currentPage, previousPage, getPageTitle } = useNavigationHistory();

  // Scroll automatique vers le haut à chaque changement de page
  useScrollToTopImmediate(currentPage.page);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const navigateToEditor = (process?: Process) => {
    if (process) {
      setSelectedProcess(process);
      navigateTo('editor', { processId: process.id });
    } else {
      setSelectedProcess(null);
      navigateTo('editor');
    }
  };

  const navigateToHome = () => {
    setSelectedProcess(null);
    navigateTo('home');
  };

  // Navigation vers la liste des processus (ancienne page référentiel)
  const navigateToProcessList = () => {
    navigateTo('process-list');
  };

  const navigateToProcessMap = () => {
    navigateTo('process-map');
  };

  const navigateToDashboard = () => {
    navigateTo('dashboard');
  };

  // Navigation vers la gestion des risques (ancienne page Tour de contrôle)
  const navigateToRiskManagement = () => {
    navigateTo('risk-management');
  };

  // Navigation vers le tableau de bord des risques (ancienne page Dashboard risques)
  const navigateToRiskDashboard = () => {
    navigateTo('risk-dashboard');
  };

  // NOUVEAU: Navigation vers les projections
  const navigateToProjections = () => {
    navigateTo('projections');
  };

  const navigateToSettings = () => {
    navigateTo('settings');
  };

  const navigateToNotifications = () => {
    navigateTo('notifications');
  };

  const handleGoBack = () => {
    const prevPage = goBack();
    if (prevPage) {
      // Restaurer l'état selon la page précédente
      if (prevPage.page === 'editor' && prevPage.data?.processId) {
        const process = processes.find(p => p.id === prevPage.data.processId);
        setSelectedProcess(process || null);
      } else {
        setSelectedProcess(null);
      }
    }
  };

  const handleSaveProcessDiagram = (processId: string, diagramXML: string) => {
    setProcesses(prevProcesses => 
      prevProcesses.map(process => 
        process.id === processId 
          ? { ...process, diagramXML, dateDerniereModification: new Date().toISOString().split('T')[0] }
          : process
      )
    );

    // Mettre à jour aussi le processus sélectionné si c'est le même
    if (selectedProcess && selectedProcess.id === processId) {
      setSelectedProcess(prev => prev ? { ...prev, diagramXML } : null);
    }
  };

  // Déterminer si on affiche la sidebar (pas sur la page d'accueil)
  const showSidebar = currentPage.page !== 'home';

  // Calculer la marge en fonction de l'état de la sidebar
  const getMainContentMargin = () => {
    if (!showSidebar) return '';
    return sidebarCollapsed ? 'ml-16' : 'ml-16 lg:ml-64';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#00030a] flex">
      {/* Sidebar - seulement si pas sur la page d'accueil */}
      {showSidebar && (
        <Sidebar
          currentPage={currentPage.page}
          onNavigateToHome={navigateToHome}
          onNavigateToDashboard={navigateToDashboard}
          onNavigateToProcessList={navigateToProcessList}
          onNavigateToProcessMap={navigateToProcessMap}
          onNavigateToEditor={() => navigateToEditor()}
          onNavigateToRiskManagement={navigateToRiskManagement}
          onNavigateToRiskDashboard={navigateToRiskDashboard}
          onNavigateToProjections={navigateToProjections} // NOUVEAU
          onNavigateToSettings={navigateToSettings}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />
      )}

      {/* Contenu principal - pleine largeur sur la page d'accueil */}
      <div className={`flex-1 transition-all duration-300 ${getMainContentMargin()}`}>
        {showSidebar && (
          <GlobalTopBar
            processes={processes}
            risks={risks}
            projections={projections}
            currentPage={currentPage.page}
            onNavigateToDashboard={navigateToDashboard}
            onNavigateToProcessList={navigateToProcessList}
            onNavigateToProcessMap={navigateToProcessMap}
            onNavigateToEditor={() => navigateToEditor()}
            onNavigateToRiskManagement={navigateToRiskManagement}
            onNavigateToRiskDashboard={navigateToRiskDashboard}
            onNavigateToProjections={navigateToProjections}
            onNavigateToNotifications={navigateToNotifications}
            onNavigateToSettings={navigateToSettings}
          />
        )}

        {currentPage.page === 'home' && (
          <HomePage 
            onNavigateToTool={() => navigateToProcessList()}
          />
        )}
        {currentPage.page === 'dashboard' && (
          <Dashboard
            processes={processes}
            onNavigateToHome={navigateToHome}
            onGoBack={canGoBack ? handleGoBack : undefined}
            canGoBack={canGoBack}
            previousPageTitle={previousPage ? getPageTitle(previousPage.page) : undefined}
            onNavigateToRepository={navigateToProcessList}
            onNavigateToEditor={() => navigateToEditor()}
          />
        )}
        {currentPage.page === 'editor' && (
          <BpmnEditor 
            onNavigateToHome={navigateToHome}
            onGoBack={canGoBack ? handleGoBack : undefined}
            canGoBack={canGoBack}
            previousPageTitle={previousPage ? getPageTitle(previousPage.page) : undefined}
            selectedProcess={selectedProcess}
            onSaveProcessDiagram={handleSaveProcessDiagram}
          />
        )}
        {/* Page process-list qui utilise le composant ProcessRepository */}
        {currentPage.page === 'process-list' && (
          <ProcessRepository 
            onNavigateToHome={navigateToHome}
            onGoBack={canGoBack ? handleGoBack : undefined}
            canGoBack={canGoBack}
            previousPageTitle={previousPage ? getPageTitle(previousPage.page) : undefined}
            onEditProcess={navigateToEditor}
            processes={processes}
            risks={risks}
            onUpdateProcesses={setProcesses}
          />
        )}
        {currentPage.page === 'process-map' && (
          <ProcessMap
            processes={processes}
            onOpenProcess={(process) => navigateToEditor(process)}
          />
        )}
        {/* Page risk-management qui utilise le composant ControlTower */}
        {currentPage.page === 'risk-management' && (
          <ControlTower
            onNavigateToHome={navigateToHome}
            onGoBack={canGoBack ? handleGoBack : undefined}
            canGoBack={canGoBack}
            previousPageTitle={previousPage ? getPageTitle(previousPage.page) : undefined}
            processes={processes}
            risks={risks}
            onUpdateRisks={setRisks}
          />
        )}
        {/* Page risk-dashboard qui utilise le composant ControlTowerDashboard */}
        {currentPage.page === 'risk-dashboard' && (
          <ControlTowerDashboard
            onNavigateToHome={navigateToHome}
            onGoBack={canGoBack ? handleGoBack : undefined}
            canGoBack={canGoBack}
            previousPageTitle={previousPage ? getPageTitle(previousPage.page) : undefined}
            processes={processes}
            risks={risks}
            onNavigateToControlTower={navigateToRiskManagement}
          />
        )}
        {/* NOUVEAU: Page projections */}
        {currentPage.page === 'projections' && (
          <Projections
            onNavigateToHome={navigateToHome}
            onGoBack={canGoBack ? handleGoBack : undefined}
            canGoBack={canGoBack}
            previousPageTitle={previousPage ? getPageTitle(previousPage.page) : undefined}
            processes={processes}
            projections={projections}
            onUpdateProjections={setProjections}
          />
        )}
        {currentPage.page === 'settings' && (
          <SettingsPage
            theme={theme}
            onThemeChange={setTheme}
          />
        )}
        {currentPage.page === 'notifications' && (
          <NotificationCenter
            processes={processes}
            risks={risks}
            onOpenProcesses={navigateToProcessList}
            onOpenRisks={navigateToRiskManagement}
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed bottom-4 right-4 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-600 dark:focus:ring-offset-slate-950"
        title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </div>
  );
}

export default App;
