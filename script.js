(function(){
  const DATA_URL = 'data.json'
  const qs = (s,ctx=document)=>ctx.querySelector(s)

  // Busca un archivo de imagen común en la carpeta y devuelve la ruta si existe
  async function findLocalAvatar(){
    const candidates = [
      'Foto_Perfil.jpeg','Foto_Perfil.jpg','foto_perfil.jpeg','foto_perfil.jpg',
      'avatar.png','avatar.jpg','avatar.jpeg','photo.jpg','photo.png'
    ]
    for(const name of candidates){
      try{
        const res = await fetch(name, {method:'HEAD'})
        if(res.ok){
          const ct = res.headers.get('content-type')||''
          if(ct.startsWith('image/')) return name
        }
      }catch(e){
        // ignora errores de fetch y continua con el siguiente candidato
      }
    }
    return null
  }
  async function loadData(){
    try{
      const res = await fetch(DATA_URL, {cache: 'no-store'})
      if(!res.ok) throw new Error('No se pudo cargar data.json')
      return await res.json()
    }catch(e){
      console.error(e)
      // Permite revisar el portafolio aunque index.html se abra directamente
      return {
        profile: {
          name: 'Tu Nombre',
          role: 'Ingeniero/a de Software',
          bio: 'Soy un desarrollador con experiencia en construir aplicaciones web, APIs y sistemas escalables.',
          avatar: '',
          skills: ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js']
        },
        projects: [
          {
            title: 'Clon T',
            description: 'Prototipo móvil de gestión de saldo, combos y consumo de datos.',
            link: 'proyectos/Clon%20T/index.html'
          }
        ],
        certificates: [],
        socials: []
      }
    }
  }

  function renderProfile(data){
    qs('#profileName').textContent = data.profile.name
    qs('#profileRole').textContent = data.profile.role
    qs('#introName').textContent = data.profile.name
    qs('#profileBio').textContent = data.profile.bio
    const avatarImg = qs('#avatarImg')
    if(data.profile.avatar){
      avatarImg.src = data.profile.avatar
    } else {
      avatarImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="Foto_Perfil.jpeg" width="400" height="400"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0ea5a4"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="52%" text-anchor="middle" font-family="sans-serif" font-size="64" fill="white">${data.profile.name.split(' ')[0].slice(0,2).toUpperCase()}</text></svg>`)
    }
    const skillsContainer = qs('#skills')
    skillsContainer.innerHTML = ''
    (data.profile.skills||[]).forEach(s=>{
      const el = document.createElement('span')
      el.textContent = s
      el.style.padding='6px 10px'
      el.style.borderRadius='999px'
      el.style.background='rgba(255,255,255,0.02)'
      el.style.color='var(--muted)'
      el.style.fontWeight='600'
      el.style.fontSize='13px'
      skillsContainer.appendChild(el)
    })
  }

  function renderProjects(data){
    const grid = qs('#projectsGrid')
    grid.innerHTML = ''
    (data.projects||[]).forEach(p=>{
      const card = document.createElement('article')
      card.className='card-small'
      card.innerHTML = `<h4 style="margin:0 0 8px 0">${p.title}</h4><p style="margin:0 0 8px 0;color:var(--muted)">${p.description}</p><a href="${p.link}" style="color:var(--accent);font-weight:700">Ver</a>`
      grid.appendChild(card)
    })
  }

  function renderCerts(data){
    const list = qs('#certsList')
    list.innerHTML = ''
    (data.certificates||[]).forEach(c=>{
      const card = document.createElement('div')
      card.className='card-small'
      card.innerHTML = `<strong>${c.title}</strong><div style="color:var(--muted);margin-top:6px">${c.issuer} • ${c.year}</div>`
      list.appendChild(card)
    })
  }

  function renderSocials(data){
    const list = qs('#socialList')
    list.innerHTML = ''
    (data.socials||[]).forEach(s=>{
      const a = document.createElement('a')
      a.className='icon-btn'
      a.href = s.url
      a.textContent = s.name
      a.style.padding='10px 12px'
      a.style.borderRadius='8px'
      a.style.color='var(--muted)'
      a.style.fontWeight='700'
      list.appendChild(a)
    })
  }

  function setActiveSection(id){
    document.querySelectorAll('.section').forEach(sec=>{
      sec.classList.toggle('active', sec.id===id)
    })
    document.querySelectorAll('.nav-link').forEach(a=>{
      a.classList.toggle('active', a.getAttribute('data-target')===id)
    })
    history.replaceState(null,'', '#'+id)
  }

  function onHashChange(){
    const hash = (location.hash||'#inicio').replace('#','')
    const target = ['inicio','proyectos','certificados','redes'].includes(hash)?hash:'inicio'
    setActiveSection(target)
    const sec = document.getElementById(target)
    if(sec) sec.classList.add('slide-in')
    setTimeout(()=>document.querySelectorAll('.section').forEach(s=>s.classList.remove('slide-in')),350)
  }

  document.addEventListener('click', e=>{
    const a = e.target.closest('a[data-target]')
    if(a){
      e.preventDefault()
      const t = a.getAttribute('data-target')
      setActiveSection(t)
    }
  })

  window.addEventListener('hashchange', onHashChange)
  document.getElementById('menuToggle').addEventListener('click', ()=>{
    const nav = document.getElementById('navList')
    nav.style.display = nav.style.display==='flex'?'none':'flex'
    nav.style.flexDirection = 'column'
    nav.style.background = 'rgba(0,0,0,0.35)'
    nav.style.padding = '8px'
    nav.style.borderRadius = '8px'
  })

  qs('#contactBtn').addEventListener('click', ()=>{ location.href = 'mailto:tu@correo.com' })
  qs('#downloadCv').addEventListener('click', ()=>{ alert('Enlaza aquí tu CV o genera dinámicamente el PDF') })

  // Inicialización
  loadData().then(async data=>{
    if(!data) return
    // Si no hay avatar en data, buscar uno en la carpeta del proyecto
    if(!data.profile.avatar){
      const local = await findLocalAvatar()
      if(local) data.profile.avatar = local
    }
    renderProfile(data)
    renderProjects(data)
    renderCerts(data)
    renderSocials(data)
    onHashChange()
  })

})();