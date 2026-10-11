"""Fetch the documented public UCI reference dataset, without inferring legacy provenance."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent
URL = 'https://archive.ics.uci.edu/static/public/891/data.csv'
EXPECTED_SHA256 = '9f71fda9d4ae5f4878c99b9233b6a16accfa9a17c194116a6b78100540934964'

def fetch():
    directory = ROOT / 'data'
    directory.mkdir(exist_ok=True)
    target = directory / 'uci_891.csv'
    metadata = json.load(urlopen('https://archive.ics.uci.edu/api/dataset?id=891', timeout=60))['data']
    content = urlopen(URL, timeout=120).read()
    digest = hashlib.sha256(content).hexdigest()
    if digest != EXPECTED_SHA256:
        raise ValueError('UCI CSV changed: review provenance before a new experiment')
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() != digest:
        raise ValueError('Existing CSV differs; refusing overwrite')
    target.write_bytes(content)
    card = {'name': 'CDC Diabetes Health Indicators', 'uci_id':891,
            'source_url': metadata['repository_url'], 'download_url':URL,
            'retrieved_at_utc':datetime.now(timezone.utc).isoformat(),
            'sha256':digest, 'target':'Diabetes_binary',
            'target_definition':{'0':'no diabetes','1':'prediabetes or diabetes'},
            'expected_rows':253680, 'original_feature_count':21,
            'population':'US survey respondents; self-reported indicators',
            'year_note':'File linked by UCI to the BRFSS2015-derived Kaggle dataset; UCI metadata also links annual_2014. Metadata inconsistency retained; original microdata year not independently audited.',
            'license_note':'UCI defers to the linked original dataset for licensing. Raw CSV is not redistributed in this repository.',
            'legacy_training_dataset_verified':False}
    (directory / 'uci_891_metadata.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
    (directory / 'uci_891_provenance.json').write_text(json.dumps(card,indent=2),encoding='utf-8')
    print(target, digest)
    return target

if __name__ == '__main__':
    fetch()
