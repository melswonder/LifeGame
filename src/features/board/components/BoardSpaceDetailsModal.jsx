import { Sparkles, X } from "lucide-react";

const COLOR_STYLES = {
  red: "border-red-700 bg-red-500 text-white",
  blue: "border-blue-700 bg-blue-500 text-white",
  green: "border-green-600 bg-green-400 text-green-950",
  purple: "border-purple-800 bg-purple-600 text-white",
  orange: "border-orange-600 bg-orange-400 text-orange-950",
  white: "border-gray-300 bg-white text-gray-800",
};

export default function BoardSpaceDetailsModal({
  isOpen,
  space,
  spaceTypeOptions,
  onClose,
}) {
  if (!isOpen || !space) {
    return null;
  }

  const colorStyle = COLOR_STYLES[space.color] ?? COLOR_STYLES.blue;
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
        className="board-space-preview-in w-full max-w-lg rounded-[28px] border border-white/70 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-t-[28px] bg-[linear-gradient(135deg,_#111827_0%,_#1f2937_55%,_#374151_100%)] px-6 py-5 text-white">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-amber-300/20 blur-xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-gray-300">
                Space Preview
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={`rounded-full border px-3 py-1 text-xs font-black shadow-sm ${colorStyle}`}
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

        <div className="space-y-5 p-6">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              内容
            </div>
            <div className="text-base font-bold leading-relaxed text-gray-800">
              {space.text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
