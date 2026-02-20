export type DbTask = typeof tasks.$inferSelect;

// Tipo da aplicação
export type Task = DbTask & {
  isOptimistic?: boolean;
};
