export default function PlayerTabs({ players, currentIndex, onSelectPlayer }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-t-xl bg-gray-800 p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {players.map((player, index) => (
        <button
          key={player.id}
          type="button"
          onClick={() => onSelectPlayer(index)}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border-b-2 px-3 py-2 text-sm font-bold transition-all ${
            currentIndex === index
              ? "border-blue-500 bg-gray-100 text-gray-900 shadow-md"
              : "border-transparent text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <div
            className={`flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-gray-800 text-[10px] ${player.color}`}
          >
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              player.icon
            )}
          </div>
          <span className="max-w-[80px] truncate">{player.name}</span>
        </button>
      ))}
    </div>
  );
}
