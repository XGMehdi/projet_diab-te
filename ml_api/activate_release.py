"""Publish a verified run locally and activate its exact evaluated API bundle."""
import argparse
import json
import shutil
from pathlib import Path
try:
    from .artifacts import load_runtime, sha256, json_sha256
except ImportError:
    from artifacts import load_runtime, sha256, json_sha256

ROOT = Path(__file__).resolve().parent

def activate(run_dir, release_name):
    run_dir = Path(run_dir).resolve()
    manifest = json.loads((run_dir/'manifest.json').read_text(encoding='utf-8'))
    if manifest.get('status') != 'completed' or not manifest.get('provenance'):
        raise ValueError('Activation requires a completed experiment with documented real data')
    if not manifest['api_artifact'].get('serialized_predictions_verified'):
        raise ValueError('Serialized predictions were not verified')
    source = run_dir/manifest['api_artifact']['path']
    if sha256(source) != manifest['api_artifact']['sha256']:
        raise ValueError('Evaluated artifact has changed')
    if Path(release_name).name != release_name or release_name in ['.','..']:
        raise ValueError('Invalid release name')
    release = ROOT/'releases'/release_name
    release.mkdir(parents=True,exist_ok=False)
    shutil.copy2(source,release/'api_bundle.joblib')
    # Results and anonymous prediction scores are published, never source microdata.
    for item in run_dir.iterdir():
        if item.suffix in ['.csv','.json','.png','.md','.txt']:
            shutil.copy2(item,release/item.name)
    config = {'artifact_path':str((release/'api_bundle.joblib').relative_to(ROOT)).replace('\\','/'),
              'artifact_sha256':manifest['api_artifact']['sha256'],
              'dataset_sha256':manifest['csv_sha256'],
              'evaluation_manifest':str((release/'manifest.json').relative_to(ROOT)).replace('\\','/'),
              'evaluation_manifest_sha256':json_sha256(release/'manifest.json'),
              'evaluation_manifest_hash_format':'canonical-json-v1'}
    temporary = ROOT/'active_artifact.pending.json'
    temporary.write_text(json.dumps(config,indent=2)+'\n',encoding='utf-8')
    load_runtime(ROOT,temporary)
    temporary.replace(ROOT/'active_artifact.json')
    print('Activated:', config['artifact_path'], config['artifact_sha256'])
    return release

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--run',required=True)
    parser.add_argument('--release',required=True)
    args = parser.parse_args()
    activate(args.run,args.release)
