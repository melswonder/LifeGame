import { useEffect, useState } from "react";
import { Palette, Save, X } from "lucide-react";

const COLOR_BUTTON_STYLES = {
  red: "bg-red-500 border-red-700 text-white",
  blue: "bg-blue-500 border-blue-700 text-white",
  green: "bg-green-400 border-green-600 text-green-950",
  purple: "bg-purple-600 border-purple-800 text-white",
  orange: "bg-orange-400 border-orange-600 text-orange-950",
  white: "bg-white border-gray-300 text-gray-800",
};

export default function BoardSpaceModal({
  isOpen,
  space,
  colorOptions,
  onClose,
  onSave,
}) {
  const [text, setText] = useState("");
  const [color, setColor] = useState("blue");

  useEffect(() => {
    if (!space) {
      return;
    }

    setText(space.text ?? "");
    setColor(space.color ?? "blue");
  }, [space]);

  if (!isOpen || !space) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-2xl bg-gray-900 px-5 py-4 text-white">
          <div>
            <div className="text-sm font-bold">マス {space.id} を編集</div>
            <div className="text-xs text-gray-300">テキストと色を変更できます</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">マスのテキスト</label>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ここに表示する内容を入力"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800">
              <Palette className="h-4 w-4" /> マスの色
            </div>
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`rounded-xl border-2 px-3 py-3 text-sm font-bold shadow-sm transition-all ${
                    COLOR_BUTTON_STYLES[option.value]
                  } ${color === option.value ? "ring-4 ring-offset-2 ring-gray-300" : "opacity-80 hover:opacity-100"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-300"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => onSave({ ...space, text, color })}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" /> 保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
