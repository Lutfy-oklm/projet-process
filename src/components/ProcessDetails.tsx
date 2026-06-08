import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard as Edit3,
  Download,
  Eye,
  FileText,
  GitBranch,
  History,
  Home,
  Maximize2,
  Paperclip,
  Plus,
  Shield,
  Tag,
  Upload,
  User,
  Trash2,
  X
} from 'lucide-react';
import { Process } from '../types/Process';
import { Risk } from '../types/Risk';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';

declare global {
  interface Window {
    BpmnJS?: any;
  }
}

interface ProcessDetailsProps {
  process: Process;
  risks?: Risk[];
  onBack: () => void;
  onEdit: (process: Process) => void;
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
  onEditDiagram?: (process: Process) => void;
}

type ProcessTab = 'info' | 'diagram' | 'risks' | 'documents' | 'history';

interface ProcessDocument {
  id: string;
  title: string;
  category: string;
  size: string;
  updatedAt: string;
  source?: string;
}

const ProcessDetails: React.FC<ProcessDetailsProps> = ({
  process,
  risks = [],
  onBack,
  onEdit,
  onNavigateToHome,
  onEditDiagram
}) => {
  const [activeTab, setActiveTab] = useState<ProcessTab>('info');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  useScrollToTopImmediate(activeTab);

  const defaultDocuments = useMemo<ProcessDocument[]>(() => ([
    { id: 'doc-1', title: 'Procedure operationnelle', category: 'Procedures', size: '1.2 Mo', updatedAt: process.dateDerniereModification },
    { id: 'doc-2', title: 'Guide de controle', category: 'Guides', size: '840 Ko', updatedAt: process.dateRevueProcessus },
    { id: 'doc-3', title: 'Politique de validation', category: 'Politiques', size: '620 Ko', updatedAt: process.dateCreationProcessus }
  ]), [process]);
  const [documents, setDocuments] = useState<ProcessDocument[]>(defaultDocuments);
  const [previewDocument, setPreviewDocument] = useState<ProcessDocument | null>(null);
  const [diagramFullscreen, setDiagramFullscreen] = useState(false);

  useEffect(() => {
    setDocuments(defaultDocuments);
    setPreviewDocument(null);
  }, [defaultDocuments]);

  const history = useMemo(() => ([
    { id: 'h-1', author: process.ownerProcessMetier, action: 'Modification des informations processus', date: process.dateDerniereModification, time: '14:20' },
    { id: 'h-2', author: process.responsableService, action: process.diagramXML ? 'Ajout du diagramme BPMN' : 'Preparation de la cartographie BPMN', date: process.dateRevueProcessus, time: '10:45' },
    { id: 'h-3', author: 'Systeme', action: 'Creation du processus', date: process.dateCreationProcessus, time: '09:00' }
  ]), [process]);

  const versions = useMemo(() => ([
    {
      id: 'v-1-2',
      version: '1.2',
      status: 'Publiee',
      author: process.ownerProcessMetier,
      date: process.dateDerniereModification,
      comment: 'Mise a jour des responsabilites et alignement avec les risques rattaches.',
      current: true
    },
    {
      id: 'v-1-1',
      version: '1.1',
      status: 'Archivee',
      author: process.responsableService,
      date: process.dateRevueProcessus,
      comment: 'Ajout des informations de revue et preparation du diagramme BPMN.',
      current: false
    },
    {
      id: 'v-1-0',
      version: '1.0',
      status: 'Archivee',
      author: 'Systeme',
      date: process.dateCreationProcessus,
      comment: 'Creation initiale de la fiche processus.',
      current: false
    }
  ]), [process]);

  const activities = useMemo(() => ([
    `${process.ownerProcessMetier} a mis a jour la fiche processus`,
    `${process.responsableService} a planifie une revue`,
    `${risks.length} risque(s) sont rattaches au processus`,
    process.diagramXML ? 'Un diagramme BPMN est disponible' : 'Aucun diagramme BPMN disponible'
  ]), [process, risks.length]);

  const tabs = [
    { id: 'info', label: 'Informations', icon: FileText },
    { id: 'diagram', label: 'Diagramme BPMN', icon: GitBranch },
    { id: 'risks', label: 'Risques', icon: Shield },
    { id: 'documents', label: 'Documents', icon: Paperclip },
    { id: 'history', label: 'Historique', icon: History }
  ] as const;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'draft': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'draft': return 'Brouillon';
      case 'review': return 'En revision';
      case 'archived': return 'Archive';
      default: return status;
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} Ko`;
    return `${Math.round((size / (1024 * 1024)) * 10) / 10} Mo`;
  };

  const handleUploadDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const uploadedDocuments = files.map(file => ({
      id: `doc-${Date.now()}-${file.name}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: 'Guides',
      size: formatFileSize(file.size),
      updatedAt: new Date().toISOString().split('T')[0],
      source: file.name
    }));

    setDocuments(previous => [...uploadedDocuments, ...previous]);
    event.target.value = '';
  };

  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm('Supprimer ce document de la fiche processus ?')) {
      setDocuments(previous => previous.filter(document => document.id !== documentId));
    }
  };

  const handleDownloadDocument = (document: ProcessDocument) => {
    const content = `Document: ${document.title}\nCategorie: ${document.category}\nProcessus: ${process.codeProcessus}\n`;
    downloadFile(`${document.title}.txt`, content, 'text/plain;charset=utf-8');
  };

  const getProcessFileBaseName = () => (
    `${process.codeProcessus}-${process.libelleProcessMetier}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
  );

  const downloadFile = (filename: string, content: BlobPart, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportProcessXml = () => {
    if (!process.diagramXML) return;
    downloadFile(`${getProcessFileBaseName()}.bpmn`, process.diagramXML, 'application/xml;charset=utf-8');
  };

  const buildProcessSvg = () => {
    const title = process.libelleProcessMetier.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const code = process.codeProcessus.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const status = getStatusLabel(process.status);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
  <rect width="1200" height="720" rx="32" fill="#f8fafc"/>
  <rect x="70" y="70" width="1060" height="580" rx="28" fill="#ffffff" stroke="#dbe5f2" stroke-width="2"/>
  <text x="110" y="138" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#2563eb">${code}</text>
  <text x="110" y="192" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#0f172a">${title}</text>
  <rect x="110" y="250" width="235" height="82" rx="18" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="138" y="300" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1d4ed8">Demarrage</text>
  <path d="M350 291 H485" stroke="#64748b" stroke-width="4" stroke-linecap="round" marker-end="url(#arrow)"/>
  <rect x="500" y="250" width="260" height="82" rx="18" fill="#ecfdf5" stroke="#a7f3d0"/>
  <text x="528" y="300" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#047857">Traitement</text>
  <path d="M765 291 H900" stroke="#64748b" stroke-width="4" stroke-linecap="round" marker-end="url(#arrow)"/>
  <rect x="915" y="250" width="170" height="82" rx="18" fill="#faf5ff" stroke="#e9d5ff"/>
  <text x="953" y="300" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#7e22ce">Sortie</text>
  <text x="110" y="420" font-family="Arial, sans-serif" font-size="22" fill="#475569">Statut: ${status} • Owner: ${process.ownerProcessMetier}</text>
  <text x="110" y="465" font-family="Arial, sans-serif" font-size="22" fill="#475569">Direction: ${process.direction} • Domaine: ${process.domaine}</text>
  <defs><marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2,2 L10,6 L2,10 Z" fill="#64748b"/></marker></defs>
</svg>`;
  };

  const getRenderedBpmnSvg = async () => {
    if (!process.diagramXML || !window.BpmnJS) return buildProcessSvg();

    const container = window.document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '-10000px';
    container.style.width = '1200px';
    container.style.height = '800px';
    window.document.body.appendChild(container);

    const viewer = new window.BpmnJS({ container });

    try {
      await viewer.importXML(process.diagramXML);
      viewer.get('canvas').zoom('fit-viewport');
      const result = await viewer.saveSVG();
      return result.svg || buildProcessSvg();
    } catch {
      return buildProcessSvg();
    } finally {
      viewer.destroy();
      window.document.body.removeChild(container);
    }
  };

  const handleExportProcessSvg = async () => {
    const svg = await getRenderedBpmnSvg();
    downloadFile(`${getProcessFileBaseName()}-diagramme.svg`, svg, 'image/svg+xml;charset=utf-8');
  };

  const handleExportProcessPng = async () => {
    const svg = await getRenderedBpmnSvg();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = window.document.createElement('canvas');
      canvas.width = Math.max(1200, image.width || 1200);
      canvas.height = Math.max(800, image.height || 800);
      const context = canvas.getContext('2d');
      if (!context) return;

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${getProcessFileBaseName()}-diagramme.png`;
        link.click();
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(svgUrl);
      }, 'image/png');
    };

    image.onerror = () => URL.revokeObjectURL(svgUrl);
    image.src = svgUrl;
  };

  const formatDate = (date: string) => (
    new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 text-slate-950 shadow-sm dark:border-[#0b1424] dark:bg-[#030812]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onNavigateToHome} className="app-button-secondary" title="Retour accueil">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Accueil</span>
            </button>
            <button onClick={onBack} className="app-button-secondary" title="Retour referentiel">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Referentiel</span>
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Fiche processus</p>
              <h1 className="text-xl font-bold text-slate-950 dark:text-slate-100">{process.libelleProcessMetier}</h1>
              <p className="text-sm text-slate-500">{process.codeProcessus}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onEditDiagram && (
              <button onClick={() => onEditDiagram(process)} className="app-button-secondary">
                <GitBranch className="h-4 w-4" />
                {process.diagramXML ? 'Modifier le diagramme' : 'Creer le diagramme'}
              </button>
            )}
            <button onClick={() => onEdit(process)} className="app-button-primary">
              <Edit3 className="h-4 w-4" />
              Modifier
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <section className="app-surface mb-6 rounded-xl p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-3 py-1 font-mono text-sm font-semibold text-slate-600">{process.codeProcessus}</span>
                <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(process.status)}`}>
                  {getStatusLabel(process.status)}
                </span>
                <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800">
                  Version 1.2
                </span>
                {process.diagramXML && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
                    <GitBranch className="h-4 w-4" />
                    Diagramme BPMN
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-100">{process.libelleProcessMetier}</h2>
              <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600 dark:text-slate-300">{process.descriptionProcessMetier}</p>
            </div>

            <div className="grid min-w-full gap-3 sm:grid-cols-3 xl:min-w-[420px]">
              <KpiCard label="Risques" value={risks.length.toString()} tone="red" />
              <KpiCard label="Documents" value={documents.length.toString()} tone="blue" />
              <KpiCard label="Version" value="1.2" tone="purple" />
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-[#00030a]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'info' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="app-surface rounded-xl p-6 lg:col-span-2">
              <SectionTitle icon={Building} title="Informations metier" />
              <div className="grid gap-4 md:grid-cols-2">
                <DetailTile icon={Building} label="Direction" value={process.direction} tone="blue" />
                <DetailTile icon={Tag} label="Domaine" value={process.domaine} tone="purple" />
                <DetailTile icon={FileText} label="Macro-activite" value={process.macroActivite} tone="emerald" />
                <DetailTile icon={User} label="Responsable service" value={process.responsableService} tone="orange" />
                <DetailTile icon={CheckCircle} label="Owner metier" value={process.ownerProcessMetier} tone="blue" />
                <DetailTile icon={Clock} label="Statut" value={getStatusLabel(process.status)} tone="purple" />
              </div>
            </section>

            <section className="app-surface rounded-xl p-6">
              <SectionTitle icon={Calendar} title="Cycle de vie" />
              <div className="space-y-4">
                <TimelineItem title="Creation" value={formatDate(process.dateCreationProcessus)} />
                <TimelineItem title="Derniere mise a jour" value={formatDate(process.dateDerniereModification)} />
                <TimelineItem title="Prochaine revue" value={formatDate(process.dateRevueProcessus)} />
              </div>
            </section>
          </div>
        )}

        {activeTab === 'diagram' && (
          <section className="app-surface rounded-xl p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle icon={GitBranch} title="Diagramme BPMN associe" />
              {process.diagramXML && (
                <div className="flex flex-wrap gap-2">
                  <button className="app-button-secondary" onClick={() => setDiagramFullscreen(true)}><Maximize2 className="h-4 w-4" />Plein ecran</button>
                  <button className="app-button-secondary" onClick={handleExportProcessSvg}><Download className="h-4 w-4" />SVG</button>
                  <button className="app-button-secondary" onClick={handleExportProcessPng}><Download className="h-4 w-4" />PNG</button>
                </div>
              )}
            </div>

            {process.diagramXML ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 dark:border-[#15243a] dark:bg-[#00030a]">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#15243a] dark:bg-[#030812]">
                  <BpmnInlinePreview xml={process.diagramXML} />
                  <div className="flex flex-col gap-3 border-t border-slate-100 p-4 dark:border-[#0b1424] sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">Apercu non modifiable du diagramme associe.</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="app-button-secondary" onClick={() => setDiagramFullscreen(true)}>
                        <Maximize2 className="h-4 w-4" />
                        Agrandir
                      </button>
                      {onEditDiagram && (
                        <button onClick={() => onEditDiagram(process)} className="app-button-primary">
                          Ouvrir l'editeur
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={GitBranch}
                title="Aucun diagramme BPMN"
                description="Creez une cartographie BPMN pour relier ce processus a son flux operationnel."
                actionLabel="Creer un diagramme"
                onAction={onEditDiagram ? () => onEditDiagram(process) : undefined}
              />
            )}
          </section>
        )}

        {activeTab === 'risks' && (
          <section className="app-surface rounded-xl p-6">
            <SectionTitle icon={Shield} title="Risques rattaches" />
            {risks.length > 0 ? (
              <div className="mt-5 grid gap-4">
                {risks.map(risk => (
                  <div key={risk.id} className="rounded-xl border border-slate-100 p-4 dark:border-[#0b1424]">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">{risk.processCode}</span>
                      <span className="rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">Qualification {risk.qualification}/9</span>
                      <span className="rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">{risk.category}</span>
                    </div>
                    <h3 className="font-bold text-slate-950 dark:text-slate-100">{risk.riskDescription}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{risk.actionPlan}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Shield} title="Aucun risque rattache" description="Les risques associes au processus apparaitront ici." />
            )}
          </section>
        )}

        {activeTab === 'documents' && (
          <section className="app-surface rounded-xl p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle icon={Paperclip} title="Documents" />
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleUploadDocument}
                />
                <button className="app-button-primary" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Ajouter un document
                </button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {documents.map(document => (
                <div key={document.id} className="rounded-xl border border-slate-100 p-4 dark:border-[#0b1424]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-950 dark:text-slate-100">{document.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{document.category} • {document.size}</p>
                  {document.source && (
                    <p className="mt-1 truncate text-xs text-slate-500">Source: {document.source}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">Mis a jour le {formatDate(document.updatedAt)}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="app-button-secondary px-3 py-2" onClick={() => setPreviewDocument(document)}>
                      <Eye className="h-4 w-4" />
                      Voir
                    </button>
                    <button className="app-button-secondary px-3 py-2" onClick={() => handleDownloadDocument(document)}>
                      <Download className="h-4 w-4" />
                      Telecharger
                    </button>
                    <button className="app-button-secondary px-3 py-2 text-rose-600" onClick={() => handleDeleteDocument(document.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {documents.length === 0 && (
              <EmptyState
                icon={Paperclip}
                title="Aucun document"
                description="Ajoutez des procedures, guides, politiques ou controles pour enrichir la fiche."
                actionLabel="Ajouter un document"
                onAction={() => fileInputRef.current?.click()}
              />
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section className="app-surface rounded-xl p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle icon={History} title="Historique" />
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Version courante 1.2
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Versions</h3>
                <div className="space-y-3">
                  {versions.map(version => (
                    <div
                      key={version.id}
                      className={`rounded-xl border p-4 ${
                        version.current
                          ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-[#060d19]'
                          : 'border-slate-100 dark:border-[#0b1424]'
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800">
                          Version {version.version}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          version.current
                            ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                            : 'border-slate-200 bg-slate-100 text-slate-700'
                        }`}>
                          {version.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{version.comment}</p>
                      <p className="mt-2 text-xs text-slate-500">{version.author} - {formatDate(version.date)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Journal des actions</h3>
                <div className="space-y-3">
                  {history.map(event => (
                    <div key={event.id} className="flex gap-3 rounded-xl border border-slate-100 p-4 dark:border-[#0b1424]">
                      <span className="mt-1 h-3 w-3 rounded-full bg-blue-500" />
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-slate-100">{event.action}</p>
                        <p className="text-sm text-slate-500">{event.author} - {formatDate(event.date)} a {event.time}</p>
                      </div>
                    </div>
                  ))}
                  {activities.map((activity, index) => (
                    <div key={activity} className="flex gap-3 rounded-xl bg-slate-50 p-4 dark:bg-[#060d19]">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-[#00030a]">{index + 1}</span>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{activity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        {previewDocument && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-[#15243a] dark:bg-[#030812]">
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-[#0b1424]">
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-slate-100">{previewDocument.title}</h3>
                  <p className="text-sm text-slate-500">{previewDocument.category} • {previewDocument.size}</p>
                </div>
                <button
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white dark:hover:text-[#00030a]"
                  onClick={() => setPreviewDocument(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-[#15243a] dark:bg-[#00030a]">
                  <FileText className="mx-auto h-12 w-12 text-blue-500" />
                  <h4 className="mt-3 font-bold text-slate-950 dark:text-slate-100">Apercu documentaire</h4>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Cette zone est prete pour afficher un apercu PDF, image ou document lorsque le stockage fichier sera relie au backend.
                  </p>
                  <button className="app-button-primary mt-5" onClick={() => handleDownloadDocument(previewDocument)}>
                    <Download className="h-4 w-4" />
                    Telecharger
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {diagramFullscreen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
            <div className="flex h-[92vh] w-full max-w-7xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-[#15243a] dark:bg-[#030812]">
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-[#0b1424]">
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-slate-100">{process.libelleProcessMetier}</h3>
                  <p className="text-sm text-slate-500">{process.codeProcessus} - Apercu BPMN non modifiable</p>
                </div>
                <button
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white dark:hover:text-[#00030a]"
                  onClick={() => setDiagramFullscreen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col p-6">
                <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#15243a] dark:bg-[#030812]">
                  {process.diagramXML ? (
                    <BpmnInlinePreview xml={process.diagramXML} heightClass="h-full" />
                  ) : (
                    <EmptyState icon={GitBranch} title="Aucun diagramme BPMN" description="Creez une cartographie BPMN pour ce processus." />
                  )}
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button className="app-button-secondary" onClick={handleExportProcessSvg}>
                    <Download className="h-4 w-4" />
                    SVG
                  </button>
                  <button className="app-button-primary" onClick={handleExportProcessPng}>
                    <Download className="h-4 w-4" />
                    PNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

interface KpiCardProps {
  label: string;
  value: string;
  tone: 'red' | 'blue' | 'purple';
}

const kpiTones: Record<KpiCardProps['tone'], string> = {
  red: 'border-red-100 bg-red-50 text-red-700',
  blue: 'border-blue-100 bg-blue-50 text-blue-700',
  purple: 'border-purple-100 bg-purple-50 text-purple-700'
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, tone }) => (
  <div className={`rounded-xl border p-4 ${kpiTones[tone]}`}>
    <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </div>
);

interface SectionTitleProps {
  icon: React.ElementType;
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-[#00030a]">
      <Icon className="h-5 w-5" />
    </span>
    <h2 className="text-xl font-bold text-slate-950 dark:text-slate-100">{title}</h2>
  </div>
);

interface DetailTileProps {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: 'blue' | 'purple' | 'emerald' | 'orange';
}

const detailTones: Record<DetailTileProps['tone'], string> = {
  blue: 'border-blue-100 bg-blue-50 text-blue-600',
  purple: 'border-purple-100 bg-purple-50 text-purple-600',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  orange: 'border-orange-100 bg-orange-50 text-orange-600'
};

const DetailTile: React.FC<DetailTileProps> = ({ icon: Icon, label, value, tone }) => (
  <div className="rounded-xl border border-slate-100 p-4 dark:border-[#0b1424]">
    <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${detailTones[tone]}`}>
      <Icon className="h-5 w-5" />
    </span>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 font-semibold text-slate-950 dark:text-slate-100">{value}</p>
  </div>
);

const TimelineItem: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="border-l-2 border-slate-200 pl-4 dark:border-[#15243a]">
    <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{title}</p>
    <p className="text-sm text-slate-500">{value}</p>
  </div>
);

const BpmnInlinePreview: React.FC<{ xml: string; heightClass?: string }> = ({ xml, heightClass = 'h-[420px]' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !window.BpmnJS) {
      setReady(false);
      return;
    }

    let destroyed = false;
    const viewer = new window.BpmnJS({ container: containerRef.current });

    viewer.importXML(xml)
      .then(() => {
        if (destroyed) return;
        viewer.get('canvas').zoom('fit-viewport');
        setReady(true);
      })
      .catch(() => setReady(false));

    return () => {
      destroyed = true;
      viewer.destroy();
    };
  }, [xml]);

  return (
    <div className={`bpmn-readonly-preview relative ${heightClass} bg-white dark:bg-[#030812]`}>
      <div ref={containerRef} className="h-full w-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-[#030812]/90">
          <div className="text-center">
            <GitBranch className="mx-auto h-12 w-12 text-purple-500" />
            <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-slate-100">Diagramme BPMN disponible</h3>
            <p className="mt-1 text-sm text-slate-500">Apercu en cours de chargement ou bibliotheque BPMN indisponible.</p>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
          .bpmn-readonly-preview .djs-palette,
          .bpmn-readonly-preview .djs-context-pad,
          .bpmn-readonly-preview .djs-popup,
          .bpmn-readonly-preview .djs-overlay-container,
          .bpmn-readonly-preview .bjs-powered-by {
            display: none !important;
          }

          .bpmn-readonly-preview .djs-container {
            pointer-events: none !important;
          }
        `
      }} />
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-[#15243a]">
    <Icon className="mx-auto h-12 w-12 text-slate-400" />
    <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-slate-100">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
    {actionLabel && onAction && (
      <button onClick={onAction} className="app-button-primary mt-5">
        <Plus className="h-4 w-4" />
        {actionLabel}
      </button>
    )}
  </div>
);

interface RelationNodeProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tone: string;
}

const RelationNode: React.FC<RelationNodeProps> = ({ icon: Icon, title, subtitle, tone }) => (
  <div className={`inline-flex min-w-[150px] items-center gap-3 rounded-xl border px-3 py-3 shadow-sm ${tone}`}>
    <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/75 text-current">
      <Icon className="h-4 w-4" />
    </span>
    <span className="min-w-0">
      <span className="block truncate text-sm font-bold">{title}</span>
      <span className="block truncate text-xs opacity-75">{subtitle}</span>
    </span>
  </div>
);

export default ProcessDetails;
