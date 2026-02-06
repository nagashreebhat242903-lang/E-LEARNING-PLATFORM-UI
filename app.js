// Shared interactions for index/about pages
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  // Mobile nav toggle
  const hamburger = $('.hamburger');
  const nav = $('.nav');
  if (hamburger && nav){
    hamburger.addEventListener('click', ()=>{
      const open = nav.style.display === 'flex';
      nav.style.display = open ? 'none' : 'flex';
      hamburger.setAttribute('aria-expanded', String(!open));
    });
  }

  // Year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Catalog interactions (index.html)
  if (location.pathname.endsWith('index.html') || location.pathname.endsWith('/')){
    const grid = $('#courseGrid');
    const empty = $('#emptyState');
    const searchInput = $('#searchInput');
    const clearSearch = $('#clearSearch');
    const sortSelect = $('#sortSelect');

    const chipGroup = $('.chip-group');
    let activeFilter = 'all';
    let courses = [];

    // Load data
    fetch('assets/data/courses.json').then(r=>r.json()).then(data=>{
      courses = data.courses;
      render();
    }).catch(err=>{
      console.error('Failed to load courses.json', err);
      grid.innerHTML = '<p class="muted">Failed to load courses. Please refresh.</p>';
    });

    function filtered(){
      const q = (searchInput?.value||'').toLowerCase().trim();
      let list = courses.filter(c =>
        (activeFilter==='all' || c.category===activeFilter) &&
        (!q || c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q) || (c.tags||[]).some(t=>t.toLowerCase().includes(q)))
      );
      const s = sortSelect?.value;
      if (s==='rating') list.sort((a,b)=>b.rating-a.rating);
      else if (s==='new') list.sort((a,b)=>new Date(b.added)-new Date(a.added));
      else if (s==='a-z') list.sort((a,b)=>a.title.localeCompare(b.title));
      else list.sort((a,b)=>b.popularity-a.popularity);
      return list;
    }

    function render(){
      const list = filtered();
      grid.innerHTML = list.map(cardHTML).join('');
      if (list.length===0){
        empty.classList.remove('hidden');
      } else {
        empty.classList.add('hidden');
      }
      // Hook actions
      $$('.enroll-btn', grid).forEach(btn=>{
        btn.addEventListener('click', ()=>toggleEnroll(btn.dataset.id));
      });
    }

    function cardHTML(c){
      const enrolled = isEnrolled(c.id);
      return `
        <article class="card" role="listitem">
          <a href="course.html?id=${c.id}" class="card-media" aria-label="Open ${c.title}">
            <img src="assets/img/thumb-${c.thumb||'default'}.svg" alt="${c.title} thumbnail" />
          </a>
          <div class="card-body">
            <h3 class="card-title">${c.title}</h3>
            <div class="muted">${c.subtitle}</div>
            <div class="card-meta">
              <span class="badge">${capitalize(c.category)}</span>
              <span class="badge">${c.level}</span>
              <span class="badge">${c.duration}</span>
              <span class="badge">${c.rating} ★</span>
            </div>
          </div>
          <div class="card-actions">
            <a class="btn btn-outline" href="course.html?id=${c.id}">View</a>
            <button class="btn ${enrolled? 'btn-ghost' : 'btn-primary'} enroll-btn" data-id="${c.id}">${enrolled? 'Unenroll' : 'Enroll'}</button>
          </div>
        </article>`;
    }

    function capitalize(s){return s.charAt(0).toUpperCase() + s.slice(1)}

    // Filter chips
    if (chipGroup){
      chipGroup.addEventListener('click', (e)=>{
        const btn = e.target.closest('.chip');
        if (!btn) return;
        $$('.chip', chipGroup).forEach(c=>c.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        render();
      });
    }

    // Search and sort
    searchInput?.addEventListener('input', render);
    clearSearch?.addEventListener('click', ()=>{searchInput.value=''; render();});
    sortSelect?.addEventListener('change', render);

    // Enrollment state in localStorage
    function getEnrollments(){
      try{ return JSON.parse(localStorage.getItem('learnify:enrollments')||'[]'); }catch{return []}
    }
    function saveEnrollments(list){
      localStorage.setItem('learnify:enrollments', JSON.stringify(list));
    }
    function isEnrolled(id){
      return getEnrollments().includes(String(id));
    }
    function toggleEnroll(id){
      const e = getEnrollments();
      const i = e.indexOf(String(id));
      if (i>-1) e.splice(i,1); else e.push(String(id));
      saveEnrollments(e);
      render();
    }
  }
})();