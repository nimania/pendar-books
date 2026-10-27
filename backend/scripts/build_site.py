"""Build a self-contained Pages artifact and crawlable book entry pages."""
from pathlib import Path
import shutil, json, html, re

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'web-static'
SITE = ROOT / 'site'
if SITE.exists():
    shutil.rmtree(SITE)
shutil.copytree(SOURCE, SITE)
template = (SOURCE / 'index.html').read_text()
data = json.loads((SOURCE / 'data/books.json').read_text())
assert data.get('books'), 'Empty book catalog'
urls = ['https://nimania.github.io/pishkhan/']
for kind, rows in [('book', data['books']), ('publisher', data.get('publishers', [])), ('book-person', data.get('people', []))]:
    for row in rows:
        slug = row.get('slug', '')
        if not slug or '/' in slug or '..' in slug:
            continue
        url = f'https://nimania.github.io/pishkhan/{kind}/{slug}/'
        title = html.escape(row.get('title_fa') or row.get('name_fa') or 'پیشخوان کتاب')
        description = html.escape(row.get('description_fa') or f'{title} در پیشخوان کتاب')
        page = template.replace('<head>', '<head><base href="/pishkhan/">', 1)
        page = re.sub(r'<title>.*?</title>', f'<title>{title} | پیشخوان کتاب</title>', page, count=1)
        page = page.replace('href="https://nimania.github.io/pishkhan/"', f'href="{html.escape(url)}"', 1)
        page = page.replace('<p>در حال دریافت کتاب‌ها…</p>', f'<h1>{title}</h1><p>{description}</p>')
        target = SITE / kind / slug / 'index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page)
        urls.append(url)
(SITE / '.nojekyll').touch()
(SITE / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(f'<url><loc>{html.escape(u)}</loc></url>' for u in urls) + '</urlset>')
print(f'Built independent Pishkhan site: {len(data["books"])} books, {len(urls)} URLs')
