"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { parseISO, format } from "date-fns";
import { Calendar, Flag, MapPin, Activity, ChevronDown } from "lucide-react";
import { COUNTRIES, SPORTS, DATES } from '../lib/constants';
import { SelectInput, CountryFlag, ErrorMessage } from './ui/OlympicsComponents';
import DropdownCheckbox from './ui/DropdownCheckbox';
import { convertTime } from '../lib/utils';

const OlympicsScheduleApp = () => {
  const [filters, setFilters] = useState({
    country: "",
    viewingLocation: "",
    sports: [],
    dates: [],
  });
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const prevFiltersRef = useRef();

  const fetchSchedule = useCallback(async (resetPage = false) => {
    if (loading || (!hasMore && !resetPage)) return;
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        country: filters.country,
        viewingLocation: filters.viewingLocation,
      });
      filters.sports.forEach(sport => params.append('sport', sport));
      filters.dates.forEach(date => params.append('date', date));

      const response = await fetch(`/api/schedule?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSchedule(prev => resetPage ? data.events : [...prev, ...data.events]);
      setHasMore(data.hasMore);
      setPage(prev => resetPage ? 2 : prev + 1);
      setError(null);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setError(`Failed to fetch schedule: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [page, filters, loading, hasMore]);

  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
    if (filtersChanged && (filters.country || filters.sports.length > 0 || filters.dates.length > 0)) {
      fetchSchedule(true);
    }
    prevFiltersRef.current = filters;
  }, [filters, fetchSchedule]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    setHasMore(true);
  };

  const handleCheckboxChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
    }));
    setPage(1);
    setHasMore(true);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Olympics Schedule App
      </h1>
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectInput
            icon={<Flag className="h-5 w-5 text-gray-400 ml-3" />}
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            options={COUNTRIES}
            placeholder="Select your team"
          />
          <SelectInput
            icon={<MapPin className="h-5 w-5 text-gray-400 ml-3" />}
            value={filters.viewingLocation}
            onChange={(e) => handleFilterChange('viewingLocation', e.target.value)}
            options={COUNTRIES}
            placeholder="Select viewing location"
          />
          <DropdownCheckbox
            label="Select dates"
            options={DATES}
            selectedOptions={filters.dates}
            onChange={(date) => handleCheckboxChange('dates', date)}
          />
          <DropdownCheckbox
            label="Select sports"
            options={SPORTS}
            selectedOptions={filters.sports}
            onChange={(sport) => handleCheckboxChange('sports', sport)}
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <ScheduleTable
        schedule={schedule}
        viewingLocation={filters.viewingLocation}
      />

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => fetchSchedule()}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            {loading ? "Loading..." : (
              <>
                Load More <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 flex justify-between">
        <p>Loaded events: {schedule.length}</p>
      </div>
    </div>
  );
};


const ScheduleTable = ({ schedule, viewingLocation }) => (
  <div className="bg-white shadow rounded-lg overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {["Date", "Sport", "Event", "Teams", "Start Time (Paris)", "Start Time (Local)", "Round"].map((header) => (
            <th key={header} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {schedule.map((event, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Date}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Sport}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Sport_subTitle}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">
              {event.Team1 && event.Team2 ? (
                <div className="flex items-center">
                  <span>{event.Team1}</span>
                  <CountryFlag country={event.Team1} />
                  <span className="mx-2">vs</span>
                  <span>{event.Team2}</span>
                  <CountryFlag country={event.Team2} />
                </div>
              ) : 'N/A'}
            </td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{formatTime(event.StartTime)}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">
              {viewingLocation ? convertTime(event.StartTime, viewingLocation) : 'Select location'}
            </td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Round}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const formatTime = (timeString) => {
  try {
    return format(parseISO(timeString), 'HH:mm');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString; // Return the original string if parsing fails
  }
};

export default OlympicsScheduleApp;
