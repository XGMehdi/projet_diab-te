"""Execute the notebook with this Python environment and retain genuine outputs."""
import sys
from pathlib import Path
import nbformat
from nbclient import NotebookClient
from jupyter_client import KernelManager

class ProgressClient(NotebookClient):
    def process_message(self, msg, cell, cell_index):
        if msg.get('msg_type') == 'stream':
            content = msg['content'].get('text', '')
            if 'Training CV:' in content or 'Fitting and evaluating:' in content:
                print(content, end='', flush=True)
        return super().process_message(msg, cell, cell_index)

if __name__ == '__main__':
    root = Path(__file__).resolve().parent
    path = root / 'training.ipynb'
    nb = nbformat.read(path, as_version=4)
    manager = KernelManager(kernel_name='python3')
    manager.kernel_spec.argv[0] = sys.executable
    client = ProgressClient(nb, km=manager, timeout=7200, resources={'metadata':{'path':str(root)}})
    try:
        client.execute()
    finally:
        if manager.has_kernel:
            manager.shutdown_kernel(now=True)
    nbformat.write(nb,path)
    print('Executed notebook saved:', path)
