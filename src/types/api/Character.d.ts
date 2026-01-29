/**
 * Character API Response Types
 * API Route: /api/user/character
 */

/**
 * Money object representing player's funds
 */
export type PlayerMoney = {
  bank: number;
  crypto: number;
  cash: number;
};

/**
 * Character information from FiveM charinfo
 */
export type CharacterInfo = {
  account: string;
  cid: number;
  birthdate: string;
  gender: number; // 0 = male, 1 = female
  lastname: string;
  phone: string;
  backstory: string;
  nationality: string;
  firstname: string;
};

/**
 * Job grade information
 */
export type JobGrade = {
  name: string;
  level: number;
};

/**
 * Job information
 */
export type PlayerJob = {
  isboss: boolean;
  label: string;
  bankAuth: boolean;
  grade: JobGrade;
  payment: number;
  name: string;
  onduty: boolean;
};

/**
 * Gang grade information
 */
export type GangGrade = {
  name: string;
  level: number;
};

/**
 * Gang information
 */
export type PlayerGang = {
  isboss: boolean;
  grade: GangGrade;
  label: string;
  name: string;
  bankAuth: boolean;
};

/**
 * Player position coordinates
 */
export type PlayerPosition = {
  x: number;
  y: number;
  z: number;
  w: number;
};

/**
 * Phone data from metadata
 */
export type PhoneData = {
  SerialNumber: number;
  InstalledApps: unknown[];
};

/**
 * Criminal record information
 */
export type CriminalRecord = {
  hasRecord: boolean;
};

/**
 * Job reputation per job type
 */
export type JobReputation = {
  trucker: number;
  hotdog: number;
  taxi: number;
  tow: number;
};

/**
 * Player licenses
 */
export type Licences = {
  weapon: boolean;
  driver: boolean;
  id: boolean;
};

/**
 * Player metadata containing various stats and flags
 */
export type PlayerMetadata = {
  stress: number;
  dealerrep: number;
  tracker: boolean;
  optin: boolean;
  phonedata: PhoneData;
  hunger: number;
  criminalrecord: CriminalRecord;
  injail: number;
  callsign: string;
  inlaststand: boolean;
  starterpack_claimed: boolean;
  attachmentcraftingrep: number;
  thirst: number;
  isdead: boolean;
  zoneBypassEnabled: boolean;
  bloodtype: string;
  jobrep: JobReputation;
  inside: {
    apartment: unknown[];
  };
  armor: number;
  weaponRestrictionsEnabled: boolean;
  zoneParticipant: boolean;
  craftingrep: number;
  ishandcuffed: boolean;
  status: unknown[];
  jailitems: unknown[];
  licences: Licences;
  fingerprint: string;
  phone: unknown[];
  starterpack_initialized: boolean;
  walletid: string;
  health: number;
};

/**
 * Inventory item metadata (varies by item type)
 */
export type InventoryItemMetadata = {
  ammo?: number;
  components?: unknown[];
  serial?: string;
  durability?: number;
  registered?: string;
  [key: string]: unknown;
};

/**
 * Player inventory item
 */
export type InventoryItem = {
  slot: number;
  name: string;
  count: number;
  metadata?: InventoryItemMetadata;
};

/**
 * Character API response - data returned directly at top level
 */
export type Character = {
  id: number;
  userId: number;
  citizenid: string;
  cid: number;
  license: string;
  name: string;
  money: PlayerMoney;
  charinfo: CharacterInfo;
  job: PlayerJob;
  gang: PlayerGang | null;
  position: PlayerPosition;
  metadata: PlayerMetadata;
  inventory: InventoryItem[];
  phone_number: string;
  last_updated: string;
  last_logged_out: string;
};

/**
 * Character API response type alias
 */
export type CharacterResponse = Character;
