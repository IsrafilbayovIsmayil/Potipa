export const SHOP = {
  name: "PoTiPa",
  tagline: { es: "Pastelería & Dolcería", ca: "Pastisseria & Dolceria", en: "Bakery & Dolceria", ru: "Кондитерская и десерты" },
  address: "Rambla de Joaquim Ruyra, 3, 17300 Blanes (Girona)",
  phone: "+34 664 33 79 99", // confirmed by the cafe
  whatsapp: "34664337999", // confirmed
  instagram: "https://www.instagram.com/potipa.blanes/",
  facebook: "https://www.facebook.com/potipablanes/",
  tz: "Europe/Madrid",
  // Confirmed from the Google listing (Nov 2026). Day of week (0=Sunday) -> list of [openMin, closeMin] ranges; empty = closed.
  hours: {
    0: [[600, 840]],
    1: [],
    2: [[600, 840], [990, 1200]], 3: [[600, 840], [990, 1200]], 4: [[600, 840], [990, 1200]],
    5: [[600, 840], [990, 1200]], 6: [[600, 840], [990, 1200]],
  } as Record<number, [number, number][]>,
  slotMinutes: 30,
};
