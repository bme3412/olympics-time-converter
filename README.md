# Olympics Schedule App

This Next.js application provides an interactive schedule for the Olympic Games, allowing users to filter events by country, sport, date, and viewing location.

## Features

- Filter events by country, sport, date, and viewing location
- Display event details including date, sport, teams, start times, and round
- Show local start times based on the selected viewing location
- Paginated results for better performance and user experience
- Responsive design for various screen sizes

## Technologies Used

- Next.js
- React
- date-fns for date manipulation
- Lucide React for icons
- Tailwind CSS for styling

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/olympics-schedule-app.git
   ```

2. Install dependencies:
   ```
   cd olympics-schedule-app
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `OlympicsScheduleApp.js`: Main component for the application
- `ScheduleTable.js`: Component for rendering the event schedule
- `ui/OlympicsComponents.js`: Reusable UI components
- `ui/DropdownCheckbox.js`: Custom dropdown with checkboxes for multi-select
- `ui/ParisStartTime.js`: Component for displaying Paris start time
- `lib/constants.js`: Contains constants like COUNTRIES, SPORTS, and DATES
- `lib/utils.js`: Utility functions, including `convertTime` for time zone conversions

## API

The application fetches schedule data from an API endpoint:

```
/api/schedule
```

Query parameters:
- `country`: Filter by country
- `viewingLocation`: Set the viewing location for local times
- `sport`: Filter by sport (can be multiple)
- `date`: Filter by date (can be multiple)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
