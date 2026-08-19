(() => {
  const dataUrl = 'data.json'
  const bannerTrack = document.querySelector('#bannerTrack')
  const bannerDots = document.querySelector('#bannerDots')
  let activeBanner = 0
  let bannerTimer

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

  function getInitials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  }

  function renderHeader(profile) {
    document.querySelector('#userInitials').textContent = getInitials(profile.name)
    document.querySelector('#userName').textContent = profile.name
    document.querySelector('#userPhone').textContent = profile.phone
  }

  function renderBanners(banners) {
    bannerTrack.innerHTML = banners.map((banner) => `
      <article class="banner">
        <h3>${escapeHtml(banner.title)}</h3>
        <p>${escapeHtml(banner.description)}</p>
      </article>
    `).join('')

    bannerDots.innerHTML = banners.map((_, index) => `
      <button class="banner-dot${index === 0 ? ' active' : ''}" type="button" aria-label="Mostrar banner ${index + 1}" data-banner="${index}"></button>
    `).join('')

    bannerDots.addEventListener('click', (event) => {
      const dot = event.target.closest('[data-banner]')
      if (!dot) return
      showBanner(Number(dot.dataset.banner))
    })

    bannerTrack.addEventListener('scroll', () => {
      const width = bannerTrack.clientWidth
      if (!width) return
      showBanner(Math.round(bannerTrack.scrollLeft / width), false)
    }, { passive: true })

    clearInterval(bannerTimer)
    bannerTimer = setInterval(() => {
      const nextBanner = (activeBanner + 1) % banners.length
      showBanner(nextBanner)
    }, 4000)
  }

  function showBanner(index, shouldScroll = true) {
    const banners = bannerTrack.querySelectorAll('.banner')
    if (!banners.length) return
    activeBanner = Math.max(0, Math.min(index, banners.length - 1))
    if (shouldScroll) bannerTrack.scrollTo({ left: bannerTrack.clientWidth * activeBanner, behavior: 'smooth' })
    bannerDots.querySelectorAll('.banner-dot').forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === activeBanner)
    })
  }

  function renderUsage(usage) {
    const usageGrid = document.querySelector('#usageGrid')
    usageGrid.innerHTML = usage.map((item) => `
      <article class="usage-item">
        <div class="donut" style="--progress: ${item.usedPercent}%; --tone: ${escapeHtml(item.color)}">
          <span class="donut-value">${item.usedPercent}%</span>
        </div>
        <p class="usage-label">${escapeHtml(item.type)}</p>
        <p class="usage-remaining">${escapeHtml(item.remaining)}</p>
      </article>
    `).join('')
  }

  function renderAccount(account) {
    document.querySelector('#balanceAmount').textContent = account.balance
    document.querySelector('#expirationDate').textContent = `Vence ${account.expires}`
    document.querySelector('#planName').textContent = account.plan
  }

  async function initialize() {
    try {
      const response = await fetch(dataUrl, { cache: 'no-store' })
      if (!response.ok) throw new Error('No se pudo cargar data.json')
      const data = await response.json()
      renderHeader(data.profile)
      renderBanners(data.banners)
      renderAccount(data.account)
      renderUsage(data.account.usage)
    } catch (error) {
      console.error(error)
      renderHeader({ name: 'Tu Nombre', phone: '+51 999 999 999' })
      renderBanners([
        { title: 'Duplica tus datos', description: 'Compra un combo y navega con más libertad.' },
        { title: 'Combos para ti', description: 'Elige el paquete que mejor se adapta a tu día.' },
        { title: 'Siempre conectado', description: 'Disfruta tus beneficios durante todo el mes.' }
      ])
      renderAccount({ balance: 'S/ 25.00', expires: '30/08/2026', plan: 'Incluye un combo' })
      renderUsage([
        { type: 'DATOS', usedPercent: 64, remaining: '3.6 GB libres', color: '#5474ee' },
        { type: 'VOZ', usedPercent: 38, remaining: '620 min libres', color: '#36b99a' },
        { type: 'SMS', usedPercent: 72, remaining: '84 SMS libres', color: '#f3a640' }
      ])
    }
  }

  document.querySelector('#buyButton').addEventListener('click', () => {
    window.alert('Aquí puedes conectar el flujo de compra de paquetes.')
  })

  document.querySelector('#notificationButton').addEventListener('click', () => {
    window.alert('No tienes notificaciones nuevas.')
  })

  document.querySelector('#menuButton').addEventListener('click', () => {
    window.alert('Aquí puedes abrir el menú de opciones.')
  })

  initialize()
})()
