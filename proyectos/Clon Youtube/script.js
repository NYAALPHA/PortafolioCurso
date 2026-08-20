(() => {
  const dataUrl = 'data.json'
  const state = { videos: [], shorts: [], channels: [], categories: [], selectedCategory: 'Todos', showingAllChannels: false }
  const $ = (selector) => document.querySelector(selector)

  const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')

  function renderCategories() {
    $('#categoryRow').innerHTML = state.categories.map((category) => `<button class="category-button${category === state.selectedCategory ? ' active' : ''}" data-category="${escapeHtml(category)}" type="button">${escapeHtml(category)}</button>`).join('')
  }

  function renderChannels() {
    const visibleChannels = state.showingAllChannels ? state.channels : state.channels.slice(0, 5)
    $('#channelList').innerHTML = visibleChannels.map((channel) => `
      <button class="subscription-item" type="button" data-channel="${escapeHtml(channel.name)}" aria-label="Ver videos de ${escapeHtml(channel.name)}">
        <img class="subscription-logo" src="${channel.logo}" alt="">
        <span class="subscription-name">${escapeHtml(channel.name)}</span>
        ${channel.hasNew ? '<span class="new-channel-dot" aria-label="Novedades"></span>' : ''}
      </button>
    `).join('')
    $('#showMoreChannels').innerHTML = state.showingAllChannels ? '⌃ <span>Mostrar menos</span>' : '⌄ <span>Mostrar más</span>'
  }

  function renderVideos() {
    const query = $('#searchInput').value.trim().toLowerCase()
    const filtered = state.videos.filter((video) => {
      const matchesCategory = state.selectedCategory === 'Todos' || video.category === state.selectedCategory
      const matchesQuery = !query || `${video.title} ${video.channel}`.toLowerCase().includes(query)
      return matchesCategory && matchesQuery
    })
    $('#resultCount').textContent = `${filtered.length} videos`
    $('#videoGrid').innerHTML = filtered.map((video) => `
      <article class="video-card" data-video="${escapeHtml(JSON.stringify(video))}">
        <div class="thumbnail-wrap">
          <img src="${video.thumbnail}" alt="Miniatura de ${escapeHtml(video.title)}" loading="lazy">
          ${video.video ? '<span class="duration">▶</span>' : ''}
        </div>
        <div class="video-info">
          <img class="channel-logo" src="${video.logo}" alt="Logo de ${escapeHtml(video.channel)}" loading="lazy">
          <div><h3 class="video-title">${escapeHtml(video.title)}</h3><p class="video-meta">${escapeHtml(video.channel)}<br>${escapeHtml(video.views)} · ${escapeHtml(video.date)}</p></div>
        </div>
      </article>
    `).join('') || '<p>No se encontraron videos.</p>'
  }

  function renderShorts() {
    $('#shortsGrid').innerHTML = state.shorts.map((short) => `
      <article class="short-card" data-video="${escapeHtml(JSON.stringify(short))}">
        <div class="short-thumbnail"><img src="${short.thumbnail}" alt="Miniatura de ${escapeHtml(short.title)}" loading="lazy"></div>
        <h3>${escapeHtml(short.title)}</h3><p>${escapeHtml(short.channel)} · ${escapeHtml(short.views)}</p>
      </article>
    `).join('')
  }

  function openModal(item) {
    $('#modalTitle').textContent = item.title
    $('#modalMeta').textContent = `${item.channel} · ${item.views || ''}`
    $('#modalMedia').innerHTML = item.video ? `<video src="${item.video}" controls autoplay></video>` : `<img src="${item.thumbnail}" alt="${escapeHtml(item.title)}">`
    $('#videoModal').classList.add('open')
    $('#videoModal').setAttribute('aria-hidden', 'false')
  }

  function closeModal() {
    $('#modalMedia').innerHTML = ''
    $('#videoModal').classList.remove('open')
    $('#videoModal').setAttribute('aria-hidden', 'true')
  }

  async function initialize() {
    try {
      const response = await fetch(dataUrl, { cache: 'no-store' })
      if (!response.ok) throw new Error('No se pudo cargar data.json')
      const data = await response.json()
      state.videos = data.videos
      state.shorts = data.shorts
      state.channels = data.channels
      state.categories = data.categories
      renderCategories()
      renderChannels()
      renderVideos()
      renderShorts()
    } catch (error) {
      console.error(error)
      state.channels = [
        { name: 'Veritasium', logo: 'Resources/canal/veritasium/logo.png', hasNew: true },
        { name: 'BN Periodismo', logo: 'Resources/canal/bn%20periodismo/logo.png', hasNew: true },
        { name: 'Comentando Películas', logo: 'Resources/canal/comentando%20peliculas/logo.png', hasNew: false },
        { name: 'enchufeTV', logo: 'Resources/canal/enchufe%20tv/logo.png', hasNew: true },
        { name: 'DW', logo: 'Resources/canal/dw/logo.png', hasNew: true }
      ]
      renderChannels()
      $('#videoGrid').innerHTML = '<p>No se pudo cargar el contenido local.</p>'
    }
  }

  $('#categoryRow').addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]')
    if (!button) return
    state.selectedCategory = button.dataset.category
    renderCategories()
    renderVideos()
  })
  $('#channelList').addEventListener('click', (event) => {
    const channelButton = event.target.closest('[data-channel]')
    if (!channelButton) return
    $('#searchInput').value = channelButton.dataset.channel
    state.selectedCategory = 'Todos'
    renderCategories()
    renderVideos()
  })
  $('#showMoreChannels').addEventListener('click', () => {
    state.showingAllChannels = !state.showingAllChannels
    renderChannels()
  })
  $('#searchForm').addEventListener('submit', (event) => { event.preventDefault(); renderVideos() })
  $('#videoGrid').addEventListener('click', (event) => { const card = event.target.closest('[data-video]'); if (card) openModal(JSON.parse(card.dataset.video)) })
  $('#shortsGrid').addEventListener('click', (event) => { const card = event.target.closest('[data-video]'); if (card) openModal(JSON.parse(card.dataset.video)) })
  document.addEventListener('click', (event) => { if (event.target.matches('[data-close-modal]')) closeModal() })
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal() })
  $('#menuButton').addEventListener('click', () => $('#sidebar').classList.toggle('open'))
  $('#createButton').addEventListener('click', () => window.alert('Aquí puedes conectar la creación de contenido.'))
  $('#notificationButton').addEventListener('click', () => window.alert('No tienes notificaciones nuevas.'))
  $('#seeShortsButton').addEventListener('click', () => $('#shorts').scrollIntoView({ behavior: 'smooth' }))

  initialize()
})()
