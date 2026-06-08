import React, { useState, useEffect } from 'react';
import { Settings, Tag, FileText, Users, Clock, Info, Building, User } from 'lucide-react';
import { Process } from '../types/Process';

interface PropertiesPanelProps {
  selectedElement: any;
  modeler: any;
  selectedProcess?: Process | null;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElement, modeler, selectedProcess }) => {
  const [properties, setProperties] = useState({
    id: '',
    name: '',
    type: '',
    documentation: '',
    assignee: '',
    candidateGroups: '',
    dueDate: ''
  });

  useEffect(() => {
    if (selectedElement && selectedElement.businessObject) {
      const bo = selectedElement.businessObject;
      setProperties({
        id: bo.id || '',
        name: bo.name || '',
        type: selectedElement.type || '',
        documentation: bo.documentation?.[0]?.text || '',
        assignee: bo.assignee || '',
        candidateGroups: bo.candidateGroups || '',
        dueDate: bo.dueDate || ''
      });
    } else {
      setProperties({
        id: '',
        name: '',
        type: '',
        documentation: '',
        assignee: '',
        candidateGroups: '',
        dueDate: ''
      });
    }
  }, [selectedElement]);

  const updateProperty = (key: string, value: string) => {
    if (!selectedElement || !modeler) return;

    const modeling = modeler.get('modeling');
    const updateObject: any = {};
    
    if (key === 'name') {
      updateObject.name = value;
    } else if (key === 'documentation') {
      updateObject.documentation = value ? [{ text: value }] : undefined;
    } else {
      updateObject[key] = value;
    }

    modeling.updateProperties(selectedElement, updateObject);
    
    setProperties(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!selectedElement && !selectedProcess) {
    return (
      <div className="h-full p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
          <div className="p-2 rounded-lg bg-slate-900">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Propriétés</h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">Aucun élément sélectionné</p>
            <p className="text-sm">Cliquez sur un élément du diagramme pour voir ses propriétés</p>
          </div>
        </div>
      </div>
    );
  }

  const getElementTypeColor = (type: string) => {
    if (type.includes('Task')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type.includes('Gateway')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (type.includes('Event')) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="h-full flex flex-col">
      {/* En-tête */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-slate-900">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Propriétés</h3>
        </div>
        
        {/* Badge du type d'élément ou processus */}
        <div className="flex items-center space-x-2">
          {selectedElement ? (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getElementTypeColor(properties.type)}`}>
              {properties.type.replace('bpmn:', '')}
            </span>
          ) : selectedProcess && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
              Processus {selectedProcess.codeProcessus}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Informations du processus si disponible */}
        {selectedProcess && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
              <Building className="w-4 h-4 mr-2 text-purple-500" />
              Informations du processus
            </h4>
            
            <div className="bg-purple-50 rounded-lg p-4 space-y-3">
              <div>
                <span className="text-xs font-medium text-gray-500">Code processus</span>
                <p className="text-sm font-medium text-gray-900">{selectedProcess.codeProcessus}</p>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">Libellé</span>
                <p className="text-sm font-medium text-gray-900">{selectedProcess.libelleProcessMetier}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-medium text-gray-500">Direction</span>
                  <p className="text-sm text-gray-700">{selectedProcess.direction}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Domaine</span>
                  <p className="text-sm text-gray-700">{selectedProcess.domaine}</p>
                </div>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">Owner</span>
                <p className="text-sm text-gray-700">{selectedProcess.ownerProcessMetier}</p>
              </div>
            </div>
          </div>
        )}

        {/* Propriétés de l'élément sélectionné */}
        {selectedElement && (
          <>
            {/* Propriétés de base */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-blue-500" />
                Propriétés de base
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identifiant
                  </label>
                  <input
                    type="text"
                    value={properties.id}
                    onChange={(e) => updateProperty('id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={properties.name}
                    onChange={(e) => updateProperty('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Entrez le nom de l'élément"
                  />
                </div>
              </div>
            </div>

            {/* Documentation */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-green-500" />
                Documentation
              </h4>
              
              <textarea
                value={properties.documentation}
                onChange={(e) => updateProperty('documentation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={4}
                placeholder="Ajoutez une description ou des notes..."
              />
            </div>

            {/* Propriétés spécifiques aux tâches */}
            {properties.type.includes('Task') && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  Attribution
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigné à
                    </label>
                    <input
                      type="text"
                      value={properties.assignee}
                      onChange={(e) => updateProperty('assignee', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nom de l'utilisateur"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Groupes candidats
                    </label>
                    <input
                      type="text"
                      value={properties.candidateGroups}
                      onChange={(e) => updateProperty('candidateGroups', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="groupe1, groupe2, ..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Date d'échéance
                    </label>
                    <input
                      type="text"
                      value={properties.dueDate}
                      onChange={(e) => updateProperty('dueDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Expression de date"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Informations sur l'élément */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Informations</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium text-gray-700">{properties.type}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-mono text-gray-700 truncate ml-2">{properties.id}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;