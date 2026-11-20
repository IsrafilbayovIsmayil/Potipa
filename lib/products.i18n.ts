/** English + Russian texts for each product (es/ca live next to the product in products.ts). */
type T = { en: string; ru: string };
export interface Tx { name: T; desc: T; designHint?: T }

const FL: Record<string, T> = {
  frambuesa: { en: "Raspberry", ru: "Малина" },
  fresa: { en: "Strawberry", ru: "Клубника" },
  cereza: { en: "Cherry", ru: "Вишня" },
};
export const flavourTx = (id: string): T => FL[id] ?? { en: id, ru: id };

const HINT_THEME: T = { en: "Tell us the theme and the name.", ru: "Напишите тему и имя." };
const HINT_THEME_COLORS: T = { en: "Tell us the theme, colours and text.", ru: "Напишите тему, цвета и надпись." };
const HINT_WED: T = { en: "We'll contact you to fine-tune the design.", ru: "Мы свяжемся с вами и вместе доработаем дизайн." };

export const TX: Record<string, Tx> = {
  "red-velvet": { name: { en: "Red Velvet", ru: "Красный бархат" }, desc: { en: "Red velvet sponge with soft cream. Choose your favourite flavour.", ru: "Нежный бисквит «красный бархат» с воздушным кремом. Вкус выбираете вы." } },
  "medovik": { name: { en: "Medovik", ru: "Медовик" }, desc: { en: "Classic honey cake in thin layers with cream.", ru: "Классический медовик из тонких медовых коржей с кремом." } },
  "ferrero": { name: { en: "Ferrero Rocher", ru: "Ферреро Роше" }, desc: { en: "Chocolate and hazelnut, Ferrero Rocher style.", ru: "Шоколад и фундук — как в конфетах Ferrero Rocher." } },
  "pistacho-frambuesa": { name: { en: "Pistachio & raspberry", ru: "Фисташка и малина" }, desc: { en: "Natural pistachio and real raspberry. An irresistible balance.", ru: "Натуральная фисташка и настоящая малина. Сочетание, от которого трудно оторваться." } },
  "tiramisu-grande": { name: { en: "Tiramisu", ru: "Тирамису" }, desc: { en: "Our tiramisu with ladyfinger sponge, in a take-away box.", ru: "Наше тирамису с печеньем савоярди. Отдаём в коробке — удобно нести домой." } },
  "tiramisu-mini": { name: { en: "Small tiramisu", ru: "Тирамису малый" }, desc: { en: "Version for 5–6 people. Price between €50 and €60, we'll confirm the amount.", ru: "Вариант на 5–6 человек. Цена 50–60 €, точную сумму подтвердим." } },
  "carrot-cake": { name: { en: "Carrot Cake", ru: "Морковный торт" }, desc: { en: "Spiced carrot cake with soft cream.", ru: "Морковный торт с пряностями и нежным кремом." } },
  "red-velvet-mini": { name: { en: "Small Red Velvet", ru: "Красный бархат малый" }, desc: { en: "Two-layer red velvet with cream. Raspberry, strawberry or cherry.", ru: "Двухслойный «красный бархат» с кремом. На выбор малина, клубника или вишня." } },
  "bomba": { name: { en: "Bomb cake", ru: "Торт «Бомба»" }, desc: { en: "Themed cake with a chocolate bomb and figures of your choice.", ru: "Тематический торт с шоколадной «бомбой» и фигурками на ваш выбор." }, designHint: HINT_THEME },
  "arco-iris": { name: { en: "Rainbow cake", ru: "Радужный торт" }, desc: { en: "7 layers of coloured sponge, vanilla cream and chocolate ganache.", ru: "7 цветных коржей, ванильный крем и шоколадный ганаш." } },
  "tarta-imagen": { name: { en: "Cake with a picture", ru: "Торт с изображением" }, desc: { en: "Your photo or illustration printed on the cake.", ru: "Ваше фото или рисунок прямо на торте." }, designHint: { en: "We'll ask you for the image on WhatsApp afterwards.", ru: "Картинку попросим прислать в WhatsApp после заказа." } },
  "tarta-decorada": { name: { en: "Decorated cake", ru: "Торт с декором" }, desc: { en: "Decoration to your taste for that special moment.", ru: "Оформим по вашему вкусу — под ваш особенный повод." }, designHint: HINT_THEME_COLORS },
  "tarta-personalizada": { name: { en: "Custom decorated cake", ru: "Торт на заказ с декором" }, desc: { en: "Made to measure: flowers, names, colours… just as you imagine it.", ru: "Торт по вашей задумке: цветы, имена, цвета — всё как вы себе представляете." }, designHint: HINT_THEME_COLORS },
  "cinnabon-canela": { name: { en: "Classic cinnamon Cinnabon", ru: "Синнабон классический с корицей" }, desc: { en: "The ideal size for one person.", ru: "Размер как раз на одного." } },
  "cinnabon-bosque": { name: { en: "Cinnabon with forest fruits", ru: "Синнабон с лесными ягодами" }, desc: { en: "The ideal size for one person.", ru: "Размер как раз на одного." } },
  "boda-50": { name: { en: "Wedding cake — 50 guests", ru: "Свадебный торт на 50 гостей" }, desc: { en: "Two tiers with fresh flowers. Art for every occasion.", ru: "Два яруса со свежими цветами." }, designHint: HINT_WED },
  "boda-100": { name: { en: "Wedding cake — 100 guests", ru: "Свадебный торт на 100 гостей" }, desc: { en: "Three tiers with a vintage feel. A unique detail for an unforgettable day.", ru: "Три яруса в винтажном стиле. Деталь, которая сделает этот день особенным." }, designHint: HINT_WED },
};

/** "6–8 personas" -> en/ru */
export function servesTx(es: string): T | null {
  const m = es.match(/^([\d–]+) personas?$/);
  if (!m) return null;
  const n = m[1], last = parseInt(n.split("–").pop()!, 10);
  const ru = last === 1 ? "человек" : last >= 2 && last <= 4 ? "человека" : "человек";
  return { en: `${n} people`, ru: `${n} ${ru}` };
}
