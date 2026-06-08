import React, { useMemo, useState } from 'react';
import {
  Building,
  ChevronDown,
  ChevronRight,
  FileText,
  Maximize2,
  Minus,
  Network,
  Plus,
  Search,
  Tag
} from 'lucide-react';
import { Process } from '../types/Process';

interface ProcessMapProps {
  processes: Process[];
  onOpenProcess: (process: Process) => void;
}

const ProcessMap: React.FC<ProcessMapProps> = ({ processes, onOpenProcess }) => {
  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filteredProcesses = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return processes;

    return processes.filter(process =>
      process.libelleProcessMetier.toLowerCase().includes(value) ||
      process.codeProcessus.toLowerCase().includes(value) ||
      process.direction.toLowerCase().includes(value) ||
      process.domaine.toLowerCase().includes(value) ||
      process.macroActivite.toLowerCase().includes(value)
    );
  }, [processes, search]);

  const hierarchy = useMemo(() => {
    return filteredProcesses.reduce((directions, process) => {
      const direction = process.direction || 'Direction non renseignee';
      const domaine = process.domaine || 'Domaine non renseigne';
      const macro = process.macroActivite || 'Macro-activite non renseignee';

      directions[direction] ??= {};
      directions[direction][domaine] ??= {};
      directions[direction][domaine][macro] ??= [];
      directions[direction][domaine][macro].push(process);

      return directions;
    }, {} as Record<string, Record<string, Record<string, Process[]>>>);
  }, [filteredProcesses]);

  const toggleNode = (key: string) => {
    setExpanded(previous => ({ ...previous, [key]: !previous[key] }));
  };

  const resetView = () => {
    setZoom(1);
    setExpanded({});
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5 dark:border-[#0b1424] dark:bg-[#030812]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Cartographie</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-slate-100">Vue interactive des processus</h1>
            <p className="mt-1 text-sm text-slate-500">
              Navigation graphique de l'entreprise vers directions, domaines, macro-activites et processus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="app-button-secondary" onClick={() => setZoom(value => Math.max(0.7, value - 0.1))}>
              <Minus className="h-4 w-4" />
              Zoom
            </button>
            <button className="app-button-secondary" onClick={() => setZoom(value => Math.min(1.4, value + 0.1))}>
              <Plus className="h-4 w-4" />
              Zoom
            </button>
            <button className="app-button-secondary" onClick={resetView}>
              <Maximize2 className="h-4 w-4" />
              Recentrer
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <section className="app-surface mb-6 rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher dans la cartographie..."
              className="app-input pl-9"
            />
          </div>
        </section>

        <section className="app-surface overflow-auto rounded-xl p-6">
          <div
            className="min-w-[980px] origin-top-left transition-transform"
            style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}
          >
            <div className="mb-8 flex justify-center">
              <MapNode
                icon={Building}
                title="Entreprise"
                subtitle={`${filteredProcesses.length} processus cartographies`}
                tone="border-slate-200 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-[#00030a]"
              />
            </div>

            <div className="grid gap-6">
              {Object.entries(hierarchy).map(([direction, domaines]) => {
                const directionKey = `direction-${direction}`;
                const directionOpen = expanded[directionKey] ?? true;
                const directionCount = Object.values(domaines).flatMap(macros => Object.values(macros).flat()).length;

                return (
                  <div key={direction} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-[#0b1424] dark:bg-[#030812]">
                    <button
                      type="button"
                      onClick={() => toggleNode(directionKey)}
                      className="mb-4 flex w-full items-center gap-3 text-left"
                    >
                      {directionOpen ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                      <MapNode
                        icon={Building}
                        title={direction}
                        subtitle={`${directionCount} processus`}
                        tone="border-blue-200 bg-blue-50 text-blue-800"
                      />
                    </button>

                    {directionOpen && (
                      <div className="grid gap-4 pl-8">
                        {Object.entries(domaines).map(([domaine, macros]) => {
                          const domaineKey = `${directionKey}-${domaine}`;
                          const domaineOpen = expanded[domaineKey] ?? true;
                          const domaineCount = Object.values(macros).flat().length;

                          return (
                            <div key={domaine} className="rounded-xl border border-slate-100 bg-white p-4 dark:border-[#0b1424] dark:bg-[#00030a]">
                              <button type="button" onClick={() => toggleNode(domaineKey)} className="mb-4 flex w-full items-center gap-3 text-left">
                                {domaineOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                                <MapNode
                                  icon={Tag}
                                  title={domaine}
                                  subtitle={`${domaineCount} processus`}
                                  tone="border-purple-200 bg-purple-50 text-purple-800"
                                />
                              </button>

                              {domaineOpen && (
                                <div className="grid gap-4 pl-8 lg:grid-cols-2">
                                  {Object.entries(macros).map(([macro, macroProcesses]) => (
                                    <div key={macro} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-[#0b1424] dark:bg-[#030812]">
                                      <div className="mb-3">
                                        <MapNode
                                          icon={Network}
                                          title={macro}
                                          subtitle={`${macroProcesses.length} processus`}
                                          tone="border-emerald-200 bg-emerald-50 text-emerald-800"
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        {macroProcesses.map(process => (
                                          <button
                                            key={process.id}
                                            type="button"
                                            onClick={() => onOpenProcess(process)}
                                            className="rounded-lg border border-slate-100 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50 dark:border-[#0b1424] dark:bg-[#00030a] dark:hover:bg-white"
                                          >
                                            <div className="flex items-center gap-2">
                                              <FileText className="h-4 w-4 text-blue-500" />
                                              <span className="truncate font-semibold text-slate-950 dark:text-slate-100">{process.libelleProcessMetier}</span>
                                            </div>
                                            <p className="mt-1 text-xs font-mono text-slate-500">{process.codeProcessus}</p>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
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
          </div>
        </section>
      </main>
    </div>
  );
};

interface MapNodeProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tone: string;
}

const MapNode: React.FC<MapNodeProps> = ({ icon: Icon, title, subtitle, tone }) => (
  <div className={`inline-flex min-w-[240px] items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${tone}`}>
    <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/75 text-current">
      <Icon className="h-5 w-5" />
    </span>
    <span className="min-w-0">
      <span className="block truncate font-bold">{title}</span>
      <span className="block truncate text-xs opacity-75">{subtitle}</span>
    </span>
  </div>
);

export default ProcessMap;
