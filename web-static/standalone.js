/* Standalone shell. Only explicit outbound links refer to the parent project. */
const DATA='data';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const faN=s=>String(s).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
async function getJSON(path,timeout=12000){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeout);try{const r=await fetch(path,{signal:ctrl.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(timer)}}
function show(){window.scrollTo({top:0,behavior:'instant'})}
function setTab(){}
function setHash(hash){if(location.hash!==hash)history.pushState(null,'',hash)}
function articleDisplayAdMarkup(){return ''}
function loadArticleDisplayAd(){}
function canonicalStrip(){return ''}
function parentPage(kind,id){location.href='https://pendar.io/'+kind+'/'+encodeURIComponent(id)+'/'}
function openStory(id){parentPage('story',id)}
function openPressArticle(id){parentPage('press-article',id)}
function openStatement(id){parentPage('statement',id)}
function openFigure(id){parentPage('figure',id)}
