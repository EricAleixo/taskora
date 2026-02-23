import { Task } from "@/app/types/Task";
import { LuChevronDown } from "react-icons/lu";
import { StatisticsSection } from "../StatisticsSection/StatisticsSection";
import { SearchAndFilters } from "../SearchAndFilters/SearchAndFilters";
import { motion, AnimatePresence } from "framer-motion";

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
      className="mb-3 flex w-full items-center justify-between rounded-lg bg-background px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-background/95"
    >
      <span>Mais opções</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <LuChevronDown className="h-4 w-4" />
      </motion.div>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <StatisticsSection tasks={tasks} />
          <SearchAndFilters
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={onSearchChange}
            onStatusChange={onStatusChange}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);