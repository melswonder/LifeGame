import { BOARD_CANVAS, BOARD_NODE_SIZE } from "./boardMap.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getNumber = (value, fallback) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const buildInteriorIds = (startId, endId) =>
  Array.from({ length: endId - startId - 1 }, (_, index) => startId + index + 1);

const clampPoint = (x, y) => {
  const edgePadding = BOARD_NODE_SIZE / 2 + 24;

  return {
    x: clamp(getNumber(x, edgePadding), edgePadding, BOARD_CANVAS.width - edgePadding),
    y: clamp(getNumber(y, edgePadding), edgePadding, BOARD_CANVAS.height - edgePadding),
  };
};

const createBranchId = (startId, endId) =>
  `branch-${startId}-${endId}-${Math.random().toString(36).slice(2, 8)}`;

const lerp = (start, end, progress) => start + (end - start) * progress;

const createLanePoint = (start, end, progress, direction, spread) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy) || 1;
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const offset = Math.sin(Math.PI * progress) * spread * direction;

  return clampPoint(
    lerp(start.x, end.x, progress) + normalX * offset,
    lerp(start.y, end.y, progress) + normalY * offset,
  );
};

export const buildDefaultBranchLanes = (startId, endId) => {
  const normalizedStart = Math.min(startId, endId);
  const normalizedEnd = Math.max(startId, endId);
  const interiorIds = buildInteriorIds(normalizedStart, normalizedEnd);
  const upperLaneIds = interiorIds.filter((_, index) => index % 2 === 0);
  const lowerLaneIds = interiorIds.filter((_, index) => index % 2 === 1);

  return {
    startId: normalizedStart,
    endId: normalizedEnd,
    upperLaneIds,
    lowerLaneIds,
  };
};

export const hasOverlappingBranch = (branches, startId, endId, ignoreId = null) =>
  branches.some(
    (branch) =>
      branch.id !== ignoreId &&
      Math.min(startId, endId) < branch.endId &&
      Math.max(startId, endId) > branch.startId,
  );

export const normalizeBranches = (branches, boardLength) => {
  if (!Array.isArray(branches) || boardLength < 4) {
    return [];
  }

  const normalized = [];

  branches.forEach((branch, index) => {
    const startId = clamp(getNumber(branch?.startId, -1), 0, boardLength - 1);
    const endId = clamp(getNumber(branch?.endId, -1), 0, boardLength - 1);
    const { startId: start, endId: end, upperLaneIds, lowerLaneIds } =
      buildDefaultBranchLanes(startId, endId);

    if (end - start < 3 || upperLaneIds.length === 0 || lowerLaneIds.length === 0) {
      return;
    }

    if (hasOverlappingBranch(normalized, start, end)) {
      return;
    }

    const allowedInteriorIds = new Set(buildInteriorIds(start, end));
    const usedLaneIds = new Set();
    const readLane = (laneIds, fallbackIds) => {
      if (!Array.isArray(laneIds)) {
        return fallbackIds.filter((id) => {
          if (usedLaneIds.has(id)) {
            return false;
          }
          usedLaneIds.add(id);
          return true;
        });
      }

      const filtered = laneIds.filter((id) => {
        const value = getNumber(id, -1);
        if (!allowedInteriorIds.has(value) || usedLaneIds.has(value)) {
          return false;
        }
        usedLaneIds.add(value);
        return true;
      });

      if (filtered.length > 0) {
        return filtered;
      }

      return fallbackIds.filter((id) => {
        if (usedLaneIds.has(id)) {
          return false;
        }
        usedLaneIds.add(id);
        return true;
      });
    };

    const originalPositions = Array.isArray(branch?.originalPositions)
      ? branch.originalPositions
          .map((position) => ({
            id: getNumber(position?.id, -1),
            ...clampPoint(position?.x, position?.y),
          }))
          .filter((position) => allowedInteriorIds.has(position.id))
      : [];

    normalized.push({
      id: typeof branch?.id === "string" ? branch.id : `${createBranchId(start, end)}-${index}`,
      startId: start,
      endId: end,
      upperLaneIds: readLane(branch?.upperLaneIds, upperLaneIds),
      lowerLaneIds: readLane(branch?.lowerLaneIds, lowerLaneIds),
      createdAt: getNumber(branch?.createdAt, 0),
      originalPositions,
    });
  });

  return normalized.sort((left, right) => left.startId - right.startId);
};

export const applyBranchLayout = (board, branch) => {
  const start = board[branch.startId];
  const end = board[branch.endId];

  if (!start || !end) {
    return board;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const spread = clamp(distance * 0.24, BOARD_NODE_SIZE * 3, BOARD_NODE_SIZE * 6);
  const updatedBoard = [...board];

  branch.upperLaneIds.forEach((spaceId, index) => {
    const progress = (index + 1) / (branch.upperLaneIds.length + 1);
    updatedBoard[spaceId] = {
      ...updatedBoard[spaceId],
      ...createLanePoint(start, end, progress, -1, spread),
    };
  });

  branch.lowerLaneIds.forEach((spaceId, index) => {
    const progress = (index + 1) / (branch.lowerLaneIds.length + 1);
    updatedBoard[spaceId] = {
      ...updatedBoard[spaceId],
      ...createLanePoint(start, end, progress, 1, spread),
    };
  });

  return updatedBoard;
};

export const createBranchBetweenSpaces = (board, branches, startId, endId) => {
  const laneSet = buildDefaultBranchLanes(startId, endId);

  if (laneSet.endId - laneSet.startId < 3) {
    return { error: "分岐を作るには、開始地点と終了地点の間に最低2マス必要です。" };
  }

  if (laneSet.upperLaneIds.length === 0 || laneSet.lowerLaneIds.length === 0) {
    return { error: "分岐先の2本を作るだけのマス数が足りません。" };
  }

  if (hasOverlappingBranch(branches, laneSet.startId, laneSet.endId)) {
    return { error: "その区間にはすでに分岐があります。重なる分岐は作れません。" };
  }

  const originalPositions = [...laneSet.upperLaneIds, ...laneSet.lowerLaneIds].map((id) => ({
    id,
    x: board[id].x,
    y: board[id].y,
  }));

  const branch = {
    id: createBranchId(laneSet.startId, laneSet.endId),
    ...laneSet,
    createdAt: Date.now(),
    originalPositions,
  };

  return {
    branches: normalizeBranches([...branches, branch], board.length),
    board: applyBranchLayout(board, branch),
  };
};

export const removeBranchById = (board, branches, branchId) => {
  const branch = branches.find((candidate) => candidate.id === branchId);
  if (!branch) {
    return { board, branches };
  }

  const restoredBoard = [...board];
  branch.originalPositions.forEach((position) => {
    restoredBoard[position.id] = {
      ...restoredBoard[position.id],
      x: position.x,
      y: position.y,
    };
  });

  return {
    board: restoredBoard,
    branches: branches.filter((candidate) => candidate.id !== branchId),
  };
};

export const buildBoardRouteSegments = (board, branches) => {
  if (!Array.isArray(board) || board.length < 2) {
    return [];
  }

  const sortedBranches = normalizeBranches(branches, board.length);
  if (sortedBranches.length === 0) {
    return [board.map(({ x, y }) => ({ x, y }))];
  }

  const segments = [];
  let cursor = 0;

  sortedBranches.forEach((branch) => {
    if (cursor < branch.startId) {
      segments.push(
        board
          .slice(cursor, branch.startId + 1)
          .map(({ x, y }) => ({ x, y })),
      );
    }

    segments.push(
      [branch.startId, ...branch.upperLaneIds, branch.endId].map((id) => ({
        x: board[id].x,
        y: board[id].y,
      })),
    );
    segments.push(
      [branch.startId, ...branch.lowerLaneIds, branch.endId].map((id) => ({
        x: board[id].x,
        y: board[id].y,
      })),
    );
    cursor = branch.endId;
  });

  if (cursor < board.length - 1) {
    segments.push(
      board.slice(cursor).map(({ x, y }) => ({
        x,
        y,
      })),
    );
  }

  return segments.filter((segment) => segment.length >= 2);
};
