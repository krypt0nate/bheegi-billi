export type Track = {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  cover?: string;
  rawTitle?: string;
};

export type YTState = {
  PLAYING: number;
  PAUSED: number;
  BUFFERING: number;
  ENDED: number;
};

export type YTPlayerInstance = {
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setPlaybackQuality?: (quality: string) => void;
  getVolume: () => number;
  setVolume: (volume: number) => void;
};

export type YTGlobal = {
  Player: new (
    el: string | HTMLElement,
    opts: Record<string, unknown>,
  ) => YTPlayerInstance;
  PlayerState: YTState;
};

export type WindowWithYT = Window & {
  YT?: YTGlobal;
  onYouTubeIframeAPIReady?: () => void;
  yt?: YTPlayerInstance | null;
  rotateBackground?: (to?: number) => void;
};

export const BUMPER_LINES = [
  "बुरीदिल्ली अभी दूर है",
  "बुरी नज़र वाले तेरा भी भला हो",
  "धीरे चलो, घर कोई इंतज़ार कर रहा है",
  "सफ़र सुहाना हो",
  "यारों का यार",
  "काम बोलता है",
  "आगे बढ़ो, पीछे मत देखो",
  "धीरे चल प्यारे, जीवन अनमोल है।",
  "दम है तो क्रॉस कर, नहीं तो बर्दाश्त कर।",
  "मालिक की गाड़ी, ड्राइवर का पसीना",
  "जल मत पगली, किस्तों पे आई है।",
  "अनार कली भर कर चली।",
] as const;

export const BUMPER_INTERVAL = 12000;

export function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function newBumperOrder() {
  const order = shuffleInPlace(BUMPER_LINES.map((_, i) => i));
  const last = order[order.length - 1];
  if (order[0] === last && order.length > 1) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
}

export function buildOrder(trackCount: number) {
  return shuffleInPlace(Array.from({ length: trackCount }, (_, i) => i));
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
