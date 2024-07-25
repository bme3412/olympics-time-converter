import requests
from bs4 import BeautifulSoup
import pandas as pd
from tqdm import tqdm
import time
import logging
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from datetime import datetime, timedelta

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def requests_retry_session(retries=3, backoff_factor=0.3, status_forcelist=(500, 502, 504), session=None):
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

def scrape_website(url):
    logger.info(f"Starting to scrape URL: {url}")
    
    try:
        # Send a GET request to the URL with retry logic
        logger.info("Sending GET request to the URL")
        session = requests_retry_session()
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = session.get(url, timeout=30, headers=headers)
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"Failed to retrieve the webpage after retries: {e}")
        return pd.DataFrame()

    logger.info("Parsing HTML content")
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find all elements with the specified data attribute
    events = soup.find_all('a', attrs={'data-unit-rsc-code': True})
    logger.info(f"Found {len(events)} events to scrape")
    
    if not events:
        logger.warning("No events found. The page structure might have changed or the content is not loaded as expected.")
        return pd.DataFrame()
    
    data = []
    
    # Create a progress bar
    pbar = tqdm(total=len(events), desc="Scraping Progress")
    
    start_time = time.time()
    
    for index, event in enumerate(events, 1):
        try:
            sport = event.find('span', class_='discipline-title')
            sport_subtitle = event.find('span', class_='discipline-sub-title')
            start_time_elem = event.find('time', class_='emotion-srm-1myzqq1')
            
            # Find all team elements
            team_elements = event.find_all('div', class_='h2h-competitor')
            
            # Extract team names
            team1 = team_elements[0].find('span', class_='emotion-srm-47h3k2').text.strip() if len(team_elements) > 0 else ''
            team2 = team_elements[1].find('span', class_='emotion-srm-47h3k2').text.strip() if len(team_elements) > 1 else ''
            
            # Check for medal match
            medal_icon = event.find('img', alt="Gold medal event")
            round_info = "medal match" if medal_icon else ""
            
            data.append({
                'Sport': sport.text.strip() if sport else '',
                'Sport_subTitle': sport_subtitle.text.strip() if sport_subtitle else '',
                'Team1': team1,
                'Team2': team2,
                'StartTime': start_time_elem['datetime'] if start_time_elem else '',
                'Round': round_info
            })
            
            # Log every 10th item (adjust as needed)
            if index % 10 == 0:
                logger.info(f"Processed {index} items")
            
        except Exception as e:
            logger.error(f"Error processing event {index}: {e}")
        
        # Update progress bar
        pbar.update(1)
        
        # Calculate and display estimated time remaining
        elapsed_time = time.time() - start_time
        items_per_second = pbar.n / elapsed_time if elapsed_time > 0 else 0
        estimated_remaining = (pbar.total - pbar.n) / items_per_second if items_per_second > 0 else 0
        pbar.set_postfix({'Estimated Time Remaining': f'{estimated_remaining:.2f}s'})
    
    pbar.close()
    
    logger.info(f"Scraping completed. Total items processed: {len(data)}")
    
    # Create a DataFrame
    df = pd.DataFrame(data)
    return df

def date_range(start_date, end_date):
    for n in range(int((end_date - start_date).days) + 1):
        yield start_date + timedelta(n)

def get_url_for_date(date):
    if date.month == 7:
        return f'https://olympics.com/en/paris-2024/schedule/{date.day}-july'
    else:  # August
        return f'https://olympics.com/en/paris-2024/schedule/{date.day}-august'

# Main execution
start_date = datetime(2024, 7, 25)
end_date = datetime(2024, 8, 11)

logger.info("Script started")

for date in date_range(start_date, end_date):
    url = get_url_for_date(date)
    date_str = date.strftime("%d-%B").lower()
    
    logger.info(f"Processing date: {date_str}")
    
    result_df = scrape_website(url)
    
    if not result_df.empty:
        filename = f'data_{date_str}.csv'
        logger.info(f"Saving data to {filename}")
        result_df.to_csv(filename, index=False)
        logger.info(f"Data saved to {filename}")
    else:
        logger.warning(f"No data to save for {date_str}")
    
    # Add a delay between requests to be respectful to the server
    time.sleep(5)

logger.info("Script completed")