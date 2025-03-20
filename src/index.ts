#!/usr/bin/env node
import * as fs from "fs";
import { generatorHandler } from "@prisma/generator-helper";
import { generateCreateAndUpdateInput, getModel, toKebabCase } from "./utils";

generatorHandler({
  async onGenerate(options) {
    const { generator } = options;
    const { modelSuffix = "Model" } = generator.config;

    const outDir = generator.output.value;
    const indexFile = `${outDir}/index.ts`;
    const enumDir = `${outDir}/enums`;
    const { models, enums } = options.dmmf.datamodel;

    //fs module
    fs.mkdirSync(outDir, { recursive: true }); //create directory
    fs.mkdirSync(enumDir, { recursive: true }); //create directory
    fs.writeFileSync(`${enumDir}/index.ts`, "");

    for (const model of models) {
      const fileName = toKebabCase(`${model.name}.ts`);
      const modelName = `${model.name}${modelSuffix.toString().trim()}`;
      const full_path = `${outDir}/${fileName}`;
      const create = generateCreateAndUpdateInput(model.name, model.fields);

      const { stringModel, enums } = getModel(
        model.fields,
        false,
        modelSuffix.toString()
      );
      fs.writeFileSync(
        full_path,
        `${
          enums.length
            ? `import { ${enums.map((enm) => enm).join(", ")} } from "./enums";`
            : ""
        }
${create.deps
  .map((dep) => {
    const _file = toKebabCase(dep);
    return `import { ${dep}${modelSuffix}, ${dep}CreateInput } from "./${_file}";`;
  })
  .join("\n")}

export interface ${modelName} {
  ${stringModel.join("\n  ")}
}

export interface ${create.modelName} {
  ${create.data.join("\n  ")}
}

export type ${create.updateModelName} = Partial<${create.modelName}>;

`.trimStart()
      );
    }

    for (const enum_data of enums) {
      const enum_string: string[] = [];
      enum_data.values.forEach(({ name }) => {
        enum_string.push(`${name}: '${name}'`);
      });
      const enum_name = enum_data.name;
      fs.appendFileSync(
        `${enumDir}/index.ts`,
        `
export const ${enum_name} = {
  ${enum_string.join(",\n  ")}
} as const;
export type ${enum_name} = keyof typeof ${enum_name};

`.trimStart()
      );
    }
    const indexImports = models.map((model) => {
      const fileName = toKebabCase(model.name);
      return `export * from "./${fileName}";`;
    });
    if (enums.length) {
      indexImports.push(`export * from "./enums";`);
    }
    fs.writeFileSync(indexFile, indexImports.join("\n").trim());
  },
  onManifest: () => {
    return { defaultOutput: "../generated" };
  },
});
