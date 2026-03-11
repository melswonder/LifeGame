import { useState } from "react";

export default function CircularRoulette({ onSpin }) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const sliceAngle = 360 / numbers.length;
  const colors = [
    "#f87171",
    "#60a5fa",
    "#34d399",
    "#fbbf24",
    "#a78bfa",
    "#f472b6",
    "#818cf8",
    "#fb923c",
    "#2dd4bf",
    "#22d3ee",
  ];
  const conicGradient = colors
    .map((color, index) => `${color} ${index * sliceAngle}deg ${(index + 1) * sliceAngle}deg`)
    .join(", ");

  const handleSpin = () => {
    if (isSpinning) {
      return;
    }

    setIsSpinning(true);
    setResult(null);

    const targetNumber = Math.floor(Math.random() * 10) + 1;
    const targetIndex = numbers.indexOf(targetNumber);
    const extraSpins = 5 * 360;
    const targetAngle = 360 - targetIndex * sliceAngle - sliceAngle / 2;
    const newRotation = rotation + extraSpins + (targetAngle - (rotation % 360));

    setRotation(newRotation);

    window.setTimeout(() => {
      setResult(targetNumber);
      setIsSpinning(false);
      onSpin(targetNumber);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
      <div className="w-full text-left text-sm font-bold text-gray-500">ルーレット</div>

      <div className="relative h-44 w-44">
        <div className="absolute left-1/2 top-0 z-20 h-0 w-0 -translate-x-1/2 -translate-y-1 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow-md" />

        <div
          className={`relative h-full w-full overflow-hidden rounded-full border-8 border-gray-800 shadow-inner [background:conic-gradient(var(--roulette-gradient))] [transform:rotate(var(--roulette-rotation))] ${
            isSpinning
              ? "transition-[transform] duration-[3000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
              : "transition-none"
          }`}
          style={{
            "--roulette-gradient": conicGradient,
            "--roulette-rotation": `${rotation}deg`,
          }}
        >
          {numbers.map((number, index) => (
            <div
              key={number}
              className="pointer-events-none absolute left-0 top-0 flex h-full w-full justify-center [transform:rotate(var(--slice-rotation))]"
              style={{
                "--slice-rotation": `${index * sliceAngle + sliceAngle / 2}deg`,
              }}
            >
              <span className="mt-3 text-2xl font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {number}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute left-1/2 top-1/2 z-30 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-gray-200 bg-gray-900 text-center text-[11px] font-black tracking-wide text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-800 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
        >
          {isSpinning ? "回転中" : "PUSH"}
        </button>
      </div>

      <div className="flex h-8 items-center justify-center font-bold text-gray-700">
        {result !== null && <span className="animate-bounce text-lg text-red-600">{result} が出ました！</span>}
      </div>
    </div>
  );
}
