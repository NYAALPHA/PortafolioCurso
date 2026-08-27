(function(){
  const DATA_URL = 'data.json'
  const qs = (s,ctx=document)=>ctx.querySelector(s)
  const PROJECT_LIMIT = 4
  let projects = []
  let activeProjectFilter = 'Todos'
  let projectsExpanded = false
  let projectCarouselIndex = 0
  let viewMode = 'carousel'

  function setTheme(theme){
    const isLight = theme === 'light'
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark'
    const toggle = qs('#themeToggle')
    toggle.textContent = isLight ? '☾' : '☀'
    toggle.title = isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
    toggle.setAttribute('aria-label', toggle.title)
    localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark')
  }

  function transitionTheme(){
    const toggle = qs('#themeToggle')
    const transition = qs('#themeTransition')
    const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'
    const rect = toggle.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(centerX, innerWidth - centerX), Math.max(centerY, innerHeight - centerY))
    const scale = radius * 2
    const transitionColor = nextTheme === 'light' ? '#f8fafc' : '#071021'
    const expanding = document.documentElement.dataset.theme !== 'light'

    transition.style.left = `${centerX}px`
    transition.style.top = `${centerY}px`
    transition.style.setProperty('--transition-scale', scale)
    transition.style.setProperty('--transition-color', transitionColor)
    transition.className = `theme-transition ${expanding ? 'is-expanding' : 'is-contracting'}`
    document.body.classList.add('theme-changing')
    setTheme(nextTheme)

    transition.addEventListener('animationend', ()=>{
      transition.className = 'theme-transition'
      document.body.classList.remove('theme-changing')
    }, {once:true})
  }

  // Busca un archivo de imagen común en la carpeta y devuelve la ruta si existe
  async function findLocalAvatar(){
    const candidates = [
      'Foto_Perfil.jpg','Foto_Perfil.jpeg','foto_perfil.jpg','foto_perfil.jpeg',
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
          name: 'Andres Romero',
          role: 'Estudiante de Ingeniería de Software y desarrollador frontend',
          bio: 'Soy estudiante de Ingeniería de Software y desarrollo aplicaciones web con JavaScript, HTML y CSS.',
          avatar: 'Foto_Perfil.jpg',
          skills: ['JavaScript', 'HTML y CSS', 'Desarrollo frontend', 'Aplicaciones web', 'Diseño responsive', 'Lógica de programación']
        },
        projects: [
          {
            id: 'clon-t',
            title: 'Clon T',
            category: 'Aplicación móvil',
            description: 'Interfaz móvil para consultar saldo, administrar combos y visualizar el consumo de datos con una experiencia clara y responsive.',
            alt: 'Interfaz móvil de gestión de saldo, combos y consumo de datos diseñada para Clon T',
            tags: ['UX/UI', 'Mobile', 'Frontend'],
            link: 'proyectos/Clon%20T/index.html',
            image: 'IMG/clon-t.png'
          },
          {
            id: 'clon-youtube',
            title: 'Clon YouTube',
            category: 'Plataforma de contenido',
            description: 'Interfaz responsive inspirada en YouTube con videos, Shorts, búsqueda y filtros para explorar contenido digital.',
            alt: 'Interfaz responsive de plataforma de videos con secciones de YouTube, Shorts, búsqueda y filtros',
            tags: ['UX/UI', 'Responsive', 'JavaScript'],
            link: 'proyectos/Clon%20Youtube/index.html',
            image: 'IMG/clon-youtube.png'
          },
          {
            id: 'trello-hibrido',
            title: 'Trello Híbrido',
            category: 'Gestión de productividad',
            description: 'Aplicación de gestión de tareas con tablero Kanban y Scrum, persistencia local e historial de actividad.',
            alt: 'Tablero digital de gestión de tareas con flujo Kanban y Scrum en Trello Híbrido',
            tags: ['Productividad', 'Kanban', 'JavaScript'],
            link: 'proyectos/Trello-Hibrido/index.html',
            image: 'IMG/trello-hibrido.png'
          },
          {
            id: 'clon-whatsapp-chats',
            title: 'Clon WhatsApp Chats',
            category: 'Mensajería digital',
            description: 'Interfaz de chats con lista de conversaciones, filtros y actualización visual en tiempo real para una experiencia de mensajería familiar.',
            alt: 'Interfaz de mensajería con lista de conversaciones y filtros inspirada en WhatsApp',
            tags: ['UX/UI', 'Responsive', 'JavaScript'],
            link: 'proyectos/Clon%20WhatsApp%20Chats/index.html',
            image: 'IMG/clon-whatsapp-chats.png'
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
    avatarImg.src = 'Foto_Perfil.jpg'
    const skillsContainer = qs('#skills')
    skillsContainer.innerHTML = '';
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
    projects = data.projects || []
    renderProjectFilters()
    renderProjectCards()
  }

  function renderProjectFilters(){
    const filters = qs('#projectFilters')
    filters.innerHTML = ''
    const filterNames = ['Todos', ...projects.map(project=>project.title)]
    filterNames.forEach(filterName=>{
      const button = document.createElement('button')
      button.className = 'project-filter'
      button.type = 'button'
      button.textContent = filterName
      button.setAttribute('aria-pressed', filterName === activeProjectFilter)
      button.classList.toggle('active', filterName === activeProjectFilter)
      button.addEventListener('click', ()=>{
        activeProjectFilter = filterName
        projectsExpanded = false
        projectCarouselIndex = 0
        renderProjectFilters()
        renderProjectCards()
      })
      filters.appendChild(button)
    })
  }

  function renderProjectCards(){
    const grid = qs('#projectsGrid')
    const filteredProjects = activeProjectFilter === 'Todos'
      ? projects
      : projects.filter(project=>project.title === activeProjectFilter || (project.tags||[]).includes(activeProjectFilter))
    const visibleProjects = projectsExpanded ? filteredProjects : filteredProjects.slice(0, PROJECT_LIMIT)
    grid.innerHTML = '';
    grid.classList.toggle('is-list', viewMode === 'list')
    if(viewMode === 'list'){
      renderProjectList(visibleProjects, grid)
    } else {
      renderProjectCarousel(visibleProjects, grid)
    }
    updateProjectCarousel(visibleProjects.length)
  }

  function renderProjectCarousel(projectList, grid){
    projectList.forEach(p=>{
      const card = document.createElement('article')
      card.className='project-slide'
      card.setAttribute('aria-label', `Proyecto ${p.title}`)
      card.setAttribute('tabindex', '0')
      card.setAttribute('role', 'link')
      card.addEventListener('click', event=>{
        if(event.target.closest('a, button')) return
        window.location.href = p.link
      })
      card.addEventListener('keydown', event=>{
        if(event.key === 'Enter' || event.key === ' '){
          event.preventDefault()
          window.location.href = p.link
        }
      })
      if(p.image){
        const image = document.createElement('img')
        image.className = 'project-image'
        image.src = p.image
        image.alt = p.alt || `Vista previa del proyecto digital ${p.title} de Andres Romero`
        card.appendChild(image)
      }
      const content = document.createElement('div')
      content.className = 'project-content'
      const title = document.createElement('h4')
      title.textContent = p.title
      const category = document.createElement('span')
      category.className = 'project-category'
      category.textContent = p.category || 'Proyecto digital'
      const description = document.createElement('p')
      description.textContent = p.description
      const tags = document.createElement('div')
      tags.className = 'project-tags'
      ;(p.tags || []).forEach(tag=>{
        const tagElement = document.createElement('span')
        tagElement.textContent = tag
        tags.appendChild(tagElement)
      })
      content.append(category, title, description, tags)
      card.appendChild(content)
      grid.appendChild(card)
    })
  }

  function renderProjectList(projectList, grid){
    projectList.forEach(p=>{
      const card = document.createElement('article')
      card.className = 'project-list-item'
      card.setAttribute('tabindex', '0')
      card.setAttribute('role', 'link')
      card.addEventListener('click', event=>{
        if(event.target.closest('a, button')) return
        window.location.href = p.link
      })
      card.addEventListener('keydown', event=>{
        if(event.key === 'Enter' || event.key === ' '){
          event.preventDefault()
          window.location.href = p.link
        }
      })
      if(p.image){
        const image = document.createElement('img')
        image.className = 'project-list-image'
        image.src = p.image
        image.alt = p.alt || `Vista previa del proyecto digital ${p.title} de Andres Romero`
        image.loading = 'lazy'
        card.appendChild(image)
      }
      const content = document.createElement('div')
      content.className = 'project-list-content'
      const title = document.createElement('h3')
      title.textContent = p.title
      const description = document.createElement('p')
      description.textContent = p.description
      const tags = document.createElement('div')
      tags.className = 'project-tags'
      ;(p.tags || []).forEach(tag=>{
        const tagElement = document.createElement('span')
        tagElement.textContent = tag
        tags.appendChild(tagElement)
      })
      content.append(title, description, tags)
      card.appendChild(content)
      grid.appendChild(card)
    })
  }

  function updateProjectCarousel(projectCount){
    const track = qs('#projectsGrid')
    const previous = qs('.carousel-prev')
    const next = qs('.carousel-next')
    if(!track || !previous || !next) return
    const carousel = qs('.projects-carousel')
    if(viewMode === 'list'){
      track.style.transform = ''
      previous.hidden = true
      next.hidden = true
      carousel?.classList.add('is-list-view')
      return
    }
    previous.hidden = false
    next.hidden = false
    carousel?.classList.remove('is-list-view')
    const visibleCards = 1
    const maxIndex = Math.max(0, projectCount - visibleCards)
    projectCarouselIndex = Math.min(projectCarouselIndex, maxIndex)
    track.style.transform = `translateX(-${projectCarouselIndex * (100 / visibleCards)}%)`
    previous.disabled = projectCarouselIndex === 0
    next.disabled = projectCarouselIndex >= maxIndex
  }

  function moveProjectCarousel(direction){
    const filteredCount = activeProjectFilter === 'Todos'
      ? projects.length
      : projects.filter(project=>project.title === activeProjectFilter || (project.tags||[]).includes(activeProjectFilter)).length
    const visibleCount = projectsExpanded ? filteredCount : Math.min(filteredCount, PROJECT_LIMIT)
    const visibleCards = 1
    const maxIndex = Math.max(0, visibleCount - visibleCards)
    projectCarouselIndex = Math.max(0, Math.min(projectCarouselIndex + direction, maxIndex))
    updateProjectCarousel(visibleCount)
  }

  function renderCerts(data){
    const list = qs('#certsList')
    list.innerHTML = '';
    (data.certificates||[]).forEach(c=>{
      const card = document.createElement('div')
      card.className='card-small'
      card.innerHTML = `<strong>${c.title}</strong><div style="color:var(--muted);margin-top:6px">${c.issuer} • ${c.year}</div>`
      list.appendChild(card)
    })
  }

  function renderSocials(data){
    const list = qs('#socialList')
    list.innerHTML = '';
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

  const flipbookPages = [
    {
      kicker: '01 · Portada',
      title: 'Aprender construyendo software',
      text: 'Este portafolio reúne proyectos desarrollados durante mi formación en Ingeniería de Software, con foco en resolver problemas y convertir ideas en aplicaciones web funcionales.',
      tags: ['Software', 'Frontend', 'Aprendizaje'],
      author: 'Andres Romero'
    },
    {
      kicker: '02 · Concepto',
      title: 'Interfaces que resuelven',
      text: 'Cada proyecto parte de una necesidad concreta y se transforma en una interfaz clara, responsive y usable mediante estructura HTML, estilos CSS y lógica JavaScript.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      author: 'Desarrollo web'
    },
    {
      kicker: '03 · Experiencia',
      title: 'Lógica, estado y persistencia',
      text: 'Los proyectos exploran interacciones, filtros, navegación, manejo de estado y persistencia local para practicar conceptos esenciales de la construcción de software.',
      tags: ['Lógica', 'Estado', 'LocalStorage'],
      author: 'Ingeniería de Software'
    },
    {
      kicker: '04 · Proyectos',
      title: 'Código en evolución',
      text: 'Cada entrega representa una etapa de aprendizaje: analizar el problema, implementar una solución, probarla en distintos tamaños de pantalla y mejorarla con cada iteración.',
      tags: ['Frontend', 'Responsive', 'Iteración'],
      author: 'Caso de estudio'
    }
  ]

  let flipbookIndex = 0
  let isTurning = false
  let dragState = { active:false, startX:0, dx:0, pointerId:null }

  function renderFlipbookPage(el, page, mode='default'){
    if(!el || !page) return
    el.innerHTML = `
      <div class="page-header">
        <span class="page-kicker">${page.kicker}</span>
        <span class="page-index">${mode === 'left' ? 'PREV' : mode === 'ghost' ? 'NEXT' : 'CURRENT'}</span>
      </div>
      <div class="page-body">
        <h4>${page.title}</h4>
        <p>${page.text}</p>
        <div class="page-tags">${page.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
      </div>
      <div class="page-footer">
        <strong>${page.author}</strong>
        <span>Editorial</span>
      </div>
    `
  }

  function renderFlipbook(){
    const leftPage = qs('#bookLeftPage')
    const rightPage = qs('#bookRightPage')
    const ghostPage = qs('#bookGhostPage')
    const leftIndex = (flipbookIndex - 1 + flipbookPages.length) % flipbookPages.length
    const ghostIndex = (flipbookIndex + 1) % flipbookPages.length

    renderFlipbookPage(leftPage, flipbookPages[leftIndex], 'left')
    renderFlipbookPage(rightPage, flipbookPages[flipbookIndex], 'right')
    renderFlipbookPage(ghostPage, flipbookPages[ghostIndex], 'ghost')

    leftPage.classList.remove('is-dragging')
    rightPage.classList.remove('is-dragging')
    rightPage.classList.remove('is-turning', 'turn-next', 'turn-prev')
    
    leftPage.style.transform = ''
    leftPage.style.filter = ''
    leftPage.style.zIndex = ''
    leftPage.style.transition = 'none'
    
    rightPage.style.transform = ''
    rightPage.style.opacity = ''
    rightPage.style.filter = ''
    rightPage.style.zIndex = ''
    rightPage.style.transition = 'none'
    
    ghostPage.style.transform = ''
    
    // restore transition smoothly after a tiny delay
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        leftPage.style.transition = ''
        rightPage.style.transition = ''
      })
    })
  }

  function animateBookTurn(direction){
    const rightPage = qs('#bookRightPage')
    const leftPage = qs('#bookLeftPage')
    if(!rightPage || !leftPage || isTurning) return
    isTurning = true
    const isNext = direction > 0
    const activePage = isNext ? rightPage : leftPage
    
    const finishTurn = ()=>{
      flipbookIndex = (flipbookIndex + direction + flipbookPages.length) % flipbookPages.length
      renderFlipbook()
      isTurning = false
    }

    let timeoutId;
    const onTransformEnd = event=>{
      if(!event || event.propertyName === 'transform'){
        clearTimeout(timeoutId)
        activePage.removeEventListener('transitionend', onTransformEnd)
        finishTurn()
      }
    }

    rightPage.classList.remove('is-dragging')
    leftPage.classList.remove('is-dragging')
    
    const transitionStr = 'transform 0.65s cubic-bezier(.22,.8,.25,1), filter 0.65s ease'
    activePage.style.transition = transitionStr
    activePage.addEventListener('transitionend', onTransformEnd)
    timeoutId = setTimeout(onTransformEnd, 700) // Fallback to prevent freezing

    requestAnimationFrame(()=>{
      if (isNext) {
        rightPage.style.zIndex = 6
        rightPage.style.transform = `rotateY(-180deg) translateZ(10px)`
        rightPage.style.filter = 'brightness(0.7)'
      } else {
        leftPage.style.zIndex = 6
        leftPage.style.transform = `rotateY(180deg) translateZ(10px)`
        leftPage.style.filter = 'brightness(0.7)'
      }
    })
  }

  function resetDragState(){
    const rightPage = qs('#bookRightPage')
    const leftPage = qs('#bookLeftPage')
    if(!rightPage || !leftPage) return
    dragState.active = false
    dragState.pointerId = null
    
    rightPage.classList.remove('is-dragging')
    leftPage.classList.remove('is-dragging')
    
    const transitionStr = 'transform 0.5s cubic-bezier(.22,.8,.25,1), filter 0.5s ease'
    rightPage.style.transition = transitionStr
    leftPage.style.transition = transitionStr
    
    rightPage.style.transform = ''
    rightPage.style.filter = ''
    rightPage.style.zIndex = ''
    
    leftPage.style.transform = ''
    leftPage.style.filter = ''
    leftPage.style.zIndex = ''
    
    setTimeout(()=>{
      rightPage.style.transition = ''
      leftPage.style.transition = ''
    }, 550)
  }

  function handlePointerMove(event){
    if(!dragState.active || isTurning) return
    const delta = event.clientX - dragState.startX
    const rightPage = qs('#bookRightPage')
    const leftPage = qs('#bookLeftPage')
    if(!rightPage || !leftPage) return

    dragState.dx = delta
    const maxDrag = window.innerWidth * 0.45 || 400
    
    rightPage.classList.add('is-dragging')
    leftPage.classList.add('is-dragging')
    rightPage.style.transition = 'none'
    leftPage.style.transition = 'none'

    if (delta < 0) { // Dragging left (Next)
      const ratio = Math.min(Math.abs(delta) / maxDrag, 1)
      const angle = ratio * -180
      const zOffset = Math.sin(ratio * Math.PI) * 40 // lift effect
      
      rightPage.style.transform = `rotateY(${angle}deg) translateZ(${zOffset}px)`
      rightPage.style.filter = `brightness(${1 - ratio * 0.3})`
      rightPage.style.zIndex = 5
      
      leftPage.style.transform = ''
      leftPage.style.filter = ''
    } else { // Dragging right (Prev)
      const ratio = Math.min(delta / maxDrag, 1)
      const angle = ratio * 180
      const zOffset = Math.sin(ratio * Math.PI) * 40
      
      leftPage.style.transform = `rotateY(${angle}deg) translateZ(${zOffset}px)`
      leftPage.style.filter = `brightness(${1 - ratio * 0.3})`
      leftPage.style.zIndex = 5
      
      rightPage.style.transform = ''
      rightPage.style.filter = ''
    }
  }

  function handlePointerDown(event){
    const book = qs('#editorialBook')
    if(!book || isTurning) return
    const target = event.target.closest('button, a')
    if(target) return
    dragState.active = true
    dragState.startX = event.clientX
    dragState.dx = 0
    dragState.pointerId = event.pointerId
    book.classList.add('is-dragging')
    event.preventDefault()
    book.setPointerCapture?.(event.pointerId)
  }

  function handlePointerUp(event){
    const book = qs('#editorialBook')
    if (book) book.classList.remove('is-dragging')
    if(!dragState.active) return
    
    const threshold = 70 // Easier to trigger
    const direction = dragState.dx < 0 ? 1 : -1
    
    if(Math.abs(dragState.dx) > threshold){
      animateBookTurn(direction)
    } else {
      resetDragState()
    }
    
    dragState.active = false
    dragState.pointerId = null
    dragState.dx = 0
    dragState.startX = 0
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
    const target = ['inicio','flipbook','proyectos','certificados','redes'].includes(hash)?hash:'inicio'
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

    const navButton = e.target.closest('[data-page-direction]')
    if(navButton){
      const direction = navButton.dataset.pageDirection === 'next' ? 1 : -1
      animateBookTurn(direction)
    }

    const projectButton = e.target.closest('[data-project-direction]')
    if(projectButton){
      moveProjectCarousel(projectButton.dataset.projectDirection === 'next' ? 1 : -1)
    }

    const viewButton = e.target.closest('[data-view-mode]')
    if(viewButton){
      viewMode = viewButton.dataset.viewMode
      document.querySelectorAll('[data-view-mode]').forEach(button=>{
        const isActive = button.dataset.viewMode === viewMode
        button.classList.toggle('active', isActive)
        button.setAttribute('aria-pressed', String(isActive))
      })
      projectCarouselIndex = 0
      renderProjectCards()
    }
  })

  window.addEventListener('hashchange', onHashChange)
  window.addEventListener('resize', ()=>{
    const filteredCount = activeProjectFilter === 'Todos'
      ? projects.length
      : projects.filter(project=>project.title === activeProjectFilter || (project.tags||[]).includes(activeProjectFilter)).length
    updateProjectCarousel(projectsExpanded ? filteredCount : Math.min(filteredCount, PROJECT_LIMIT))
  })
  const book = qs('#editorialBook')
  if(book){
    book.addEventListener('pointerdown', handlePointerDown)
    book.addEventListener('pointermove', handlePointerMove)
    book.addEventListener('pointerup', handlePointerUp)
    book.addEventListener('pointerleave', handlePointerUp)
    book.addEventListener('pointercancel', handlePointerUp)
  }
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
  qs('#themeToggle').addEventListener('click', ()=>{
    transitionTheme()
  })

  setTheme(localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark')

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
    renderFlipbook()
    onHashChange()
  })

})();