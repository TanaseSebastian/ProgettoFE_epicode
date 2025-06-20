import React from "react";

const MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

// Tre anni centrati su quello corrente
const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => thisYear - 1 + i);

const MonthYearFilter = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) => (
  <div className="text-center">
    {/* Selettore mese */}
    <div>
      <label className="form-label">Mese:</label>
      <select
        className="form-select w-50 mx-auto"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
      >
        {MONTHS.map((m, i) => (
          <option key={i} value={i}>
            {m}
          </option>
        ))}
      </select>
    </div>

    {/* Selettore anno */}
    <div className="mt-3">
      <label className="form-label">Anno:</label>
      <select
        className="form-select w-50 mx-auto"
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default MonthYearFilter;