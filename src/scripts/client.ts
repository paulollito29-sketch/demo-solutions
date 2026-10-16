import { PROSPECTS } from '../data/prospects';
import { getThemeForRubro } from '../data/themes';
import type { Prospect, ServiceItem, RubroTheme } from '../types/prospect';

// State
let currentProspect: Prospect = PROSPECTS[0];
let currentTheme: RubroTheme = getThemeForRubro(currentProspect.rubro);
let cart: ServiceItem[] = [];
let activeCategory: string = 'Todos';

function initApp() {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id');
  const isDemoMode = params.get('demo') === '1' || params.get('demo') === 'true';

  if (isDemoMode) {
    const agencyBar = document.getElementById('agency-bar');
    if (agencyBar) agencyBar.style.display = 'none';
  }

  const select = document.getElementById('prospect-select') as HTMLSelectElement | null;
  if (select) {
    select.innerHTML = PROSPECTS.map(p => 
      `<option value="${p.id}">[${p.id}] ${p.name} · ${p.zona} (${p.rubro})</option>`
    ).join('');

    select.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      setProspect(target.value);
    });
  }

  // Setup buttons
  document.getElementById('btn-open-pitch')?.addEventListener('click', openPitchModal);
  document.getElementById('btn-close-pitch')?.addEventListener('click', closePitchModal);
  document.getElementById('btn-close-pitch-bottom')?.addEventListener('click', closePitchModal);
  document.getElementById('btn-copy-wa')?.addEventListener('click', () => copyText('pitch-wa'));
  document.getElementById('btn-copy-email')?.addEventListener('click', () => copyText('pitch-email'));
  document.getElementById('btn-copy-link')?.addEventListener('click', copyClientLink);
  document.getElementById('btn-hide-agency')?.addEventListener('click', hideAgencyBar);
  document.getElementById('btn-send-whatsapp')?.addEventListener('click', sendWhatsAppOrder);

  // Before-After slider
  const baSlider = document.getElementById('ba-slider') as HTMLInputElement | null;
  if (baSlider) {
    baSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      updateBeforeAfter(Number(target.value));
    });
  }

  if (requestedId) {
    setProspect(requestedId);
  } else {
    setProspect(PROSPECTS[0].id);
  }
}

function setProspect(id: string) {
  const found = PROSPECTS.find(p => p.id === id);
  if (!found) return;
  currentProspect = found;
  currentTheme = getThemeForRubro(found.rubro);
  cart = [];
  activeCategory = 'Todos';

  const select = document.getElementById('prospect-select') as HTMLSelectElement | null;
  if (select && select.value !== id) {
    select.value = id;
  }

  const isBenny = found.id === 'P001' || found.name.toLowerCase().includes('benny');
  const bennyView = document.getElementById('benny-prototype-view');
  const generalView = document.getElementById('general-prototype-view');

  if (isBenny) {
    if (bennyView) bennyView.style.display = 'block';
    if (generalView) generalView.style.display = 'none';
    document.documentElement.style.setProperty('--bg-main', '#FAF7FC');
    document.documentElement.style.setProperty('--bg-alt', '#F5EEF9');
    document.documentElement.style.setProperty('--ink', '#1F142B');
    document.documentElement.style.setProperty('--accent', '#512680');
    document.documentElement.style.setProperty('--border-hair', '#E8DEF0');
  } else {
    if (bennyView) bennyView.style.display = 'none';
    if (generalView) generalView.style.display = 'block';
    document.documentElement.style.setProperty('--bg-main', currentTheme.bgMain);
    document.documentElement.style.setProperty('--bg-alt', currentTheme.bgAlt);
    document.documentElement.style.setProperty('--ink', currentTheme.ink);
    document.documentElement.style.setProperty('--accent', currentTheme.accent);
    document.documentElement.style.setProperty('--border-hair', currentTheme.border);
  }

  // Dynamic Content Updates
  const p = currentProspect;
  const th = currentTheme;

  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = `${p.name} — ${p.zona} | Carta & Reservas`;

  const topbarAddress = document.getElementById('topbar-address');
  if (topbarAddress) topbarAddress.textContent = p.direccion;

  const topbarRating = document.getElementById('topbar-rating');
  if (topbarRating) topbarRating.textContent = p.estrellas;

  const topbarReviews = document.getElementById('topbar-reviews');
  if (topbarReviews) topbarReviews.textContent = p.resenas;

  const topbarPhone = document.getElementById('topbar-phone') as HTMLAnchorElement | null;
  if (topbarPhone) {
    topbarPhone.textContent = `Tel: ${p.tel}`;
    topbarPhone.href = `tel:${p.tel.replace(/[^0-9+]/g, '')}`;
  }

  const navRubroTag = document.getElementById('nav-rubro-tag');
  if (navRubroTag) navRubroTag.textContent = `${th.rubroTag} · ${p.zona.toUpperCase()}`;

  const navName = document.getElementById('nav-name');
  if (navName) navName.textContent = p.name;

  const navCtaText = document.getElementById('nav-cta-text');
  if (navCtaText) navCtaText.textContent = th.ctaText;

  const navMenuLabel = document.getElementById('nav-menu-label');
  if (navMenuLabel) navMenuLabel.textContent = th.menuLabel;

  const heroKicker = document.getElementById('hero-kicker');
  if (heroKicker) heroKicker.textContent = `LOCAL EN ${p.zona.toUpperCase()}`;

  const heroStatusTag = document.getElementById('hero-status-tag');
  if (heroStatusTag) heroStatusTag.textContent = p.es_celular.toUpperCase();

  const heroHeadlineMain = document.getElementById('hero-headline-main');
  if (heroHeadlineMain) heroHeadlineMain.textContent = th.headlineMain;

  const heroHeadlineItalic = document.getElementById('hero-headline-italic');
  if (heroHeadlineItalic) heroHeadlineItalic.textContent = `${p.name}.`;

  const heroLead = document.getElementById('hero-lead');
  if (heroLead) heroLead.textContent = `${th.lead} Encuéntranos en ${p.direccion}.`;

  const heroPrimaryBtn = document.getElementById('hero-primary-btn');
  if (heroPrimaryBtn) heroPrimaryBtn.textContent = th.primaryBtn;

  const statRating = document.getElementById('stat-rating');
  if (statRating) statRating.textContent = p.estrellas;

  const statReviews = document.getElementById('stat-reviews');
  if (statReviews) statReviews.textContent = p.resenas;

  const statZone = document.getElementById('stat-zone');
  if (statZone) statZone.textContent = p.zona;

  const heroPhoto = document.getElementById('hero-photo') as HTMLImageElement | null;
  if (heroPhoto) heroPhoto.src = th.heroPhoto;

  const featuredLabel = document.getElementById('featured-label');
  if (featuredLabel) featuredLabel.textContent = th.featuredLabel;

  const featuredPrice = document.getElementById('featured-price');
  if (featuredPrice) featuredPrice.textContent = th.featuredPrice;

  const featuredTitle = document.getElementById('featured-title');
  if (featuredTitle) featuredTitle.textContent = th.featuredTitle;

  const featuredSub = document.getElementById('featured-sub');
  if (featuredSub) featuredSub.textContent = th.featuredSub;

  const heroAddressCaption = document.getElementById('hero-address-caption');
  if (heroAddressCaption) heroAddressCaption.textContent = p.direccion;

  const menuKicker = document.getElementById('menu-kicker');
  if (menuKicker) menuKicker.textContent = th.menuKicker;

  const menuHeading = document.getElementById('menu-heading');
  if (menuHeading) menuHeading.textContent = th.menuHeading;

  const ticketTitle = document.getElementById('ticket-title');
  if (ticketTitle) ticketTitle.textContent = th.ticketTitle;

  const ticketBizName = document.getElementById('ticket-biz-name');
  if (ticketBizName) ticketBizName.textContent = p.name;

  const ticketBizPhone = document.getElementById('ticket-biz-phone');
  if (ticketBizPhone) ticketBizPhone.textContent = p.tel;

  const baKicker = document.getElementById('ba-kicker');
  if (baKicker) baKicker.textContent = th.baKicker;

  const baTitle = document.getElementById('ba-title');
  if (baTitle) baTitle.textContent = th.baTitle;

  const baDesc = document.getElementById('ba-desc');
  if (baDesc) baDesc.textContent = th.baDesc;

  const baImgBefore = document.getElementById('ba-img-before') as HTMLImageElement | null;
  if (baImgBefore) baImgBefore.src = th.baBefore;

  const baImgAfter = document.getElementById('ba-img-after') as HTMLImageElement | null;
  if (baImgAfter) baImgAfter.src = th.baAfter;

  const locZone = document.getElementById('loc-zone');
  if (locZone) locZone.textContent = p.zona.toUpperCase();

  const locName = document.getElementById('loc-name');
  if (locName) locName.textContent = p.name;

  const locAddress = document.getElementById('loc-address');
  if (locAddress) locAddress.textContent = p.direccion;

  const locPhone = document.getElementById('loc-phone');
  if (locPhone) locPhone.textContent = p.tel;

  const revRatingInline = document.getElementById('rev-rating-inline');
  if (revRatingInline) revRatingInline.textContent = p.estrellas;

  const footerName = document.getElementById('footer-name');
  if (footerName) footerName.textContent = p.name;

  const mapQuery = encodeURIComponent(`${p.name} ${p.direccion} ${p.zona} Lima Peru`);
  const gmapIframe = document.getElementById('gmap-iframe') as HTMLIFrameElement | null;
  if (gmapIframe) {
    gmapIframe.src = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  const locMapsLink = document.getElementById('loc-maps-link') as HTMLAnchorElement | null;
  if (locMapsLink) {
    locMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  }

  const locCallLink = document.getElementById('loc-call-link') as HTMLAnchorElement | null;
  if (locCallLink) {
    locCallLink.href = `tel:${p.tel.replace(/[^0-9+]/g, '')}`;
  }

  const prospectMeta = document.getElementById('prospect-meta');
  if (prospectMeta) {
    prospectMeta.textContent = `${p.es_celular} | ${p.tel} | ${p.franja}`;
  }

  renderCategories();
  renderServices();
  renderCart();
}

function renderCategories() {
  const cats = ['Todos', ...new Set(currentTheme.services.map(s => s.cat))];
  const container = document.getElementById('category-tabs');
  if (!container) return;

  container.innerHTML = cats.map(c => {
    const active = c === activeCategory;
    return `<button data-cat="${c}" class="btn-category-tab px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider border transition cursor-pointer ${
      active ? 'bg-stone-900 text-white border-stone-900' : 'bg-transparent text-stone-700 hairline-border hover:border-stone-900'
    }">${c}</button>`;
  }).join('');

  container.querySelectorAll('.btn-category-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const cat = target.getAttribute('data-cat') || 'Todos';
      setCategory(cat);
    });
  });
}

function setCategory(c: string) {
  activeCategory = c;
  renderCategories();
  renderServices();
}

function renderServices() {
  const container = document.getElementById('services-list');
  if (!container) return;

  const list = activeCategory === 'Todos'
    ? currentTheme.services
    : currentTheme.services.filter(s => s.cat === activeCategory);

  container.innerHTML = list.map((s, idx) => {
    const inCart = cart.some(item => item.id === s.id);
    return `
      <div class="menu-row py-5 flex items-start justify-between gap-4">
        <div class="space-y-1 pr-3">
          <div class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-stone-500">
            <span>0${idx + 1}</span>
            <span>·</span>
            <span>${s.cat}</span>
            <span>·</span>
            <span>${s.time}</span>
          </div>
          <h4 class="font-serif text-xl sm:text-2xl font-semibold text-stone-900">${s.name}</h4>
          <p class="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-lg">${s.desc}</p>
        </div>
        <div class="flex flex-col items-end shrink-0 gap-2">
          <span class="font-mono text-base sm:text-lg font-bold text-stone-900">S/ ${s.price}</span>
          <button data-service-id="${s.id}" class="btn-toggle-service px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider border transition cursor-pointer ${
            inCart ? 'bg-emerald-800 text-white border-emerald-800' : 'border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white'
          }">
            ${inCart ? '✓ En tu lista' : '+ Seleccionar'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-toggle-service').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const id = target.getAttribute('data-service-id');
      if (id) toggleService(id);
    });
  });
}

function toggleService(id: string) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx >= 0) {
    cart.splice(idx, 1);
  } else {
    const found = currentTheme.services.find(s => s.id === id);
    if (found) cart.push(found);
  }
  renderServices();
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const badge = document.getElementById('cart-count-badge');
  const totalEl = document.getElementById('cart-total');
  if (!container || !badge || !totalEl) return;

  badge.textContent = `${cart.length} ${cart.length === 1 ? 'ítem' : 'ítems'}`;
  const sum = cart.reduce((acc, s) => acc + s.price, 0);
  totalEl.textContent = `S/ ${sum.toFixed(2)}`;

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-stone-400 italic py-4 text-center font-serif">Selecciona uno o más ítems de la carta a la izquierda para armar tu reserva.</p>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="flex items-baseline justify-between gap-2 py-1">
      <div class="pr-2">
        <span class="font-medium text-stone-900">${item.name}</span>
      </div>
      <div class="flex items-center gap-2 shrink-0 font-mono">
        <span>S/ ${item.price}</span>
        <button data-remove-id="${item.id}" class="btn-remove-cart text-stone-400 hover:text-red-700 font-bold px-1 cursor-pointer">✕</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.btn-remove-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const id = target.getAttribute('data-remove-id');
      if (id) toggleService(id);
    });
  });
}

function sendWhatsAppOrder() {
  const nameInput = document.getElementById('client-name') as HTMLInputElement | null;
  const dayInput = document.getElementById('client-day') as HTMLSelectElement | null;
  const timeInput = document.getElementById('client-time') as HTMLSelectElement | null;

  const name = nameInput?.value.trim() || 'Cliente Web';
  const day = dayInput?.value || 'Para hoy';
  const time = timeInput?.value || 'Turno Mañana (10am - 1pm)';

  const itemsText = cart.length > 0
    ? cart.map(i => `• ${i.name} (S/ ${i.price})`).join('\n')
    : '• Consulta de disponibilidad';
  const sum = cart.reduce((acc, s) => acc + s.price, 0);

  const msg = `Hola *${currentProspect.name}*, vi su carta en la web y deseo coordinar lo siguiente:\n\n` +
    `${itemsText}\n` +
    (sum > 0 ? `*Total referencial:* S/ ${sum}.00\n\n` : `\n`) +
    `Nombre: ${name}\n` +
    `Fecha: ${day} (${time})\n\n` +
    `¿Me confirman disponibilidad por favor?`;

  window.open(`https://wa.me/${currentProspect.wa}?text=${encodeURIComponent(msg)}`, '_blank');
}

function updateBeforeAfter(val: number) {
  const imgBefore = document.getElementById('ba-img-before');
  const divider = document.getElementById('ba-divider');
  if (imgBefore) imgBefore.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
  if (divider) divider.style.left = `${val}%`;
}

function hideAgencyBar() {
  const bar = document.getElementById('agency-bar');
  if (bar) bar.style.display = 'none';
}

function getCleanDemoUrl(p: Prospect): string {
  const base = window.location.origin && window.location.origin !== 'null'
    ? window.location.origin + window.location.pathname
    : 'https://demo-solutions-livid.vercel.app';
  return `${base}?id=${p.id}&demo=1`;
}

function copyClientLink() {
  const link = getCleanDemoUrl(currentProspect);
  navigator.clipboard.writeText(link).then(() => {
    alert('Enlace limpio para enviar al cliente copiado:\n' + link);
  }).catch(() => {
    prompt('Copia este enlace para el cliente:', link);
  });
}

function openPitchModal() {
  const p = currentProspect;
  const demoLink = getCleanDemoUrl(p);
  const modalSub = document.getElementById('modal-sub');
  if (modalSub) {
    modalSub.textContent = `${p.id} · ${p.name} (${p.zona}) — ${p.estrellas}★ (${p.resenas} reseñas) | Tel: ${p.tel}`;
  }

  const waPitch = `Hola equipo de *${p.name}*, ¿qué tal? Vi que tienen muy buenas reseñas en Google Maps en ${p.zona} (${p.estrellas} ★), pero noté que no tienen una web propia donde sus clientes vean la carta de precios y reserven directo.\n\n` +
    `Les armamos un boceto funcional a medida para su local:\n👉 ${demoLink}\n\n` +
    `Permite que el cliente elija qué servicio/plato quiere y les envíe el pedido ya armado a su WhatsApp. La dejamos lista con su dominio .com en 72 horas por S/ 500 pago único. ¿Con quién podría conversar 2 minutos para mostrársela?`;

  const emailPitch = `Asunto: Boceto web para ${p.name} (${p.zona}) — Carta digital y reservas a WhatsApp\n\n` +
    `Estimado equipo de ${p.name},\n\n` +
    `Buscando los locales mejor calificados de ${p.zona} en Google Maps, vimos que cuentan con ${p.estrellas} estrellas (${p.resenas} reseñas) en ${p.direccion}, pero aún no cuentan con un sitio web oficial en su ficha.\n\n` +
    `Preparamos una muestra funcional diseñada específicamente para ${p.name}:\n` +
    `🔗 Ver muestra aquí: ${demoLink}\n\n` +
    `¿En qué les ayuda esta web?\n` +
    `• Muestra sus servicios/carta con precios claros estilo editorial (como los principales locales de Miraflores y San Isidro).\n` +
    `• El cliente selecciona lo que desea y les llega el resumen listo a su WhatsApp (sin pagar comisiones a terceros).\n` +
    `• Entrega en 72 horas por S/ 500 pago único (incluye dominio .com y primer mes de soporte).\n\n` +
    `¿Podemos pasar brevemente por su local en el horario de ${p.franja} o llamarlos 3 minutos para mostrarles cómo funciona?\n\n` +
    `Saludos cordiales,\n` +
    `Joaquín Sudario`;

  const pitchWaEl = document.getElementById('pitch-wa') as HTMLTextAreaElement | null;
  const pitchEmailEl = document.getElementById('pitch-email') as HTMLTextAreaElement | null;
  const modalWaTrigger = document.getElementById('modal-wa-trigger') as HTMLAnchorElement | null;

  if (pitchWaEl) pitchWaEl.value = waPitch;
  if (pitchEmailEl) pitchEmailEl.value = emailPitch;
  if (modalWaTrigger) {
    modalWaTrigger.href = `https://wa.me/${p.wa}?text=${encodeURIComponent(waPitch)}`;
  }

  document.getElementById('pitch-modal')?.classList.remove('hidden');
}

function closePitchModal() {
  document.getElementById('pitch-modal')?.classList.add('hidden');
}

function copyText(id: string) {
  const el = document.getElementById(id) as HTMLTextAreaElement | HTMLInputElement | null;
  if (!el) return;
  el.select();
  navigator.clipboard.writeText(el.value).then(() => {
    alert('Copiado al portapapeles.');
  });
}

// Kick off when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
