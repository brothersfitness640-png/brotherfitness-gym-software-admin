"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CustomDatePicker({
  value,
  onChange,
  label,
  placeholder = "Select date",
  className = "",
  min,
  max,
  disabled = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Parse initial state or current date
  const parsedDate = value ? new Date(value + "T00:00:00") : new Date();
  const [currentYear, setCurrentYear] = useState(
    isNaN(parsedDate.getTime()) ? new Date().getFullYear() : parsedDate.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState(
    isNaN(parsedDate.getTime()) ? new Date().getMonth() : parsedDate.getMonth()
  );

  // Update view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Format YYYY-MM-DD string to friendly string (e.g. 12 Aug 2026)
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

    const shortMonth = MONTH_NAMES[month]?.slice(0, 3) || "";
    return `${day} ${shortMonth} ${year}`;
  };

  // Month navigation
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate calendar days matrix
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = getDaysInMonth(currentYear, currentMonth);

  const selectDate = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${currentYear}-${mm}-${dd}`;

    if (min && dateStr < min) return;
    if (max && dateStr > max) return;

    onChange(dateStr);
    setIsOpen(false);
  };

  const selectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    setCurrentYear(yyyy);
    setCurrentMonth(today.getMonth());
    onChange(dateStr);
    setIsOpen(false);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          {label}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            : isOpen
            ? "border-amber-500 ring-2 ring-amber-500/20 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:border-amber-500/50"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span className="truncate">
            {value ? formatFriendlyDate(value) : <span className="text-zinc-400">{placeholder}</span>}
          </span>
        </div>

        {value && !disabled && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {/* Custom Calendar Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 p-3 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 text-xs font-bold">
              <span>{MONTH_NAMES[currentMonth]}</span>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                className="bg-transparent font-bold text-amber-600 dark:text-amber-400 focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i).map((yr) => (
                  <option key={yr} value={yr} className="dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES.map((d) => (
              <span key={d} className="text-[10px] font-bold text-zinc-400 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
            ))}

            {/* Day buttons */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const day = idx + 1;
              const mm = String(currentMonth + 1).padStart(2, "0");
              const dd = String(day).padStart(2, "0");
              const dateStr = `${currentYear}-${mm}-${dd}`;

              const isSelected = value === dateStr;
              const isToday = todayStr === dateStr;
              const isDisabledDay = Boolean((min && dateStr < min) || (max && dateStr > max));

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabledDay}
                  onClick={() => selectDate(day)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    isDisabledDay
                      ? "opacity-30 cursor-not-allowed text-zinc-400"
                      : isSelected
                      ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20 scale-105"
                      : isToday
                      ? "border border-amber-500 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Presets */}
          <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={selectToday}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Select Today
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
