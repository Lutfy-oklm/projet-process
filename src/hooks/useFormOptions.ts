import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface FormOptions {
  directions: string[];
  domaines: string[];
  macroActivites: string[];
}

const defaultOptions: FormOptions = {
  directions: [
    'Direction Commerciale',
    'Direction des Risques',
    'Direction IT',
    'Direction Opérationnelle',
    'Direction Juridique',
    'Direction RH'
  ],
  domaines: [
    'Relation Client',
    'Conformité',
    'Système d\'Information',
    'Back Office',
    'Produits',
    'Ressources Humaines'
  ],
  macroActivites: [
    'Onboarding',
    'Contrôle',
    'Support',
    'Traitement',
    'Vente',
    'Formation'
  ]
};

export const useFormOptions = () => {
  const [options, setOptions] = useLocalStorage<FormOptions>('bpmn-form-options', defaultOptions);

  const addOption = (field: keyof FormOptions, value: string) => {
    if (!value.trim()) return;
    
    const trimmedValue = value.trim();
    const currentOptions = options[field];
    
    // Vérifier si la valeur n'existe pas déjà (insensible à la casse)
    const exists = currentOptions.some(option => 
      option.toLowerCase() === trimmedValue.toLowerCase()
    );
    
    if (!exists) {
      setOptions(prev => ({
        ...prev,
        [field]: [...prev[field], trimmedValue].sort()
      }));
    }
  };

  const removeOption = (field: keyof FormOptions, value: string) => {
    setOptions(prev => ({
      ...prev,
      [field]: prev[field].filter(option => option !== value)
    }));
  };

  const resetOptions = () => {
    setOptions(defaultOptions);
  };

  return {
    options,
    addOption,
    removeOption,
    resetOptions
  };
};
