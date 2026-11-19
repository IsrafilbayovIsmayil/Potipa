export type L = { es: string; ca: string };
export type Category = "tartas" | "bolleria" | "bodas";

export interface Option { id: string; label: L }
export interface Product {
  id: string;
  category: Category;
  name: L;
  desc: L;
  serves?: L;
  /** cents. null = price to be confirmed */
  priceCents: number | null;
  /** fixed = order goes straight in. custom = the cafe must confirm details/price. */
  kind: "fixed" | "custom";
  leadHours: number;
  image: string;
  flavours?: Option[];
  inscription?: boolean;
  designHint?: L;
}

export const PRODUCTS: Product[] = [
  {
    id: "red-velvet", category: "tartas", kind: "fixed", priceCents: 6000, leadHours: 48,
    name: { es: "Red Velvet", ca: "Red Velvet" },
    desc: { es: "Bizcocho red velvet con crema suave. Elige tu sabor favorito.", ca: "Bescuit red velvet amb crema suau. Tria el teu sabor preferit." },
    serves: { es: "6–8 personas", ca: "6–8 persones" },
    image: "/img/red-velvet.jpg", inscription: true,
    flavours: [
      { id: "frambuesa", label: { es: "Frambuesa", ca: "Gerds" } },
      { id: "fresa", label: { es: "Fresa", ca: "Maduixa" } },
      { id: "cereza", label: { es: "Cereza", ca: "Cirera" } },
    ],
  },
  {
    id: "medovik", category: "tartas", kind: "fixed", priceCents: 6000, leadHours: 48,
    name: { es: "Medovik", ca: "Medovik" },
    desc: { es: "Clásica tarta de miel en capas finas con crema.", ca: "Clàssica pastís de mel en capes fines amb crema." },
    serves: { es: "6–8 personas", ca: "6–8 persones" },
    image: "/img/medovik.jpg", inscription: true,
  },
  {
    id: "ferrero", category: "tartas", kind: "fixed", priceCents: 8000, leadHours: 48,
    name: { es: "Ferrero Rocher", ca: "Ferrero Rocher" },
    desc: { es: "Chocolate y avellana, al estilo Ferrero Rocher.", ca: "Xocolata i avellana, a l'estil Ferrero Rocher." },
    serves: { es: "10–12 personas", ca: "10–12 persones" },
    image: "/img/ferrero.jpg", inscription: true,
  },
  {
    id: "pistacho-frambuesa", category: "tartas", kind: "fixed", priceCents: 8000, leadHours: 48,
    name: { es: "Pistacho y frambuesa", ca: "Pistatxo i gerds" },
    desc: { es: "Pistacho natural y frambuesa real. Un equilibrio irresistible.", ca: "Pistatxo natural i gerds reals. Un equilibri irresistible." },
    serves: { es: "10–12 personas", ca: "10–12 persones" },
    image: "/img/pistacho.jpg", inscription: true,
  },
  {
    id: "tiramisu-grande", category: "tartas", kind: "fixed", priceCents: 8000, leadHours: 48,
    name: { es: "Tiramisú", ca: "Tiramisú" },
    desc: { es: "Nuestro tiramisú con bizcocho de soletilla, en caja para llevar.", ca: "El nostre tiramisú amb melindros, en caixa per emportar." },
    serves: { es: "10–12 personas", ca: "10–12 persones" },
    image: "/img/tiramisu-grande.jpg",
  },
  {
    id: "tiramisu-mini", category: "tartas", kind: "custom", priceCents: 5000, leadHours: 48,
    name: { es: "Tiramisú pequeño", ca: "Tiramisú petit" },
    desc: { es: "Versión para 5–6 personas. Precio entre 50 y 60 €, te confirmamos el importe.", ca: "Versió per a 5–6 persones. Preu entre 50 i 60 €, et confirmem l'import." },
    serves: { es: "5–6 personas", ca: "5–6 persones" },
    image: "/img/tiramisu-mini.jpg",
  },
  {
    id: "carrot-cake", category: "tartas", kind: "fixed", priceCents: 5000, leadHours: 48,
    name: { es: "Carrot Cake", ca: "Carrot Cake" },
    desc: { es: "Tarta de zanahoria especiada con crema suave.", ca: "Pastís de pastanaga especiat amb crema suau." },
    serves: { es: "5–6 personas", ca: "5–6 persones" },
    image: "/img/carrot.jpg", inscription: true,
  },
  {
    id: "red-velvet-mini", category: "tartas", kind: "fixed", priceCents: 2500, leadHours: 48,
    name: { es: "Red Velvet pequeña", ca: "Red Velvet petita" },
    desc: { es: "Red velvet en dos capas con crema. Frambuesa, fresa o cereza.", ca: "Red velvet en dues capes amb crema. Gerds, maduixa o cirera." },
    serves: { es: "2–4 personas", ca: "2–4 persones" },
    image: "/img/red-velvet-mini.jpg", inscription: true,
    flavours: [
      { id: "frambuesa", label: { es: "Frambuesa", ca: "Gerds" } },
      { id: "fresa", label: { es: "Fresa", ca: "Maduixa" } },
      { id: "cereza", label: { es: "Cereza", ca: "Cirera" } },
    ],
  },
  {
    id: "bomba", category: "tartas", kind: "custom", priceCents: 15000, leadHours: 96,
    name: { es: "Tarta Bomba", ca: "Pastís Bomba" },
    desc: { es: "Tarta temática con bomba de chocolate y figuras a tu elección.", ca: "Pastís temàtic amb bomba de xocolata i figures al teu gust." },
    serves: { es: "15 personas", ca: "15 persones" },
    image: "/img/bomba.jpg", inscription: true,
    designHint: { es: "Cuéntanos el tema y el nombre.", ca: "Explica'ns el tema i el nom." },
  },
  {
    id: "arco-iris", category: "tartas", kind: "custom", priceCents: null, leadHours: 72,
    name: { es: "Tarta Arco Iris", ca: "Pastís Arc de Sant Martí" },
    desc: { es: "7 capas de bizcocho de colores, crema de vainilla y ganache de chocolate.", ca: "7 capes de bescuit de colors, crema de vainilla i ganache de xocolata." },
    image: "/img/arco-iris.jpg", inscription: true,
  },
  {
    id: "tarta-imagen", category: "tartas", kind: "custom", priceCents: 8000, leadHours: 72,
    name: { es: "Tarta con imagen", ca: "Pastís amb imatge" },
    desc: { es: "Tu foto o ilustración impresa sobre la tarta.", ca: "La teva foto o il·lustració impresa sobre el pastís." },
    serves: { es: "10–12 personas", ca: "10–12 persones" },
    image: "/img/tarta-imagen.jpg", inscription: true,
    designHint: { es: "Después te pediremos la imagen por WhatsApp.", ca: "Després et demanarem la imatge per WhatsApp." },
  },
  {
    id: "tarta-decorada", category: "tartas", kind: "custom", priceCents: 12000, leadHours: 72,
    name: { es: "Tarta con decoración", ca: "Pastís amb decoració" },
    desc: { es: "Decoración a tu gusto para ese momento especial.", ca: "Decoració al teu gust per a aquest moment especial." },
    serves: { es: "15 personas", ca: "15 persones" },
    image: "/img/tarta-birthday.jpg", inscription: true,
    designHint: { es: "Cuéntanos tema, colores y texto.", ca: "Explica'ns tema, colors i text." },
  },
  {
    id: "tarta-personalizada", category: "tartas", kind: "custom", priceCents: 12000, leadHours: 72,
    name: { es: "Tarta personalizada con decoración", ca: "Pastís personalitzat amb decoració" },
    desc: { es: "Diseñada a medida: flores, nombres, colores… como la imaginas.", ca: "Dissenyat a mida: flors, noms, colors… com t'ho imagines." },
    serves: { es: "15 personas", ca: "15 persones" },
    image: "/img/tarta-decorada-flores.jpg", inscription: true,
    designHint: { es: "Cuéntanos tema, colores y texto.", ca: "Explica'ns tema, colors i text." },
  },
  {
    id: "cinnabon-canela", category: "bolleria", kind: "fixed", priceCents: 350, leadHours: 3,
    name: { es: "Cinnabon clásico con canela", ca: "Cinnabon clàssic amb canyella" },
    desc: { es: "El tamaño ideal para una persona.", ca: "La mida ideal per a una persona." },
    image: "/img/cinnabon-canela.jpg",
  },
  {
    id: "cinnabon-bosque", category: "bolleria", kind: "fixed", priceCents: 350, leadHours: 3,
    name: { es: "Cinnabon con frutas del bosque", ca: "Cinnabon amb fruits del bosc" },
    desc: { es: "El tamaño ideal para una persona.", ca: "La mida ideal per a una persona." },
    image: "/img/cinnabon-bosque.jpg",
  },
  {
    id: "boda-50", category: "bodas", kind: "custom", priceCents: 32500, leadHours: 336,
    name: { es: "Tarta de boda — 50 personas", ca: "Pastís de noces — 50 persones" },
    desc: { es: "Dos pisos con flores frescas. Arte en cada ocasión.", ca: "Dos pisos amb flors fresques. Art en cada ocasió." },
    serves: { es: "50 personas", ca: "50 persones" },
    image: "/img/boda-50.jpg", inscription: false,
    designHint: { es: "Te contactaremos para afinar el diseño.", ca: "Et contactarem per afinar el disseny." },
  },
  {
    id: "boda-100", category: "bodas", kind: "custom", priceCents: 58000, leadHours: 336,
    name: { es: "Tarta de boda — 100 personas", ca: "Pastís de noces — 100 persones" },
    desc: { es: "Tres pisos de inspiración vintage. Un detalle único para un día inolvidable.", ca: "Tres pisos d'inspiració vintage. Un detall únic per a un dia inoblidable." },
    serves: { es: "100 personas", ca: "100 persones" },
    image: "/img/boda-100.jpg", inscription: false,
    designHint: { es: "Te contactaremos para afinar el diseño.", ca: "Et contactarem per afinar el disseny." },
  },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);
export const eur = (cents: number, locale = "es") =>
  new Intl.NumberFormat(locale === "ca" ? "ca-ES" : "es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
