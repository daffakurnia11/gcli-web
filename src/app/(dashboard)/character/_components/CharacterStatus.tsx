import {
  Anvil,
  Car,
  Droplet,
  Hamburger,
  Heart,
  LogOut,
  Shield,
  Upload,
  Users,
} from "lucide-react";

import { Typography } from "@/components/typography";
import { Character } from "@/types/api/Character";

import { DashboardCard, DashboardSection } from "../../_components/dashboard";
import StatusBar from "./StatusBar";

export default function CharacterStatus({
  data,
  isLoading,
}: {
  data: Character | undefined;
  isLoading: boolean;
}) {
  const showNoData = !isLoading && !data;
  const showLoading = isLoading;
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <DashboardSection title="Character Status">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
          {showLoading && (
            <div className="absolute z-10 top-0 left-0 right-0 bottom-0 backdrop-blur flex flex-col justify-center items-center gap-2">
              <Typography.Heading type="heading" level={6}>
                Loading Character Status
              </Typography.Heading>
              <Typography.Paragraph className="text-primary-300">
                Fetching your latest status details...
              </Typography.Paragraph>
            </div>
          )}
          {showNoData && (
            <div className="absolute z-10 top-0 left-0 right-0 bottom-0 backdrop-blur flex flex-col justify-center items-center">
              <Typography.Heading type="heading" level={6}>
                No Character Data Available
              </Typography.Heading>
              <Typography.Paragraph className="text-primary-300">
                Create your character in-game to see your information here.
              </Typography.Paragraph>
            </div>
          )}
          <DashboardCard className="space-y-4">
            <StatusBar
              title="Health Bar"
              icon={
                <Heart size={20} fill="#f87171" className="text-[#f87171]" />
              }
              current={data?.metadata?.health || 0}
              min={100}
              max={200}
              barColor="bg-[#f87171]"
            />
            <StatusBar
              title="Armor Bar"
              icon={
                <Shield size={20} fill="#6366f1" className="text-[#6366f1]" />
              }
              current={data?.metadata?.armor || 0}
              max={100}
              barColor="bg-[#6366f1]"
            />
            <StatusBar
              title="Hunger Bar"
              icon={
                <Hamburger
                  size={20}
                  fill="#facc15"
                  className="text-[#facc15]"
                />
              }
              current={data?.metadata?.hunger || 0}
              max={100}
              barColor="bg-[#facc15]"
            />
            <StatusBar
              title="Thirst Bar"
              icon={
                <Droplet size={20} fill="#38bdf8" className="text-[#38bdf8]" />
              }
              current={data?.metadata?.thirst || 0}
              max={100}
              barColor="bg-[#38bdf8]"
            />
          </DashboardCard>
          <DashboardCard className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <LogOut size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">Last Logout:</span>
                <span className="text-primary-100 shrink-0">
                  {formatDate(data?.last_logged_out)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Upload size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">Last Update:</span>
                <span className="text-primary-100 shrink-0">
                  {formatDate(data?.last_updated)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Car size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">
                  Starterpack Status:
                </span>
                {data?.metadata?.starterpack_claimed ? (
                  <span className="text-primary-100 shrink-0">Claimed</span>
                ) : (
                  <span className="text-green-500 shrink-0">Available</span>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Anvil size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">Crafting XP:</span>
                <span className="text-primary-100 shrink-0">
                  {data?.metadata?.craftingrep || 0} XP
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Users size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">Gang Status:</span>
                <span className="text-primary-100 shrink-0">
                  {!data?.gang || data?.gang?.name.toLowerCase() === "none"
                    ? "Not Affiliated"
                    : data?.gang?.grade.name + " - " + data?.gang?.label}
                </span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </DashboardSection>
    </div>
  );
}
