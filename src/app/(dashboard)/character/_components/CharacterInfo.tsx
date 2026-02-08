import {
  Calendar,
  DollarSign,
  Flag,
  IdCard,
  Phone,
  User,
  UserCheck2,
} from "lucide-react";

import { Typography } from "@/components/typography";
import { formatDateOnly } from "@/services/date";

import { DashboardCard, DashboardSection } from "../../_components/dashboard";

export default function CharacterInfo({
  data,
  isLoading,
}: {
  data: Character | undefined;
  isLoading: boolean;
}) {
  const showNoData = !isLoading && !data;
  const showLoading = isLoading;
  const cashBalance = data?.money?.cash ?? 0;
  const bankBalance = data?.money?.bank ?? 0;

  return (
    <div className="space-y-6">
      <DashboardSection title="Character Information">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-lg">
          {showLoading && (
            <div className="absolute z-10 top-0 left-0 right-0 bottom-0 backdrop-blur flex flex-col justify-center items-center gap-2">
              <Typography.Heading type="heading" level={6}>
                Loading Character Data
              </Typography.Heading>
              <Typography.Paragraph className="text-primary-300">
                Fetching your latest character details...
              </Typography.Paragraph>
            </div>
          )}
          {showNoData && (
            <div className="absolute z-10 top-0 left-0 right-0 bottom-0 backdrop-blur flex flex-col justify-center items-center gap-2">
              <Typography.Heading type="heading" level={6}>
                No Character Data Available
              </Typography.Heading>
              <Typography.Paragraph className="text-primary-300">
                Create your character in-game to see your information here.
              </Typography.Paragraph>
            </div>
          )}
          <DashboardCard>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <User size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">In-game Name:</span>
                <span className="text-primary-100">
                  {data?.charinfo?.firstname || "N/A"}{" "}
                  {data?.charinfo?.lastname || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <UserCheck2 size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">FiveM Name:</span>
                <span className="text-primary-100">{data?.name || "N/A"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <IdCard size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">CitizenId:</span>
                <span className="text-primary-100">
                  {data?.citizenid || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">Birth Date:</span>
                <span className="text-primary-100">
                  {formatDateOnly(data?.charinfo?.birthdate)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Flag size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">Nationality:</span>
                <span className="text-primary-100">
                  {data?.charinfo?.nationality || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Phone size={18} className="text-primary-300 shrink-0" />
                <span className="text-primary-300 shrink-0">Phone:</span>
                <span className="text-primary-100">
                  {data?.charinfo?.phone || "N/A"}
                </span>
              </div>
            </div>
          </DashboardCard>
          <div className="space-y-4">
            <DashboardCard className="flex flex-col gap-2">
              <Typography.Paragraph className="text-primary-300 shrink-0">
                Cash Balance:
              </Typography.Paragraph>
              <Typography.Heading
                type="display"
                level={4}
                className="text-primary-100 flex items-center gap-2"
              >
                <DollarSign className="text-primary-300" />
                {cashBalance.toLocaleString()}
              </Typography.Heading>
            </DashboardCard>
            <DashboardCard className="flex flex-col gap-2">
              <Typography.Paragraph className="text-primary-300 shrink-0">
                Bank Account Balance:
              </Typography.Paragraph>
              <Typography.Heading
                type="display"
                level={4}
                className="text-primary-100 flex items-center gap-2"
              >
                <DollarSign className="text-primary-300" />
                {bankBalance.toLocaleString()}
              </Typography.Heading>
            </DashboardCard>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}
