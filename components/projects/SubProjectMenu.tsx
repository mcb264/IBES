"use client";

type Props = {
  paused: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePause: () => void;
  onDelete: () => void;
};

export default function SubProjectMenu({
  paused,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onTogglePause,
  onDelete,
}: Props) {
  return (
    <div
      className="subproject-menu absolute right-0 top-8 z-30 w-56 rounded-xl border border-white/15 p-2 shadow-2xl"
      style={{ backgroundColor: "#0c1116" }}
    >
      <button disabled={!canMoveUp} onClick={onMoveUp} className="w-full rounded-lg px-3 py-2 text-left text-xs text-muted hover:bg-white/[.06] disabled:opacity-30">↑ Monter</button>
      <button disabled={!canMoveDown} onClick={onMoveDown} className="w-full rounded-lg px-3 py-2 text-left text-xs text-muted hover:bg-white/[.06] disabled:opacity-30">↓ Descendre</button>
      <div className="my-2 border-t border-white/10" />
      <button onClick={onTogglePause} className="w-full rounded-lg px-3 py-2 text-left text-xs text-muted hover:bg-white/[.06]">
        {paused ? "Reprendre le sous-projet" : "Mettre en attente"}
      </button>
      <button onClick={onDelete} className="w-full rounded-lg px-3 py-2 text-left text-xs text-alert hover:bg-white/[.06]">Supprimer le projet</button>
    </div>
  );
}
