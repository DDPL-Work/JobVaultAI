import { Link } from "react-router-dom";

export default function VaultCard({
  name,
  desc,
  jobs = [],
  onJobClick,
}) {
  const visibleJobs = jobs.slice(0, 5);

  return (
    <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)] flex flex-col">
      {/* Vault Header */}
      <div className="flex items-center justify-between p-3.5 px-4 border-b border-[#DCE1E8]">
        <div>
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] leading-snug m-0">
            {name}
          </h2>
          <span className="text-[#5A6777] text-[0.78rem] block mt-0.5">
            {desc}
          </span>
        </div>
        <span className="font-['IBM_Plex_Mono',monospace] text-[1.4rem] font-semibold text-[#15202C] select-none">
          {jobs.length}
        </span>
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
            to={`/jobs?vault=${encodeURIComponent(name)}`}
            className="text-[0.78rem] text-[#235F8C] hover:underline font-semibold mt-1 inline-block"
          >
            See all {jobs.length}
          </Link>
        )}
      </div>
    </div>
  );
}

