async function route(){
 try{
  const path=location.hash?location.hash.replace(/^#\/?/,''):location.pathname.replace(/^\/pishkhan\/?/,'');
  const [kind,arg]=path.split('/').map(decodeURIComponent);
  if(kind==='book'&&arg)return await openBook(arg);
  if(kind==='publisher'&&arg)return await openPublisher(arg);
  if(kind==='book-person'&&arg)return await openBookPerson(arg);
  return await showBooks(['new','used','reviews','publishers','people','all'].includes(arg)?arg:'books');
 }catch(error){console.error(error);document.getElementById('books-content').innerHTML='<p role="alert">دریافت پیشخوان انجام نشد. دوباره تلاش کنید.</p><button onclick="route()">تلاش دوباره</button>'}
}
window.addEventListener('hashchange',route);window.addEventListener('popstate',route);route();
