// Mock authentication (local only) and shared footer/nav year
(function(){
  const $ = (s, r=document)=>r.querySelector(s);
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const loginForm = $('#loginForm');
  const signupForm = $('#signupForm');

  if (signupForm){
    signupForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = $('#signupName').value.trim();
      const email = $('#signupEmail').value.trim();
      const pwd = $('#signupPassword').value;
      if (!name || !email || pwd.length<6) return alert('Please complete the form.');
      localStorage.setItem('learnify:user', JSON.stringify({name,email}));
      alert('Account created. You are now logged in.');
      location.href = 'dashboard.html';
    });
  }

  if (loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = $('#loginEmail').value.trim();
      const pwd = $('#loginPassword').value;
      if (!email || !pwd) return alert('Enter email and password');
      // Accept any credentials for demo
      localStorage.setItem('learnify:user', JSON.stringify({email,name:email.split('@')[0]}));
      alert('Logged in successfully');
      location.href = 'dashboard.html';
    });
  }
})();