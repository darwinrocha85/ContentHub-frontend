export const CONTENT_TYPES = [
  { value: "VIDEO", label: "Video", icon: "🎬" },
  { value: "CLIP_MUSICAL", label: "Clip musical", icon: "🎵" },
  { value: "FOTO", label: "Foto", icon: "📷" },
];

export function contentTypeLabel(value) {
  return CONTENT_TYPES.find((t) => t.value === value)?.label || value;
}

export function contentTypeIcon(value) {
  return CONTENT_TYPES.find((t) => t.value === value)?.icon || "📄";
}

/** Clase CSS por tipo de contenido, para pintar cada uno con su propio
 * color/gradiente (ver index.css: .tag-*, .grid-thumb.type-*). */
export function contentTypeClass(value) {
  return `type-${(value || "").toLowerCase().replace(/_/g, "-")}`;
}

export function formatPrice(amount, currency = "eur") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}
