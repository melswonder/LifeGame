import boardSpacesData from "../data/boardSpaces.json";
import jobOptions from "../data/jobs.json";
import playerConfig from "../data/playerConfig.json";

export const JOB_OPTIONS = jobOptions;
export const PLAYER_CONFIG = playerConfig;
export const BOARD_COLOR_OPTIONS = [
  { value: "red", label: "赤" },
  { value: "blue", label: "青" },
  { value: "green", label: "緑" },
  { value: "purple", label: "紫" },
  { value: "orange", label: "オレンジ" },
  { value: "white", label: "白" },
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

const getJobByName = (name) =>
  JOB_OPTIONS.find((job) => job.name === name) ?? JOB_OPTIONS[0];

const normalizeLegacyCurrencyText = (text) =>
  text.replace(/([+-]?)\$([\d,]+)/g, (_, sign, amount) => `${sign}${amount}円`);

const getBoardColor = (value, type = "normal") => {
  if (BOARD_COLOR_OPTIONS.some((option) => option.value === value)) {
    return value;
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

const normalizeSpace = (space, index) => ({
  id: index,
  type: getText(space?.type, "normal"),
  text:
    typeof space?.text === "string"
      ? normalizeLegacyCurrencyText(space.text)
      : "何気ない日常。",
  money: getNumber(space?.money, 0),
  addCarPeople: getNumber(space?.addCarPeople, 0),
  addDebt: getNumber(space?.addDebt, 0),
  color: getBoardColor(space?.color, space?.type),
});

export const createPlayer = (index, overrides = {}) => {
  const defaultJob = getJobByName(
    PLAYER_CONFIG.startingJobs[index % PLAYER_CONFIG.startingJobs.length],
  );
  const selectedJob = getJobByName(overrides.job ?? defaultJob.name);

  return {
    id: getNumber(overrides.id, index + 1),
    name: getText(overrides.name, `プレイヤー ${index + 1}`),
    color:
      typeof overrides.color === "string"
        ? overrides.color
        : PLAYER_CONFIG.defaultColors[index % PLAYER_CONFIG.defaultColors.length],
    icon:
      typeof overrides.icon === "string"
        ? overrides.icon
        : PLAYER_CONFIG.defaultIcons[index % PLAYER_CONFIG.defaultIcons.length],
    imageUrl: typeof overrides.imageUrl === "string" ? overrides.imageUrl : null,
    money: getNumber(overrides.money, PLAYER_CONFIG.startingMoney),
    position: clamp(getNumber(overrides.position, 0), 0, boardSpacesData.length - 1),
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
  };
};

export const createInitialPlayers = (count = PLAYER_CONFIG.initialPlayerCount) =>
  Array.from({ length: clamp(count, PLAYER_CONFIG.minPlayerCount, PLAYER_CONFIG.maxPlayerCount) }).map(
    (_, index) => createPlayer(index),
  );

export const createInitialBoard = () => cloneJson(boardSpacesData).map(normalizeSpace);

export const createInitialGameState = () => ({
  board: createInitialBoard(),
  players: createInitialPlayers(),
  currentPlayerIndex: 0,
  isEditing: false,
});

export const normalizeBoard = (board) => {
  if (!Array.isArray(board) || board.length === 0) {
    return createInitialBoard();
  }

  return board.map(normalizeSpace);
};

export const normalizePlayers = (players) => {
  if (!Array.isArray(players) || players.length === 0) {
    return createInitialPlayers();
  }

  const count = clamp(
    players.length,
    PLAYER_CONFIG.minPlayerCount,
    PLAYER_CONFIG.maxPlayerCount,
  );

  return players.slice(0, count).map((player, index) => createPlayer(index, player));
};

export const normalizeGameState = (rawState) => {
  const defaultState = createInitialGameState();
  const board = normalizeBoard(rawState?.board);
  const players = normalizePlayers(rawState?.players).map((player) => ({
    ...player,
    position: clamp(player.position, 0, board.length - 1),
  }));

  return {
    board,
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

export const findBlockingPurpleSpace = (board, startPosition, targetPosition) => {
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
