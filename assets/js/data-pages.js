(() => {
  const scriptEl = document.currentScript;
  const siteRoot = new URL('../../', scriptEl.src);
  const page = document.body.dataset.page || '';

  const esc = (v='') => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const asset = (p='') => p ? new URL(String(p).replace(/^\/+/, ''), siteRoot).href : '';
  const workbookUrl = new URL('data/kee_lab_content.xlsx', siteRoot).href;

  const truthy = v => v === true || ['true','1','yes','y'].includes(String(v ?? '').trim().toLowerCase());
  const text = v => v == null ? '' : String(v).trim();
  const num = (v, fallback=0) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
  };

  const excelDateToISO = v => {
    if (!v) return '';
    if (v instanceof Date && !Number.isNaN(v.getTime())) {
      const y = v.getFullYear();
      const m = String(v.getMonth()+1).padStart(2,'0');
      const d = String(v.getDate()).padStart(2,'0');
      return `${y}-${m}-${d}`;
    }
    if (typeof v === 'number' && window.XLSX?.SSF?.parse_date_code) {
      const x = XLSX.SSF.parse_date_code(v);
      if (x) return `${x.y}-${String(x.m).padStart(2,'0')}-${String(x.d).padStart(2,'0')}`;
    }
    const s = text(v).replace(/\./g,'-').replace(/\//g,'-');
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
    return s;
  };

  const imagePath = (folder, filename) => {
    const f = text(filename);
    if (!f) return '';
    if (/^(https?:\/\/|assets\/)/i.test(f)) return f;
    return `assets/uploads/${folder}/${f}`;
  };

  let workbookPromise = null;

  async function getWorkbook(){
    if (!window.XLSX) throw new Error('Excel reader library did not load.');
    if (!workbookPromise) {
      workbookPromise = fetch(`${workbookUrl}?v=${Date.now()}`, {cache:'no-store'})
        .then(r => {
          if (!r.ok) throw new Error(`Excel HTTP ${r.status}`);
          return r.arrayBuffer();
        })
        .then(buf => XLSX.read(buf, {type:'array', cellDates:true}));
    }
    return workbookPromise;
  }

  async function sheetRows(sheetName){
    const wb = await getWorkbook();
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];
    return XLSX.utils.sheet_to_json(ws, {defval:'', raw:true});
  }

  async function load(name){
    try{
      if(name === 'members'){
        const rows = (await sheetRows('Members'))
          .filter(r => truthy(r.active))
          .map(r => ({
            id:text(r.id) || text(r.name_en).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
            sort_order:num(r.sort_order,999),
            name_ko:text(r.name_ko),
            name_en:text(r.name_en),
            role_group:text(r.role_group).toLowerCase(),
            role_label:text(r.role_label),
            research_interests:text(r.research_interests),
            email:text(r.email),
            profile_url:text(r.profile_url),
            photo:imagePath('members',r.photo_file)
          }))
          .sort((a,b)=>(a.sort_order-b.sort_order) || (a.name_ko||a.name_en).localeCompare(b.name_ko||b.name_en,'ko'));
        return rows;
      }

      if(name === 'alumni'){
        return (await sheetRows('Alumni'))
          .filter(r => truthy(r.active))
          .map(r => ({
            id:text(r.id),
            name_ko:text(r.name_ko),
            name_en:text(r.name_en),
            degree:text(r.degree),
            graduation_year:num(r.graduation_year),
            affiliation:text(r.affiliation),
            position:text(r.position),
            note:text(r.note)
          }))
          .sort((a,b)=>(b.graduation_year-a.graduation_year) || (a.name_ko||a.name_en).localeCompare(b.name_ko||b.name_en,'ko'));
      }

      if(name === 'publications'){
        return (await sheetRows('Publications'))
          .filter(r => truthy(r.active))
          .map(r => ({
            id:text(r.id),
            featured:truthy(r.featured),
            year:num(r.year),
            type:text(r.type).toLowerCase(),
            title:text(r.title),
            authors:text(r.authors),
            venue:text(r.venue),
            volume_issue:text(r.volume_issue),
            doi_url:text(r.doi_url),
            pdf_url:text(r.pdf_url),
            keywords:text(r.keywords)
          }))
          .sort((a,b)=>(b.year-a.year) || (Number(b.featured)-Number(a.featured)) || a.title.localeCompare(b.title));
      }

      if(name === 'news'){
        return (await sheetRows('News'))
          .filter(r => truthy(r.active))
          .map(r => ({
            id:text(r.id),
            featured:truthy(r.featured),
            date:excelDateToISO(r.date),
            category:text(r.category).toLowerCase(),
            title:text(r.title),
            summary:text(r.summary),
            body:text(r.body),
            image:imagePath('news',r.image_file),
            link_url:text(r.link_url)
          }))
          .sort((a,b)=>String(b.date).localeCompare(String(a.date)) || Number(b.featured)-Number(a.featured));
      }

      if(name === 'gallery'){
        return (await sheetRows('Gallery'))
          .filter(r => truthy(r.active))
          .map(r => ({
            id:text(r.id),
            featured:truthy(r.featured),
            date:excelDateToISO(r.date),
            category:text(r.category).toLowerCase(),
            title:text(r.title),
            caption:text(r.caption),
            image:imagePath('gallery',r.image_file),
            album:text(r.album)
          }))
          .sort((a,b)=>String(b.date).localeCompare(String(a.date)) || Number(b.featured)-Number(a.featured));
      }

      return [];
    }catch(e){
      console.error(`KEE LAB: failed to read ${name} from Excel`, e);
      return [];
    }
  }

  const imgStyle = p => p ? `style="background-image:linear-gradient(180deg,rgba(7,95,130,.04),rgba(7,95,130,.18)),url('${asset(p)}');background-size:cover;background-position:center"` : '';
  const fmtDate = (v, mode='full') => {
    if (!v) return '';
    const d = new Date(v + (String(v).length === 10 ? 'T00:00:00' : ''));
    if (Number.isNaN(d.getTime())) return esc(v);
    if (mode === 'month') return d.toLocaleDateString('en-US',{month:'short',year:'numeric'}).toUpperCase().replace(' ', ' · ');
    return d.toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}).toUpperCase().replace(',', ' ·');
  };
  const yearOf = v => String(v || '').slice(0,4);
  const empty = msg => `<div class="data-empty glass"><b>Content is being prepared.</b><span>${esc(msg)}</span></div>`;
  const safeLink = u => u ? esc(u) : '#';

  async function initHome(){
    const [pubs, news] = await Promise.all([load('publications'), load('news')]);
    const pubList = document.querySelector('.pub-list');
    if (pubList) {
      const chosen = [...pubs].sort((a,b)=>(Number(b.featured)-Number(a.featured)) || (Number(b.year)-Number(a.year))).slice(0,3);
      pubList.innerHTML = chosen.length ? chosen.map(p => `
        <a class="pub" href="publications/">
          <span class="year">${esc(p.year)}</span>
          <div><strong>${esc(p.title)}</strong><small>${esc([p.authors,p.venue].filter(Boolean).join(' · '))}</small></div>
          <span class="pill">${esc(String(p.type||'WORK').toUpperCase())}</span>
        </a>`).join('') : empty('Publications will be updated from the Excel file.');
    }
    const grid = document.querySelector('main .news-grid');
    if (grid) {
      const chosen = [...news].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,3);
      grid.innerHTML = chosen.length ? chosen.map(n => `
        <a class="news-card" href="${n.link_url ? safeLink(n.link_url) : 'news/'}" ${n.link_url ? 'target="_blank" rel="noopener"' : ''}>
          <div class="thumb" ${imgStyle(n.image)}></div>
          <div class="news-body"><span class="news-date">${fmtDate(n.date,'month')}</span><h3>${esc(n.title)}</h3><p>${esc(n.summary||'')}</p></div>
        </a>`).join('') : empty('News will be updated from the Excel file.');
    }
  }

  async function initMembers(){
    const data = await load('members');
    const root = document.getElementById('membersDynamic');
    if (!root) return;
    const stats = document.querySelectorAll('.members-stat .stat strong');
    if (stats.length >= 4) {
      stats[0].textContent = data.filter(x=>x.role_group==='phd').length;
      stats[1].textContent = data.filter(x=>x.role_group==='ma').length;
      stats[2].textContent = data.filter(x=>x.role_group==='researcher').length;
      stats[3].textContent = '1';
    }
    const labels = {phd:'Doctoral Students',ma:"Master's Students",researcher:'Researchers'};
    const order = ['phd','ma','researcher'];
    const filters = [...document.querySelectorAll('.filters .filter')];
    const render = f => {
      const subset = f==='all' ? data : data.filter(x=>x.role_group===f);
      if (!subset.length) { root.innerHTML = empty('Member information will be updated from the Excel file.'); return; }
      root.innerHTML = order.filter(role=>subset.some(x=>x.role_group===role)).map(role => {
        const rows = subset.filter(x=>x.role_group===role);
        return `<div class="section-title-row"><h3>${labels[role]}</h3><span class="count">${rows.length}</span></div>
        <div class="member-grid">${rows.map(m=>`
          <article class="member-card glass" data-role="${esc(m.role_group)}">
            <div class="member-photo ${m.photo?'has-photo':''}" ${imgStyle(m.photo)}>${m.photo?'': 'PROFILE IMAGE'}</div>
            <div class="member-info">
              <h3>${esc(m.name_ko || m.name_en || 'Member')}</h3>
              ${m.name_en && m.name_ko ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(m.name_en)}</div>`:''}
              <div class="degree">${esc(m.role_label || '')}</div>
              <p>${m.research_interests ? `Research Interests · ${esc(m.research_interests)}` : ''}</p>
              <div class="member-links">
                ${m.profile_url ? `<a href="${safeLink(m.profile_url)}" target="_blank" rel="noopener">PROFILE ↗</a>`:''}
                ${m.email ? `<a href="mailto:${esc(m.email)}">EMAIL ↗</a>`:''}
              </div>
            </div>
          </article>`).join('')}</div>`;
      }).join('');
    };
    filters.forEach(b=>b.addEventListener('click',()=>{
      filters.forEach(x=>x.classList.remove('active')); b.classList.add('active'); render(b.dataset.filter || 'all');
    }));
    render('all');
  }

  async function initAlumni(){
    const data = await load('alumni');
    const archive = document.getElementById('archive');
    if (!archive) return;
    const search = document.getElementById('alumniSearch');
    const degree = document.getElementById('degreeFilter');
    const decSel = document.getElementById('decadeSelect');
    const decBtns = document.querySelector('.decades');
    const degreeValues = [...new Set(data.map(x=>x.degree).filter(Boolean))].sort();
    degree.innerHTML = '<option value="all">ALL DEGREES</option>' + degreeValues.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    const decades = [...new Set(data.map(x=>Math.floor(Number(x.graduation_year)/10)*10).filter(Boolean))].sort((a,b)=>b-a);
    decSel.innerHTML = '<option value="all">ALL DECADES</option>' + decades.map(x=>`<option value="${x}s">${x}s</option>`).join('');
    decBtns.innerHTML = '<button class="decade-btn active" data-decade="all">ALL</button>' + decades.map(x=>`<button class="decade-btn" data-decade="${x}s">${x}s</button>`).join('');
    if (data.length) {
      const earliest = Math.min(...data.map(x=>Number(x.graduation_year)).filter(Boolean));
      const legacy = document.querySelector('.archive-card strong');
      if (legacy && Number.isFinite(earliest)) legacy.textContent = `${Math.floor(earliest/10)*10}s—`;
    }
    let decade='all';
    const render = () => {
      const q=(search.value||'').trim().toLowerCase(), d=degree.value, chosen=decSel.value!=='all'?decSel.value:decade;
      const rows = data.filter(x=>{
        const text=[x.name_ko,x.name_en,x.affiliation,x.position,x.note].join(' ').toLowerCase();
        const dec=`${Math.floor(Number(x.graduation_year)/10)*10}s`;
        return (!q||text.includes(q)) && (d==='all'||x.degree===d) && (chosen==='all'||dec===chosen);
      });
      if (!rows.length) { archive.innerHTML = '<div class="no-results" style="display:block">조건에 맞는 Alumni가 없습니다.</div>'; return; }
      const groups={};
      rows.forEach(x=>{ const dec=`${Math.floor(Number(x.graduation_year)/10)*10}s`; (groups[dec]??={}); (groups[dec][x.graduation_year]??=[]).push(x); });
      archive.innerHTML = Object.keys(groups).sort((a,b)=>parseInt(b)-parseInt(a)).map(dec=>`
        <div class="decade-block"><h3 class="decade-title">${dec}</h3>
          ${Object.keys(groups[dec]).sort((a,b)=>b-a).map(y=>`<div class="year-group"><div class="year-label">${y}</div><div class="alumni-list">
            ${groups[dec][y].map(a=>`<div class="alumni-row"><b>${esc(a.name_ko||a.name_en||'Alumni')}</b><span class="degree">${esc(a.degree||'')}</span><span class="position">${esc([a.affiliation,a.position].filter(Boolean).join(' · '))}</span><span class="arrow">↗</span></div>`).join('')}
          </div></div>`).join('')}
        </div>`).join('');
    };
    search.addEventListener('input',render); degree.addEventListener('change',render); decSel.addEventListener('change',render);
    decBtns.addEventListener('click',e=>{ const b=e.target.closest('.decade-btn'); if(!b)return; [...decBtns.querySelectorAll('.decade-btn')].forEach(x=>x.classList.remove('active')); b.classList.add('active'); decade=b.dataset.decade; decSel.value='all'; render(); });
    render();
  }

  async function initPublications(){
    let data = await load('publications');
    const stats = document.querySelectorAll('.hero-stat-card .stat strong');
    if (stats.length>=4) {
      stats[0].textContent=data.length;
      stats[1].textContent=data.filter(x=>x.type==='journal').length;
      stats[2].textContent=data.filter(x=>['book','chapter'].includes(x.type)).length;
      const years=data.map(x=>Number(x.year)).filter(Boolean); stats[3].textContent=years.length?`${Math.floor(Math.min(...years)/10)*10}s—`:'—';
    }
    const featured=document.querySelector('.featured-grid');
    const feats=data.filter(x=>truthy(x.featured));
    const chosen=(feats.length?feats:data).slice(0,2);
    featured.innerHTML=chosen.length?chosen.map((p,i)=>`<article class="feature-card glass"><div class="feature-top"><span class="feature-no">FEATURED · ${String(i+1).padStart(2,'0')}</span><span class="type-pill">${esc(String(p.type||'work').toUpperCase())}</span></div><h3>${esc(p.title)}</h3><p>${esc([p.authors,p.venue,p.volume_issue,p.year].filter(Boolean).join(' · '))}</p><div class="feature-actions">${p.doi_url?`<a class="btn primary" target="_blank" rel="noopener" href="${safeLink(p.doi_url)}">DOI ↗</a>`:''}${p.pdf_url?`<a class="btn" target="_blank" rel="noopener" href="${safeLink(p.pdf_url)}">PDF</a>`:''}<button class="btn cite-dynamic" data-cite="${esc([p.authors,`(${p.year})`,p.title,p.venue].filter(Boolean).join('. '))}">CITE</button></div></article>`).join(''):empty('Featured publications will appear after Excel data is added.');

    const search=document.getElementById('searchInput'), year=document.getElementById('yearSelect'), sort=document.getElementById('sortSelect'), filters=[...document.querySelectorAll('.filter-row .filter')];
    const years=[...new Set(data.map(x=>String(x.year)).filter(Boolean))].sort((a,b)=>b-a);
    year.innerHTML='<option value="all">ALL YEARS</option>'+years.map(y=>`<option value="${esc(y)}">${esc(y)}</option>`).join('');
    let active='all';
    const archive=document.getElementById('publicationArchive'), count=document.getElementById('resultCount'), no=document.getElementById('noResults');
    const render=()=>{
      const q=(search.value||'').trim().toLowerCase(), y=year.value;
      let rows=data.filter(p=>{const text=[p.title,p.authors,p.venue,p.keywords].join(' ').toLowerCase(); return(!q||text.includes(q))&&(y==='all'||String(p.year)===y)&&(active==='all'||p.type===active)});
      rows.sort((a,b)=>sort.value==='old'?Number(a.year)-Number(b.year):Number(b.year)-Number(a.year));
      count.textContent=rows.length;
      if(!rows.length){archive.innerHTML='';no.style.display='block';return;} no.style.display='none';
      const groups={}; rows.forEach(p=>(groups[p.year]??=[]).push(p));
      const ordered=Object.keys(groups).sort((a,b)=>sort.value==='old'?a-b:b-a);
      archive.innerHTML=ordered.map(y=>`<section class="year-block"><h3 class="year-title">${esc(y)} <span class="count">${groups[y].length} ITEMS</span></h3><div class="pub-list">${groups[y].map((p,i)=>`<article class="pub-row"><div class="pub-index">${String(i+1).padStart(2,'0')}</div><div class="pub-main"><h3>${esc(p.title)}</h3><div class="authors">${esc(p.authors||'')}</div><div class="venue">${esc([p.venue,p.volume_issue].filter(Boolean).join(' · '))}</div><div class="badges">${String(p.keywords||'').split(';').map(x=>x.trim()).filter(Boolean).slice(0,4).map(k=>`<span class="badge">${esc(k.toUpperCase())}</span>`).join('')}</div></div><div class="pub-actions">${p.doi_url?`<a class="icon-btn" target="_blank" rel="noopener" href="${safeLink(p.doi_url)}">DOI ↗</a>`:''}${p.pdf_url?`<a class="icon-btn" target="_blank" rel="noopener" href="${safeLink(p.pdf_url)}">PDF</a>`:''}<button class="icon-btn cite-dynamic" data-cite="${esc([p.authors,`(${p.year})`,p.title,p.venue].filter(Boolean).join('. '))}">CITE</button></div></article>`).join('')}</div></section>`).join('');
    };
    search.addEventListener('input',render); year.addEventListener('change',render); sort.addEventListener('change',render);
    filters.forEach(b=>b.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));b.classList.add('active');active=b.dataset.type||'all';render()}));
    document.addEventListener('click',e=>{const b=e.target.closest('.cite-dynamic');if(!b)return; navigator.clipboard?.writeText(b.dataset.cite||'').then(()=>{const old=b.textContent;b.textContent='COPIED';setTimeout(()=>b.textContent=old,1000)}).catch(()=>alert(b.dataset.cite||''));});
    const books=document.querySelector('.book-grid'); const bookRows=data.filter(x=>['book','chapter'].includes(x.type)).slice(0,6);
    books.innerHTML=bookRows.length?bookRows.map(p=>`<article class="book-card glass"><span class="book-year">${esc(p.year)} · ${esc(String(p.type).toUpperCase())}</span><h3>${esc(p.title)}</h3><p>${esc([p.authors,p.venue].filter(Boolean).join(' · '))}</p><span class="book-link">↗</span></article>`).join(''):empty('Books and chapters will be updated from the Excel file.');
    render();
  }

  async function initNews(){
    const [data,gallery] = await Promise.all([load('news'),load('gallery')]);
    const hero=data.find(x=>truthy(x.featured))||data[0];
    if(hero){ const box=document.querySelector('.hero-feature'), copy=box?.querySelector('.hero-feature-copy'); if(box&&hero.image){box.style.backgroundImage=`linear-gradient(145deg,rgba(8,127,165,.50),rgba(34,185,220,.32)),url('${asset(hero.image)}')`;box.style.backgroundSize='cover';box.style.backgroundPosition='center';} if(copy) copy.innerHTML=`<small>FEATURED · ${fmtDate(hero.date,'month')}</small><h2>${esc(hero.title)}</h2><p>${esc(hero.summary||'')}</p>`; }
    const search=document.getElementById('newsSearch'), year=document.getElementById('yearFilter'), filters=[...document.querySelectorAll('.filter-row .filter')];
    const years=[...new Set(data.map(x=>yearOf(x.date)).filter(Boolean))].sort((a,b)=>b-a); year.innerHTML='<option value="all">ALL YEARS</option>'+years.map(y=>`<option value="${y}">${y}</option>`).join('');
    let active='all'; const grid=document.getElementById('newsGrid'), no=document.getElementById('noResults');
    const render=()=>{const q=(search.value||'').trim().toLowerCase(), y=year.value;const rows=data.filter(n=>{const text=[n.title,n.summary,n.body,n.category].join(' ').toLowerCase();return(!q||text.includes(q))&&(y==='all'||yearOf(n.date)===y)&&(active==='all'||n.category===active)}); if(!rows.length){grid.innerHTML='';no.style.display='block'}else{no.style.display='none';grid.innerHTML=rows.map(n=>`<article class="news-card glass"><div class="news-media" ${imgStyle(n.image)}><span class="news-category">${esc(String(n.category||'news').toUpperCase())}</span></div><div class="news-body"><div class="news-date">${fmtDate(n.date)}</div><h3>${esc(n.title)}</h3><p>${esc(n.summary||'')}</p><div class="news-bottom">${n.link_url?`<a class="readmore" target="_blank" rel="noopener" href="${safeLink(n.link_url)}">READ STORY ↗</a>`:'<span class="readmore">KEE LAB UPDATE</span>'}<span class="tag">${esc(String(n.category||'news').toUpperCase())}</span></div></div></article>`).join('')}};
    search.addEventListener('input',render);year.addEventListener('change',render);filters.forEach(b=>b.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));b.classList.add('active');active=b.dataset.category||'all';render()}));render();
    const archive=document.querySelector('.archive'); if(archive){archive.innerHTML=data.slice(0,20).map(n=>`<${n.link_url?'a':'div'} class="archive-row" ${n.link_url?`href="${safeLink(n.link_url)}" target="_blank" rel="noopener"`:''}><span class="archive-date">${esc(n.date||'')}</span><span class="archive-cat">${esc(String(n.category||'news').toUpperCase())}</span><span class="archive-title">${esc(n.title)}</span><span class="archive-arrow">↗</span></${n.link_url?'a':'div'}>`).join('')||empty('News archive will be updated from Excel.');}
    const main=document.querySelector('.gallery-main'), tiles=[...document.querySelectorAll('.gallery-tile')], cap=document.querySelector('.gallery-caption'); const pics=gallery.slice(0,3); if(main&&pics[0]){main.href='../gallery/';main.style.backgroundImage=`url('${asset(pics[0].image)}')`;main.style.backgroundSize='cover';main.style.backgroundPosition='center';if(cap)cap.innerHTML=`<b>${esc(pics[0].title)}</b><span>${esc(pics[0].caption||'')}</span>`;} tiles.forEach((t,i)=>{const p=pics[i+1];t.href='../gallery/';if(p){t.style.backgroundImage=`url('${asset(p.image)}')`;t.style.backgroundSize='cover';t.style.backgroundPosition='center';}});
    const galleryBtn=[...document.querySelectorAll('a.btn.primary')].find(x=>x.textContent.includes('PHOTO GALLERY'));if(galleryBtn)galleryBtn.href='../gallery/';
  }

  async function initGallery(){
    const data=await load('gallery');
    const heroPhotos=[...document.querySelectorAll('.hero-photo')]; data.slice(0,3).forEach((p,i)=>{if(heroPhotos[i]&&p.image){heroPhotos[i].style.backgroundImage=`url('${asset(p.image)}')`;heroPhotos[i].style.backgroundSize='cover';heroPhotos[i].style.backgroundPosition='center';}});
    const feat=data.find(x=>truthy(x.featured))||data[0], featImg=document.querySelector('.featured-image'), featCopy=document.querySelector('.featured-copy'); if(feat){if(featImg&&feat.image){featImg.style.backgroundImage=`url('${asset(feat.image)}')`;featImg.style.backgroundSize='cover';featImg.style.backgroundPosition='center';}if(featCopy)featCopy.innerHTML=`<div class="label">${fmtDate(feat.date,'month')}</div><h3>${esc(feat.album||feat.title)}</h3><p>${esc(feat.caption||'')}</p><div class="album-meta"><span class="meta">${esc(String(feat.category||'photo').toUpperCase())}</span><span class="meta">${esc(yearOf(feat.date))}</span></div><div style="margin-top:22px"><a class="btn primary" href="#gallery">OPEN ALBUM ↗</a></div>`;}
    const search=document.getElementById('gallerySearch'), year=document.getElementById('yearFilter'), filters=[...document.querySelectorAll('.filter-row .filter')], grid=document.getElementById('galleryGrid'), no=document.getElementById('noResults');
    const years=[...new Set(data.map(x=>yearOf(x.date)).filter(Boolean))].sort((a,b)=>b-a);year.innerHTML='<option value="all">ALL YEARS</option>'+years.map(y=>`<option value="${y}">${y}</option>`).join('');let active='all';
    const patterns=['tall','medium','medium','wide','medium','tall','medium','medium'];
    const bindLightbox=()=>{const lb=document.getElementById('lightbox'), title=document.getElementById('lightboxTitle'), date=document.getElementById('lightboxDate'), image=lb?.querySelector('.lightbox-image'), copy=lb?.querySelector('.lightbox-copy p');grid.querySelectorAll('.photo-card').forEach(card=>card.addEventListener('click',()=>{const p=data.find(x=>String(x.id)===card.dataset.id);if(!p||!lb)return;title.textContent=p.title||'Gallery Photo';date.textContent=fmtDate(p.date);if(copy)copy.textContent=p.caption||'';if(image&&p.image){image.style.backgroundImage=`url('${asset(p.image)}')`;image.style.backgroundSize='cover';image.style.backgroundPosition='center';}lb.classList.add('open');lb.setAttribute('aria-hidden','false');}));};
    const render=()=>{const q=(search.value||'').trim().toLowerCase(), y=year.value;const rows=data.filter(p=>{const text=[p.title,p.caption,p.album,p.category].join(' ').toLowerCase();return(!q||text.includes(q))&&(y==='all'||yearOf(p.date)===y)&&(active==='all'||p.category===active)});if(!rows.length){grid.innerHTML='';no.style.display='block'}else{no.style.display='none';grid.innerHTML=rows.map((p,i)=>`<article class="photo-card ${patterns[i%patterns.length]}" data-id="${esc(p.id)}" ${imgStyle(p.image)}><span class="photo-open">＋</span><div class="photo-info"><small>${fmtDate(p.date,'month')}</small><b>${esc(p.title)}</b></div></article>`).join('');bindLightbox();}};
    search.addEventListener('input',render);year.addEventListener('change',render);filters.forEach(b=>b.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));b.classList.add('active');active=b.dataset.category||'all';render()}));render();
    const albumGrid=document.querySelector('.album-grid'); if(albumGrid){const groups={};data.forEach(p=>{const k=p.album||`${yearOf(p.date)} ${p.category||'Gallery'}`;(groups[k]??=[]).push(p)});albumGrid.innerHTML=Object.entries(groups).map(([name,rows])=>{const p=rows[0];return`<article class="album-card glass"><div class="album-cover" ${imgStyle(p.image)}><span class="album-count">${rows.length} PHOTOS</span></div><div class="album-body"><div class="album-year">${esc(yearOf(p.date))} · ${esc(String(p.category||'gallery').toUpperCase())}</div><h3>${esc(name)}</h3><p>${esc(p.caption||'')}</p></div></article>`}).join('')||empty('Albums will be updated from the Excel file.');}
    const lb=document.getElementById('lightbox'); const close=()=>{lb?.classList.remove('open');lb?.setAttribute('aria-hidden','true')}; document.getElementById('closeLightbox')?.addEventListener('click',close); lb?.addEventListener('click',e=>{if(e.target===lb)close()}); document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (page==='home') initHome();
    if (page==='members') initMembers();
    if (page==='alumni') initAlumni();
    if (page==='publications') initPublications();
    if (page==='news') initNews();
    if (page==='gallery') initGallery();
  });
})();
