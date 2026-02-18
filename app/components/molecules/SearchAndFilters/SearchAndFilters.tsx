import { Input } from "@/components/ui/input";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import { LuFilter, LuSearch } from "react-icons/lu";

export const SearchAndFilters = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) => (
  <div>
    <div className="relative flex-1 my-3">
      <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder="Buscar tarefas..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>

    <Select value={statusFilter} onValueChange={onStatusChange}>
      <SelectTrigger className="w-full sm:w-50">
        <LuFilter className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Filtrar por status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os status</SelectItem>
        <SelectItem value="pending">Pendente</SelectItem>
        <SelectItem value="in_progress">Em Progresso</SelectItem>
        <SelectItem value="completed">Concluída</SelectItem>
        <SelectItem value="cancelled">Cancelada</SelectItem>
      </SelectContent>
    </Select>
  </div>
);