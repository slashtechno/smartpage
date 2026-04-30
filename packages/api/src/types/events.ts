export type DbEvent = {
  id: number,
  name: string,
  starts_at: Date,
  ends_at: Date
  location: string //{x: number, y: number}
};

// https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys
export type DbEventInsert = Omit<DbEvent, "id">;
