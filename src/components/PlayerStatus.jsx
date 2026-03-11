import { useEffect, useState } from "react";
import {
  Briefcase,
  Calculator as CalcIcon,
  Car,
  CreditCard,
  Flame,
  Gem,
  Minus,
  Plus,
  UserCircle,
} from "lucide-react";
import { formatCurrency } from "../lib/gameState.js";

const evaluateExpression = (expression) => {
  if (!/^[0-9+\-*/.]*$/.test(expression)) {
    return "Error";
  }

  try {
    return new Function(`return ${expression}`)();
  } catch {
    return "Error";
  }
};

export default function PlayerStatus({ player, onUpdatePlayer }) {
  const [calcInput, setCalcInput] = useState("");

  useEffect(() => {
    setCalcInput("");
  }, [player.id]);

  const updateDebt = (amount) =>
    onUpdatePlayer(player.id, { debtCount: Math.max(0, player.debtCount + amount) });

  const updateCar = (amount) =>
    onUpdatePlayer(player.id, {
      carPeople: Math.max(1, Math.min(player.carCapacity, player.carPeople + amount)),
    });

  const updateDopamine = (amount) =>
    onUpdatePlayer(player.id, { dopamine: Math.max(0, player.dopamine + amount) });

  const toggleCard = (cardName) => {
    const hasCard = player.cards.includes(cardName);
    const newCards = hasCard
      ? player.cards.filter((card) => card !== cardName)
      : [...player.cards, cardName];

    onUpdatePlayer(player.id, { cards: newCards });
  };

  const handleCalcClick = (value) => {
    if (value === "=") {
      setCalcInput(String(evaluateExpression(calcInput)));
      return;
    }

    if (value === "C") {
      setCalcInput("");
      return;
    }

    setCalcInput((current) => (current === "Error" ? value : current + value));
  };

  const handleSaveMoney = (type) => {
    let resultString = calcInput;

    if (/[+\-*/]/.test(calcInput)) {
      resultString = String(evaluateExpression(calcInput));
      setCalcInput(resultString);
    }

    const value = Number(resultString);
    if (Number.isNaN(value) || resultString === "Error" || resultString === "") {
      return;
    }

    let nextMoney = player.money;
    if (type === "set") {
      nextMoney = value;
    }
    if (type === "add") {
      nextMoney += value;
    }
    if (type === "sub") {
      nextMoney -= value;
    }

    onUpdatePlayer(player.id, { money: nextMoney });
    setCalcInput("");
  };

  const calcButtons = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "C", "0", "=", "+"];

  return (
    <div className="space-y-3 p-3">
      <div className="relative overflow-hidden rounded-xl border-2 border-yellow-300 bg-yellow-50 p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-yellow-200 pb-2">
          <div className="flex items-center gap-2 text-sm font-bold text-yellow-800">
            <div
              className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-800 text-sm shadow-sm ${player.color}`}
            >
              {player.imageUrl ? (
                <img src={player.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                player.icon
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] leading-tight text-yellow-700">{player.name} の</span>
              <span className="leading-tight">現在の所持金</span>
            </div>
          </div>
          <div className="text-right text-3xl font-black leading-none tracking-tight text-gray-800">
            {formatCurrency(player.money)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-300 bg-white p-2.5 shadow-inner">
          <div className="mb-2 flex items-end justify-between">
            <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
              <CalcIcon className="h-4 w-4" /> 計算機パネル
            </span>
            <button
              type="button"
              onClick={() => setCalcInput(String(player.money))}
              className="rounded border border-yellow-400 bg-yellow-100 px-2 py-1 text-[10px] font-bold text-yellow-800 shadow-sm transition-colors hover:bg-yellow-200 active:scale-95"
            >
              所持金を呼出
            </button>
          </div>

          <div className="mb-2.5 flex h-10 flex-col justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-100 p-2 text-right font-mono text-xl tracking-wider text-gray-800 shadow-inner">
            {calcInput || "0"}
          </div>

          <div className="mb-3 grid grid-cols-4 gap-1.5">
            {calcButtons.map((button) => (
              <button
                key={button}
                type="button"
                onClick={() => handleCalcClick(button)}
                className={`rounded-lg p-1.5 text-sm font-bold shadow-sm transition-colors active:scale-95 ${
                  button === "="
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : button === "C"
                      ? "bg-red-400 text-white hover:bg-red-500"
                      : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {button}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={() => handleSaveMoney("sub")}
              className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-red-500 py-1.5 text-[10px] font-bold text-white shadow transition-colors hover:bg-red-600 active:scale-95"
            >
              <span>結果を</span>
              <span className="rounded-full bg-red-700/50 px-2">減らす (-)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveMoney("add")}
              className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-green-500 py-1.5 text-[10px] font-bold text-white shadow transition-colors hover:bg-green-600 active:scale-95"
            >
              <span>結果を</span>
              <span className="rounded-full bg-green-700/50 px-2">増やす (+)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveMoney("set")}
              className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-blue-600 py-1.5 text-[10px] font-bold text-white shadow transition-colors hover:bg-blue-700 active:scale-95"
            >
              <span>結果で</span>
              <span className="rounded-full bg-blue-800/50 px-2">上書き (=)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col justify-between rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-bold text-red-800">
            <CreditCard className="h-4 w-4" /> 約束手形 (借金)
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => updateDebt(-1)}
              className="rounded border border-red-200 bg-white p-1 shadow-sm hover:bg-gray-50"
            >
              <Minus className="h-4 w-4 text-red-600" />
            </button>
            <div className="text-xl font-bold text-gray-800">
              {player.debtCount} <span className="text-xs font-normal text-gray-600">枚</span>
            </div>
            <button
              type="button"
              onClick={() => updateDebt(1)}
              className="rounded border border-red-200 bg-white p-1 shadow-sm hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-bold text-gray-600">
            <Car className="h-4 w-4" /> 同乗者
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => updateCar(-1)}
              className="rounded border border-gray-200 bg-white p-1 shadow-sm hover:bg-gray-50"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <div className="flex gap-0.5">
              {Array.from({ length: player.carCapacity }).map((_, index) => (
                <UserCircle
                  key={index}
                  className={`h-4 w-4 ${index < player.carPeople ? "text-gray-800" : "text-gray-300"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => updateCar(1)}
              className="rounded border border-gray-200 bg-white p-1 shadow-sm hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-pink-200 bg-pink-50 p-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-bold text-pink-800">
            <Flame className="h-4 w-4" /> ドーパミン
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => updateDopamine(-1)}
              className="rounded border border-pink-200 bg-white p-1 shadow-sm hover:bg-gray-50"
            >
              <Minus className="h-4 w-4 text-pink-600" />
            </button>
            <div className="text-xl font-bold text-gray-800">{player.dopamine}</div>
            <button
              type="button"
              onClick={() => updateDopamine(1)}
              className="rounded border border-pink-200 bg-white p-1 shadow-sm hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 text-pink-600" />
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-purple-200 bg-purple-50 p-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-bold text-purple-800">
            <Gem className="h-4 w-4" /> 所持カード
          </div>
          <div className="mt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggleCard("情強カード")}
              className={`rounded-lg border px-2 py-1.5 text-[10px] font-bold shadow-sm transition-all md:text-xs ${
                player.cards.includes("情強カード")
                  ? "border-red-700 bg-red-600 text-white"
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              情強カード
            </button>
            <button
              type="button"
              onClick={() => toggleCard("情弱カード")}
              className={`rounded-lg border px-2 py-1.5 text-[10px] font-bold shadow-sm transition-all md:text-xs ${
                player.cards.includes("情弱カード")
                  ? "border-blue-700 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              情弱カード
            </button>
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-bold text-blue-800">
              <Briefcase className="h-4 w-4" /> 職業
            </div>
            <div className="font-bold text-gray-800">{player.job}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-blue-800">給料</div>
            <div className="font-bold text-gray-800">{formatCurrency(player.salary)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
