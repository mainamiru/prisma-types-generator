# Prisma Types Generator

## **Prisma**

> [Prisma](https://www.prisma.io/) is Database ORM Library for Node.js, Typescript.

Prisma basically generate each models type definition defined in [`schema.prisma`](https://www.prisma.io/docs/concepts/components/prisma-schema).

This is Prisma's basic way of doing things, and I love this approach.

So I created a simple tool that generates a typescript file based on `schema.prisma`. The generated types are formatted with prettier, using the user's prettier config file if present.
This will reduce the effort to define types directly while using the same single source of truth (`schema.prisma`)

The Prisma JS Client returns objects that does not contain the model's relational fields. The Generator can create two separate files per model, one that matches the Prisma Js Client's interfaces, and one that contains only the relational fields.

### **Usage**

1.  **Install**

    ```shell
    bun add --dev @mainamiru/prisma-types-generator
    yarn add --dev @mainamiru/prisma-types-generator
    npm install --save-dev @mainamiru/prisma-types-generator

    ```

2.  **Define Generator in `schema.prisma`**

    ```prisma
    generator prismaTypesGenerator {
        provider = "prisma-types-generator"
        modelSuffix = "Model"
        prettier = "false"
    }

    ```

        And finally generate your Prisma schema:

    ```shell
    npx prisma generate
    ```

    By default that will output the Typescript interface definitions to a file called generated in your prisma folder, this can be changed by specifying the output option. As mentioned above, by default the generated types will be type compatible with the Prisma client types. If you instead want to generate types matching the JSON. stringify-ed versions of your models, you will need to change some of the options.

## Options

| **Option**  | **Type**  |  **Default**  | **Description**                                                                                              |
| ----------- | :-------: | :-----------: | ------------------------------------------------------------------------------------------------------------ | --- |
| output      | `string`  | `"generated"` | The output location for the generated Typescript                                                             |
| modelSuffix | `string`  |   `"Model"`   | Suffix to add to model types.                                                                                |     |
| prettier    | `boolean` |    `false`    | Formats the output using Prettier. Setting this to `true` requires that the `prettier` package is available. |

3. **😎 done! Let's check out generated files.**

   if this models were defined in your prisma.schema file.

   ```prisma
   model User {
     id         String   @id @default(cuid())
     name       String   @db.VarChar(30)
     image      String?  @db.VarChar(200)
     gender     Gender   @default(MALE)
     email      String   @unique @db.VarChar(50)
     mobile     String   @unique @db.VarChar(15)
     role       UserRole @default(USER)
     password   String   @db.VarChar(200)
     created_at DateTime @default(now())
     updated_at DateTime @updatedAt
     posts Post[]

    @@map("users")
   }

   model Post {
      id         String   @id @default(cuid())
      title      String   @db.VarChar(100)
      image      String?  @db.VarChar(200)
      content    String   @db.VarChar(1000)
      published  Boolean  @default(true)
      authorId   String   @db.VarChar(100)
      created_at DateTime @default(now())
      updated_at DateTime @updatedAt

      author User? @relation(fields: [authorId], references: [id])
    @@map("posts")
   }

   enum Gender {
     MALE
     FEMALE
   }

   enum UserRole {
     USER
     ADMIN
     AUTHOR
   }

   ```

   then this types is generated in <PROJECT*PATH>/generated. <br>
   ( The generating path can be customized through \_output* option. )

   ```typescript
   // user.ts
   import { Gender, UserRole } from "./enums";
   import { PostModel, PostCreateInput } from "./post";

   export interface UserModel {
     id: string;
     name: string;
     image: string | null;
     gender: Gender;
     email: string;
     mobile: string;
     role: UserRole;
     password: string;
     created_at: Date;
     updated_at: Date;
     posts?: PostModel[];
   }

   export interface UserCreateInput {
     id?: string;
     name: string;
     image?: string | null;
     gender?: Gender;
     email: string;
     mobile: string;
     role?: UserRole;
     password: string;
     created_at?: Date;
     updated_at?: Date;
   }

   export interface UserCreateCompleteInput extends UserCreateInput {
     posts?: PostCreateInput | PostCreateInput[];
   }

   export type UserUpdateInput = Partial<UserCreateInput>;
   ```

   ```typescript
   // post.ts
   import { UserModel, UserCreateInput } from "./user";

   export interface PostModel {
     id: string;
     title: string;
     image: string | null;
     content: string;
     published: boolean;
     authorId: string;
     created_at: Date;
     updated_at: Date;
     author?: UserModel;
   }

   export interface PostCreateInput {
     id?: string;
     title: string;
     image?: string | null;
     content: string;
     published?: boolean;
     authorId: string;
     created_at?: Date;
     updated_at?: Date;
   }

   export interface PostCreateCompleteInput extends PostCreateInput {
     author?: UserCreateInput;
   }

   export type PostUpdateInput = Partial<PostCreateInput>;
   ```

   ```typescript
   // index.ts
   export * from "./user";
   export * from "./post";
   ```

### **How it works?**

Prisma internally defines metadata as a dmmf object.

It is defined as an additional generator in the `schema.prisma` file and will operate in the `prisma generate` process.

### **Feature**

- generate types/interfaces from prisma model definition
- Support Basic Type and Relation

### **FAQ**

**1. It's works with all javascript/typescript libary**

You can use for all API payload response in React, React Native, Nextjs etc...
