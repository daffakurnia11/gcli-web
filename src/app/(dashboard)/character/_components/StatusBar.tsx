import classNames from "classnames";

import { Typography } from "@/components/typography";

export default function StatusBar({
  title,
  icon,
  current,
  max,
  min = 0,
  barColor,
}: {
  title: string;
  icon: React.ReactNode;
  current: number;
  max: number;
  min?: number;
  barColor: string;
}) {
  const range = Math.max(1, max - min);
  const normalizedCurrent = Math.min(Math.max(current, min), max) - min;
  const percentage = (normalizedCurrent / range) * 100;

  return (
    <div className="flex flex-col gap-2">
      <Typography.Small className="text-primary-300 shrink-0">
        {title}
      </Typography.Small>
      <div className="flex items-center gap-3 text-sm">
        {icon}
        <div className="flex-1 w-full bg-primary-800 rounded-full h-2 overflow-hidden border border-primary-700">
          <div
            className={classNames("h-4", barColor)}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
        <Typography.Small className="text-primary-300 shrink-0 w-full max-w-16 text-right">
          {normalizedCurrent.toFixed(0)} / {range}
        </Typography.Small>
      </div>
    </div>
  );
}
