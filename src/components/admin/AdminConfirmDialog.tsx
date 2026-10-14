import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import { Trash2 } from 'lucide-react'
import './AdminConfirmDialog.css'

type AdminConfirmDialogProps = {
  itemName: string
  description: string
  onCancel: () => void
  onConfirm: () => void
}

export function AdminConfirmDialog({ itemName, description, onCancel, onConfirm }: AdminConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const previousFocus = document.activeElement
    cancelButtonRef.current?.focus()
    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') onCancel()
  }

  return (
    <div
      className="admin-confirm-backdrop"
      role="presentation"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => event.target === event.currentTarget && onCancel()}
    >
      <section className="admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <div className="admin-confirm-heading">
          <span className="admin-confirm-icon" aria-hidden="true"><Trash2 size={17} /></span>
          <p className="eyebrow">CONFIRMATION</p>
        </div>
        <h2 id={titleId}>Confirmer la suppression</h2>
        <p className="admin-confirm-description" id={descriptionId}>
          Supprimer <strong>{itemName}</strong> ? {description}
        </p>
        <div className="admin-confirm-actions">
          <button ref={cancelButtonRef} className="secondary-button" type="button" onClick={onCancel}>Annuler</button>
          <button className="primary-button admin-confirm-delete" type="button" onClick={onConfirm}><Trash2 size={15} /> Supprimer</button>
        </div>
      </section>
    </div>
  )
}