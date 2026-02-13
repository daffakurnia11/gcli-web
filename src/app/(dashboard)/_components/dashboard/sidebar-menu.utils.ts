export type SidebarGroup = {
  type: "group";
  title: string;
};

export type SidebarChildItem = {
  href: string;
  label: string;
};

export type SidebarLinkItem = {
  type: "item";
  href: string;
  label: string;
  sidebar?: boolean;
  children?: SidebarChildItem[];
};

export type SidebarEntry = SidebarGroup | SidebarLinkItem;

const ADMIN_MENU_ITEMS: SidebarEntry[] = [
  {
    type: "item",
    href: "/admin/overview",
    label: "Overview",
    sidebar: true,
  },
  {
    type: "item",
    href: "/admin/investment",
    label: "Investment",
    sidebar: true,
  },
  { type: "group", title: "Payment" },
  {
    type: "item",
    href: "/admin/payment",
    label: "Recap",
    sidebar: true,
  },
  { type: "group", title: "League" },
  {
    type: "item",
    href: "/admin/league/list",
    label: "List",
    sidebar: true,
  },
  {
    type: "item",
    href: "/admin/league/status",
    label: "Status",
    sidebar: true,
  },
  {
    type: "item",
    href: "/admin/league/schedule",
    label: "Schedule",
    sidebar: true,
  },
  { type: "item", href: "/profile", label: "Profile" },
  { type: "item", href: "/settings", label: "Settings" },
];

const BASE_PLAYER_MENU_ITEMS: SidebarEntry[] = [
  { type: "item", href: "/dashboard", label: "Dashboard", sidebar: true },
  { type: "item", href: "/profile", label: "Profile" },
  { type: "item", href: "/settings", label: "Settings" },
];

const PLAYER_CORE_MENU_ITEM: SidebarEntry = {
  type: "item",
  href: "/",
  label: "Player",
  sidebar: true,
  children: [
    { href: "/character", label: "Character" },
    { href: "/inventory", label: "My Inventory" },
    { href: "/bank", label: "My Bank" },
  ],
};

const PLAYER_PAYMENT_MENU_ITEM: SidebarEntry = {
  type: "item",
  href: "/payment",
  label: "Payments",
};

const TEAM_MENU_ITEMS_FOR_MEMBER = (): SidebarEntry[] => [
  {
    type: "item",
    href: "/team",
    label: "Team",
    sidebar: true,
    children: [
      { href: "/team/info", label: "Overview" },
      { href: "/team/members", label: "Members" },
      { href: "/team/inventory", label: "Inventory" },
    ],
  },
  {
    type: "item",
    href: "/league",
    label: "League",
    sidebar: true,
    children: [{ href: "/league/join", label: "Join" }],
  },
  {
    type: "item",
    href: "/kill-log",
    label: "Log",
    sidebar: true,
    children: [
      { href: "/kill-log/kill", label: "Kill Records" },
      { href: "/kill-log/dead", label: "Death Records" },
    ],
  },
  {
    type: "item",
    href: "/payment",
    label: "Payment",
    sidebar: true,
  },
];

const LEAGUE_MENU_TRACKING_CHILDREN: SidebarChildItem[] = [
  { href: "/league/status", label: "Status" },
  { href: "/league/schedule", label: "Schedule" },
];

const TEAM_BOSS_CHILDREN: SidebarChildItem[] = [
  { href: "/team/bank", label: "Team Bank" },
  { href: "/team/investment", label: "Investment Bank" },
  { href: "/team/options", label: "Team Options" },
];

const TEAM_MENU_ITEMS_FOR_NO_GANG: SidebarEntry[] = [
  {
    type: "item",
    href: "/team/create",
    label: "Create Team",
    sidebar: true,
  },
];

export const getSidebarItems = (
  isAdminRoute: boolean,
  isGangBoss: boolean,
  hasCharinfo: boolean,
  hasGang: boolean,
  hasJoinedLeague: boolean,
): SidebarEntry[] => {
  if (isAdminRoute) {
    return ADMIN_MENU_ITEMS;
  }

  if (!hasCharinfo) {
    return BASE_PLAYER_MENU_ITEMS;
  }

  const teamItems = hasGang
    ? TEAM_MENU_ITEMS_FOR_MEMBER().map((item) => {
        if (item.type === "item" && item.href === "/league" && item.children) {
          return {
            ...item,
            children: hasJoinedLeague
              ? LEAGUE_MENU_TRACKING_CHILDREN
              : item.children,
          };
        }

        if (
          item.type !== "item" ||
          item.href !== "/team" ||
          !item.children ||
          !isGangBoss
        ) {
          return item;
        }

        return {
          ...item,
          children: [...item.children, ...TEAM_BOSS_CHILDREN],
        };
      })
    : TEAM_MENU_ITEMS_FOR_NO_GANG;

  return [
    ...BASE_PLAYER_MENU_ITEMS.slice(0, 2),
    PLAYER_CORE_MENU_ITEM,
    PLAYER_PAYMENT_MENU_ITEM,
    ...teamItems,
    ...BASE_PLAYER_MENU_ITEMS.slice(2),
  ];
};
