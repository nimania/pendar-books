"""Import dated book evidence from Badbadak without replacing the catalog."""
import hashlib
import json
from pathlib import Path
import re
import unicodedata
from urllib.request import urlopen

FEED = 'https://nimania.github.io/badbadak/data/book-mentions.json'

def norm(s):
    s=unicodedata.normalize('NFKC',str(s or '')).translate(str.maketrans({'ي':'ی','ك':'ک','\u200c':' '}))
    s=re.sub(r'[\u064b-\u065f\u0670]','',s)
    return ' '.join(re.findall(r'\w+',s.casefold()))

def merge(data, payload):
    books=data.setdefault('books',[])
    for incoming in payload.get('books',[]):
        slug=incoming.get('slug','');title=str(incoming.get('title_fa') or '').strip()
        mentions=[m for m in incoming.get('mentions',[]) if isinstance(m,dict) and str(m.get('url','')).startswith('https://nimania.github.io/badbadak/news/')]
        if not re.fullmatch(r'[A-Za-z0-9_-]+',slug) or not title or not mentions:
            continue
        book=next((b for b in books if b['slug']==slug),None)
        if book is None:
            matches=[b for b in books if norm(b.get('title_fa'))==norm(title)]
            if len(matches)==1:book=matches[0]
            elif len(matches)>1:continue
        if book is None:
            book={'slug':slug,'record_type':'work','title_fa':title,'description_fa':'این اثر در خبر بادبادک نام برده شده است؛ شواهد و متن مرتبط در همین صفحه آمده‌اند.','category_fa':'کتاب‌های دیده‌شده در خبرها','creators':incoming.get('creators') or [],'publisher':None,'purchase_links':[],'source_meta':[{'label':'خبر معرفی در بادبادک','url':mentions[0]['url']}],'confidence':'source_identified','discovery':'badbadak_news','mentions':[]}
            books.append(book)
        if book['slug']!=slug:
            book['alias_slugs']=list(dict.fromkeys(book.get('alias_slugs',[])+[slug]))
        old=book.setdefault('mentions',[])
        for mention in mentions:
            clean={k:mention[k] for k in ['kind','source_name','headline_fa','summary_fa','url','original_source_url','published_at','evidence_excerpt'] if k in mention}
            clean['kind']='badbadak'
            existing=next((m for m in old if m.get('kind')=='badbadak' and m.get('url')==clean['url']),None)
            if existing is None:old.append(clean)
            else:existing.update(clean)
        book['mention_count']=len(old)
        for creator in book.get('creators',[]):
            if creator.get('slug') and not any(p.get('slug')==creator['slug'] for p in data.setdefault('people',[])):
                data['people'].append({'slug':creator['slug'],'name_fa':creator['name_fa'],'roles_fa':['نویسنده']})
    return data

def import_mentions(data, output_dir):
    path=Path(output_dir)/'badbadak-book-mentions.json'
    try:
        with urlopen(FEED,timeout=20) as response:payload=json.load(response)
        if not isinstance(payload.get('books'),list):raise ValueError('Invalid mention feed')
        path.write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')))
    except Exception as exc:
        print('Badbadak mention sync unavailable:',type(exc).__name__)
        payload=json.loads(path.read_text()) if path.exists() else {'books':[]}
    before=len(data['books']);merge(data,payload)
    print('Badbadak books:',len(payload.get('books',[])),'new:',len(data['books'])-before)
    return data
