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

  // Setup pitch modal & agency bar buttons
  document.getElementById('btn-open-pitch')?.addEventListener('click', openPitchModal);
  document.getElementById('btn-close-pitch')?.addEventListener('click', closePitchModal);
  document.getElementById('btn-close-pitch-bottom')?.addEventListener('click', closePitchModal);
  document.getElementById('btn-copy-wa')?.addEventListener('click', () => copyText('pitch-wa'));
  document.getElementById('btn-copy-email')?.addEventListener('click', () => copyText('pitch-email'));
  document.getElementById('btn-copy-link')?.addEventListener('click', copyClientLink);
  document.getElementById('btn-hide-agency')?.addEventListener('click', hideAgencyBar);

  // Setup category WhatsApp order/booking buttons
  document.getElementById('btn-send-whatsapp')?.addEventListener('click', () => sendCategoryWhatsApp('general'));
  document.getElementById('btn-rest-send-whatsapp')?.addEventListener('click', () => sendCategoryWhatsApp('restaurant'));
  document.getElementById('btn-vet-send-whatsapp')?.addEventListener('click', () => sendCategoryWhatsApp('veterinary'));
  document.getElementById('btn-salon-send-whatsapp')?.addEventListener('click', () => sendCategoryWhatsApp('salon'));
  document.getElementById('btn-clinic-send-whatsapp')?.addEventListener('click', () => sendCategoryWhatsApp('clinic'));

  // Restaurant Mode Selector (Delivery vs Mesa/Cumpleaños)
  const btnRestDelivery = document.getElementById('rest-mode-delivery');
  const btnRestTable = document.getElementById('rest-mode-table');
  const deliveryFields = document.getElementById('rest-delivery-fields');
  const tableFields = document.getElementById('rest-table-fields');

  btnRestDelivery?.addEventListener('click', () => {
    btnRestDelivery.className = 'py-2.5 px-3 rounded text-center font-bold bg-amber-500 text-stone-950 transition';
    if (btnRestTable) btnRestTable.className = 'py-2.5 px-3 rounded text-center font-bold text-stone-400 hover:text-white transition';
    if (deliveryFields) deliveryFields.style.display = 'block';
    if (tableFields) tableFields.style.display = 'none';
  });

  btnRestTable?.addEventListener('click', () => {
    btnRestTable.className = 'py-2.5 px-3 rounded text-center font-bold bg-amber-500 text-stone-950 transition';
    if (btnRestDelivery) btnRestDelivery.className = 'py-2.5 px-3 rounded text-center font-bold text-stone-400 hover:text-white transition';
    if (deliveryFields) deliveryFields.style.display = 'none';
    if (tableFields) tableFields.style.display = 'block';
  });

  // Veterinary Pet Species Selector
  const dogBtn = document.getElementById('vet-pet-dog');
  const catBtn = document.getElementById('vet-pet-cat');
  const otherBtn = document.getElementById('vet-pet-other');

  dogBtn?.addEventListener('click', () => setPetSpecies('Perrito 🐶', dogBtn));
  catBtn?.addEventListener('click', () => setPetSpecies('Gatito 🐱', catBtn));
  otherBtn?.addEventListener('click', () => setPetSpecies('Exótico / Mascota 🐰', otherBtn));

  // Before-After sliders
  const baSlider = document.getElementById('ba-slider') as HTMLInputElement | null;
  if (baSlider) {
    baSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      updateBeforeAfter(Number(target.value));
    });
  }

  const salonBaSlider = document.getElementById('salon-ba-slider') as HTMLInputElement | null;
  if (salonBaSlider) {
    salonBaSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      updateSalonBeforeAfter(Number(target.value));
    });
  }

  if (requestedId) {
    setProspect(requestedId);
  } else {
    setProspect(PROSPECTS[0].id);
  }
}

let selectedPetSpecies = 'Perrito 🐶';

function setPetSpecies(species: string, activeBtn: HTMLElement | null) {
  selectedPetSpecies = species;
  const dogBtn = document.getElementById('vet-pet-dog');
  const catBtn = document.getElementById('vet-pet-cat');
  const otherBtn = document.getElementById('vet-pet-other');
  [dogBtn, catBtn, otherBtn].forEach(b => {
    if (b) {
      b.className = 'vet-pet-btn py-4 px-3 rounded-2xl border-2 border-stone-200 bg-stone-50 text-stone-700 font-bold flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition';
    }
  });
  if (activeBtn) {
    activeBtn.className = 'vet-pet-btn py-4 px-3 rounded-2xl border-2 border-purple-600 bg-purple-50 text-purple-950 font-bold flex flex-col items-center justify-center gap-2 hover:bg-purple-100 transition';
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

  const p = currentProspect;
  const th = currentTheme;
  const isBenny = p.id === 'P001' || p.name.toLowerCase().includes('benny');
  const rubroLow = p.rubro.toLowerCase();
  const nameLow = p.name.toLowerCase();

  const isRestaurant = rubroLow.includes('restaurante') || rubroLow.includes('marina') || rubroLow.includes('gastronom') || nameLow.includes('cevich');
  const isVet = rubroLow.includes('veterin') || nameLow.includes('pet') || nameLow.includes('vet');
  const isClinic = rubroLow.includes('dental') || rubroLow.includes('odontol') || rubroLow.includes('podol') || rubroLow.includes('clínica') || rubroLow.includes('clinica') || rubroLow.includes('terapia') || nameLow.includes('podól') || nameLow.includes('dental') || nameLow.includes('odont');
  const isSalon = rubroLow.includes('belleza') || rubroLow.includes('bienestar') || rubroLow.includes('peluquer') || nameLow.includes('salón') || nameLow.includes('salon') || nameLow.includes('spa');

  const bennyView = document.getElementById('benny-prototype-view');
  const restView = document.getElementById('restaurant-prototype-view');
  const vetView = document.getElementById('veterinary-prototype-view');
  const salonView = document.getElementById('salon-prototype-view');
  const clinicView = document.getElementById('clinic-prototype-view');
  const generalView = document.getElementById('general-prototype-view');

  const views = [bennyView, restView, vetView, salonView, clinicView, generalView];
  views.forEach(v => { if (v) v.style.display = 'none'; });

  if (isBenny) {
    if (bennyView) bennyView.style.display = 'block';
    document.documentElement.style.setProperty('--bg-main', '#FAF7FC');
    document.documentElement.style.setProperty('--bg-alt', '#F5EEF9');
    document.documentElement.style.setProperty('--ink', '#1F142B');
    document.documentElement.style.setProperty('--accent', '#512680');
    document.documentElement.style.setProperty('--border-hair', '#E8DEF0');
  } else if (isRestaurant) {
    if (restView) restView.style.display = 'block';
    applyPalette(p);
    updateRestaurantView(p);
  } else if (isVet) {
    if (vetView) vetView.style.display = 'block';
    applyPalette(p);
    updateVeterinaryView(p);
  } else if (isClinic) {
    if (clinicView) clinicView.style.display = 'block';
    applyPalette(p);
    updateClinicView(p);
  } else if (isSalon) {
    if (salonView) salonView.style.display = 'block';
    applyPalette(p);
    updateSalonView(p);
  } else {
    if (generalView) generalView.style.display = 'block';
    applyPalette(p);
    updateGeneralView(p, th);
  }

  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = `${p.name} — ${p.zona} | Carta & Reservas`;

  const prospectMeta = document.getElementById('prospect-meta');
  if (prospectMeta) {
    prospectMeta.textContent = `${p.es_celular} | ${p.tel} | ${p.franja}`;
  }

  renderCategories();
  renderServices();
  renderCart();
}

function applyPalette(p: Prospect) {
  if (p.palette) {
    document.documentElement.style.setProperty('--bg-main', p.palette.bg_page);
    document.documentElement.style.setProperty('--bg-panel', p.palette.bg_panel);
    document.documentElement.style.setProperty('--bg-alt', p.palette.bg_tint);
    document.documentElement.style.setProperty('--ink', p.palette.ink);
    document.documentElement.style.setProperty('--accent', p.palette.accent);
    document.documentElement.style.setProperty('--accent-dark', p.palette.accent_dark);
    document.documentElement.style.setProperty('--border-hair', p.palette.line);
  } else {
    document.documentElement.style.setProperty('--bg-main', currentTheme.bgMain);
    document.documentElement.style.setProperty('--bg-panel', '#FFFFFF');
    document.documentElement.style.setProperty('--bg-alt', currentTheme.bgAlt);
    document.documentElement.style.setProperty('--ink', currentTheme.ink);
    document.documentElement.style.setProperty('--accent', currentTheme.accent);
    document.documentElement.style.setProperty('--accent-dark', currentTheme.accent);
    document.documentElement.style.setProperty('--border-hair', currentTheme.border);
  }
}

function updateSocialPill(pillId: string, textId: string, p: Prospect) {
  const pill = document.getElementById(pillId) as HTMLAnchorElement | null;
  const text = document.getElementById(textId);
  if (!pill) return;

  if (p.instagram) {
    const igHandle = p.instagram.startsWith('@') ? p.instagram : `@${p.instagram}`;
    pill.href = `https://instagram.com/${igHandle.replace('@', '')}`;
    pill.style.display = 'inline-flex';
    if (text) text.textContent = igHandle;
  } else if (p.facebook) {
    pill.href = p.facebook;
    pill.style.display = 'inline-flex';
    if (text) text.textContent = 'Facebook Oficial';
  } else {
    pill.href = `https://maps.google.com/?q=${encodeURIComponent(p.name + ' ' + p.zona)}`;
    pill.style.display = 'inline-flex';
    if (text) text.textContent = `${p.estrellas}★ Google Maps`;
  }
}

function updateRestaurantView(p: Prospect) {
  const navLogo = document.getElementById('rest-nav-logo') as HTMLImageElement | null;
  if (navLogo && p.logoUrl) navLogo.src = p.logoUrl;

  const footerLogo = document.getElementById('rest-footer-logo') as HTMLImageElement | null;
  if (footerLogo && p.logoUrl) footerLogo.src = p.logoUrl;

  const footerName = document.getElementById('rest-footer-name');
  if (footerName) footerName.textContent = p.name;

  updateSocialPill('rest-social-pill', 'rest-social-text', p);

  const heroKicker = document.getElementById('rest-hero-kicker');
  if (heroKicker) {
    const isMar = p.rubro.toLowerCase().includes('marina') || p.name.toLowerCase().includes('cevich');
    heroKicker.textContent = p.baKicker || (isMar ? `PESCA FRESCA DEL DÍA EN ${p.zona.toUpperCase()}` : `COCINA Y SAZÓN EN ${p.zona.toUpperCase()}`);
  }

  const heroTitle = document.getElementById('rest-hero-title');
  if (heroTitle) heroTitle.textContent = 'El verdadero sabor del mar en';

  const heroSub = document.getElementById('rest-hero-sub');
  if (heroSub) heroSub.textContent = `${p.name}.`;

  const heroLema = document.getElementById('rest-hero-lema');
  if (heroLema) {
    heroLema.textContent = p.lema || `«¡Preparación al instante y al gusto del cliente! Frescura marina insuperable en ${p.zona}.»`;
  }

  const heroLead = document.getElementById('rest-hero-lead');
  if (heroLead) {
    heroLead.textContent = p.lead || `Pescado fresco del día seleccionado a primera hora, leche de tigre aromática y chicharrón crocante servido al instante en ${p.direccion}. Revisa nuestra carta de precios y pide directo por WhatsApp.`;
  }

  const statRating = document.getElementById('rest-stat-rating');
  if (statRating) statRating.textContent = p.estrellas;

  const statReviews = document.getElementById('rest-stat-reviews');
  if (statReviews) statReviews.textContent = `${p.resenas} clientes`;

  const statZone = document.getElementById('rest-stat-zone');
  if (statZone) statZone.textContent = p.zona;

  const heroPhoto = document.getElementById('rest-hero-photo') as HTMLImageElement | null;
  if (heroPhoto) heroPhoto.src = p.heroPhoto || 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=1200&q=85';

  const featLabel = document.getElementById('rest-featured-label');
  if (featLabel) featLabel.textContent = p.featuredLabel || 'PLATO ESTRELLA';

  const featPrice = document.getElementById('rest-featured-price');
  if (featPrice) featPrice.textContent = p.featuredPrice || 'S/ 38';

  const featTitle = document.getElementById('rest-featured-title');
  if (featTitle) featTitle.textContent = p.featuredTitle || 'Ceviche Clásico Carretillero';

  const featSub = document.getElementById('rest-featured-sub');
  if (featSub) featSub.textContent = p.featuredSub || 'Pesca fresca del día, camote glaseado, choclo desgranado y canchita chulpi.';

  const addrCap = document.getElementById('rest-address-caption');
  if (addrCap) addrCap.textContent = p.direccion;

  const locName = document.getElementById('rest-loc-name');
  if (locName) locName.textContent = p.name;

  const locAddr = document.getElementById('rest-loc-address');
  if (locAddr) locAddr.textContent = p.direccion;

  const locPhone = document.getElementById('rest-loc-phone');
  if (locPhone) locPhone.textContent = p.tel;

  const ticketName = document.getElementById('rest-ticket-name');
  if (ticketName) ticketName.textContent = p.name;

  const ticketPhone = document.getElementById('rest-ticket-phone');
  if (ticketPhone) ticketPhone.textContent = p.tel;

  const revRating = document.getElementById('rest-rev-rating');
  if (revRating) revRating.textContent = p.estrellas;

  const mapQuery = encodeURIComponent(`${p.name} ${p.direccion} ${p.zona} Lima Peru`);
  const iframe = document.getElementById('rest-gmap-iframe') as HTMLIFrameElement | null;
  if (iframe) iframe.src = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const mapLink = document.getElementById('rest-maps-link') as HTMLAnchorElement | null;
  if (mapLink) mapLink.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const callLink = document.getElementById('rest-call-link') as HTMLAnchorElement | null;
  if (callLink) callLink.href = `tel:${p.tel.replace(/[^0-9+]/g, '')}`;

  const floatingWA = document.getElementById('rest-floating-wa') as HTMLAnchorElement | null;
  if (floatingWA) {
    const waMsg = encodeURIComponent(`¡Hola ${p.name}! Vi su carta web y deseo realizar un pedido en su local de ${p.zona}.`);
    floatingWA.href = `https://wa.me/${p.wa}?text=${waMsg}`;
  }
}

function updateVeterinaryView(p: Prospect) {
  const topCall = document.getElementById('vet-top-call') as HTMLAnchorElement | null;
  if (topCall) topCall.href = `tel:${p.tel.replace(/[^0-9+]/g, '')}`;

  const topPhone = document.getElementById('vet-top-phone');
  if (topPhone) topPhone.textContent = p.tel;

  const navLogo = document.getElementById('vet-nav-logo') as HTMLImageElement | null;
  if (navLogo && p.logoUrl) navLogo.src = p.logoUrl;

  const footerLogo = document.getElementById('vet-footer-logo') as HTMLImageElement | null;
  if (footerLogo && p.logoUrl) footerLogo.src = p.logoUrl;

  const footerName = document.getElementById('vet-footer-name');
  if (footerName) footerName.textContent = p.name;

  updateSocialPill('vet-social-pill', 'vet-social-text', p);

  const heroKicker = document.getElementById('vet-hero-kicker');
  if (heroKicker) heroKicker.textContent = p.baKicker || `ATENCIÓN VETERINARIA EN ${p.zona.toUpperCase()}`;

  const heroTitle = document.getElementById('vet-hero-title');
  if (heroTitle) heroTitle.textContent = 'El bienestar de tu engreído en';

  const heroSub = document.getElementById('vet-hero-sub');
  if (heroSub) heroSub.textContent = `${p.name}.`;

  const heroLema = document.getElementById('vet-hero-lema');
  if (heroLema) {
    heroLema.textContent = p.lema || '«Médicos Veterinarios egresados de la UNMSM, comprometidos en velar por el bienestar de tu engreído con mucho amor.»';
  }

  const heroLead = document.getElementById('vet-hero-lead');
  if (heroLead) {
    heroLead.textContent = p.lead || `Atención médica profesional, medicina preventiva, baños relajantes y grooming higiénico en ${p.direccion}. Consulta nuestros servicios y agenda directo por WhatsApp.`;
  }

  const statRating = document.getElementById('vet-stat-rating');
  if (statRating) statRating.textContent = p.estrellas;

  const statReviews = document.getElementById('vet-stat-reviews');
  if (statReviews) statReviews.textContent = `${p.resenas} familias`;

  const statZone = document.getElementById('vet-stat-zone');
  if (statZone) statZone.textContent = p.zona;

  const heroPhoto = document.getElementById('vet-hero-photo') as HTMLImageElement | null;
  if (heroPhoto) heroPhoto.src = p.heroPhoto || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=85';

  const featLabel = document.getElementById('vet-featured-label');
  if (featLabel) featLabel.textContent = p.featuredLabel || 'SPA & GROOMING';

  const featPrice = document.getElementById('vet-featured-price');
  if (featPrice) featPrice.textContent = p.featuredPrice || 'S/ 45';

  const featTitle = document.getElementById('vet-featured-title');
  if (featTitle) featTitle.textContent = p.featuredTitle || 'Baño Medicado & Deslanado Spa';

  const featSub = document.getElementById('vet-featured-sub');
  if (featSub) featSub.textContent = p.featuredSub || 'Shampoo hipoalergénico de avena, corte de uñas, limpieza de oídos y perfume.';

  const addrCap = document.getElementById('vet-address-caption');
  if (addrCap) addrCap.textContent = p.direccion;

  const locName = document.getElementById('vet-loc-name');
  if (locName) locName.textContent = p.name;

  const locAddr = document.getElementById('vet-loc-address');
  if (locAddr) locAddr.textContent = p.direccion;

  const locPhone = document.getElementById('vet-loc-phone');
  if (locPhone) locPhone.textContent = p.tel;

  const ticketName = document.getElementById('vet-ticket-name');
  if (ticketName) ticketName.textContent = p.name;

  const ticketPhone = document.getElementById('vet-ticket-phone');
  if (ticketPhone) ticketPhone.textContent = p.tel;

  const mapQuery = encodeURIComponent(`${p.name} ${p.direccion} ${p.zona} Lima Peru`);
  const iframe = document.getElementById('vet-gmap-iframe') as HTMLIFrameElement | null;
  if (iframe) iframe.src = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const mapLink = document.getElementById('vet-maps-link') as HTMLAnchorElement | null;
  if (mapLink) mapLink.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const callLink = document.getElementById('vet-call-link') as HTMLAnchorElement | null;
  if (callLink) callLink.href = `tel:${p.tel.replace(/[^0-9+]/g, '')}`;

  const floatingWA = document.getElementById('vet-floating-wa') as HTMLAnchorElement | null;
  if (floatingWA) {
    const waMsg = encodeURIComponent(`¡Hola ${p.name}! Deseo consultar disponibilidad para atender a mi mascota en su sede de ${p.zona}.`);
    floatingWA.href = `https://wa.me/${p.wa}?text=${waMsg}`;
  }
}

function updateSalonView(p: Prospect) {
  const navLogo = document.getElementById('salon-nav-logo') as HTMLImageElement | null;
  if (navLogo && p.logoUrl) navLogo.src = p.logoUrl;

  const footerLogo = document.getElementById('salon-footer-logo') as HTMLImageElement | null;
  if (footerLogo && p.logoUrl) footerLogo.src = p.logoUrl;

  const footerName = document.getElementById('salon-footer-name');
  if (footerName) footerName.textContent = p.name;

  updateSocialPill('salon-social-pill', 'salon-social-text', p);

  const heroKicker = document.getElementById('salon-hero-kicker');
  if (heroKicker) heroKicker.textContent = p.baKicker || `ESTUDIO DE BELLEZA EN ${p.zona.toUpperCase()}`;

  const heroTitle = document.getElementById('salon-hero-title');
  if (heroTitle) heroTitle.textContent = 'El arte del estilismo en';

  const heroSub = document.getElementById('salon-hero-sub');
  if (heroSub) heroSub.textContent = `${p.name}.`;

  const heroLema = document.getElementById('salon-hero-lema');
  if (heroLema) {
    heroLema.textContent = p.lema || '«No solo cambiamos tu cabello, transformamos tu actitud. El look de tus sueños está a solo una cita de distancia.»';
  }

  const heroLead = document.getElementById('salon-hero-lead');
  if (heroLead) {
    heroLead.textContent = p.lead || `Tratamientos capilares de alta gama, colorimetría sin maltrato, alisados permanentes y manicure spa en ${p.direccion}. Consulta nuestra carta de precios y asegura tu horario con atención personalizada.`;
  }

  const statRating = document.getElementById('salon-stat-rating');
  if (statRating) statRating.textContent = p.estrellas;

  const statReviews = document.getElementById('salon-stat-reviews');
  if (statReviews) statReviews.textContent = `${p.resenas} clientas`;

  const statZone = document.getElementById('salon-stat-zone');
  if (statZone) statZone.textContent = p.zona;

  const heroPhoto = document.getElementById('salon-hero-photo') as HTMLImageElement | null;
  if (heroPhoto) heroPhoto.src = p.heroPhoto || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85';

  const featLabel = document.getElementById('salon-featured-label');
  if (featLabel) featLabel.textContent = p.featuredLabel || 'EXPERIENCIA EXCLUSIVA';

  const featPrice = document.getElementById('salon-featured-price');
  if (featPrice) featPrice.textContent = p.featuredPrice || 'S/ 160';

  const featTitle = document.getElementById('salon-featured-title');
  if (featTitle) featTitle.textContent = p.featuredTitle || 'Laceado Orgánico Brillo Espejo';

  const featSub = document.getElementById('salon-featured-sub');
  if (featSub) featSub.textContent = p.featuredSub || 'Fórmula libre de formol con nutrición capilar profunda.';

  const addrCap = document.getElementById('salon-address-caption');
  if (addrCap) addrCap.textContent = p.direccion;

  // Before/After
  const baKicker = document.getElementById('salon-ba-kicker');
  if (baKicker) baKicker.textContent = p.baKicker || `TRANSFORMACIÓN CAPILAR REAL · ${p.zona.toUpperCase()}`;

  const baTitle = document.getElementById('salon-ba-title');
  if (baTitle) baTitle.textContent = p.baTitle || 'Resultados que hablan por sí solos.';

  const baDesc = document.getElementById('salon-ba-desc');
  if (baDesc) baDesc.textContent = p.baDesc || 'Desliza el comparador sobre la fotografía para apreciar el cambio de brillo, textura y salud en el cabello de nuestras clientas.';

  const baBefore = (document.getElementById('salon-ba-before') || document.getElementById('salon-ba-img-before')) as HTMLImageElement | null;
  if (baBefore) baBefore.src = p.baBefore || 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=85';

  const baAfter = (document.getElementById('salon-ba-after') || document.getElementById('salon-ba-img-after')) as HTMLImageElement | null;
  if (baAfter) baAfter.src = p.baAfter || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85';

  const locName = document.getElementById('salon-loc-name');
  if (locName) locName.textContent = p.name;

  const locAddr = document.getElementById('salon-loc-address');
  if (locAddr) locAddr.textContent = p.direccion;

  const locPhone = document.getElementById('salon-loc-phone');
  if (locPhone) locPhone.textContent = p.tel;

  const ticketName = document.getElementById('salon-ticket-name');
  if (ticketName) ticketName.textContent = p.name;

  const ticketPhone = document.getElementById('salon-ticket-phone');
  if (ticketPhone) ticketPhone.textContent = p.tel;

  const revRating = document.getElementById('salon-rev-rating');
  if (revRating) revRating.textContent = p.estrellas;

  const mapQuery = encodeURIComponent(`${p.name} ${p.direccion} ${p.zona} Lima Peru`);
  const iframe = document.getElementById('salon-gmap-iframe') as HTMLIFrameElement | null;
  if (iframe) iframe.src = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const mapLink = document.getElementById('salon-maps-link') as HTMLAnchorElement | null;
  if (mapLink) mapLink.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const callLink = document.getElementById('salon-call-link') as HTMLAnchorElement | null;
  if (callLink) callLink.href = `tel:${p.tel.replace(/[^0-9+]/g, '')}`;

  const floatingWA = document.getElementById('salon-floating-wa') as HTMLAnchorElement | null;
  if (floatingWA) {
    const waMsg = encodeURIComponent(`¡Hola ${p.name}! Vi su tarifario web y deseo agendar una cita en su local de ${p.zona}.`);
    floatingWA.href = `https://wa.me/${p.wa}?text=${waMsg}`;
  }
}

function updateClinicView(p: Prospect) {
  const topPhone = document.getElementById('clinic-top-phone');
  if (topPhone) topPhone.textContent = p.tel;

  const navLogo = document.getElementById('clinic-nav-logo') as HTMLImageElement | null;
  if (navLogo && p.logoUrl) navLogo.src = p.logoUrl;

  const footerLogo = document.getElementById('clinic-footer-logo') as HTMLImageElement | null;
  if (footerLogo && p.logoUrl) footerLogo.src = p.logoUrl;

  const footerName = document.getElementById('clinic-footer-name');
  if (footerName) footerName.textContent = p.name;

  updateSocialPill('clinic-social-pill', 'clinic-social-text', p);

  const isPodol = p.rubro.toLowerCase().includes('podol') || p.name.toLowerCase().includes('podól');

  const heroKicker = document.getElementById('clinic-hero-kicker');
  if (heroKicker) {
    heroKicker.textContent = p.baKicker || (isPodol ? `PODOLOGÍA CLÍNICA EN ${p.zona.toUpperCase()}` : `CENTRO ODONTOLÓGICO EN ${p.zona.toUpperCase()}`);
  }

  const heroTitle = document.getElementById('clinic-hero-title');
  if (heroTitle) {
    heroTitle.textContent = isPodol ? 'La salud de tus pies en manos de' : 'Tu salud y sonrisa en manos de';
  }

  const heroSub = document.getElementById('clinic-hero-sub');
  if (heroSub) heroSub.textContent = `${p.name}.`;

  const heroLema = document.getElementById('clinic-hero-lema');
  if (heroLema) {
    heroLema.textContent = p.lema || (isPodol
      ? `«Especialistas podológicas dedicadas a devolverte el bienestar y descanso en cada paso con bioseguridad rigurosa.»`
      : `«Expertos en ortodoncia, rehabilitación oral y estética dental con tecnología digital avanzada y trato humano.»`);
  }

  const heroLead = document.getElementById('clinic-hero-lead');
  if (heroLead) {
    heroLead.textContent = p.lead || `Tratamientos de alta precisión guiados con tecnología moderna, instrumental 100% esterilizado en autoclave y atención personalizada en ${p.direccion}.`;
  }

  const statRating = document.getElementById('clinic-stat-rating');
  if (statRating) statRating.textContent = p.estrellas;

  const statReviews = document.getElementById('clinic-stat-reviews');
  if (statReviews) statReviews.textContent = `${p.resenas} pacientes`;

  const statZone = document.getElementById('clinic-stat-zone');
  if (statZone) statZone.textContent = p.zona;

  const heroPhoto = document.getElementById('clinic-hero-photo') as HTMLImageElement | null;
  if (heroPhoto) heroPhoto.src = p.heroPhoto || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85';

  const featLabel = document.getElementById('clinic-featured-label');
  if (featLabel) featLabel.textContent = p.featuredLabel || 'TRATAMIENTO ESTRELLA';

  const featPrice = document.getElementById('clinic-featured-price');
  if (featPrice) featPrice.textContent = p.featuredPrice || 'S/ 180';

  const featTitle = document.getElementById('clinic-featured-title');
  if (featTitle) featTitle.textContent = p.featuredTitle || 'Limpieza Profunda Ultrasónica + Profilaxis';

  const featSub = document.getElementById('clinic-featured-sub');
  if (featSub) featSub.textContent = p.featuredSub || 'Eliminación completa de sarro y pulido dental sin dolor ni sensibilidad.';

  const addrCap = document.getElementById('clinic-address-caption');
  if (addrCap) addrCap.textContent = p.direccion;

  const locZone = document.getElementById('clinic-loc-zone');
  if (locZone) locZone.textContent = p.zona.toUpperCase();

  const locName = document.getElementById('clinic-loc-name');
  if (locName) locName.textContent = p.name;

  const locAddr = document.getElementById('clinic-loc-address');
  if (locAddr) locAddr.textContent = p.direccion;

  const locPhone = document.getElementById('clinic-loc-phone');
  if (locPhone) locPhone.textContent = p.tel;

  const mapQuery = encodeURIComponent(`${p.name} ${p.direccion} ${p.zona} Lima Peru`);
  const iframe = document.getElementById('clinic-gmap-iframe') as HTMLIFrameElement | null;
  if (iframe) iframe.src = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const mapLink = document.getElementById('clinic-maps-link') as HTMLAnchorElement | null;
  if (mapLink) mapLink.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const callLink = document.getElementById('clinic-call-link') as HTMLAnchorElement | null;
  if (callLink) callLink.href = `tel:${p.tel.replace(/[^0-9+]/g, '')}`;

  const floatingWA = document.getElementById('clinic-floating-wa') as HTMLAnchorElement | null;
  if (floatingWA) {
    const waMsg = encodeURIComponent(`¡Hola ${p.name}! Deseo consultar por una cita de evaluación en su clínica de ${p.zona}.`);
    floatingWA.href = `https://wa.me/${p.wa}?text=${waMsg}`;
  }

  // Reseñas clínicas dinámicas
  const clinicReviews = document.getElementById('clinic-reviews-container');
  if (clinicReviews) {
    if (isPodol) {
      clinicReviews.innerHTML = `
        <div class="border-t-2 border-stone-900 pt-4 space-y-2">
          <div class="font-mono text-xs text-stone-900 flex items-center justify-between">
            <span>★★★★★ · ALIVIO INMEDIATO</span>
            <span class="text-cyan-700 font-semibold text-[10px]">VERIFICADO</span>
          </div>
          <p class="font-serif text-lg italic text-stone-800">"Llegué con dolor agudo por uñero y salí caminando aliviada y sin molestias. La atención es impecable y con instrumental esterilizado."</p>
          <p class="font-mono text-[11px] text-stone-500 uppercase">— Paciente verificada en ${p.zona}</p>
        </div>
        <div class="border-t-2 border-stone-900 pt-4 space-y-2">
          <div class="font-mono text-xs text-stone-900 flex items-center justify-between">
            <span>★★★★★ · BIOSEGURIDAD</span>
            <span class="text-cyan-700 font-semibold text-[10px]">VERIFICADO</span>
          </div>
          <p class="font-serif text-lg italic text-stone-800">"Los paquetes de instrumentos se abren sellados frente a ti. Máxima higiene, atención puntual y trato súper humano."</p>
          <p class="font-mono text-[11px] text-stone-500 uppercase">— Paciente recurrente</p>
        </div>
        <div class="border-t-2 border-stone-900 pt-4 space-y-2">
          <div class="font-mono text-xs text-stone-900 flex items-center justify-between">
            <span>★ ${p.estrellas} · RECOMENDADO</span>
            <span class="text-cyan-700 font-semibold text-[10px]">VERIFICADO</span>
          </div>
          <p class="font-serif text-lg italic text-stone-800">"Excelente servicio podológico. Diagnóstico claro y seguimiento personalizado. Mis pies descansaron como nunca."</p>
          <p class="font-mono text-[11px] text-stone-500 uppercase">— Reseña en Google Maps</p>
        </div>
      `;
    } else {
      clinicReviews.innerHTML = `
        <div class="border-t-2 border-stone-900 pt-4 space-y-2">
          <div class="font-mono text-xs text-stone-900 flex items-center justify-between">
            <span>★★★★★ · CERO DOLOR</span>
            <span class="text-cyan-700 font-semibold text-[10px]">VERIFICADO</span>
          </div>
          <p class="font-serif text-lg italic text-stone-800">"Tenía pánico al dentista y la experiencia fue 100% sin dolor. El doctor fue súper minucioso y me explicó cada paso."</p>
          <p class="font-mono text-[11px] text-stone-500 uppercase">— Paciente verificado en ${p.zona}</p>
        </div>
        <div class="border-t-2 border-stone-900 pt-4 space-y-2">
          <div class="font-mono text-xs text-stone-900 flex items-center justify-between">
            <span>★★★★★ · RESULTADOS ESTÉTICOS</span>
            <span class="text-cyan-700 font-semibold text-[10px]">VERIFICADO</span>
          </div>
          <p class="font-serif text-lg italic text-stone-800">"Me realicé blanqueamiento y curaciones estéticas. Mi sonrisa quedó radiante, blanca y muy natural. ¡Súper satisfecho!"</p>
          <p class="font-mono text-[11px] text-stone-500 uppercase">— Paciente ortodoncia & estética</p>
        </div>
        <div class="border-t-2 border-stone-900 pt-4 space-y-2">
          <div class="font-mono text-xs text-stone-900 flex items-center justify-between">
            <span>★ ${p.estrellas} · INSTALACIONES TOP</span>
            <span class="text-cyan-700 font-semibold text-[10px]">VERIFICADO</span>
          </div>
          <p class="font-serif text-lg italic text-stone-800">"Equipos modernos, radiografía digital inmediata y cumplimiento riguroso de bioseguridad. La mejor clínica de la zona."</p>
          <p class="font-mono text-[11px] text-stone-500 uppercase">— Reseña en Google Maps</p>
        </div>
      `;
    }
  }
}

function updateGeneralView(p: Prospect, th: RubroTheme) {
  const navBrandLogo = document.getElementById('nav-brand-logo') as HTMLImageElement | null;
  const navMonogram = document.getElementById('nav-monogram');
  const heroBrandLogo = document.getElementById('hero-brand-logo') as HTMLImageElement | null;
  const footerBrandLogo = document.getElementById('footer-brand-logo') as HTMLImageElement | null;

  if (p.logoUrl) {
    if (navBrandLogo) {
      navBrandLogo.src = p.logoUrl;
      navBrandLogo.style.display = 'block';
    }
    if (navMonogram) navMonogram.style.display = 'none';
    if (heroBrandLogo) {
      heroBrandLogo.src = p.logoUrl;
      heroBrandLogo.style.display = 'block';
    }
    if (footerBrandLogo) {
      footerBrandLogo.src = p.logoUrl;
      footerBrandLogo.style.display = 'block';
    }
  }

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

  updateSocialLinks(p);

  const heroKicker = document.getElementById('hero-kicker');
  if (heroKicker) heroKicker.textContent = `LOCAL EN ${p.zona.toUpperCase()}`;

  const heroStatusTag = document.getElementById('hero-status-tag');
  if (heroStatusTag) heroStatusTag.textContent = p.es_celular.toUpperCase();

  const heroHeadlineMain = document.getElementById('hero-headline-main');
  const heroHeadlineItalic = document.getElementById('hero-headline-italic');
  const heroLemaBox = document.getElementById('hero-lema-box');
  const heroLemaText = document.getElementById('hero-lema-text');
  const heroLead = document.getElementById('hero-lead');

  if (p.lema) {
    if (heroHeadlineMain) heroHeadlineMain.textContent = p.name;
    if (heroHeadlineItalic) {
      heroHeadlineItalic.textContent = `en ${p.zona}.`;
      heroHeadlineItalic.style.display = 'block';
    }
    if (heroLemaBox) heroLemaBox.style.display = 'block';
    if (heroLemaText) heroLemaText.textContent = p.lema;
    if (heroLead) {
      heroLead.textContent = `Atención directa en ${p.direccion}. Consulta nuestra lista de servicios y precios actualizados, arma tu pedido o cita y confírmalo directo por WhatsApp con nuestro equipo.`;
    }
  } else {
    if (heroHeadlineMain) heroHeadlineMain.textContent = th.headlineMain;
    if (heroHeadlineItalic) {
      heroHeadlineItalic.textContent = `${p.name}.`;
      heroHeadlineItalic.style.display = 'block';
    }
    if (heroLemaBox) heroLemaBox.style.display = 'none';
    if (heroLead) heroLead.textContent = `${th.lead} Encuéntranos en ${p.direccion}.`;
  }

  const heroPrimaryBtn = document.getElementById('hero-primary-btn');
  if (heroPrimaryBtn) heroPrimaryBtn.textContent = th.primaryBtn;

  const statRating = document.getElementById('stat-rating');
  if (statRating) statRating.textContent = p.estrellas;

  const statReviews = document.getElementById('stat-reviews');
  if (statReviews) statReviews.textContent = p.resenas;

  const statZone = document.getElementById('stat-zone');
  if (statZone) statZone.textContent = p.zona;

  const heroPhoto = document.getElementById('hero-photo') as HTMLImageElement | null;
  if (heroPhoto) heroPhoto.src = p.heroPhoto || th.heroPhoto;

  const featuredLabel = document.getElementById('featured-label');
  if (featuredLabel) featuredLabel.textContent = p.featuredLabel || th.featuredLabel;

  const featuredPrice = document.getElementById('featured-price');
  if (featuredPrice) featuredPrice.textContent = p.featuredPrice || th.featuredPrice;

  const featuredTitle = document.getElementById('featured-title');
  if (featuredTitle) featuredTitle.textContent = p.featuredTitle || th.featuredTitle;

  const featuredSub = document.getElementById('featured-sub');
  if (featuredSub) featuredSub.textContent = p.featuredSub || th.featuredSub;

  const heroAddressCaption = document.getElementById('hero-address-caption');
  if (heroAddressCaption) heroAddressCaption.textContent = p.direccion;

  updateMarquee(p);

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

  updateBeforeAfterContent(p, th);

  const locZone = document.getElementById('loc-zone');
  if (locZone) locZone.textContent = p.zona.toUpperCase();

  const locName = document.getElementById('loc-name');
  if (locName) locName.textContent = p.name;

  const locAddress = document.getElementById('loc-address');
  if (locAddress) locAddress.textContent = p.direccion;

  const locPhone = document.getElementById('loc-phone');
  if (locPhone) locPhone.textContent = p.tel;

  const locHours = document.getElementById('loc-hours');
  if (locHours) {
    const rubroLow = p.rubro.toLowerCase();
    if (rubroLow.includes('marina') || rubroLow.includes('gastronom')) {
      locHours.textContent = 'Martes a Domingo: 11:30 a. m. – 5:30 p. m. (Lunes descanso)';
    } else if (rubroLow.includes('veterin')) {
      locHours.textContent = 'Lunes a Sábado: 9:00 a. m. – 7:30 p. m. | Emergencias previa consulta';
    } else if (rubroLow.includes('dental') || rubroLow.includes('salud') || rubroLow.includes('odontol')) {
      locHours.textContent = 'Lunes a Sábado: 9:00 a. m. – 8:00 p. m. (Citas programadas)';
    } else {
      locHours.textContent = 'Lunes a Sábado: 9:30 a. m. – 8:30 p. m. | Domingos previa cita';
    }
  }

  const revRatingInline = document.getElementById('rev-rating-inline');
  if (revRatingInline) revRatingInline.textContent = p.estrellas;

  updateReviewsForProspect(p);

  const footerName = document.getElementById('footer-name');
  if (footerName) footerName.textContent = p.name;

  const mapQuery = encodeURIComponent(`${p.name} ${p.direccion} ${p.zona} Lima Peru`);
  const gmapIframe = document.getElementById('gmap-iframe') as HTMLIFrameElement | null;
  if (gmapIframe) {
    gmapIframe.src = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  const locMapsLink = document.getElementById('loc-maps-link') as HTMLAnchorElement | null;
  if (locMapsLink) locMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const locCallLink = document.getElementById('loc-call-link') as HTMLAnchorElement | null;
  if (locCallLink) locCallLink.href = `tel:${p.tel.replace(/[^0-9+]/g, '')}`;

  const floatingWA = document.getElementById('general-floating-wa') as HTMLAnchorElement | null;
  if (floatingWA) {
    const waMsg = encodeURIComponent(`¡Hola ${p.name}! Vi su catálogo web y deseo consultar disponibilidad en su local de ${p.zona}.`);
    floatingWA.href = `https://wa.me/${p.wa}?text=${waMsg}`;
  }
}

function updateSocialLinks(p: Prospect) {
  const navSocialLink = document.getElementById('nav-social-link') as HTMLAnchorElement | null;
  const navSocialText = document.getElementById('nav-social-text');
  const heroSocialPill = document.getElementById('hero-social-pill') as HTMLAnchorElement | null;
  const heroSocialText = document.getElementById('hero-social-text');
  const heroSocialIcon = document.getElementById('hero-social-icon');

  if (p.instagram) {
    const igHandle = p.instagram.startsWith('@') ? p.instagram : `@${p.instagram}`;
    const igUrl = `https://instagram.com/${igHandle.replace('@', '')}`;
    if (navSocialLink) {
      navSocialLink.href = igUrl;
      navSocialLink.style.display = 'inline-flex';
    }
    if (navSocialText) navSocialText.textContent = igHandle;

    if (heroSocialPill) {
      heroSocialPill.href = igUrl;
      heroSocialPill.style.display = 'inline-flex';
    }
    if (heroSocialText) heroSocialText.textContent = igHandle;
    if (heroSocialIcon) heroSocialIcon.textContent = '📸';
  } else if (p.facebook) {
    if (navSocialLink) {
      navSocialLink.href = p.facebook;
      navSocialLink.style.display = 'inline-flex';
    }
    if (navSocialText) navSocialText.textContent = 'Facebook';

    if (heroSocialPill) {
      heroSocialPill.href = p.facebook;
      heroSocialPill.style.display = 'inline-flex';
    }
    if (heroSocialText) heroSocialText.textContent = 'Página Facebook';
    if (heroSocialIcon) heroSocialIcon.textContent = '👍';
  } else {
    if (navSocialLink) navSocialLink.style.display = 'none';
    if (heroSocialPill) {
      heroSocialPill.href = `https://maps.google.com/?q=${encodeURIComponent(p.name + ' ' + p.zona)}`;
      heroSocialPill.style.display = 'inline-flex';
    }
    if (heroSocialText) heroSocialText.textContent = `${p.estrellas}★ Google Maps`;
    if (heroSocialIcon) heroSocialIcon.textContent = '📍';
  }
}

function updateMarquee(p: Prospect) {
  const marqueeContent = document.getElementById('marquee-content');
  if (!marqueeContent) return;

  const rub = p.rubro.toLowerCase();
  const zona = p.zona.toUpperCase();
  let items: string[] = [];

  if (rub.includes('marina') || rub.includes('gastronom')) {
    items = [
      `PESCA FRESCA DEL DÍA EN ${zona}`,
      'LECHE DE TIGRE CLÁSICA',
      'CEVICHES & CHICHARRONES',
      'ATENCIÓN EN SALÓN Y DELIVERY',
      'SABOR NORTEÑO Y MARINO TRADICIONAL'
    ];
  } else if (rub.includes('veterin')) {
    items = [
      `MÉDICOS VETERINARIOS UNMSM EN ${zona}`,
      'MEDICINA PREVENTIVA & VACUNACIÓN',
      'SPA & GROOMING CANINO LIBRE DE ESTRÉS',
      'FARMACIA VETERINARIA ESPECIALIZADA',
      'CUIDADO Y CARIÑO PARA TU MASCOTA'
    ];
  } else if (rub.includes('dental') || rub.includes('salud') || rub.includes('odontol')) {
    items = [
      `ESPECIALISTAS ODONTOLÓGICOS EN ${zona}`,
      'DISEÑO DE SONRISA & BLANQUEAMIENTO',
      'ORTODONCIA & BRACKETS ESTÉTICOS',
      'BIOSEGURIDAD RIGUROSA EN AUTOCLAVE',
      'ATENCIÓN ODONTOLÓGICA SIN DOLOR'
    ];
  } else {
    items = [
      `ESPECIALISTAS EN COLOR & ESTILISMO EN ${zona}`,
      'LACEADOS ORGÁNICOS SIN FORMOL',
      'BALAYAGE HAIR GLOW & NUTRICIÓN CAPILAR',
      'PRODUCTOS DE GAMA PROFESIONAL',
      'ATENCIÓN PUNTUAL CON CITA PREVIA'
    ];
  }

  marqueeContent.innerHTML = items.map(text => `
    <span class="inline-flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
      <span class="font-mono text-xs uppercase tracking-[0.16em]">${text}</span>
    </span>
    <span class="text-stone-300">✦</span>
  `).join('');
}

function updateBeforeAfterContent(p: Prospect, th: RubroTheme) {
  const baKicker = document.getElementById('ba-kicker');
  const baTitle = document.getElementById('ba-title');
  const baDesc = document.getElementById('ba-desc');
  const baImgBefore = document.getElementById('ba-img-before') as HTMLImageElement | null;
  const baImgAfter = document.getElementById('ba-img-after') as HTMLImageElement | null;

  if (baKicker) baKicker.textContent = p.baKicker || th.baKicker;
  if (baTitle) baTitle.textContent = p.baTitle || th.baTitle;
  if (baDesc) baDesc.textContent = p.baDesc || th.baDesc;
  if (baImgBefore) baImgBefore.src = p.baBefore || th.baBefore;
  if (baImgAfter) baImgAfter.src = p.baAfter || th.baAfter;
}

function updateReviewsForProspect(p: Prospect) {
  const rev1Title = document.getElementById('rev-1-title');
  const rev1Text = document.getElementById('rev-1-text');
  const rev2Title = document.getElementById('rev-2-title');
  const rev2Text = document.getElementById('rev-2-text');
  const rev3Title = document.getElementById('rev-3-title');
  const rev3Text = document.getElementById('rev-3-text');

  const rub = p.rubro.toLowerCase();
  if (rub.includes('marina') || rub.includes('gastronom')) {
    if (rev1Title) rev1Title.textContent = `★★★★★ · FRESCURA DEL DÍA`;
    if (rev1Text) rev1Text.textContent = `"El ceviche y los chicharrones son insuperables. Pesca fresquísima y porciones bien servidas. ¡Súper recomendado en ${p.zona}!"`;
    if (rev2Title) rev2Title.textContent = `★★★★★ · CARTA CLARA`;
    if (rev2Text) rev2Text.textContent = `"Poder ver la carta y pedir por WhatsApp antes de llegar nos ahorró un montón de tiempo. La leche de tigre es espectacular."`;
    if (rev3Title) rev3Title.textContent = `★ ${p.estrellas} · SAZÓN DE PRIMERA`;
    if (rev3Text) rev3Text.textContent = `"Excelente sazón norteña y marina. Atención amable, ambiente limpio y precios totalmente justos para la calidad que dan."`;
  } else if (rub.includes('veterin')) {
    if (rev1Title) rev1Title.textContent = `★★★★★ · TRATO CON AMOR`;
    if (rev1Text) rev1Text.textContent = `"Los doctores de la San Marcos atienden con un amor increíble a mis engreídos. El baño medicado y el corte quedaron preciosos."`;
    if (rev2Title) rev2Title.textContent = `★★★★★ · ATENCIÓN MÉDICA`;
    if (rev2Text) rev2Text.textContent = `"Diagnóstico acertado y seguimiento por WhatsApp. Te da total tranquilidad saber que tu mascota está en tan buenas manos."`;
    if (rev3Title) rev3Title.textContent = `★ ${p.estrellas} · VETERINARIA DESTACADA`;
    if (rev3Text) rev3Text.textContent = `"Ambiente limpio, sin olores y súper acogedor. Precios justos en medicamentos y grooming. ¡Los recomiendo al 100%!"`;
  } else if (rub.includes('dental') || rub.includes('salud') || rub.includes('odontol')) {
    if (rev1Title) rev1Title.textContent = `★★★★★ · SIN DOLOR`;
    if (rev1Text) rev1Text.textContent = `"Tenía pánico al dentista y la experiencia fue completamente sin dolor. Los doctores son sumamente minuciosos y profesionales."`;
    if (rev2Title) rev2Title.textContent = `★★★★★ · RESULTADOS ESTÉTICOS`;
    if (rev2Text) rev2Text.textContent = `"El blanqueamiento y las curaciones estéticas superaron mis expectativas. Mi sonrisa quedó radiante y natural."`;
    if (rev3Title) rev3Title.textContent = `★ ${p.estrellas} · BIOSEGURIDAD`;
    if (rev3Text) rev3Text.textContent = `"Instalaciones de primer nivel, todo desinfectado y sellado. Agendar por la web y confirmar por WhatsApp fue comodísimo."`;
  } else {
    if (rev1Title) rev1Title.textContent = `★★★★★ · RESULTADOS TOP`;
    if (rev1Text) rev1Text.textContent = `"Me encantó el cambio de look. El color y el acabado del cabello quedaron brillantes y sedosos, exactamente como lo pedí."`;
    if (rev2Title) rev2Title.textContent = `★★★★★ · ATENCIÓN PUNTUAL`;
    if (rev2Text) rev2Text.textContent = `"Agendé por la web con los precios claros y me atendieron a la hora exacta. Productos de alta calidad que no maltratan."`;
    if (rev3Title) rev3Title.textContent = `★ ${p.estrellas} · CALIFICACIÓN GOOGLE`;
    if (rev3Text) rev3Text.textContent = `"El mejor salón de ${p.zona}. Todo el equipo es muy atento y el ambiente es súper relajante y limpio. ¡10 de 10!"`;
  }
}

function getAvailableServices(): ServiceItem[] {
  if (currentProspect.customServices && currentProspect.customServices.length > 0) {
    return currentProspect.customServices;
  }
  return currentTheme.services;
}

function renderCategories() {
  const services = getAvailableServices();
  const cats = ['Todos', ...new Set(services.map(s => s.cat))];
  const containerIds = ['category-tabs', 'rest-category-tabs', 'vet-category-tabs', 'salon-category-tabs', 'clinic-category-tabs'];

  containerIds.forEach(id => {
    const container = document.getElementById(id);
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
  });
}

function setCategory(c: string) {
  activeCategory = c;
  renderCategories();
  renderServices();
}

function renderServices() {
  const serviceListIds = ['services-list', 'rest-services-list', 'vet-services-list', 'salon-services-list', 'clinic-services-list'];
  const services = getAvailableServices();
  const list = activeCategory === 'Todos'
    ? services
    : services.filter(s => s.cat === activeCategory);

  serviceListIds.forEach(id => {
    const container = document.getElementById(id);
    if (!container) return;

    container.innerHTML = list.map((s, idx) => {
      const inCart = cart.some(item => item.id === s.id);
      return `
        <div class="menu-row py-5 flex items-start justify-between gap-4 border-b hairline-border">
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
        const sId = target.getAttribute('data-service-id');
        if (sId) toggleService(sId);
      });
    });
  });
}

function toggleService(id: string) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx >= 0) {
    cart.splice(idx, 1);
  } else {
    const available = getAvailableServices();
    const found = available.find(s => s.id === id);
    if (found) cart.push(found);
  }
  renderServices();
  renderCart();
}

function renderCart() {
  const sum = cart.reduce((acc, s) => acc + s.price, 0);
  const formattedTotal = `S/ ${sum.toFixed(2)}`;
  const badgeText = `${cart.length} ${cart.length === 1 ? 'ítem' : 'ítems'}`;

  const badgeIds = ['cart-count-badge', 'rest-cart-count-badge', 'vet-cart-count-badge', 'salon-cart-count-badge', 'clinic-cart-count-badge'];
  badgeIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = badgeText;
  });

  const totalIds = ['cart-total', 'rest-cart-total', 'vet-cart-total', 'salon-cart-total', 'clinic-cart-total'];
  totalIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = formattedTotal;
  });

  const cartItemContainers = ['cart-items', 'rest-cart-items', 'vet-cart-items', 'salon-cart-items', 'clinic-cart-items'];
  cartItemContainers.forEach(id => {
    const container = document.getElementById(id);
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `<p class="text-stone-400 italic py-4 text-center font-serif">Selecciona uno o más ítems de la carta para armar tu solicitud.</p>`;
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
        const removeId = target.getAttribute('data-remove-id');
        if (removeId) toggleService(removeId);
      });
    });
  });
}

function sendCategoryWhatsApp(category: 'general' | 'restaurant' | 'vet' | 'veterinary' | 'salon' | 'clinic') {
  if (category === 'restaurant') {
    const nEl = document.getElementById('rest-client-name') as HTMLInputElement | null;
    const clientName = nEl?.value.trim() || 'Cliente';
    const isTable = document.getElementById('rest-table-fields')?.style.display === 'block';

    let msg = '';
    if (isTable) {
      const guests = (document.getElementById('rest-guests-count') as HTMLSelectElement)?.value || '4 personas';
      const celebration = (document.getElementById('rest-celebration-type') as HTMLSelectElement)?.value || 'Cumpleaños';
      msg = `🔥 *RESERVA DE MESA / CUMPLEAÑOS*\n` +
        `Hola equipo de *${currentProspect.name}*, deseo reservar una mesa en su local de ${currentProspect.zona}:\n\n` +
        `• *A nombre de:* ${clientName}\n` +
        `• *Número de personas:* ${guests}\n` +
        `• *Motivo de celebración:* ${celebration} (¡Aplica promoción de cortesía web!)\n\n` +
        (cart.length > 0 ? `*Platos o combos pre-seleccionados:*\n${cart.map(i => `• ${i.name} (S/ ${i.price})`).join('\n')}\n\n` : '') +
        `¿Tienen disponibilidad de mesas para hoy? Muchas gracias.`;
    } else {
      const dEl = document.getElementById('rest-client-day') as HTMLSelectElement | null;
      const tEl = document.getElementById('rest-client-time') as HTMLSelectElement | null;
      const day = dEl?.value || 'Comer en salón';
      const time = tEl?.value || 'En 25-35 min';
      const itemsText = cart.length > 0
        ? cart.map(i => `• ${i.name} (S/ ${i.price})`).join('\n')
        : '• Pedido especial de la carta';
      const sum = cart.reduce((acc, s) => acc + s.price, 0);

      msg = `🔥 *PEDIDO GASTRONÓMICO DIRECTO*\n` +
        `Hola *${currentProspect.name}*, vi su carta web y deseo realizar el siguiente pedido para su local de ${currentProspect.zona}:\n\n` +
        `*Platos solicitados:*\n${itemsText}\n\n` +
        (sum > 0 ? `*Total estimado:* S/ ${sum}.00\n\n` : '') +
        `• *Cliente:* ${clientName}\n` +
        `• *Modalidad:* ${day} (${time})\n\n` +
        `¿Me confirman recepción y tiempo de preparación por favor?`;
    }

    window.open(`https://wa.me/${currentProspect.wa}?text=${encodeURIComponent(msg)}`, '_blank');
    return;
  }

  if (category === 'veterinary' || category === 'vet') {
    const pNameEl = document.getElementById('vet-patient-name') as HTMLInputElement | null;
    const pAgeEl = document.getElementById('vet-patient-age') as HTMLInputElement | null;
    const tutorEl = document.getElementById('vet-tutor-name') as HTMLInputElement | null;
    const selectedReason = (document.querySelector('input[name="vet-reason"]:checked') as HTMLInputElement)?.value || 'Consulta Médica General';

    const petName = pNameEl?.value.trim() || 'Mi engreído';
    const petAge = pAgeEl?.value.trim() || 'No especificada';
    const tutor = tutorEl?.value.trim() || 'Tutor responsable';

    const msg = `🐾 *FICHA CLÍNICA DE ATENCIÓN VETERINARIA*\n` +
      `Hola Médicos Veterinarios de *${currentProspect.name}*, deseo agendar una atención para mi engreído desde su web:\n\n` +
      `• *Paciente:* ${selectedPetSpecies} - "${petName}"\n` +
      `• *Edad:* ${petAge}\n` +
      `• *Tutor responsable:* ${tutor}\n` +
      `• *Motivo de Consulta:* ${selectedReason}\n\n` +
      (cart.length > 0 ? `*Servicios adicionales preseleccionados:*\n${cart.map(i => `• ${i.name} (S/ ${i.price})`).join('\n')}\n\n` : '') +
      `¿Qué horarios tienen disponibles hoy o mañana en su consultorio de ${currentProspect.zona}?`;

    window.open(`https://wa.me/${currentProspect.wa}?text=${encodeURIComponent(msg)}`, '_blank');
    return;
  }

  if (category === 'salon') {
    const nEl = document.getElementById('salon-client-name') as HTMLInputElement | null;
    const hairEl = document.getElementById('salon-hair-type') as HTMLSelectElement | null;
    const dEl = document.getElementById('salon-client-day') as HTMLSelectElement | null;
    const tEl = document.getElementById('salon-client-time') as HTMLSelectElement | null;

    const clientName = nEl?.value.trim() || 'Clienta VIP';
    const hairType = hairEl?.value || 'Cabello Natural';
    const day = dEl?.value || 'Hoy mismo';
    const time = tEl?.value || 'Mañana';

    const itemsText = cart.length > 0
      ? cart.map(i => `• ${i.name} (S/ ${i.price})`).join('\n')
      : '• Consulta y diagnóstico capilar personalizado';
    const sum = cart.reduce((acc, s) => acc + s.price, 0);

    const msg = `✨ *SOLICITUD DE CITA VIP CONCIERGE*\n` +
      `Hola estilistas de *${currentProspect.name}*, deseo agendar una cita exclusiva en su salón de ${currentProspect.zona}:\n\n` +
      `• *Clienta:* ${clientName}\n` +
      `• *Diagnóstico / Tipo de Cabello:* ${hairType}\n` +
      `• *Día / Turno preferido:* ${day} (${time})\n\n` +
      `*Servicios seleccionados:*\n${itemsText}\n\n` +
      (sum > 0 ? `*Inversión estimada:* S/ ${sum}.00 (con 15% OFF primera visita)\n\n` : '') +
      `¿Me confirman disponibilidad por favor para asegurar mi horario?`;

    window.open(`https://wa.me/${currentProspect.wa}?text=${encodeURIComponent(msg)}`, '_blank');
    return;
  }

  if (category === 'clinic') {
    const nEl = document.getElementById('clinic-client-name') as HTMLInputElement | null;
    const dEl = document.getElementById('clinic-client-day') as HTMLSelectElement | null;
    const tEl = document.getElementById('clinic-client-time') as HTMLSelectElement | null;
    const name = nEl?.value.trim() || 'Paciente';
    const day = dEl?.value || 'Para hoy';
    const time = tEl?.value || 'Turno Mañana';

    const itemsText = cart.length > 0
      ? cart.map(i => `• ${i.name} (S/ ${i.price})`).join('\n')
      : '• Consulta y diagnóstico clínico';
    const sum = cart.reduce((acc, s) => acc + s.price, 0);

    const msg = `🏥 *SOLICITUD DE CITA ODONTOLÓGICA / MÉDICA*\n` +
      `Hola doctores de *${currentProspect.name}*, deseo agendar una consulta de evaluación en su clínica de ${currentProspect.zona}:\n\n` +
      `*Tratamientos de interés:*\n${itemsText}\n\n` +
      (sum > 0 ? `*Inversión referencial:* S/ ${sum}.00\n\n` : '') +
      `• *Paciente:* ${name}\n` +
      `• *Preferencia:* ${day} (${time})\n\n` +
      `¿Me confirman qué turnos tienen disponibles por favor?`;

    window.open(`https://wa.me/${currentProspect.wa}?text=${encodeURIComponent(msg)}`, '_blank');
    return;
  }

  // General fallback
  const nEl = document.getElementById('client-name') as HTMLInputElement | null;
  const dEl = document.getElementById('client-day') as HTMLSelectElement | null;
  const tEl = document.getElementById('client-time') as HTMLSelectElement | null;
  const name = nEl?.value.trim() || 'Cliente';
  const day = dEl?.value || 'Para hoy';
  const time = tEl?.value || 'Turno Mañana';

  const itemsText = cart.length > 0
    ? cart.map(i => `• ${i.name} (S/ ${i.price})`).join('\n')
    : '• Consulta de servicios y disponibilidad';
  const sum = cart.reduce((acc, s) => acc + s.price, 0);

  const msg = `Hola *${currentProspect.name}*, vi su web y deseo coordinar lo siguiente:\n\n` +
    `${itemsText}\n\n` +
    (sum > 0 ? `*Total referencial:* S/ ${sum}.00\n\n` : '') +
    `Nombre: ${name}\n` +
    `Preferencia: ${day} (${time})\n\n` +
    `¿Me confirman disponibilidad por favor?`;

  window.open(`https://wa.me/${currentProspect.wa}?text=${encodeURIComponent(msg)}`, '_blank');
}

function updateBeforeAfter(val: number) {
  const imgBefore = document.getElementById('ba-img-before');
  const divider = document.getElementById('ba-divider');
  if (imgBefore) imgBefore.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
  if (divider) divider.style.left = `${val}%`;
}

function updateSalonBeforeAfter(val: number) {
  const clip = document.getElementById('salon-ba-clip');
  const handle = document.getElementById('salon-ba-handle');
  if (clip) clip.style.width = `${val}%`;
  if (handle) handle.style.left = `${val}%`;

  const imgBefore = document.getElementById('salon-ba-img-before');
  const divider = document.getElementById('salon-ba-divider');
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
