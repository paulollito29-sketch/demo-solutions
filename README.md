# 🌟 LimaSync Demo Solutions — Plataforma Editorial & Prospección B2B

Plataforma web editorial interactiva de alta conversión desarrollada con **Astro 5**, **React 19**, **TypeScript**, **Tailwind CSS** y animaciones fluidas con **Framer Motion**.

Diseñada para prospección comercial de más de **200 negocios locales en Lima**, con prototipo hiper-personalizado insignia para **Benny Salón & Spa** (Surquillo, más de 21 años de trayectoria).

---

## 🚀 Enlaces de Producción

- **Sitio Web en Vivo (Vercel):** [https://demo-solutions-livid.vercel.app](https://demo-solutions-livid.vercel.app)
- **Repositorio Oficial:** [https://github.com/paulollito29-sketch/demo-solutions](https://github.com/paulollito29-sketch/demo-solutions)
- **Demo Limpia para Clientes (`?demo=1`):**  
  [https://demo-solutions-livid.vercel.app/?id=P001&demo=1](https://demo-solutions-livid.vercel.app/?id=P001&demo=1)

---

## ⚡ Características Principales

### 1. Sistema Dinámico de 200 Prospectos
- **Selector de Prospectos en Tiempo Real:** Permite conmutar instantáneamente entre los 200 comercios de Lima de la base de datos B2B.
- **Adaptabilidad por Rubro:** Ajusta automáticamente la paleta de colores editorial, tipografía, textos publicitarios, fotos y catálogo de servicios según el rubro:
  - 💇 *Belleza & Spa* (Salones, barberías, centros estéticos)
  - 🐟 *Restaurantes & Cevicherías* (Barras marinas, comida criolla)
  - 🦷 *Odontología* (Clínicas dentales, ortodoncia)
  - 🐾 *Veterinaria* (Clínicas veterinarias y grooming)
  - 🏥 *Clínica & Terapia* (Fisioterapia, medicina preventiva)
  - 🛍️ *Comercio Especializado* (Tiendas de autor, boutiques)
  - 🎒 *Educación Privada* (Nidos, centros de estimulación)
  - 🏨 *Hospedaje* (Hoteles boutique, alojamientos urbanos)

### 2. Barra de Prospección de Agencia & Pitch Generator
- **Generador de Cold Outreach:** Modal interactivo con copias pre-redactadas listas para enviar:
  - **WhatsApp / Instagram DM Directo:** Pitch corto con enlace a la muestra funcional.
  - **Correo Formal B2B:** Propuesta comercial detallada que resalta los datos de Google Maps del prospecto (estrellas, cantidad de reseñas y dirección).
- **Enlace Demo Limpio:** Copia con un clic un enlace con el parámetro `?demo=1` que oculta la barra interna de agencia para compartirlo con el cliente final.

### 3. Experiencia Editorial Interactiva (React Islands + Framer Motion)
- **`HeroMotion`:** Portada asimétrica con tipografía *Cormorant Garamond*, badges de credibilidad Google Maps y llamado a la acción.
- **`StoreShowcaseMotion`:** Lookbook fotográfico con fotos reales de los ambientes del local (sillones de corte, espejos LED, área de lavado).
- **`ServicesCartMotion`:** Carta/tarifario interactivo por categorías con filtro por pestañas ("Todos", "Color & Mechas", "Alisados", etc.), selección multi-ítem y ticket de reserva dinámico con cálculo automático en Soles (S/).
- **`BeforeAfterMotion`:** Comparador táctil antes/después interactivo para evidenciar la calidad de acabado y transformación.
- **`SocialReelsMotion`:** Carrusel de comunidad y testimonios vinculados a Instagram y Facebook oficial.
- **`LocationMotion`:** Mapa geolocalizado de Google Maps embebido con botón de ruta y reseñas de clientes locales.
- **`FloatingWAMotion`:** Botón flotante reactivo con animación de pulso que pre-carga el mensaje con los servicios seleccionados.

---

## 🧭 Parámetros URL Soportados

| Parámetro | Ejemplo | Descripción |
| :--- | :--- | :--- |
| `id` | `?id=P001` | Carga un prospecto específico (P001 a P200) con todos sus datos y servicios. |
| `demo` | `?demo=1` | Oculta la barra superior de agencia para presentar la web como demo final al cliente. |

Ejemplos directos:
- **Benny Salón & Spa (Belleza):** `/?id=P001&demo=1`
- **El Paisita (Cevichería):** `/?id=P004&demo=1`
- **Benident (Odontología):** `/?id=P015&demo=1`
- **Mikelas (Veterinaria):** `/?id=P003&demo=1`

---

## 📂 Estructura del Proyecto

```tree
demo-solutions/
├── public/
│   ├── benny/              # Logotipos y fotografías reales de Benny Salón & Spa
│   └── favicon.svg         # Favicon vectorial
├── src/
│   ├── components/         # Componentes Astro estáticos / SSR
│   │   ├── AgencyBar.astro     # Barra superior con selector de los 200 prospectos
│   │   ├── BeforeAfter.astro   # Comparador fallback SSR
│   │   ├── Footer.astro        # Pie de página
│   │   ├── Hero.astro          # Hero base
│   │   ├── LocationSection.astro # Mapa y datos de contacto
│   │   ├── Marquee.astro       # Cintillo animado continuo
│   │   ├── MenuSection.astro   # Carta SSR con servicios renderizados
│   │   ├── NavBar.astro        # Navegación base
│   │   ├── PitchModal.astro    # Modal generador de mensajes y correo
│   │   └── TopBar.astro        # Cintillo de dirección y teléfono
│   ├── components/react/   # Islas React interactivas con Framer Motion
│   │   ├── BeforeAfterMotion.tsx
│   │   ├── FloatingWAMotion.tsx
│   │   ├── FooterMotion.tsx
│   │   ├── HeroMotion.tsx
│   │   ├── LocationMotion.tsx
│   │   ├── NavbarMotion.tsx
│   │   ├── ServicesCartMotion.tsx
│   │   ├── SocialReelsMotion.tsx
│   │   └── StoreShowcaseMotion.tsx
│   ├── data/
│   │   ├── prospects.ts    # Base de datos tipada con los 200 prospectos de Lima
│   │   └── themes.ts       # Configuración temática y servicios para los 8 rubros
│   ├── layouts/
│   │   └── Layout.astro    # Layout general con tipografías y metadatos SEO
│   ├── pages/
│   │   └── index.astro     # Página principal integradora
│   ├── scripts/
│   │   └── client.ts       # Lógica TypeScript para conmutación dinámica del prospecto
│   ├── styles/
│   │   └── global.css      # Directivas Tailwind, fuentes y variables CSS
│   └── types/
│       └── prospect.ts     # Tipado TypeScript estricto
├── astro.config.mjs        # Configuración de Astro con Tailwind y React integrations
├── tailwind.config.mjs     # Configuración de Tailwind CSS y fuentes
└── tsconfig.json           # Configuración de TypeScript
```

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** [Astro 5](https://astro.build/) (Arquitectura Islands & Static Site Generation)
- **UI & Animaciones:** [React 19](https://react.dev/) + [Framer Motion](https://www.framer.com/motion/)
- **Estilos:** [Tailwind CSS 3](https://tailwindcss.com/)
- **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/)
- **Tipografías:** *Cormorant Garamond* (Editorial), *DM Sans* (Cuerpo), *JetBrains Mono* (Precios & Fichas)
- **Despliegue & Hosting:** [Vercel](https://vercel.com/)

---

## 💻 Desarrollo Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/paulollito29-sketch/demo-solutions.git
   cd demo-solutions
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:4321](http://localhost:4321) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 📦 Despliegue en Vercel

El proyecto está configurado para desplegarse automáticamente con Vercel CLI o mediante vinculación con la rama `main` de GitHub:

```bash
vercel deploy --prod
```

---

© 2026 LimaSync Solutions. Todos los derechos reservados.
