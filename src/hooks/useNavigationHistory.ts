import { useState, useCallback } from 'react';

export type PageType = 'home' | 'editor' | 'process-list' | 'process-map' | 'dashboard' | 'risk-management' | 'risk-dashboard' | 'projections' | 'notifications' | 'settings' | 'process-details' | 'process-form';

export interface NavigationState {
  page: PageType;
  data?: any;
  timestamp: number;
}

export const useNavigationHistory = () => {
  const [history, setHistory] = useState<NavigationState[]>([
    { page: 'home', timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigateTo = useCallback((page: PageType, data?: any) => {
    const newState: NavigationState = {
      page,
      data,
      timestamp: Date.now()
    };

    // Supprimer tout l'historique après l'index actuel et ajouter la nouvelle page
    const newHistory = [...history.slice(0, currentIndex + 1), newState];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const canGoBack = currentIndex > 0;
  const currentPage = history[currentIndex];
  const previousPage = currentIndex > 0 ? history[currentIndex - 1] : null;

  const getPageTitle = (page: PageType) => {
    switch (page) {
      case 'home': return 'Accueil';
      case 'editor': return 'Éditeur BPMN';
      case 'process-list': return 'Liste processus';
      case 'process-map': return 'Cartographie';
      case 'dashboard': return 'Tableau de bord';
      case 'risk-management': return 'Gestion des risques';
      case 'risk-dashboard': return 'Tableau de bord';
      case 'projections': return 'Projections'; // NOUVEAU
      case 'notifications': return 'Notifications';
      case 'settings': return 'Paramètres';
      case 'process-details': return 'Détails du processus';
      case 'process-form': return 'Formulaire processus';
      default: return 'Page';
    }
  };

  return {
    navigateTo,
    goBack,
    canGoBack,
    currentPage,
    previousPage,
    getPageTitle,
    history
  };
};
