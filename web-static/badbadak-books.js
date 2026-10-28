/* Resolve a just-published book before the next scheduled catalog build. */
function mergeBadbadakBooks(data,payload){
 for(const incoming of payload.books||[]){
  if(!/^[A-Za-z0-9_-]+$/.test(incoming.slug||'')||!incoming.title_fa)continue;
  const mentions=(incoming.mentions||[]).filter(m=>typeof m.url==='string'&&m.url.startsWith('https://nimania.github.io/badbadak/news/'));
  if(!mentions.length)continue;
  let book=(data.books||[]).find(b=>b.slug===incoming.slug||(b.alias_slugs||[]).includes(incoming.slug));
  if(!book){book={slug:incoming.slug,title_fa:incoming.title_fa,record_type:'work',description_fa:'این اثر در خبر بادبادک نام برده شده است؛ متن و شواهد مرتبط در همین صفحه آمده‌اند.',category_fa:'کتاب‌های دیده‌شده در خبرها',creators:incoming.creators||[],publisher:null,purchase_links:[],source_meta:[{label:'معرفی در بادبادک',url:mentions[0].url}],mentions:[]};data.books.push(book)}
  for(const m of mentions){const prior=(book.mentions||[]).find(x=>x.kind==='badbadak'&&x.url===m.url);if(prior)Object.assign(prior,m,{kind:'badbadak'});else(book.mentions||=[]).push({...m,kind:'badbadak'})}book.mention_count=book.mentions.length;
 }
 return data;
}
async function resolveBadbadakBook(data,slug){
 try{const payload=await getJSON('https://nimania.github.io/badbadak/data/book-mentions.json',10000);mergeBadbadakBooks(data,payload)}catch(_){}
 return _bookBySlug(data,slug);
}
function badbadakBookLinks(book){
 const rows=(book.mentions||[]).filter(m=>m.kind==='badbadak'&&typeof m.url==='string'&&m.url.startsWith('https://nimania.github.io/badbadak/news/'));
 if(!rows.length)return '';
 return `<section class="book-badbadak-links"><h2>این کتاب در بادبادک</h2><p class="book-method">خبرها و گفت‌وگوهایی که در آن‌ها از این اثر نام برده شده است.</p>${rows.map(m=>`<a class="book-mention" href="${esc(m.url)}" target="_blank" rel="noopener noreferrer"><span class="book-mention-source">${esc(m.source_name||'بادبادک')}</span><strong>${esc(m.headline_fa||'خبر مرتبط')}</strong>${m.evidence_excerpt?`<p>${esc(m.evidence_excerpt)}</p>`:''}</a>`).join('')}</section>`;
}
