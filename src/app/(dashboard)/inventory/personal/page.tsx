"use client";

import Image from "next/image";
import { useMemo } from "react";

import { Typography } from "@/components/typography";
import { useApiSWR } from "@/services/swr";

import { DashboardCard } from "../../_components/dashboard";

const TOTAL_SLOTS = 50;

function getItemDisplayName(itemName: string) {
  return itemName
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function PersonalInventoryPage() {
  const { data, isLoading } = useApiSWR<Character>("/api/user/character");

  const inventoryBySlot = useMemo(() => {
    const map = new Map<number, InventoryItem>();
    for (const item of data?.inventory ?? []) {
      if (typeof item?.slot === "number") {
        map.set(item.slot, item);
      }
    }
    return map;
  }, [data?.inventory]);

  return (
    <div className="space-y-6">
      <div>
        <Typography.Heading
          level={4}
          as="h2"
          type="display"
          className="uppercase tracking-wider text-primary-100"
        >
          Personal Inventory
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Slot-based inventory view (OX-style) for your character.
        </Typography.Paragraph>
      </div>

      <div className="bg-secondary-700 px-4 py-2 rounded-lg">
        <Typography.Paragraph>
          This inventory is only updated in every 5 minutes, so it does not reflect
          the actual inventory of your character while you are in-game.
        </Typography.Paragraph>
      </div>

      <DashboardCard className="p-3 sm:p-4 h-[calc(100vh-14rem)] overflow-auto">
        <div className="grid grid-cols-5 gap-2 w-3xl mx-auto">
          {Array.from({ length: TOTAL_SLOTS }, (_, index) => {
            const slotNumber = index + 1;
            const item = inventoryBySlot.get(slotNumber);
            const durability = Number(item?.metadata?.durability ?? 0);
            const showDurability =
              Number.isFinite(durability) && durability > 0;

            return (
              <div
                key={slotNumber}
                className="relative rounded-md border border-primary-700 bg-primary-700 overflow-hidden"
                title={
                  item
                    ? `${getItemDisplayName(item.name)} x${item.count}`
                    : `Slot ${slotNumber}`
                }
              >
                <div className="absolute top-1 right-1 text-[10px] leading-none font-medium text-primary-300/80">
                  {slotNumber}
                </div>

                <div className="w-full p-3 flex flex-col">
                  <div className="flex-1 rounded-sm bg-primary-900/80 border border-primary-700/60 h-full! w-auto! aspect-square flex items-center justify-center overflow-hidden p-4">
                    {item?.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={100}
                        height={100}
                        unoptimized
                        className="col-start-1 row-start-1 object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>

                  <div className="h-8">
                    <p className="mt-1 text-[10px] leading-none text-primary-100 truncate uppercase">
                      {item && getItemDisplayName(item.name)}
                    </p>

                    <div className="mt-1 flex items-center justify-between">
                      {item && (
                        <span className="text-[10px] leading-none text-primary-300">
                          x{item.count}
                        </span>
                      )}
                      {showDurability && (
                        <span className="text-[10px] leading-none text-primary-300">
                          {Math.round(durability)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 h-1 w-full rounded-full bg-primary-700">
                    {showDurability && (
                      <div
                        className="h-full rounded-full bg-secondary-500"
                        style={{
                          width: `${Math.max(0, Math.min(100, durability))}%`,
                        }}
                      />
                    )}
                  </div>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 bg-primary-900/20 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </DashboardCard>
    </div>
  );
}
