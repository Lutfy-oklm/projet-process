import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

interface BackButtonProps {
  onBack?: () => void;
  onHome: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
  className?: string;
  showHomeButton?: boolean; // Nouveau prop pour contrôler l'affichage du bouton accueil
}

const BackButton: React.FC<BackButtonProps> = ({
  onBack,
  onHome,
  canGoBack = false,
  previousPageTitle,
  className = "",
  showHomeButton = true // Par défaut, on affiche le bouton accueil
}) => {
  // Si on peut revenir en arrière ET qu'on a un bouton retour, on privilégie le retour
  // et on cache le bouton accueil pour éviter la redondance
  const shouldShowHome = showHomeButton && (!canGoBack || !onBack);
  const shouldShowBack = canGoBack && onBack;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Bouton Accueil - affiché seulement si pas de bouton retour ou si explicitement demandé */}
      {shouldShowHome && (
        <button
          onClick={onHome}
          className="flex items-center space-x-2 px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200"
          title="Retour à l'accueil"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Accueil</span>
        </button>
      )}

      {/* Bouton Retour - seulement si on peut revenir en arrière */}
      {shouldShowBack && (
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200"
          title={previousPageTitle ? `Retour à ${previousPageTitle}` : 'Page précédente'}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">
            {previousPageTitle || 'Retour'}
          </span>
        </button>
      )}

      {/* Bouton Accueil alternatif - si on a un bouton retour mais qu'on veut quand même l'accueil */}
      {!shouldShowHome && shouldShowBack && showHomeButton && (
        <button
          onClick={onHome}
          className="flex items-center space-x-1 px-2 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 opacity-75 hover:opacity-100"
          title="Retour à l'accueil"
        >
          <Home className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default BackButton;