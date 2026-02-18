import { Task } from "@/app/types/Task";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { StatisticsSection } from "../StatisticsSection/StatisticsSection";
import { SearchAndFilters } from "../SearchAndFilters/SearchAndFilters";

export const CollapsibleStatistics = ({
  isOpen,
  onToggle,
  tasks,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: {
  isOpen: boolean;
  onToggle: () => void;
  tasks: Task[];
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) => (
  <div className="mb-4">
    <button
      onClick={onToggle}
      className="mb-3 flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
    >
      <span>Mais opções</span>
      {isOpen ? (
        <LuChevronUp className="h-4 w-4" />
      ) : (
        <LuChevronDown className="h-4 w-4" />
      )}
    </button>

    {isOpen && (
      <div>
        <StatisticsSection tasks={tasks} />
        <SearchAndFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
        />
      </div>
    )}
  </div>
);
