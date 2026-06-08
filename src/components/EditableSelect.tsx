import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';

interface EditableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onAddOption: (value: string) => void;
  onRemoveOption?: (value: string) => void;
  placeholder: string;
  label: string;
  error?: string;
  className?: string;
  allowCustom?: boolean;
}

const EditableSelect: React.FC<EditableSelectProps> = ({
  value,
  onChange,
  options,
  onAddOption,
  onRemoveOption,
  placeholder,
  label,
  error,
  className = "",
  allowCustom = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAddForm(false);
        setNewOptionValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleAddNewOption = () => {
    if (newOptionValue.trim()) {
      onAddOption(newOptionValue.trim());
      handleOptionSelect(newOptionValue.trim());
      setNewOptionValue('');
      setShowAddForm(false);
    }
  };

  const handleKeyDown = (e: React.KeyEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showAddForm) {
        handleAddNewOption();
      } else if (filteredOptions.length > 0) {
        handleOptionSelect(filteredOptions[0]);
      } else if (allowCustom && inputValue.trim()) {
        onAddOption(inputValue.trim());
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setShowAddForm(false);
      setNewOptionValue('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} *
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
            error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder={placeholder}
        />
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {/* Options existantes */}
          {filteredOptions.length > 0 && (
            <div className="py-1">
              {filteredOptions.map((option, index) => (
                <div key={index} className="group flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className="flex-1 text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {option}
                  </button>
                  {onRemoveOption && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveOption(option);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 mr-2 text-red-400 hover:text-red-600 transition-all"
                      title="Supprimer cette option"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Séparateur si il y a des options et qu'on peut ajouter */}
          {filteredOptions.length > 0 && allowCustom && (
            <div className="border-t border-gray-200"></div>
          )}

          {/* Formulaire d'ajout */}
          {allowCustom && (
            <div className="p-2">
              {!showAddForm ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(true);
                    setNewOptionValue(inputValue);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter "{inputValue}" à la liste</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newOptionValue}
                    onChange={(e) => setNewOptionValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewOption();
                      }
                    }}
                    placeholder="Nouvelle option..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleAddNewOption}
                      className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ajouter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewOptionValue('');
                      }}
                      className="flex-1 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message si aucune option */}
          {filteredOptions.length === 0 && !allowCustom && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Aucune option trouvée
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <X className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default EditableSelect;