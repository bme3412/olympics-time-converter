import os
import csv

def extract_unique_countries(directory):
    # List of known countries (you may need to update this list)
    known_countries = {
        'Angola', 'Argentina', 'Australia', 'Azerbaijan', 'Belgium', 'Brazil', 'Canada', 'China',
        'Colombia', 'Croatia', 'Denmark', 'Dominican Republic', 'Egypt', 'Fiji', 'France',
        'Germany', 'Great Britain', 'Greece', 'Guinea', 'Hungary', 'India', 'Iraq', 'Ireland',
        'Israel', 'Italy', 'Japan', 'Kenya', 'Korea', 'Latvia', 'Lithuania', 'Mali', 'Montenegro',
        'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Paraguay', 'Poland',
        'Puerto Rico', 'Romania', 'Samoa', 'Serbia', 'Slovenia', 'South Africa', 'South Sudan',
        'Spain', 'Sweden', 'Türkiye', 'Ukraine', 'United States', 'Uruguay', 'Uzbekistan'
    }

    unique_countries = set()

    for filename in os.listdir(directory):
        if filename.endswith('.csv'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    team1 = row.get('Team1', '').strip()
                    team2 = row.get('Team2', '').strip()

                    if team1 in known_countries:
                        unique_countries.add(team1)
                    if team2 in known_countries:
                        unique_countries.add(team2)

    return sorted(list(unique_countries))

# Directory containing the CSV files
data_directory = '.'  # Current directory

unique_countries = extract_unique_countries(data_directory)

print("Unique Countries:")
for country in unique_countries:
    print(f"  - {country}")

print(f"\nTotal unique countries: {len(unique_countries)}")

# Print a JavaScript-friendly array
print("\nJavaScript array:")
print(f"const countries = {unique_countries};")