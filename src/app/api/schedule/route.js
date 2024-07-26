import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

const ITEMS_PER_PAGE = 20;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const country = searchParams.get('country');
  const viewingLocation = searchParams.get('viewingLocation');
  const sports = searchParams.getAll('sport');
  const dates = searchParams.getAll('date');

  try {
    const { events, totalEvents } = await getPagedEvents({ page, country, viewingLocation, sports, dates });
    const hasMore = totalEvents > page * ITEMS_PER_PAGE;

    return NextResponse.json({ 
      events, 
      hasMore, 
      totalEvents,
      currentPage: page,
      totalPages: Math.ceil(totalEvents / ITEMS_PER_PAGE)
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function getPagedEvents({ page, country, viewingLocation, sports, dates }) {
  const dataDirectory = path.join(process.cwd(), 'public', 'data');
  const csvFiles = await fs.readdir(dataDirectory);
  const filteredFiles = csvFiles.filter(file => file.startsWith('data_') && file.endsWith('.csv'));

  let allEvents = [];
  let totalEvents = 0;

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

    totalEvents += filteredRecords.length;
    allEvents = [...allEvents, ...filteredRecords];

    if (allEvents.length >= page * ITEMS_PER_PAGE) break;
  }

  allEvents.sort((a, b) => new Date(a.StartTime) - new Date(b.StartTime));
  
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;
  
  return { 
    events: allEvents.slice(startIndex, endIndex),
    totalEvents 
  };
}
