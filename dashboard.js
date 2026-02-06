// Dashboard rendering from localStorage state
(function(){
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>[...r.querySelectorAll(s)];

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const grid = $('#enrolledGrid');
  const empty = $('#noEnrollments');

  let allCourses = [];

  fetch('assets/data/courses.json').then(r=>r.json()).then(data=>{
    allCourses = data.courses;
    render();
  }).catch(()=>{
    grid.innerHTML = '<p class="muted">Unable to load courses.</p>';
  });

  function getEnrollments(){
    try{ return JSON.parse(localStorage.getItem('learnify:enrollments')||'[]'); }catch{return []}
  }
  function getProgress(){
    try{ return JSON.parse(localStorage.getItem('learnify:progress')||'{}'); }catch{return {}}
  }

  function render(){
    const ids = getEnrollments();
    const progress = getProgress();
    const enrolled = allCourses.filter(c=>ids.includes(String(c.id)));

    // Widgets
    const inProgress = enrolled.filter(c=>{
      const done = (progress[String(c.id)]||[]).length;
      return done>0 && done < (c.lessons?.length||0);
    }).length;
    const completed = enrolled.filter(c=>{
      const done = (progress[String(c.id)]||[]).length;
      return (c.lessons?.length||0)>0 && done === (c.lessons?.length||0);
    }).length;
    $('#inProgressCount').textContent = String(inProgress);
    $('#completedCount').textContent = String(completed);

    // Simple streak counter (demo): counts consecutive days with any progress log
    const streak = calcStreak();
    $('#streakCount').textContent = `${streak} day${streak===1?'':'s'}`;

    // Cards
    grid.innerHTML = enrolled.map(c=>{
      const done = (progress[String(c.id)]||[]).length;
      const total = c.lessons?.length || 0;
      const pct = total? Math.round(done/total*100) : 0;
      return `
        <article class="card">
          <a href="course.html?id=${c.id}" class="card-media">
            <img src="assets/img/thumb-${c.thumb||'default'}.svg" alt="${c.title} thumbnail" />
          </a>
          <div class="card-body">
            <h3 class="card-title">${c.title}</h3>
            <div class="muted">${c.subtitle}</div>
            <div class="progress" style="margin-top:10px">
              <div class="progress-header"><span>Progress</span><span>${pct}%</span></div>
              <div class="progress-bar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
                <div class="progress-fill" style="width:${pct}%"></div>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <a class="btn btn-outline" href="course.html?id=${c.id}">Continue</a>
            <button class="btn btn-ghost unenroll" data-id="${c.id}">Unenroll</button>
          </div>
        </article>`;
    }).join('');

    empty.style.display = enrolled.length? 'none' : 'grid';

    $$('.unenroll', grid).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = String(btn.dataset.id);
        const e = getEnrollments();
        const ix = e.indexOf(id);
        if (ix>-1){
          e.splice(ix,1);
          localStorage.setItem('learnify:enrollments', JSON.stringify(e));
          render();
        }
      })
    })
  }

  function calcStreak(){
    // Demo streak using a log of dates in localStorage updated when progress changes
    try{
      const log = JSON.parse(localStorage.getItem('learnify:progress-log')||'[]');
      if (!log.length) return 0;
      const set = new Set(log.map(d=>new Date(d).toDateString()));
      let streak = 0;
      let cur = new Date();
      while (set.has(cur.toDateString())){
        streak++;
        cur.setDate(cur.getDate()-1);
      }
      return streak;
    }catch{ return 0 }
  }
})();