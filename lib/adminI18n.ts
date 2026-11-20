"use client";
import { useEffect, useState } from "react";

import type { AdminLang } from "./adminI18n-types";
export type { AdminLang };
const es = {
  offline: "Sin conexión",
  sound_banner: "Toca aquí para activar el sonido de los pedidos",
  sound_on: "Sonido activado · probar", sound_off: "Activar sonido",
  menu: "Menú", menu_devices: "Dispositivos", menu_logout: "Salir",
  tab_new: "Nuevos", tab_prep: "Preparación", tab_ready: "Listos",
  col_new: "Nuevos", col_prep: "En preparación", col_ready: "Listos para recoger",
  empty_new: "Sin pedidos nuevos", empty_prep: "Nada en preparación", empty_ready: "Nada listo",
  history: "Historial reciente", delivered: "Entregado", cancelled: "Cancelado", reopen: "reabrir",
  confirm_cancel: "¿Cancelar este pedido?",
  to_confirm: "POR CONFIRMAR", plus_tbc: " + por confirmar",
  accept: "✓ Aceptar", ready_btn: "Listo para recoger", done_btn: "Entregado", cancel: "Cancelar",
  now: "ahora", min_ago: "hace {n} min", h_ago: "hace {n} h",
  title_idle: "PoTiPa · Pedidos", title_new: "🔔 ({n}) NUEVO PEDIDO",
  push_on: "Avisos activados · toca para desactivar", push_off: "Activar avisos en este dispositivo", push_denied: "Avisos bloqueados en el navegador",
  // login
  login_title: "Pedidos", tab_device: "Vincular dispositivo", tab_owner: "Soy la dueña",
  hint_device: "Pide a la dueña un código en Pedidos → Dispositivos y escríbelo aquí.", hint_owner: "Contraseña de la dueña.",
  pw_ph: "Contraseña", btn_link: "Vincular", btn_enter: "Entrar",
  err_rate: "Demasiados intentos. Espera unos minutos.", err_pin: "Contraseña incorrecta", err_code: "Código incorrecto o caducado",
  // devices panel
  dev_title: "Dispositivos con acceso", close: "Cerrar",
  dev_intro: "Cada pantalla o móvil se vincula con un código de un solo uso. Si alguien deja la empresa, quita su dispositivo y listo: nadie más se ve afectado.",
  dev_name_ph: "Nombre (ej.: Mostrador, Móvil de Ana)", dev_add: "+ Añadir dispositivo", dev_name_err: "Escribe un nombre (mín. 2 letras).",
  dev_code_for: "Código para «{label}» — escríbelo en ese dispositivo en /admin → Vincular dispositivo", dev_expired: "caducado",
  dev_valid: "Válido {t} · un solo uso", dev_new_code: "Genera otro código", dev_none: "Aún no hay dispositivos vinculados.",
  dev_linked: "Vinculado {a} · visto {b}", dev_revoke: "Quitar acceso", dev_revoke_confirm: "¿Quitar el acceso a «{label}»? Se desconectará al instante.", dev_removed: "Quitados:",
  // customer message
  lang_chip: "Idioma del cliente",
  view_orders: "Pedidos", view_enq: "Consultas", enq_empty: "Aún no hay consultas de bodas.", enq_new: "Nueva", enq_done: "Atendida",
  enq_mark: "Marcar como atendida", enq_reopen: "Volver a pendiente", enq_date: "Fecha del evento", enq_guests: "Invitados", enq_venue: "Lugar", enq_flavour: "Sabor", enq_nodate: "sin fecha",
  enq_hist: "Atendidas", enq_wa: "Hola {n}, soy de PoTiPa. Hemos recibido tu consulta para tu tarta. ¿Cuándo podemos hablar?",
};
export type AdminDict = typeof es;
const ru: AdminDict = {
  offline: "Нет связи",
  sound_banner: "Нажмите, чтобы включить звук новых заказов",
  sound_on: "Звук включён · проверить", sound_off: "Включить звук",
  menu: "Меню", menu_devices: "Устройства", menu_logout: "Выйти",
  tab_new: "Новые", tab_prep: "Готовятся", tab_ready: "Готовы",
  col_new: "Новые", col_prep: "Готовятся", col_ready: "Готовы к выдаче",
  empty_new: "Нет новых заказов", empty_prep: "Ничего не готовится", empty_ready: "Ничего не готово",
  history: "Недавние заказы", delivered: "Выдан", cancelled: "Отменён", reopen: "вернуть",
  confirm_cancel: "Отменить этот заказ?",
  to_confirm: "УТОЧНИТЬ", plus_tbc: " + уточняется",
  accept: "✓ Принять", ready_btn: "Готов к выдаче", done_btn: "Выдан", cancel: "Отменить",
  now: "сейчас", min_ago: "{n} мин назад", h_ago: "{n} ч назад",
  title_idle: "PoTiPa · Заказы", title_new: "🔔 ({n}) НОВЫЙ ЗАКАЗ",
  push_on: "Уведомления включены · нажмите, чтобы выключить", push_off: "Включить уведомления на этом устройстве", push_denied: "Уведомления заблокированы в браузере",
  login_title: "Заказы", tab_device: "Привязать устройство", tab_owner: "Я владелица",
  hint_device: "Попросите у владелицы код в разделе «Заказы → Устройства» и введите его здесь.", hint_owner: "Пароль владелицы.",
  pw_ph: "Пароль", btn_link: "Привязать", btn_enter: "Войти",
  err_rate: "Слишком много попыток. Подождите несколько минут.", err_pin: "Неверный пароль", err_code: "Неверный или просроченный код",
  dev_title: "Устройства с доступом", close: "Закрыть",
  dev_intro: "Каждый экран или телефон привязывается одноразовым кодом. Если сотрудник уходит, уберите его устройство — остальных это не затронет.",
  dev_name_ph: "Название (напр.: Касса, Телефон Ани)", dev_add: "+ Добавить устройство", dev_name_err: "Введите название (минимум 2 буквы).",
  dev_code_for: "Код для «{label}» — введите его на этом устройстве в /admin → Привязать устройство", dev_expired: "истёк",
  dev_valid: "Действует {t} · одноразовый", dev_new_code: "Создайте новый код", dev_none: "Устройств пока нет.",
  dev_linked: "Привязано {a} · был в сети {b}", dev_revoke: "Убрать доступ", dev_revoke_confirm: "Убрать доступ для «{label}»? Устройство отключится сразу.", dev_removed: "Убраны:",
  lang_chip: "Язык клиента",
  view_orders: "Заказы", view_enq: "Заявки", enq_empty: "Заявок на торты пока нет.", enq_new: "Новая", enq_done: "Обработана",
  enq_mark: "Отметить обработанной", enq_reopen: "Вернуть в новые", enq_date: "Дата праздника", enq_guests: "Гостей", enq_venue: "Место", enq_flavour: "Вкус", enq_nodate: "дата не указана",
  enq_hist: "Обработанные", enq_wa: "Hola {n}, soy de PoTiPa. Hemos recibido tu consulta para tu tarta. ¿Cuándo podemos hablar?",
};
export const AD: Record<AdminLang, AdminDict> = { es, ru };
export const adminTag = (l: AdminLang) => (l === "ru" ? "ru-RU" : "es-ES");
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

const KEY = "potipa_admin_lang";
function initial(): AdminLang {
  try { const s = localStorage.getItem(KEY); if (s === "es" || s === "ru") return s; } catch {}
  return /^(ru|uk)/i.test(navigator.language || "") ? "ru" : "es";
}
export function useAdminLang(): [AdminLang, (l: AdminLang) => void] {
  const [lang, set] = useState<AdminLang>("es");
  useEffect(() => {
    set(initial());
    const h = () => set(initial());
    window.addEventListener("potipa-admin-lang", h);
    return () => window.removeEventListener("potipa-admin-lang", h);
  }, []);
  const change = (l: AdminLang) => { try { localStorage.setItem(KEY, l); } catch {} window.dispatchEvent(new Event("potipa-admin-lang")); };
  return [lang, change];
}
