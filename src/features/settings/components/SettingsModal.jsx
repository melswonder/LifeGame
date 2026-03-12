import { useEffect, useRef, useState } from "react";
import {
  Palette,
  Briefcase,
  Download,
  FileJson,
  Image as ImageIcon,
  Minus,
  Plus,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import {
  formatCurrency,
  getBoardColorTheme,
} from "../../../game/lib/gameState.js";

const SETTING_SECTIONS = [
  { id: "general", label: "一般", icon: SlidersHorizontal },
  { id: "personal", label: "パーソナル", icon: UserCircle },
  { id: "io", label: "読み込み書き出し", icon: FileJson },
];

export default function SettingsModal({
  isOpen,
  onClose,
  isEditing,
  setIsEditing,
  players,
  jobOptions,
  minPlayers,
  maxPlayers,
  boardCount,
  minBoardSpaces,
  maxBoardSpaces,
  spaceTypeOptions,
  colorOptions,
  backgroundImageUrl,
  onUpdatePlayer,
  onChangePlayerCount,
  onChangeBoardCount,
  onAddBoardColor,
  onUpdateBoardColor,
  onRemoveBoardColor,
  onAddSpaceType,
  onUpdateSpaceType,
  onRemoveSpaceType,
  onUpdateBackgroundImage,
  onClearBackgroundImage,
  onAddJobOption,
  onUpdateJobOption,
  onRemoveJobOption,
  onExportState,
  onImportState,
  onResetState,
}) {
  const importInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState("general");

  useEffect(() => {
    if (isOpen) {
      setActiveSection("general");
    }
  }, [isOpen]);

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

  const handleBackgroundUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateBackgroundImage(
        typeof reader.result === "string" ? reader.result : null,
      );
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 text-sm font-black text-gray-900">マップ編集</div>
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-800">マップ編集モード</div>
            <div className="mt-1 text-xs text-gray-500">
              盤面のマス移動、内容編集、分岐作成を切り替えます。
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            aria-pressed={isEditing}
            className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
              isEditing
                ? "border-blue-700 bg-blue-600"
                : "border-gray-300 bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                isEditing ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
            <RouteStub /> マス数
          </div>
          <div className="mb-2 text-xs text-gray-500">
            {minBoardSpaces}〜{maxBoardSpaces}マスで変更できます。
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeBoardCount(boardCount - 1)}
              className="rounded-lg border border-gray-300 bg-white p-2 shadow-sm hover:bg-gray-100"
            >
              <Minus className="h-4 w-4 text-gray-700" />
            </button>
            <input
              type="number"
              min={minBoardSpaces}
              max={maxBoardSpaces}
              value={boardCount}
              onChange={(event) =>
                onChangeBoardCount(Number(event.target.value))
              }
              className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-bold text-gray-600">マス</span>
            <button
              type="button"
              onClick={() => onChangeBoardCount(boardCount + 1)}
              className="rounded-lg border border-gray-300 bg-white p-2 shadow-sm hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
            <Users className="h-4 w-4" /> 人数管理
          </div>
          <div className="mb-2 text-xs text-gray-500">
            {minPlayers}〜{maxPlayers}人で設定できます。
          </div>
          <select
            value={players.length}
            onChange={(event) =>
              onChangePlayerCount(Number(event.target.value))
            }
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: maxPlayers - minPlayers + 1 }).map(
              (_, index) => {
                const value = minPlayers + index;
                return (
                  <option key={value} value={value}>
                    {value}人
                  </option>
                );
              },
            )}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
          <Palette className="h-5 w-5" /> マス色の管理
        </div>
        <div className="mb-3 text-xs text-gray-500">
          マス編集で選べる色を追加できます。標準色は残したまま、追加色だけ削除できます。
        </div>
        <div className="space-y-3">
          {colorOptions.map((colorOption, index) => (
            <div
              key={`board-color-${colorOption.value}`}
              className="grid grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-white p-3 md:grid-cols-[1fr_120px_auto]"
            >
              <input
                type="text"
                value={colorOption.label}
                onChange={(event) =>
                  onUpdateBoardColor(index, { label: event.target.value })
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="色名"
              />
              <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                <input
                  type="color"
                  value={colorOption.fill}
                  onChange={(event) =>
                    onUpdateBoardColor(index, { fill: event.target.value })
                  }
                  className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span className="text-xs font-bold text-gray-600">
                  {colorOption.fill}
                </span>
              </label>
              <button
                type="button"
                onClick={() => onRemoveBoardColor(index)}
                disabled={!colorOption.isCustom}
                className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" /> 削除
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddBoardColor}
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" /> マス色を追加
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
          <Settings className="h-5 w-5" />
          マス種類の管理
        </div>
        <div className="mb-3 text-xs text-gray-500">
          マス色と同じように、種類を追加できます。標準種類は残したまま、追加種類だけ削除できます。
        </div>
        <div className="space-y-3">
          {spaceTypeOptions.map((spaceType, index) => (
            <div
              key={`space-type-${spaceType.value}`}
              className="space-y-3 rounded-xl border border-gray-200 bg-white p-3"
            >
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={spaceType.label}
                    onChange={(event) =>
                      onUpdateSpaceType(index, { label: event.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="種類名"
                  />
                  <div className="text-xs font-bold text-gray-500">
                    この種類の標準色
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveSpaceType(index)}
                  disabled={!spaceType.isCustom}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> 削除
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {colorOptions.map((colorOption) => {
                  const colorTheme = getBoardColorTheme(
                    colorOption.value,
                    colorOptions,
                  );

                  return (
                    <button
                      key={`${spaceType.value}-${colorOption.value}`}
                      type="button"
                      onClick={() =>
                        onUpdateSpaceType(index, {
                          defaultColor: colorOption.value,
                        })
                      }
                      className={`rounded-xl border-2 px-3 py-3 text-sm font-bold shadow-sm transition-all ${
                        spaceType.defaultColor === colorOption.value
                          ? "ring-4 ring-offset-2 ring-gray-300"
                          : "opacity-85 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: colorTheme.fillColor,
                        borderColor: colorTheme.borderColor,
                        color: colorTheme.textColor,
                      }}
                    >
                      {colorOption.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddSpaceType}
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" /> マス種類を追加
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
          <ImageIcon className="h-5 w-5" /> マップ背景画像
        </div>
        <div className="mb-3 text-xs text-gray-500">
          背景画像は JSON 保存にも含まれます。
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {backgroundImageUrl ? (
            <img
              src={backgroundImageUrl}
              alt="マップ背景"
              className="h-44 w-full object-cover"
            />
          ) : (
            <div className="flex h-44 items-center justify-center bg-gray-100 text-sm font-bold text-gray-400">
              背景画像は未設定です
            </div>
          )}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => backgroundInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <Upload className="h-4 w-4" /> 画像を選ぶ
          </button>
          <button
            type="button"
            onClick={onClearBackgroundImage}
            disabled={!backgroundImageUrl}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> 背景を外す
          </button>
        </div>
        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBackgroundUpload}
        />
      </div>
    </div>
  );

  const renderPersonalSettings = () => (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
          <Briefcase className="h-5 w-5" /> 職種の管理
        </div>
        <div className="mb-3 text-xs text-gray-500">
          職種の追加、削除、給料の変更ができます。
        </div>
        <div className="space-y-3">
          {jobOptions.map((job, index) => (
            <div
              key={`job-option-${index}`}
              className="grid grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-white p-3 md:grid-cols-[1fr_180px_auto]"
            >
              <input
                type="text"
                value={job.name}
                onChange={(event) =>
                  onUpdateJobOption(index, { name: event.target.value })
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="職種名"
              />
              <input
                type="number"
                min="0"
                value={job.salary}
                onChange={(event) =>
                  onUpdateJobOption(index, {
                    salary: Number(event.target.value),
                  })
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="給料"
              />
              <button
                type="button"
                onClick={() => onRemoveJobOption(index)}
                className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-300"
              >
                <Trash2 className="h-4 w-4" /> 削除
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddJobOption}
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" /> 職種を追加
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
          <UserCircle className="h-5 w-5" /> プレイヤーの編集
        </div>
        <div className="mb-3 text-xs text-gray-500">
          アイコン変更、名前変更、位置の調整、職業の変更ができます。
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
                    <img
                      src={player.imageUrl}
                      alt="icon"
                      className="h-full w-full object-cover"
                    />
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
                  onChange={(event) =>
                    onUpdatePlayer(player.id, { name: event.target.value })
                  }
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`プレイヤー ${player.id}`}
                />
              </div>

              <div className="flex items-center justify-between gap-2 rounded border border-gray-200 bg-gray-50 p-2">
                <span className="whitespace-nowrap text-xs font-bold text-gray-600">
                  現在位置 (0-{boardCount - 1}):
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePlayer(player.id, {
                        position: Math.max(0, player.position - 1),
                      })
                    }
                    className="rounded border border-gray-300 bg-white p-1.5 shadow-sm hover:bg-gray-100"
                    title="1マス戻る"
                  >
                    <Minus className="h-3 w-3 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={boardCount - 1}
                    value={player.position}
                    onChange={(event) =>
                      onUpdatePlayer(player.id, {
                        position: Math.max(
                          0,
                          Math.min(boardCount - 1, Number(event.target.value)),
                        ),
                      })
                    }
                    className="w-16 rounded border border-gray-300 p-1 text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePlayer(player.id, {
                        position: Math.min(boardCount - 1, player.position + 1),
                      })
                    }
                    className="rounded border border-gray-300 bg-white p-1.5 shadow-sm hover:bg-gray-100"
                    title="1マス進める"
                  >
                    <Plus className="h-3 w-3 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 rounded border border-gray-200 bg-gray-50 p-2">
                <span className="whitespace-nowrap text-xs font-bold text-gray-600">
                  職業:
                </span>
                <select
                  value={player.job}
                  onChange={(event) => {
                    const selectedJob = jobOptions.find(
                      (job) => job.name === event.target.value,
                    );
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
    </div>
  );

  const renderIoSettings = () => (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 text-sm font-black text-gray-900">JSON 管理</div>
        <div className="mb-3 text-xs text-gray-500">
          現在の盤面、分岐、マップ座標、背景画像、職種、プレイヤー状態を 1 つの
          JSON として保存します。
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
    </div>
  );

  const renderSectionContent = () => {
    if (activeSection === "personal") {
      return renderPersonalSettings();
    }

    if (activeSection === "io") {
      return renderIoSettings();
    }

    return renderGeneralSettings();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex w-[240px] shrink-0 flex-col border-r border-gray-200 bg-gray-950 text-white">
          <div className="flex items-center gap-3 border-b border-white/10 p-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="flex items-center gap-2 font-bold">システム設定</h3>
          </div>

          <div className="flex-1 space-y-2 p-4">
            {SETTING_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-white text-gray-900 shadow-lg"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              {
                SETTING_SECTIONS.find((section) => section.id === activeSection)
                  ?.label
              }
            </div>
            <div className="mt-1 text-2xl font-black text-gray-900">
              {activeSection === "general" && "一般設定"}
              {activeSection === "personal" && "パーソナル設定"}
              {activeSection === "io" && "読み込み / 書き出し"}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteStub() {
  return (
    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-amber-950">
      〇
    </div>
  );
}
