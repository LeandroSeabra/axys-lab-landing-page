"""Regressões do gerador editorial: python3 -m unittest discover -s tools."""
import json
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path
from gerar_conteudos import build

ROOT = Path(__file__).resolve().parents[1]

class ContentBuildTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in ('content/posts', 'tools/templates', 'assets/css'):
            (self.root / name).mkdir(parents=True)
        for name in ('listing.html', 'article.html', 'shell.html'):
            (self.root / 'tools/templates' / name).write_text((ROOT / 'tools/templates' / name).read_text())
        (self.root / 'sitemap.xml').write_text('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://axysgeosolucoes.com/</loc></url></urlset>')
        self.post = dict(title='Título <script>alert(1)</script>', description='Resumo', type='Artigos e guias', area='Geofísica', author='Equipe Axys', date='2026-01-01', published=True, image='/assets/og/geo.jpg', image_alt='Terreno', caption='Acervo', summary='Resumo central', sections=[dict(heading='Contexto', text='Texto <img src=x onerror=alert(1)>\n\nOutro parágrafo.')])
        (self.root / 'assets/og').mkdir(parents=True)
        (self.root / 'assets/og/geo.jpg').touch()

    def write(self, slug='artigo', **changes):
        (self.root / 'content/posts' / (slug + '.json')).write_text(json.dumps(self.post | changes))

    def test_only_published_nonfuture_posts_and_escape(self):
        self.write()
        self.write('rascunho', published=False)
        self.write('futuro', date=(date.today() + timedelta(days=10)).isoformat())
        build(self.root)
        result = (self.root / 'conteudos/artigo/index.html').read_text()
        self.assertNotIn('<script>alert(1)', result)
        self.assertIn('&lt;img', result)
        self.assertFalse((self.root / 'conteudos/rascunho').exists())
        self.assertFalse((self.root / 'conteudos/futuro').exists())
        self.assertNotIn('rascunho', (self.root / 'sitemap.xml').read_text())

    def test_unpublished_article_is_removed_without_removing_assets(self):
        self.write()
        build(self.root)
        (self.root / 'conteudos/manual.txt').write_text('preservar')
        self.write(published=False)
        build(self.root)
        self.assertFalse((self.root / 'conteudos/artigo/index.html').exists())
        self.assertTrue((self.root / 'conteudos/manual.txt').exists())
        self.assertNotIn('/conteudos/artigo/', (self.root / 'sitemap.xml').read_text())

    def test_bad_filename_and_external_cover_are_rejected(self):
        self.write('Título inválido')
        with self.assertRaises(ValueError): build(self.root)
        (self.root / 'content/posts/Título inválido.json').unlink()
        self.write(image='javascript:alert(1)')
        with self.assertRaises(ValueError): build(self.root)

    def test_references_cta_and_topic_links(self):
        self.write(references=[dict(title='Fonte primária', institution='EPA', url='https://www.epa.gov/environmental-geophysics', year='s.d.')], sections=[dict(heading='Método', text='Texto com fonte.', references=[1])], cta=dict(heading='Avalie seu terreno', text='Converse sobre a investigação.', label='Conhecer o serviço', url='/geo/#contato'), featured=True)
        self.write('outro', title='Outro assunto', area='Topografia')
        build(self.root)
        result = (self.root / 'conteudos/artigo/index.html').read_text()
        self.assertIn('id="referencia-1"', result)
        self.assertIn('href="#referencia-1"', result)
        self.assertIn('https://www.epa.gov/environmental-geophysics', result)
        self.assertIn('href="/geo/#contato"', result)
        self.assertIn('Avalie seu terreno', result)
        listing = (self.root / 'conteudos/index.html').read_text()
        featured = listing.split('class="feature wrap"')[1].split('</section>')[0]
        self.assertIn('href="/conteudos/artigo/"', featured)
        self.assertNotIn('Outro assunto', featured)

    def test_reject_unsafe_reference_and_cta(self):
        self.write(references=[dict(title='Fonte', institution='Teste', url='javascript:alert(1)', year='2026')])
        with self.assertRaises(ValueError): build(self.root)
        self.write(cta=dict(heading='Título', text='Texto', label='Link', url='//evil.example'))
        with self.assertRaises(ValueError): build(self.root)
        self.write(sections=[dict(heading='Título', text='Texto', references=[9])])
        with self.assertRaises(ValueError): build(self.root)

    def test_comparison_table_is_accessible_and_escaped(self):
        self.write(sections=[dict(heading='Comparação', text='Contexto', table=dict(headers=['Método', 'Limite'], rows=[dict(cells=['<script>teste</script>', 'Contexto necessário'])]))])
        build(self.root)
        result = (self.root / 'conteudos/artigo/index.html').read_text()
        self.assertIn('<th scope="col">Método</th>', result)
        self.assertIn('&lt;script&gt;teste&lt;/script&gt;', result)
        self.assertIn('tabindex="0" role="region"', result)
        self.write(sections=[dict(heading='Comparação', text='Contexto', table=dict(headers=['A', 'B'], rows=[dict(cells=['Só uma'])]))])
        with self.assertRaises(ValueError): build(self.root)

    def test_deterministic_output(self):
        self.write()
        build(self.root)
        before = (self.root / 'conteudos/index.html').read_bytes()
        build(self.root)
        self.assertEqual(before, (self.root / 'conteudos/index.html').read_bytes())

if __name__ == '__main__': unittest.main()
