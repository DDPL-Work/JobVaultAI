import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";

export default function VaultCard({
  vault = null,
  name,
  desc,
  min_exp,
  max_exp,
  is_active = true,
  jobs = [],
  onJobClick,
  onEdit,
}) {
  const vaultName = vault?.name || name;
  const vaultDesc = vault?.desc || vault?.description || desc;
  const minE = vault?.min_exp !== undefined ? vault.min_exp : min_exp;
  const maxE = vault?.max_exp !== undefined ? vault.max_exp : max_exp;
  const isActive = vault?.is_active !== undefined ? vault.is_active : is_active;

  let expLabel = null;
  if (minE !== null && minE !== undefined && maxE !== null && maxE !== undefined) {
    expLabel = `${minE}–${maxE} yrs`;
  } else if (minE !== null && minE !== undefined) {
    expLabel = `${minE}+ yrs`;
  } else if (maxE !== null && maxE !== undefined) {
    expLabel = `< ${maxE} yrs`;
  }

  const visibleJobs = jobs.slice(0, 5);

  return (
    <div
      className={`bg-white border rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)] flex flex-col transition-all ${
        isActive === false ? "border-[#DCE1E8] opacity-80" : "border-[#DCE1E8]"
      }`}
    >
      {/* Vault Header */}
      <div className="flex items-start justify-between p-3.5 px-4 border-b border-[#DCE1E8] gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.05rem] font-bold text-[#15202C] leading-snug m-0 truncate">
              {vaultName}
            </h2>
            {isActive === false && (
              <span className="text-[0.66rem] font-semibold text-[#7A8696] bg-[#EDF1F5] px-1.5 py-0.5 rounded border border-[#DCE1E8]">
                Inactive
              </span>
            )}
            {expLabel && (
              <span className="text-[0.66rem] font-medium font-['IBM_Plex_Mono',monospace] text-[#5A6777] bg-[#F6F7F9] px-1.5 py-0.5 rounded border border-[#DCE1E8]">
                {expLabel}
              </span>
            )}
          </div>
          <span className="text-[#5A6777] text-[0.78rem] block mt-0.5 truncate" title={vaultDesc}>
            {vaultDesc}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dedicated Edit Button */}
          <button
            type="button"
            onClick={() =>
              onEdit?.(
                vault || {
                  name: vaultName,
                  desc: vaultDesc,
                  min_exp: minE,
                  max_exp: maxE,
                  is_active: isActive,
                }
              )
            }
            className="text-[0.75rem] font-semibold text-[#15202C] hover:text-[#9C6B12] bg-[#F6F7F9] hover:bg-[#F0F2F5] border border-[#DCE1E8] hover:border-[#9C6B12] rounded-[5px] px-2.5 py-1 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs select-none group"
            title={`Edit ${vaultName} vault`}
          >
            <FiEdit2 className="w-3 h-3 text-[#5A6777] group-hover:text-[#9C6B12] transition-colors" />
            <span>Edit</span>
          </button>

          <span className="font-['IBM_Plex_Mono',monospace] text-[1.35rem] font-semibold text-[#15202C] select-none min-w-[24px] text-right">
            {jobs.length > 0 ? jobs.length : (vault?.count ?? 0)}
          </span>
        </div>
      </div>

      {/* Vault Body */}
      <div className="p-3.5 px-4 flex flex-col gap-2 flex-1">
        {visibleJobs.length > 0 ? (
          visibleJobs.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => onJobClick?.(job)}
              className="border border-[#DCE1E8] rounded-[6px] p-2.5 px-3 bg-white hover:bg-[#F6F7F9] hover:border-[#5A6777] transition-all flex items-center justify-between text-left cursor-pointer w-full group select-none"
            >
              <span className="min-w-0 pr-2">
                <b className="font-semibold text-[0.85rem] text-[#15202C] block leading-tight truncate">
                  {job.title}
                </b>
                <span className="text-[0.78rem] text-[#5A6777] block mt-0.5 truncate">
                  {job.company} · {job.location}
                </span>
              </span>
              <span className="font-['IBM_Plex_Mono',monospace] text-[0.78rem] text-[#5A6777] shrink-0 text-right">
                {job.experience}
              </span>
            </button>
          ))
        ) : (
          <span className="text-[#5A6777] text-[0.82rem] py-4 text-center block">
            No jobs in this vault yet.
          </span>
        )}

        {jobs.length > 5 && (
          <Link
            to={`/jobs?vault=${encodeURIComponent(vaultName)}`}
            className="text-[0.78rem] text-[#235F8C] hover:underline font-semibold mt-1 inline-block"
          >
            See all {jobs.length}
          </Link>
        )}
      </div>
    </div>
  );
}
