// Course page logic: populate details, curriculum, and progress tracking
(function(){
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>[...r.querySelectorAll(s)];

  const params = new URLSearchParams(location.search);
  const id = params.get('id') || '101';

  // Footer year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Load course data
  fetch('assets/data/courses.json').then(r=>r.json()).then(data=>{
    const c = data.courses.find(x=>String(x.id)===String(id));
    if (!c){
      $('.course-page .container').innerHTML = '<p class="muted">Course not found.</p>';
      return;
    }
    populate(c);
  }).catch(err=>{
    console.error('Failed to load course', err);
  });

  function populate(c){
    $('#courseTitle').textContent = c.title;
    $('#courseSubtitle').textContent = c.subtitle;
    $('#courseCategory').textContent = capitalize(c.category);
    $('#courseLevel').textContent = c.level;
    $('#courseDuration').textContent = c.duration;
    $('#courseRating').textContent = `${c.rating} ★`;
    $('#courseDescription').textContent = c.description;
    $('#instructorName').textContent = c.instructor.name;
    $('#instructorBio').textContent = c.instructor.bio;
    $('#instructorAvatar').src = 'assets/img/avatar.svg';

    const video = $('#courseVideo');
    const firstVideo = c.lessons?.[0]?.video || 'dQw4w9WgXcQ';
    video.src = `https://www.youtube.com/embed/${firstVideo}`;

    const ul = $('#lessonList');
    ul.innerHTML = c.lessons.map((l, i)=>`
      <li data-index="${i}">
        <span class="index">${i+1}</span>
        <div>
          <div class="strong">${l.title}</div>
          <div class="muted small">${l.duration}</div>
        </div>
        <button class="btn btn-outline lesson-play" data-video="${l.video}">Play</button>
        <button class="btn btn-ghost lesson-complete">Mark complete</button>
      </li>`).join('');

    // Enrollment state
    const enrollBtn = $('#enrollBtn');
    function isEnrolled(){
      const e = getEnrollments();
      return e.includes(String(c.id));
    }
    function updateEnrollBtn(){
      enrollBtn.textContent = isEnrolled()? 'Unenroll' : 'Enroll for free';
      enrollBtn.classList.toggle('btn-primary', !isEnrolled());
      enrollBtn.classList.toggle('btn-ghost', isEnrolled());
    }
    enrollBtn.addEventListener('click', ()=>{
      const e = getEnrollments();
      const sid = String(c.id);
      const ix = e.indexOf(sid);
      if (ix>-1) e.splice(ix,1); else e.push(sid);
      localStorage.setItem('learnify:enrollments', JSON.stringify(e));
      updateEnrollBtn();
    });
    updateEnrollBtn();

    // Lessons: play + mark complete
    const player = $('#courseVideo');
    ul.addEventListener('click', (ev)=>{
      const play = ev.target.closest('.lesson-play');
      const li = ev.target.closest('li');
      if (play){
        const vid = play.dataset.video;
        if (vid) player.src = `https://www.youtube.com/embed/${vid}`;
      }
      const mark = ev.target.closest('.lesson-complete');
      if (mark && li){
        toggleComplete(c.id, Number(li.dataset.index));
        renderProgress(c.id, c.lessons.length);
      }
    });

    $('#markCompleteBtn').addEventListener('click', ()=>{
      // Mark first visible lesson complete for demo purposes
      const firstIdx = 0;
      toggleComplete(c.id, firstIdx);
      renderProgress(c.id, c.lessons.length);
    });

    // Render initial progress
    renderProgress(c.id, c.lessons.length);
  }

  function getEnrollments(){
    try{ return JSON.parse(localStorage.getItem('learnify:enrollments')||'[]'); }catch{return []}
  }

  function getProgress(){
    try{ return JSON.parse(localStorage.getItem('learnify:progress')||'{}'); }catch{return {}}
  }
  function saveProgress(p){
    localStorage.setItem('learnify:progress', JSON.stringify(p));
  }
  function toggleComplete(courseId, index){
    const p = getProgress();
    const key = String(courseId);
    const set = new Set(p[key]||[]);
    if (set.has(index)) set.delete(index); else set.add(index);
    p[key] = [...set];
    saveProgress(p);
  }
  function renderProgress(courseId, total){
    const p = getProgress();
    const done = (p[String(courseId)]||[]).length;
    const percent = total? Math.round(done/total*100) : 0;
    const fill = $('#progressFill');
    const label = $('#progressPercent');
    fill.style.width = percent + '%';
    label.textContent = percent + '%';
    const bar = $('.progress-bar');
    bar.setAttribute('aria-valuenow', String(percent));
  }

  function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1)}
})();