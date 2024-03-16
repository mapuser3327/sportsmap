import requests

url = 'https://en.wikipedia.org/w/api.php'
params = {
    'action': 'query',
    'list': 'search',
    'srsearch': 'National Football League teams',
    'format': 'json'
}

response = requests.get(url, params=params)
data = response.json()

# Extract team names from the response (logic may vary slightly based on API response structure)
if 'query' in data and 'search' in data['query']:
    for item in data['query']['search']:
        print(item['title'])
