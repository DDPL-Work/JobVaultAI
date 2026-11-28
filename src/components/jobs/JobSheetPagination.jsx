import PaginationControls from "../common/PaginationControls";
import { PAGE_SIZE_OPTIONS } from "../../utils/pagination";

export default function JobSheetPagination({
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  itemLabel = "jobs",
  ...props
}) {
  return (
    <PaginationControls
      pageSizeOptions={pageSizeOptions}
      itemLabel={itemLabel}
      {...props}
    />
  );
}
