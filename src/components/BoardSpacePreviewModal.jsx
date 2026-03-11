import {
  Briefcase,
  CircleDollarSign,
  CopyMinus,
  Route,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { formatCurrency } from "../lib/gameState.js";

const TYPE_LABELS = {
  start: "スタート",
  normal: "通常",
  lucky: "ラッキー",
  danger: "ピンチ",
  payday: "給料日",
  stop: "停止",
  goal: "ゴール",
};

const COLOR_STYLES = {
  red: "border-red-700 bg-red-500 text-white",
  blue: "border-blue-700 bg-blue-500 text-white",
  green: "border-green-600 bg-green-400 text-green-950",
  purple: "border-purple-800 bg-purple-600 text-white",
  orange: "border-orange-600 bg-orange-400 text-orange-950",
  white: "border-gray-300 bg-white text-gray-800",
};

const buildEffects = (space) => {
  const effects = [];

  if (space.money > 0) {
    effects.push({
      key: "money-plus",
      icon: CircleDollarSign,
      tone: "bg-emerald-50 border-emerald-200 text-emerald-900",
      label: `所持金 +${formatCurrency(space.money)}`,
    });
  }

  if (space.money < 0) {
    effects.push({
      key: "money-minus",
      icon: CircleDollarSign,
      tone: "bg-rose-50 border-rose-200 text-rose-900",
      label: `所持金 ${formatCurrency(space.money)}`,
    });
  }

  if (space.addCarPeople > 0) {
    effects.push({
      key: "car-plus",
      icon: Users,
      tone: "bg-sky-50 border-sky-200 text-sky-900",
      label: `同乗者 +${space.addCarPeople}`,
    });
  }

  if (space.addCarPeople < 0) {
    effects.push({
      key: "car-minus",
      icon: Users,
      tone: "bg-sky-50 border-sky-200 text-sky-900",
      label: `同乗者 ${space.addCarPeople}`,
    });
  }

  if (space.addDebt > 0) {
    effects.push({
      key: "debt-plus",
      icon: CopyMinus,
      tone: "bg-amber-50 border-amber-200 text-amber-900",
      label: `借金 +${space.addDebt}`,
    });
  }

  if (space.addDebt < 0) {
    effects.push({
      key: "debt-minus",
      icon: CopyMinus,
      tone: "bg-amber-50 border-amber-200 text-amber-900",
      label: `借金 ${space.addDebt}`,
    });
  }

  if (space.type === "payday") {
    effects.push({
      key: "payday",
      icon: Briefcase,
      tone: "bg-blue-50 border-blue-200 text-blue-900",
      label: "到着時に給料を受け取る",
    });
  }

  if (space.color === "purple") {
    effects.push({
      key: "purple-stop",
      icon: Route,
      tone: "bg-violet-50 border-violet-200 text-violet-900",
      label: "移動中でもこのマスで止まる",
    });
  }

  return effects;
};

export default function BoardSpacePreviewModal({ isOpen, space, onClose }) {
  if (!isOpen || !space) {
    return null;
  }

  const effects = buildEffects(space);
  const colorStyle = COLOR_STYLES[space.color] ?? COLOR_STYLES.blue;

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
                  {TYPE_LABELS[space.type] ?? "通常"}
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
              テキスト
            </div>
            <div className="text-base font-bold leading-relaxed text-gray-800">{space.text}</div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              エフェクト
            </div>
            {effects.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {effects.map((effect) => {
                  const Icon = effect.icon;

                  return (
                    <div
                      key={effect.key}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-bold ${effect.tone}`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{effect.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm font-bold text-gray-500">
                特別なエフェクトはありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
