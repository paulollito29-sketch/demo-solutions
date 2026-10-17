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

  dogBtn?.addEventListener('click', () => setPetSpecies('Perrito', dogBtn));
  catBtn?.addEventListener('click', () => setPetSpecies('Gatito', catBtn));
  otherBtn?.addEventListener('click', () => setPetSpecies('Exótico / Mascota', otherBtn));

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

  initInteractiveModules();

  if (requestedId) {
    setProspect(requestedId);
  } else {
    setProspect(PROSPECTS[0].id);
  }
}

let selectedPetSpecies = 'Perrito';

function setPetSpecies(species: string, activeBtn: HTMLElement | null) {
  selectedPetSpecies = species;
  const dogBtn = document.getElementById('vet-pet-dog');
  const catBtn = document.getElementById('vet-pet-cat');
  const otherBtn = document.getElementById('vet-pet-other');
  [dogBtn, catBtn, otherBtn].forEach(b => {
    if (b) {
      b.className = 'vet-pet-btn py-4 px-3 rounded-2xl border-2 border-stone-200 bg-stone-50 text-stone-700 font-bold flex flex-col items-center justify-center gap-2 hover:bg-teal-50 hover:border-teal-300 transition';
    }
  });
  if (activeBtn) {
    activeBtn.className = 'vet-pet-btn py-4 px-3 rounded-2xl border-2 border-teal-600 bg-teal-50 text-teal-950 font-bold flex flex-col items-center justify-center gap-2 hover:bg-teal-100 transition';
  }
  syncVetLiveCard();
}

// --- INTERACTIVE INDUSTRY MODULES & WIDGETS ---

interface LookbookItem {
  kicker: string;
  title: string;
  img: string;
  desc: string;
  price: string;
  service: ServiceItem;
}

const LOOKBOOK_DATA: Record<string, LookbookItem> = {
  color: {
    kicker: 'COLECCIÓN 01 · COLOR & BALAYAGE',
    title: 'Balayage & Iluminación Sublime',
    img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85',
    desc: 'Técnicas personalizadas de aclarado gradual con protección de plex. Logra rubios luminosos, morena iluminada o tonos cobrizos con máxima suavidad y brillo espejo.',
    price: 'Desde S/ 180',
    service: { id: 'lb-balayage', cat: 'Color & Estilo', name: 'Balayage VIP & Matizado', desc: 'Aclarado gradual con plex y matizado.', price: 180, time: '180 min' }
  },
  alisados: {
    kicker: 'COLECCIÓN 02 · TERAPIA CAPILAR',
    title: 'Alisado Brasilero & Botox Gloss',
    img: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1000&q=85',
    desc: 'Fórmula 100% libre de formol con queratina orgánica y sellador térmico. Cabello lacio, sedoso y disciplinado con brillo espejo por hasta 4 meses.',
    price: 'Desde S/ 110',
    service: { id: 'lb-alisado', cat: 'Alisados & Terapia', name: 'Alisado Orgánico Termoactivo', desc: 'Lacio espejo con queratina libre de formol.', price: 110, time: '120 min' }
  },
  nails: {
    kicker: 'COLECCIÓN 03 · NAILS & SPA',
    title: 'Nails Studio Polygel & Spa',
    img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=85',
    desc: 'Esculpidas en acrílico o polygel de alta resistencia, esmaltado en gel semipermanente con diseño minimalista o nail art y exfoliación hidratante profunda.',
    price: 'Desde S/ 45',
    service: { id: 'lb-nails', cat: 'Nails Studio', name: 'Manicura Semipermanente & Spa', desc: 'Esmaltado gel de larga duración con sales y exfoliación.', price: 45, time: '60 min' }
  },
  makeup: {
    kicker: 'COLECCIÓN 04 · MAKEUP & BRIDAL',
    title: 'Styling & Maquillaje Social HD',
    img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=85',
    desc: 'Preparación dérmica con primer hidratante, base de alta definición con fijación blindada a prueba de agua y pestañas punto por punto de acabado natural.',
    price: 'Desde S/ 120',
    service: { id: 'lb-makeup', cat: 'Maquillaje & Peinado', name: 'Maquillaje HD Blindado', desc: 'Maquillaje profesional blindado con pestañas.', price: 120, time: '75 min' }
  }
};

let activeLookbookKey = 'color';

function openLookbookModal(key: string) {
  const data = LOOKBOOK_DATA[key];
  if (!data) return;
  activeLookbookKey = key;

  const modal = document.getElementById('salon-lookbook-modal');
  const kicker = document.getElementById('lookbook-modal-kicker');
  const title = document.getElementById('lookbook-modal-title');
  const img = document.getElementById('lookbook-modal-img') as HTMLImageElement | null;
  const desc = document.getElementById('lookbook-modal-desc');
  const price = document.getElementById('lookbook-modal-price');

  if (kicker) kicker.textContent = data.kicker;
  if (title) title.textContent = data.title;
  if (img) img.src = data.img;
  if (desc) desc.textContent = data.desc;
  if (price) price.textContent = data.price;

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeLookbookModal() {
  const modal = document.getElementById('salon-lookbook-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

let quizLength = 'medio';
let quizNeed = 'frizz';

interface QuizResult {
  title: string;
  price: number;
  desc: string;
}

function getQuizRecommendation(): QuizResult {
  if (quizNeed === 'decolorado') {
    const price = quizLength === 'corto' ? 100 : quizLength === 'medio' ? 130 : quizLength === 'largo' ? 160 : 180;
    return {
      title: 'Cauterización & Reconstrucción Olaplex Plex',
      price,
      desc: 'Terapia de rescate capilar de choque con enlaces activos. Reconstruye hebras maltratadas por decoloración devolviendo elasticidad y fuerza.'
    };
  }
  if (quizNeed === 'color') {
    const price = quizLength === 'corto' ? 80 : quizLength === 'medio' ? 100 : quizLength === 'largo' ? 130 : 150;
    return {
      title: 'Baño de Color Gloss & Matizado Espejo',
      price,
      desc: 'Refresco de pigmentos y sellador de cutícula con pH balanceado. Elimina tonos indeseados y aporta luminosidad tridimensional inmediata.'
    };
  }
  const price = quizLength === 'corto' ? 90 : quizLength === 'medio' ? 110 : quizLength === 'largo' ? 140 : 160;
  return {
    title: 'Botox Capilar Orgánico & Sellador de Puntas',
    price,
    desc: 'Tratamiento de nutrición profunda con aminoácidos y manteca de cacao. Rellena la hebra capilar, elimina el frizz y devuelve el brillo sin formol.'
  };
}

function updateHairQuizResult() {
  const rec = getQuizRecommendation();
  const titleEl = document.getElementById('quiz-rec-title');
  const priceEl = document.getElementById('quiz-rec-price');
  const descEl = document.getElementById('quiz-rec-desc');

  if (titleEl) titleEl.textContent = rec.title;
  if (priceEl) priceEl.textContent = `S/ ${rec.price}`;
  if (descEl) descEl.textContent = rec.desc;
}

function syncVetLiveCard() {
  const pNameEl = document.getElementById('vet-patient-name') as HTMLInputElement | null;
  const pAgeEl = document.getElementById('vet-patient-age') as HTMLInputElement | null;
  const tutorEl = document.getElementById('vet-tutor-name') as HTMLInputElement | null;
  const selectedReason = (document.querySelector('input[name="vet-reason"]:checked') as HTMLInputElement)?.value || 'Consulta Médica General';

  const petName = pNameEl?.value.trim() || 'Toby';
  const petAge = pAgeEl?.value.trim() || '2 años';
  const tutor = tutorEl?.value.trim() || 'Pendiente de ingreso';

  const livePatient = document.getElementById('vet-live-patient');
  const liveAge = document.getElementById('vet-live-age');
  const liveReason = document.getElementById('vet-live-reason');
  const liveTutor = document.getElementById('vet-live-tutor');

  if (livePatient) livePatient.textContent = `${selectedPetSpecies} - "${petName}"`;
  if (liveAge) liveAge.textContent = petAge;
  if (liveReason) liveReason.textContent = selectedReason;
  if (liveTutor) liveTutor.textContent = `Tutor: ${tutor}`;
}

function initInteractiveModules() {
  // Global Event Delegation for dynamic buttons (Combos, Plans, Specialties, Lookbook)
  document.addEventListener('click', (e) => {
    const comboBtn = (e.target as HTMLElement).closest('.btn-add-combo') as HTMLButtonElement | null;
    if (comboBtn) {
      const cId = comboBtn.getAttribute('data-combo-id');
      const cName = comboBtn.getAttribute('data-combo-name');
      const cPrice = Number(comboBtn.getAttribute('data-combo-price') || '0');
      if (!cId || !cName) return;

      const existingIdx = cart.findIndex(i => i.id === cId);
      if (existingIdx >= 0) {
        cart.splice(existingIdx, 1);
      } else {
        cart.push({
          id: cId,
          cat: 'Combos & Especiales',
          name: cName,
          desc: 'Especial seleccionado desde la carta web.',
          price: cPrice,
          time: 'Inmediato'
        });
      }
      renderServices();
      renderCart();
      return;
    }

    const vetPlanBtn = (e.target as HTMLElement).closest('.btn-add-vet-plan') as HTMLButtonElement | null;
    if (vetPlanBtn) {
      const pId = vetPlanBtn.getAttribute('data-vet-plan-id');
      const pName = vetPlanBtn.getAttribute('data-vet-plan-name');
      const pPrice = Number(vetPlanBtn.getAttribute('data-vet-plan-price') || '0');
      if (!pId || !pName) return;

      const existingIdx = cart.findIndex(i => i.id === pId);
      if (existingIdx >= 0) {
        cart.splice(existingIdx, 1);
      } else {
        cart.push({
          id: pId,
          cat: 'Medicina Preventiva',
          name: pName,
          desc: 'Protocolo integral preventivo con vacunas y chequeo clínico.',
          price: pPrice,
          time: '45-60 min'
        });
      }
      renderServices();
      renderCart();
      return;
    }

    const clinicPlanBtn = (e.target as HTMLElement).closest('.btn-add-clinic-plan') as HTMLButtonElement | null;
    if (clinicPlanBtn) {
      const pId = clinicPlanBtn.getAttribute('data-clinic-id');
      const pName = clinicPlanBtn.getAttribute('data-clinic-name');
      const pPrice = Number(clinicPlanBtn.getAttribute('data-clinic-price') || '0');
      if (!pId || !pName) return;

      const existingIdx = cart.findIndex(i => i.id === pId);
      if (existingIdx >= 0) {
        cart.splice(existingIdx, 1);
      } else {
        cart.push({
          id: pId,
          cat: 'Especialidades Clínicas',
          name: pName,
          desc: 'Procedimiento clínico especializado.',
          price: pPrice,
          time: '40 min'
        });
      }
      renderServices();
      renderCart();
      return;
    }

    const lookbookBtn = (e.target as HTMLElement).closest('.btn-open-lookbook') as HTMLElement | null;
    if (lookbookBtn) {
      const key = lookbookBtn.getAttribute('data-lookbook-id');
      if (key) openLookbookModal(key);
      return;
    }
  });

  // Hair Diagnostic Quiz (Salones)
  document.querySelectorAll('.quiz-len-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const el = e.currentTarget as HTMLButtonElement;
      const len = el.getAttribute('data-quiz-len');
      if (!len) return;
      quizLength = len;
      document.querySelectorAll('.quiz-len-btn').forEach(b => {
        b.className = 'quiz-len-btn py-3 px-3 rounded-xl border border-[#3b3447] bg-[#121017] hover:border-[#c5a880] text-stone-300 font-semibold transition cursor-pointer';
      });
      el.className = 'quiz-len-btn py-3 px-3 rounded-xl border-2 border-[#c5a880] bg-[#2a2334] text-[#dfcaaa] font-bold transition cursor-pointer';
      updateHairQuizResult();
    });
  });

  document.querySelectorAll('.quiz-need-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const el = e.currentTarget as HTMLButtonElement;
      const need = el.getAttribute('data-quiz-need');
      if (!need) return;
      quizNeed = need;
      document.querySelectorAll('.quiz-need-btn').forEach(b => {
        b.className = 'quiz-need-btn py-3 px-3 rounded-xl border border-[#3b3447] bg-[#121017] hover:border-[#c5a880] text-stone-300 font-semibold transition text-left flex items-center gap-2 cursor-pointer';
      });
      el.className = 'quiz-need-btn py-3 px-3 rounded-xl border-2 border-[#c5a880] bg-[#2a2334] text-[#dfcaaa] font-bold transition text-left flex items-center gap-2 cursor-pointer';
      updateHairQuizResult();
    });
  });

  document.getElementById('btn-apply-quiz')?.addEventListener('click', () => {
    const rec = getQuizRecommendation();
    const serviceId = `quiz-${quizNeed}-${quizLength}`;
    const existingIdx = cart.findIndex(i => i.id === serviceId);
    if (existingIdx < 0) {
      cart.push({
        id: serviceId,
        cat: 'Diagnóstico Capilar',
        name: rec.title,
        desc: rec.desc,
        price: rec.price,
        time: '75 min'
      });
    }
    renderServices();
    renderCart();
    const btn = document.getElementById('btn-apply-quiz');
    if (btn) btn.innerHTML = '<span>✓ ¡Tratamiento Agregado a tu Cita!</span>';
    document.getElementById('salon-tarifario')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Montalvo Lookbook Modal (Salones)
  document.querySelectorAll('.btn-open-lookbook').forEach(card => {
    card.addEventListener('click', (e) => {
      const el = e.currentTarget as HTMLElement;
      const lbId = el.getAttribute('data-lookbook-id');
      if (lbId) openLookbookModal(lbId);
    });
  });

  document.getElementById('btn-close-lookbook')?.addEventListener('click', closeLookbookModal);
  const lookbookModal = document.getElementById('salon-lookbook-modal');
  lookbookModal?.addEventListener('click', (e) => {
    if (e.target === lookbookModal) closeLookbookModal();
  });

  document.getElementById('btn-lookbook-book')?.addEventListener('click', () => {
    const item = LOOKBOOK_DATA[activeLookbookKey];
    if (item) {
      const existingIdx = cart.findIndex(i => i.id === item.service.id);
      if (existingIdx < 0) {
        cart.push(item.service);
      }
      renderServices();
      renderCart();
      closeLookbookModal();
      document.getElementById('salon-tarifario')?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Live Patient Card Sync (Veterinarias)
  const vName = document.getElementById('vet-patient-name');
  const vAge = document.getElementById('vet-patient-age');
  const vTutor = document.getElementById('vet-tutor-name');
  vName?.addEventListener('input', syncVetLiveCard);
  vAge?.addEventListener('input', syncVetLiveCard);
  vTutor?.addEventListener('input', syncVetLiveCard);

  document.querySelectorAll('input[name="vet-reason"]').forEach(radio => {
    radio.addEventListener('change', syncVetLiveCard);
  });

  // Restaurant Calculator Guest Buttons
  document.querySelectorAll('.rest-calc-guest-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const el = e.currentTarget as HTMLButtonElement;
      const guests = Number(el.getAttribute('data-calc-guests') || '4');
      calcGuests = guests;
      document.querySelectorAll('.rest-calc-guest-btn').forEach(b => {
        b.className = 'rest-calc-guest-btn py-3 px-3 rounded-xl border border-stone-700 bg-stone-950 text-stone-300 font-bold hover:border-amber-400 transition cursor-pointer';
      });
      el.className = 'rest-calc-guest-btn py-3 px-3 rounded-xl border-2 border-amber-500 bg-amber-950/60 text-amber-300 font-bold transition cursor-pointer shadow';
      updateRestaurantCalc();
    });
  });

  // Restaurant Calculator Tier Buttons
  document.querySelectorAll('.rest-calc-tier-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const el = e.currentTarget as HTMLButtonElement;
      const tier = el.getAttribute('data-calc-tier') as 'light' | 'standard' | 'celebration';
      if (!tier) return;
      calcTier = tier;
      document.querySelectorAll('.rest-calc-tier-btn').forEach(b => {
        b.className = 'rest-calc-tier-btn py-3.5 px-4 rounded-xl border border-stone-700 bg-stone-950 text-stone-300 font-bold hover:border-amber-400 transition cursor-pointer text-left flex items-center justify-between';
      });
      el.className = 'rest-calc-tier-btn py-3.5 px-4 rounded-xl border-2 border-amber-500 bg-amber-950/60 text-amber-300 font-bold transition cursor-pointer text-left flex items-center justify-between shadow';
      updateRestaurantCalc();
    });
  });

  // Apply Restaurant Calculator Suggestion to Cart
  document.getElementById('btn-apply-calc-suggestion')?.addEventListener('click', () => {
    const perPerson = calcTier === 'light' ? 20 : calcTier === 'celebration' ? 38 : 27.50;
    const total = perPerson * calcGuests;
    const tierLabels = { light: 'Almuerzo Ligero', standard: 'Banquete Completo', celebration: 'Celebración & Chilcanos' };
    const pId = `calc-pkg-${calcGuests}-${calcTier}`;

    const existingIdx = cart.findIndex(i => i.id === pId);
    if (existingIdx < 0) {
      cart.push({
        id: pId,
        cat: 'Sugerencia Grupal',
        name: `Banquete para ${calcGuests} Personas (${tierLabels[calcTier]})`,
        desc: `Menú sugerido por la calculadora web para mesa de ${calcGuests}.`,
        price: total,
        time: '25 min'
      });
    }
    renderServices();
    renderCart();
    const btn = document.getElementById('btn-apply-calc-suggestion');
    if (btn) btn.innerHTML = '<span>✓ ¡Sugerencia Agregada a tu Orden!</span>';
    document.getElementById('rest-carta')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Veterinary Vaccine Calculator Buttons
  document.querySelectorAll('.vet-vcalc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const el = e.currentTarget as HTMLButtonElement;
      const age = el.getAttribute('data-vcalc-age');
      if (!age) return;
      vcalcAge = age;
      document.querySelectorAll('.vet-vcalc-btn').forEach(b => {
        b.className = 'vet-vcalc-btn py-3.5 px-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-700 font-bold hover:border-teal-400 transition cursor-pointer text-center';
      });
      el.className = 'vet-vcalc-btn py-3.5 px-3 rounded-2xl border-2 border-teal-600 bg-teal-50 text-teal-950 font-bold transition cursor-pointer text-center shadow';
      updateVetCalc();
    });
  });

  syncVetLiveCard();
  updateHairQuizResult();
  updateRestaurantCalc();
  updateVetCalc();
}

// --- CALCULADORA DE CONSUMO GRUPAL (Restaurantes) ---
let calcGuests = 4;
let calcTier: 'light' | 'standard' | 'celebration' = 'standard';

function updateRestaurantCalc() {
  let perPerson = 27.50;
  let menuDesc = '';
  let perkDesc = '';

  if (calcTier === 'light') {
    perPerson = 20.00;
    menuDesc = `${calcGuests} Ceviches personales al gusto + ${calcGuests > 4 ? '2 Jarras' : '1 Jarra'} de Chicha Morada artesanal 1.5L.`;
    perkDesc = 'Por consumo en salón: ¡Canchita chulpi caliente y chilcano de cortesía web!';
  } else if (calcTier === 'celebration') {
    perPerson = 38.00;
    menuDesc = `${Math.max(1, Math.ceil(calcGuests / 3))} Trilogías Calientes al Wok + ${Math.max(1, Math.ceil(calcGuests / 2))} Fuentes Mixtas + Ronda de Chilcanos para todos.`;
    perkDesc = '¡Beneficio Cumpleañero/Grupo: Postre de la casa + brindis con chilcanos de cortesía!';
  } else {
    perPerson = 27.50;
    menuDesc = `${Math.max(1, Math.ceil(calcGuests / 2))} Dúos Marinos Festival + ${Math.max(1, Math.ceil(calcGuests / 4))} Chicharrones Mixtos + Jarras de Chicha Especial.`;
    perkDesc = 'Por consumo grupal web: ¡Postre de la casa o ronda de cortesía confirmando por WhatsApp!';
  }

  const total = perPerson * calcGuests;

  const titleEl = document.getElementById('rest-calc-summary-title');
  const perPersonEl = document.getElementById('rest-calc-per-person');
  const totalEl = document.getElementById('rest-calc-total');
  const menuEl = document.getElementById('rest-calc-menu-desc');
  const perkEl = document.getElementById('rest-calc-perk-desc');

  const tierLabels = { light: 'Almuerzo Ligero', standard: 'Banquete Completo', celebration: 'Celebración & Chilcanos' };

  if (titleEl) titleEl.textContent = `Para ${calcGuests} personas · ${tierLabels[calcTier]}`;
  if (perPersonEl) perPersonEl.textContent = `S/ ${perPerson.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
  if (menuEl) menuEl.textContent = menuDesc;
  if (perkEl) perkEl.textContent = perkDesc;
}

// --- CALCULADORA DE VACUNAS & DESPARASITACIÓN (Veterinarias) ---
let vcalcAge = 'cachorro';

const VET_CALC_DATA: Record<string, { title: string; freq: string; vacunas: string; despar: string }> = {
  cachorro: {
    title: 'Esquema Primovacunación Cachorro / Kitten',
    freq: 'Cada 21 días hasta completar ciclo',
    vacunas: '• Séxtuple canina / Triple felina en 3 dosis escalonadas\n• Refuerzo de Leptospira y Hepatitis infecciosa\n• Antirrábica a los 3 meses con carnet oficial.',
    despar: '• Desparasitación interna en suspensión según peso cada 15-30 días.\n• Pipeta o pastilla antipulgas segura a partir de las 8 semanas.'
  },
  joven: {
    title: 'Protocolo Anual de Inmunidad & Dientes',
    freq: '1 vez al año de por vida',
    vacunas: '• Refuerzo anual Séxtuple (caninos) o Triple Felina (felinos)\n• Vacuna Antirrábica obligatoria anual con registro municipal\n• Vacuna KC preventiva para tos de las perreras / bordetella.',
    despar: '• Desparasitación interna en pastilla cada 3 meses según peso.\n• Antipulgas/garrapatas mensual o trimestral (Bravecto/Nexgard).'
  },
  senior: {
    title: 'Protocolo de Salud & Detección Geriátrica',
    freq: 'Control clínico cada 6 meses',
    vacunas: '• Refuerzo de vacunas previa evaluación del estado inmunológico\n• Descarte de artrosis y movilidad con palpación articular\n• Perfil renal, hepático y glucosa preventiva en sangre.',
    despar: '• Desparasitante suave para estómagos sensibles.\n• Suplemento con condroprotectores y omega 3 para articulaciones.'
  },
  viajero: {
    title: 'Certificado Sanitario de Viaje & SENASA',
    freq: '7 a 10 días antes del viaje',
    vacunas: '• Carnet de vacunación antirrábica vigente (más de 21 días de aplicada)\n• Aplicación de antiparasitario interno y externo certificado\n• Emisión de Certificado Médico Veterinario Colegiado oficial.',
    despar: '• Desparasitación oficial con número de lote y laboratorio para SENASA.'
  }
};

function updateVetCalc() {
  const data = VET_CALC_DATA[vcalcAge] || VET_CALC_DATA.cachorro;
  const titleEl = document.getElementById('vet-vcalc-title');
  const freqEl = document.getElementById('vet-vcalc-freq');
  const vacunasEl = document.getElementById('vet-vcalc-vacunas');
  const desparEl = document.getElementById('vet-vcalc-despar');

  if (titleEl) titleEl.textContent = data.title;
  if (freqEl) freqEl.textContent = data.freq;
  if (vacunasEl) vacunasEl.innerHTML = data.vacunas.replace(/\n/g, '<br />');
  if (desparEl) desparEl.innerHTML = data.despar.replace(/\n/g, '<br />');
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

  const isRestaurant = rubroLow.includes('restaurante') || rubroLow.includes('marina') || rubroLow.includes('gastronom') || rubroLow.includes('cafeter') || nameLow.includes('cevich') || nameLow.includes('costill') || nameLow.includes('parrill') || nameLow.includes('chifa') || nameLow.includes('poll') || nameLow.includes('food') || nameLow.includes('bar');
  const isVet = rubroLow.includes('veterin') || nameLow.includes('pet') || nameLow.includes('vet') || nameLow.includes('animal') || nameLow.includes('huell') || nameLow.includes('canino');
  const isClinic = rubroLow.includes('dental') || rubroLow.includes('odontol') || rubroLow.includes('podol') || rubroLow.includes('clínica') || rubroLow.includes('clinica') || rubroLow.includes('terapia') || rubroLow.includes('educaci') || nameLow.includes('podól') || nameLow.includes('dental') || nameLow.includes('odont') || nameLow.includes('nido');

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
  } else {
    // All other businesses (belleza, bienestar, barber, spa, boutique, hotel, etc.) map directly to SalonView!
    if (salonView) salonView.style.display = 'block';
    applyPalette(p);
    updateSalonView(p);
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

function getOrGeneratePalette(p: Prospect): ProspectPalette {
  if (p.palette) return p.palette;

  const PALETTE_LIBRARY: ProspectPalette[] = [
    { name: 'Marine Ocean & Azure', bg_page: '#F0F9FF', bg_panel: '#FFFFFF', bg_tint: '#E0F2FE', ink: '#0C4A6E', accent: '#0284C7', accent_dark: '#0369A1', line: '#BAE6FD' },
    { name: 'Charred Ember & Smoke BBQ', bg_page: '#171513', bg_panel: '#201D1A', bg_tint: '#2B2622', ink: '#FFFFFF', accent: '#EA580C', accent_dark: '#C2410C', line: '#43372E' },
    { name: 'Warm Terracotta & Honey', bg_page: '#FFFBEB', bg_panel: '#FFFFFF', bg_tint: '#FEF3C7', ink: '#78350F', accent: '#D97706', accent_dark: '#B45309', line: '#FDE68A' },
    { name: 'Rose Silk & Velvet Noir', bg_page: '#141118', bg_panel: '#1E1925', bg_tint: '#2B2236', ink: '#FFFFFF', accent: '#EC4899', accent_dark: '#DB2777', line: '#493558' },
    { name: 'Royal Gold & Couture Black', bg_page: '#121113', bg_panel: '#1C191E', bg_tint: '#2A252E', ink: '#FFFFFF', accent: '#D4AF37', accent_dark: '#B89628', line: '#473E4F' },
    { name: 'Clinical Mint & Sage Calm', bg_page: '#F0FDF4', bg_panel: '#FFFFFF', bg_tint: '#DCFCE7', ink: '#14251B', accent: '#059669', accent_dark: '#047857', line: '#A7F3D0' },
    { name: 'Teal Hospital & Clear Sky', bg_page: '#F0FDFA', bg_panel: '#FFFFFF', bg_tint: '#CCFBF1', ink: '#0F172A', accent: '#0D9488', accent_dark: '#0F766E', line: '#99F6E4' },
    { name: 'Crimson Wok & Dynasty Gold', bg_page: '#181214', bg_panel: '#23181C', bg_tint: '#311E25', ink: '#FFFFFF', accent: '#E11D48', accent_dark: '#BE123C', line: '#522938' },
    { name: 'Amethyst Violet & Pearl', bg_page: '#FAF5FF', bg_panel: '#FFFFFF', bg_tint: '#F3E8FF', ink: '#3B0764', accent: '#9333EA', accent_dark: '#7E22CE', line: '#E9D5FF' },
    { name: 'Dental Royal Cyan & Pure White', bg_page: '#F8FAFC', bg_panel: '#FFFFFF', bg_tint: '#F1F5F9', ink: '#0F172A', accent: '#0284C7', accent_dark: '#0369A1', line: '#E2E8F0' },
    { name: 'Bronze Vintage & Coffee Leather', bg_page: '#151311', bg_panel: '#1F1C18', bg_tint: '#2B2620', ink: '#FFFFFF', accent: '#B45309', accent_dark: '#92400E', line: '#453B2F' },
    { name: 'Lime Fresh & Marina Deep', bg_page: '#131916', bg_panel: '#1A2420', bg_tint: '#22322C', ink: '#FFFFFF', accent: '#10B981', accent_dark: '#059669', line: '#334D43' },
    { name: 'Coral Sunrise & Soft Peach', bg_page: '#FFF7ED', bg_panel: '#FFFFFF', bg_tint: '#FFEDD5', ink: '#7C2D12', accent: '#F97316', accent_dark: '#EA580C', line: '#FED7AA' },
    { name: 'Eucalyptus Podology Care', bg_page: '#F2FDF7', bg_panel: '#FFFFFF', bg_tint: '#D1FAE5', ink: '#064E3B', accent: '#059669', accent_dark: '#047857', line: '#A7F3D0' },
    { name: 'Cobalt Modern & White Clean', bg_page: '#F8FAFC', bg_panel: '#FFFFFF', bg_tint: '#EFF6FF', ink: '#1E293B', accent: '#2563EB', accent_dark: '#1D4ED8', line: '#DBEAFE' },
    { name: 'Midnight Plum & Rose Champagne', bg_page: '#181119', bg_panel: '#231725', bg_tint: '#311E34', ink: '#FFFFFF', accent: '#C026D3', accent_dark: '#A21CAF', line: '#4D2952' }
  ];

  let hash = 0;
  const str = p.id + p.name + p.rubro;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PALETTE_LIBRARY.length;
  return PALETTE_LIBRARY[idx];
}

function generateBrandLogoSvg(p: Prospect, isDarkBg: boolean): string {
  if (p.logoUrl) return p.logoUrl;

  const cleanName = p.name.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();
  const words = cleanName.split(/\s+/).filter(w => !['de', 'la', 'del', 'el', 'los', 'las', 'y', '&', 'en', 'dr', 'dra'].includes(w.toLowerCase()));
  let initials = 'PE';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].substring(0, 2).toUpperCase();
  }

  const palette = getOrGeneratePalette(p);
  const accent = palette.accent;
  const accentDark = palette.accent_dark;
  const textColor = isDarkBg ? '#FFFFFF' : '#0F172A';
  const subColor = isDarkBg ? (palette.accent_light || '#FBBF24') : accent;
  const badgeBg = isDarkBg ? 'rgba(255,255,255,0.08)' : `${accent}15`;

  let displayName = p.name.toUpperCase();
  if (displayName.length > 22) {
    displayName = displayName.substring(0, 20) + '…';
  }
  const subLine = `${p.rubro.toUpperCase()} · ${p.zona.toUpperCase()}`;
  const displaySub = subLine.length > 32 ? subLine.substring(0, 30) + '…' : subLine;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 68" width="320" height="68">
    <defs>
      <linearGradient id="g_${p.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accent}" />
        <stop offset="100%" stop-color="${accentDark}" />
      </linearGradient>
    </defs>
    <g transform="translate(6, 6)">
      <rect x="0" y="0" width="56" height="56" rx="14" fill="${badgeBg}" stroke="${accent}" stroke-width="1.8"/>
      <circle cx="28" cy="28" r="23" fill="none" stroke="${accent}" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.6"/>
      <text x="28" y="36" font-family="'Cinzel', Georgia, serif" font-size="20" font-weight="800" fill="url(#g_${p.id})" text-anchor="middle" letter-spacing="0.05em">${initials}</text>
    </g>
    <g transform="translate(74, 32)">
      <text x="0" y="0" font-family="'DM Sans', -apple-system, sans-serif" font-size="16" font-weight="800" fill="${textColor}" letter-spacing="0.04em">${displayName}</text>
      <text x="1" y="18" font-family="'JetBrains Mono', monospace, sans-serif" font-size="8" font-weight="700" fill="${subColor}" letter-spacing="0.14em">${displaySub}</text>
    </g>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function renderBrandLogo(imgId: string, p: Prospect, isDarkBg: boolean) {
  const el = document.getElementById(imgId) as HTMLImageElement | null;
  if (!el) return;
  el.src = generateBrandLogoSvg(p, isDarkBg);
  el.alt = `${p.name} - Logotipo Oficial`;
}

function generateServicesForProspect(p: Prospect): ServiceItem[] {
  if (p.customServices && p.customServices.length > 0) {
    return p.customServices;
  }

  const nameLow = p.name.toLowerCase();
  const rubroLow = p.rubro.toLowerCase();

  // 1. Restaurants & Food
  if (rubroLow.includes('restaurante') || rubroLow.includes('marina') || rubroLow.includes('gastronom') || rubroLow.includes('cafeter') || nameLow.includes('food')) {
    if (nameLow.includes('poll') || nameLow.includes('brasa')) {
      return [
        { id: `${p.id}-s1`, cat: 'Pollos a la Brasa', name: '1 Pollo a la Brasa Familiar + Papas & Ensalada', desc: 'Marinado tradicional con especias peruanas, papas nativas crocantes y cremas caseras.', price: 74, time: '20 min' },
        { id: `${p.id}-s2`, cat: 'Pollos a la Brasa', name: '1/2 Pollo a la Brasa + Papas Fritas & Ensalada', desc: 'Doble porción con ají pollero casero, vinagreta fresca y guarnición abundante.', price: 42, time: '15 min' },
        { id: `${p.id}-s3`, cat: 'Pollos a la Brasa', name: '1/4 Pollo a la Brasa (Pierna o Pecho)', desc: 'Porción personal bien despachada con papas fritas y cremas.', price: 24, time: '12 min' },
        { id: `${p.id}-s4`, cat: 'Especiales & Wok', name: 'Mostrito Broaster Especial al Wok', desc: 'Arroz chaufa ahumado al wok + presa de pollo broaster crujiente + papas.', price: 29, time: '15 min' },
        { id: `${p.id}-s5`, cat: 'Parrillas & Piqueos', name: 'Porción de Anticuchos de Corazón (2 Palos)', desc: 'Tiernos trozos marinados en ají panca y vinagre tinto con papa dorada y choclo.', price: 26, time: '15 min' },
        { id: `${p.id}-s6`, cat: 'Bebidas Caseras', name: 'Jarra de Chicha Morada Artesanal 1.5L', desc: 'Hervida con piña, membrillo, manzana, canela y clavo de olor.', price: 18, time: '5 min' }
      ];
    }
    if (nameLow.includes('chifa') || nameLow.includes('wok') || nameLow.includes('dragon') || nameLow.includes('tai')) {
      return [
        { id: `${p.id}-s1`, cat: 'Arroces al Wok', name: 'Arroz Chaufa Especial de Pollo y Chancho', desc: 'Salteado al fuego vivo con sillao premium, cebollita china y tortilla de huevo.', price: 32, time: '12 min' },
        { id: `${p.id}-s2`, cat: 'Tallarines', name: 'Tallarín Saltado Chifero de Carne y Verduras', desc: 'Fideos crocantes al wok con lomo fino, holantao, champiñones y col china.', price: 36, time: '15 min' },
        { id: `${p.id}-s3`, cat: 'Entradas Chiferas', name: 'Docena de Wantanes Fritos con Salsa Tamarindo', desc: 'Masa delgada extra crocante rellena de pulpa de cerdo artesanal.', price: 18, time: '10 min' },
        { id: `${p.id}-s4`, cat: 'Especiales al Wok', name: 'Pollo Tipakay Agridulce con Piña y Durazno', desc: 'Pechuga arrebozada crujiente bañada en reducción agridulce tradicional.', price: 34, time: '15 min' },
        { id: `${p.id}-s5`, cat: 'Especiales al Wok', name: 'Pollo Chijaukay con Salsa de Ostión & Ajonjolí', desc: 'Muslo deshuesado dorado al vapor con salsa espesa de ostión y cebollín.', price: 34, time: '15 min' },
        { id: `${p.id}-s6`, cat: 'Banquete', name: 'Aeropuerto Mixto con Huevo Montado', desc: 'Combinación generosa de arroz chaufa y fideos salteados al wok con frejolito chino.', price: 33, time: '15 min' }
      ];
    }
    if (nameLow.includes('caf') || nameLow.includes('pan') || nameLow.includes('pasteler') || nameLow.includes('dulc')) {
      return [
        { id: `${p.id}-s1`, cat: 'Cafetería de Especialidad', name: 'Capuchino Artesanal con Leche Texturizada', desc: 'Granos de origen de Villa Rica / Cusco con tueste medio y latte art.', price: 12, time: '5 min' },
        { id: `${p.id}-s2`, cat: 'Brunch & Desayuno', name: 'Desayuno Criollo Tradicional con Chicharrón', desc: 'Chicharrón de cerdo tierno, camote frito, sarza criolla y panes calientes.', price: 34, time: '15 min' },
        { id: `${p.id}-s3`, cat: 'Sánguches', name: 'Sánguche de Pavo Ahumado en Pan Ciabatta', desc: 'Pechuga jugosa al horno con lechuga fresca y vinagreta dijon casera.', price: 22, time: '10 min' },
        { id: `${p.id}-s4`, cat: 'Pastelería Fina', name: 'Tarta de Chocolate Belga 70% Cacao', desc: 'Capas suaves de bizcocho húmedo rellenas de fudge artesanal.', price: 16, time: '5 min' },
        { id: `${p.id}-s5`, cat: 'Pastelería Fina', name: 'Pie de Limón Clásico Merengue Suizo', desc: 'Base crocante de galleta con crema cítrica sedosa y merengue dorado.', price: 15, time: '5 min' },
        { id: `${p.id}-s6`, cat: 'Bebidas Frías', name: 'Jugo Natural de Frutas Mixtas 500ml', desc: 'Frutas frescas recién prensadas al instante sin agua ni azúcar añadida.', price: 14, time: '8 min' }
      ];
    }
    if (nameLow.includes('parrill') || nameLow.includes('carn') || nameLow.includes('ribs') || nameLow.includes('costill') || nameLow.includes('grill') || nameLow.includes('steak')) {
      return [
        { id: `${p.id}-s1`, cat: 'Cortes & Ribs', name: 'Costillar BBQ Glaseado con Papas Nativas', desc: 'Ahumado a baja temperatura con leña frutal y terminado al carbón.', price: 54, time: '20 min' },
        { id: `${p.id}-s2`, cat: 'Cortes a la Parrilla', name: 'Bife Ancho Premium 350g con Papas Fritas', desc: 'Corte marmoleado asado a término de su elección con mantequilla de romero.', price: 62, time: '20 min' },
        { id: `${p.id}-s3`, cat: 'Piqueos Parrilleros', name: 'Ronda de Piqueos Parrilleros (Anticuchos & Alitas)', desc: 'Anticuchos de corazón carretillero, alitas crocantes BBQ y papas doradas.', price: 46, time: '18 min' },
        { id: `${p.id}-s4`, cat: 'Cortes a la Parrilla', name: 'Parrilla Familiar para Compartir (3 a 4 personas)', desc: 'Bife, chuleta de cerdo, pollo parrillero, chorizo artesanal y ensalada.', price: 95, time: '25 min' },
        { id: `${p.id}-s5`, cat: 'Entradas', name: 'Tequeños Rellenos de Lomo Saltado con Guacamole', desc: '6 tequeños crocantes rellenos de jugoso lomo fino salteado.', price: 24, time: '12 min' },
        { id: `${p.id}-s6`, cat: 'Bebidas', name: 'Jarra de Chicha de la Casa 1.5L', desc: 'Elaboración tradicional con frutas aromáticas y toques de canela.', price: 18, time: '5 min' }
      ];
    }
    // Marine & Criollo Default
    return [
      { id: `${p.id}-s1`, cat: 'Ceviches del Día', name: `Ceviche Clásico Carretillero (${p.name})`, desc: 'Pesca fresca del día seleccionada a primera hora, limón norteño, camote y canchita.', price: 38, time: '15 min' },
      { id: `${p.id}-s2`, cat: 'Mariscos al Wok', name: 'Arroz con Mariscos al Wok Tradicional', desc: 'Arroz graneado con langostinos, calamar y pulpo en salsa madre criolla y culantro.', price: 39, time: '18 min' },
      { id: `${p.id}-s3`, cat: 'Frituras Crocantes', name: 'Chicharrón de Calamar & Pescado con Tártara', desc: 'Trozos dorados y crujientes acompañados de yuca frita y sarza criolla.', price: 36, time: '15 min' },
      { id: `${p.id}-s4`, cat: 'Combos & Duplas', name: 'Dúo Festival: Ceviche + Arroz con Mariscos', desc: 'La combinación más pedida de nuestro salón para almorzar en pareja.', price: 49, time: '20 min' },
      { id: `${p.id}-s5`, cat: 'Entradas Marinas', name: 'Copa de Leche de Tigre Poderosa con Chicharrón', desc: 'Concentrado cítrico aromático con tropezones de pescado y canchita chulpi.', price: 22, time: '10 min' },
      { id: `${p.id}-s6`, cat: 'Criollos de la Casa', name: 'Lomo Saltado Jugoso en Wok al Carbón', desc: 'Lomo fino flambeado con cebolla roja, ají amarillo y tomate sobre papas amarillas.', price: 42, time: '18 min' }
    ];
  }

  // 2. Veterinary
  if (rubroLow.includes('veterin') || nameLow.includes('pet') || nameLow.includes('vet')) {
    return [
      { id: `${p.id}-s1`, cat: 'Medicina Clínica', name: `Consulta Médica Veterinaria General (${p.name})`, desc: 'Chequeo clínico completo de signos vitales, control de peso, oídos, dientes y piel.', price: 35, time: '30 min' },
      { id: `${p.id}-s2`, cat: 'Inmunidad & Vacunas', name: 'Protocolo Anual Séxtuple Canina / Triple Felina', desc: 'Biológicos originales con cadena de frío garantizada y carnet oficial.', price: 55, time: '20 min' },
      { id: `${p.id}-s3`, cat: 'Grooming & Baños', name: 'Baño Medicado Hipoalergénico con Deslanado Spa', desc: 'Agua temperada, shampoo de avena natural, corte de uñas y limpieza ótica sin sedación.', price: 40, time: '60 min' },
      { id: `${p.id}-s4`, cat: 'Odontología Vet', name: 'Profilaxis Dental con Ultrasonido', desc: 'Limpieza ultrasónica de sarro dental para prevenir gingivitis y mal aliento.', price: 90, time: '45 min' },
      { id: `${p.id}-s5`, cat: 'Diagnóstico por Imágenes', name: 'Ecografía Abdominal Preventiva', desc: 'Evaluación rápida de órganos internos con informe médico para el tutor.', price: 75, time: '30 min' },
      { id: `${p.id}-s6`, cat: 'Farmacia & Parásitos', name: 'Desparasitación Interna & Antipulgas de Larga Duración', desc: 'Dosis en tableta palatable segura contra pulgas, garrapatas y ácaros.', price: 45, time: '15 min' }
    ];
  }

  // 3. Clinic (Dental & Podología)
  if (rubroLow.includes('dental') || rubroLow.includes('odontol') || rubroLow.includes('podol') || rubroLow.includes('clínica') || rubroLow.includes('clinica') || rubroLow.includes('terapia') || nameLow.includes('podól') || nameLow.includes('dental') || nameLow.includes('odont')) {
    const isPodol = rubroLow.includes('podol') || nameLow.includes('podól');
    if (isPodol) {
      return [
        { id: `${p.id}-s1`, cat: 'Quiropodia Clínica', name: `Quiropodia Integral Médica (${p.name})`, desc: 'Corte anatómico de uñas, deslaminado de hiperqueratosis (callosidades), helomas y pulido.', price: 60, time: '45 min' },
        { id: `${p.id}-s2`, cat: 'Tratamientos Especiales', name: 'Tratamiento de Onicocriptosis (Uñero sin dolor)', desc: 'Espiculotomía indolora y desinfección antiséptica para alivio inmediato.', price: 70, time: '35 min' },
        { id: `${p.id}-s3`, cat: 'Terapia Láser', name: 'Sesión Láser de Onicomicosis (Hongos en Uñas)', desc: 'Tratamiento fototérmico seguro sin efectos secundarios en hígado.', price: 90, time: '30 min' },
        { id: `${p.id}-s4`, cat: 'Spa Podológico', name: 'Exfoliación con Sales Minerales e Hidratación con Urea', desc: 'Masaje podológico descontracturante para reactivar la circulación de los pies.', price: 50, time: '40 min' },
        { id: `${p.id}-s5`, cat: 'Biomecánica', name: 'Evaluación Biomecánica de Pisada & Plantillas', desc: 'Estudio digital del apoyo plantar para corregir postura y dolores lumbares.', price: 140, time: '45 min' },
        { id: `${p.id}-s6`, cat: 'Pie de Riesgo', name: 'Atención Profiláctica de Pie Diabético', desc: 'Cuidado especializado con instrumental Clase B para prevenir lesiones.', price: 80, time: '50 min' }
      ];
    }
    // Dental clinic
    return [
      { id: `${p.id}-s1`, cat: 'Higiene & Prevención', name: `Limpieza Dental Ultrasónica & Profilaxis (${p.name})`, desc: 'Eliminación completa de sarro subgingival con ultrasonido y pulido con pasta fluorada.', price: 80, time: '40 min' },
      { id: `${p.id}-s2`, cat: 'Estética Dental', name: 'Blanqueamiento Dental LED en 1 Sesión (45 min)', desc: 'Aclarado de hasta 4 tonos sin dañar el esmalte ni generar sensibilidad excesiva.', price: 250, time: '45 min' },
      { id: `${p.id}-s3`, cat: 'Restauración', name: 'Curación Estética con Resina de Alta Densidad 3M', desc: 'Eliminación de caries y restauración con fotocurado idéntica al color natural del diente.', price: 70, time: '30 min' },
      { id: `${p.id}-s4`, cat: 'Ortodoncia', name: 'Paquete Inicial Brackets Estéticos / Metálicos', desc: 'Instalación de brackets, tubos y arcos con controles mensuales programados.', price: 150, time: '60 min' },
      { id: `${p.id}-s5`, cat: 'Cirugía Oral', name: 'Extracción Simple / Tercera Molar sin Dolor', desc: 'Técnica anestésica localizada y sutura reabsorbible para rápida cicatrización.', price: 120, time: '45 min' },
      { id: `${p.id}-s6`, cat: 'Rehabilitación', name: 'Corona Dental en Porcelana Pura / Zirconio', desc: 'Pieza biocompatible de alta resistencia estética para piezas fracturadas o endodonciadas.', price: 380, time: '60 min' }
    ];
  }

  // 4. Salon / Beauty / Spa / Barber
  if (nameLow.includes('barber') || nameLow.includes('barbería') || nameLow.includes('barberia')) {
    return [
      { id: `${p.id}-s1`, cat: 'Corte & Estilo', name: `Corte Master Fade & Diseño Urbano (${p.name})`, desc: 'Degradado a navaja o shaver con asesoría visagista y peinado profesional.', price: 35, time: '45 min' },
      { id: `${p.id}-s2`, cat: 'Barba Tradicional', name: 'Ritual de Barba con Toalla Caliente & Aceites', desc: 'Afeitado al ras o perfilado con vaporizador de ozono y bálsamo hidratante.', price: 30, time: '35 min' },
      { id: `${p.id}-s3`, cat: 'Combos Barber', name: 'Combo Completo: Corte Fade + Arreglo de Barba', desc: 'El servicio más pedido para caballeros con lavado capilar refrescante.', price: 55, time: '60 min' },
      { id: `${p.id}-s4`, cat: 'Cuidado Facial', name: 'Limpieza Facial con Mascarilla Negra Peel-Off', desc: 'Extracción de puntos negros, exfoliación y crema descongestiva.', price: 30, time: '30 min' },
      { id: `${p.id}-s5`, cat: 'Colorimetría', name: 'Camuflaje de Canas o Tinte Platino', desc: 'Cobertura natural de canas o decoloración para efecto platinado moderno.', price: 60, time: '60 min' },
      { id: `${p.id}-s6`, cat: 'Spa Capilar', name: 'Lavado Anticaída & Masaje Craneal Relajante', desc: 'Shampoo con biotina y tónico mentolado que activa los folículos capilares.', price: 25, time: '20 min' }
    ];
  }

  if (nameLow.includes('nail') || nameLow.includes('uñas') || nameLow.includes('unas')) {
    return [
      { id: `${p.id}-s1`, cat: 'Manicura Rusa', name: `Manicura Rusa Combinada & Nivelación (${p.name})`, desc: 'Limpieza profunda de cutícula con torno y base rubber para uñas impecables.', price: 45, time: '60 min' },
      { id: `${p.id}-s2`, cat: 'Esmaltado en Gel', name: 'Esmaltado Semipermanente con Diseño Minimalista', desc: 'Gelish de secado UV/LED de larga duración (más de 21 días de brillo intacto).', price: 40, time: '50 min' },
      { id: `${p.id}-s3`, cat: 'Extensiones', name: 'Uñas Esculpidas en Polygel / Acrílico', desc: 'Largo natural o stilettos con alta resistencia y acabado delgado ultra natural.', price: 85, time: '120 min' },
      { id: `${p.id}-s4`, cat: 'Pedicura Spa', name: 'Pedicura Spa con Baño de Sales y Exfoliación', desc: 'Retiro de asperezas, hidratación de talones y esmaltado en gel.', price: 55, time: '60 min' },
      { id: `${p.id}-s5`, cat: 'Nail Art', name: 'Nail Art de Tendencia & Cristales Swarovski', desc: 'Líneas a mano alzada, efecto cromo o incrustaciones de pedrería.', price: 25, time: '30 min' },
      { id: `${p.id}-s6`, cat: 'Retiro Seguro', name: 'Retiro Cuidadoso de Gel / Acrílico sin Dañar la Uña', desc: 'Retiro profesional con aceite de cutícula e hidratación intensiva.', price: 20, time: '25 min' }
    ];
  }

  // General Hair Salon & Urban Spa
  return [
    { id: `${p.id}-s1`, cat: 'Color & Mechas', name: `Balayage VIP Iluminador + Matizado (${p.name})`, desc: 'Técnica gradual de luz sin efecto raíz, con plex protector y baño de brillo.', price: 180, time: '180 min' },
    { id: `${p.id}-s2`, cat: 'Alisados & Lacio', name: 'Alisado Orgánico Termoactivo 100% Cero Formol', desc: 'Fórmula enriquecida con aminoácidos y queratina pura para brillo espejo hasta 4 meses.', price: 120, time: '120 min' },
    { id: `${p.id}-s3`, cat: 'Terapia Capilar', name: 'Botox Capilar Reparador & Sellador de Puntas', desc: 'Relleno de fibra capilar con manteca de cacao y ácido hialurónico contra el frizz.', price: 90, time: '60 min' },
    { id: `${p.id}-s4`, cat: 'Corte & Cepillado', name: 'Corte de Autor según Visagismo + Cepillado Glam', desc: 'Diagnóstico de forma de rostro, corte personalizado y acabado de pasarela.', price: 45, time: '45 min' },
    { id: `${p.id}-s5`, cat: 'Nails & Manicure', name: 'Manicura Semipermanente & Exfoliación Spa', desc: 'Esmaltado en gel duradero con sales hidratantes y masaje de manos.', price: 40, time: '50 min' },
    { id: `${p.id}-s6`, cat: 'Maquillaje & Ojos', name: 'Lifting de Pestañas con Tinturado & Keratina', desc: 'Curvatura natural duradera para abrir la mirada sin necesidad de rizador.', price: 65, time: '45 min' }
  ];
}

function applyPalette(p: Prospect) {
  const palette = getOrGeneratePalette(p);
  document.documentElement.style.setProperty('--bg-main', palette.bg_page);
  document.documentElement.style.setProperty('--bg-panel', palette.bg_panel);
  document.documentElement.style.setProperty('--bg-alt', palette.bg_tint);
  document.documentElement.style.setProperty('--ink', palette.ink);
  document.documentElement.style.setProperty('--accent', palette.accent);
  document.documentElement.style.setProperty('--accent-dark', palette.accent_dark);
  document.documentElement.style.setProperty('--border-hair', palette.line);
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
  renderBrandLogo('rest-nav-logo', p, true);
  renderBrandLogo('rest-footer-logo', p, true);

  const footerName = document.getElementById('rest-footer-name');
  if (footerName) footerName.textContent = p.name;

  updateSocialPill('rest-social-pill', 'rest-social-text', p);

  const nameLow = p.name.toLowerCase();
  const rubroLow = p.rubro.toLowerCase();
  const isMar = rubroLow.includes('marina') || nameLow.includes('cevich') || nameLow.includes('pez') || nameLow.includes('mar');
  const isParrilla = nameLow.includes('costill') || nameLow.includes('parrill') || nameLow.includes('carn') || nameLow.includes('grill') || nameLow.includes('steak') || nameLow.includes('rejas');
  const isPolleria = nameLow.includes('poll') || nameLow.includes('brasa');
  const isChifa = nameLow.includes('chifa') || nameLow.includes('wok') || nameLow.includes('dragon');
  const isCafe = nameLow.includes('caf') || nameLow.includes('pan') || nameLow.includes('pasteler');

  const heroKicker = document.getElementById('rest-hero-kicker');
  if (heroKicker) {
    heroKicker.textContent = p.baKicker || (
      isMar ? `PESCA FRESCA DEL DÍA EN ${p.zona.toUpperCase()}` :
      isParrilla ? `FUEGO, BRASA Y PARRILLA EN ${p.zona.toUpperCase()}` :
      isPolleria ? `EL VERDADERO POLLO A LA BRASA EN ${p.zona.toUpperCase()}` :
      isChifa ? `SABORES TRADICIONALES AL WOK EN ${p.zona.toUpperCase()}` :
      isCafe ? `CAFETERÍA Y BRUNCH DE ESPECIALIDAD EN ${p.zona.toUpperCase()}` :
      `COCINA Y SAZÓN EN ${p.zona.toUpperCase()}`
    );
  }

  const heroTitle = document.getElementById('rest-hero-title');
  if (heroTitle) {
    heroTitle.textContent = isMar ? 'El verdadero sabor del mar en' :
      isParrilla ? 'El auténtico fuego y sazón de' :
      isPolleria ? 'La mejor brasa peruana en' :
      isChifa ? 'La tradición y fuego al wok en' :
      isCafe ? 'El mejor aroma y repostería en' :
      'El verdadero sabor de';
  }

  const heroSub = document.getElementById('rest-hero-sub');
  if (heroSub) heroSub.textContent = `${p.name}.`;

  const heroLema = document.getElementById('rest-hero-lema');
  if (heroLema) {
    heroLema.textContent = p.lema || (
      isMar ? `«¡Preparación al instante y al gusto del cliente! Frescura marina insuperable en ${p.zona}.»` :
      isParrilla ? `«¡Cortes tiernos a la brasa, costillitas bien glaseadas y piqueos generosos para compartir en ${p.zona}!»` :
      isPolleria ? `«¡Pollo crocante por fuera y jugoso por dentro, con papas nativas doradas y cremas caseras en ${p.zona}!»` :
      isChifa ? `«¡Ahumado de wok auténtico con insumos frescos y porciones bien despachadas en ${p.zona}!»` :
      `«¡Sabor tradicional, insumos seleccionados a primera hora y calidez familiar en ${p.zona}!»`
    );
  }

  const heroLead = document.getElementById('rest-hero-lead');
  if (heroLead) {
    heroLead.textContent = p.lead || `Insumos frescos del día seleccionados a primera hora, cocciones artesanales al momento y porciones generosas servidas en ${p.direccion}. Revisa nuestra carta de precios y pide directo por WhatsApp.`;
  }

  const statRating = document.getElementById('rest-stat-rating');
  if (statRating) statRating.textContent = p.estrellas;

  const statReviews = document.getElementById('rest-stat-reviews');
  if (statReviews) statReviews.textContent = `${p.resenas} clientes`;

  const statZone = document.getElementById('rest-stat-zone');
  if (statZone) statZone.textContent = p.zona;

  const heroPhoto = document.getElementById('rest-hero-photo') as HTMLImageElement | null;
  if (heroPhoto) {
    heroPhoto.src = p.heroPhoto || (
      isMar ? 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=1200&q=85' :
      isParrilla ? 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85' :
      isPolleria ? 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=1200&q=85' :
      isChifa ? 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=85' :
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85'
    );
  }

  const featLabel = document.getElementById('rest-featured-label');
  if (featLabel) featLabel.textContent = p.featuredLabel || 'PLATO ESTRELLA';

  const featPrice = document.getElementById('rest-featured-price');
  if (featPrice) featPrice.textContent = p.featuredPrice || (isMar ? 'S/ 38' : isParrilla ? 'S/ 58' : isPolleria ? 'S/ 42' : 'S/ 35');

  const featTitle = document.getElementById('rest-featured-title');
  if (featTitle) {
    featTitle.textContent = p.featuredTitle || (
      isMar ? 'Ceviche Clásico Carretillero' :
      isParrilla ? 'Costillar BBQ Glaseado Especial' :
      isPolleria ? '1/2 Pollo Brasa + Papas Nativas' :
      isChifa ? 'Arroz Chaufa Especial al Wok' :
      'Especialidad de la Casa'
    );
  }

  const featSub = document.getElementById('rest-featured-sub');
  if (featSub) {
    featSub.textContent = p.featuredSub || (
      isMar ? 'Pesca fresca del día, camote glaseado, choclo desgranado y canchita chulpi.' :
      isParrilla ? 'Ahumado a fuego lento con salsa BBQ de autor y papas doradas.' :
      'Preparado al instante con ingredientes seleccionados y sazón tradicional.'
    );
  }

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

  // --- QUIÉNES SOMOS DINÁMICO (Restaurante) ---
  const aboutKicker = document.getElementById('rest-about-kicker');
  const aboutTitle = document.getElementById('rest-about-title');
  const aboutP1 = document.getElementById('rest-about-p1');
  const aboutP2 = document.getElementById('rest-about-p2');
  const aboutQuote = document.getElementById('rest-about-quote');
  const aboutQuoteAuthor = document.getElementById('rest-about-quote-author');

  if (aboutKicker) aboutKicker.textContent = `HISTORIA Y SAZÓN EN ${p.zona.toUpperCase()}`;
  if (aboutTitle) aboutTitle.textContent = `Quiénes Somos: La Pasión Culinaria de ${p.name}`;
  if (aboutP1) {
    aboutP1.innerHTML = `Nacimos en ${p.zona} con una promesa inquebrantable: <strong>honrar la verdadera sazón gastronómica de ${p.name}</strong>. Cada mañana seleccionamos personalmente los insumos más frescos del mercado, garantizando platos con textura firme, aromas cautivadores y cero atajos industriales.`;
  }
  if (aboutP2) {
    aboutP2.textContent = `En nuestra cocina no usamos saborizantes artificiales: cada marinada se elabora de manera artesanal, los fondos se cocinan a fuego lento durante horas y cada plato se sirve humeante y bien despachado en ${p.direccion}.`;
  }
  if (aboutQuote) {
    aboutQuote.textContent = `«Cocinar en ${p.name} no es un trabajo, es el orgullo de compartir lo mejor de nuestra sazón con cada familia de ${p.zona}.»`;
  }
  if (aboutQuoteAuthor) aboutQuoteAuthor.textContent = `— Equipo de Cocina de ${p.name}`;

  // --- COMBOS DINÁMICOS (Restaurante) ---
  const combosContainer = document.getElementById('rest-combos-container');
  if (combosContainer) {
    let combo1 = {
      badge: 'MÁS PEDIDO',
      guests: 'Para 2 Personas',
      title: isMar ? 'Dúo Marino Festival' : isParrilla ? 'Dúo Costillas & Alitas BBQ' : isPolleria ? 'Dúo Brasa + Mostrito' : isChifa ? 'Dúo Chaufa & Wantanes' : 'Dúo Sazón Criolla',
      oldPrice: 'S/ 68',
      price: 52,
      desc: isMar ? 'Ceviche de pescado fresco al limón norteño + Arroz con mariscos ahumado al wok + Chicharrón crocante.' : isParrilla ? 'Costillar BBQ glaseado + Alitas crujientes con papas fritas y salsas.' : 'Generosa combinación para dos comensales con guarnición completa.',
      perk: 'Incluye 2 vasos de chicha morada artesanal',
      img: isMar ? 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=85' : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=85'
    };

    let combo2 = {
      badge: 'BANQUETE FAMILIAR',
      guests: 'Para 3 a 4 Personas',
      title: isMar ? 'Banquete Marino de la Casa' : isParrilla ? 'Banquete Parrillero Costillero' : isPolleria ? 'Banquete 1 Pollo Entero + Tequeños' : isChifa ? 'Banquete Dragón Familiar' : 'Banquete Familiar Completo',
      oldPrice: 'S/ 115',
      price: 89,
      desc: isMar ? 'Fuente de ceviche mixto, arroz con mariscos especial, jalea crocante y rondas de leche de tigre.' : isParrilla ? 'Costillitas BBQ familiares, anticuchos, papas doradas, ensalada parrillera y cremas.' : 'Banquete abundante diseñado para celebrar en familia sin límites.',
      perk: 'Incluye 1 Jarra de Chicha Morada 1.5L + salsas',
      img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=85'
    };

    let combo3 = {
      badge: 'RONDA PARA PICAR',
      guests: 'Para Picar & Brindar',
      title: isMar ? 'Trilogía Caliente al Wok' : isParrilla ? 'Ronda Parrillera & Chilcanos' : isPolleria ? 'Piqueo Broaster & Tequeños' : isChifa ? 'Ronda Wantanes & Wantanes de Lomo' : 'Ronda Piqueos de Salón',
      oldPrice: 'S/ 72',
      price: 58,
      desc: isMar ? 'Arroz chaufa de mariscos + Wantanes rellenos de cangrejo + Chicharrón con tártara casera.' : isParrilla ? 'Alitas crocantes BBQ, tequeños de lomo y papas rústicas con queso fundido.' : 'Piqueo mixto crujiente ideal para acompañar tus bebidas favoritas.',
      perk: '✦ 2 Chilcanos o refrescos de cortesía web',
      img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=85'
    };

    combosContainer.innerHTML = [combo1, combo2, combo3].map((c, i) => `
      <div class="bg-stone-900 border-2 border-stone-800 hover:border-amber-500 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-xl">
        <div class="relative aspect-[16/10] overflow-hidden">
          <img src="${c.img}" alt="${c.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <div class="absolute top-3 left-3 bg-red-600 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded shadow flex items-center gap-1.5">
            <span>${c.badge}</span>
          </div>
          <div class="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-amber-300 font-bold border border-amber-500/30">
            ${c.guests}
          </div>
        </div>
        <div class="p-6 space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-baseline justify-between gap-2">
              <h3 class="font-serif text-xl font-bold text-white">${c.title}</h3>
              <div class="text-right">
                <span class="text-xs text-stone-500 line-through">${c.oldPrice}</span>
                <span class="block font-mono text-lg font-extrabold text-amber-400">S/ ${c.price}</span>
              </div>
            </div>
            <p class="text-xs text-stone-400 mt-2">${c.desc}</p>
            <div class="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
              <span>✓</span> ${c.perk}
            </div>
          </div>
          <button 
            type="button" 
            data-combo-id="combo-${p.id}-${i+1}"
            data-combo-name="${c.title}"
            data-combo-price="${c.price}"
            class="btn-add-combo w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>+ Agregar Combo a mi Orden</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  // --- PIZARRA DEL DÍA DINÁMICA (Restaurante) ---
  const pizarraContainer = document.getElementById('rest-pizarra-container');
  if (pizarraContainer) {
    let p1 = {
      tag: isMar ? 'PESCA DE HOY: CORVINA' : isParrilla ? 'CORTE DEL CHEF: ANGUS 350G' : isPolleria ? 'PECHUGA RELLENA A LA LEÑA' : 'ESPECIAL DEL CHEF',
      price: isMar ? 42 : isParrilla ? 56 : 38,
      name: isMar ? 'Ceviche Puro de Corvina Fresca' : isParrilla ? 'Bife de Chorizo Angus al Romero' : 'Especialidad Fresca del Día',
      desc: isMar ? 'Corte grueso en cubos, limón recién exprimido y crema de ají limo del norte.' : 'Asado a la parrilla con mantequilla artesanal y papas nativas.',
      spicy: 'Picante: Medio',
      portions: 'Quedan 7 porciones'
    };

    let p2 = {
      tag: isMar ? 'AL WOK AHUMADO' : isParrilla ? 'GLASEADO AL CARBÓN' : isPolleria ? 'CRISPY CROCANTE' : 'AL WOK VIVO',
      price: isMar ? 39 : isParrilla ? 48 : 34,
      name: isMar ? 'Tacú Tacú con Mariscos Selectos' : isParrilla ? 'Costillitas BBQ Miel y Mostaza' : 'Salteado Especial al Fogón',
      desc: isMar ? 'Sábana crocante de frejol canario bañada en salsa cremosa de mariscos.' : 'Glaseado agridulce con toques de manzana y especias de la casa.',
      spicy: 'Picante: Suave',
      portions: 'Quedan 5 porciones'
    };

    let p3 = {
      tag: isMar ? 'CLÁSICO NORTEÑO' : isParrilla ? 'BROCHETAS DE LA CASA' : isPolleria ? 'PICANTE CARRETILLERO' : 'TRADICIÓN PERUANA',
      price: isMar ? 44 : isParrilla ? 42 : 36,
      name: isMar ? 'Arroz con Pato a la Chiclayana' : isParrilla ? 'Anticuchos de Lomo con Papas Rústicas' : 'Chaufa Criollo Especial',
      desc: isMar ? 'Pato tierno macerado en chicha de jora, cerveza negra y zapallito loche.' : 'Corazón tierno marinado en ají panca tradicional con choclo tierno.',
      spicy: 'Picante: Al gusto',
      portions: 'Quedan 9 porciones'
    };

    pizarraContainer.innerHTML = [p1, p2, p3].map((plato, i) => `
      <div class="p-5 rounded-xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/50 transition flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start">
            <span class="text-amber-400 font-bold text-xs uppercase">${plato.tag}</span>
            <span class="text-white font-bold text-base">S/ ${plato.price}</span>
          </div>
          <h3 class="font-serif font-bold text-lg text-stone-100 mt-2">${plato.name}</h3>
          <p class="text-xs text-stone-400 font-sans mt-1">${plato.desc}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-stone-800">
          <div class="flex items-center justify-between text-[11px] text-stone-500 mb-3">
            <span>${plato.spicy}</span>
            <span class="text-amber-400 font-bold">${plato.portions}</span>
          </div>
          <button 
            type="button" 
            data-combo-id="pizarra-${p.id}-${i+1}"
            data-combo-name="${plato.name} (Pizarra)"
            data-combo-price="${plato.price}"
            class="btn-add-combo w-full py-2.5 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-amber-300 font-mono text-[11px] uppercase tracking-wider rounded transition cursor-pointer border border-amber-500/30 font-semibold flex items-center justify-center gap-1.5"
          >
            <span>+ Pedir Especialidad (S/ ${plato.price})</span>
          </button>
        </div>
      </div>
    `).join('');
  }
}

function updateVeterinaryView(p: Prospect) {
  renderBrandLogo('vet-nav-logo', p, false);
  renderBrandLogo('vet-footer-logo', p, false);

  const topCall = document.getElementById('vet-top-call') as HTMLAnchorElement | null;
  if (topCall) topCall.href = `tel:${p.tel.replace(/[^0-9+]/g, '')}`;

  const topPhone = document.getElementById('vet-top-phone');
  if (topPhone) topPhone.textContent = p.tel;

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
    heroLema.textContent = p.lema || `«Médicos Veterinarios colegiados, comprometidos en velar por el bienestar de tu engreído con mucho amor en ${p.zona}.»`;
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

  const urgentCallBtn = document.getElementById('vet-urgent-call-btn') as HTMLAnchorElement | null;
  if (urgentCallBtn) urgentCallBtn.href = `tel:${p.tel.replace(/[^0-9+]/g, '')}`;

  const floatingWA = document.getElementById('vet-floating-wa') as HTMLAnchorElement | null;
  if (floatingWA) {
    const waMsg = encodeURIComponent(`¡Hola ${p.name}! Deseo consultar disponibilidad para atender a mi mascota en su sede de ${p.zona}.`);
    floatingWA.href = `https://wa.me/${p.wa}?text=${waMsg}`;
  }

  // --- QUIÉNES SOMOS DINÁMICO (Veterinaria) ---
  const aboutKicker = document.getElementById('vet-about-kicker');
  const aboutTitle = document.getElementById('vet-about-title');
  const aboutP1 = document.getElementById('vet-about-p1');
  const aboutP2 = document.getElementById('vet-about-p2');

  if (aboutKicker) aboutKicker.textContent = `CIENCIA CLÍNICA & AMOR ANIMAL EN ${p.zona.toUpperCase()}`;
  if (aboutTitle) aboutTitle.textContent = `Quiénes Somos: La Familia Médica de ${p.name}`;
  if (aboutP1) {
    aboutP1.innerHTML = `Somos un equipo de <strong>Médicos Veterinarios colegiados dedicados a ${p.zona}</strong>. Entendemos que tu mascota no es solo un paciente: en ${p.name} es un integrante irremplazable de tu hogar que merece el más alto estándar de atención médica y compasión.`;
  }
  if (aboutP2) {
    aboutP2.textContent = `Trabajamos bajo el estándar internacional de Manejo Sin Estrés («Fear-Free») en ${p.direccion}: jamás recurrimos a la sedación para procedimientos estéticos o baños, y procuramos un ambiente tranquilo, sin olores intimidantes y con recompensas positivas en cada etapa de la consulta.`;
  }

  // --- PLANES DE SALUD DINÁMICOS (Veterinaria) ---
  const plansContainer = document.getElementById('vet-plans-container');
  if (plansContainer) {
    plansContainer.innerHTML = `
      <div class="rounded-3xl border-2 border-teal-200 bg-teal-50/40 p-6 space-y-4 hover:border-teal-500 transition shadow-lg flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex justify-between items-start">
            <span class="bg-teal-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">0 A 12 MESES</span>
            <span class="font-mono text-xl font-extrabold text-teal-950">S/ 65</span>
          </div>
          <h3 class="font-serif text-2xl font-bold text-stone-900">Plan Inmunidad Cachorro / Kitten</h3>
          <p class="text-xs text-stone-600">Esquema primario de vacunas esenciales en ${p.name} con carnet oficial, control de peso y desparasitación interna.</p>
          <ul class="text-xs font-mono text-stone-700 space-y-1.5 pt-2">
            <li class="flex items-center gap-1.5"><span class="text-teal-600 font-bold">✓</span> Vacuna Séxtuple / Triple felina</li>
            <li class="flex items-center gap-1.5"><span class="text-teal-600 font-bold">✓</span> Dosis antiparasitaria interna</li>
            <li class="flex items-center gap-1.5"><span class="text-teal-600 font-bold">✓</span> Carnet oficial y guía nutricional</li>
          </ul>
        </div>
        <button type="button" data-vet-plan-id="plan-${p.id}-cachorro" data-vet-plan-name="Plan Inmunidad Cachorro (${p.name})" data-vet-plan-price="65" class="btn-add-vet-plan w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-mono text-xs uppercase font-bold rounded-xl transition cursor-pointer shadow-md">
          + Agendar Plan Cachorro
        </button>
      </div>

      <div class="rounded-3xl border-2 border-emerald-300 bg-emerald-50/50 p-6 space-y-4 hover:border-emerald-500 transition shadow-xl flex flex-col justify-between relative">
        <div class="absolute -top-3.5 right-6 bg-emerald-600 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
          ⭐ RECOMENDADO ANUAL
        </div>
        <div class="space-y-3">
          <div class="flex justify-between items-start">
            <span class="bg-emerald-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">1 A 7 AÑOS</span>
            <span class="font-mono text-xl font-extrabold text-emerald-950">S/ 85</span>
          </div>
          <h3 class="font-serif text-2xl font-bold text-stone-900">Plan Bienestar Adulto Anual</h3>
          <p class="text-xs text-stone-600">Refuerzo anual antirrábico y séxtuple, chequeo dental y aplicación de pipeta antipulgas de larga duración.</p>
          <ul class="text-xs font-mono text-stone-700 space-y-1.5 pt-2">
            <li class="flex items-center gap-1.5"><span class="text-teal-600 font-bold">✓</span> Refuerzo de vacunación anual</li>
            <li class="flex items-center gap-1.5"><span class="text-teal-600 font-bold">✓</span> Evaluación odontológica y ótica</li>
            <li class="flex items-center gap-1.5"><span class="text-teal-600 font-bold">✓</span> Pipeta antipulgas / garrapatas</li>
          </ul>
        </div>
        <button type="button" data-vet-plan-id="plan-${p.id}-adulto" data-vet-plan-name="Plan Bienestar Adulto (${p.name})" data-vet-plan-price="85" class="btn-add-vet-plan w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs uppercase font-bold rounded-xl transition cursor-pointer shadow-md">
          + Agendar Plan Adulto
        </button>
      </div>

      <div class="rounded-3xl border-2 border-teal-200 bg-teal-50/40 p-6 space-y-4 hover:border-teal-500 transition shadow-lg flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex justify-between items-start">
            <span class="bg-teal-800 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">8+ AÑOS</span>
            <span class="font-mono text-xl font-extrabold text-teal-950">S/ 120</span>
          </div>
          <h3 class="font-serif text-2xl font-bold text-stone-900">Plan Senior &amp; Longevidad Geriátrica</h3>
          <p class="text-xs text-stone-600">Chequeo geriátrico integral para detectar a tiempo artrosis o insuficiencia renal, con perfil de sangre y ecografía rápida.</p>
          <ul class="text-xs font-mono text-stone-700 space-y-1.5 pt-2">
            <li class="flex items-center gap-1.5"><span class="text-teal-600 font-bold">✓</span> Chequeo articular y de movilidad</li>
            <li class="flex items-center gap-1.5"><span class="text-teal-600 font-bold">✓</span> Descarte renal y hepático</li>
            <li class="flex items-center gap-1.5"><span class="text-teal-600 font-bold">✓</span> Suplemento vitamínico geriátrico</li>
          </ul>
        </div>
        <button type="button" data-vet-plan-id="plan-${p.id}-senior" data-vet-plan-name="Plan Senior Geriátrico (${p.name})" data-vet-plan-price="120" class="btn-add-vet-plan w-full py-3 bg-teal-800 hover:bg-teal-900 text-white font-mono text-xs uppercase font-bold rounded-xl transition cursor-pointer shadow-md">
          + Agendar Plan Senior
        </button>
      </div>
    `;
  }
}

function updateSalonView(p: Prospect) {
  renderBrandLogo('salon-nav-logo', p, true);
  renderBrandLogo('salon-footer-logo', p, true);

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
    heroLema.textContent = p.lema || `«No solo cambiamos tu cabello, transformamos tu actitud. El look de tus sueños está a solo una cita de distancia en ${p.zona}.»`;
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

  // --- QUIÉNES SOMOS DINÁMICO (Salón) ---
  const aboutKicker = document.getElementById('salon-about-kicker');
  const aboutTitle = document.getElementById('salon-about-title');
  const aboutP1 = document.getElementById('salon-about-p1');
  const aboutP2 = document.getElementById('salon-about-p2');

  if (aboutKicker) aboutKicker.textContent = `EXPERIENCIA ATELIER EN ${p.zona.toUpperCase()}`;
  if (aboutTitle) aboutTitle.textContent = `Quiénes Somos: El Arte y Estilo de ${p.name}`;
  if (aboutP1) {
    aboutP1.innerHTML = `En ${p.name} (${p.zona}) creemos firmemente que <strong>la verdadera belleza jamás debe comprometer la salud de tu fibra capilar</strong>. Ofrecemos una experiencia de atelier boutique donde cada servicio es un ritual a medida en ${p.direccion}.`;
  }
  if (aboutP2) {
    aboutP2.textContent = `Trabajamos exclusivamente con casas profesionales de renombre internacional (Kérastase, Olaplex, Wella) y pigmentos botánicos orgánicos. Cada sesión comienza con un diagnóstico de porosidad para asegurar que tu cabello conserve fuerza, sedosidad y movimiento natural.`;
  }

  // --- LOOKBOOK DINÁMICO (Salón) ---
  const lookbookContainer = document.getElementById('salon-lookbook-container');
  if (lookbookContainer) {
    const nameLow = p.name.toLowerCase();
    const isBarber = nameLow.includes('barber');
    const isNails = nameLow.includes('nail') || nameLow.includes('uñas');

    let col1 = {
      id: 'color',
      badge: isBarber ? '01 · FADE' : isNails ? '01 · RUSA' : '01 · COLOR',
      title: isBarber ? 'Master Fade & Urbano' : isNails ? 'Manicura Rusa Rápida' : 'Colorimetría & Balayage',
      desc: isBarber ? 'Degradados a navaja con diseño visagista.' : isNails ? 'Limpieza profunda de cutícula con torno y base rubber.' : 'Rubios miel, morena iluminada y babylights con plex.',
      price: isBarber ? 'Desde S/ 35' : isNails ? 'Desde S/ 45' : 'Desde S/ 180',
      img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=85'
    };

    let col2 = {
      id: 'alisados',
      badge: isBarber ? '02 · BARBA' : isNails ? '02 · POLYGEL' : '02 · TERAPIA',
      title: isBarber ? 'Ritual Barba & Toalla' : isNails ? 'Uñas Esculpidas Polygel' : 'Alisados & Botox Capilar',
      desc: isBarber ? 'Afeitado tradicional con vapor de ozono y bálsamo.' : isNails ? 'Extensiones resistentes de acabado ultra delgado.' : 'Liso espejo termoactivo, nutrición con cacao y cero formol.',
      price: isBarber ? 'Desde S/ 30' : isNails ? 'Desde S/ 85' : 'Desde S/ 110',
      img: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=700&q=85'
    };

    let col3 = {
      id: 'nails',
      badge: isBarber ? '03 · FACIAL' : isNails ? '03 · SPA' : '03 · NAILS',
      title: isBarber ? 'Limpieza Facial Black' : isNails ? 'Pedicura Spa Exfoliante' : 'Nails Studio Polygel',
      desc: isBarber ? 'Mascarilla negra purificante y descongestión de poros.' : isNails ? 'Baño de sales, retiro de durezas y esmalte gelish.' : 'Esculpidas en acrílico o polygel y esmaltado semipermanente.',
      price: isBarber ? 'Desde S/ 30' : isNails ? 'Desde S/ 55' : 'Desde S/ 45',
      img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=85'
    };

    let col4 = {
      id: 'makeup',
      badge: isBarber ? '04 · PLATINO' : isNails ? '04 · ART' : '04 · MAKEUP',
      title: isBarber ? 'Tinte & Camuflaje Canas' : isNails ? 'Nail Art Cristales' : 'Styling & Maquillaje HD',
      desc: isBarber ? 'Coloración masculina natural sin efecto mancha.' : isNails ? 'Diseños minimalistas y pedrería Swarovski.' : 'Fijación blindada a prueba de agua y pestañas pelo a pelo.',
      price: isBarber ? 'Desde S/ 60' : isNails ? 'Desde S/ 25' : 'Desde S/ 120',
      img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=85'
    };

    lookbookContainer.innerHTML = [col1, col2, col3, col4].map(c => `
      <div data-lookbook-id="${c.id}" class="btn-open-lookbook group relative rounded-2xl overflow-hidden border border-[#2d2739] hover:border-[#c5a880] transition-all duration-500 bg-[#191622] flex flex-col justify-between cursor-pointer">
        <div class="relative aspect-[3/4] overflow-hidden">
          <img src="${c.img}" alt="${c.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div class="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-[#dfcaaa] border border-[#c5a880]/30 font-bold uppercase">
            ${c.badge}
          </div>
          <div class="absolute bottom-4 left-4 right-4">
            <h3 class="font-serif text-xl font-bold text-white">${c.title}</h3>
            <p class="text-xs text-stone-300 mt-1">${c.desc}</p>
          </div>
        </div>
        <div class="p-4 border-t border-[#292333] flex items-center justify-between text-xs font-mono">
          <span class="text-[#dfcaaa]">${c.price}</span>
          <span class="text-white group-hover:text-[#dfcaaa] underline uppercase text-[11px]">Ver Técnicas →</span>
        </div>
      </div>
    `).join('');
  }
}

function updateClinicView(p: Prospect) {
  renderBrandLogo('clinic-nav-logo', p, false);
  renderBrandLogo('clinic-footer-logo', p, false);

  const topPhone = document.getElementById('clinic-top-phone');
  if (topPhone) topPhone.textContent = p.tel;

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
      ? `«Especialistas podológicas dedicadas a devolverte el bienestar y descanso en cada paso con bioseguridad rigurosa en ${p.zona}.»`
      : `«Expertos en ortodoncia, rehabilitación oral y estética dental con tecnología digital avanzada y trato humano en ${p.zona}.»`);
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
  if (heroPhoto) {
    heroPhoto.src = p.heroPhoto || (isPodol
      ? 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85'
      : 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85');
  }

  const featLabel = document.getElementById('clinic-featured-label');
  if (featLabel) featLabel.textContent = p.featuredLabel || 'TRATAMIENTO ESTRELLA';

  const featPrice = document.getElementById('clinic-featured-price');
  if (featPrice) featPrice.textContent = p.featuredPrice || (isPodol ? 'S/ 60' : 'S/ 180');

  const featTitle = document.getElementById('clinic-featured-title');
  if (featTitle) {
    featTitle.textContent = p.featuredTitle || (isPodol ? 'Quiropodia Médica Integral' : 'Limpieza Profunda Ultrasónica + Profilaxis');
  }

  const featSub = document.getElementById('clinic-featured-sub');
  if (featSub) {
    featSub.textContent = p.featuredSub || (isPodol
      ? 'Corte anatómico de uñas, deslaminado de durezas e hidratación profunda.'
      : 'Eliminación completa de sarro y pulido dental sin dolor ni sensibilidad.');
  }

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

  // --- QUIÉNES SOMOS DINÁMICO (Clínica) ---
  const aboutKicker = document.getElementById('clinic-about-kicker');
  const aboutTitle = document.getElementById('clinic-about-title');
  const aboutP1 = document.getElementById('clinic-about-p1');
  const aboutP2 = document.getElementById('clinic-about-p2');

  if (isPodol) {
    if (aboutKicker) aboutKicker.textContent = `ESPECIALISTAS PODOLÓGICAS EN ${p.zona.toUpperCase()}`;
    if (aboutTitle) aboutTitle.textContent = `Quiénes Somos: Cuidado Podológico Integral en ${p.name}`;
    if (aboutP1) {
      aboutP1.innerHTML = `En ${p.name} somos especialistas podológicos certificados dedicados a la prevención, alivio del dolor y cuidado de tus pies en ${p.zona}. Nuestro compromiso es brindar una atención cálida, 100% indolora y con bioseguridad absoluta.`;
    }
    if (aboutP2) {
      aboutP2.textContent = `Cumplimos rigurosos protocolos de esterilización con autoclave hospitalario Clase B. Cada set de instrumental sellado se abre frente a ti en ${p.direccion}, garantizando total tranquilidad en cada paso.`;
    }
  } else {
    if (aboutKicker) aboutKicker.textContent = `RESPALDO PROFESIONAL COP EN ${p.zona.toUpperCase()}`;
    if (aboutTitle) aboutTitle.textContent = `Quiénes Somos: Odontología Ética en ${p.name}`;
    if (aboutP1) {
      aboutP1.innerHTML = `Somos cirujanos dentistas colegiados y especialistas con registro nacional RNE en ${p.zona}. Nuestro compromiso es brindar una atención cálida, transparente y 100% indolora, sustentada en evidencia científica y tecnología digital.`;
    }
    if (aboutP2) {
      aboutP2.textContent = `Rechazamos los tratamientos sobreindicados o innecesarios. En cada consulta en ${p.direccion} explicamos detalladamente tu radiografía digital en pantalla, ofreciéndote un diagnóstico honesto y presupuestos claros sin sorpresas.`;
    }
  }

  // --- ESPECIALIDADES DINÁMICAS (Clínica) ---
  const specialtiesContainer = document.getElementById('clinic-specialties-container');
  if (specialtiesContainer) {
    if (isPodol) {
      specialtiesContainer.innerHTML = `
        <div class="border hairline-border p-6 rounded-sm bg-gradient-to-b from-stone-50/50 to-white hover:border-[var(--accent)] transition-all group hover:shadow-lg flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4c-3.5 0-6 2.5-6 6 0 3 1.5 5.5 2.5 8 .5 1.2 1.2 2 2 2h3c.8 0 1.5-.8 2-2 1-2.5 2.5-5 2.5-8 0-3.5-2.5-6-6-6zM9 11h6" /></svg>
            </div>
            <span class="font-mono text-[10px] text-emerald-800 uppercase tracking-widest font-semibold block mb-1">CUIDADO INTEGRAL</span>
            <h3 class="font-serif text-lg font-semibold text-stone-900 mb-2">Quiropodia Médica Integral</h3>
            <p class="text-xs text-stone-600 leading-relaxed">Corte anatómico, deslaminado de hiperqueratosis (callosidades), helomas y pulido de talones sin dolor.</p>
          </div>
          <div class="mt-4 pt-3 border-t hairline-border flex items-center justify-between text-xs font-mono">
            <span class="text-stone-500">Sesión 45 min</span>
            <span class="font-semibold text-emerald-800">Desde S/ 60</span>
          </div>
        </div>

        <div class="border hairline-border p-6 rounded-sm bg-gradient-to-b from-stone-50/50 to-white hover:border-[var(--accent)] transition-all group hover:shadow-lg flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
            </div>
            <span class="font-mono text-[10px] text-teal-800 uppercase tracking-widest font-semibold block mb-1">ALIVIO INMEDIATO</span>
            <h3 class="font-serif text-lg font-semibold text-stone-900 mb-2">Onicocriptosis (Uñeros)</h3>
            <p class="text-xs text-stone-600 leading-relaxed">Espiculotomía indolora sin extracción completa de la uña. Alivio inmediato y técnica conservadora.</p>
          </div>
          <div class="mt-4 pt-3 border-t hairline-border flex items-center justify-between text-xs font-mono">
            <span class="text-stone-500">Sin anestesia invasiva</span>
            <span class="font-semibold text-teal-800">Desde S/ 70</span>
          </div>
        </div>

        <div class="border hairline-border p-6 rounded-sm bg-gradient-to-b from-stone-50/50 to-white hover:border-[var(--accent)] transition-all group hover:shadow-lg flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span class="font-mono text-[10px] text-amber-800 uppercase tracking-widest font-semibold block mb-1">TERAPIA LÁSER</span>
            <h3 class="font-serif text-lg font-semibold text-stone-900 mb-2">Tratamiento de Onicomicosis</h3>
            <p class="text-xs text-stone-600 leading-relaxed">Eliminación de hongos en uñas con tecnología láser indolora. Sin efectos secundarios gástricos.</p>
          </div>
          <div class="mt-4 pt-3 border-t hairline-border flex items-center justify-between text-xs font-mono">
            <span class="text-stone-500">Evaluación + Sesión</span>
            <span class="font-semibold text-amber-800">Desde S/ 90</span>
          </div>
        </div>

        <div class="border hairline-border p-6 rounded-sm bg-gradient-to-b from-stone-50/50 to-white hover:border-[var(--accent)] transition-all group hover:shadow-lg flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span class="font-mono text-[10px] text-emerald-800 uppercase tracking-widest font-semibold block mb-1">BIOMECÁNICA</span>
            <h3 class="font-serif text-lg font-semibold text-stone-900 mb-2">Ortopedia &amp; Plantillas</h3>
            <p class="text-xs text-stone-600 leading-relaxed">Estudio computarizado de la pisada para corregir pie plano, fascitis plantar y dolores al caminar.</p>
          </div>
          <div class="mt-4 pt-3 border-t hairline-border flex items-center justify-between text-xs font-mono">
            <span class="text-stone-500">Estudio personalizado</span>
            <span class="font-semibold text-emerald-800">Desde S/ 140</span>
          </div>
        </div>
      `;
    } else {
      specialtiesContainer.innerHTML = `
        <div class="border hairline-border p-6 rounded-sm bg-gradient-to-b from-stone-50/50 to-white hover:border-[var(--accent)] transition-all group hover:shadow-lg flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-800 mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4c-3.5 0-6 2.5-6 6 0 3 1.5 5.5 2.5 8 .5 1.2 1.2 2 2 2h3c.8 0 1.5-.8 2-2 1-2.5 2.5-5 2.5-8 0-3.5-2.5-6-6-6zM9 11h6" /></svg>
            </div>
            <span class="font-mono text-[10px] text-cyan-800 uppercase tracking-widest font-semibold block mb-1">ALINEACIÓN PERFECTA</span>
            <h3 class="font-serif text-lg font-semibold text-stone-900 mb-2">Ortodoncia &amp; Brackets</h3>
            <p class="text-xs text-stone-600 leading-relaxed">Brackets metálicos, estéticos de zafiro y autoligado rápido. Corrige tu mordida con comodidad.</p>
          </div>
          <div class="mt-4 pt-3 border-t hairline-border flex items-center justify-between text-xs font-mono">
            <span class="text-stone-500">Evaluación inicial</span>
            <span class="font-semibold text-cyan-800">Desde S/ 150/mes</span>
          </div>
        </div>

        <div class="border hairline-border p-6 rounded-sm bg-gradient-to-b from-stone-50/50 to-white hover:border-[var(--accent)] transition-all group hover:shadow-lg flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" /></svg>
            </div>
            <span class="font-mono text-[10px] text-amber-800 uppercase tracking-widest font-semibold block mb-1">BRILLO NATURAL</span>
            <h3 class="font-serif text-lg font-semibold text-stone-900 mb-2">Estética &amp; Blanqueamiento</h3>
            <p class="text-xs text-stone-600 leading-relaxed">Blanqueamiento LED en 1 sola sesión de 45 min y carillas de resina. Recupera el tono blanco sin dolor.</p>
          </div>
          <div class="mt-4 pt-3 border-t hairline-border flex items-center justify-between text-xs font-mono">
            <span class="text-stone-500">1 Sesión completa</span>
            <span class="font-semibold text-amber-800">Desde S/ 250</span>
          </div>
        </div>

        <div class="border hairline-border p-6 rounded-sm bg-gradient-to-b from-stone-50/50 to-white hover:border-[var(--accent)] transition-all group hover:shadow-lg flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 7a3 3 0 01-6 0L8 4zm4 10v7m-3 0h6" /></svg>
            </div>
            <span class="font-mono text-[10px] text-emerald-800 uppercase tracking-widest font-semibold block mb-1">REHABILITACIÓN ORAL</span>
            <h3 class="font-serif text-lg font-semibold text-stone-900 mb-2">Implantes &amp; Cirugía</h3>
            <p class="text-xs text-stone-600 leading-relaxed">Implantes de titanio grado quirúrgico, extracción indolora de terceros molares y coronas de circonio.</p>
          </div>
          <div class="mt-4 pt-3 border-t hairline-border flex items-center justify-between text-xs font-mono">
            <span class="text-stone-500">Titanio garantizado</span>
            <span class="font-semibold text-emerald-800">Diagnóstico 3D</span>
          </div>
        </div>

        <div class="border hairline-border p-6 rounded-sm bg-gradient-to-b from-stone-50/50 to-white hover:border-[var(--accent)] transition-all group hover:shadow-lg flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-800 mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span class="font-mono text-[10px] text-cyan-800 uppercase tracking-widest font-semibold block mb-1">CONSERVACIÓN DENTAL</span>
            <h3 class="font-serif text-lg font-semibold text-stone-900 mb-2">Endodoncia Mecanizada</h3>
            <p class="text-xs text-stone-600 leading-relaxed">Salva tu pieza dental natural mediante instrumental rotatorio de última generación en 1 sola cita.</p>
          </div>
          <div class="mt-4 pt-3 border-t hairline-border flex items-center justify-between text-xs font-mono">
            <span class="text-stone-500">Cero molestias</span>
            <span class="font-semibold text-cyan-800">Desde S/ 280</span>
          </div>
        </div>
      `;
    }
  }

  // Reseñas clínicas dinámicas
  const clinicReviews = document.getElementById('clinic-reviews-container');
  if (clinicReviews) {
    if (isPodol) {
      clinicReviews.innerHTML = `
        <div class="border-t-2 border-stone-900 pt-4 space-y-2">
          <div class="font-mono text-xs text-stone-900 flex items-center justify-between">
            <span>★★★★★ · ALIVIO INMEDIATO</span>
            <span class="text-emerald-700 font-semibold text-[10px]">VERIFICADO</span>
          </div>
          <p class="font-serif text-lg italic text-stone-800">"Llegué con dolor agudo por uñero y salí caminando aliviada y sin molestias. La atención es impecable y con instrumental esterilizado."</p>
          <p class="font-mono text-[11px] text-stone-500 uppercase">— Paciente verificada en ${p.zona}</p>
        </div>
        <div class="border-t-2 border-stone-900 pt-4 space-y-2">
          <div class="font-mono text-xs text-stone-900 flex items-center justify-between">
            <span>★★★★★ · BIOSEGURIDAD</span>
            <span class="text-emerald-700 font-semibold text-[10px]">VERIFICADO</span>
          </div>
          <p class="font-serif text-lg italic text-stone-800">"Los paquetes de instrumentos se abren sellados frente a ti. Máxima higiene, atención puntual y trato súper humano."</p>
          <p class="font-mono text-[11px] text-stone-500 uppercase">— Paciente recurrente</p>
        </div>
        <div class="border-t-2 border-stone-900 pt-4 space-y-2">
          <div class="font-mono text-xs text-stone-900 flex items-center justify-between">
            <span>★ ${p.estrellas} · RECOMENDADO</span>
            <span class="text-emerald-700 font-semibold text-[10px]">VERIFICADO</span>
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
    if (heroSocialIcon) heroSocialIcon.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
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
    if (heroSocialIcon) heroSocialIcon.innerHTML = '<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>';
  } else {
    if (navSocialLink) navSocialLink.style.display = 'none';
    if (heroSocialPill) {
      heroSocialPill.href = `https://maps.google.com/?q=${encodeURIComponent(p.name + ' ' + p.zona)}`;
      heroSocialPill.style.display = 'inline-flex';
    }
    if (heroSocialText) heroSocialText.textContent = `${p.estrellas}★ Google Maps`;
    if (heroSocialIcon) heroSocialIcon.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
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
  return generateServicesForProspect(currentProspect);
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

  // Floating Bars Update
  const restBar = document.getElementById('rest-floating-bar');
  const restBarText = document.getElementById('rest-floating-bar-text');
  if (restBar) {
    if (cart.length > 0) {
      restBar.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
      restBar.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
      if (restBarText) restBarText.textContent = `${cart.length} ${cart.length === 1 ? 'plato' : 'platos'} · ${formattedTotal}`;
    } else {
      restBar.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
      restBar.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
    }
  }

  const salonBar = document.getElementById('salon-floating-bar');
  const salonBarText = document.getElementById('salon-floating-bar-text');
  if (salonBar) {
    if (cart.length > 0) {
      salonBar.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
      salonBar.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
      if (salonBarText) salonBarText.textContent = `${cart.length} ${cart.length === 1 ? 'servicio' : 'servicios'} · ${formattedTotal}`;
    } else {
      salonBar.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
      salonBar.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
    }
  }

  const vetBar = document.getElementById('vet-floating-bar');
  const vetBarText = document.getElementById('vet-floating-bar-text');
  if (vetBar) {
    if (cart.length > 0) {
      vetBar.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
      vetBar.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
      if (vetBarText) vetBarText.textContent = `${cart.length} ${cart.length === 1 ? 'ítem' : 'ítems'} · ${formattedTotal}`;
    } else {
      vetBar.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
      vetBar.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
    }
  }

  // Update combo buttons active status
  document.querySelectorAll('.btn-add-combo').forEach(b => {
    const btn = b as HTMLButtonElement;
    const cId = btn.getAttribute('data-combo-id');
    const inCart = cId ? cart.some(i => i.id === cId) : false;
    if (inCart) {
      btn.textContent = '✓ En tu Orden';
      btn.classList.add('bg-emerald-600', 'text-white');
      btn.classList.remove('bg-amber-500', 'text-stone-950');
    } else {
      btn.textContent = '+ Agregar a mi Orden';
      btn.classList.remove('bg-emerald-600', 'text-white');
      btn.classList.add('bg-amber-500', 'text-stone-950');
    }
  });

  // Update vet plan buttons active status
  document.querySelectorAll('.btn-add-vet-plan').forEach(b => {
    const btn = b as HTMLButtonElement;
    const pId = btn.getAttribute('data-vet-plan-id');
    const inCart = pId ? cart.some(i => i.id === pId) : false;
    if (inCart) {
      btn.textContent = '✓ Protocolo Seleccionado';
      btn.classList.add('bg-emerald-600');
    } else {
      btn.textContent = '+ Agendar este Protocolo';
      btn.classList.remove('bg-emerald-600');
    }
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
      msg = `*RESERVA DE MESA / CUMPLEAÑOS*\n` +
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

      msg = `*PEDIDO GASTRONÓMICO DIRECTO*\n` +
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

    const msg = `*FICHA CLÍNICA DE ATENCIÓN VETERINARIA*\n` +
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

    const msg = `*SOLICITUD DE CITA VIP CONCIERGE*\n` +
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

    const msg = `*SOLICITUD DE CITA ODONTOLÓGICA / MÉDICA*\n` +
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
    `Les armamos un boceto funcional a medida para su local:\n» ${demoLink}\n\n` +
    `Permite que el cliente elija qué servicio/plato quiere y les envíe el pedido ya armado a su WhatsApp. La dejamos lista con su dominio .com en 72 horas por S/ 500 pago único. ¿Con quién podría conversar 2 minutos para mostrársela?`;

  const emailPitch = `Asunto: Boceto web para ${p.name} (${p.zona}) — Carta digital y reservas a WhatsApp\n\n` +
    `Estimado equipo de ${p.name},\n\n` +
    `Buscando los locales mejor calificados de ${p.zona} en Google Maps, vimos que cuentan con ${p.estrellas} estrellas (${p.resenas} reseñas) en ${p.direccion}, pero aún no cuentan con un sitio web oficial en su ficha.\n\n` +
    `Preparamos una muestra funcional diseñada específicamente para ${p.name}:\n` +
    `» Ver muestra aquí: ${demoLink}\n\n` +
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
