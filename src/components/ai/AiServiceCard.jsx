import React from "react";

export default function AiServiceCard({
  provider,
  selected = false,
  onSelect,
}) {
  const isOff = !provider.configured;

  return (
    <label
      className={`flex gap-3 items-start border rounded-[6px] p-3 transition-colors ${
        selected
          ? "border-[#9C6B12] bg-[#F5EAD3]"
          : "border-[#DCE1E8] bg-white hover:border-[#B5BFC9]"
      } ${isOff ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={(e) => {
        if (isOff) {
          e.preventDefault();
        }
      }}
    >
      <input
        type="radio"
        name="ai_provider"
        value={provider.id}
        checked={selected}
        disabled={isOff}
        onChange={() => !isOff && onSelect(provider.id)}
        className="mt-1 accent-[#9C6B12] cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="flex flex-col select-none">
        <b className="font-['Instrument_Sans',sans-serif] text-[0.88rem] font-bold text-[#15202C] leading-snug">
          {provider.name}
        </b>
        <span className="text-[#5A6777] text-[0.78rem] leading-normal mt-0.5">
          {provider.description}
          {provider.configured ? (
            <>
              {" · "}
              <span className="font-mono text-[0.75rem] text-[#15202C]">
                {provider.model}
              </span>
            </>
          ) : (
            " · add the key to .env to use"
          )}
        </span>
      </div>
    </label>
  );
}

