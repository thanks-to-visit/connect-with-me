import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { Country, COUNTRIES } from '../constants/countries';

interface CountrySelectProps {
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
  disabled?: boolean;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  selectedCountry,
  onSelectCountry,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const listboxId = useId();
  const labelId = useId();

  // Filter countries
  const query = searchQuery.trim().toLowerCase();
  const filteredCountries = COUNTRIES.filter((c) => {
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.dialCode.includes(query) ||
      `+${c.dialCode}`.includes(query)
    );
  });

  // Reset highlight index when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listboxRef.current && filteredCountries.length > 0) {
      const activeElement = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen, filteredCountries.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredCountries.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredCountries.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCountries[highlightedIndex]) {
        onSelectCountry(filteredCountries[highlightedIndex]);
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <span id={labelId} className="sr-only">
        Select country code
      </span>

      {/* Trigger Button */}
      <button
        type="button"
        id="country-selector-button"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className="h-11 px-3 flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-l-xl text-slate-800 text-sm font-medium hover:bg-slate-100 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none select-none" aria-hidden="true">
            {selectedCountry.flag}
          </span>
          <span
            className="text-[10px] font-bold px-1 py-0.5 rounded bg-slate-200 text-slate-700 tracking-wider"
            title={`ISO code: ${selectedCountry.code}`}
          >
            {selectedCountry.code}
          </span>
        </div>
        <span className="font-semibold text-slate-900">+{selectedCountry.dialCode}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100">
          {/* Search Field */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search country or code..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                aria-label="Search countries"
              />
            </div>
          </div>

          {/* Countries List */}
          <ul
            id={listboxId}
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            aria-label="Countries"
            className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50"
          >
            {filteredCountries.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500 text-center">No country found</li>
            ) : (
              filteredCountries.map((country, index) => {
                const isSelected = country.code === selectedCountry.code;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={`${country.code}-${country.dialCode}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectCountry(country);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                      isHighlighted ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                    } ${isSelected ? 'font-semibold text-emerald-800 bg-emerald-50/70' : ''}`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-base select-none shrink-0" aria-hidden="true">
                        {country.flag}
                      </span>
                      <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                        {country.code}
                      </span>
                      <span className="truncate">{country.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-slate-500">+{country.dialCode}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
