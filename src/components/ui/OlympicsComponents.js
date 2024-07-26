// src/components/ui/OlympicsComponents.js

import React from 'react';
import * as flags from 'country-flag-icons/react/3x2';
import { getCountryCode } from '../../lib/utils';

export const SelectInput = ({ icon, value, onChange, options, placeholder }) => (
  <div className="flex items-center bg-white border rounded-md">
    {icon}
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export const CountryFlag = ({ country }) => {
  const countryCode = getCountryCode(country);
  const FlagComponent = flags[countryCode];
  return FlagComponent ? <FlagComponent className="w-6 h-4 ml-2" /> : null;
};

export const ErrorMessage = ({ message }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
    role="alert"
  >
    <span className="block sm:inline">{message}</span>
  </div>
);