
async function loadContent(){
  const res = await fetch('content.json', { cache: 'no-store' });
  return await res.json();
}
function slugify(s){
  return (s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
}
function goodHeading(t){
  t = (t||'').trim();
  if(t.length < 14) return false;
  if(t.split(/\s+/).length < 2) return false;
  if(/[.!?]$/.test(t)) return false;
  return true;
}
function el(tag, props={}, children=[]){
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k,v])=>{
    if(k==='class') e.className = v;
    else if(k==='html') e.innerHTML = v;
    else if(k.startsWith('on') && typeof v==='function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach(c=>{
    if(c===null || c===undefined) return;
    if(typeof c==='string') e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  });
  return e;
}
function clear(node){ while(node.firstChild) node.removeChild(node.firstChild); }

function buildTopbar(pages, currentSlug){
  const top = document.getElementById('topbar');
  if(!top) return null;

  const kind = document.body.getAttribute('data-kind');
  const showSections = (kind === 'page');

  const selectPages = el('select', { id:'pageSelect', 'aria-label':'Velg side' }, [
    el('option', { value:'' }, 'Velg side…'),
    ...pages.map(p => el('option', { value: `${p.slug}.html`, ...(p.slug===currentSlug?{selected:'selected'}:{}) }, p.title))
  ]);

  const pagesGroup = el('div', { class:'navgroup' }, [
    el('div', { class:'navlabel' }, 'Innhold'),
    selectPages
  ]);

  let selectSections = null;
  let sectionsGroup = null;
  if(showSections){
    selectSections = el('select', { id:'sectionSelect', 'aria-label':'Hopp til avsnitt' }, [
      el('option', { value:'' }, 'Hopp til…')
    ]);
    sectionsGroup = el('div', { class:'navgroup' }, [
      el('div', { class:'navlabel' }, 'På denne siden'),
      selectSections
    ]);
  }

  const controls = el('div', { class:'controls' }, [
    pagesGroup,
    ...(sectionsGroup ? [sectionsGroup] : []),
    el('a', { href:'search.html', class:'navlink' }, 'Søk'),
    el('a', { href:'index.html', class:'navlink' }, 'Hjem'),
  ]);

  const inner = el('div', { class:'inner' }, [
    el('a', { class:'brand', href:'index.html' }, [el('span', { class:'dot' }), ' LIS Onboarding']),
    controls
  ]);

  clear(top);
  top.appendChild(el('div', { class:'topbar' }, inner));

  selectPages.addEventListener('change', ()=>{
    if(selectPages.value) location.href = selectPages.value;
  });

  if(selectSections){
    selectSections.addEventListener('change', ()=>{
      const id = selectSections.value;
      if(!id) return;
      const target = document.getElementById(id);
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
      selectSections.value = '';
    });
  }

  return selectSections;
}

function renderNodes(nodes, sectionSelect){
  const usedIds = new Set();
  const frag = document.createDocumentFragment();
  let h2count = 0;
  nodes.forEach(n=>{
    if(!n || !n.t) return;
    if(n.t === 'h1'){
      return; // title rendered separately
    }
    if(n.t === 'h2'){
      const text = (n.text||'').trim();
      if(!text) return;
      let id = slugify(text) || ('sec-'+(++h2count));
      if(usedIds.has(id)) id = id + '-' + (usedIds.size+1);
      usedIds.add(id);
      const h2 = el('h2', { id }, text);
      frag.appendChild(h2);
      if(sectionSelect){
        sectionSelect.appendChild(el('option', { value:id }, text));
      }
      return;
    }

    if(n.t === 'h3'){
      const text = (n.text||'').trim();
      if(!text) return;
      let id = slugify(text) || ('sub-'+(++h2count));
      if(usedIds.has(id)) id = id + '-' + (usedIds.size+1);
      usedIds.add(id);
      const h3 = el('h3', { id }, text);
      frag.appendChild(h3);
      if(sectionSelect){
        sectionSelect.appendChild(el('option', { value:id }, '– ' + text));
      }
      return;
    }

    if(n.t === 'p'){
      const text = (n.text||'');
      frag.appendChild(el('p', {}, text));
      return;
    }
    if(n.t === 'ul' || n.t === 'ol'){
      const list = el(n.t, {}, []);
      (n.items||[]).forEach(it=> list.appendChild(el('li', {}, (it||''))));
      frag.appendChild(list);
      return;
    }

    if(n.t === 'embed'){
      const wrap = el('div', { class: 'embed' }, []);
      const iframe = el('iframe', {
        src: n.url,
        style: `width:100%; height:${n.height || 220}px; border:0; border-radius:12px;`,
        allow: 'autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture',
        loading: 'lazy'
      });
      wrap.appendChild(iframe);
      frag.appendChild(wrap);
      return;
    }

    if(n.t === 'table'){
      const table = el('table', {}, []);
      const thead = el('thead', {}, []);
      const trh = el('tr', {}, []);
      (n.headers||[]).forEach(h=> trh.appendChild(el('th', {}, (h||''))));
      if((n.headers||[]).length) thead.appendChild(trh);
      table.appendChild(thead);
      const tbody = el('tbody', {}, []);
      (n.rows||[]).forEach(row=>{
        const tr = el('tr', {}, []);
        (row||[]).forEach(cell=> tr.appendChild(el('td', {}, (cell||''))));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      frag.appendChild(table);
      return;
    }
  });
  return frag;
}

async function initIndex(){
  const data = await loadContent();
  const pages = (data.pages||[]).slice().sort((a,b)=> (a.title||'').localeCompare(b.title||'', 'no'));
  buildTopbar(pages, null);
  const grid = document.getElementById('grid');
  if(!grid) return;
  clear(grid);
  pages.forEach(p=>{
    const card = el('div', { class:'card' }, [
      (p.audience ? el('p', { class:'kicker' }, p.audience) : null),
      el('div', { html:`<div style="font-weight:800;font-size:16px"><a href="${p.slug}.html">${p.title}</a>${p.audience?` <span class="badge">${p.audience}</span>`:''}</div>` }),
      null
    ]);
    grid.appendChild(card);
  });
}

function flattenForSearch(data){
  const out = [];
  (data.pages||[]).forEach(p=>{
    let currentH2 = null;
    let currentAnchor = null;
    (p.nodes||[]).forEach(n=>{
      if(n.t==='h2'){
        currentH2 = (n.text||'').trim();
        currentAnchor = slugify(currentH2);
        if(currentH2) out.push({ slug:p.slug, title:p.title, heading:null, anchor:null, text: currentH2 });
      } else if(n.t==='p'){
        const text = (n.text||'').trim();
        if(text) out.push({ slug:p.slug, title:p.title, heading: currentH2, anchor: currentAnchor, text });
      } else if(n.t==='ul' || n.t==='ol'){
        (n.items||[]).forEach(it=>{
          it = (it||'').trim();
          if(it) out.push({ slug:p.slug, title:p.title, heading: currentH2, anchor: currentAnchor, text: it });
        });
      } else if(n.t==='table'){
        (n.rows||[]).forEach(r=> (r||[]).forEach(c=>{
          c=(c||'').trim();
          if(c) out.push({ slug:p.slug, title:p.title, heading: currentH2, anchor: currentAnchor, text: c });
        }));
      }
    });
  });
  return out;
}
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function highlight(text,q){
  if(!q) return text;
  const re = new RegExp(escRe(q), 'ig');
  return text.replace(re, m=>`<mark>${m}</mark>`);
}

async function initSearch(){
  const data = await loadContent();
  const pages = (data.pages||[]).slice();
  const idx = flattenForSearch(data);
  const params = new URLSearchParams(location.search);
  const q0 = (params.get('q')||'').trim();
  const inp = document.getElementById('q');
  if(inp) inp.value = q0;

  buildTopbar(pages, null);

  const out = document.getElementById('results');
  const run = ()=>{
    const q = (inp?.value||'').trim();
    if(!out) return;
    out.innerHTML = '';
    if(q.length<2){
      out.innerHTML = '<div class="small">Skriv minst 2 tegn for å søke.</div>';
      return;
    }
    const s = q.toLowerCase();
    const hits = idx.filter(it => (it.title+' '+(it.heading||'')+' '+it.text).toLowerCase().includes(s));
    if(!hits.length){
      out.innerHTML = '<div class="small">Ingen treff.</div>';
      return;
    }
    const scored = hits.map(it=>{
      let sc=0;
      if((it.title||'').toLowerCase().includes(s)) sc+=4;
      if((it.heading||'').toLowerCase().includes(s)) sc+=2;
      sc += 1;
      return {...it, _sc:sc};
    }).sort((a,b)=>b._sc-a._sc).slice(0,80);

    scored.forEach(it=>{
      const href = `${it.slug}.html${it.anchor ? '#'+it.anchor : ''}`;
      const snippet = it.text.length>260 ? it.text.slice(0,260)+'…' : it.text;
      const heading = it.heading ? ` <span class="badge">${it.heading}</span>` : '';
      out.insertAdjacentHTML('beforeend', `
        <div class="result">
          <div class="t"><a href="${href}">${highlight(it.title, q)}</a>${heading}</div>
          <div class="small">${highlight(snippet, q)}</div>
        </div>
      `);
    });
  };

  inp?.addEventListener('input', ()=>{
    clearTimeout(window.__t);
    window.__t = setTimeout(run, 200);
  });
  document.getElementById('searchForm')?.addEventListener('submit', (e)=>{ e.preventDefault(); run(); });
  run();
}

async function initPage(){
  const data = await loadContent();
  const pages = (data.pages||[]);
  const slug = document.body.getAttribute('data-slug');
  const page = pages.find(p=>p.slug===slug);
  const sectionSelect = buildTopbar(pages, slug);
  const titleEl = document.getElementById('pageTitle');
  const audEl = document.getElementById('pageAudience');
  const contentEl = document.getElementById('pageContent');
  if(!page || !contentEl) return;
  if(titleEl) titleEl.textContent = page.title || '';
  if(audEl) audEl.textContent = page.audience || '';
  clear(contentEl);
  contentEl.appendChild(renderNodes(page.nodes||[], sectionSelect));
}

document.addEventListener('DOMContentLoaded', ()=>{
  const kind = document.body.getAttribute('data-kind');
  if(kind==='index') initIndex();
  else if(kind==='search') initSearch();
  else if(kind==='page') initPage();
});
