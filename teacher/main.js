(() => {
  const data=window.GUIDE_DATA;
  let mode='reflections';
  function render(){if(mode==='photos'){TEACHER_PHOTOS.open();return;}document.getElementById('teacherContent').innerHTML=GUIDE_REFLECTIONS.collectHtml();}
  GUIDE_REFLECTIONS.setContext(5,data.programs.B.slides,render);
  async function checkSession(){
    try{const response=await fetch('/teacher/session',{cache:'no-store'});if(response.status!==204){location.replace('/teacher');return;}render();}
    catch{document.getElementById('teacherContent').textContent='접근 상태를 확인하지 못했습니다. 새로고침해 주세요.';}
  }
  window.addEventListener('pageshow',checkSession);
  document.addEventListener('click',e=>{const button=e.target.closest('[data-teacher-mode]');if(!button)return;TEACHER_PHOTOS.close();mode=button.dataset.teacherMode;document.querySelectorAll('[data-teacher-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();});
  window.addEventListener('pagehide',()=>{document.querySelector('[data-clear-collected]')?.click();TEACHER_PHOTOS.clear();document.getElementById('teacherContent').replaceChildren();});
})();
