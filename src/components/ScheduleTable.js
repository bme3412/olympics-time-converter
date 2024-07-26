import React from 'react';
import { format, parseISO, addDays, isSameDay } from 'date-fns';
import { CountryFlag } from './ui/OlympicsComponents';
import ParisStartTime from './ui/ParisStartTime';
import { convertTime } from '../lib/utils';

const LocalStartTime = ({ startTime, date, viewingLocation }) => {
  if (!startTime || !date || !viewingLocation) {
    console.error('LocalStartTime: Missing required props', { startTime, date, viewingLocation });
    return <span>Invalid data</span>;
  }

  try {
    const formattedStartTime = startTime.includes('T') ? startTime : `${date}T${startTime}`;
    console.log('LocalStartTime: Formatted start time', formattedStartTime);

    const parisTime = parseISO(formattedStartTime);
    console.log('LocalStartTime: Parsed Paris time', parisTime);
    
    if (isNaN(parisTime.getTime())) {
      throw new Error('Invalid date or time');
    }

    const localTime = convertTime(formattedStartTime, viewingLocation);
    console.log('LocalStartTime: Converted local time', localTime);

    const [timeString, dayDiff] = localTime.split(' ');
    console.log('LocalStartTime: Time string and day diff', { timeString, dayDiff });
    
    const localDate = addDays(parisTime, dayDiff ? parseInt(dayDiff) : 0);
    console.log('LocalStartTime: Local date', localDate);

    let displayTime = format(localDate, 'HH:mm');
    
    if (!isSameDay(parisTime, localDate)) {
      displayTime = format(localDate, 'MMM dd, HH:mm');
    }

    console.log('LocalStartTime: Final display time', displayTime);

    return (
      <div className="flex items-center">
        <span>{displayTime}</span>
        <CountryFlag country={viewingLocation} className="ml-2" />
      </div>
    );
  } catch (error) {
    console.error('Error in LocalStartTime:', error, { startTime, date, viewingLocation });
    return <span>Unable to display time</span>;
  }
};

const ScheduleTable = ({ schedule, viewingLocation }) => {
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    try {
      return format(parseISO(timeString), 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error, 'Time string:', timeString);
      return 'Invalid time';
    }
  };

  const renderTeams = (team1, team2) => {
    if (!team1 || !team2) return 'N/A';
    return (
      <div className="flex items-center">
        <span>{team1}</span>
        <CountryFlag country={team1} />
        <span className="mx-2">vs</span>
        <span>{team2}</span>
        <CountryFlag country={team2} />
      </div>
    );
  };

  const tableHeaders = ["Date", "Sport", "Event", "Teams", "Start Time (Paris)", "Start Time (Local)", "Round"];

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
          {schedule.map((event) => (
            <tr key={`${event.Date}-${event.Sport}-${event.Sport_subTitle}-${event.StartTime}`} className="hover:bg-gray-50">
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatDate(event.Date)}</td>
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
                    date={event.Date}
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