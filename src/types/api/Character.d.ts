declare global {
  type PlayerMoney = {
    bank: number;
    crypto: number;
    cash: number;
  };

  type CharacterInfo = {
    account: string;
    cid: number;
    birthdate: string;
    gender: number;
    lastname: string;
    phone: string;
    backstory: string;
    nationality: string;
    firstname: string;
  };

  type JobGrade = {
    name: string;
    level: number;
  };

  type PlayerJob = {
    isboss: boolean;
    label: string;
    bankAuth: boolean;
    grade: JobGrade;
    payment: number;
    name: string;
    onduty: boolean;
  };

  type GangGrade = {
    name: string;
    level: number;
  };

  type PlayerGang = {
    isboss: boolean;
    grade: GangGrade;
    label: string;
    name: string;
    bankAuth: boolean;
  };

  type PlayerPosition = {
    x: number;
    y: number;
    z: number;
    w: number;
  };

  type PhoneData = {
    SerialNumber: number;
    InstalledApps: unknown[];
  };

  type CriminalRecord = {
    hasRecord: boolean;
  };

  type JobReputation = {
    trucker: number;
    hotdog: number;
    taxi: number;
    tow: number;
  };

  type Licences = {
    weapon: boolean;
    driver: boolean;
    id: boolean;
  };

  type PlayerMetadata = {
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

  type InventoryItemMetadata = {
    ammo?: number;
    components?: unknown[];
    serial?: string;
    durability?: number;
    registered?: string;
    [key: string]: unknown;
  };

  type InventoryItem = {
    slot: number;
    name: string;
    count: number;
    metadata?: InventoryItemMetadata;
    imageUrl?: string;
  };

  type Character = {
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

  type CharacterResponse = Character;
}

export {};
