'use client';

import { useState } from 'react';

export type TimeRange = '1d' | '3d' | '7d' | '14d' | '30d';

interface TimeRangePickerProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  className?: string;
}

export const TIME_RANGE_OPTIONS = [
  { key: '1d' as TimeRange, label: '1日', days: 1 },
  { key: '3d' as TimeRange, label: '3日間', days: 3 },
  { key: '7d' as TimeRange, label: '7日間', days: 7 },
  { key: '14d' as TimeRange, label: '14日間', days: 14 },
  { key: '30d' as TimeRange, label: '30日間', days: 30 },
];

export default function TimeRangePicker({ 
  selectedRange, 
  onRangeChange, 
  className = '' 
}: TimeRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = TIME_RANGE_OPTIONS.find(option => option.key === selectedRange);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-hacktion-gray border border-gray-600 text-white rounded hover:border-hacktion-orange transition-colors text-sm"
      >
        <span>📅</span>
        <span>{selectedOption?.label || '7日間'}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-full bg-hacktion-gray border border-gray-600 rounded shadow-lg z-20">
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  onRangeChange(option.key);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-hacktion-dark transition-colors ${
                  selectedRange === option.key 
                    ? 'bg-hacktion-orange text-white' 
                    : 'text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {selectedRange === option.key && (
                    <span className="text-white">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to get date range data
export function getDateRangeData<T extends { date: string }>(
  data: T[], 
  range: TimeRange
): T[] {
  const days = TIME_RANGE_OPTIONS.find(option => option.key === range)?.days || 7;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return data.filter(item => new Date(item.date) >= cutoffDate);
}