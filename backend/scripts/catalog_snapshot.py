"""Lossless catalog storage and migration completeness checks, using stdlib only."""
from pathlib import Path
import gzip
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'web-static/data'

def validate(data):
    books = data.get('books', [])
    slugs = [b['slug'] for b in books]
    if not slugs or len(slugs) != len(set(slugs)):
        raise ValueError('Catalog is empty or has duplicate book slugs')
    baseline = DATA / 'migration-baseline.json'
    if baseline.exists():
        missing = set(json.loads(baseline.read_text())['book_slugs']) - set(slugs)
        if missing:
            raise ValueError(f'Migrated books missing: {len(missing)}; examples: {sorted(missing)[:5]}')
    return data

def unpack():
    source = DATA / 'books.json.gz'
    if source.exists():
        raw = gzip.decompress(source.read_bytes())
        validate(json.loads(raw))
        (DATA / 'books.json').write_bytes(raw)
    return validate(json.loads((DATA / 'books.json').read_text()))

def pack():
    data = validate(json.loads((DATA / 'books.json').read_text()))
    raw = json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode()
    (DATA / 'books.json.gz').write_bytes(gzip.compress(raw, mtime=0))
    print(f'Packed complete catalog: {len(data["books"])} books')

if __name__ == '__main__':
    if sys.argv[1] == 'pack':
        pack()
    elif sys.argv[1] == 'unpack':
        print(f'Unpacked complete catalog: {len(unpack()["books"])} books')
    else:
        raise SystemExit('Expected pack or unpack')
