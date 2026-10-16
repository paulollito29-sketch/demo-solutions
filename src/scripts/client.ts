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

    if (found.palette) {
      document.documentElement.style.setProperty('--bg-main', found.palette.bg_page);
      document.documentElement.style.setProperty('--bg-panel', found.palette.bg_panel);
      document.documentElement.style.setProperty('--bg-alt', found.palette.bg_tint);
      document.documentElement.style.setProperty('--ink', found.palette.ink);
      document.documentElement.style.setProperty('--accent', found.palette.accent);
      document.documentElement.style.setProperty('--accent-dark', found.palette.accent_dark);
      document.documentElement.style.setProperty('--border-hair', found.palette.line);
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

  // Dynamic Content Updates
  const p = currentProspect;
  const th = currentTheme;

  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = `${p.name} — ${p.zona} | Carta & Reservas`;

  // Logotipos oficiales de marca
  const navBrandLogo = document.getElementById('nav-brand-logo') as HTMLImageElement | null;
  const navMonogram = document.getElementById('nav-monogram');
  const heroBrandLogo = document.getElementById('hero-brand-logo') as HTMLImageElement | null;
  const footerBrandLogo = document.getElementById('footer-brand-logo') as HTMLImageElement | null;

  if (p.logoUrl) {
    if (navBrandLogo) {
      navBrandLogo.src = p.logoUrl;
      navBrandLogo.alt = `Logotipo de ${p.name}`;
      navBrandLogo.style.display = 'block';
    }
    if (navMonogram) navMonogram.style.display = 'none';

    if (heroBrandLogo) {
      heroBrandLogo.src = p.logoUrl;
      heroBrandLogo.alt = `Logotipo de ${p.name}`;
      heroBrandLogo.style.display = 'block';
    }
    if (footerBrandLogo) {
      footerBrandLogo.src = p.logoUrl;
      footerBrandLogo.alt = `Logotipo de ${p.name}`;
      footerBrandLogo.style.display = 'block';
    }
  } else {
    if (navBrandLogo) navBrandLogo.style.display = 'none';
    if (navMonogram) {
      navMonogram.textContent = getBrandInitials(p.name);
      navMonogram.style.display = 'flex';
    }
    if (heroBrandLogo) heroBrandLogo.style.display = 'none';
    if (footerBrandLogo) footerBrandLogo.style.display = 'none';
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

  // Enlaces de redes sociales en cabecera y hero
  updateSocialLinks(p);

  // Kicker y Tags de Hero
  const heroKicker = document.getElementById('hero-kicker');
  if (heroKicker) heroKicker.textContent = `LOCAL EN ${p.zona.toUpperCase()}`;

  const heroStatusTag = document.getElementById('hero-status-tag');
  if (heroStatusTag) heroStatusTag.textContent = p.es_celular.toUpperCase();

  // Headline y Slogan / Lema Oficial
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
    if (heroLead) {
      heroLead.textContent = `${th.lead} Encuéntranos en ${p.direccion}.`;
    }
  }

  const heroPrimaryBtn = document.getElementById('hero-primary-btn');
  if (heroPrimaryBtn) heroPrimaryBtn.textContent = th.primaryBtn;

  const statRating = document.getElementById('stat-rating');
  if (statRating) statRating.textContent = p.estrellas;

  const statReviews = document.getElementById('stat-reviews');
  if (statReviews) statReviews.textContent = p.resenas;

  const statZone = document.getElementById('stat-zone');
  if (statZone) statZone.textContent = p.zona;

  // Fotografía Hero y Tarjeta Destacada Específica
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

  // Cinta dinámica rotativa / Marquee según categoría
  updateMarquee(p);

  // Carta / Tarifario
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

  // Comparador Antes / Después
  updateBeforeAfterContent(p, th);

  // Ubicación y Contacto
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

  // Testimonios contextuales según el rubro
  updateReviewsForProspect(p);

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

  // Botón flotante directo de WhatsApp
  const floatingWA = document.getElementById('general-floating-wa') as HTMLAnchorElement | null;
  if (floatingWA) {
    const waNum = p.wa || '51999888777';
    const waMsg = encodeURIComponent(`¡Hola ${p.name}! Vi su catálogo web y deseo consultar disponibilidad en su local de ${p.zona}.`);
    floatingWA.href = `https://wa.me/${waNum}?text=${waMsg}`;
  }

  const prospectMeta = document.getElementById('prospect-meta');
  if (prospectMeta) {
    prospectMeta.textContent = `${p.es_celular} | ${p.tel} | ${p.franja}`;
  }

  renderCategories();
  renderServices();
  renderCart();
}

function getBrandInitials(name: string): string {
  const clean = name.replace(/(Salón|Salon|Spa|Urban|Restaurante|Cevichería|Cevicheria|Veterinaria|Studio|Odontic|Pet|Shop|de|la|del|d'|d)/gi, '').trim();
  const parts = (clean || name).split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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
      `✦ PESCA FRESCA DEL DÍA EN ${zona}`,
      `✦ CHILCANO DE CORTESÍA EN TU PRIMER PEDIDO`,
      `✦ LECHE DE TIGRE PREPARADA AL MOMENTO`,
      `✦ RESERVAS DIRECTAS SIN COMISIONES POR WHATSAPP`,
      `✦ ACEPTAMOS YAPE, PLIN, TARJETAS Y EFECTIVO`,
      `✦ UBICACIÓN VERIFICADA EN ${zona}`,
      `✦ PLATOS MARINOS CONTUNDENTES Y FRESCOS`
    ];
  } else if (rub.includes('veterin')) {
    items = [
      `✦ MÉDICOS VETERINARIOS TITULADOS UNMSM`,
      `✦ BAÑOS RELAJANTES & GROOMING PROFESIONAL`,
      `✦ CONSULTA MÉDICA INTEGRAL EN ${zona}`,
      `✦ VACUNACIÓN Y MEDICINA PREVENTIVA`,
      `✦ CUIDAMOS A TU ENGREÍDO CON MUCHO AMOR`,
      `✦ CITAS RÁPIDAS POR WHATSAPP EN ${zona}`
    ];
  } else if (rub.includes('dental') || rub.includes('salud') || rub.includes('odontol')) {
    items = [
      `✦ ODONTOLOGÍA INTEGRAL Y ESPECIALIZADA EN ${zona}`,
      `✦ BLANQUEAMIENTO DENTAL LED CLÍNICO`,
      `✦ ATENCIÓN SIN DOLOR CON TECNOLOGÍA DIGITAL`,
      `✦ EVALUACIÓN Y DIAGNÓSTICO DIGITAL`,
      `✦ RESINAS 3M Y DISEÑO DE SONRISA`,
      `✦ CITAS DIRECTAS POR WHATSAPP`
    ];
  } else if (rub.includes('podol')) {
    items = [
      `✦ PODOLOGÍA CLÍNICA ESPECIALIZADA EN ${zona}`,
      `✦ INSTRUMENTAL 100% ESTERILIZADO EN AUTOCLAVE`,
      `✦ ATENCIÓN DE UÑEROS, HONGOS Y PIE DIABÉTICO`,
      `✦ ALIVIO INMEDIATO EN LA PRIMERA SESIÓN`,
      `✦ SALUD Y DESCANSO PARA TUS PIES`
    ];
  } else {
    items = [
      `✦ ATENCIÓN PERSONALIZADA EN ${zona}`,
      `✦ PRODUCTOS PROFESIONALES DE ALTA GAMA`,
      `✦ BALAYAGE, ALISADOS & NAIL ART DE TENDENCIA`,
      `✦ RESERVAS DIRECTAS SIN COMISIONES`,
      `✦ ASESORÍA Y DIAGNÓSTICO SIN COSTO`
    ];
  }

  const repeated = [...items, ...items];
  marqueeContent.innerHTML = repeated.map(it => `<span class="mx-6 font-semibold">${it}</span>`).join('');
}

function updateBeforeAfterContent(p: Prospect, th: RubroTheme) {
  const baKicker = document.getElementById('ba-kicker');
  if (baKicker) baKicker.textContent = p.baKicker || th.baKicker;

  const baTitle = document.getElementById('ba-title');
  if (baTitle) baTitle.textContent = p.baTitle || th.baTitle;

  const baDesc = document.getElementById('ba-desc');
  if (baDesc) baDesc.textContent = p.baDesc || th.baDesc;

  const baImgBefore = document.getElementById('ba-img-before') as HTMLImageElement | null;
  if (baImgBefore) baImgBefore.src = p.baBefore || th.baBefore;

  const baImgAfter = document.getElementById('ba-img-after') as HTMLImageElement | null;
  if (baImgAfter) baImgAfter.src = p.baAfter || th.baAfter;

  const baLabelBefore = document.getElementById('ba-label-before');
  const baLabelAfter = document.getElementById('ba-label-after');
  const baBullet1 = document.getElementById('ba-bullet-1');
  const baBullet2 = document.getElementById('ba-bullet-2');
  const baBullet3 = document.getElementById('ba-bullet-3');

  const rubroLow = p.rubro.toLowerCase();
  if (rubroLow.includes('marina') || rubroLow.includes('gastronom')) {
    if (baLabelBefore) baLabelBefore.textContent = 'PESCA FRESCA DEL DÍA';
    if (baLabelAfter) baLabelAfter.textContent = 'PLATO SERVIDO EN MESA';
    if (baBullet1) baBullet1.textContent = '01 / PESCA ARTESANAL SELECCIONADA DEL DÍA';
    if (baBullet2) baBullet2.textContent = '02 / LECHE DE TIGRE PREPARADA AL MOMENTO';
    if (baBullet3) baBullet3.textContent = '03 / CUMPLIMIENTO SANITARIO & SAZÓN MARINA REAL';
  } else if (rubroLow.includes('veterin')) {
    if (baLabelBefore) baLabelBefore.textContent = 'PREVIO AL SERVICIO';
    if (baLabelAfter) baLabelAfter.textContent = 'RESULTADO DE SPA & SALUD';
    if (baBullet1) baBullet1.textContent = '01 / MÉDICOS VETERINARIOS TITULADOS UNMSM';
    if (baBullet2) baBullet2.textContent = '02 / MANEJO AMABLE Y AMBIENTE LIBRE DE ESTRÉS';
    if (baBullet3) baBullet3.textContent = '03 / PRODUCTOS DERMATOLÓGICOS HIPOALERGÉNICOS';
  } else if (rubroLow.includes('dental') || rubroLow.includes('salud') || rubroLow.includes('odontol')) {
    if (baLabelBefore) baLabelBefore.textContent = 'EVALUACIÓN INICIAL';
    if (baLabelAfter) baLabelAfter.textContent = 'SONRISA RADIANTE FINAL';
    if (baBullet1) baBullet1.textContent = '01 / MATERIALES BIOCOMPATIBLES Y ESTÉTICOS 3M';
    if (baBullet2) baBullet2.textContent = '02 / INSTRUMENTAL 100% ESTERILIZADO EN AUTOCLAVE';
    if (baBullet3) baBullet3.textContent = '03 / ATENCIÓN ODONTOLÓGICA CÁLIDA Y SIN DOLOR';
  } else if (rubroLow.includes('podol')) {
    if (baLabelBefore) baLabelBefore.textContent = 'VALORACIÓN PODOLÓGICA';
    if (baLabelAfter) baLabelAfter.textContent = 'ALIVIO & RECUPERACIÓN';
    if (baBullet1) baBullet1.textContent = '01 / ESTERILIZACIÓN HOSPITALARIA EN AUTOCLAVE';
    if (baBullet2) baBullet2.textContent = '02 / ATENCIÓN DE UÑEROS, HONGOS Y PIE DIABÉTICO';
    if (baBullet3) baBullet3.textContent = '03 / DESCANSO INMEDIATO DESDE LA PRIMERA VISITA';
  } else {
    if (baLabelBefore) baLabelBefore.textContent = 'PREPARACIÓN / ANTES';
    if (baLabelAfter) baLabelAfter.textContent = 'ACABADO FINAL';
    if (baBullet1) baBullet1.textContent = '01 / PRODUCTOS PROFESIONALES DE LÍNEA OFICIAL';
    if (baBullet2) baBullet2.textContent = '02 / ATENCIÓN PUNTUAL CON CITA PREVIA';
    if (baBullet3) baBullet3.textContent = '03 / ASESORÍA PERSONALIZADA SEGÚN TU ESTILO';
  }
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
  } else if (rub.includes('podol')) {
    if (rev1Title) rev1Title.textContent = `★★★★★ · ALIVIO INMEDIATO`;
    if (rev1Text) rev1Text.textContent = `"Llegué con un uñero muy doloroso y salí caminando sin ninguna molestia. Profesionalismo de primera y trato muy suave."`;
    if (rev2Title) rev2Title.textContent = `★★★★★ · ESTERILIZACIÓN`;
    if (rev2Text) rev2Text.textContent = `"Instrumental en sobre cerrado y esterilizado frente a ti en autoclave. Súper confiable para el cuidado de los pies."`;
    if (rev3Title) rev3Title.textContent = `★ ${p.estrellas} · RECOMENDADO`;
    if (rev3Text) rev3Text.textContent = `"Excelente atención en ${p.zona}. Mis pies descansaron como nunca. Volveré cada mes para mi control podológico."`;
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

  const services = getAvailableServices();
  const list = activeCategory === 'Todos'
    ? services
    : services.filter(s => s.cat === activeCategory);

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
    const available = getAvailableServices();
    const found = available.find(s => s.id === id);
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
