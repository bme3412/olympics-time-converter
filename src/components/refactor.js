"use client";

import React, { useState, useEffect, useCallback } from "react";
import { parseISO, format, addHours, isValid } from "date-fns";
import { Calendar, Flag, MapPin, Activity, ChevronDown } from "lucide-react";
import * as flags from "country-flag-icons/react/3x2";
import { COUNTRIES, SPORTS, DATES, TIME_ZONE_OFFSETS } from './constants';
import { SelectInput, CountryFlag, ErrorMessage } from './components';
import { getCountryCode, convertTime } from './utils';

const OlympicsScheduleApp = () => {
  const [filters, setFilters] = useState({
    country: "",
    viewingLocation: "",
    sport: "",
    date: "",
  });
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchSchedule = useCallback(async (resetPage = false) => {
    if (loading || (!hasMore && !resetPage)) return;
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...filters,
      });
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
    if (filters.country || filters.sport || filters.date) {
      fetchSchedule(true);
    }
  }, [filters, fetchSchedule]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    setHasMore(true);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <Header />
      <FiltersSection filters={filters} onFilterChange={handleFilterChange} />
      {error && <ErrorMessage message={error} />}
      <ScheduleTable
        schedule={schedule}
        viewingLocation={filters.viewingLocation}
      />
      <LoadMoreButton
        hasMore={hasMore}
        loading={loading}
        onLoadMore={() => fetchSchedule()}
      />
      <Footer scheduleLength={schedule.length} />
    </div>
  );
};

const Header = () => (
  <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
    Olympics Schedule App
  </h1>
);

const FiltersSection = ({ filters, onFilterChange }) => (
  <div className="bg-white shadow rounded-lg p-6 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SelectInput
        icon={<Flag className="h-5 w-5 text-gray-400 ml-3" />}
        value={filters.country}
        onChange={(e) => onFilterChange('country', e.target.value)}
        options={COUNTRIES}
        placeholder="Select your team"
      />
      <SelectInput
        icon={<MapPin className="h-5 w-5 text-gray-400 ml-3" />}
        value={filters.viewingLocation}
        onChange={(e) => onFilterChange('viewingLocation', e.target.value)}
        options={COUNTRIES}
        placeholder="Select viewing location"
      />
      <SelectInput
        icon={<Calendar className="h-5 w-5 text-gray-400 ml-3" />}
        value={filters.date}
        onChange={(e) => onFilterChange('date', e.target.value)}
        options={DATES}
        placeholder="Select date"
      />
      <SelectInput
        icon={<Activity className="h-5 w-5 text-gray-400 ml-3" />}
        value={filters.sport}
        onChange={(e) => onFilterChange('sport', e.target.value)}
        options={SPORTS}
        placeholder="Select sport"
      />
    </div>
  </div>
);

const ScheduleTable = ({ schedule, viewingLocation }) => (
  <div className="bg-white shadow rounded-lg overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <TableHeader />
      <TableBody schedule={schedule} viewingLocation={viewingLocation} />
    </table>
  </div>
);

const TableHeader = () => (
  <thead className="bg-gray-50">
    <tr>
      {["Date", "Sport", "Event", "Teams", "Start Time (Paris)", "Start Time (Local)", "Round"].map((header) => (
        <th key={header} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const TableBody = ({ schedule, viewingLocation }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {schedule.map((event, index) => (
      <TableRow key={index} event={event} viewingLocation={viewingLocation} />
    ))}
  </tbody>
);

const TableRow = ({ event, viewingLocation }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Date}</td>
    <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Sport}</td>
    <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Sport_subTitle}</td>
    <td className="px-3 py-4 whitespace-nowrap text-sm">
      <TeamsCell team1={event.Team1} team2={event.Team2} />
    </td>
    <td className="px-3 py-4 whitespace-nowrap text-sm">{formatTime(event.StartTime)}</td>
    <td className="px-3 py-4 whitespace-nowrap text-sm">
      {viewingLocation ? convertTime(event.StartTime, viewingLocation) : 'Select location'}
    </td>
    <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Round}</td>
  </tr>
);

const TeamsCell = ({ team1, team2 }) => (
  team1 && team2 ? (
    <div className="flex items-center">
      <span>{team1}</span>
      <CountryFlag country={team1} />
      <span className="mx-2">vs</span>
      <span>{team2}</span>
      <CountryFlag country={team2} />
    </div>
  ) : 'N/A'
);

const LoadMoreButton = ({ hasMore, loading, onLoadMore }) => (
  hasMore && (
    <div className="mt-4 text-center">
      <button
        onClick={onLoadMore}
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
  )
);

const Footer = ({ scheduleLength }) => (
  <div className="mt-4 text-sm text-gray-600 flex justify-between">
    <p>Loaded events: {scheduleLength}</p>
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