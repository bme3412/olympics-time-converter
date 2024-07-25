'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { parseISO, format, addHours, isValid } from 'date-fns';
import { Calendar, Flag, MapPin, Activity, ChevronDown } from 'lucide-react';

// Constants
const COUNTRIES = [
  'Angola', 'Argentina', 'Australia', 'Azerbaijan', 'Belgium', 'Brazil', 'Canada', 'China',
  'Colombia', 'Croatia', 'Denmark', 'Dominican Republic', 'Egypt', 'Fiji', 'France',
  'Germany', 'Great Britain', 'Greece', 'Guinea', 'Hungary', 'India', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Japan', 'Kenya', 'Korea', 'Latvia', 'Lithuania', 'Mali', 'Montenegro',
  'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Paraguay', 'Poland',
  'Puerto Rico', 'Romania', 'Samoa', 'Serbia', 'Slovenia', 'South Africa', 'South Sudan',
  'Spain', 'Sweden', 'Türkiye', 'Ukraine', 'United States', 'Uruguay', 'Uzbekistan'
];

const SPORTS = [
  '3x3 Basketball', 'Archery', 'Artistic Gymnastics', 'Artistic Swimming', 'Athletics',
  'Basketball', 'Beach Volleyball', 'Boxing', 'Breaking', 'Canoe Slalom',
  'Canoe Sprint', 'Cycling BMX Freestyle', 'Cycling BMX Racing', 'Cycling Mountain Bike',
  'Cycling Road', 'Cycling Track', 'Diving', 'Equestrian', 'Fencing', 'Football',
  'Golf', 'Handball', 'Hockey', 'Marathon Swimming', 'Modern Pentathlon',
  'Opening Ceremony', 'Rhythmic Gymnastics', 'Rowing', 'Rugby Sevens', 'Sailing',
  'Shooting', 'Skateboarding', 'Sport Climbing', 'Surfing', 'Swimming',
  'Table Tennis', 'Taekwondo', 'Tennis', 'Trampoline Gymnastics', 'Triathlon',
  'Volleyball', 'Water Polo', 'Weightlifting'
];

const DATES = [
  '25-july', '26-july', '27-july', '28-july', '29-july', '30-july', '31-july',
  '01-august', '02-august', '03-august', '04-august', '05-august', '06-august',
  '07-august', '08-august', '09-august', '10-august', '11-august'
];

const TIME_ZONE_OFFSETS = {
  'United States': -4, 'Japan': 9, 'France': 2, 'Australia': 10, 'Spain': 2,
  'Great Britain': 1, 'Argentina': -3, 'South Africa': 2, 'Puerto Rico': -4,
  'Norway': 2, 'Hungary': 2, 'Croatia': 2, 'Germany': 2, 'Poland': 2,
  'Brazil': -3, 'Slovenia': 2, 'China': 8, 'Canada': -4, 'Italy': 2, 'Ireland': 1,
  'Egypt': 2, 'Nigeria': 1, 'Greece': 3, 'Turkey': 3, 'India': 5.5, 'Israel': 3,
  'Kenya': 3, 'South Korea': 9, 'Australia': 10, 'New Zealand': 12, 'Netherlands': 2,
  'Uruguay': -3, 'Uzbekistan': 5, 'Ukraine': 3
};

// SelectInput component definition
const SelectInput = ({ icon, value, onChange, options, placeholder }) => (
    <div className="flex items-center bg-white border rounded-md">
      {icon}
      <select
        value={value}
        onChange={onChange}
        className="w-full p-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
  
  const OlympicsScheduleApp = () => {
    const [country, setCountry] = useState('');
    const [viewingLocation, setViewingLocation] = useState('');
    const [selectedSport, setSelectedSport] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
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
          date: selectedDate,
          ...(country && { country }),
          ...(selectedSport && { sport: selectedSport }),
        });
        const response = await fetch(`/api/schedule?${params}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSchedule(prevSchedule => resetPage ? data.events : [...prevSchedule, ...data.events]);
        setHasMore(data.hasMore);
        setPage(prevPage => resetPage ? 2 : prevPage + 1);
        setError(null);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError(`Failed to fetch schedule: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }, [page, country, selectedSport, selectedDate, loading, hasMore]);
  
    useEffect(() => {
      if (selectedDate) {
        fetchSchedule(true);
      }
    }, [country, selectedSport, selectedDate, fetchSchedule]);
  
    const handleLoadMore = () => {
      fetchSchedule();
    };
  
    const convertTime = (parisTime, targetLocation) => {
      try {
        const parisDate = parseISO(parisTime);
        if (!isValid(parisDate)) {
          throw new Error('Invalid date format');
        }
        if (!TIME_ZONE_OFFSETS.hasOwnProperty(targetLocation)) {
          throw new Error(`Time zone offset not defined for ${targetLocation}`);
        }
        const offsetDiff = TIME_ZONE_OFFSETS[targetLocation] - TIME_ZONE_OFFSETS['France'];
        const targetDate = addHours(parisDate, offsetDiff);
        return format(targetDate, 'yyyy-MM-dd HH:mm:ss');
      } catch (error) {
        console.error('Error converting time:', error);
        return 'Invalid time';
      }
    };
  
    return (
        <div className="p-4 max-w-6xl mx-auto bg-gray-50 min-h-screen">
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Olympics Schedule App</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SelectInput
                icon={<Flag className="h-5 w-5 text-gray-400 ml-3" />}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                options={COUNTRIES}
                placeholder="Select your team"
              />
              <SelectInput
                icon={<MapPin className="h-5 w-5 text-gray-400 ml-3" />}
                value={viewingLocation}
                onChange={(e) => setViewingLocation(e.target.value)}
                options={COUNTRIES}
                placeholder="Select viewing location"
              />
              <SelectInput
                icon={<Calendar className="h-5 w-5 text-gray-400 ml-3" />}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                options={DATES}
                placeholder="Select date"
              />
              <SelectInput
                icon={<Activity className="h-5 w-5 text-gray-400 ml-3" />}
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                options={SPORTS}
                placeholder="Select sport"
              />
            </div>
          </div>
          
          {error && <ErrorMessage message={error} />}
    
          <ScheduleTable
            schedule={schedule}
            viewingLocation={viewingLocation}
            convertTime={convertTime}
          />
          
          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                {loading ? 'Loading...' : (
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
  
  // ErrorMessage component definition
  const ErrorMessage = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
  
  // ScheduleTable component definition
  const ScheduleTable = ({ schedule, viewingLocation, convertTime }) => (
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teams</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start (Paris)</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local Time</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schedule.map((event, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Date}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Sport}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Sport_subTitle}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">
                {event.Team1 && event.Team2 ? `${event.Team1} vs ${event.Team2}` : 'N/A'}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{format(parseISO(event.StartTime), 'HH:mm')}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">
                {viewingLocation
                  ? convertTime(event.StartTime, viewingLocation)
                  : 'Select location'}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{event.Round}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  export default OlympicsScheduleApp;