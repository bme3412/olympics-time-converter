"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { parseISO, format, addDays, isSameDay } from "date-fns";
import {
  Calendar,
  Flag,
  MapPin,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { COUNTRIES, SPORTS, DATES } from "../lib/constants";
import {
  SelectInput,
  CountryFlag,
  ErrorMessage,
} from "./ui/OlympicsComponents";
import DropdownCheckbox from "./ui/DropdownCheckbox";
import { convertTime } from "../lib/utils";
import ParisStartTime from "../components/ui/ParisStartTime";
import ScheduleTable from "./ScheduleTable";

const OlympicsScheduleApp = () => {
  const [filters, setFilters] = useState({
    country: "",
    viewingLocation: "",
    sports: [],
    dates: [],
  });
  const [allSchedule, setAllSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const prevFiltersRef = useRef();

  const fetchAllSchedule = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        country: filters.country,
        viewingLocation: filters.viewingLocation,
      });
      filters.sports.forEach((sport) => params.append("sport", sport));
      filters.dates.forEach((date) => params.append("date", date));

      const response = await fetch(`/api/schedule?${params}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAllSchedule(data.events);
      setCurrentPage(1);
      setError(null);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setError(`Failed to fetch schedule: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters, loading]);

  useEffect(() => {
    const filtersChanged =
      JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
    if (
      filtersChanged &&
      (filters.country || filters.sports.length > 0 || filters.dates.length > 0)
    ) {
      fetchAllSchedule();
    }
    prevFiltersRef.current = filters;
  }, [filters, fetchAllSchedule]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allSchedule.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(allSchedule.length / itemsPerPage);

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
            onChange={(e) => handleFilterChange("country", e.target.value)}
            options={COUNTRIES}
            placeholder="Select your team"
          />
          <SelectInput
            icon={<MapPin className="h-5 w-5 text-gray-400 ml-3" />}
            value={filters.viewingLocation}
            onChange={(e) =>
              handleFilterChange("viewingLocation", e.target.value)
            }
            options={COUNTRIES}
            placeholder="Select viewing location"
          />
          <DropdownCheckbox
            label="Select dates"
            options={DATES}
            selectedOptions={filters.dates}
            onChange={(date) => handleCheckboxChange("dates", date)}
          />
          <DropdownCheckbox
            label="Select sports"
            options={SPORTS}
            selectedOptions={filters.sports}
            onChange={(sport) => handleCheckboxChange("sports", sport)}
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <ScheduleTable
        schedule={getCurrentPageData()}
        viewingLocation={filters.viewingLocation}
      />

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600 flex justify-between">
        <p>Total events: {allSchedule.length}</p>
        <p>
          Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
          {Math.min(currentPage * itemsPerPage, allSchedule.length)} of{" "}
          {allSchedule.length}
        </p>
      </div>
    </div>
  );
};



const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return the original string if parsing fails
  }
};

const formatTime = (timeString) => {
  try {
    return format(parseISO(timeString), "HH:mm");
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString; // Return the original string if parsing fails
  }
};

const LocalStartTime = ({ startTime, date, viewingLocation }) => {
  if (!startTime || !date || !viewingLocation) {
    return <span>Invalid data</span>;
  }

  try {
    // Ensure startTime is in the correct format
    const formattedStartTime = startTime.includes("T")
      ? startTime
      : `${date}T${startTime}`;
    const parisTime = parseISO(formattedStartTime);

    if (isNaN(parisTime.getTime())) {
      throw new Error("Invalid date or time");
    }

    const localTime = convertTime(formattedStartTime, viewingLocation);
    const [timeString, dayDiff] = localTime.split(" ");

    const localDate = addDays(parisTime, dayDiff ? parseInt(dayDiff) : 0);

    let displayTime = format(localDate, "HH:mm");

    if (!isSameDay(parisTime, localDate)) {
      displayTime = format(localDate, "MMM dd, HH:mm");
    }

    return (
      <div className="flex items-center">
        <span>{displayTime}</span>
        <CountryFlag country={viewingLocation} className="ml-2" />
      </div>
    );
  } catch (error) {
    console.error("Error in LocalStartTime:", error);
    return <span>Unable to display time</span>;
  }
};

export default OlympicsScheduleApp;
