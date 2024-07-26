// src/lib/utils.js

import { parseISO, format, addHours, isValid, differenceInCalendarDays } from "date-fns";
import { TIME_ZONE_OFFSETS } from './constants';

export function getCountryCode(countryName) {
  const countryMap = {
    "Angola": "AO", "Argentina": "AR", "Australia": "AU", "Azerbaijan": "AZ",
    "Belgium": "BE", "Brazil": "BR", "Canada": "CA", "China": "CN",
    "Colombia": "CO", "Croatia": "HR", "Denmark": "DK", "Dominican Republic": "DO",
    "Egypt": "EG", "Fiji": "FJ", "France": "FR", "Germany": "DE",
    "Great Britain": "GB", "Greece": "GR", "Guinea": "GN", "Hungary": "HU",
    "India": "IN", "Iraq": "IQ", "Ireland": "IE", "Israel": "IL",
    "Italy": "IT", "Japan": "JP", "Kenya": "KE", "Korea": "KR",
    "Latvia": "LV", "Lithuania": "LT", "Mali": "ML", "Montenegro": "ME",
    "Morocco": "MA", "Netherlands": "NL", "New Zealand": "NZ", "Nigeria": "NG",
    "Norway": "NO", "Paraguay": "PY", "Poland": "PL", "Puerto Rico": "PR",
    "Romania": "RO", "Samoa": "WS", "Serbia": "RS", "Slovenia": "SI",
    "South Africa": "ZA", "South Sudan": "SS", "Spain": "ES", "Sweden": "SE",
    "Türkiye": "TR", "Ukraine": "UA", "United States": "US", "Uruguay": "UY",
    "Uzbekistan": "UZ"
  };

  return countryMap[countryName] || countryName.slice(0, 2).toUpperCase();
}

export function convertTime(parisTime, targetLocation) {
  try {
    const parisDate = parseISO(parisTime);
    if (!isValid(parisDate)) {
      throw new Error("Invalid date format");
    }
    if (!TIME_ZONE_OFFSETS.hasOwnProperty(targetLocation)) {
      throw new Error(`Time zone offset not defined for ${targetLocation}`);
    }
    const offsetDiff = TIME_ZONE_OFFSETS[targetLocation] - TIME_ZONE_OFFSETS["France"];
    const targetDate = addHours(parisDate, offsetDiff);
    
    const dayDiff = differenceInCalendarDays(targetDate, parisDate);
    const timeString = format(targetDate, "HH:mm");
    
    if (dayDiff === 0) {
      return timeString;
    } else if (dayDiff === 1) {
      return `${timeString} +1`;
    } else if (dayDiff === -1) {
      return `${timeString} -1`;
    } else {
      return `${timeString} ${dayDiff > 0 ? '+' : ''}${dayDiff}`;
    }
  } catch (error) {
    console.error("Error converting time:", error);
    return "Invalid time";
  }
}

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}