(() => {
  const scriptEl = document.currentScript;
  const siteRoot = new URL('../../', scriptEl.src);
  const page = document.body.dataset.page || '';

  const esc = (v='') => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const asset = (p='') => p ? new URL(String(p).replace(/^\/+/, ''), siteRoot).href : '';
  const jsonUrl = name => new URL(`assets/data/${name}.json`, siteRoot).href;
  const load = async name => {
    try {
      const r = await fetch(`${jsonUrl(name)}?v=${Date.now()}`, {cache:'no-store'});
      if (!r.ok) throw new Error(`${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn(`KEE LAB: failed to load ${name}.json`, e);
      return [];
    }
  };
  const truthy = v => v === true || ['true','1','yes','y'].includes(String(v).toLowerCase());
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
  const externalLink = u => {
    const raw = String(u || '').trim();
    if (!raw) return '#';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^\/\//.test(raw)) return `https:${raw}`;
    if (/^www\./i.test(raw)) return `https://${raw}`;
    if (/^[^\s/]+\.[^\s/]+/.test(raw)) return `https://${raw}`;
    return raw;
  };

  async function initHome(){
    const [pubs, news, professor] = await Promise.all([load('publications'), load('news'), load('professor')]);
    const prof = Array.isArray(professor) ? {} : (professor || {});
    const profCard = document.querySelector('.prof-card');
    if (profCard && Object.keys(prof).length) {
      const photo = profCard.querySelector('.prof-photo');
      if (photo && prof.photo) {
        photo.classList.add('has-photo');
        photo.innerHTML = '';
        photo.style.backgroundImage = `linear-gradient(180deg,rgba(7,95,130,.03),rgba(7,95,130,.12)),url('${asset(prof.photo)}')`;
        photo.style.backgroundSize = 'cover';
        photo.style.backgroundPosition = 'center top';
      }
      const en = profCard.querySelector('.prof-info .label');
      const ko = profCard.querySelector('.prof-info h3');
      const role = profCard.querySelector('.prof-role');
      const bio = profCard.querySelector('.prof-info > p');
      const research = profCard.querySelector('.meta-row span');
      if (en && prof.name_en) en.textContent = prof.name_en.toUpperCase();
      if (ko && prof.name_ko) ko.textContent = prof.name_ko;
      if (role) role.textContent = [prof.title, prof.university].filter(Boolean).join(' · ') || role.textContent;
      if (bio && prof.home_bio) bio.textContent = prof.home_bio;
      if (research && Array.isArray(prof.research_interests) && prof.research_interests.length) research.textContent = prof.research_interests.join(' · ');
    }

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
    const board = document.getElementById('homeNewsBoard');
    if (board) {
      const chosen = [...news].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,5);
      board.innerHTML = chosen.length ? chosen.map(n => `
        <a class="home-news-row" href="${n.link_url ? safeLink(n.link_url) : 'news/'}" ${n.link_url ? 'target="_blank" rel="noopener"' : ''}>
          <span class="date">${fmtDate(n.date,'month')}</span>
          <span><strong>${esc(n.title)}</strong><small>${esc(n.category||'news')}</small></span>
          <span class="arr">↗</span>
        </a>`).join('') : empty('News will be updated from the Excel file.');
    }
  }

  async function initProfessor(){
    const [rawProf, pubs] = await Promise.all([load('professor'), load('publications')]);
    const prof = Array.isArray(rawProf) ? {} : (rawProf || {});
    if (!Object.keys(prof).length) return;

    const portrait = document.querySelector('.prof-portrait');
    if (portrait && prof.photo) {
      portrait.classList.add('has-photo');
      portrait.innerHTML = '';
      portrait.style.backgroundImage = `linear-gradient(180deg,rgba(7,95,130,.02),rgba(7,95,130,.10)),url('${asset(prof.photo)}')`;
      portrait.style.backgroundSize = 'cover';
      portrait.style.backgroundPosition = 'center';
    }

    const intro = document.querySelector('.prof-intro');
    if (intro) {
      const h1 = intro.querySelector('h1');
      const role = intro.querySelector('.role');
      const p = intro.querySelector('p');
      if (h1 && prof.name_en) {
        const parts = String(prof.name_en).trim().split(/\s+/);
        if (parts.length > 1) {
          h1.innerHTML = `${esc(parts.slice(0,-1).join(' '))}<br><em style="font-style:normal;color:var(--ssu-dark)">${esc(parts.at(-1))}</em>`;
        } else h1.textContent = prof.name_en;
      }
      if (role) role.textContent = [prof.title, prof.university].filter(Boolean).join(' · ') || role.textContent;
      if (p && prof.home_bio) p.textContent = prof.home_bio;
    }

    const bioSection = document.querySelector('#bio .profile-grid > div:last-child');
    if (bioSection && prof.biography) {
      const big = bioSection.querySelector('.bio-big');
      const body = [...bioSection.querySelectorAll('.body-copy')];
      if (big) big.textContent = prof.biography;
      body.forEach(x => x.remove());
    }

    const interests = document.querySelector('.interest-grid');
    if (interests && Array.isArray(prof.research_interests) && prof.research_interests.length) {
      interests.innerHTML = prof.research_interests.map(x=>`<div class="interest glass">${esc(x)}</div>`).join('');
    }

    const works = document.querySelector('#works .selected');
    if (works && Array.isArray(pubs)) {
      const selected = [...pubs].sort((a,b)=>(Number(b.featured)-Number(a.featured)) || (Number(b.year)-Number(a.year))).slice(0,3);
      if (selected.length) {
        works.innerHTML = selected.map(p=>`<div class="work"><span class="year">${esc(p.year)}</span><div><b>${esc(p.title)}</b><br><small>${esc([p.authors,p.venue].filter(Boolean).join(' · '))}</small></div><span>↗</span></div>`).join('');
      }
    }
  }

  async function initMembers(){
    const data = await load('members');
    const root = document.getElementById('membersDynamic');
    if (!root) return;
    root.classList.add('visible');
    const stats = document.querySelectorAll('.members-stat .stat strong');
    if (stats.length >= 4) {
      stats[0].textContent = data.filter(x=>x.role_group==='phd').length;
      stats[1].textContent = data.filter(x=>x.role_group==='ma').length;
      stats[2].textContent = data.filter(x=>x.role_group==='researcher').length;
      stats[3].textContent = '1';
    }
    const labels = {phd:'Doctoral Students',ma:"Master\'s Students",researcher:'Researchers',other:'Other Members'};
    const order = ['phd','ma','researcher','other'];
    const filters = [...document.querySelectorAll('.filters .filter')];
    const modal = document.getElementById('memberModal');
    const modalPhoto = document.getElementById('memberModalPhoto');
    const modalName = document.getElementById('memberModalName');
    const modalEn = document.getElementById('memberModalEn');
    const modalRole = document.getElementById('memberModalRole');
    const modalBio = document.getElementById('memberModalBio');
    const modalResearch = document.getElementById('memberModalResearch');
    const modalEducation = document.getElementById('memberModalEducation');
    const modalActions = document.getElementById('memberModalActions');
    const toast = document.getElementById('copyToast');

    const copyEmail = async email => {
      if (!email) return;
      try { await navigator.clipboard.writeText(email); }
      catch(e){
        const ta=document.createElement('textarea');ta.value=email;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
      }
      if (toast) { toast.textContent='이메일 주소가 클립보드에 복사되었습니다.'; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),1800); }
    };

    const closeModal = () => { if(modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; } };
    const openModal = m => {
      if (!modal) return;
      if (modalPhoto) {
        modalPhoto.style.backgroundImage = m.photo ? `linear-gradient(180deg,rgba(7,95,130,.03),rgba(7,95,130,.12)),url('${asset(m.photo)}')` : 'linear-gradient(145deg,var(--ssu-deep),var(--ssu-medium))';
        modalPhoto.style.backgroundSize='cover'; modalPhoto.style.backgroundPosition='center top';
      }
      if(modalName) modalName.textContent=m.name_ko||m.name_en||'Member';
      if(modalEn) modalEn.textContent=(m.name_ko&&m.name_en)?m.name_en:'';
      if(modalRole) modalRole.textContent=m.role_label||labels[m.role_group]||'';
      if(modalBio) {
        modalBio.textContent = m.bio || '';
        modalBio.style.display = m.bio ? 'block' : 'none';
      }
      if(modalResearch) modalResearch.textContent=m.research_interests||'—';
      if(modalEducation){ modalEducation.textContent=m.education||'—'; modalEducation.parentElement.style.display=m.education?'grid':'none'; }
      if(modalActions){
        modalActions.innerHTML='';
        if(m.email){ const b=document.createElement('button'); b.type='button'; b.textContent='EMAIL COPY'; b.addEventListener('click',()=>copyEmail(m.email)); modalActions.appendChild(b); }
        if(m.profile_url){ const a=document.createElement('a'); a.href=externalLink(m.profile_url); a.target='_blank'; a.rel='noopener noreferrer'; a.textContent='PROFILE ↗'; modalActions.appendChild(a); }
      }
      modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    };
    document.getElementById('memberModalClose')?.addEventListener('click',closeModal);
    modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open'))closeModal()});

    const bindCards = () => {
      root.querySelectorAll('.member-card').forEach(card=>{
        const memberIndex = Number(card.dataset.memberIndex);
        const member = Number.isInteger(memberIndex) ? data[memberIndex] : null;
        if(!member)return;
        card.addEventListener('click',()=>openModal(member));
        card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal(member)}});
        card.querySelectorAll('[data-copy-email]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();copyEmail(member.email)}));
      });
    };

    const render = f => {
      root.classList.add('visible');
      const subset = f==='all' ? data : data.filter(x=>x.role_group===f);
      if (!subset.length) { root.innerHTML = empty('Member information will be updated from the Excel file.'); return; }
      root.innerHTML = order.filter(role=>subset.some(x=>x.role_group===role)).map(role => {
        const rows = subset.filter(x=>x.role_group===role);
        return `<div class="section-title-row"><h3>${labels[role]}</h3><span class="count">${rows.length}</span></div>
        <div class="member-grid">${rows.map(m=>`
          <article class="member-card glass" tabindex="0" role="button" aria-label="${esc(m.name_ko||m.name_en||'Member')} 프로필 보기" data-member-index="${data.indexOf(m)}" data-role="${esc(m.role_group)}">
            <div class="member-photo ${m.photo?'has-photo':''}" ${m.photo?`style="background-image:linear-gradient(180deg,rgba(7,95,130,.04),rgba(7,95,130,.14)),url('${asset(m.photo)}');background-size:cover;background-position:center top"`:''}>${m.photo?'': 'PROFILE IMAGE'}</div>
            <div class="member-info">
              <h3>${esc(m.name_ko || m.name_en || 'Member')}</h3>
              ${m.name_en && m.name_ko ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(m.name_en)}</div>`:''}
              <div class="degree">${esc(m.role_label || '')}</div>
              <p>${m.research_interests ? `Research Interests · ${esc(m.research_interests)}` : ''}</p>
              <div class="member-links">
                ${m.email ? `<button type="button" data-copy-email>EMAIL COPY</button>`:''}
                ${m.profile_url ? `<a href="${esc(externalLink(m.profile_url))}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">PROFILE ↗</a>`:''}
              </div>
            </div>
          </article>`).join('')}</div>`;
      }).join('');
      bindCards();
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
    archive.classList.add('visible');
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
      archive.classList.add('visible');
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

  const initPage = () => {
    if (page==='home') initHome();
    if (page==='professor') initProfessor();
    if (page==='members') initMembers();
    if (page==='alumni') initAlumni();
    if (page==='publications') initPublications();
    if (page==='news') initNews();
    if (page==='gallery') initGallery();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage, {once:true});
  else initPage();
})();
