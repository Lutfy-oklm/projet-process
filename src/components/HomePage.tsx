import React from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  GitBranch,
  Layers3,
  Play,
  Shield,
  Sparkles
} from 'lucide-react';

interface HomePageProps {
  onNavigateToTool: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToTool }) => {
  const modules = [
    {
      title: 'Référentiel',
      description: 'Centraliser, rechercher et maintenir les processus métier.',
      icon: FileText,
      tone: 'bg-blue-50 text-blue-700 border-blue-100'
    },
    {
      title: 'Éditeur BPMN',
      description: 'Créer et mettre à jour les diagrammes liés aux processus.',
      icon: GitBranch,
      tone: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    },
    {
      title: 'Risques',
      description: 'Suivre les plans d’action, les échéances et les criticités.',
      icon: Shield,
      tone: 'bg-rose-50 text-rose-700 border-rose-100'
    },
    {
      title: 'Projections',
      description: 'Anticiper la charge, la capacité et les besoins ETP.',
      icon: Activity,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    }
  ];

  const highlights = [
    'Données persistées localement',
    'Navigation unifiée',
    'Tableaux de bord intégrés'
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Espace de pilotage processus
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Pilotez vos processus, risques et projections dans un seul espace.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Une interface opérationnelle pour documenter les processus, maintenir les diagrammes BPMN,
              suivre les risques et anticiper la charge de travail.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onNavigateToTool}
                className="app-button-primary px-5 py-3"
              >
                <Play className="h-4 w-4" />
                Accéder à l’outil
                <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#modules" className="app-button-secondary px-5 py-3">
                Voir les modules
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.map((item) => (
                <span key={item} className="app-chip border-slate-200 bg-white text-slate-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="app-surface rounded-xl p-4">
            <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Vue synthèse</p>
                  <h2 className="text-lg font-semibold">Portefeuille processus</h2>
                </div>
                <div className="rounded-md bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  À jour
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Metric value="5" label="Processus" />
                <Metric value="12" label="Risques" />
                <Metric value="4" label="Années" />
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-lg bg-white/8 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Documentation</span>
                    <span className="font-semibold text-white">78%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[78%] rounded-full bg-blue-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatusCard icon={Layers3} title="Référentiel" value="Structuré" />
                  <StatusCard icon={BarChart3} title="Pilotage" value="Disponible" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Modules</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Un parcours de travail complet</h2>
          </div>
          <button onClick={onNavigateToTool} className="app-button-secondary">
            Ouvrir le référentiel
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article key={module.title} className="app-surface rounded-xl p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border ${module.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="app-surface rounded-xl p-6">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Objectif</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Moins d’outils dispersés, plus de pilotage.</h2>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              L’application rassemble les données clés autour des processus : description métier,
              diagramme, risques associés et projections de charge. L’objectif est de rendre la mise à jour
              plus rapide et la lecture plus fiable pour les équipes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

interface MetricProps {
  value: string;
  label: string;
}

const Metric: React.FC<MetricProps> = ({ value, label }) => (
  <div className="rounded-lg bg-white/8 p-3">
    <p className="text-2xl font-bold">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{label}</p>
  </div>
);

interface StatusCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon: Icon, title, value }) => (
  <div className="rounded-lg bg-white/8 p-3">
    <Icon className="mb-2 h-4 w-4 text-blue-300" />
    <p className="text-xs text-slate-400">{title}</p>
    <p className="text-sm font-semibold text-white">{value}</p>
  </div>
);

export default HomePage;
