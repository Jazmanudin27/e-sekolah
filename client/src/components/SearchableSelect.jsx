import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = '-- Pilih --',
  name,
  required = false,
  disabled = false,
  className = '',
  style = {},
  isClearable = false,
  zIndex = 999999
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Normalize options to [{ value, label, sublabel }]
  const normalizedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? String(opt.value) : '',
          label: opt.label !== undefined ? String(opt.label) : String(opt.value || ''),
          sublabel: opt.sublabel ? String(opt.sublabel) : ''
        };
      }
      return {
        value: String(opt),
        label: String(opt),
        sublabel: ''
      };
    });
  }, [options]);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find(opt => String(opt.value) === String(value));
  }, [normalizedOptions, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const q = searchTerm.toLowerCase();
    return normalizedOptions.filter(opt =>
      opt.label.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchTerm]);

  // Calculate fixed floating position to NEVER be clipped by modals or containers
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const updatePosition = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 220;
        const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

        setDropdownStyle({
          position: 'fixed',
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          top: openUpwards ? `${rect.top - 6}px` : `${rect.bottom + 4}px`,
          transform: openUpwards ? 'translateY(-100%)' : 'none',
          zIndex
        });
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, zIndex]);

  // Handle outside click & auto-focus search
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 40);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (optVal) => {
    if (onChange) {
      onChange({ target: { name, value: optVal } });
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({ target: { name, value: '' } });
    }
    setSearchTerm('');
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-select-container ${disabled ? 'disabled' : ''} ${className}`}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {/* Hidden input for form validation */}
      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
          value={value || ''}
          onChange={() => {}}
          required={required}
        />
      )}

      {/* TRIGGER BUTTON */}
      <div
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm('');
          }
        }}
        className={`searchable-select-trigger ${isOpen ? 'active' : ''}`}
      >
        <span className={`searchable-select-value ${!selectedOption ? 'placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isClearable && value && !disabled && (
            <span
              onClick={handleClear}
              className="searchable-select-clear-btn"
              title="Hapus Pilihan"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown
            size={14}
            className={`searchable-select-chevron ${isOpen ? 'open' : ''}`}
          />
        </div>
      </div>

      {/* FLOATING DROPDOWN MENU (FIXED POSITIONED SO NEVER CLIPPED) */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="searchable-select-dropdown"
          style={{ ...dropdownStyle }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* SEARCH INPUT BAR */}
          <div className="searchable-select-search-wrap">
            <Search size={13} className="searchable-select-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="searchable-select-search-input"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                } else if (e.key === 'Enter' && filteredOptions.length > 0) {
                  e.preventDefault();
                  handleSelect(filteredOptions[0].value);
                }
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="searchable-select-search-clear"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* OPTIONS LIST */}
          <div className="searchable-select-options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value || opt.label}
                    onClick={() => handleSelect(opt.value)}
                    className={`searchable-select-option ${isSelected ? 'selected' : ''}`}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="searchable-select-option-label">{opt.label}</div>
                      {opt.sublabel && (
                        <div className="searchable-select-option-sublabel">{opt.sublabel}</div>
                      )}
                    </div>
                    {isSelected && <Check size={14} className="searchable-select-check-icon" />}
                  </div>
                );
              })
            ) : (
              <div className="searchable-select-no-options">
                Data tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
