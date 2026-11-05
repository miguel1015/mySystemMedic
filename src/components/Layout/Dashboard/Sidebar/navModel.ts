import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import {
  faCalculator,
  faCapsules,
  faFileInvoiceDollar,
  faFolderOpen,
  faScrewdriverWrench,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";
import { BackendModule } from "@/types/typeModules";
import { getNavIcon } from "./navIcons";

export interface NavView {
  name: string;
  route: string;
  // "Asistencial › Registros clínicos"
  trail: string;
  moduleId: number;
  icon?: IconDefinition;
}

export const normalizeRoute = (route: string) => (route.startsWith("/") ? route : `/${route}`);

// Los nombres llegan del backend en mayúsculas y a veces sin tilde ("HISTORIAL DE
// ADMISIONES", "ATENCION EN CURSO"). Para mostrarlos: mayúscula inicial, siglas en
// mayúsculas y tilde en las palabras frecuentes del sistema. Solo cambia la
// presentación; las rutas y los datos no se tocan.
const ACRONYMS = new Set([
  "hc", "hci", "ips", "eps", "cups", "rips", "furips", "dian", "pos", "nit", "ss", "soat", "uci", "rx",
]);
const ACCENTED: Record<string, string> = {
  admision: "admisión", admisiones: "admisiones", atencion: "atención", facturacion: "facturación",
  parametrizacion: "parametrización", gestion: "gestión", evolucion: "evolución",
  evoluciones: "evoluciones", enfermeria: "enfermería", medica: "médica", medicas: "médicas",
  medico: "médico", medicos: "médicos", clinica: "clínica", clinicas: "clínicas", clinico: "clínico",
  clinicos: "clínicos", diagnostico: "diagnóstico", diagnosticos: "diagnósticos",
  quirurgica: "quirúrgica", quirurgicas: "quirúrgicas", quirurgico: "quirúrgico",
  quirurgicos: "quirúrgicos", aplicacion: "aplicación", liquidacion: "liquidación",
  homologacion: "homologación", configuracion: "configuración", informacion: "información",
  descripcion: "descripción", descripciones: "descripciones", radiologia: "radiología",
  electronica: "electrónica", electronicas: "electrónicas", ordenes: "órdenes",
  medicamento: "medicamento", gastos: "gastos", hospitalizacion: "hospitalización",
  cirugia: "cirugía", anestesia: "anestesia", remision: "remisión", consolidacion: "consolidación",
  tecnico: "técnico", vehiculos: "vehículos", transito: "tránsito",
  visualizacion: "visualización", radicacion: "radicación", electronico: "electrónico",
  electronicos: "electrónicos", generacion: "generación", habilitacion: "habilitación",
  autorizacion: "autorización", programacion: "programación",
};

export function displayName(name?: string | null) {
  const words = (name ?? "").trim().toLocaleLowerCase("es-CO").split(/\s+/).filter(Boolean);
  return words
    .map((raw, i) => {
      const bare = raw.replace(/[^\p{L}]/gu, "");
      if (ACRONYMS.has(bare)) return raw.toLocaleUpperCase("es-CO");
      if (raw.includes(".")) return raw.toLocaleUpperCase("es-CO"); // S.A.S.
      const word = ACCENTED[raw] ?? raw;
      return i === 0 ? word.charAt(0).toLocaleUpperCase("es-CO") + word.slice(1) : word;
    })
    .join(" ");
}

export const moduleLabel = (name: string) => displayName(name);

// Los módulos no traen ícono desde el backend; se asigna por nombre y, si no se
// reconoce, se usa el del primer menú del módulo.
const MODULE_ICONS: Record<string, IconDefinition> = {
  asistencial: faStethoscope,
  farmacia: faCapsules,
  facturacion: faFileInvoiceDollar,
  facturación: faFileInvoiceDollar,
  parametrizacion: faScrewdriverWrench,
  parametrización: faScrewdriverWrench,
  contabilidad: faCalculator,
};
export function moduleIcon(mod: BackendModule) {
  return (
    MODULE_ICONS[mod.name.trim().toLocaleLowerCase("es-CO")] ??
    getNavIcon(mod.menus[0]?.icon) ??
    faFolderOpen
  );
}

// Todas las vistas que el rol puede abrir, en una lista plana (para buscar y recientes).
export function flattenViews(modules: BackendModule[]): NavView[] {
  const out: NavView[] = [];
  modules.forEach((mod) => {
    const modName = moduleLabel(mod.name);
    const fallbackIcon = moduleIcon(mod);
    mod.menus.forEach((menu) => {
      if (menu.subMenus?.length) {
        menu.subMenus.forEach((sub) =>
          out.push({
            name: displayName(sub.name),
            route: normalizeRoute(sub.route),
            trail: `${modName} › ${displayName(menu.name)}`,
            moduleId: mod.id,
            icon: getNavIcon(sub.icon) ?? getNavIcon(menu.icon) ?? fallbackIcon,
          }),
        );
      } else if (menu.route) {
        out.push({
          name: displayName(menu.name),
          route: normalizeRoute(menu.route),
          trail: modName,
          moduleId: mod.id,
          icon: getNavIcon(menu.icon) ?? fallbackIcon,
        });
      }
    });
  });
  // Una misma vista puede estar en dos módulos: se lista una sola vez.
  const seen = new Set<string>();
  return out.filter((v) => (seen.has(v.route) ? false : (seen.add(v.route), true)));
}

// La vista registrada más específica que contiene la ruta actual
// ("/care/triage/12/edit" -> "/care/triage").
export function viewForPath(views: NavView[], pathname: string) {
  return views
    .filter((v) => v.route !== "/" && (pathname === v.route || pathname.startsWith(`${v.route}/`)))
    .sort((a, b) => b.route.length - a.route.length)[0];
}

// Búsqueda sin tildes ni mayúsculas; todas las palabras deben aparecer en el nombre o
// en el camino ("evol hc" encuentra "Evolucionar HC").
export const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function searchViews(views: NavView[], query: string) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return views;
  return views
    .map((v) => {
      const name = fold(v.name);
      const hay = `${name} ${fold(v.trail)}`;
      if (!words.every((w) => hay.includes(w))) return null;
      // Primero las que empiezan por lo escrito, luego las que lo tienen en el nombre.
      const score = name.startsWith(words[0]) ? 0 : words.every((w) => name.includes(w)) ? 1 : 2;
      return { v, score };
    })
    .filter((x): x is { v: NavView; score: number } => x !== null)
    .sort((a, b) => a.score - b.score || a.v.name.localeCompare(b.v.name, "es"))
    .map((x) => x.v);
}

// Recientes por usuario, en el navegador.
const recentKey = (userId: number) => `recentViews:${userId}`;

export function readRecents(userId: number): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(recentKey(userId)) ?? "[]");
    return Array.isArray(raw) ? raw.filter((r) => typeof r === "string") : [];
  } catch {
    return [];
  }
}

export function pushRecent(userId: number, route: string) {
  try {
    const next = [route, ...readRecents(userId).filter((r) => r !== route)].slice(0, 6);
    localStorage.setItem(recentKey(userId), JSON.stringify(next));
    return next;
  } catch {
    return [route];
  }
}
