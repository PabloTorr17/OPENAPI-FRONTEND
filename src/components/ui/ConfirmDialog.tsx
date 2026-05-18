import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Eliminar',
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel} size="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-10 h-10 flex items-center justify-center"
            style={{ border: '3px solid var(--red)', background: '#fff0f0' }}
          >
            <AlertTriangle size={18} color="var(--red)" strokeWidth={2.5} />
          </div>
          <p className="text-sm text-gray-700 leading-relaxed pt-1">{message}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-ghost flex-1 justify-center">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-danger flex-1 justify-center"
          >
            {loading ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
