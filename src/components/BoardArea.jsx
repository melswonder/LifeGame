import { useMemo } from "react";

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

const PathLine = ({ dir }) => {
  const pathColor = "bg-amber-300 border-amber-400 border-2";

  if (dir === "right") {
    return (
      <div
        className={`absolute top-1/2 -right-10 h-6 w-10 -translate-y-1/2 border-l-0 border-r-0 ${pathColor}`}
      />
    );
  }

  if (dir === "left") {
    return (
      <div
        className={`absolute top-1/2 -left-10 h-6 w-10 -translate-y-1/2 border-l-0 border-r-0 ${pathColor}`}
      />
    );
  }

  if (dir === "down") {
    return (
      <div
        className={`absolute -bottom-12 left-1/2 h-12 w-6 -translate-x-1/2 border-b-0 border-t-0 ${pathColor}`}
      />
    );
  }

  return null;
};

export default function BoardArea({ board, players, isEditing, onEditSpace }) {
  const cols = 6;

  const snakeBoard = useMemo(() => {
    const result = [];

    for (let index = 0; index < board.length; index += cols) {
      const row = board.slice(index, index + cols);
      const isEvenRow = (index / cols) % 2 === 0;

      const processedRow = row.map((space, cellIndex) => {
        const isLastInRow = cellIndex === cols - 1;
        let dir = null;

        if (space.id !== board.length - 1) {
          dir = isLastInRow ? "down" : isEvenRow ? "right" : "left";
        }

        return { ...space, dir };
      });

      if (!isEvenRow) {
        result.push(...processedRow.reverse());
      } else {
        result.push(...processedRow);
      }
    }

    return result;
  }, [board]);

  return (
    <div className="relative h-full overflow-auto rounded-2xl border-4 border-green-200 bg-green-100 p-6 shadow-inner">
      {isEditing && (
        <div className="sticky top-0 z-30 mb-2 flex justify-end">
          <span className="animate-pulse rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white shadow-md">
            編集中
          </span>
        </div>
      )}

      <div className="grid min-w-[760px] grid-cols-6 gap-x-6 gap-y-10 p-4">
        {snakeBoard.map((space) => {
          const playersHere = players.filter((player) => player.position === space.id);
          const { bgColor, textColor } =
            SPACE_COLOR_STYLES[space.color] ?? SPACE_COLOR_STYLES.blue;
          const accentClass = space.type === "stop" ? "scale-110 z-10" : "";

          return (
            <div key={space.id} className="relative flex justify-center">
              <PathLine dir={space.dir} />

              <button
                type="button"
                className={`relative z-10 flex aspect-square w-full flex-col items-center justify-center rounded-3xl border-4 p-2 text-center shadow-lg transition-all hover:-translate-y-1 ${bgColor} ${accentClass} ${
                  isEditing ? "cursor-pointer ring-blue-400 hover:ring-4" : "cursor-default"
                }`}
                onClick={() => {
                  if (!isEditing) {
                    return;
                  }

                  const { dir, ...spaceData } = space;
                  onEditSpace(spaceData);
                }}
              >
                <div className="absolute -left-2 -top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-800 bg-white text-[10px] font-black text-gray-800 shadow-sm">
                  {space.id}
                </div>

                <div className={`mt-1 line-clamp-3 text-[10px] font-bold leading-tight md:text-xs ${textColor}`}>
                  {space.text}
                </div>

                <div className="absolute -bottom-3 z-20 flex w-full justify-center px-1">
                  <div className="flex flex-wrap justify-center gap-0.5 rounded-full border border-gray-200 bg-white/90 px-1.5 py-0.5 shadow-sm backdrop-blur-md">
                    {playersHere.map((player) => (
                      <div
                        key={player.id}
                        className={`h-6 w-6 overflow-hidden rounded-full border border-gray-800 text-[12px] leading-none shadow-md ${player.color} flex items-center justify-center`}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
