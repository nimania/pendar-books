/* Regression: expired trend evidence must not hide the migrated catalog. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root='web-static/',nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',style:{},dataset:{},classList:{toggle(){}},querySelectorAll:()=>[],querySelector:()=>null});return nodes.get(id)}
const ctx={console,URL,Date,Map,Set,Promise,AbortController,structuredClone,setTimeout,clearTimeout,queueMicrotask:()=>{},history:{pushState(){}},location:{hash:'',pathname:'/pishkhan/',origin:'https://nimania.github.io',href:'https://nimania.github.io/pishkhan/'},navigator:{},localStorage:{getItem:()=>null},document:{getElementById:node,querySelectorAll:()=>[],title:''},fetch:async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+path,'utf8'))}),scrollTo(){}};
ctx.window=ctx;vm.createContext(ctx);
for(const file of ['standalone.js','book-curation.js','book-radar-ui.js','book-places.js','book-directory.js','book-market-ui.js','book-app.js','books-hub.js'])vm.runInContext(fs.readFileSync(root+file,'utf8'),ctx);
(async()=>{
 const data=JSON.parse(fs.readFileSync(root+'data/books.json'));
 const baseline=JSON.parse(fs.readFileSync(root+'data/migration-baseline.json'));
 assert.ok(data.books.length>=3074);
 assert.deepEqual(baseline.book_slugs.filter(s=>!data.books.some(b=>b.slug===s)),[]);
 await ctx.showBooks();
 assert.equal(node('book-result-count').textContent,vm.runInContext('faN',ctx)(data.books.length)+' کتاب');
 for(const source of data.radar.sources.filter(s=>['store','distributor','catalog'].includes(s.kind))){
  const count=vm.runInContext(`booksCache.books.filter(b=>_bookRadarMatches(b,{source:${JSON.stringify(source.id)},signal:'all'})).length`,ctx);
  assert.ok(count>0,source.id+' should retain its recorded books');
  ctx.setBookSource(source.id);
  assert.equal(node('book-result-count').textContent,vm.runInContext('faN',ctx)(count)+' کتاب');
  assert.match(node('book-source-note').innerHTML,/آخرین دریافت موفق/);
  ctx.setBookSource(source.id);
 }
 const expired={slug:'expired',radar:{signals:[{source_id:'taaghche',kind:'new_to_store',position:1,observed_at:new Date(Date.now()-5*864e5).toISOString()}]}};
 assert.equal(ctx._bookRadarScore(expired),0,'stale observations must not score as current');
 assert.equal(ctx._bookRadarMatches(expired,{source:'taaghche',signal:'new_to_store'}),true);
 await ctx.showBooks('new');assert.notEqual(node('book-result-count').textContent,'۰ کتاب');
 for(const mode of ['used','reviews','publishers','people']){await ctx.showBooks(mode);assert.ok(node('books-content').innerHTML)}
 await ctx.openBook(data.books[0].slug);await ctx.openPublisher(data.publishers[0].slug);await ctx.openBookPerson(data.people[0].slug);
 console.log('Complete migration and archived source filters passed: '+data.books.length+' books');
})().catch(error=>{console.error(error);process.exitCode=1});
