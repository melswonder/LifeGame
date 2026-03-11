import { useRef } from "react";
import {
  Minus,
  Plus,
  Settings,
  Upload,
  Download,
  RotateCcw,
  UserCircle,
  X,
} from "lucide-react";
import { formatCurrency } from "../lib/gameState.js";

export default function SettingsModal({
  isOpen,
  onClose,
  isEditing,
  setIsEditing,
  players,
  jobOptions,
  minPlayers,
  maxPlayers,
  onUpdatePlayer,
  onChangePlayerCount,
  onExportState,
  onImportState,
  onResetState,
}) {
  const importInputRef = useRef(null);

  if (!isOpen) {
    return null;
  }

  const handleImageUpload = (playerId, event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdatePlayer(playerId, { imageUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between bg-gray-900 p-4 text-white">
          <h3 className="flex items-center gap-2 font-bold">
            <Settings className="h-5 w-5" /> システム設定
          </h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-6">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <div className="font-bold text-gray-800">マップ編集モード</div>
              <div className="mt-1 text-xs text-gray-500">
                盤面のマスをドラッグして移動、クリックで効果を編集、分岐作成モードも使えます
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEditing ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  isEditing ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <div className="font-bold text-gray-800">プレイヤー人数変更</div>
              <div className="mt-1 text-xs text-gray-500">
                {minPlayers}〜{maxPlayers}人で設定できます
              </div>
            </div>
            <select
              value={players.length}
              onChange={(event) => onChangePlayerCount(Number(event.target.value))}
              className="rounded-lg border border-gray-300 p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: maxPlayers - minPlayers + 1 }).map((_, index) => {
                const value = minPlayers + index;
                return (
                  <option key={value} value={value}>
                    {value}人
                  </option>
                );
              })}
            </select>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2 font-bold text-gray-800">
              <UserCircle className="h-5 w-5" /> プレイヤーの編集 (アイコン/名前/位置/職業)
            </div>
            <div className="mb-3 text-xs text-gray-500">
              アイコン変更、マス目の強制移動、職業の変更が行えます。
            </div>
            <div className="space-y-4">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <label
                      className={`relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gray-300 text-lg shadow-sm transition-opacity hover:opacity-80 ${player.color}`}
                      title="画像をアップロード"
                    >
                      {player.imageUrl ? (
                        <img src={player.imageUrl} alt="icon" className="h-full w-full object-cover" />
                      ) : (
                        player.icon
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleImageUpload(player.id, event)}
                      />
                    </label>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(event) => onUpdatePlayer(player.id, { name: event.target.value })}
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`プレイヤー ${player.id}`}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded border border-gray-200 bg-gray-50 p-2">
                    <span className="whitespace-nowrap text-xs font-bold text-gray-600">
                      現在位置 (0-99):
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdatePlayer(player.id, { position: Math.max(0, player.position - 1) })
                        }
                        className="rounded border border-gray-300 bg-white p-1.5 shadow-sm hover:bg-gray-100"
                        title="1マス戻る"
                      >
                        <Minus className="h-3 w-3 text-gray-600" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={player.position}
                        onChange={(event) =>
                          onUpdatePlayer(player.id, {
                            position: Math.max(0, Math.min(99, Number(event.target.value))),
                          })
                        }
                        className="w-14 rounded border border-gray-300 p-1 text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdatePlayer(player.id, { position: Math.min(99, player.position + 1) })
                        }
                        className="rounded border border-gray-300 bg-white p-1.5 shadow-sm hover:bg-gray-100"
                        title="1マス進める"
                      >
                        <Plus className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded border border-gray-200 bg-gray-50 p-2">
                    <span className="whitespace-nowrap text-xs font-bold text-gray-600">職業:</span>
                    <select
                      value={player.job}
                      onChange={(event) => {
                        const selectedJob = jobOptions.find((job) => job.name === event.target.value);
                        if (selectedJob) {
                          onUpdatePlayer(player.id, {
                            job: selectedJob.name,
                            salary: selectedJob.salary,
                          });
                        }
                      }}
                      className="flex-1 rounded border border-gray-300 bg-white p-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {jobOptions.map((job) => (
                        <option key={job.name} value={job.name}>
                          {`${job.name} (給料: ${formatCurrency(job.salary)})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 font-bold text-gray-800">JSON 管理</div>
            <div className="mb-3 text-xs text-gray-500">
              現在の盤面、分岐、マップ座標、プレイヤー状態を 1 つの JSON として書き出し、後で読み戻せます。
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={onExportState}
                className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white hover:bg-gray-800"
              >
                <Download className="h-4 w-4" /> 書き出し
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                <Upload className="h-4 w-4" /> 読み込み
              </button>
              <button
                type="button"
                onClick={onResetState}
                className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-300"
              >
                <RotateCcw className="h-4 w-4" /> 初期化
              </button>
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onImportState(file);
                }
                event.target.value = "";
              }}
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full shrink-0 rounded-xl bg-gray-200 py-3 font-bold text-gray-800 hover:bg-gray-300"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
