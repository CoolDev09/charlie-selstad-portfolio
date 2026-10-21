(function(){
  'use strict';
  const data=window.PORTFOLIO_DATA;
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const track=document.getElementById('project-track');
  const dialog=document.getElementById('project-dialog');
  const dialogContent=document.getElementById('dialog-content');
  let activeProjects=data.projects;
  let lastProjectTrigger=null;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function renderProjectFilters(){
    const labels=['All work','Code','Engineering','Research','Writing'];
    document.getElementById('project-filters').innerHTML=labels.map((label,i)=>`<button class="filter-button" data-project-filter="${escape(label)}" aria-pressed="${i===0}">${escape(label)}</button>`).join('');
  }
  function renderProjects(category='All work'){
    activeProjects=category==='All work'?data.projects:data.projects.filter(p=>p.category===category);
    track.innerHTML=activeProjects.map((p,i)=>`<article class="project-card"><div class="project-cover"><img src="assets/covers/${escape(p.cover)}.svg?v=20261020-3" width="800" height="600" alt="" loading="lazy"><span class="card-index">${String(i+1).padStart(2,'0')}</span><span class="preview-label">ILLUSTRATED PREVIEW</span></div><div class="project-card-body"><div class="card-meta"><span class="card-category">${escape(p.category)}</span><span>${escape(p.year)}</span></div><h3>${escape(p.title)}</h3><p>${escape(p.summary)}</p><div class="mini-tags">${p.tags.map(t=>`<span>${escape(t)}</span>`).join('')}</div><button class="project-open" data-open-project="${escape(p.id)}" aria-label="Explore ${escape(p.title)}">Explore project <span aria-hidden="true">↗</span></button></div></article>`).join('');
    document.getElementById('project-count').textContent=`${activeProjects.length} ${activeProjects.length===1?'project':'projects'} to explore`;
    track.scrollLeft=0;
    requestAnimationFrame(updateCarousel);
  }
  function updateCarousel(){
    const first=track.querySelector('.project-card');
    if(!first)return;
    const step=first.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap||21);
    const current=Math.min(activeProjects.length,Math.round(track.scrollLeft/step)+1);
    const visible=Math.max(1,Math.round(track.clientWidth/step));
    const atEnd=track.scrollLeft+track.clientWidth>=track.scrollWidth-4;
    document.getElementById('project-prev').disabled=track.scrollLeft<4;
    document.getElementById('project-next').disabled=atEnd;
    document.getElementById('carousel-position').textContent=`${String(current).padStart(2,'0')} / ${String(activeProjects.length).padStart(2,'0')}`;
    document.getElementById('carousel-progress').style.width=`${Math.min(100,(atEnd?activeProjects.length:current+visible-1)/activeProjects.length*100)}%`;
  }
  function moveCarousel(direction){
    const first=track.querySelector('.project-card');
    if(!first)return;
    const step=first.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap||21);
    track.scrollBy({left:direction*step,behavior:reduced?'instant':'smooth'});
  }
  function openProject(id,trigger){
    const p=data.projects.find(item=>item.id===id);if(!p)return;
    lastProjectTrigger=trigger;
    dialogContent.innerHTML=`<div class="dialog-hero"><img src="assets/covers/${escape(p.cover)}.svg?v=20261020-3" alt="Editorial illustration for ${escape(p.title)}"><span class="preview-label">ILLUSTRATED PREVIEW</span></div><div class="dialog-body"><div class="dialog-kicker"><span>${escape(p.category)}</span><span>${escape(p.year)}</span><span>${escape(p.status)}</span></div><h2 id="dialog-title">${escape(p.title)}</h2><p class="dialog-summary">${escape(p.summary)}</p><div class="dialog-meta"><div><span>CONTEXT</span><strong>${escape(p.context)}</strong></div><div><span>MY CONTRIBUTION</span><strong>${escape(p.role)}</strong></div></div><div class="dialog-sections"><section><h3>The process</h3><ul>${p.process.map(s=>`<li>${escape(s)}</li>`).join('')}</ul></section><section><h3>What came out of it</h3><ul>${p.outputs.map(s=>`<li>${escape(s)}</li>`).join('')}</ul><div class="mini-tags">${p.tags.map(t=>`<span>${escape(t)}</span>`).join('')}</div></section></div><div class="dialog-reflection"><strong>What I take from the work</strong>${escape(p.reflection)}</div><p class="dialog-note">${escape(p.note)}</p></div>`;
    dialog.showModal();document.body.classList.add('no-scroll');
    document.getElementById('dialog-close').focus();
    dialog.scrollTop=0;
  }
  function renderCourseFilters(){
    const filters=[['All courses','all'],['AP','AP'],['Honors','Honors'],['College','College coursework']];
    document.getElementById('course-filters').innerHTML=filters.map(([label,key],i)=>`<button class="filter-button" data-course-filter="${escape(key)}" aria-pressed="${i===0}">${label}</button>`).join('');
  }
  function renderCourses(filter='all'){
    const courses=filter==='all'?data.courses:data.courses.filter(c=>c.level===filter);
    document.getElementById('course-count').textContent=`${courses.length} ${courses.length===1?'course':'courses'}`;
    document.getElementById('course-grid').innerHTML=courses.map(c=>`<article class="course-card"><div class="course-card-top"><span class="course-level">${escape(c.level)}</span><span class="course-status ${c.status==='In progress'?'current':''}">${escape(c.status)}</span></div><h3>${escape(c.title)}</h3><p class="course-year">${escape(c.year.replaceAll('-','–'))}</p><details><summary>Course details</summary><div class="course-detail"><p>${escape(c.description)}</p>${(c.terms||[]).map(t=>`<div class="grade-pair"><span>${escape(t.term)}</span><strong>${escape(t.grade.replaceAll('-','−'))}</strong></div>`).join('')}${c.note?`<p>${escape(c.note)}</p>`:''}</div></details></article>`).join('');
  }
  document.getElementById('project-filters').addEventListener('click',event=>{
    const button=event.target.closest('[data-project-filter]');if(!button)return;
    document.querySelectorAll('[data-project-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    renderProjects(button.dataset.projectFilter);
  });
  document.getElementById('course-filters').addEventListener('click',event=>{
    const button=event.target.closest('[data-course-filter]');if(!button)return;
    document.querySelectorAll('[data-course-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    renderCourses(button.dataset.courseFilter);
  });
  document.addEventListener('click',event=>{const button=event.target.closest('[data-open-project]');if(button)openProject(button.dataset.openProject,button);});
  document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('no-scroll');if(lastProjectTrigger&&lastProjectTrigger.isConnected)lastProjectTrigger.focus({preventScroll:true});});
  document.getElementById('project-prev').addEventListener('click',()=>moveCarousel(-1));
  document.getElementById('project-next').addEventListener('click',()=>moveCarousel(1));
  track.addEventListener('scroll',updateCarousel,{passive:true});
  track.addEventListener('keydown',event=>{if(event.target!==track)return;if(event.key==='ArrowRight'){event.preventDefault();moveCarousel(1);}if(event.key==='ArrowLeft'){event.preventDefault();moveCarousel(-1);}});
  window.addEventListener('resize',updateCarousel,{passive:true});
  const menuButton=document.querySelector('.menu-toggle');const menu=document.getElementById('primary-nav');
  menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');menu.classList.toggle('is-open',open);});
  menu.addEventListener('click',event=>{if(event.target.closest('a')){menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.classList.contains('is-open')){menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.focus();}});
  document.getElementById('copy-email').addEventListener('click',async()=>{const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText('charlesianselstad@gmail.com');status.textContent='Email address copied.';}catch{status.textContent='charlesianselstad@gmail.com';}});
  renderProjectFilters();renderProjects();renderCourseFilters();renderCourses();
  if(window.PortfolioCharts)window.PortfolioCharts.renderAll();
  window.addEventListener('load',()=>{
    if(!location.hash)return;
    let targetId;try{targetId=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const target=document.getElementById(targetId);
    if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
  },{once:true});
}());
