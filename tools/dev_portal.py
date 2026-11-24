"""Editor local com Decap Proxy, sem commits nem envio ao GitHub.

Execute: python -X utf8 tools/dev_portal.py
Requer Node.js 20+ e internet para obter o Decap na primeira execução.
"""
import argparse
import json
import os
import shutil
import subprocess
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from gerar_conteudos import build

ROOT = Path(__file__).resolve().parents[1]


def fingerprint(root):
    return tuple((str(p), p.stat().st_mtime_ns, p.stat().st_size)
                 for folder in ('content/posts', 'assets/uploads')
                 for p in sorted((root / folder).rglob('*')) if p.is_file())


def watch(root, stopped):
    previous = fingerprint(root)
    while not stopped.wait(0.8):
        current = fingerprint(root)
        if current != previous:
            try:
                count = build(root)
                print(f'Prévia atualizada: {count} publicações.', flush=True)
                previous = current
            except (ValueError, OSError, json.JSONDecodeError) as error:
                # Tente novamente: o CMS pode ainda estar gravando o arquivo.
                print(f'Geração pendente: {error}', flush=True)
                stopped.wait(2)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8766)
    args = parser.parse_args()
    npx = shutil.which('npx.cmd' if os.name == 'nt' else 'npx')
    if not npx:
        raise SystemExit('Instale Node.js 20 ou superior para iniciar o editor.')
    build(ROOT)
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    env = os.environ | {'BIND_HOST': '127.0.0.1', 'ORIGIN': f'http://127.0.0.1:{args.port}',
                        'PORT': '8081', 'MODE': 'fs', 'GIT_REPO_DIRECTORY': str(ROOT),
                        'npm_config_cache': str(ROOT / '.portal-dev/npm-cache')}
    # fs grava somente arquivos locais; não use MODE=git para esta prévia.
    proxy = subprocess.Popen([npx, '--yes', 'decap-server@3.11.6'], cwd=ROOT, env=env)
    stopped = threading.Event()
    worker = threading.Thread(target=watch, args=(ROOT, stopped), daemon=True)
    worker.start()
    print(f'Área de membros: http://127.0.0.1:{args.port}/admin/', flush=True)
    print('Somente neste computador. Aguarde o Decap Proxy iniciar. Ctrl+C encerra.', flush=True)
    try:
        server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        pass
    finally:
        stopped.set()
        server.server_close()
        if proxy.poll() is None:
            if os.name == 'nt':
                subprocess.run(['taskkill', '/PID', str(proxy.pid), '/T', '/F'], capture_output=True)
            else:
                proxy.terminate()
                proxy.wait(timeout=10)


if __name__ == '__main__':
    main()
