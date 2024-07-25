import os
import csv

def process_csv_files(directory):
    unique_sports = set()
    unique_teams = set()

    for filename in os.listdir(directory):
        if filename.endswith('.csv'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    sport = row.get('Sport', '').strip()
                    team1 = row.get('Team1', '').strip()
                    team2 = row.get('Team2', '').strip()

                    if sport:
                        unique_sports.add(sport)
                    if team1:
                        unique_teams.add(team1)
                    if team2:
                        unique_teams.add(team2)

    return sorted(list(unique_sports)), sorted(list(unique_teams))

# Directory containing the CSV files
data_directory = '.'  # Current directory

unique_sports, unique_teams = process_csv_files(data_directory)

print("Unique Sports:")
for sport in unique_sports:
    print(f"  - {sport}")

print("\nUnique Teams:")
for team in unique_teams:
    print(f"  - {team}")

print(f"\nTotal unique sports: {len(unique_sports)}")
print(f"Total unique teams: {len(unique_teams)}")