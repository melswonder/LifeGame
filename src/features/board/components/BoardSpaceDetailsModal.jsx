import { Sparkles, X } from "lucide-react";
import { getBoardColorTheme } from "../../../game/lib/gameState.js";

export default function BoardSpaceDetailsModal({
  isOpen,
  space,
  colorOptions,
  spaceTypeOptions,
  onClose,
}) {
  if (!isOpen || !space) {
    return null;
  }

  const colorTheme = getBoardColorTheme(space.color, colorOptions);
  const typeLabel =
    spaceTypeOptions?.find((spaceType) => spaceType.value === space.type)
      ?.label ??
    space.type ??
    "通常";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="board-space-preview-in max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-t-[28px] bg-[linear-gradient(135deg,_#111827_0%,_#1f2937_55%,_#374151_100%)] px-7 py-6 text-white">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-amber-300/20 blur-xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-gray-300">
                Space Preview
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="rounded-full border px-3 py-1 text-xs font-black shadow-sm"
                  style={{
                    backgroundColor: colorTheme.fillColor,
                    borderColor: colorTheme.borderColor,
                    color: colorTheme.textColor,
                  }}
                >
                  マス {space.id}
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-gray-100">
                  {typeLabel}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                <Sparkles className="h-4 w-4" /> このマスの内容
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(88vh-150px)] space-y-5 overflow-y-auto p-7">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              内容
            </div>
            <div className="whitespace-pre-wrap break-words text-lg font-bold leading-relaxed text-gray-800">
              {space.text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
