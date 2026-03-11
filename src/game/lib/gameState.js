import boardSpacesData from "../data/boardSpaces.json";
import jobOptions from "../data/jobs.json";
import playerConfig from "../data/playerConfig.json";
import { normalizeBranches } from "./boardBranches.js";
import { BOARD_CANVAS, BOARD_NODE_SIZE, getBoardLayout } from "./boardMap.js";

export const DEFAULT_JOB_OPTIONS = jobOptions;
export const JOB_OPTIONS = DEFAULT_JOB_OPTIONS;
export const PLAYER_CONFIG = playerConfig;
export const BOARD_COLOR_OPTIONS = [
  { value: "red", label: "赤" },
  { value: "blue", label: "青" },
  { value: "green", label: "緑" },
  { value: "purple", label: "紫" },
  { value: "orange", label: "オレンジ" },
  { value: "white", label: "白" },
];
export const DEFAULT_SPACE_TYPE_OPTIONS = [
  { value: "start", label: "スタート", defaultColor: "blue" },
  { value: "normal", label: "通常", defaultColor: "blue" },
  { value: "lucky", label: "ラッキー", defaultColor: "blue" },
  { value: "danger", label: "ピンチ", defaultColor: "red" },
  { value: "payday", label: "給料日", defaultColor: "green" },
  { value: "stop", label: "停止", defaultColor: "purple" },
  { value: "goal", label: "ゴール", defaultColor: "purple" },
];

const numberFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getNumber = (value, fallback) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const getText = (value, fallback) =>
  typeof value === "string" && value.trim() ? value : fallback;

const getJobByName = (name, options = JOB_OPTIONS) =>
  options.find((job) => job.name === name) ?? options[0];

const normalizeLegacyCurrencyText = (text) =>
  text.replace(/([+-]?)\$([\d,]+)/g, (_, sign, amount) => `${sign}${amount}円`);

export const normalizeJobOptions = (rawJobOptions) => {
  if (!Array.isArray(rawJobOptions) || rawJobOptions.length === 0) {
    return cloneJson(DEFAULT_JOB_OPTIONS);
  }

  const usedNames = new Set();
  const normalized = rawJobOptions
    .map((job, index) => {
      const fallbackName =
        DEFAULT_JOB_OPTIONS[index]?.name ?? `職業 ${index + 1}`;
      const name = getText(job?.name, fallbackName);
      if (usedNames.has(name)) {
        return null;
      }
      usedNames.add(name);

      return {
        name,
        salary: Math.max(0, getNumber(job?.salary, 0)),
      };
    })
    .filter(Boolean);

  return normalized.length > 0 ? normalized : cloneJson(DEFAULT_JOB_OPTIONS);
};

const isBoardColor = (value) =>
  BOARD_COLOR_OPTIONS.some((option) => option.value === value);

export const normalizeSpaceTypeOptions = (rawSpaceTypeOptions) => {
  if (!Array.isArray(rawSpaceTypeOptions) || rawSpaceTypeOptions.length === 0) {
    return cloneJson(DEFAULT_SPACE_TYPE_OPTIONS);
  }

  const usedValues = new Set();
  const normalized = rawSpaceTypeOptions
    .map((spaceType, index) => {
      const fallback =
        DEFAULT_SPACE_TYPE_OPTIONS[index] ?? DEFAULT_SPACE_TYPE_OPTIONS[1];
      const baseValue = getText(spaceType?.value, fallback.value);
      let value = baseValue;
      let suffix = 2;

      while (usedValues.has(value)) {
        value = `${baseValue}-${suffix}`;
        suffix += 1;
      }
      usedValues.add(value);

      return {
        value,
        label: getText(spaceType?.label, fallback.label),
        defaultColor: isBoardColor(spaceType?.defaultColor)
          ? spaceType.defaultColor
          : fallback.defaultColor,
      };
    })
    .filter(Boolean);

  return normalized.length > 0
    ? normalized
    : cloneJson(DEFAULT_SPACE_TYPE_OPTIONS);
};

export const ensureSpaceTypeOptionsForBoard = (spaceTypeOptions, board) => {
  const nextOptions = [...spaceTypeOptions];
  const knownValues = new Set(nextOptions.map((spaceType) => spaceType.value));

  board.forEach((space) => {
    if (!knownValues.has(space.type)) {
      knownValues.add(space.type);
      nextOptions.push({
        value: space.type,
        label: space.type,
        defaultColor: "blue",
      });
    }
  });

  return nextOptions;
};

const getBoardColor = (
  value,
  type = "normal",
  spaceTypeOptions = DEFAULT_SPACE_TYPE_OPTIONS,
) => {
  if (isBoardColor(value)) {
    return value;
  }

  const matchingType = spaceTypeOptions.find(
    (spaceType) => spaceType.value === type,
  );
  if (matchingType && isBoardColor(matchingType.defaultColor)) {
    return matchingType.defaultColor;
  }

  if (type === "danger") {
    return "red";
  }

  if (type === "payday") {
    return "green";
  }

  if (type === "stop" || type === "goal") {
    return "purple";
  }

  return "blue";
};

export const clampBoardPoint = (x, y) => {
  const edgePadding = BOARD_NODE_SIZE / 2 + 24;

  return {
    x: clamp(
      getNumber(x, edgePadding),
      edgePadding,
      BOARD_CANVAS.width - edgePadding,
    ),
    y: clamp(
      getNumber(y, edgePadding),
      edgePadding,
      BOARD_CANVAS.height - edgePadding,
    ),
  };
};

const normalizeSpace = (
  space,
  index,
  layout,
  spaceTypeOptions = DEFAULT_SPACE_TYPE_OPTIONS,
) => {
  const defaultPosition = layout[index];
  const position = clampBoardPoint(
    space?.x ?? defaultPosition.x,
    space?.y ?? defaultPosition.y,
  );

  return {
    id: index,
    type: getText(space?.type, "normal"),
    text:
      typeof space?.text === "string"
        ? normalizeLegacyCurrencyText(space.text)
        : "何気ない日常。",
    money: getNumber(space?.money, 0),
    addCarPeople: getNumber(space?.addCarPeople, 0),
    addDebt: getNumber(space?.addDebt, 0),
    color: getBoardColor(space?.color, space?.type, spaceTypeOptions),
    x: position.x,
    y: position.y,
  };
};

export const createPlayer = (
  index,
  overrides = {},
  availableJobs = JOB_OPTIONS,
) => {
  const defaultJob = getJobByName(
    PLAYER_CONFIG.startingJobs[index % PLAYER_CONFIG.startingJobs.length],
    availableJobs,
  );
  const selectedJob = getJobByName(
    overrides.job ?? defaultJob.name,
    availableJobs,
  );

  return {
    id: getNumber(overrides.id, index + 1),
    name: getText(overrides.name, `プレイヤー ${index + 1}`),
    color:
      typeof overrides.color === "string"
        ? overrides.color
        : PLAYER_CONFIG.defaultColors[
            index % PLAYER_CONFIG.defaultColors.length
          ],
    icon:
      typeof overrides.icon === "string"
        ? overrides.icon
        : PLAYER_CONFIG.defaultIcons[index % PLAYER_CONFIG.defaultIcons.length],
    imageUrl:
      typeof overrides.imageUrl === "string" ? overrides.imageUrl : null,
    money: getNumber(overrides.money, PLAYER_CONFIG.startingMoney),
    position: clamp(
      getNumber(overrides.position, 0),
      0,
      boardSpacesData.length - 1,
    ),
    job: selectedJob.name,
    salary: getNumber(overrides.salary, selectedJob.salary),
    carPeople: clamp(
      getNumber(overrides.carPeople, 1),
      1,
      PLAYER_CONFIG.carCapacity,
    ),
    carCapacity: PLAYER_CONFIG.carCapacity,
    debtCount: Math.max(0, getNumber(overrides.debtCount, 0)),
    insurances: Array.isArray(overrides.insurances) ? overrides.insurances : [],
    treasures: Array.isArray(overrides.treasures) ? overrides.treasures : [],
    cards: Array.isArray(overrides.cards) ? overrides.cards : [],
    dopamine: Math.max(0, getNumber(overrides.dopamine, 0)),
    isSkippingTurn: Boolean(overrides.isSkippingTurn),
  };
};

export const createInitialPlayers = (
  count = PLAYER_CONFIG.initialPlayerCount,
  availableJobs = JOB_OPTIONS,
) =>
  Array.from({
    length: clamp(
      count,
      PLAYER_CONFIG.minPlayerCount,
      PLAYER_CONFIG.maxPlayerCount,
    ),
  }).map((_, index) => createPlayer(index, {}, availableJobs));

export const createInitialBoard = () => {
  const layout = getBoardLayout(boardSpacesData.length);
  return cloneJson(boardSpacesData).map((space, index) =>
    normalizeSpace(space, index, layout, DEFAULT_SPACE_TYPE_OPTIONS),
  );
};

export const createInitialGameState = () => {
  const normalizedJobOptions = normalizeJobOptions(JOB_OPTIONS);
  const normalizedSpaceTypeOptions = normalizeSpaceTypeOptions(
    DEFAULT_SPACE_TYPE_OPTIONS,
  );

  return {
    board: createInitialBoard(),
    branches: [],
    backgroundImageUrl: null,
    jobOptions: normalizedJobOptions,
    spaceTypeOptions: normalizedSpaceTypeOptions,
    players: createInitialPlayers(undefined, normalizedJobOptions),
    currentPlayerIndex: 0,
    isEditing: false,
  };
};

export const normalizeBoard = (
  board,
  spaceTypeOptions = DEFAULT_SPACE_TYPE_OPTIONS,
) => {
  if (!Array.isArray(board) || board.length === 0) {
    return createInitialBoard();
  }

  const layout = getBoardLayout(board.length);
  return board.map((space, index) =>
    normalizeSpace(space, index, layout, spaceTypeOptions),
  );
};

export const normalizePlayers = (players, availableJobs = JOB_OPTIONS) => {
  if (!Array.isArray(players) || players.length === 0) {
    return createInitialPlayers(undefined, availableJobs);
  }

  const count = clamp(
    players.length,
    PLAYER_CONFIG.minPlayerCount,
    PLAYER_CONFIG.maxPlayerCount,
  );

  return players
    .slice(0, count)
    .map((player, index) => createPlayer(index, player, availableJobs));
};

export const normalizeGameState = (rawState) => {
  const defaultState = createInitialGameState();
  const jobOptions = normalizeJobOptions(
    rawState?.jobOptions ?? defaultState.jobOptions,
  );
  const initialSpaceTypeOptions = normalizeSpaceTypeOptions(
    rawState?.spaceTypeOptions ?? defaultState.spaceTypeOptions,
  );
  const board = normalizeBoard(rawState?.board, initialSpaceTypeOptions);
  const branches = normalizeBranches(rawState?.branches, board.length);
  const spaceTypeOptions = ensureSpaceTypeOptionsForBoard(
    initialSpaceTypeOptions,
    board,
  );
  const players = normalizePlayers(rawState?.players, jobOptions).map(
    (player) => ({
      ...player,
      position: clamp(player.position, 0, board.length - 1),
    }),
  );

  return {
    board,
    branches,
    backgroundImageUrl:
      typeof rawState?.backgroundImageUrl === "string" &&
      rawState.backgroundImageUrl.trim()
        ? rawState.backgroundImageUrl
        : defaultState.backgroundImageUrl,
    jobOptions,
    spaceTypeOptions,
    players,
    currentPlayerIndex: clamp(
      getNumber(rawState?.currentPlayerIndex, defaultState.currentPlayerIndex),
      0,
      players.length - 1,
    ),
    isEditing: Boolean(rawState?.isEditing),
  };
};

export const applySpaceEffects = (player, space) => {
  const nextPlayer = { ...player };

  nextPlayer.money += getNumber(space?.money, 0);
  nextPlayer.carPeople = clamp(
    nextPlayer.carPeople + getNumber(space?.addCarPeople, 0),
    1,
    nextPlayer.carCapacity,
  );
  nextPlayer.debtCount = Math.max(
    0,
    nextPlayer.debtCount + getNumber(space?.addDebt, 0),
  );

  if (space?.type === "payday") {
    nextPlayer.money += nextPlayer.salary;
  }

  return nextPlayer;
};

export const findBlockingPurpleSpace = (
  board,
  startPosition,
  targetPosition,
) => {
  for (let index = startPosition + 1; index <= targetPosition; index += 1) {
    if (board[index]?.color === "purple") {
      return index;
    }
  }

  return null;
};

export const formatCurrency = (amount) => `${numberFormatter.format(amount)}円`;

export const serializeGameState = (state) =>
  JSON.stringify(normalizeGameState(state), null, 2);
