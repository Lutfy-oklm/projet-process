import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  GitBranch,
  Shield,
  Sparkles
} from 'lucide-react';
import { Process } from '../types/Process';
import { Risk } from '../types/Risk';

interface NotificationCenterProps {
  processes: Process[];
  risks: Risk[];
  onOpenProcesses: () => void;
  onOpenRisks: () => void;
}

type NotificationType = 'process' | 'review' | 'diagram' | 'risk' | 'document' | 'version';
type NotificationFilter = 'all' | 'unread' | NotificationType;

interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date: string;
  icon: React.ElementType;
  tone: string;
  actionLabel: string;
  onAction: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  processes,
  risks,
  onOpenProcesses,
  onOpenRisks
}) => {
  const notifications = useMemo<AppNotification[]>(() => {
    const diagramNotifications = processes
      .filter(process => !process.diagramXML)
      .slice(0, 6)
      .map(process => ({
        id: `diagram-${process.id}`,
        type: 'diagram' as const,
        title: 'Diagramme BPMN manquant',
        description: `${process.codeProcessus} - ${process.libelleProcessMetier}`,
        date: process.dateDerniereModification,
        icon: GitBranch,
        tone: 'border-orange-100 bg-orange-50 text-orange-700',
        actionLabel: 'Voir le processus',
        onAction: onOpenProcesses
      }));

    const reviewNotifications = processes
      .filter(process => process.status === 'review')
      .slice(0, 5)
      .map(process => ({
        id: `review-${process.id}`,
        type: 'review' as const,
        title: 'Revision a effectuer',
        description: `${process.ownerProcessMetier} doit valider ${process.libelleProcessMetier}`,
        date: process.dateRevueProcessus,
        icon: Clock,
        tone: 'border-blue-100 bg-blue-50 text-blue-700',
        actionLabel: 'Ouvrir le referentiel',
        onAction: onOpenProcesses
      }));

    const riskNotifications = risks
      .filter(risk => new Date(risk.deadline) < new Date() && risk.actionPlanStatus !== 'realise')
      .slice(0, 5)
      .map(risk => ({
        id: `risk-${risk.id}`,
        type: 'risk' as const,
        title: 'Plan d’action risque en retard',
        description: `${risk.processCode} - ${risk.riskDescription}`,
        date: risk.deadline,
        icon: Shield,
        tone: 'border-red-100 bg-red-50 text-red-700',
        actionLabel: 'Voir les risques',
        onAction: onOpenRisks
      }));

    const versionNotifications = processes.slice(0, 3).map(process => ({
      id: `version-${process.id}`,
      type: 'version' as const,
      title: 'Nouvelle version disponible',
      description: `Version 1.2 publiee pour ${process.codeProcessus}`,
      date: process.dateDerniereModification,
      icon: Sparkles,
      tone: 'border-purple-100 bg-purple-50 text-purple-700',
      actionLabel: 'Consulter',
      onAction: onOpenProcesses
    }));

    const documentNotifications = processes.slice(0, 2).map(process => ({
      id: `document-${process.id}`,
      type: 'document' as const,
      title: 'Nouveau document ajoute',
      description: `Guide de controle rattache a ${process.codeProcessus}`,
      date: process.dateDerniereModification,
      icon: FileText,
      tone: 'border-emerald-100 bg-emerald-50 text-emerald-700',
      actionLabel: 'Voir les documents',
      onAction: onOpenProcesses
    }));

    return [
      ...riskNotifications,
      ...diagramNotifications,
      ...reviewNotifications,
      ...documentNotifications,
      ...versionNotifications
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [processes, risks, onOpenProcesses, onOpenRisks]);

  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const unreadCount = notifications.filter(notification => !readIds.includes(notification.id)).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !readIds.includes(notification.id);
    return notification.type === filter;
  });

  const markAsRead = (id: string) => {
    setReadIds(previous => previous.includes(id) ? previous : [...previous, id]);
  };

  const toggleRead = (id: string) => {
    setReadIds(previous => previous.includes(id)
      ? previous.filter(readId => readId !== id)
      : [...previous, id]
    );
  };

  const filters: Array<{ id: NotificationFilter; label: string }> = [
    { id: 'all', label: 'Toutes' },
    { id: 'unread', label: 'Non lues' },
    { id: 'risk', label: 'Risques' },
    { id: 'diagram', label: 'Diagrammes' },
    { id: 'review', label: 'Revues' },
    { id: 'document', label: 'Documents' },
    { id: 'version', label: 'Versions' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5 dark:border-[#0b1424] dark:bg-[#030812]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Notifications</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-slate-100">Centre de notifications</h1>
            <p className="mt-1 text-sm text-slate-500">
              Suivi des processus en attente, revues, diagrammes, documents et risques.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="app-button-secondary" onClick={() => setReadIds([])}>
              Réinitialiser
            </button>
            <button className="app-button-primary" onClick={() => setReadIds(notifications.map(notification => notification.id))}>
              <CheckCircle className="h-4 w-4" />
              Tout marquer comme lu
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <SummaryCard label="Total" value={notifications.length} tone="blue" />
          <SummaryCard label="Non lues" value={unreadCount} tone="red" />
          <SummaryCard label="Risques" value={notifications.filter(item => item.type === 'risk').length} tone="orange" />
          <SummaryCard label="Diagrammes" value={notifications.filter(item => item.type === 'diagram').length} tone="purple" />
        </div>

        <section className="app-surface mb-6 rounded-xl p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Filter className="h-4 w-4" />
            Filtrer les notifications
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  filter === item.id
                    ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-[#00030a]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          {filteredNotifications.map(notification => {
            const Icon = notification.icon;
            const read = readIds.includes(notification.id);

            return (
              <article key={notification.id} className={`app-surface rounded-xl p-5 transition ${read ? 'opacity-70' : ''}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <span className={`inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border ${notification.tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-950 dark:text-slate-100">{notification.title}</h2>
                        {!read && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                            Non lu
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{notification.description}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(notification.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRead(notification.id)}
                      className="app-button-secondary"
                    >
                      {read ? 'Marquer non lu' : 'Marquer lu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        markAsRead(notification.id);
                        notification.onAction();
                      }}
                      className="app-button-primary"
                    >
                      {notification.actionLabel}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {filteredNotifications.length === 0 && (
          <div className="app-surface rounded-xl py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-slate-100">Aucune notification</h3>
            <p className="mt-2 text-sm text-slate-500">Aucune notification ne correspond au filtre selectionne.</p>
          </div>
        )}
      </main>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  tone: 'blue' | 'red' | 'orange' | 'purple';
}

const summaryTones: Record<SummaryCardProps['tone'], string> = {
  blue: 'border-blue-100 bg-blue-50 text-blue-700',
  red: 'border-red-100 bg-red-50 text-red-700',
  orange: 'border-orange-100 bg-orange-50 text-orange-700',
  purple: 'border-purple-100 bg-purple-50 text-purple-700'
};

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, tone }) => (
  <div className={`rounded-xl border p-4 ${summaryTones[tone]}`}>
    <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
    <p className="mt-2 text-3xl font-bold">{value}</p>
  </div>
);

export default NotificationCenter;
