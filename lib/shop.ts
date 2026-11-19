// TODO(confirm with the cafe): opening hours are PLACEHOLDERS.
export const SHOP = {
  name: "PoTiPa",
  tagline: { es: "Pastelería & Dolcería", ca: "Pastisseria & Dolceria" },
  address: "Rambla de Joaquim Ruyra, 3, 17300 Blanes (Girona)",
  phone: "+34 664 33 79 99", // TODO confirm
  whatsapp: "34664337999", // TODO confirm
  instagram: "https://www.instagram.com/potipa.blanes/",
  facebook: "https://www.facebook.com/potipablanes/",
  tz: "Europe/Madrid",
  // day of week (0=Sunday) -> [openHour, closeHour] or null if closed
  hours: {
    0: [9, 14], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: [8, 20],
  } as Record<number, [number, number] | null>,
  slotMinutes: 30,
};
