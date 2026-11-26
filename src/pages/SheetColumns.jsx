import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ColumnRow from "../components/columns/ColumnRow";
import ErrorFallback from "../components/common/ErrorFallback";
import { SheetColumnsSkeleton } from "../components/common/LoadingSkeletons";
import { fetchSettings, saveSheetColumns } from "../apis/thunks/settingsThunks";

export default function SheetColumns() {
  const dispatch = useDispatch();
  const {
    columns: savedColumns,
    loading,
    loaded,
    savingColumns,
    error,
  } = useSelector((state) => state.settings);

  const [columns, setColumns] = useState([]);

  // Fetch live columns from GET /api/settings/
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Sync Redux savedColumns into editable form state
  useEffect(() => {
    if (Array.isArray(savedColumns) && savedColumns.length > 0) {
      setColumns(savedColumns.map((col) => ({ ...col })));
    }
  }, [savedColumns]);

  const hasUnsavedChanges = useMemo(() => {
    if (!loaded || !Array.isArray(savedColumns)) return false;
    return JSON.stringify(columns) !== JSON.stringify(savedColumns);
  }, [columns, savedColumns, loaded]);

  const handleLabelChange = (index, newLabel) => {
    setColumns((prev) =>
      prev.map((col, i) => (i === index ? { ...col, label: newLabel } : col))
    );
  };

  const handleToggleRequired = (index, checked) => {
    setColumns((prev) =>
      prev.map((col, i) => {
        if (i === index) {
          return {
            ...col,
            required: checked,
            enabled: checked ? true : col.enabled,
          };
        }
        return col;
      })
    );
  };

  const handleToggleEnabled = (index, checked) => {
    setColumns((prev) =>
      prev.map((col, i) => (i === index ? { ...col, enabled: checked } : col))
    );
  };

  const handleMove = (index, direction) => {
    setColumns((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const handleSaveColumns = async () => {
    try {
      await dispatch(saveSheetColumns(columns)).unwrap();
      toast.success("Columns saved");
      dispatch(fetchSettings());
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to save sheet columns"
      );
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <span className="text-[0.72rem] font-semibold text-[#5A6777] uppercase tracking-[0.08em] mb-1 block">
            ADMIN
          </span>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            Sheet columns
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[65ch] text-[0.875rem] leading-normal m-0">
            The columns in your Excel file and Google Sheet, in this order. A job missing a required field goes to review.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2.5 shrink-0 ml-auto">
          {hasUnsavedChanges && (
            <span className="text-[0.72rem] font-semibold bg-[#FBEBCF] text-[#9A5B00] px-2.5 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            disabled={savingColumns || (loading && !loaded) || columns.length === 0}
            onClick={handleSaveColumns}
            className="border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold transition-all cursor-pointer shadow-sm select-none disabled:opacity-50"
          >
            {savingColumns ? "Saving..." : "Save columns"}
          </button>
        </div>
      </div>

      {/* Graceful Error Banner when cached columns exist */}
      {error && loaded && (
        <ErrorFallback
          compact
          title="Could not sync sheet columns"
          message={error}
          onRetry={() => dispatch(fetchSettings())}
          retrying={loading}
        />
      )}

      {/* Main Content */}
      {loading && !loaded ? (
        <SheetColumnsSkeleton rows={10} />
      ) : error && !loaded ? (
        <ErrorFallback
          title="Could not load sheet columns"
          message={error}
          onRetry={() => dispatch(fetchSettings())}
          retrying={loading}
        />
      ) : (
        <div className="bg-white border border-[#DCE1E8] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
          {/* Table Column Headers */}
          <div className="grid grid-cols-[30px_minmax(0,1fr)_70px] sm:grid-cols-[30px_minmax(0,1fr)_110px_100px_70px] gap-2.5 items-center pb-2 text-[0.7rem] uppercase tracking-[0.08em] text-[#5A6777] font-semibold border-b border-[#DCE1E8] select-none">
            <span></span>
            <span>Column name</span>
            <span className="hidden sm:inline">Required</span>
            <span className="hidden sm:inline">Order</span>
            <span>Include</span>
          </div>

          {/* Column Rows */}
          <div className="flex flex-col">
            {columns.map((column, index) => {
              const letter = column.enabled
                ? String.fromCharCode(
                    65 + columns.slice(0, index).filter((x) => x.enabled).length
                  )
                : "–";

              return (
                <ColumnRow
                  key={column.key}
                  column={column}
                  index={index}
                  letter={letter}
                  isFirst={index === 0}
                  isLast={index === columns.length - 1}
                  isLastRow={index === columns.length - 1}
                  onLabelChange={handleLabelChange}
                  onToggleRequired={handleToggleRequired}
                  onToggleEnabled={handleToggleEnabled}
                  onMove={handleMove}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
