import boardSpacesData from "../data/boardSpaces.json";
import jobOptions from "../data/jobs.json";
import playerConfig from "../data/playerConfig.json";
import { normalizeBranches } from "./boardBranches.js";
import { BOARD_CANVAS, BOARD_NODE_SIZE, getBoardLayout } from "./boardMap.js";

export const DEFAULT_JOB_OPTIONS = jobOptions;
export const JOB_OPTIONS = DEFAULT_JOB_OPTIONS;
export const PLAYER_CONFIG = playerConfig;
export const DEFAULT_BOARD_COLOR_OPTIONS = [
  { value: "red", label: "赤", fill: "#ef4444" },
  { value: "blue", label: "青", fill: "#3b82f6" },
  { value: "green", label: "緑", fill: "#4ade80" },
  { value: "purple", label: "紫", fill: "#9333ea" },
  { value: "orange", label: "オレンジ", fill: "#fb923c" },
  { value: "white", label: "白", fill: "#ffffff" },
];
export const BOARD_COLOR_OPTIONS = DEFAULT_BOARD_COLOR_OPTIONS;
export const DEFAULT_SPACE_TYPE_OPTIONS = [
  { value: "start", label: "スタート", defaultColor: "blue", isCustom: false },
  { value: "normal", label: "通常", defaultColor: "blue", isCustom: false },
  { value: "lucky", label: "ラッキー", defaultColor: "blue", isCustom: false },
  { value: "danger", label: "ピンチ", defaultColor: "red", isCustom: false },
  { value: "payday", label: "給料日", defaultColor: "green", isCustom: false },
  { value: "stop", label: "停止", defaultColor: "purple", isCustom: false },
  { value: "goal", label: "ゴール", defaultColor: "purple", isCustom: false },
];

const numberFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});
const DEFAULT_BOARD_COLOR_VALUE = "blue";
const DEFAULT_CUSTOM_BOARD_COLOR = "#94a3b8";
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getNumber = (value, fallback) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const getText = (value, fallback) =>
  typeof value === "string" && value.trim() ? value : fallback;

const normalizeHexColor = (value, fallback) => {
  if (typeof value !== "string" || !HEX_COLOR_PATTERN.test(value.trim())) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized.length === 4) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }

  return normalized;
};

const getRgbFromHex = (hexColor) => {
  const normalized = normalizeHexColor(hexColor, "#000000").slice(1);
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16),
  };
};

const adjustHexColor = (hexColor, amount) => {
  const { red, green, blue } = getRgbFromHex(hexColor);
  const adjustChannel = (channel) => clamp(channel + amount, 0, 255);
  return `#${adjustChannel(red).toString(16).padStart(2, "0")}${adjustChannel(green).toString(16).padStart(2, "0")}${adjustChannel(blue).toString(16).padStart(2, "0")}`;
};

const getRelativeLuminance = (channel) => {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const getAccessibleTextColor = (hexColor) => {
  const { red, green, blue } = getRgbFromHex(hexColor);
  const luminance =
    0.2126 * getRelativeLuminance(red) +
    0.7152 * getRelativeLuminance(green) +
    0.0722 * getRelativeLuminance(blue);

  return luminance > 0.45 ? "#111827" : "#ffffff";
};

const getJobByName = (name, options = JOB_OPTIONS) =>
  options.find((job) => job.name === name) ?? options[0];

const normalizeLegacyCurrencyText = (text) =>
  text.replace(/([+-]?)\$([\d,]+)/g, (_, sign, amount) => `${sign}${amount}円`);

const isBuiltInBoardColor = (value) =>
  DEFAULT_BOARD_COLOR_OPTIONS.some((option) => option.value === value);

const isBuiltInSpaceTypeValue = (value) =>
  DEFAULT_SPACE_TYPE_OPTIONS.some((option) => option.value === value);

const getFallbackBoardColorValue = (
  boardColorOptions = DEFAULT_BOARD_COLOR_OPTIONS,
) => {
  if (
    boardColorOptions.some(
      (option) => option.value === DEFAULT_BOARD_COLOR_VALUE,
    )
  ) {
    return DEFAULT_BOARD_COLOR_VALUE;
  }

  return boardColorOptions[0]?.value ?? DEFAULT_BOARD_COLOR_OPTIONS[0].value;
};

export const normalizeBoardColorOptions = (rawBoardColorOptions) => {
  const rawOptions = Array.isArray(rawBoardColorOptions)
    ? rawBoardColorOptions
    : [];
  const rawByValue = new Map(
    rawOptions
      .filter((option) => typeof option?.value === "string")
      .map((option) => [option.value, option]),
  );

  const normalizedDefaults = DEFAULT_BOARD_COLOR_OPTIONS.map(
    (defaultOption) => {
      const rawOption = rawByValue.get(defaultOption.value);
      return {
        value: defaultOption.value,
        label: getText(rawOption?.label, defaultOption.label),
        fill: normalizeHexColor(rawOption?.fill, defaultOption.fill),
        isCustom: false,
      };
    },
  );

  const usedValues = new Set(normalizedDefaults.map((option) => option.value));
  const normalizedCustoms = rawOptions
    .map((option, index) => {
      const value = getText(option?.value, `custom-color-${index + 1}`);
      if (usedValues.has(value) || isBuiltInBoardColor(value)) {
        return null;
      }
      usedValues.add(value);

      return {
        value,
        label: getText(option?.label, `追加色 ${index + 1}`),
        fill: normalizeHexColor(option?.fill, DEFAULT_CUSTOM_BOARD_COLOR),
        isCustom: true,
      };
    })
    .filter(Boolean);

  return [...normalizedDefaults, ...normalizedCustoms];
};

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

const isBoardColor = (value, boardColorOptions = DEFAULT_BOARD_COLOR_OPTIONS) =>
  boardColorOptions.some((option) => option.value === value);

export const normalizeSpaceTypeOptions = (
  rawSpaceTypeOptions,
  boardColorOptions = DEFAULT_BOARD_COLOR_OPTIONS,
) => {
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
        defaultColor: isBoardColor(spaceType?.defaultColor, boardColorOptions)
          ? spaceType.defaultColor
          : getFallbackBoardColorValue(boardColorOptions),
        isCustom: !isBuiltInSpaceTypeValue(value),
      };
    })
    .filter(Boolean);

  return normalized.length > 0
    ? normalized
    : cloneJson(DEFAULT_SPACE_TYPE_OPTIONS);
};

export const ensureSpaceTypeOptionsForBoard = (
  spaceTypeOptions,
  board,
  boardColorOptions = DEFAULT_BOARD_COLOR_OPTIONS,
) => {
  const nextOptions = [...spaceTypeOptions];
  const knownValues = new Set(nextOptions.map((spaceType) => spaceType.value));

  board.forEach((space) => {
    if (!knownValues.has(space.type)) {
      knownValues.add(space.type);
      nextOptions.push({
        value: space.type,
        label: space.type,
        defaultColor: getFallbackBoardColorValue(boardColorOptions),
        isCustom: true,
      });
    }
  });

  return nextOptions;
};

const getBoardColor = (
  value,
  type = "normal",
  spaceTypeOptions = DEFAULT_SPACE_TYPE_OPTIONS,
  boardColorOptions = DEFAULT_BOARD_COLOR_OPTIONS,
) => {
  if (isBoardColor(value, boardColorOptions)) {
    return value;
  }

  const matchingType = spaceTypeOptions.find(
    (spaceType) => spaceType.value === type,
  );
  if (
    matchingType &&
    isBoardColor(matchingType.defaultColor, boardColorOptions)
  ) {
    return matchingType.defaultColor;
  }

  if (type === "danger") {
    return isBoardColor("red", boardColorOptions)
      ? "red"
      : getFallbackBoardColorValue(boardColorOptions);
  }

  if (type === "payday") {
    return isBoardColor("green", boardColorOptions)
      ? "green"
      : getFallbackBoardColorValue(boardColorOptions);
  }

  if (type === "stop" || type === "goal") {
    return isBoardColor("purple", boardColorOptions)
      ? "purple"
      : getFallbackBoardColorValue(boardColorOptions);
  }

  return getFallbackBoardColorValue(boardColorOptions);
};

export const getBoardColorOption = (
  value,
  boardColorOptions = DEFAULT_BOARD_COLOR_OPTIONS,
) =>
  boardColorOptions.find((option) => option.value === value) ??
  boardColorOptions.find(
    (option) => option.value === getFallbackBoardColorValue(boardColorOptions),
  ) ??
  DEFAULT_BOARD_COLOR_OPTIONS.find(
    (option) => option.value === DEFAULT_BOARD_COLOR_VALUE,
  ) ??
  DEFAULT_BOARD_COLOR_OPTIONS[0];

export const getBoardColorTheme = (
  value,
  boardColorOptions = DEFAULT_BOARD_COLOR_OPTIONS,
) => {
  const option = getBoardColorOption(value, boardColorOptions);
  const fillColor = normalizeHexColor(option?.fill, "#3b82f6");

  return {
    fillColor,
    borderColor: adjustHexColor(fillColor, fillColor === "#ffffff" ? -40 : -28),
    textColor: getAccessibleTextColor(fillColor),
  };
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
  boardColorOptions = DEFAULT_BOARD_COLOR_OPTIONS,
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
    color: getBoardColor(
      space?.color,
      space?.type,
      spaceTypeOptions,
      boardColorOptions,
    ),
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
    normalizeSpace(
      space,
      index,
      layout,
      DEFAULT_SPACE_TYPE_OPTIONS,
      DEFAULT_BOARD_COLOR_OPTIONS,
    ),
  );
};

export const createInitialGameState = () => {
  const normalizedJobOptions = normalizeJobOptions(JOB_OPTIONS);
  const normalizedBoardColorOptions = normalizeBoardColorOptions(
    DEFAULT_BOARD_COLOR_OPTIONS,
  );
  const normalizedSpaceTypeOptions = normalizeSpaceTypeOptions(
    DEFAULT_SPACE_TYPE_OPTIONS,
    normalizedBoardColorOptions,
  );

  return {
    board: createInitialBoard(),
    branches: [],
    backgroundImageUrl: null,
    jobOptions: normalizedJobOptions,
    boardColorOptions: normalizedBoardColorOptions,
    spaceTypeOptions: normalizedSpaceTypeOptions,
    players: createInitialPlayers(undefined, normalizedJobOptions),
    currentPlayerIndex: 0,
    isEditing: false,
  };
};

export const normalizeBoard = (
  board,
  spaceTypeOptions = DEFAULT_SPACE_TYPE_OPTIONS,
  boardColorOptions = DEFAULT_BOARD_COLOR_OPTIONS,
) => {
  if (!Array.isArray(board) || board.length === 0) {
    return createInitialBoard();
  }

  const layout = getBoardLayout(board.length);
  return board.map((space, index) =>
    normalizeSpace(space, index, layout, spaceTypeOptions, boardColorOptions),
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
  const boardColorOptions = normalizeBoardColorOptions(
    rawState?.boardColorOptions ?? defaultState.boardColorOptions,
  );
  const initialSpaceTypeOptions = normalizeSpaceTypeOptions(
    rawState?.spaceTypeOptions ?? defaultState.spaceTypeOptions,
    boardColorOptions,
  );
  const board = normalizeBoard(
    rawState?.board,
    initialSpaceTypeOptions,
    boardColorOptions,
  );
  const branches = normalizeBranches(rawState?.branches, board.length);
  const spaceTypeOptions = ensureSpaceTypeOptionsForBoard(
    initialSpaceTypeOptions,
    board,
    boardColorOptions,
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
    boardColorOptions,
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
