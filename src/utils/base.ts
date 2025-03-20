export enum DOCUMENTATION {
  Hidden = "@Hidden",
  ReadOnly = "@ReadOnly",
}

export const isExists = (documentation?: string | null, field?: string) => {
  if (documentation) {
    const documentations = documentation.split("\n");
    return documentations.includes(field);
  } else return false;
};
