'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { Calendar } from 'lucide-react';
import {
  formatDDMMYYYY,
  formatIndianShort,
  parseIndianDateToIso,
} from '@/lib/date-utils';

export interface IndianDateInputProps {
  id?: string;
  name?: string;
  value: string; // ISO date 'YYYY-MM-DD'
  onChange: (isoDate: string) => void;
  min?: string; // ISO date 'YYYY-MM-DD'
  max?: string; // ISO date 'YYYY-MM-DD'
  className?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  showBadge?: boolean;
  ariaLabel?: string;
}

export default function IndianDateInput({
  id,
  name,
  value,
  onChange,
  min,
  max,
  className = '',
  disabled = false,
  required = false,
  placeholder = 'DD/MM/YYYY',
  showBadge = true,
  ariaLabel,
}: IndianDateInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [displayValue, setDisplayValue] = useState(() => formatDDMMYYYY(value));
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  // Sync display text when external value prop changes
  useEffect(() => {
    setDisplayValue(formatDDMMYYYY(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Auto-format convenience: if user enters 8 raw digits (e.g. 15062026), format to 15/06/2026
    const digitsOnly = input.replace(/\D/g, '');
    if (digitsOnly.length === 8 && !input.includes('/') && !input.includes('-')) {
      input = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
    }

    setDisplayValue(input);

    const parsedIso = parseIndianDateToIso(input);
    if (parsedIso) {
      onChange(parsedIso);
    }
  };

  const handleBlur = () => {
    const parsedIso = parseIndianDateToIso(displayValue);
    if (parsedIso) {
      setDisplayValue(formatDDMMYYYY(parsedIso));
      if (parsedIso !== value) {
        onChange(parsedIso);
      }
    } else if (value) {
      // Revert back to the last valid state
      setDisplayValue(formatDDMMYYYY(value));
    } else {
      setDisplayValue('');
    }
  };

  const handleCalendarClick = () => {
    if (hiddenDateRef.current) {
      try {
        if (typeof hiddenDateRef.current.showPicker === 'function') {
          hiddenDateRef.current.showPicker();
        } else {
          hiddenDateRef.current.focus();
          hiddenDateRef.current.click();
        }
      } catch {
        // Fallback: the overlay transparent input handles the click directly
      }
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIso = e.target.value;
    if (newIso) {
      onChange(newIso);
      setDisplayValue(formatDDMMYYYY(newIso));
    }
  };

  const badgeText = showBadge ? formatIndianShort(value) : '';

  return (
    <div
      className={`relative flex items-center w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${
        disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''
      } ${className}`}
    >
      {/* Primary visible input (Always displays DD/MM/YYYY) */}
      <input
        id={inputId}
        name={name}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-label={ariaLabel || 'Date in DD/MM/YYYY format'}
        maxLength={10}
        className="w-full bg-transparent px-3.5 py-2.5 text-sm font-semibold tracking-wide placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
      />

      {/* Right Controls: Indian Date Badge + Calendar Picker Button */}
      <div className="flex items-center gap-1.5 pr-2.5 shrink-0 pointer-events-auto">
        {badgeText && (
          <span
            className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/40 px-2 py-0.5 rounded-md select-none whitespace-nowrap hidden sm:inline"
            title={`Selected: ${badgeText}`}
          >
            {badgeText}
          </span>
        )}

        {/* Calendar Picker Trigger with full cross-device fallback */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors">
          <button
            type="button"
            onClick={handleCalendarClick}
            disabled={disabled}
            tabIndex={-1}
            aria-label="Open Calendar Picker"
            className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center w-full h-full pointer-events-none"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Native HTML5 date input transparently layered over the button for 100% native picker support */}
          <input
            ref={hiddenDateRef}
            type="date"
            value={value || ''}
            min={min}
            max={max}
            disabled={disabled}
            onChange={handleNativeDateChange}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
