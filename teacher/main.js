(() => {
  const data=window.GUIDE_DATA;
  function render(){document.getElementById('teacherContent').innerHTML=GUIDE_REFLECTIONS.collectHtml();}
  GUIDE_REFLECTIONS.setContext(5,data.programs.B.slides,render);
  async function checkSession(){
    try{const response=await fetch('/teacher/session',{cache:'no-store'});if(response.status!==204){location.replace('/teacher');return;}render();}
    catch{document.getElementById('teacherContent').textContent='접근 상태를 확인하지 못했습니다. 새로고침해 주세요.';}
  }
  window.addEventListener('pageshow',checkSession);
  window.addEventListener('pagehide',()=>{document.querySelector('[data-clear-collected]')?.click();document.getElementById('teacherContent').replaceChildren();});
})();
