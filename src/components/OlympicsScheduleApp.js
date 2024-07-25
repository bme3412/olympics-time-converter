'use client';

import React, { useState, useEffect } from 'react';
import { parseISO, format, addHours, isValid } from 'date-fns';
import { Calendar, Flag, MapPin, Activity } from 'lucide-react';

const OlympicsScheduleApp = () => {
  const [country, setCountry] = useState('');
  const [viewingLocation, setViewingLocation] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);

  const countries = [
    'Angola', 'Argentina', 'Australia', 'Azerbaijan', 'Belgium', 'Brazil', 'Canada', 'China',
    'Colombia', 'Croatia', 'Denmark', 'Dominican Republic', 'Egypt', 'Fiji', 'France',
    'Germany', 'Great Britain', 'Greece', 'Guinea', 'Hungary', 'India', 'Iraq', 'Ireland',
    'Israel', 'Italy', 'Japan', 'Kenya', 'Korea', 'Latvia', 'Lithuania', 'Mali', 'Montenegro',
    'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Paraguay', 'Poland',
    'Puerto Rico', 'Romania', 'Samoa', 'Serbia', 'Slovenia', 'South Africa', 'South Sudan',
    'Spain', 'Sweden', 'Türkiye', 'Ukraine', 'United States', 'Uruguay', 'Uzbekistan'
  ];

  const sports = [
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

  const dates = [
    '25-july', '26-july', '27-july', '28-july', '29-july', '30-july', '31-july',
    '01-august', '02-august', '03-august', '04-august', '05-august', '06-august',
    '07-august', '08-august', '09-august', '10-august', '11-august'
  ];

  const timeZoneOffsets = {
    'United States': -4, 'Japan': 9, 'France': 2, 'Australia': 10, 'Spain': 2,
    'Great Britain': 1, 'Argentina': -3, 'South Africa': 2, 'Puerto Rico': -4,
    'Norway': 2, 'Hungary': 2, 'Croatia': 2, 'Germany': 2, 'Poland': 2,
    'Brazil': -3, 'Slovenia': 2, 'China': 8, 'Canada': -4, 'Italy': 2, 'Ireland': 1,
    'Egypt': 2, 'Nigeria': 1, 'Greece': 3, 'Turkey': 3, 'India': 5.5, 'Israel': 3,
    'Kenya': 3, 'South Korea': 9, 'Australia': 10, 'New Zealand': 12, 'Netherlands': 2,
    'Uruguay': -3, 'Uzbekistan': 5, 'Ukraine': 3
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSchedule(selectedDate);
    }
  }, [selectedDate]);

  const fetchSchedule = async (date) => {
    try {
      console.log(`Fetching schedule for date: ${date}`);
      const response = await fetch(`/api/schedule?date=${date}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      setSchedule(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError(`Failed to fetch schedule: ${error.message}`);
      setSchedule([]);
    }
  };

  const convertTime = (parisTime, targetLocation) => {
    try {
      const parisDate = parseISO(parisTime);
      if (!isValid(parisDate)) {
        throw new Error('Invalid date format');
      }
      if (!timeZoneOffsets.hasOwnProperty(targetLocation)) {
        throw new Error(`Time zone offset not defined for ${targetLocation}`);
      }
      const offsetDiff = timeZoneOffsets[targetLocation] - timeZoneOffsets['France'];
      const targetDate = addHours(parisDate, offsetDiff);
      return format(targetDate, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Error converting time:', error);
      return 'Invalid time';
    }
  };

  const filteredSchedule = schedule.filter(event => {
    const sportMatch = !selectedSport || event.Sport === selectedSport;
    const countryMatch = !country || (event.Team1 && event.Team1.includes(country)) || (event.Team2 && event.Team2.includes(country));
    return sportMatch && countryMatch;
  });

  console.log('Current filters - Sport:', selectedSport, 'Country:', country);
  console.log('Filtered schedule:', filteredSchedule);

  return (
    <div className="p-4 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Olympics Schedule App</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center bg-white border rounded-md">
            <Flag className="h-5 w-5 text-gray-400 ml-3" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your team</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white border rounded-md">
            <MapPin className="h-5 w-5 text-gray-400 ml-3" />
            <select
              value={viewingLocation}
              onChange={(e) => setViewingLocation(e.target.value)}
              className="w-full p-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select viewing location</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white border rounded-md">
            <Calendar className="h-5 w-5 text-gray-400 ml-3" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select date</option>
              {dates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white border rounded-md">
            <Activity className="h-5 w-5 text-gray-400 ml-3" />
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full p-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select sport</option>
              {sports.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teams</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time (Paris)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSchedule.map((event, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{event.Sport}</td>
                <td className="px-6 py-4 whitespace-nowrap">{event.Sport_subTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.Team1 && event.Team2 ? `${event.Team1} vs ${event.Team2}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{format(parseISO(event.StartTime), 'yyyy-MM-dd HH:mm:ss')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {viewingLocation
                    ? convertTime(event.StartTime, viewingLocation)
                    : 'Select viewing location'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{event.Round}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 flex justify-between">
        <p>Total events: {schedule.length}</p>
        <p>Filtered events: {filteredSchedule.length}</p>
      </div>
    </div>
  );
};

export default OlympicsScheduleApp;
