import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, AlignCenter, AlignLeft, AlignRight, CheckCircle, Clipboard, Copy,
  Database, Download, Expand, FileDown, FileText, GitBranch, Info, Maximize2,
  Minimize2, PanelRightClose, PanelRightOpen, Palette, RefreshCw, RotateCcw,
  Save, Scissors, Trash2, Undo2, Upload, Wand2, XCircle, ZoomIn, ZoomOut
} from 'lucide-react';
import { initialDiagram } from '../data/initialDiagram';
import { useScrollToTopImmediate } from '../hooks/useScrollToTop';
import { Process } from '../types/Process';

declare global { interface Window { BpmnJS: any; } }

interface BpmnEditorProps {
  onNavigateToHome: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  previousPageTitle?: string;
  selectedProcess?: Process | null;
  onSaveProcessDiagram?: (processId: string, diagramXML: string) => void;
}

interface ValidationItem { id: string; level: 'error' | 'warning' | 'suggestion'; message: string; }
interface VersionItem { id: string; version: string; date: string; author: string; comment: string; xml: string; }
interface Metadata { description: string; owner: string; duration: string; system: string; rules: string; risks: string; documentation: string; }
type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error';

const emptyMetadata: Metadata = { description: '', owner: '', duration: '', system: '', rules: '', risks: '', documentation: '' };
const colors = [
  ['Defaut', '#0f172a', '#ffffff'], ['Rouge', '#dc2626', '#fef2f2'], ['Orange', '#ea580c', '#fff7ed'],
  ['Jaune', '#ca8a04', '#fefce8'], ['Vert', '#16a34a', '#f0fdf4'], ['Bleu', '#2563eb', '#eff6ff'],
  ['Indigo', '#4f46e5', '#eef2ff'], ['Violet', '#9333ea', '#faf5ff'], ['Rose', '#e11d48', '#fdf2f8'],
  ['Gris', '#6b7280', '#f9fafb'], ['Cyan', '#0891b2', '#ecfeff'], ['Emeraude', '#059669', '#ecfdf5']
].map(([name, stroke, fill]) => ({ name, stroke, fill }));

const BpmnEditor: React.FC<BpmnEditorProps> = ({ onNavigateToHome, onGoBack, selectedProcess, onSaveProcessDiagram }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autosaveTimerRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  const [metadataByElement, setMetadataByElement] = useState<Record<string, Metadata>>({});
  const [colorPicker, setColorPicker] = useState<{ visible: boolean; x: number; y: number; element: any }>({ visible: false, x: 0, y: 0, element: null });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationItem[]>([]);
  const [validationOpen, setValidationOpen] = useState(false);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [message, setMessage] = useState('');

  useScrollToTopImmediate();

  const diagramName = selectedProcess ? `Diagramme BPMN - ${selectedProcess.libelleProcessMetier}` : 'Diagramme BPMN - Nouveau diagramme';
  const diagramStatus = validationResults.some(item => item.level === 'error') ? 'En cours' : 'Brouillon';
  const storageKey = `bpmn-autosave-${selectedProcess?.id || 'draft'}`;
  const versionStorageKey = `bpmn-versions-${selectedProcess?.id || 'draft'}`;
  const selectedMetadata = selectedElement ? metadataByElement[selectedElement.id] || emptyMetadata : emptyMetadata;
  const fileBaseName = useMemo(() => (selectedProcess ? `processus-${selectedProcess.libelleProcessMetier}-v1` : 'processus-nouveau-diagramme-v1')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase(), [selectedProcess]);

  const showUserMessage = (text: string) => { setMessage(text); window.setTimeout(() => setMessage(''), 3600); };
  const getCanvas = () => modelerRef.current?.get('canvas');
  const getCommandStack = () => modelerRef.current?.get('commandStack');
  const fitViewportWithLeftGutter = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    canvas.zoom('fit-viewport');
    const viewbox = canvas.viewbox();
    canvas.viewbox({
      ...viewbox,
      x: viewbox.x - 180,
      width: viewbox.width + 180
    });
  };
  const downloadBlob = (filename: string, content: BlobPart, type: string) => {
    const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const saveLocalDraft = async (reason = 'auto') => {
    if (!modelerRef.current) return;
    try {
      setSaveStatus('saving');
      const result = await modelerRef.current.saveXML({ format: true });
      localStorage.setItem(storageKey, result.xml || '');
      localStorage.setItem(`${storageKey}-updatedAt`, new Date().toISOString());
      setLastSavedTime(new Date());
      setSaveStatus('saved');
      if (reason === 'manual') showUserMessage('Diagramme sauvegarde localement.');
    } catch { setSaveStatus('error'); showUserMessage('Sauvegarde impossible.'); }
  };

  const createVersion = async (comment: string) => {
    if (!modelerRef.current) return;
    try {
      const result = await modelerRef.current.saveXML({ format: true });
      const version: VersionItem = { id: `${Date.now()}`, version: `1.${versions.length}`, date: new Date().toISOString(), author: 'Utilisateur', comment, xml: result.xml || '' };
      setVersions(previous => { const next = [version, ...previous].slice(0, 8); localStorage.setItem(versionStorageKey, JSON.stringify(next)); return next; });
    } catch { showUserMessage('Version impossible a creer.'); }
  };

  const openDiagram = async (xml: string) => {
    if (!modelerRef.current) return;
    setIsLoading(true);
    try { await modelerRef.current.importXML(xml); fitViewportWithLeftGutter(); setSaveStatus('saved'); setSelectedElement(null); }
    catch { showUserMessage('Import invalide : le fichier BPMN ne peut pas etre ouvert.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (!containerRef.current || !window.BpmnJS) return;
    const modeler = new window.BpmnJS({ container: containerRef.current });
    modelerRef.current = modeler;
    openDiagram(localStorage.getItem(storageKey) || selectedProcess?.diagramXML || initialDiagram);

    const eventBus = modeler.get('eventBus');
    eventBus.on('selection.changed', (event: any) => setSelectedElement(event.newSelection?.[0] || null));
    eventBus.on('commandStack.changed', () => {
      setSaveStatus('dirty');
      window.clearTimeout(autosaveTimerRef.current || undefined);
      autosaveTimerRef.current = window.setTimeout(() => saveLocalDraft(), 1200);
    });

    const contextPadProvider = modeler.get('contextPadProvider');
    const originalEntries = contextPadProvider.getContextPadEntries;
    contextPadProvider.getContextPadEntries = function(element: any) {
      const entries = originalEntries.call(this, element);
      if (element.type && !element.type.includes('Label')) {
        entries['color-picker'] = { group: 'edit', className: 'bpmn-icon-color-picker', title: 'Changer la couleur', action: { click: (event: any, target: any) => showColorPickerMenu(event, target) } };
      }
      return entries;
    };

    const savedVersions = localStorage.getItem(versionStorageKey);
    if (savedVersions) { try { setVersions(JSON.parse(savedVersions)); } catch { setVersions([]); } }
    const interval = window.setInterval(() => saveLocalDraft(), 30000);
    return () => { window.clearInterval(interval); window.clearTimeout(autosaveTimerRef.current || undefined); modeler.destroy(); modelerRef.current = null; };
  }, [selectedProcess?.id]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!modelerRef.current) return;
      const key = event.key.toLowerCase();
      if (event.ctrlKey && key === 's') { event.preventDefault(); saveProcessDiagram(); }
      if (event.ctrlKey && key === 'o') { event.preventDefault(); fileInputRef.current?.click(); }
      if (event.ctrlKey && key === 'e') { event.preventDefault(); exportSVG(); }
      if (event.key === 'Delete') deleteSelection();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [selectedProcess, versions]);

  const showColorPickerMenu = (event: any, element: any) => {
    modelerRef.current?.get('contextPad')?.close();
    const x = event.originalEvent?.clientX || event.clientX || 0;
    const y = event.originalEvent?.clientY || event.clientY || 0;
    setColorPicker({ visible: true, x: x + 10, y: y - 10, element });
  };

  const applyColor = (color: { stroke: string; fill: string }) => {
    if (!modelerRef.current || !colorPicker.element) return;
    try { modelerRef.current.get('modeling').setColor([colorPicker.element], color); setColorPicker({ visible: false, x: 0, y: 0, element: null }); setSaveStatus('dirty'); }
    catch { showUserMessage('Couleur impossible a appliquer.'); }
  };

  const saveProcessDiagram = async () => {
    if (!modelerRef.current) return;
    try {
      setSaveStatus('saving');
      const result = await modelerRef.current.saveXML({ format: true });
      localStorage.setItem(storageKey, result.xml || '');
      if (selectedProcess && onSaveProcessDiagram) onSaveProcessDiagram(selectedProcess.id, result.xml || '');
      setLastSavedTime(new Date()); setSaveStatus('saved'); await createVersion('Sauvegarde du diagramme'); showUserMessage('Diagramme sauvegarde.');
    } catch { setSaveStatus('error'); showUserMessage('Sauvegarde impossible.'); }
  };

  const saveDiagram = async () => {
    try { const result = await modelerRef.current.saveXML({ format: true }); downloadBlob(`${fileBaseName}.bpmn`, result.xml || '', 'application/xml;charset=utf-8'); showUserMessage('Fichier BPMN telecharge.'); }
    catch { showUserMessage('Export BPMN impossible.'); }
  };

  const exportSVG = async () => {
    try { const result = await modelerRef.current.saveSVG(); downloadBlob(`${fileBaseName}.svg`, result.svg || '', 'image/svg+xml;charset=utf-8'); showUserMessage('SVG exporte.'); }
    catch { showUserMessage('Export SVG impossible.'); }
  };

  const exportPNG = async () => {
    try {
      const result = await modelerRef.current.saveSVG();
      const svgUrl = URL.createObjectURL(new Blob([result.svg || ''], { type: 'image/svg+xml;charset=utf-8' }));
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas'); canvas.width = Math.max(1400, image.width || 1400); canvas.height = Math.max(900, image.height || 900);
        const context = canvas.getContext('2d'); if (!context) return;
        context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0);
        canvas.toBlob(blob => { if (!blob) return; const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${fileBaseName}.png`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); URL.revokeObjectURL(svgUrl); showUserMessage('PNG exporte.'); }, 'image/png');
      };
      image.onerror = () => { URL.revokeObjectURL(svgUrl); showUserMessage('Export PNG impossible.'); };
      image.src = svgUrl;
    } catch { showUserMessage('Export PNG impossible.'); }
  };

  const exportPDF = async () => {
    try {
      const result = await modelerRef.current.saveSVG(); const popup = window.open('', '_blank');
      if (!popup) { showUserMessage('PDF impossible : autorisez les popups.'); return; }
      popup.document.write(`<html><head><title>${fileBaseName}</title></head><body style="margin:0;padding:24px;font-family:Arial"><h2>${diagramName}</h2>${result.svg}<script>window.print();</script></body></html>`);
      popup.document.close();
    } catch { showUserMessage('Export PDF impossible.'); }
  };

  const importDiagram = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (e) => openDiagram(e.target?.result as string); reader.onerror = () => showUserMessage('Lecture du fichier impossible.'); reader.readAsText(file); event.target.value = '';
  };

  const triggerEditorAction = (action: string, fallback?: () => void) => {
    try { const editorActions = modelerRef.current?.get('editorActions', false); if (editorActions) { editorActions.trigger(action); return; } }
    catch { /* bpmn-js build without editorActions */ }
    fallback?.();
  };
  const undo = () => getCommandStack()?.undo();
  const redo = () => getCommandStack()?.redo();
  const copySelection = () => triggerEditorAction('copy', () => showUserMessage('Copie disponible via Ctrl+C dans le canvas.'));
  const pasteSelection = () => triggerEditorAction('paste', () => showUserMessage('Collage disponible via Ctrl+V dans le canvas.'));
  const deleteSelection = () => { const selection = modelerRef.current?.get('selection')?.get() || []; if (selection.length) modelerRef.current.get('modeling').removeElements(selection); };
  const alignSelection = (alignment: 'left' | 'center' | 'right') => {
    const selection = modelerRef.current?.get('selection')?.get() || [];
    if (selection.length < 2) { showUserMessage('Selectionnez au moins deux elements a aligner.'); return; }
    try { modelerRef.current.get('modeling').alignElements(selection, alignment); } catch { showUserMessage('Alignement non disponible pour cette selection.'); }
  };
  const distributeSelection = (axis: 'horizontal' | 'vertical') => showUserMessage(`Distribution ${axis === 'horizontal' ? 'horizontale' : 'verticale'} preparee pour une future extension.`);
  const zoomIn = () => { const canvas = getCanvas(); if (canvas) canvas.zoom(canvas.zoom() * 1.2); };
  const zoomOut = () => { const canvas = getCanvas(); if (canvas) canvas.zoom(canvas.zoom() * 0.8); };
  const resetZoom = () => getCanvas()?.zoom(1);
  const fitViewport = () => fitViewportWithLeftGutter();

  const validateDiagram = () => {
    if (!modelerRef.current) return;
    const registry = modelerRef.current.get('elementRegistry');
    const elements = registry.getAll().filter((element: any) => element.type?.startsWith('bpmn:'));
    const flowNodes = elements.filter((element: any) => !element.type.includes('SequenceFlow') && !element.type.includes('Label') && element.businessObject);
    const sequenceFlows = elements.filter((element: any) => element.type === 'bpmn:SequenceFlow');
    const next: ValidationItem[] = [];
    if (!flowNodes.length) next.push({ id: 'empty', level: 'error', message: 'Le diagramme est vide.' });
    if (!flowNodes.some((element: any) => element.type === 'bpmn:StartEvent')) next.push({ id: 'start', level: 'error', message: 'Le diagramme ne contient aucun evenement de debut.' });
    if (!flowNodes.some((element: any) => element.type === 'bpmn:EndEvent')) next.push({ id: 'end', level: 'error', message: 'Le diagramme ne contient aucun evenement de fin.' });
    flowNodes.filter((element: any) => element.type.includes('Task') && !element.businessObject?.name).forEach((element: any) => next.push({ id: `task-${element.id}`, level: 'warning', message: `La tache ${element.id} n'a pas de libelle.` }));
    sequenceFlows.filter((flow: any) => !flow.source || !flow.target).forEach((flow: any) => next.push({ id: `flow-${flow.id}`, level: 'error', message: `Le flux ${flow.id} n'est pas correctement connecte.` }));
    flowNodes.filter((element: any) => element.type.includes('Gateway')).forEach((gateway: any) => { const outgoing = gateway.outgoing || []; if (outgoing.length > 1 && outgoing.some((flow: any) => !flow.businessObject?.conditionExpression)) next.push({ id: `gateway-${gateway.id}`, level: 'warning', message: `La gateway ${gateway.businessObject?.name || gateway.id} contient des sorties sans condition.` }); });
    flowNodes.filter((element: any) => !element.type.includes('StartEvent') && !element.type.includes('EndEvent')).filter((element: any) => (element.incoming || []).length === 0 && (element.outgoing || []).length === 0).forEach((element: any) => next.push({ id: `isolated-${element.id}`, level: 'suggestion', message: `L'element ${element.businessObject?.name || element.id} semble isole.` }));
    if (!next.length) next.push({ id: 'valid', level: 'suggestion', message: 'Le diagramme ne contient pas de probleme bloquant detecte.' });
    setValidationResults(next); setValidationOpen(true);
  };

  const restoreVersion = (version: VersionItem) => { openDiagram(version.xml); showUserMessage(`Version ${version.version} restauree localement.`); };
  const updateElementName = (value: string) => { if (!selectedElement || !modelerRef.current) return; modelerRef.current.get('modeling').updateLabel(selectedElement, value); setSelectedElement({ ...selectedElement, businessObject: { ...selectedElement.businessObject, name: value } }); };
  const updateMetadata = (field: keyof Metadata, value: string) => { if (!selectedElement) return; setMetadataByElement(previous => ({ ...previous, [selectedElement.id]: { ...(previous[selectedElement.id] || emptyMetadata), [field]: value } })); setSaveStatus('dirty'); };

  const saveStatusLabel = { saved: 'Sauvegarde locale OK', dirty: 'Non sauvegarde', saving: 'Sauvegarde en cours', error: 'Erreur de sauvegarde' }[saveStatus];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[90]' : 'min-h-screen'} flex flex-col bg-slate-50 dark:bg-[#00030a]`}>
      <header className="border-b border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-[#0b1424] dark:bg-[#030812]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">ÉDITEUR</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-[#15243a] dark:bg-[#060d19] dark:text-slate-300">{diagramStatus}</span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${saveStatus === 'saved' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : saveStatus === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>{saveStatusLabel}</span>
            </div>
            <h1 className="mt-2 truncate text-xl font-bold text-slate-950 dark:text-slate-100">{diagramName}</h1>
            <p className="mt-1 text-sm text-slate-500">Dernière sauvegarde : {lastSavedTime ? lastSavedTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'aucune sauvegarde dans cette session'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedProcess && onGoBack && <button onClick={onGoBack} className="app-button-secondary"><GitBranch className="h-4 w-4" />Retour au processus associe</button>}
            <button onClick={() => fileInputRef.current?.click()} className="app-button-secondary" title="Ctrl + O"><Upload className="h-4 w-4" />Importer</button>
            <button onClick={saveProcessDiagram} className="app-button-primary" title="Ctrl + S"><Database className="h-4 w-4" />Sauvegarder</button>
            <button onClick={saveDiagram} className="app-button-secondary"><Save className="h-4 w-4" />Télécharger BPMN</button>
            <button onClick={exportSVG} className="app-button-secondary" title="Ctrl + E"><Download className="h-4 w-4" />SVG</button>
            <button onClick={exportPNG} className="app-button-secondary"><Download className="h-4 w-4" />PNG</button>
            <button onClick={exportPDF} className="app-button-secondary"><FileDown className="h-4 w-4" />PDF</button>
            <button onClick={validateDiagram} className="app-button-secondary"><CheckCircle className="h-4 w-4" />Valider</button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="app-button-secondary">{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}{isFullscreen ? 'Quitter' : 'Plein écran'}</button>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-2 dark:border-[#0b1424] dark:bg-[#030812]">
        <div className="flex flex-wrap items-center gap-1.5">
          <ToolbarButton title="Annuler - Ctrl+Z" icon={Undo2} onClick={undo} /><ToolbarButton title="Retablir - Ctrl+Y" icon={RotateCcw} onClick={redo} /><ToolbarDivider />
          <ToolbarButton title="Copier - Ctrl+C" icon={Copy} onClick={copySelection} /><ToolbarButton title="Coller - Ctrl+V" icon={Clipboard} onClick={pasteSelection} /><ToolbarButton title="Supprimer - Suppr" icon={Trash2} onClick={deleteSelection} /><ToolbarDivider />
          <ToolbarButton title="Aligner a gauche" icon={AlignLeft} onClick={() => alignSelection('left')} /><ToolbarButton title="Aligner au centre" icon={AlignCenter} onClick={() => alignSelection('center')} /><ToolbarButton title="Aligner a droite" icon={AlignRight} onClick={() => alignSelection('right')} />
          <ToolbarButton title="Distribuer horizontalement" icon={Scissors} onClick={() => distributeSelection('horizontal')} /><ToolbarButton title="Distribuer verticalement" icon={Wand2} onClick={() => distributeSelection('vertical')} /><ToolbarDivider />
          <ToolbarButton title="Zoom +" icon={ZoomIn} onClick={zoomIn} /><ToolbarButton title="Zoom -" icon={ZoomOut} onClick={zoomOut} /><ToolbarButton title="Zoom 100%" icon={RefreshCw} onClick={resetZoom} /><ToolbarButton title="Ajuster a l'ecran" icon={Expand} onClick={fitViewport} />
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500"><span>Raccourcis : Ctrl+S, Ctrl+O, Ctrl+E, Suppr</span><button className="app-button-secondary px-2 py-2" onClick={() => setPropertiesCollapsed(!propertiesCollapsed)}>{propertiesCollapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}</button></div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_auto] bg-slate-100 dark:bg-[#00030a]">
        <main className="relative min-w-0 overflow-hidden">
          {isLoading && <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-[#030812]/80"><div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-xl dark:border-[#15243a] dark:bg-[#030812]"><RefreshCw className="h-5 w-5 animate-spin text-blue-600" /><span className="font-semibold text-slate-700 dark:text-slate-200">Initialisation du diagramme...</span></div></div>}
          <div ref={containerRef} className="h-full min-h-[620px] w-full bg-white dark:bg-[#030812]" />
          <div className="absolute bottom-5 right-5 w-48 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl dark:border-[#15243a] dark:bg-[#030812]/95">
            <div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">Mini-map</span><button onClick={fitViewport} className="text-xs font-semibold text-blue-600">Recentrer</button></div>
            <div className="relative h-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-[#15243a] dark:bg-[#00030a]"><div className="absolute left-4 top-5 h-4 w-10 rounded bg-blue-200" /><div className="absolute left-16 top-10 h-4 w-12 rounded bg-emerald-200" /><div className="absolute right-5 top-6 h-4 w-8 rounded bg-purple-200" /><div className="absolute inset-3 rounded border-2 border-blue-500/60" /></div>
          </div>
        </main>
        {!propertiesCollapsed && <aside className="w-[360px] border-l border-slate-200 bg-white p-4 dark:border-[#0b1424] dark:bg-[#030812]"><PropertiesPanel selectedElement={selectedElement} selectedMetadata={selectedMetadata} diagramName={diagramName} selectedProcess={selectedProcess} lastSavedTime={lastSavedTime} onNameChange={updateElementName} onMetadataChange={updateMetadata} validationResults={validationResults} validationOpen={validationOpen} setValidationOpen={setValidationOpen} versions={versions} versionsOpen={versionsOpen} setVersionsOpen={setVersionsOpen} onRestoreVersion={restoreVersion} /></aside>}
      </div>

      <input ref={fileInputRef} type="file" accept=".bpmn,.xml" onChange={importDiagram} className="hidden" />
      {message && <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xl dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-100">{message}</div>}
      {colorPicker.visible && <><div className="fixed inset-0 z-40" onClick={() => setColorPicker({ visible: false, x: 0, y: 0, element: null })} /><div className="fixed z-50 min-w-[280px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-[#15243a] dark:bg-[#030812]" style={{ left: `${Math.min(colorPicker.x, window.innerWidth - 300)}px`, top: `${Math.max(colorPicker.y - 200, 20)}px` }}><div className="mb-4 flex items-center gap-2"><Palette className="h-5 w-5 text-purple-600" /><h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Choisir une couleur</h3></div><div className="grid grid-cols-4 gap-3">{colors.map(color => <button key={color.name} onClick={() => applyColor(color)} className="h-12 w-12 rounded-lg border-2 transition hover:scale-105 hover:shadow-lg" style={{ borderColor: color.stroke, background: `linear-gradient(135deg, ${color.fill} 0%, ${color.stroke} 100%)` }} title={color.name} />)}</div></div></>}
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
    </div>
  );
};

const ToolbarButton: React.FC<{ title: string; icon: React.ElementType; onClick: () => void }> = ({ title, icon: Icon, onClick }) => <button type="button" onClick={onClick} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]" title={title}><Icon className="h-4 w-4" /></button>;
const ToolbarDivider = () => <span className="mx-1 h-6 w-px bg-slate-200 dark:bg-[#15243a]" />;

interface PropertiesPanelProps {
  selectedElement: any | null; selectedMetadata: Metadata; diagramName: string; selectedProcess?: Process | null; lastSavedTime: Date | null;
  onNameChange: (value: string) => void; onMetadataChange: (field: keyof Metadata, value: string) => void;
  validationResults: ValidationItem[]; validationOpen: boolean; setValidationOpen: (open: boolean) => void;
  versions: VersionItem[]; versionsOpen: boolean; setVersionsOpen: (open: boolean) => void; onRestoreVersion: (version: VersionItem) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElement, selectedMetadata, diagramName, selectedProcess, lastSavedTime, onNameChange, onMetadataChange, validationResults, validationOpen, setValidationOpen, versions, versionsOpen, setVersionsOpen, onRestoreVersion }) => (
  <div className="flex h-full flex-col gap-4 overflow-y-auto">
    <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Panneau de proprietes</p><h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-slate-100">{selectedElement ? 'Element BPMN' : 'Diagramme'}</h2></div>
    {!selectedElement ? <div className="space-y-3 rounded-xl border border-slate-100 p-4 dark:border-[#0b1424]"><PropertyRead label="Nom du diagramme" value={diagramName} /><PropertyRead label="Processus associe" value={selectedProcess?.libelleProcessMetier || 'Aucun processus associe'} /><PropertyRead label="Version" value="1.2" /><PropertyRead label="Auteur" value="Utilisateur" /><PropertyRead label="Date de creation" value={selectedProcess?.dateCreationProcessus || new Date().toISOString().split('T')[0]} /><PropertyRead label="Dernière sauvegarde" value={lastSavedTime ? lastSavedTime.toLocaleString('fr-FR') : 'Aucune'} /></div> : <div className="space-y-3 rounded-xl border border-slate-100 p-4 dark:border-[#0b1424]"><PropertyRead label="ID technique" value={selectedElement.id} /><PropertyRead label="Type BPMN" value={selectedElement.type?.replace('bpmn:', '') || 'Element'} /><PropertyInput label="Nom affiche" value={selectedElement.businessObject?.name || ''} onChange={onNameChange} /><PropertyTextarea label="Description" value={selectedMetadata.description} onChange={(value) => onMetadataChange('description', value)} /><PropertyInput label="Responsable" value={selectedMetadata.owner} onChange={(value) => onMetadataChange('owner', value)} /><PropertyInput label="Duree estimee" value={selectedMetadata.duration} onChange={(value) => onMetadataChange('duration', value)} /><PropertyInput label="Systeme utilise" value={selectedMetadata.system} onChange={(value) => onMetadataChange('system', value)} /><PropertyTextarea label="Regles metier" value={selectedMetadata.rules} onChange={(value) => onMetadataChange('rules', value)} /><PropertyTextarea label="Risques associes" value={selectedMetadata.risks} onChange={(value) => onMetadataChange('risks', value)} /><PropertyTextarea label="Documentation liee" value={selectedMetadata.documentation} onChange={(value) => onMetadataChange('documentation', value)} /></div>}
    <PanelSection title="Validation BPMN" open={validationOpen} setOpen={setValidationOpen}>{validationResults.length === 0 ? <EmptyPanel icon={Info} text="Lancez la validation pour voir les erreurs, avertissements et suggestions." /> : <div className="space-y-2">{validationResults.map(item => <div key={item.id} className={`rounded-lg border p-3 text-sm ${item.level === 'error' ? 'border-red-200 bg-red-50 text-red-700' : item.level === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}><div className="flex gap-2">{item.level === 'error' ? <XCircle className="h-4 w-4" /> : item.level === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}<span>{item.message}</span></div></div>)}</div>}</PanelSection>
    <PanelSection title="Versions" open={versionsOpen} setOpen={setVersionsOpen}>{versions.length === 0 ? <EmptyPanel icon={FileText} text="Aucune version sauvegardee pour le moment." /> : <div className="space-y-2">{versions.map(version => <div key={version.id} className="rounded-lg border border-slate-100 p-3 dark:border-[#0b1424]"><div className="flex items-center justify-between gap-2"><p className="font-bold text-slate-950 dark:text-slate-100">Version {version.version}</p><button onClick={() => onRestoreVersion(version)} className="text-xs font-semibold text-blue-600">Restaurer</button></div><p className="mt-1 text-xs text-slate-500">{new Date(version.date).toLocaleString('fr-FR')}</p><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{version.comment}</p></div>)}</div>}</PanelSection>
  </div>
);

const PropertyRead: React.FC<{ label: string; value: string }> = ({ label, value }) => <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-100">{value}</p></div>;
const PropertyInput: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-100" /></label>;
const PropertyTextarea: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-100" /></label>;
const PanelSection: React.FC<{ title: string; open: boolean; setOpen: (open: boolean) => void; children: React.ReactNode }> = ({ title, open, setOpen, children }) => <section className="rounded-xl border border-slate-100 dark:border-[#0b1424]"><button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left font-bold text-slate-950 dark:text-slate-100">{title}<span className="text-xs text-slate-500">{open ? 'Masquer' : 'Afficher'}</span></button>{open && <div className="border-t border-slate-100 p-3 dark:border-[#0b1424]">{children}</div>}</section>;
const EmptyPanel: React.FC<{ icon: React.ElementType; text: string }> = ({ icon: Icon, text }) => <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-[#15243a]"><Icon className="mx-auto mb-2 h-5 w-5" />{text}</div>;

const editorStyles = `
  .bpmn-icon-color-picker { position: relative; display: flex !important; align-items: center !important; justify-content: center !important; width: 32px !important; height: 32px !important; }
  .bpmn-icon-color-picker:before { content: "COLOR"; font-size: 8px; font-weight: 800; letter-spacing: 0; color: #7e22ce; }
  .djs-palette { top: 18px !important; left: 18px !important; width: 56px !important; border: 1px solid #dbe5f2 !important; border-radius: 14px !important; background: rgba(255,255,255,.96) !important; box-shadow: 0 18px 35px rgba(15,23,42,.12) !important; overflow: hidden !important; }
  .djs-palette .separator { margin: 7px 10px !important; border-color: #e2e8f0 !important; }
  .djs-palette .entry, .djs-context-pad .entry { display: flex !important; align-items: center !important; justify-content: center !important; width: 42px !important; height: 42px !important; margin: 6px !important; border-radius: 12px !important; color: #475569 !important; transition: background-color 140ms ease, color 140ms ease, box-shadow 140ms ease !important; }
  .djs-palette .entry:hover, .djs-context-pad .entry:hover { background: #f1f5f9 !important; color: #0f172a !important; box-shadow: inset 0 0 0 1px #cbd5e1 !important; }
  .djs-palette .entry:before, .djs-context-pad .entry:before { font-size: 19px !important; line-height: 1 !important; }
  .djs-context-pad, .djs-popup, .djs-popup-header, .djs-popup-body { border-color: #dbe5f2 !important; border-radius: 14px !important; background: #ffffff !important; box-shadow: 0 18px 35px rgba(15,23,42,.12) !important; }
  .djs-popup .entry { border-radius: 10px !important; color: #475569 !important; }
  .djs-popup .entry:hover { background: #f1f5f9 !important; color: #0f172a !important; }
`;

export default BpmnEditor;
