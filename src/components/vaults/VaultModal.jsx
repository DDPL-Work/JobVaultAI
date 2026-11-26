import { useState, useEffect } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";

export default function VaultModal({
  isOpen,
  vault = null,
  saving = false,
  onClose,
  onSave,
  onDelete,
}) {
  const isEdit = Boolean(vault && (vault.id || vault.name));

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (vault) {
        setName(vault.name || "");
        setDesc(vault.description || vault.desc || "");
        setMinExp(vault.min_exp !== null && vault.min_exp !== undefined ? vault.min_exp : "");
        setMaxExp(vault.max_exp !== null && vault.max_exp !== undefined ? vault.max_exp : "");
        setIsActive(vault.is_active !== undefined ? vault.is_active : true);
      } else {
        setName("");
        setDesc("");
        setMinExp("");
        setMaxExp("");
        setIsActive(true);
      }
      setConfirmDelete(false);
    }
  }, [isOpen, vault]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedMin = minExp === "" ? null : Number(minExp);
    const parsedMax = maxExp === "" ? null : Number(maxExp);

    // Auto-generate fallback description if user left it blank
    let generatedDesc = desc.trim();
    if (!generatedDesc) {
      if (parsedMin !== null && parsedMax !== null) {
        generatedDesc = `${parsedMin}–${parsedMax} yrs experience`;
      } else if (parsedMin !== null && parsedMax === null) {
        generatedDesc = `${parsedMin}+ yrs experience`;
      } else if (parsedMin === null && parsedMax !== null) {
        generatedDesc = `Under ${parsedMax} yrs experience`;
      } else {
        generatedDesc = "All experience levels";
      }
    }

    onSave?.({
      id: vault?.id || name.trim(),
      originalName: vault?.name || null,
      name: name.trim(),
      desc: generatedDesc,
      description: generatedDesc,
      min_exp: parsedMin,
      max_exp: parsedMax,
      is_active: isActive,
    });
  };

  const handleDelete = () => {
    if (saving) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (vault) {
      onDelete?.(vault);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with smooth blur and fade */}
      <div
        className="fixed inset-0 bg-[#15202C]/50 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-[10px] border border-[#DCE1E8] shadow-[0_16px_40px_rgba(21,32,44,0.18)] w-full max-w-[500px] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-[#DCE1E8]">
          <div>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.15rem] font-bold text-[#15202C] leading-snug m-0">
              {isEdit ? "Edit Vault" : "Add New Vault"}
            </h2>
            <p className="text-[0.78rem] text-[#5A6777] mt-0.5 m-0">
              Configure access tier, experience bounds, and active status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[6px] text-[#5A6777] hover:text-[#15202C] hover:bg-[#F6F7F9] transition-colors flex items-center justify-center cursor-pointer"
            title="Close"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-[0.84rem]">
          {/* Vault Title */}
          <div>
            <label className="block text-[0.76rem] font-semibold text-[#15202C] uppercase tracking-[0.06em] mb-1">
              Vault Title / Name <span className="text-[#A8281F]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. India · Fresher, Healthcare Tech, AI & ML"
              className="w-full border border-[#DCE1E8] bg-white rounded-[6px] px-3 py-2 text-[#15202C] text-[0.85rem] focus:outline-none focus:border-[#9C6B12] focus:ring-1 focus:ring-[#9C6B12]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[0.76rem] font-semibold text-[#15202C] uppercase tracking-[0.06em] mb-1">
              Description / Subtitle
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. India · under 2 yrs, Remote / work from anywhere"
              className="w-full border border-[#DCE1E8] bg-white rounded-[6px] px-3 py-2 text-[#15202C] text-[0.85rem] focus:outline-none focus:border-[#9C6B12] focus:ring-1 focus:ring-[#9C6B12]"
            />
          </div>

          {/* Experience Bounds (Min & Max) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.76rem] font-semibold text-[#15202C] uppercase tracking-[0.06em] mb-1">
                Min Experience (Yrs)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
                placeholder="0 (Any)"
                className="w-full border border-[#DCE1E8] bg-white rounded-[6px] px-3 py-2 text-[#15202C] text-[0.85rem] focus:outline-none focus:border-[#9C6B12]"
              />
            </div>
            <div>
              <label className="block text-[0.76rem] font-semibold text-[#15202C] uppercase tracking-[0.06em] mb-1">
                Max Experience (Yrs)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={maxExp}
                onChange={(e) => setMaxExp(e.target.value)}
                placeholder="No limit (e.g. 10+)"
                className="w-full border border-[#DCE1E8] bg-white rounded-[6px] px-3 py-2 text-[#15202C] text-[0.85rem] focus:outline-none focus:border-[#9C6B12]"
              />
            </div>
          </div>

          {/* Active Status Toggle */}
          {/* <div className="border border-[#DCE1E8] rounded-[8px] p-3 px-3.5 bg-[#F6F7F9] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#15202C] text-[0.84rem]">
                  Active Vault
                </span>
                <span
                  className={`text-[0.68rem] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-[#DCF0E3] text-[#24734A]"
                      : "bg-[#EDF1F5] text-[#5A6777]"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <span className="text-[0.75rem] text-[#5A6777] block mt-0.5">
                Jobs can be sorted and exported into this vault tab.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? "bg-[#24734A]" : "bg-[#DCE1E8]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div> */}


          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#DCE1E8] mt-1">
            {isEdit ? (
              <button
                type="button"
                disabled={saving}
                onClick={handleDelete}
                className={`text-[0.8rem] font-semibold px-3 py-1.5 rounded-[6px] border inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                  confirmDelete
                    ? "bg-[#F8DEDB] text-[#A8281F] border-[#F8DEDB]"
                    : "text-[#A8281F] border-transparent hover:bg-[#F8DEDB]/50"
                }`}
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>{confirmDelete ? "Click again to confirm delete" : "Delete vault"}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="border border-[#DCE1E8] bg-white hover:bg-[#F6F7F9] text-[#5A6777] rounded-[6px] px-3.5 py-1.5 font-semibold text-[0.84rem] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="border border-[#9C6B12] bg-[#9C6B12] hover:bg-[#83590E] text-white rounded-[6px] px-4 py-1.5 font-semibold text-[0.84rem] transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : isEdit
                  ? "Save changes"
                  : "Create vault"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
