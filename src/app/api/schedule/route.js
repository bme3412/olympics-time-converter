import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const country = searchParams.get('country');
  const sport = searchParams.get('sport');
  const perPage = 20; // Number of events per page

  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'public', 'data', `data_${date}.csv`);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let parsedData = parseCSV(fileContent);

    // Apply filters
    if (country) {
      parsedData = parsedData.filter(event => event.Team1.includes(country) || event.Team2.includes(country));
    }
    if (sport) {
      parsedData = parsedData.filter(event => event.Sport === sport);
    }

    // Apply pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = parsedData.slice(startIndex, endIndex);

    return NextResponse.json({
      events: paginatedData,
      hasMore: endIndex < parsedData.length,
      total: parsedData.length
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'Failed to read schedule data' }, { status: 500 });
  }
}

function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());

  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] ? values[index].trim() : '';
        return obj;
      }, {});
    });
}