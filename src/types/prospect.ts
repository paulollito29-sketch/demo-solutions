export interface ProspectPalette {
  name: string;
  bg_page: string;
  bg_panel: string;
  bg_tint: string;
  ink: string;
  accent: string;
  accent_dark: string;
  line: string;
}

export interface Prospect {
  id: string;
  name: string;
  zona: string;
  rubro: string;
  prioridad: 'Alta' | 'Media' | 'Baja' | string;
  indice: number;
  direccion: string;
  tel: string;
  wa: string;
  es_celular: string;
  estrellas: string;
  resenas: string;
  franja: string;
  facebook?: string;
  instagram?: string;
  estadoWeb?: string;
  lema?: string;
  logoUrl?: string;
  heroPhoto?: string;
  featuredLabel?: string;
  featuredPrice?: string;
  featuredTitle?: string;
  featuredSub?: string;
  baKicker?: string;
  baTitle?: string;
  baDesc?: string;
  baBefore?: string;
  baAfter?: string;
  palette?: ProspectPalette;
  customServices?: ServiceItem[];
  lead?: string;
}

export interface ServiceItem {
  id: string;
  cat: string;
  name: string;
  desc: string;
  price: number;
  time: string;
}

export interface RubroTheme {
  bgMain: string;
  bgAlt: string;
  ink: string;
  accent: string;
  border: string;
  rubroTag: string;
  menuLabel: string;
  ctaText: string;
  headlineMain: string;
  lead: string;
  primaryBtn: string;
  heroPhoto: string;
  featuredLabel: string;
  featuredPrice: string;
  featuredTitle: string;
  featuredSub: string;
  menuKicker: string;
  menuHeading: string;
  ticketTitle: string;
  baKicker: string;
  baTitle: string;
  baDesc: string;
  baAfter: string;
  baBefore: string;
  services: ServiceItem[];
}
