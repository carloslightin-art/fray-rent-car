import { X } from 'lucide-react'

function FullImageModal({ imageUrl, alt = 'Foto del vehículo', onClose }) {
  if (!imageUrl) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Foto completa del vehículo"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar foto completa"
        className="absolute right-4 top-4 z-[101] grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/70 text-white shadow-xl transition hover:border-[#d4af37] hover:text-[#d4af37]"
      >
        <X className="h-6 w-6" />
      </button>

      <img
        src={imageUrl}
        alt={alt}
        className="max-h-[92vh] max-w-[96vw] object-contain"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  )
}

export default FullImageModal
