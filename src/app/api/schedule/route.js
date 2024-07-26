import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const viewingLocation = searchParams.get('viewingLocation');
  const sports = searchParams.getAll('sport');
  const dates = searchParams.getAll('date');

  try {
    const events = await getAllEvents({ country, viewingLocation, sports, dates });

    return NextResponse.json({ 
      events, 
      totalEvents: events.length
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function getAllEvents({ country, viewingLocation, sports, dates }) {
  const dataDirectory = path.join(process.cwd(), 'public', 'data');
  const csvFiles = await fs.readdir(dataDirectory);
  const filteredFiles = csvFiles.filter(file => file.startsWith('data_') && file.endsWith('.csv'));

  let allEvents = [];
  const uniqueEventIds = new Set();

  for (const file of filteredFiles) {
    if (dates.length > 0 && !dates.some(date => file.includes(date))) continue;

    const filePath = path.join(dataDirectory, file);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    const filteredRecords = records.filter(record => {
      const countryMatch = !country || record.Team1 === country || record.Team2 === country;
      const sportMatch = sports.length === 0 || sports.includes(record.Sport);
      return countryMatch && sportMatch;
    });

    for (const record of filteredRecords) {
      // Create a unique identifier for each event
      const eventId = `${record.Date}-${record.Sport}-${record.Sport_subTitle}-${record.StartTime}`;
      if (!uniqueEventIds.has(eventId)) {
        uniqueEventIds.add(eventId);
        allEvents.push(record);
      }
    }
  }

  allEvents.sort((a, b) => new Date(a.StartTime) - new Date(b.StartTime));
  
  return allEvents;
}