import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const maxWidths = { sm: '380px', md: '520px', lg: '720px' }

export default function Modal({ open, title, onClose, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="panel w-full"
        style={{ maxWidth: maxWidths[size], animation: 'modalIn 120ms ease-out' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 bg-[var(--ink)]"
        >
          <h2
            id="modal-title"
            className="font-display text-xl font-black uppercase tracking-tight text-[var(--paper)]"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translate(4px, 8px); }
          to   { opacity: 1; transform: translate(0, 0); }
        }
      `}</style>
    </div>
  )
}
