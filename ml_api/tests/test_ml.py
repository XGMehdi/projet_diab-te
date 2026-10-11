import contextlib
import io
import os
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import nbformat
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient
from ml_api import main
from ml_api.schema import CSV_FEATURES, FEATURES
from ml_api.training import load_data, run_experiment

ROOT = Path(__file__).resolve().parents[1]

class MLTests(unittest.TestCase):
    def payload(self):
        row = dict.fromkeys(FEATURES, False)
        row.update(bmi=30, genHlth=3, mentHlth=2, physHlth=4, age=8, sex='MALE')
        return row

    def test_real_artifact_shap_and_contract(self):
        self.assertIsNotNone(main.model, 'Legacy artifact must load for this integration test')
        client = TestClient(main.app)
        for changes in [{}, {'highBp':True, 'bmi':42, 'age':13}, {'bmi':20,'age':1,'sex':'FEMALE'}]:
            response = client.post('/predict', json=self.payload() | changes)
            self.assertEqual(response.status_code, 200, response.text)
            body = response.json()
            values = json.loads(body['shapValuesAsJsonString'])
            self.assertEqual(list(values), FEATURES)
            margin = body['shapBaseValue'] + sum(values.values())
            self.assertAlmostEqual(1 / (1 + np.exp(-margin)), body['riskScore'], places=5)
            self.assertEqual(body['shapOutputSpace'], 'log_odds')
        with patch.object(main, 'model', None):
            self.assertEqual(client.post('/predict', json=self.payload()).status_code, 503)
        for field, value in [('age',45), ('sex','UNKNOWN'), ('mentHlth',31)]:
            self.assertEqual(client.post('/predict', json=self.payload() | {field:value}).status_code, 422)

    def test_notebook_schema(self):
        nbformat.validate(nbformat.read(ROOT / 'training.ipynb', as_version=4))

    def test_synthetic_workflow_only(self):
        # Artificial data checks software, never used as PFE performance evidence.
        rng = np.random.default_rng(12)
        n = 160
        frame = pd.DataFrame(rng.integers(0,2,(n,len(CSV_FEATURES))), columns=CSV_FEATURES)
        frame['BMI'] = rng.uniform(18,45,n)
        for c,lo,hi in [('GenHlth',1,6),('MentHlth',0,31),('PhysHlth',0,31),('Age',1,14)]:
            frame[c] = rng.integers(lo,hi,n)
        frame['Diabetes_binary'] = np.arange(n) % 2
        frame = pd.concat([frame,frame.iloc[:2]], ignore_index=True)
        before = {p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in ROOT.glob('*.pkl')}
        with tempfile.TemporaryDirectory() as folder:
            folder = Path(folder)
            csv = folder / 'synthetic.csv'
            frame.to_csv(csv,index=False)
            _,_,_,removed = load_data(csv, 'Diabetes_binary')
            self.assertEqual(removed,2)
            a = run_experiment(csv,folder / 'a')
            notebook = nbformat.read(ROOT / 'training.ipynb', as_version=4)
            namespace = {'display': lambda *args: None}
            with patch.dict(os.environ, {'ML_DATA_PATH':str(csv), 'ML_RUN_DIR':str(folder / 'b')}):
                with contextlib.redirect_stdout(io.StringIO()):
                    for cell in notebook.cells:
                        if cell.cell_type == 'code':
                            exec(compile(cell.source, 'training.ipynb', 'exec'), namespace)
            b = (namespace['cv_summary'], namespace['test_metrics'], namespace['manifest'])
            pd.testing.assert_frame_equal(a[1],b[1])
            self.assertEqual(a[2]['train_rows'], b[2]['train_rows'])
            self.assertEqual(len(a[1]),4)
            with self.assertRaises(FileExistsError):
                run_experiment(csv,folder / 'a')
            frame.loc[0,'Age'] = 45
            frame.to_csv(csv,index=False)
            with self.assertRaises(ValueError):
                load_data(csv,'Diabetes_binary')
        self.assertEqual(before, {p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in ROOT.glob('*.pkl')})

if __name__ == '__main__':
    unittest.main()
