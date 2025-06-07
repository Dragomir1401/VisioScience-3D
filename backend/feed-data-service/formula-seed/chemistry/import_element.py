import json
import requests
import sys
import os
from pathlib import Path

print("Începere proces de import...")

# Configurare
BASE_DIR = Path(__file__).parent
JSON_FILE = BASE_DIR / 'periodic-data-full.json'
URL = 'http://feed-data-service:8080/feed/chem/elements'  # URL-ul serviciului Kubernetes

# Citire fișier JSON
try:
    print("Citire fișier JSON...")
    with open(JSON_FILE, 'r', encoding='utf-8') as file:
        data = json.load(file)
    print(f"Fișier citit cu succes. {len(data)} elemente găsite.")
except Exception as e:
    print(f"Eroare la citirea fișierului JSON: {e}")
    sys.exit(1)

# Transformare date în formatul corect
print("Transformare date...")
elements = []
for item in data:
    element = {
        "symbol": item[0],
        "name": item[1],
        "atomicNumber": item[2],
        "group": item[3],
        "period": item[4],
        "atomicMass": item[5],
        "description": item[6]
    }
    elements.append(element)

# Inserare elemente prin HTTP requests
print("Inserare elemente în baza de date...")
success_count = 0
error_count = 0

for element in elements:
    try:
        print(f"Încărcare element {element['symbol']}...")
        response = requests.post(
            URL,
            json=element,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200 or response.status_code == 201:
            print(f"Element {element['symbol']} încărcat cu succes!")
            success_count += 1
        else:
            print(f"Eroare la încărcarea elementului {element['symbol']}: {response.status_code} - {response.text}")
            error_count += 1
            
    except Exception as e:
        print(f"Eroare la încărcarea elementului {element['symbol']}: {str(e)}")
        error_count += 1

print("\nRezumat import:")
print(f"Total elemente: {len(elements)}")
print(f"Încărcate cu succes: {success_count}")
print(f"Erori: {error_count}")

if error_count > 0:
    print("\nAtenție: Au existat erori la import!")
    sys.exit(1)
else:
    print("\nImport finalizat cu succes!")