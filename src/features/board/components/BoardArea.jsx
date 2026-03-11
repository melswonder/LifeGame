import { useEffect, useMemo, useRef, useState } from "react";
import {
  GitBranch,
  LocateFixed,
  Minus,
  Plus,
  Route,
  Undo2,
} from "lucide-react";
import { buildBoardRouteSegments } from "../../../game/lib/boardBranches.js";
import {
  BOARD_CANVAS,
  BOARD_FORESTS,
  BOARD_HOUSES,
  BOARD_LAKES,
  BOARD_LANDMARKS,
  BOARD_MOUNTAINS,
  BOARD_NODE_SIZE,
  BOARD_RIVER_PATH,
  buildPolylinePath,
  getBoardLayout,
  SCENIC_TRAILS,
} from "../../../game/lib/boardMap.js";

const SPACE_COLOR_STYLES = {
  red: {
    bgColor: "bg-red-500 border-red-700",
    textColor: "text-white",
  },
  blue: {
    bgColor: "bg-blue-500 border-blue-700",
    textColor: "text-white",
  },
  green: {
    bgColor: "bg-green-400 border-green-600",
    textColor: "text-green-950",
  },
  purple: {
    bgColor: "bg-purple-600 border-purple-800",
    textColor: "text-white",
  },
  orange: {
    bgColor: "bg-orange-400 border-orange-600",
    textColor: "text-orange-950",
  },
  white: {
    bgColor: "bg-white border-gray-300",
    textColor: "text-gray-800",
  },
};

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 1.1;
const DEFAULT_ZOOM = 0.34;
const SPACE_EDGE_PADDING = BOARD_NODE_SIZE / 2 + 24;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function BoardArea({
  board,
  branches,
  backgroundImageUrl,
  players,
  isEditing,
  mapEditTool,
  branchStartId,
  onEditSpace,
  onPreviewSpace,
  onMoveSpace,
  onChangeEditTool,
  onSelectBranchSpace,
  onRemoveLastBranch,
}) {
  const viewportRef = useRef(null);
  const dragStateRef = useRef(null);
  const spaceDragRef = useRef(null);
  const centeredRef = useRef(false);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [isDragging, setIsDragging] = useState(false);

  const mapSpaces = useMemo(() => {
    const layout = getBoardLayout(board.length);
    return board.map((space, index) => ({
      ...layout[index],
      ...space,
    }));
  }, [board]);

  const routePaths = useMemo(
    () =>
      buildBoardRouteSegments(mapSpaces, branches).map((points) =>
        buildPolylinePath(points),
      ),
    [branches, mapSpaces],
  );

  const scenicTrailPaths = useMemo(
    () => SCENIC_TRAILS.map((trail) => buildPolylinePath(trail)),
    [],
  );
  const branchStartIds = useMemo(
    () => new Set((branches ?? []).map((branch) => branch.startId)),
    [branches],
  );
  const branchEndIds = useMemo(
    () => new Set((branches ?? []).map((branch) => branch.endId)),
    [branches],
  );

  const scaledWidth = BOARD_CANVAS.width * zoom;
  const scaledHeight = BOARD_CANVAS.height * zoom;

  const centerViewport = (targetZoom = zoom) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollLeft = Math.max(
      0,
      (BOARD_CANVAS.width * targetZoom - viewport.clientWidth) / 2,
    );
    viewport.scrollTop = Math.max(
      0,
      (BOARD_CANVAS.height * targetZoom - viewport.clientHeight) / 2,
    );
  };

  const applyZoom = (nextZoom, mode = "preserve") => {
    const boundedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const viewport = viewportRef.current;

    if (!viewport) {
      setZoom(boundedZoom);
      return;
    }

    const currentCenterX = viewport.scrollLeft + viewport.clientWidth / 2;
    const currentCenterY = viewport.scrollTop + viewport.clientHeight / 2;
    const ratio = boundedZoom / zoom;

    setZoom(boundedZoom);

    window.requestAnimationFrame(() => {
      if (mode === "center") {
        centerViewport(boundedZoom);
        return;
      }

      viewport.scrollLeft = currentCenterX * ratio - viewport.clientWidth / 2;
      viewport.scrollTop = currentCenterY * ratio - viewport.clientHeight / 2;
    });
  };

  const fitToView = () => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const fitZoom = clamp(
      Math.min(
        (viewport.clientWidth - 40) / BOARD_CANVAS.width,
        (viewport.clientHeight - 40) / BOARD_CANVAS.height,
      ),
      MIN_ZOOM,
      0.46,
    );

    setZoom(fitZoom);
    window.requestAnimationFrame(() => centerViewport(fitZoom));
  };

  useEffect(() => {
    if (centeredRef.current || !viewportRef.current) {
      return;
    }

    centeredRef.current = true;
    window.requestAnimationFrame(() => centerViewport(DEFAULT_ZOOM));
  }, []);

  const handlePointerDown = (event) => {
    const viewport = viewportRef.current;
    if (
      !viewport ||
      event.button !== 0 ||
      event.target.closest("[data-space-button='true']")
    ) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    setIsDragging(true);
    viewport.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const viewport = viewportRef.current;
    const dragState = dragStateRef.current;

    if (!viewport || !dragState) {
      return;
    }

    viewport.scrollLeft = dragState.scrollLeft - (event.clientX - dragState.x);
    viewport.scrollTop = dragState.scrollTop - (event.clientY - dragState.y);
  };

  const handlePointerEnd = (event) => {
    const viewport = viewportRef.current;
    const dragState = dragStateRef.current;

    if (!viewport || !dragState) {
      return;
    }

    dragStateRef.current = null;
    setIsDragging(false);

    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="relative h-full overflow-hidden rounded-2xl border-4 border-green-200 bg-green-100 shadow-inner">
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-start justify-between p-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 p-2 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() => applyZoom(zoom - 0.1)}
            className="rounded-xl bg-gray-900 p-2 text-white hover:bg-gray-800"
            title="縮小"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="min-w-16 text-center text-xs font-bold text-gray-700">
            {Math.round(zoom * 100)}%
          </div>
          <button
            type="button"
            onClick={() => applyZoom(zoom + 0.1)}
            className="rounded-xl bg-gray-900 p-2 text-white hover:bg-gray-800"
            title="拡大"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={fitToView}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
          >
            全体表示
          </button>
          <button
            type="button"
            onClick={() => applyZoom(DEFAULT_ZOOM, "center")}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
          >
            標準
          </button>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-2 text-xs font-bold text-gray-700 shadow-lg backdrop-blur">
          <LocateFixed className="h-4 w-4 text-emerald-600" />
          {isEditing
            ? mapEditTool === "branch"
              ? branchStartId === null
                ? "分岐の開始マスを選択"
                : `開始マス ${branchStartId} を選択済み / 合流先を選択`
              : "マスをドラッグで移動 / クリックで編集"
            : "ドラッグで移動 / ボタンで拡大縮小"}
          {isEditing && (
            <span className="animate-pulse rounded-full bg-blue-500 px-3 py-1 text-white">
              編集中
            </span>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="absolute left-6 top-24 z-30 flex flex-wrap items-center gap-2 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() => {
              onChangeEditTool("space");
            }}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
              mapEditTool === "space"
                ? "bg-gray-900 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Route className="h-4 w-4" /> マス編集
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeEditTool("branch");
            }}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
              mapEditTool === "branch"
                ? "bg-amber-500 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <GitBranch className="h-4 w-4" /> 分岐作成
          </button>
          <button
            type="button"
            onClick={onRemoveLastBranch}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
          >
            <Undo2 className="h-4 w-4" /> 最後の分岐を解除
          </button>
        </div>
      )}

      <div
        ref={viewportRef}
        className={`h-full overflow-auto p-6 pt-24 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div
          className="relative"
          style={{ width: scaledWidth, height: scaledHeight }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: BOARD_CANVAS.width,
              height: BOARD_CANVAS.height,
              transform: `scale(${zoom})`,
            }}
          >
            {backgroundImageUrl && (
              <img
                src={backgroundImageUrl}
                alt="マップ背景"
                className="absolute inset-0 h-full w-full rounded-[48px] object-cover opacity-70"
              />
            )}
            <div
              className={`absolute inset-0 rounded-[48px] bg-[radial-gradient(circle_at_top_left,_#f0fdf4_0%,_#dcfce7_35%,_#bbf7d0_70%,_#a7f3d0_100%)] ${
                backgroundImageUrl ? "opacity-70" : ""
              }`}
            />
            <div className="absolute inset-0 rounded-[48px] bg-[radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.18)_0%,_transparent_45%)]" />
            {backgroundImageUrl && (
              <div className="absolute inset-0 rounded-[48px] bg-[linear-gradient(180deg,_rgba(236,253,245,0.16)_0%,_rgba(240,253,250,0.08)_100%)]" />
            )}

            <svg
              viewBox={`0 0 ${BOARD_CANVAS.width} ${BOARD_CANVAS.height}`}
              className="absolute inset-0 h-full w-full"
            >
              <path
                d={buildPolylinePath(BOARD_RIVER_PATH)}
                fill="none"
                stroke="#93c5fd"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="38"
                opacity="0.7"
              />
              <path
                d={buildPolylinePath(BOARD_RIVER_PATH)}
                fill="none"
                stroke="#dbeafe"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="20"
                opacity="0.9"
              />

              {BOARD_LAKES.map((lake) => (
                <g key={`${lake.x}-${lake.y}`}>
                  <ellipse
                    cx={lake.x}
                    cy={lake.y}
                    rx={lake.rx}
                    ry={lake.ry}
                    fill={lake.fill}
                    opacity="0.88"
                  />
                  <ellipse
                    cx={lake.x}
                    cy={lake.y}
                    rx={lake.rx}
                    ry={lake.ry}
                    fill="none"
                    stroke={lake.stroke}
                    strokeWidth="10"
                    opacity="0.95"
                  />
                  <ellipse
                    cx={lake.x - 38}
                    cy={lake.y + 8}
                    rx="34"
                    ry="22"
                    fill="#ecfccb"
                    opacity="0.95"
                  />
                </g>
              ))}

              {BOARD_FORESTS.map((tree) => (
                <circle
                  key={`${tree.x}-${tree.y}`}
                  cx={tree.x}
                  cy={tree.y}
                  r={tree.r}
                  fill={tree.color}
                  opacity="0.9"
                />
              ))}

              {BOARD_MOUNTAINS.map((mountain, index) => (
                <g key={index}>
                  <polygon
                    points={mountain.points
                      .map((point) => `${point.x},${point.y}`)
                      .join(" ")}
                    fill={mountain.fill}
                    opacity="0.95"
                  />
                  <polygon
                    points={[
                      mountain.points[0],
                      {
                        x: (mountain.points[0].x + mountain.points[1].x) / 2,
                        y: (mountain.points[0].y + mountain.points[1].y) / 2,
                      },
                      mountain.points[1],
                      {
                        x: (mountain.points[1].x + mountain.points[2].x) / 2,
                        y: (mountain.points[1].y + mountain.points[2].y) / 2,
                      },
                    ]
                      .map((point) => `${point.x},${point.y}`)
                      .join(" ")}
                    fill="#f8fafc"
                    opacity="0.82"
                  />
                </g>
              ))}

              {scenicTrailPaths.map((trailPath, index) => (
                <path
                  key={index}
                  d={trailPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeDasharray="20 18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="18"
                  opacity="0.45"
                />
              ))}

              {routePaths.map((routePath, index) => (
                <g key={index}>
                  <path
                    d={routePath}
                    fill="none"
                    stroke="#92400e"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="42"
                    opacity="0.95"
                  />
                  <path
                    d={routePath}
                    fill="none"
                    stroke="#fcd34d"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="26"
                    opacity="0.95"
                  />
                  <path
                    d={routePath}
                    fill="none"
                    stroke="#fef3c7"
                    strokeDasharray="8 18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="6"
                    opacity="0.95"
                  />
                </g>
              ))}
            </svg>

            {BOARD_HOUSES.map((house) => (
              <div
                key={`${house.x}-${house.y}`}
                className="absolute"
                style={{ left: house.x, top: house.y }}
              >
                <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 -translate-y-[18px] border-b-[18px] border-l-[24px] border-r-[24px] border-b-rose-900 border-l-transparent border-r-transparent" />
                <div
                  className="rounded-t-md border-4 border-amber-950"
                  style={{
                    width: house.width,
                    height: house.height,
                    backgroundColor: house.color,
                  }}
                />
              </div>
            ))}

            {BOARD_LANDMARKS.map((landmark) => (
              <div
                key={`${landmark.x}-${landmark.y}`}
                className={`absolute rounded-full border px-4 py-2 text-xs font-black shadow-md ${landmark.tone}`}
                style={{ left: landmark.x, top: landmark.y }}
              >
                {landmark.label}
              </div>
            ))}

            {mapSpaces.map((space) => {
              const playersHere = players.filter(
                (player) => player.position === space.id,
              );
              const { bgColor, textColor } =
                SPACE_COLOR_STYLES[space.color] ?? SPACE_COLOR_STYLES.blue;
              const accentClass =
                space.type === "stop"
                  ? "scale-[1.08] ring-4 ring-white/70"
                  : space.type === "goal"
                    ? "scale-[1.12] ring-4 ring-yellow-100"
                    : "";
              const isBranchStart = branchStartIds.has(space.id);
              const isBranchEnd = branchEndIds.has(space.id);
              const isBranchDraft = branchStartId === space.id;

              return (
                <button
                  key={space.id}
                  type="button"
                  data-space-button="true"
                  className={`absolute z-20 flex aspect-square flex-col items-center justify-center rounded-[28px] border-4 p-2 text-center shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-1 ${bgColor} ${accentClass} ${
                    isEditing && mapEditTool === "space"
                      ? "cursor-pointer ring-blue-400 hover:ring-4"
                      : isEditing && mapEditTool === "branch"
                        ? "cursor-pointer ring-amber-300 hover:ring-4"
                        : "cursor-default"
                  }`}
                  style={{
                    left: space.x - BOARD_NODE_SIZE / 2,
                    top: space.y - BOARD_NODE_SIZE / 2,
                    width: BOARD_NODE_SIZE,
                    height: BOARD_NODE_SIZE,
                  }}
                  onClick={() => {
                    if (!isEditing) {
                      onPreviewSpace(space);
                      return;
                    }

                    if (mapEditTool !== "branch") {
                      return;
                    }

                    onSelectBranchSpace(space.id);
                  }}
                  onPointerDown={(event) => {
                    if (
                      !isEditing ||
                      mapEditTool !== "space" ||
                      event.button !== 0
                    ) {
                      return;
                    }

                    event.stopPropagation();

                    const viewport = viewportRef.current;
                    if (!viewport) {
                      return;
                    }

                    const rect = viewport.getBoundingClientRect();
                    const pointerX =
                      (viewport.scrollLeft + event.clientX - rect.left) / zoom;
                    const pointerY =
                      (viewport.scrollTop + event.clientY - rect.top) / zoom;

                    spaceDragRef.current = {
                      id: space.id,
                      pointerId: event.pointerId,
                      offsetX: pointerX - space.x,
                      offsetY: pointerY - space.y,
                      startX: space.x,
                      startY: space.y,
                      moved: false,
                    };

                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    const dragState = spaceDragRef.current;
                    const viewport = viewportRef.current;

                    if (
                      !isEditing ||
                      mapEditTool !== "space" ||
                      !dragState ||
                      !viewport ||
                      dragState.id !== space.id ||
                      dragState.pointerId !== event.pointerId
                    ) {
                      return;
                    }

                    const rect = viewport.getBoundingClientRect();
                    const nextX =
                      (viewport.scrollLeft + event.clientX - rect.left) / zoom -
                      dragState.offsetX;
                    const nextY =
                      (viewport.scrollTop + event.clientY - rect.top) / zoom -
                      dragState.offsetY;
                    const clampedX = clamp(
                      nextX,
                      SPACE_EDGE_PADDING,
                      BOARD_CANVAS.width - SPACE_EDGE_PADDING,
                    );
                    const clampedY = clamp(
                      nextY,
                      SPACE_EDGE_PADDING,
                      BOARD_CANVAS.height - SPACE_EDGE_PADDING,
                    );

                    if (
                      Math.abs(clampedX - dragState.startX) > 4 ||
                      Math.abs(clampedY - dragState.startY) > 4
                    ) {
                      dragState.moved = true;
                    }

                    onMoveSpace(space.id, { x: clampedX, y: clampedY });
                  }}
                  onPointerUp={(event) => {
                    const dragState = spaceDragRef.current;

                    if (
                      !isEditing ||
                      mapEditTool !== "space" ||
                      !dragState ||
                      dragState.id !== space.id ||
                      dragState.pointerId !== event.pointerId
                    ) {
                      return;
                    }

                    if (
                      event.currentTarget.hasPointerCapture(event.pointerId)
                    ) {
                      event.currentTarget.releasePointerCapture(
                        event.pointerId,
                      );
                    }

                    spaceDragRef.current = null;

                    if (!dragState.moved) {
                      onEditSpace(space);
                    }
                  }}
                  onPointerCancel={(event) => {
                    const dragState = spaceDragRef.current;

                    if (
                      !dragState ||
                      dragState.id !== space.id ||
                      dragState.pointerId !== event.pointerId
                    ) {
                      return;
                    }

                    if (
                      event.currentTarget.hasPointerCapture(event.pointerId)
                    ) {
                      event.currentTarget.releasePointerCapture(
                        event.pointerId,
                      );
                    }

                    spaceDragRef.current = null;
                  }}
                >
                  <div className="absolute -left-2 -top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-800 bg-white text-[10px] font-black text-gray-800 shadow-sm">
                    {space.id}
                  </div>

                  {(isBranchStart || isBranchEnd || isBranchDraft) && (
                    <div className="absolute -right-2 -top-2 z-20 rounded-full border border-gray-800 bg-white px-2 py-1 text-[9px] font-black text-gray-800 shadow-sm">
                      {isBranchDraft
                        ? "選択中"
                        : isBranchStart
                          ? "分岐"
                          : "合流"}
                    </div>
                  )}

                  <div
                    className={`line-clamp-3 text-[10px] font-bold leading-tight ${textColor}`}
                  >
                    {space.text}
                  </div>

                  <div className="absolute -bottom-3 flex w-full justify-center px-1">
                    <div className="flex flex-wrap justify-center gap-0.5 rounded-full border border-gray-200 bg-white/90 px-1.5 py-0.5 shadow-sm backdrop-blur-md">
                      {playersHere.map((player) => (
                        <div
                          key={player.id}
                          className={`flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-gray-800 text-[12px] leading-none shadow-md ${player.color}`}
                          title={player.name}
                        >
                          {player.imageUrl ? (
                            <img
                              src={player.imageUrl}
                              alt={player.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            player.icon
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
