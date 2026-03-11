import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Settings } from "lucide-react";
import BoardArea from "./components/BoardArea.jsx";
import BoardSpaceModal from "./components/BoardSpaceModal.jsx";
import CircularRoulette from "./components/CircularRoulette.jsx";
import PlayerStatus from "./components/PlayerStatus.jsx";
import PlayerTabs from "./components/PlayerTabs.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import {
  applySpaceEffects,
  BOARD_COLOR_OPTIONS,
  clampBoardPoint,
  createInitialGameState,
  createPlayer,
  findBlockingPurpleSpace,
  JOB_OPTIONS,
  normalizeBoardFile,
  normalizeGameState,
  PLAYER_CONFIG,
} from "./lib/gameState.js";
import {
  createBranchBetweenSpaces,
  removeBranchById,
} from "./lib/boardBranches.js";
import {
  clearGameState,
  downloadBoardState,
  downloadGameState,
  loadGameState,
  saveGameState,
} from "./lib/gameStorage.js";

export default function App() {
  const initialState = useMemo(
    () => loadGameState() ?? createInitialGameState(),
    [],
  );
  const [board, setBoard] = useState(initialState.board);
  const [branches, setBranches] = useState(initialState.branches ?? []);
  const [players, setPlayers] = useState(initialState.players);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(initialState.currentPlayerIndex);
  const [isEditing, setIsEditing] = useState(initialState.isEditing);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingSpaceId, setEditingSpaceId] = useState(null);
  const [mapEditTool, setMapEditTool] = useState("space");
  const [branchStartId, setBranchStartId] = useState(null);

  useEffect(() => {
    saveGameState({ board, branches, players, currentPlayerIndex, isEditing });
  }, [board, branches, players, currentPlayerIndex, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setEditingSpaceId(null);
      setMapEditTool("space");
      setBranchStartId(null);
    }
  }, [isEditing]);

  useEffect(() => {
    if (mapEditTool !== "branch") {
      setBranchStartId(null);
    }
  }, [mapEditTool]);

  const currentPlayer = players[currentPlayerIndex] ?? players[0];
  const editingSpace = board.find((space) => space.id === editingSpaceId) ?? null;

  const handleUpdateSpace = (id, newSpaceData) => {
    setBoard((previous) => previous.map((space) => (space.id === id ? newSpaceData : space)));
  };

  const handleOpenSpaceEditor = (space) => {
    if (mapEditTool !== "space") {
      return;
    }
    setEditingSpaceId(space.id);
  };

  const handleCloseSpaceEditor = () => {
    setEditingSpaceId(null);
  };

  const handleMoveSpace = (id, updates) => {
    if (mapEditTool !== "space") {
      return;
    }

    setBoard((previous) =>
      previous.map((space) => {
        if (space.id !== id) {
          return space;
        }

        const position = clampBoardPoint(updates?.x ?? space.x, updates?.y ?? space.y);
        return { ...space, ...updates, ...position };
      }),
    );
  };

  const handleSelectBranchSpace = (spaceId) => {
    if (!isEditing || mapEditTool !== "branch") {
      return;
    }

    if (branchStartId === null) {
      setBranchStartId(spaceId);
      return;
    }

    if (branchStartId === spaceId) {
      setBranchStartId(null);
      return;
    }

    const result = createBranchBetweenSpaces(board, branches, branchStartId, spaceId);
    if (result.error) {
      window.alert(result.error);
      return;
    }

    setBoard(result.board);
    setBranches(result.branches);
    setBranchStartId(null);
  };

  const handleRemoveLastBranch = () => {
    if (branches.length === 0) {
      return;
    }

    const lastBranch = [...branches].sort(
      (left, right) => (right.createdAt ?? 0) - (left.createdAt ?? 0),
    )[0];
    const result = removeBranchById(board, branches, lastBranch.id);
    setBoard(result.board);
    setBranches(result.branches);
    setBranchStartId(null);
  };

  const handleUpdatePlayer = (id, updates) => {
    setPlayers((previous) => previous.map((player) => (player.id === id ? { ...player, ...updates } : player)));
  };

  const handleChangePlayerCount = (newCount) => {
    setPlayers((previous) => {
      if (newCount > previous.length) {
        const addedPlayers = Array.from({ length: newCount - previous.length }).map((_, index) =>
          createPlayer(previous.length + index),
        );
        return [...previous, ...addedPlayers];
      }

      if (newCount < previous.length) {
        return previous.slice(0, newCount);
      }

      return previous;
    });

    setCurrentPlayerIndex((previous) => (previous >= newCount ? 0 : previous));
  };

  const handleMove = (steps) => {
    setPlayers((previous) => {
      const nextPlayers = [...previous];
      const activePlayer = { ...nextPlayers[currentPlayerIndex] };
      const startPosition = activePlayer.position;
      let targetPosition = Math.min(startPosition + steps, board.length - 1);
      const blockingPurplePosition = findBlockingPurpleSpace(
        board,
        startPosition,
        targetPosition,
      );

      if (blockingPurplePosition !== null) {
        targetPosition = blockingPurplePosition;
      }

      activePlayer.position = targetPosition;
      nextPlayers[currentPlayerIndex] = applySpaceEffects(activePlayer, board[targetPosition]);
      return nextPlayers;
    });
  };

  const handleNextPlayer = () => {
    setCurrentPlayerIndex((previous) => (previous + 1) % players.length);
  };

  const handleExportState = () => {
    downloadGameState({ board, branches, players, currentPlayerIndex, isEditing });
  };

  const handleExportBoard = () => {
    downloadBoardState(board, branches);
  };

  const handleImportState = async (file) => {
    try {
      const text = await file.text();
      const nextState = normalizeGameState(JSON.parse(text));
      setBoard(nextState.board);
      setBranches(nextState.branches);
      setPlayers(nextState.players);
      setCurrentPlayerIndex(nextState.currentPlayerIndex);
      setIsEditing(nextState.isEditing);
      setEditingSpaceId(null);
      setMapEditTool("space");
      setBranchStartId(null);
      window.alert("JSON の読み込みが完了しました。");
    } catch {
      window.alert("JSON の読み込みに失敗しました。ファイル形式を確認してください。");
    }
  };

  const handleImportBoard = async (file) => {
    try {
      const text = await file.text();
      const nextBoardState = normalizeBoardFile(JSON.parse(text));
      setBoard(nextBoardState.board);
      setBranches(nextBoardState.branches);
      setPlayers((previous) =>
        previous.map((player) => ({
          ...player,
          position: Math.min(player.position, nextBoardState.board.length - 1),
        })),
      );
      setEditingSpaceId(null);
      setMapEditTool("space");
      setBranchStartId(null);
      window.alert("盤面 JSON の読み込みが完了しました。");
    } catch {
      window.alert("盤面 JSON の読み込みに失敗しました。ファイル形式を確認してください。");
    }
  };

  const handleResetState = () => {
    const nextState = createInitialGameState();
    clearGameState();
    setBoard(nextState.board);
    setBranches(nextState.branches);
    setPlayers(nextState.players);
    setCurrentPlayerIndex(nextState.currentPlayerIndex);
    setIsEditing(nextState.isEditing);
    setEditingSpaceId(null);
    setMapEditTool("space");
    setBranchStartId(null);
  };

  return (
    <div className="relative flex h-screen min-w-[1180px] flex-row gap-4 overflow-x-auto overflow-y-hidden bg-gray-200 p-4 pr-20">
      <div className="h-full min-w-0 flex-[2] pb-4">
        <BoardArea
          board={board}
          branches={branches}
          players={players}
          isEditing={isEditing}
          mapEditTool={mapEditTool}
          branchStartId={branchStartId}
          onEditSpace={handleOpenSpaceEditor}
          onMoveSpace={handleMoveSpace}
          onChangeEditTool={setMapEditTool}
          onSelectBranchSpace={handleSelectBranchSpace}
          onRemoveLastBranch={handleRemoveLastBranch}
        />
      </div>

      <div className="flex h-full w-[420px] min-w-[420px] flex-col gap-3 pb-4 pr-2">
        <div className="shrink-0">
          <CircularRoulette onSpin={handleMove} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
          <PlayerTabs
            players={players}
            currentIndex={currentPlayerIndex}
            onSelectPlayer={setCurrentPlayerIndex}
          />
          <div className="flex-1 overflow-y-auto bg-gray-50/50">
            {currentPlayer && (
              <PlayerStatus player={currentPlayer} onUpdatePlayer={handleUpdatePlayer} />
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextPlayer}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-gray-800"
        >
          次のプレイヤーのターンへ <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-800 text-white shadow-2xl transition-all hover:scale-110 hover:bg-gray-700"
      >
        <Settings className="h-6 w-6 animate-[spin_4s_linear_infinite]" />
      </button>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        players={players}
        jobOptions={JOB_OPTIONS}
        minPlayers={PLAYER_CONFIG.minPlayerCount}
        maxPlayers={PLAYER_CONFIG.maxPlayerCount}
        onUpdatePlayer={handleUpdatePlayer}
        onChangePlayerCount={handleChangePlayerCount}
        onExportState={handleExportState}
        onImportState={handleImportState}
        onExportBoard={handleExportBoard}
        onImportBoard={handleImportBoard}
        onResetState={handleResetState}
      />

      <BoardSpaceModal
        isOpen={editingSpace !== null}
        space={editingSpace}
        colorOptions={BOARD_COLOR_OPTIONS}
        onClose={handleCloseSpaceEditor}
        onSave={(nextSpace) => {
          handleUpdateSpace(nextSpace.id, nextSpace);
          handleCloseSpaceEditor();
        }}
      />
    </div>
  );
}
