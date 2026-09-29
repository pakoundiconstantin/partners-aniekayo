import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { useAppData } from '../services/dataStore'

export function TeamViewer({ onClose }: { onClose: () => void }) {
  const { data } = useAppData()
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(1)
  const sheet = data.teamSheets[active]

  function move(direction: number) {
    setActive((current) => (current + direction + data.teamSheets.length) % data.teamSheets.length)
    setZoom(1)
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="team-modal" role="dialog" aria-modal="true" aria-labelledby="team-modal-title"><header className="modal-header"><h2 id="team-modal-title">Équipe et compétences</h2><span>Fiche {sheet?.id ?? 0} / {data.teamSheets.length}</span><button className="icon-button" type="button" onClick={onClose} aria-label="Fermer"><X size={19} /></button></header><div className="viewer-toolbar"><button className="icon-button" type="button" onClick={() => setZoom((value) => Math.max(0.5, value - 0.2))} aria-label="Réduire le zoom"><ZoomOut size={18} /></button><span>{Math.round(zoom * 100)}%</span><button className="icon-button" type="button" onClick={() => setZoom((value) => Math.min(2, value + 0.2))} aria-label="Augmenter le zoom"><ZoomIn size={18} /></button></div><div className="viewer-stage">{sheet && <img src={sheet.image} alt={sheet.title} style={{ transform: `scale(${zoom})` }} />}</div><footer className="viewer-footer"><button type="button" className="secondary-button" onClick={() => move(-1)}><ChevronLeft size={17} /> Précédent</button><button type="button" className="secondary-button" onClick={() => move(1)}>Suivant <ChevronRight size={17} /></button></footer></section></div>
}