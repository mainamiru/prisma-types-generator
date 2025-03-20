import { DMMF } from "@prisma/generator-helper";
import { getModel, getType, toKebabCase } from "./method";
import { DOCUMENTATION, isExists } from "./base";
export type Fields = DMMF.Datamodel["models"][number]["fields"];

export const generateCreateAndUpdateInput = (name: string, fields: Fields) => {
  const deps: string[] = [];
  const data: string[] = [];
  const relational: string[] = [];
  const modelName = `${name}CreateInput`;
  const updateModelName = `${name}UpdateInput`;
  const fileName = toKebabCase(`${name}.ts`);
  const { objectModel } = getModel(fields);
  for (const field of fields) {
    const key = field.name;
    const isReadOnly = isExists(field.documentation, DOCUMENTATION.ReadOnly);
    if (field.kind == "object") {
      if (field.isList) {
        const arrayType = getType(`${field.type}CreateInput`, true, true);
        data.push(`${key}?: ${arrayType};`);
      } else {
        const objectType = getType(`${field.type}CreateInput`, false, true);
        data.push(`${key}?: ${objectType};`);
      }
      if (!deps.includes(field.type)) {
        deps.push(field.type);
      }
    } else {
      if (
        isReadOnly ||
        field.isUpdatedAt ||
        !field.isRequired ||
        field.hasDefaultValue ||
        field.isReadOnly
      ) {
        data.push(`${key}?: ${objectModel[key]};`);
      } else {
        data.push(`${key}: ${objectModel[key]};`);
      }
    }
  }
  return { deps, data, fileName, modelName, updateModelName, relational };
};
