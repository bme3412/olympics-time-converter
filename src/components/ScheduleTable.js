import React from 'react';
import { format, parseISO } from 'date-fns';
import ParisStartTime from './ui/ParisStartTime';
import { convertTime } from '../lib/utils';
import { CountryFlag } from './ui/OlympicsComponents';

const LocalStartTime = ({ startTime, viewingLocation }) => {
  if (!startTime || !viewingLocation) {
    return <span>Invalid data</span>;
  }

  try {
    const convertedTime = convertTime(startTime, viewingLocation);
    return (
      <div className="flex items-center space-x-2">
        <span>{convertedTime}</span>
        <span className="text-xs text-gray-500">({viewingLocation})</span>
      </div>
    );
  } catch (error) {
    console.error("Error in LocalStartTime:", error);
    return <span>Unable to display time</span>;
  }
};

const ScheduleTable = ({ schedule, viewingLocation }) => {
  const formatDate = (dateTimeString) => {
    try {
      const date = parseISO(dateTimeString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateTimeString);
      return 'Invalid date';
    }
  };

  const formatTime = (dateTimeString) => {
    try {
      const date = parseISO(dateTimeString);
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error, 'Time string:', dateTimeString);
      return 'Invalid time';
    }
  };

  const renderTeams = (team1, team2) => {
    if (!team1 && !team2) return 'N/A';
    return (
      <div className="flex items-center">
        {team1 && (
          <div className="flex items-center">
            <CountryFlag country={team1} className="h-4 w-6" />
            <span className="ml-1.5">{team1}</span>
          </div>
        )}
        {team1 && team2 && <span className="mx-2 text-gray-500">vs</span>}
        {team2 && (
          <div className="flex items-center">
            <CountryFlag country={team2} className="h-4 w-6" />
            <span className="ml-1.5">{team2}</span>
          </div>
        )}
      </div>
    );
  };

  const tableHeaders = ["Date", "Sport", "Event", "Teams", "Start Time (Paris)", "Start Time (Local)", "Round"];

  // Sort the schedule by date and time
  const sortedSchedule = [...schedule].sort((a, b) => {
    return new Date(a.StartTime) - new Date(b.StartTime);
  });

  return (
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {tableHeaders.map((header) => (
              <th key={header} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedSchedule.map((event) => (
            <tr key={`${event.StartTime}-${event.Sport}-${event.Sport_subTitle}`} className="hover:bg-gray-50">
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatDate(event.StartTime)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Sport}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Sport_subTitle}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">
                {renderTeams(event.Team1, event.Team2)}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">
                <ParisStartTime startTime={formatTime(event.StartTime)} />
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">
                {viewingLocation ? (
                  <LocalStartTime 
                    startTime={event.StartTime}
                    viewingLocation={viewingLocation}
                  />
                ) : 'Select location'}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Round}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;