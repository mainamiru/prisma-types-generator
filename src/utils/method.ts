import { DMMF } from "@prisma/generator-helper";
import { DOCUMENTATION, isExists } from "./base";

type Fields = DMMF.Datamodel["models"][number]["fields"];

export function toKebabCase(fileName: string) {
  return fileName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function toCamelCase(fileName: string) {
  return fileName
    .replace(/-./g, (match) => match.charAt(1).toUpperCase())
    .replace(/\s+(.)/g, (match, p1) => p1.toUpperCase());
}

//get type
export const getType = (type: string, isList: boolean, isRequired = true) => {
  if (isRequired && isList) {
    return `${type}[]`;
  } else if (isList) {
    return `${type}[] | null`;
  } else if (isRequired) {
    return type;
  } else return `${type} | null`;
};

//get datatype
export const getDataType = (field: Fields[number], suffix = "Model") => {
  if (field.kind === "object") {
    return getType(`${field.type}${suffix}`, field.isList);
  } else if (field.kind === "enum") {
    return getType(
      field.type,
      field.isList,
      field.isRequired || field.hasDefaultValue
    );
  } else {
    //Int, BigInt,Decimal, Float, Boolean, Json, String, DateTime
    if (field.type === "Json") {
      return getType(
        "any",
        field.isList,
        field.isRequired || field.hasDefaultValue
      );
    } else if (field.type === "DateTime") {
      return getType(
        "string",
        field.isList,
        field.isRequired || field.hasDefaultValue
      );
    } else if (field.type === "String") {
      return getType(
        "string",
        field.isList,
        field.isRequired || field.hasDefaultValue
      );
    } else if (field.type === "Boolean") {
      return getType(
        "boolean",
        field.isList,
        field.isRequired || field.hasDefaultValue
      );
    } else if (field.type === "Bytes") {
      return getType(
        "Buffer",
        field.isList,
        field.isRequired || field.hasDefaultValue
      );
    } else {
      return getType(
        "number",
        field.isList,
        field.isRequired || field.hasDefaultValue
      );
    }
  }
};

export const getModel = (
  fields: Fields,
  skipHidden = true,
  suffix = "Model"
) => {
  const enums: string[] = [];
  const dependencies: string[] = [];
  const string_model: string[] = [];
  const model: Record<string, string> = {};
  for (const field of fields) {
    const isHidden = isExists(field.documentation, DOCUMENTATION.Hidden);
    if (skipHidden || !isHidden) {
      const type = getDataType(field, suffix);
      model[field.name] = type;
      if (field.kind === "object") {
        string_model.push(`${field.name}?: ${type};`);
        dependencies.push(`${field.type}`);
      } else {
        string_model.push(`${field.name}: ${type};`);
      }
    }
    if (field.kind == "enum") {
      enums.push(field.type);
    }
  }
  return { objectModel: model, stringModel: string_model, enums, dependencies };
};
