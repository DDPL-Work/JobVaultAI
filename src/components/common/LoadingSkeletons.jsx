/**
 * Reusable Smooth Shimmer Loading Skeletons matching JobVault AI layouts
 */

export function SkeletonBox({ className = "" }) {
  return (
    <div
      className={`skeleton-shimmer rounded-[5px] ${className}`}
      aria-hidden="true"
    />
  );
}

export function DashboardKpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 min-[1101px]:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="p-[14px_16px] rounded-[8px] bg-white border border-[#DCE1E8] flex flex-col gap-2.5"
        >
          <SkeletonBox className="h-3 w-28" />
          <SkeletonBox className="h-7 w-14 rounded-[6px]" />
          <SkeletonBox className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function DashboardTableSkeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-[#DCE1E8]">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="p-[12px_14px] grid grid-cols-[minmax(0,1.6fr)_130px_90px_90px] max-[640px]:grid-cols-[minmax(0,1fr)_90px] gap-3 items-center"
        >
          <div className="flex flex-col gap-1.5 min-w-0">
            <SkeletonBox className="h-4 w-3/4" />
            <SkeletonBox className="h-3 w-1/2" />
          </div>
          <SkeletonBox className="h-5 w-24 max-[640px]:hidden" />
          <SkeletonBox className="h-4 w-16 max-[640px]:hidden" />
          <SkeletonBox className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function DashboardListCardSkeleton({ rows = 6 }) {
  return (
    <div className="p-4 flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[120px_minmax(0,1fr)_28px] gap-2.5 items-center"
        >
          <SkeletonBox className="h-3.5 w-24" />
          <SkeletonBox className="h-2.5 w-full rounded-full" />
          <SkeletonBox className="h-3.5 w-6 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSparkSkeleton() {
  const barHeights = [22, 35, 18, 48, 28, 16, 40, 24, 58, 30, 20, 44, 26, 78];
  return (
    <div className="p-4">
      <div className="grid grid-cols-14 gap-1 items-end h-[84px]">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="skeleton-shimmer rounded-t-[3px]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-14 gap-1 mt-2">
        {barHeights.map((_, i) => (
          <SkeletonBox key={i} className="h-2.5 w-4 mx-auto" />
        ))}
      </div>
    </div>
  );
}

export function ScreenshotsListSkeleton({ rows = 4 }) {
  return (
    <div className="divide-y divide-[#DCE1E8]">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[52px_minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] max-[900px]:grid-cols-[52px_minmax(0,1fr)_auto] gap-3.5 items-center px-4 py-3"
        >
          <SkeletonBox className="w-[52px] h-[68px] rounded-[4px]" />
          <div className="flex flex-col gap-2 min-w-0">
            <SkeletonBox className="h-3.5 w-3/4" />
            <SkeletonBox className="h-3 w-1/2" />
          </div>
          <div className="max-[900px]:hidden flex flex-col gap-2">
            <div className="grid grid-cols-5 gap-1 max-w-[220px]">
              {Array.from({ length: 5 }).map((_, s) => (
                <SkeletonBox key={s} className="h-[6px] rounded-[3px]" />
              ))}
            </div>
            <SkeletonBox className="h-3 w-20" />
          </div>
          <SkeletonBox className="h-7 w-32 rounded-[6px] max-[900px]:hidden" />
          <SkeletonBox className="w-[28px] h-[28px] rounded-[6px]" />
        </div>
      ))}
    </div>
  );
}

export function JobSheetTableSkeleton({ rows = 8 }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[960px] divide-y divide-[#DCE1E8]">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[95px_minmax(180px,1.4fr)_120px_90px_110px_160px_90px_80px_95px] gap-3 items-center py-3 px-3"
          >
            <SkeletonBox className="h-3.5 w-20" />
            <div className="flex flex-col gap-1.5">
              <SkeletonBox className="h-4 w-4/5" />
              <SkeletonBox className="h-3 w-1/2" />
            </div>
            <SkeletonBox className="h-3.5 w-20" />
            <SkeletonBox className="h-3.5 w-14" />
            <SkeletonBox className="h-3.5 w-20" />
            <SkeletonBox className="h-5 w-32" />
            <SkeletonBox className="h-3.5 w-16" />
            <SkeletonBox className="h-3 w-12" />
            <SkeletonBox className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VaultsGridSkeleton({ cards = 6 }) {
  return (
    <div className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)] flex flex-col"
        >
          <div className="flex items-start justify-between p-3.5 px-4 border-b border-[#DCE1E8] gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <SkeletonBox className="h-5 w-40" />
              <SkeletonBox className="h-3 w-32" />
            </div>
            <div className="flex items-center gap-2.5">
              <SkeletonBox className="h-6 w-14 rounded-[5px]" />
              <SkeletonBox className="h-6 w-6" />
            </div>
          </div>
          <div className="p-3.5 px-4 flex flex-col gap-2.5">
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="border border-[#DCE1E8] rounded-[6px] p-2.5 px-3 flex items-center justify-between gap-2"
              >
                <div className="flex flex-col gap-1.5 flex-1">
                  <SkeletonBox className="h-3.5 w-3/4" />
                  <SkeletonBox className="h-3 w-1/2" />
                </div>
                <SkeletonBox className="h-3.5 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewQueueSkeleton({ cards = 2 }) {
  return (
    <div className="divide-y divide-[#DCE1E8]">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[300px_minmax(0,1fr)] max-[900px]:grid-cols-1"
        >
          <div className="p-3 bg-[#F6F7F9] border-r border-[#DCE1E8] max-[900px]:border-r-0 max-[900px]:border-b flex flex-col gap-2">
            <SkeletonBox className="w-full h-[260px] rounded-[6px]" />
            <SkeletonBox className="h-4 w-40" />
          </div>
          <div className="p-4 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-4 w-20" />
              </div>
              <SkeletonBox className="h-5 w-28 rounded-full" />
            </div>
            <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-3">
              {Array.from({ length: 8 }).map((_, f) => (
                <div key={f} className="flex flex-col gap-1.5">
                  <SkeletonBox className="h-3 w-24" />
                  <SkeletonBox className="h-[32px] w-full rounded-[6px]" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#DCE1E8]/60">
              <SkeletonBox className="h-3.5 w-36" />
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-7 w-16 rounded-[6px]" />
                <SkeletonBox className="h-7 w-36 rounded-[6px]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function VaultRulesSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] max-[900px]:grid-cols-1 gap-4 items-start">
      <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
        <div className="p-3.5 px-4 border-b border-[#DCE1E8]">
          <SkeletonBox className="h-5 w-40" />
        </div>
        <div className="p-4 flex flex-col divide-y divide-[#DCE1E8]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[28px_minmax(0,1.4fr)_minmax(0,1.3fr)_auto] gap-2.5 items-center py-2.5"
            >
              <SkeletonBox className="h-4 w-4 mx-auto" />
              <SkeletonBox className="h-[34px] w-full rounded-[6px]" />
              <SkeletonBox className="h-4 w-36" />
              <SkeletonBox className="h-5 w-5 rounded-[4px]" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F6F7F9] border border-[#DCE1E8] rounded-[8px] p-4 flex flex-col gap-3.5 shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
        <SkeletonBox className="h-5 w-28" />
        <div className="flex flex-col gap-1.5">
          <SkeletonBox className="h-3.5 w-16" />
          <SkeletonBox className="h-[34px] w-full rounded-[6px]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <SkeletonBox className="h-3.5 w-20" />
          <SkeletonBox className="h-[34px] w-full rounded-[6px]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <SkeletonBox className="h-3.5 w-40" />
          <SkeletonBox className="h-[34px] w-full rounded-[6px]" />
        </div>
        <div className="pt-1 flex flex-col gap-2">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-10 w-full rounded-[6px]" />
        </div>
      </div>
    </div>
  );
}

export function SheetColumnsSkeleton({ rows = 10 }) {
  return (
    <div className="bg-white border border-[#DCE1E8] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
      <div className="grid grid-cols-[30px_minmax(0,1fr)_70px] sm:grid-cols-[30px_minmax(0,1fr)_110px_100px_70px] gap-2.5 items-center pb-2.5 border-b border-[#DCE1E8]">
        <span />
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-3 w-16 hidden sm:block" />
        <SkeletonBox className="h-3 w-12 hidden sm:block" />
        <SkeletonBox className="h-3 w-14" />
      </div>
      <div className="divide-y divide-[#DCE1E8]">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[30px_minmax(0,1fr)_70px] sm:grid-cols-[30px_minmax(0,1fr)_110px_100px_70px] gap-2.5 items-center py-2.5"
          >
            <SkeletonBox className="w-[28px] h-[28px] rounded-[4px]" />
            <SkeletonBox className="h-[34px] w-full rounded-[6px]" />
            <SkeletonBox className="h-5 w-10 rounded-full hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1">
              <SkeletonBox className="w-6 h-6 rounded-[4px]" />
              <SkeletonBox className="w-6 h-6 rounded-[4px]" />
            </div>
            <SkeletonBox className="h-5 w-10 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiReadingSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-4 items-stretch">
        <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)] flex flex-col h-full">
          <div className="p-3.5 px-4 border-b border-[#DCE1E8]">
            <SkeletonBox className="h-5 w-24" />
          </div>
          <div className="p-4 flex flex-col gap-2.5">
            {Array.from({ length: 1 }).map((_, i) => (
              <div
                key={i}
                className="border border-[#DCE1E8] rounded-[6px] p-3 flex items-start gap-3"
              >
                <SkeletonBox className="w-4 h-4 rounded-full mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <SkeletonBox className="h-4 w-32" />
                  <SkeletonBox className="h-3 w-52" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
          <div className="p-3.5 px-4 border-b border-[#DCE1E8]">
            <SkeletonBox className="h-5 w-20" />
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2 pb-3 border-b border-[#DCE1E8]">
              <SkeletonBox className="h-3.5 w-64" />
              <SkeletonBox className="h-2.5 w-full rounded-full" />
              <SkeletonBox className="h-3 w-48" />
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-[#DCE1E8]">
              <SkeletonBox className="h-5 w-10 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <SkeletonBox className="h-4 w-36" />
                <SkeletonBox className="h-3 w-60" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <SkeletonBox className="h-5 w-10 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <SkeletonBox className="h-4 w-36" />
                <SkeletonBox className="h-3 w-64" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
        <div className="p-3.5 px-4 border-b border-[#DCE1E8]">
          <SkeletonBox className="h-5 w-48" />
        </div>
        <div className="p-4 flex flex-col gap-3">
          <SkeletonBox className="h-[106px] w-full rounded-[6px]" />
          <SkeletonBox className="h-3.5 w-72" />
        </div>
      </div>
    </div>
  );
}

export function IntegrationsSkeleton({ rows = 2 }) {
  return (
    <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)] divide-y divide-[#DCE1E8]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3.5 p-4">
          <SkeletonBox className="w-[40px] h-[40px] rounded-[8px] shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <SkeletonBox className="h-4 w-32" />
              <SkeletonBox className="h-5 w-20 rounded-full" />
              <SkeletonBox className="h-5 w-16 rounded-full" />
            </div>
            <SkeletonBox className="h-3.5 w-3/4 max-w-[420px]" />
          </div>
          <SkeletonBox className="h-7 w-20 rounded-[6px] shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ActivityLogSkeleton({ rows = 10 }) {
  return (
    <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)] divide-y divide-[#DCE1E8]">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[160px_130px_minmax(0,1fr)] max-[620px]:grid-cols-1 gap-3 max-[620px]:gap-1.5 px-4 py-[11px] items-center"
        >
          <SkeletonBox className="h-3.5 w-32" />
          <SkeletonBox className="h-3.5 w-20" />
          <SkeletonBox className="h-3.5 w-4/5 max-w-[460px]" />
        </div>
      ))}
    </div>
  );
}
