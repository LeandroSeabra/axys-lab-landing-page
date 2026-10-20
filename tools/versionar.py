"""Acrescenta ?v=<versão> aos arquivos CSS e JS do próprio site em todas as páginas.

Rode antes de publicar:  python3 tools/versionar.py
Assim o navegador sempre baixa os arquivos novos junto com a página nova,
em vez de misturar página nova com script antigo guardado em cache.
"""
import re, glob, time, sys

versao = sys.argv[1] if len(sys.argv) > 1 else time.strftime("%Y%m%d%H%M")
paginas = [p for p in glob.glob("**/*.html", recursive=True) if not p.startswith((".", "assets/pdf/src", "tools/", "conteudos/", "mockup-conteudos/"))]
padrao = re.compile(r'((?:href|src)="(?!https?:|//)[^"?#]+\.(?:css|js))(?:\?v=[^"]*)?"')
for p in paginas:
    s = open(p, encoding="utf-8").read()
    n = padrao.sub(lambda m: f'{m.group(1)}?v={versao}"', s)
    if n != s:
        open(p, "w", encoding="utf-8").write(n)
print(f"versão {versao} aplicada em {len(paginas)} páginas")
