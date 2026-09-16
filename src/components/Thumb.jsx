import { useState } from "react";
import { api } from "../api";
import { contentTypeClass, contentTypeIcon } from "../contentTypes";

/** Miniatura reutilizable para tarjetas de contenido en cuadrícula: muestra
 * la imagen real para fotos, o un degradado + icono por tipo para
 * video/clip musical (o si la imagen no carga, p.ej. las URLs de ejemplo
 * del seed). */
export default function Thumb({ item }) {
  const [failed, setFailed] = useState(false);
  const showImage = item.content_type === "FOTO" && !failed;
  return (
    <div className={`grid-thumb ${contentTypeClass(item.content_type)}`}>
      {showImage ? (
        <img src={api.mediaUrl(item.media_url)} alt={item.title} onError={() => setFailed(true)} />
      ) : (
        <span className="thumb-icon">{contentTypeIcon(item.content_type)}</span>
      )}
    </div>
  );
}
