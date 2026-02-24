export interface PlayerStats {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  hunger: number;
  thirst: number;
  stress: number;
  oxygen: number;
  stamina: number;
  speed: number;
  fuel: number;
  engine: number;
  seatbelt: boolean;
  rpm: number;
}

export interface PlayerData {
  show: boolean;
  talking: boolean;
  talkingOnRadio: boolean;
  hasRadio: boolean;
  armed: boolean;
  parachute: number;
  playerDead: boolean;
  voice: number;
  currentAmmo: number;
  reserveAmmo: number;
  inLastStand: boolean;
}

export interface VehicleData {
  show: boolean;
  seatbelt: boolean;
  cruise: boolean;
  nos: number;
  gear: number;
  gearProgress: number;
  speedUnit: string;
}

export interface WarningData {
  lowFuel: boolean;
  lowHealth: boolean;
}

export interface AccountData {
  type: string;
  amount: number;
  visible: boolean;
}

export interface NUIMessage {
  action: string;
  data?: unknown;
}

export interface StatusBarProps {
  value: number;
  maxValue?: number;
  type: 'hunger' | 'thirst' | 'stress' | 'oxygen';
  className?: string;
}

export interface HealthBarProps {
  health: number;
  maxHealth: number;
  isHealing?: boolean;
  inLastStand?: boolean;
  className?: string;
}

export interface ArmorBarProps {
  armor: number;
  maxArmor: number;
  isRepairing?: boolean;
  className?: string;
}