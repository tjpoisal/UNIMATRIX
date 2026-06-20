
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Space
 * 
 */
export type Space = $Result.DefaultSelection<Prisma.$SpacePayload>
/**
 * Model Memory
 * 
 */
export type Memory = $Result.DefaultSelection<Prisma.$MemoryPayload>
/**
 * Model MemoryTag
 * 
 */
export type MemoryTag = $Result.DefaultSelection<Prisma.$MemoryTagPayload>
/**
 * Model McpToken
 * 
 */
export type McpToken = $Result.DefaultSelection<Prisma.$McpTokenPayload>
/**
 * Model AgentRun
 * 
 */
export type AgentRun = $Result.DefaultSelection<Prisma.$AgentRunPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const MemoryStatus: {
  active: 'active',
  superseded: 'superseded',
  archived: 'archived'
};

export type MemoryStatus = (typeof MemoryStatus)[keyof typeof MemoryStatus]


export const MemorySource: {
  mcp: 'mcp',
  api: 'api',
  import: 'import',
  librarian: 'librarian'
};

export type MemorySource = (typeof MemorySource)[keyof typeof MemorySource]


export const AgentRunStatus: {
  pending: 'pending',
  running: 'running',
  completed: 'completed',
  failed: 'failed'
};

export type AgentRunStatus = (typeof AgentRunStatus)[keyof typeof AgentRunStatus]


export const TokenScope: {
  full: 'full',
  readonly: 'readonly',
  memory_only: 'memory_only'
};

export type TokenScope = (typeof TokenScope)[keyof typeof TokenScope]

}

export type MemoryStatus = $Enums.MemoryStatus

export const MemoryStatus: typeof $Enums.MemoryStatus

export type MemorySource = $Enums.MemorySource

export const MemorySource: typeof $Enums.MemorySource

export type AgentRunStatus = $Enums.AgentRunStatus

export const AgentRunStatus: typeof $Enums.AgentRunStatus

export type TokenScope = $Enums.TokenScope

export const TokenScope: typeof $Enums.TokenScope

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.space`: Exposes CRUD operations for the **Space** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Spaces
    * const spaces = await prisma.space.findMany()
    * ```
    */
  get space(): Prisma.SpaceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memory`: Exposes CRUD operations for the **Memory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Memories
    * const memories = await prisma.memory.findMany()
    * ```
    */
  get memory(): Prisma.MemoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memoryTag`: Exposes CRUD operations for the **MemoryTag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemoryTags
    * const memoryTags = await prisma.memoryTag.findMany()
    * ```
    */
  get memoryTag(): Prisma.MemoryTagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.mcpToken`: Exposes CRUD operations for the **McpToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more McpTokens
    * const mcpTokens = await prisma.mcpToken.findMany()
    * ```
    */
  get mcpToken(): Prisma.McpTokenDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agentRun`: Exposes CRUD operations for the **AgentRun** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AgentRuns
    * const agentRuns = await prisma.agentRun.findMany()
    * ```
    */
  get agentRun(): Prisma.AgentRunDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Space: 'Space',
    Memory: 'Memory',
    MemoryTag: 'MemoryTag',
    McpToken: 'McpToken',
    AgentRun: 'AgentRun',
    AuditLog: 'AuditLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "space" | "memory" | "memoryTag" | "mcpToken" | "agentRun" | "auditLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Space: {
        payload: Prisma.$SpacePayload<ExtArgs>
        fields: Prisma.SpaceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SpaceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SpaceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload>
          }
          findFirst: {
            args: Prisma.SpaceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SpaceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload>
          }
          findMany: {
            args: Prisma.SpaceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload>[]
          }
          create: {
            args: Prisma.SpaceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload>
          }
          createMany: {
            args: Prisma.SpaceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SpaceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload>[]
          }
          delete: {
            args: Prisma.SpaceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload>
          }
          update: {
            args: Prisma.SpaceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload>
          }
          deleteMany: {
            args: Prisma.SpaceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SpaceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SpaceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload>[]
          }
          upsert: {
            args: Prisma.SpaceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SpacePayload>
          }
          aggregate: {
            args: Prisma.SpaceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSpace>
          }
          groupBy: {
            args: Prisma.SpaceGroupByArgs<ExtArgs>
            result: $Utils.Optional<SpaceGroupByOutputType>[]
          }
          count: {
            args: Prisma.SpaceCountArgs<ExtArgs>
            result: $Utils.Optional<SpaceCountAggregateOutputType> | number
          }
        }
      }
      Memory: {
        payload: Prisma.$MemoryPayload<ExtArgs>
        fields: Prisma.MemoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          findFirst: {
            args: Prisma.MemoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          findMany: {
            args: Prisma.MemoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>[]
          }
          create: {
            args: Prisma.MemoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          createMany: {
            args: Prisma.MemoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>[]
          }
          delete: {
            args: Prisma.MemoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          update: {
            args: Prisma.MemoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          deleteMany: {
            args: Prisma.MemoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>[]
          }
          upsert: {
            args: Prisma.MemoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          aggregate: {
            args: Prisma.MemoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemory>
          }
          groupBy: {
            args: Prisma.MemoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryCountAggregateOutputType> | number
          }
        }
      }
      MemoryTag: {
        payload: Prisma.$MemoryTagPayload<ExtArgs>
        fields: Prisma.MemoryTagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryTagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryTagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload>
          }
          findFirst: {
            args: Prisma.MemoryTagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryTagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload>
          }
          findMany: {
            args: Prisma.MemoryTagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload>[]
          }
          create: {
            args: Prisma.MemoryTagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload>
          }
          createMany: {
            args: Prisma.MemoryTagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryTagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload>[]
          }
          delete: {
            args: Prisma.MemoryTagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload>
          }
          update: {
            args: Prisma.MemoryTagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload>
          }
          deleteMany: {
            args: Prisma.MemoryTagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryTagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemoryTagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload>[]
          }
          upsert: {
            args: Prisma.MemoryTagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTagPayload>
          }
          aggregate: {
            args: Prisma.MemoryTagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemoryTag>
          }
          groupBy: {
            args: Prisma.MemoryTagGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryTagGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryTagCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryTagCountAggregateOutputType> | number
          }
        }
      }
      McpToken: {
        payload: Prisma.$McpTokenPayload<ExtArgs>
        fields: Prisma.McpTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.McpTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.McpTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload>
          }
          findFirst: {
            args: Prisma.McpTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.McpTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload>
          }
          findMany: {
            args: Prisma.McpTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload>[]
          }
          create: {
            args: Prisma.McpTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload>
          }
          createMany: {
            args: Prisma.McpTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.McpTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload>[]
          }
          delete: {
            args: Prisma.McpTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload>
          }
          update: {
            args: Prisma.McpTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload>
          }
          deleteMany: {
            args: Prisma.McpTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.McpTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.McpTokenUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload>[]
          }
          upsert: {
            args: Prisma.McpTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$McpTokenPayload>
          }
          aggregate: {
            args: Prisma.McpTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMcpToken>
          }
          groupBy: {
            args: Prisma.McpTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<McpTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.McpTokenCountArgs<ExtArgs>
            result: $Utils.Optional<McpTokenCountAggregateOutputType> | number
          }
        }
      }
      AgentRun: {
        payload: Prisma.$AgentRunPayload<ExtArgs>
        fields: Prisma.AgentRunFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentRunFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentRunFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          findFirst: {
            args: Prisma.AgentRunFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentRunFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          findMany: {
            args: Prisma.AgentRunFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>[]
          }
          create: {
            args: Prisma.AgentRunCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          createMany: {
            args: Prisma.AgentRunCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgentRunCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>[]
          }
          delete: {
            args: Prisma.AgentRunDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          update: {
            args: Prisma.AgentRunUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          deleteMany: {
            args: Prisma.AgentRunDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentRunUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AgentRunUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>[]
          }
          upsert: {
            args: Prisma.AgentRunUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          aggregate: {
            args: Prisma.AgentRunAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgentRun>
          }
          groupBy: {
            args: Prisma.AgentRunGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentRunGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgentRunCountArgs<ExtArgs>
            result: $Utils.Optional<AgentRunCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuditLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    space?: SpaceOmit
    memory?: MemoryOmit
    memoryTag?: MemoryTagOmit
    mcpToken?: McpTokenOmit
    agentRun?: AgentRunOmit
    auditLog?: AuditLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    spaces: number
    memories: number
    mcpTokens: number
    agentRuns: number
    auditLogs: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spaces?: boolean | UserCountOutputTypeCountSpacesArgs
    memories?: boolean | UserCountOutputTypeCountMemoriesArgs
    mcpTokens?: boolean | UserCountOutputTypeCountMcpTokensArgs
    agentRuns?: boolean | UserCountOutputTypeCountAgentRunsArgs
    auditLogs?: boolean | UserCountOutputTypeCountAuditLogsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSpacesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SpaceWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMemoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMcpTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: McpTokenWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAgentRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentRunWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAuditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
  }


  /**
   * Count Type SpaceCountOutputType
   */

  export type SpaceCountOutputType = {
    children: number
    memories: number
  }

  export type SpaceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | SpaceCountOutputTypeCountChildrenArgs
    memories?: boolean | SpaceCountOutputTypeCountMemoriesArgs
  }

  // Custom InputTypes
  /**
   * SpaceCountOutputType without action
   */
  export type SpaceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SpaceCountOutputType
     */
    select?: SpaceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SpaceCountOutputType without action
   */
  export type SpaceCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SpaceWhereInput
  }

  /**
   * SpaceCountOutputType without action
   */
  export type SpaceCountOutputTypeCountMemoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryWhereInput
  }


  /**
   * Count Type MemoryCountOutputType
   */

  export type MemoryCountOutputType = {
    tags: number
  }

  export type MemoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | MemoryCountOutputTypeCountTagsArgs
  }

  // Custom InputTypes
  /**
   * MemoryCountOutputType without action
   */
  export type MemoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryCountOutputType
     */
    select?: MemoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MemoryCountOutputType without action
   */
  export type MemoryCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryTagWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    clerk_id: string | null
    email: string | null
    name: string | null
    image: string | null
    tier: string | null
    stripeCustomerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    clerk_id: string | null
    email: string | null
    name: string | null
    image: string | null
    tier: string | null
    stripeCustomerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    clerk_id: number
    email: number
    name: number
    image: number
    tier: number
    stripeCustomerId: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    clerk_id?: true
    email?: true
    name?: true
    image?: true
    tier?: true
    stripeCustomerId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    clerk_id?: true
    email?: true
    name?: true
    image?: true
    tier?: true
    stripeCustomerId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    clerk_id?: true
    email?: true
    name?: true
    image?: true
    tier?: true
    stripeCustomerId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    clerk_id: string
    email: string
    name: string | null
    image: string | null
    tier: string
    stripeCustomerId: string | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerk_id?: boolean
    email?: boolean
    name?: boolean
    image?: boolean
    tier?: boolean
    stripeCustomerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    spaces?: boolean | User$spacesArgs<ExtArgs>
    memories?: boolean | User$memoriesArgs<ExtArgs>
    mcpTokens?: boolean | User$mcpTokensArgs<ExtArgs>
    agentRuns?: boolean | User$agentRunsArgs<ExtArgs>
    auditLogs?: boolean | User$auditLogsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerk_id?: boolean
    email?: boolean
    name?: boolean
    image?: boolean
    tier?: boolean
    stripeCustomerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerk_id?: boolean
    email?: boolean
    name?: boolean
    image?: boolean
    tier?: boolean
    stripeCustomerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    clerk_id?: boolean
    email?: boolean
    name?: boolean
    image?: boolean
    tier?: boolean
    stripeCustomerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "clerk_id" | "email" | "name" | "image" | "tier" | "stripeCustomerId" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spaces?: boolean | User$spacesArgs<ExtArgs>
    memories?: boolean | User$memoriesArgs<ExtArgs>
    mcpTokens?: boolean | User$mcpTokensArgs<ExtArgs>
    agentRuns?: boolean | User$agentRunsArgs<ExtArgs>
    auditLogs?: boolean | User$auditLogsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      spaces: Prisma.$SpacePayload<ExtArgs>[]
      memories: Prisma.$MemoryPayload<ExtArgs>[]
      mcpTokens: Prisma.$McpTokenPayload<ExtArgs>[]
      agentRuns: Prisma.$AgentRunPayload<ExtArgs>[]
      auditLogs: Prisma.$AuditLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clerk_id: string
      email: string
      name: string | null
      image: string | null
      tier: string
      stripeCustomerId: string | null
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    spaces<T extends User$spacesArgs<ExtArgs> = {}>(args?: Subset<T, User$spacesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    memories<T extends User$memoriesArgs<ExtArgs> = {}>(args?: Subset<T, User$memoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    mcpTokens<T extends User$mcpTokensArgs<ExtArgs> = {}>(args?: Subset<T, User$mcpTokensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    agentRuns<T extends User$agentRunsArgs<ExtArgs> = {}>(args?: Subset<T, User$agentRunsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    auditLogs<T extends User$auditLogsArgs<ExtArgs> = {}>(args?: Subset<T, User$auditLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly clerk_id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly image: FieldRef<"User", 'String'>
    readonly tier: FieldRef<"User", 'String'>
    readonly stripeCustomerId: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly deletedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.spaces
   */
  export type User$spacesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    where?: SpaceWhereInput
    orderBy?: SpaceOrderByWithRelationInput | SpaceOrderByWithRelationInput[]
    cursor?: SpaceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SpaceScalarFieldEnum | SpaceScalarFieldEnum[]
  }

  /**
   * User.memories
   */
  export type User$memoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    where?: MemoryWhereInput
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    cursor?: MemoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryScalarFieldEnum | MemoryScalarFieldEnum[]
  }

  /**
   * User.mcpTokens
   */
  export type User$mcpTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
    where?: McpTokenWhereInput
    orderBy?: McpTokenOrderByWithRelationInput | McpTokenOrderByWithRelationInput[]
    cursor?: McpTokenWhereUniqueInput
    take?: number
    skip?: number
    distinct?: McpTokenScalarFieldEnum | McpTokenScalarFieldEnum[]
  }

  /**
   * User.agentRuns
   */
  export type User$agentRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    where?: AgentRunWhereInput
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    cursor?: AgentRunWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * User.auditLogs
   */
  export type User$auditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    cursor?: AuditLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Space
   */

  export type AggregateSpace = {
    _count: SpaceCountAggregateOutputType | null
    _min: SpaceMinAggregateOutputType | null
    _max: SpaceMaxAggregateOutputType | null
  }

  export type SpaceMinAggregateOutputType = {
    id: string | null
    userId: string | null
    parentId: string | null
    orgId: string | null
    name: string | null
    description: string | null
    isScratchpad: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type SpaceMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    parentId: string | null
    orgId: string | null
    name: string | null
    description: string | null
    isScratchpad: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type SpaceCountAggregateOutputType = {
    id: number
    userId: number
    parentId: number
    orgId: number
    name: number
    description: number
    isScratchpad: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type SpaceMinAggregateInputType = {
    id?: true
    userId?: true
    parentId?: true
    orgId?: true
    name?: true
    description?: true
    isScratchpad?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type SpaceMaxAggregateInputType = {
    id?: true
    userId?: true
    parentId?: true
    orgId?: true
    name?: true
    description?: true
    isScratchpad?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type SpaceCountAggregateInputType = {
    id?: true
    userId?: true
    parentId?: true
    orgId?: true
    name?: true
    description?: true
    isScratchpad?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type SpaceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Space to aggregate.
     */
    where?: SpaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Spaces to fetch.
     */
    orderBy?: SpaceOrderByWithRelationInput | SpaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SpaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Spaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Spaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Spaces
    **/
    _count?: true | SpaceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SpaceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SpaceMaxAggregateInputType
  }

  export type GetSpaceAggregateType<T extends SpaceAggregateArgs> = {
        [P in keyof T & keyof AggregateSpace]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSpace[P]>
      : GetScalarType<T[P], AggregateSpace[P]>
  }




  export type SpaceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SpaceWhereInput
    orderBy?: SpaceOrderByWithAggregationInput | SpaceOrderByWithAggregationInput[]
    by: SpaceScalarFieldEnum[] | SpaceScalarFieldEnum
    having?: SpaceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SpaceCountAggregateInputType | true
    _min?: SpaceMinAggregateInputType
    _max?: SpaceMaxAggregateInputType
  }

  export type SpaceGroupByOutputType = {
    id: string
    userId: string
    parentId: string | null
    orgId: string | null
    name: string
    description: string | null
    isScratchpad: boolean
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: SpaceCountAggregateOutputType | null
    _min: SpaceMinAggregateOutputType | null
    _max: SpaceMaxAggregateOutputType | null
  }

  type GetSpaceGroupByPayload<T extends SpaceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SpaceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SpaceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SpaceGroupByOutputType[P]>
            : GetScalarType<T[P], SpaceGroupByOutputType[P]>
        }
      >
    >


  export type SpaceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    parentId?: boolean
    orgId?: boolean
    name?: boolean
    description?: boolean
    isScratchpad?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    parent?: boolean | Space$parentArgs<ExtArgs>
    children?: boolean | Space$childrenArgs<ExtArgs>
    memories?: boolean | Space$memoriesArgs<ExtArgs>
    _count?: boolean | SpaceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["space"]>

  export type SpaceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    parentId?: boolean
    orgId?: boolean
    name?: boolean
    description?: boolean
    isScratchpad?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    parent?: boolean | Space$parentArgs<ExtArgs>
  }, ExtArgs["result"]["space"]>

  export type SpaceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    parentId?: boolean
    orgId?: boolean
    name?: boolean
    description?: boolean
    isScratchpad?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    parent?: boolean | Space$parentArgs<ExtArgs>
  }, ExtArgs["result"]["space"]>

  export type SpaceSelectScalar = {
    id?: boolean
    userId?: boolean
    parentId?: boolean
    orgId?: boolean
    name?: boolean
    description?: boolean
    isScratchpad?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type SpaceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "parentId" | "orgId" | "name" | "description" | "isScratchpad" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["space"]>
  export type SpaceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    parent?: boolean | Space$parentArgs<ExtArgs>
    children?: boolean | Space$childrenArgs<ExtArgs>
    memories?: boolean | Space$memoriesArgs<ExtArgs>
    _count?: boolean | SpaceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SpaceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    parent?: boolean | Space$parentArgs<ExtArgs>
  }
  export type SpaceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    parent?: boolean | Space$parentArgs<ExtArgs>
  }

  export type $SpacePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Space"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      parent: Prisma.$SpacePayload<ExtArgs> | null
      children: Prisma.$SpacePayload<ExtArgs>[]
      memories: Prisma.$MemoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      parentId: string | null
      orgId: string | null
      name: string
      description: string | null
      isScratchpad: boolean
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["space"]>
    composites: {}
  }

  type SpaceGetPayload<S extends boolean | null | undefined | SpaceDefaultArgs> = $Result.GetResult<Prisma.$SpacePayload, S>

  type SpaceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SpaceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SpaceCountAggregateInputType | true
    }

  export interface SpaceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Space'], meta: { name: 'Space' } }
    /**
     * Find zero or one Space that matches the filter.
     * @param {SpaceFindUniqueArgs} args - Arguments to find a Space
     * @example
     * // Get one Space
     * const space = await prisma.space.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SpaceFindUniqueArgs>(args: SelectSubset<T, SpaceFindUniqueArgs<ExtArgs>>): Prisma__SpaceClient<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Space that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SpaceFindUniqueOrThrowArgs} args - Arguments to find a Space
     * @example
     * // Get one Space
     * const space = await prisma.space.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SpaceFindUniqueOrThrowArgs>(args: SelectSubset<T, SpaceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SpaceClient<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Space that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpaceFindFirstArgs} args - Arguments to find a Space
     * @example
     * // Get one Space
     * const space = await prisma.space.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SpaceFindFirstArgs>(args?: SelectSubset<T, SpaceFindFirstArgs<ExtArgs>>): Prisma__SpaceClient<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Space that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpaceFindFirstOrThrowArgs} args - Arguments to find a Space
     * @example
     * // Get one Space
     * const space = await prisma.space.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SpaceFindFirstOrThrowArgs>(args?: SelectSubset<T, SpaceFindFirstOrThrowArgs<ExtArgs>>): Prisma__SpaceClient<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Spaces that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpaceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Spaces
     * const spaces = await prisma.space.findMany()
     * 
     * // Get first 10 Spaces
     * const spaces = await prisma.space.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const spaceWithIdOnly = await prisma.space.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SpaceFindManyArgs>(args?: SelectSubset<T, SpaceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Space.
     * @param {SpaceCreateArgs} args - Arguments to create a Space.
     * @example
     * // Create one Space
     * const Space = await prisma.space.create({
     *   data: {
     *     // ... data to create a Space
     *   }
     * })
     * 
     */
    create<T extends SpaceCreateArgs>(args: SelectSubset<T, SpaceCreateArgs<ExtArgs>>): Prisma__SpaceClient<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Spaces.
     * @param {SpaceCreateManyArgs} args - Arguments to create many Spaces.
     * @example
     * // Create many Spaces
     * const space = await prisma.space.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SpaceCreateManyArgs>(args?: SelectSubset<T, SpaceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Spaces and returns the data saved in the database.
     * @param {SpaceCreateManyAndReturnArgs} args - Arguments to create many Spaces.
     * @example
     * // Create many Spaces
     * const space = await prisma.space.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Spaces and only return the `id`
     * const spaceWithIdOnly = await prisma.space.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SpaceCreateManyAndReturnArgs>(args?: SelectSubset<T, SpaceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Space.
     * @param {SpaceDeleteArgs} args - Arguments to delete one Space.
     * @example
     * // Delete one Space
     * const Space = await prisma.space.delete({
     *   where: {
     *     // ... filter to delete one Space
     *   }
     * })
     * 
     */
    delete<T extends SpaceDeleteArgs>(args: SelectSubset<T, SpaceDeleteArgs<ExtArgs>>): Prisma__SpaceClient<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Space.
     * @param {SpaceUpdateArgs} args - Arguments to update one Space.
     * @example
     * // Update one Space
     * const space = await prisma.space.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SpaceUpdateArgs>(args: SelectSubset<T, SpaceUpdateArgs<ExtArgs>>): Prisma__SpaceClient<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Spaces.
     * @param {SpaceDeleteManyArgs} args - Arguments to filter Spaces to delete.
     * @example
     * // Delete a few Spaces
     * const { count } = await prisma.space.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SpaceDeleteManyArgs>(args?: SelectSubset<T, SpaceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Spaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpaceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Spaces
     * const space = await prisma.space.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SpaceUpdateManyArgs>(args: SelectSubset<T, SpaceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Spaces and returns the data updated in the database.
     * @param {SpaceUpdateManyAndReturnArgs} args - Arguments to update many Spaces.
     * @example
     * // Update many Spaces
     * const space = await prisma.space.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Spaces and only return the `id`
     * const spaceWithIdOnly = await prisma.space.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SpaceUpdateManyAndReturnArgs>(args: SelectSubset<T, SpaceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Space.
     * @param {SpaceUpsertArgs} args - Arguments to update or create a Space.
     * @example
     * // Update or create a Space
     * const space = await prisma.space.upsert({
     *   create: {
     *     // ... data to create a Space
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Space we want to update
     *   }
     * })
     */
    upsert<T extends SpaceUpsertArgs>(args: SelectSubset<T, SpaceUpsertArgs<ExtArgs>>): Prisma__SpaceClient<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Spaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpaceCountArgs} args - Arguments to filter Spaces to count.
     * @example
     * // Count the number of Spaces
     * const count = await prisma.space.count({
     *   where: {
     *     // ... the filter for the Spaces we want to count
     *   }
     * })
    **/
    count<T extends SpaceCountArgs>(
      args?: Subset<T, SpaceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SpaceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Space.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpaceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SpaceAggregateArgs>(args: Subset<T, SpaceAggregateArgs>): Prisma.PrismaPromise<GetSpaceAggregateType<T>>

    /**
     * Group by Space.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpaceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SpaceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SpaceGroupByArgs['orderBy'] }
        : { orderBy?: SpaceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SpaceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSpaceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Space model
   */
  readonly fields: SpaceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Space.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SpaceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    parent<T extends Space$parentArgs<ExtArgs> = {}>(args?: Subset<T, Space$parentArgs<ExtArgs>>): Prisma__SpaceClient<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    children<T extends Space$childrenArgs<ExtArgs> = {}>(args?: Subset<T, Space$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    memories<T extends Space$memoriesArgs<ExtArgs> = {}>(args?: Subset<T, Space$memoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Space model
   */
  interface SpaceFieldRefs {
    readonly id: FieldRef<"Space", 'String'>
    readonly userId: FieldRef<"Space", 'String'>
    readonly parentId: FieldRef<"Space", 'String'>
    readonly orgId: FieldRef<"Space", 'String'>
    readonly name: FieldRef<"Space", 'String'>
    readonly description: FieldRef<"Space", 'String'>
    readonly isScratchpad: FieldRef<"Space", 'Boolean'>
    readonly createdAt: FieldRef<"Space", 'DateTime'>
    readonly updatedAt: FieldRef<"Space", 'DateTime'>
    readonly deletedAt: FieldRef<"Space", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Space findUnique
   */
  export type SpaceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    /**
     * Filter, which Space to fetch.
     */
    where: SpaceWhereUniqueInput
  }

  /**
   * Space findUniqueOrThrow
   */
  export type SpaceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    /**
     * Filter, which Space to fetch.
     */
    where: SpaceWhereUniqueInput
  }

  /**
   * Space findFirst
   */
  export type SpaceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    /**
     * Filter, which Space to fetch.
     */
    where?: SpaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Spaces to fetch.
     */
    orderBy?: SpaceOrderByWithRelationInput | SpaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Spaces.
     */
    cursor?: SpaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Spaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Spaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Spaces.
     */
    distinct?: SpaceScalarFieldEnum | SpaceScalarFieldEnum[]
  }

  /**
   * Space findFirstOrThrow
   */
  export type SpaceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    /**
     * Filter, which Space to fetch.
     */
    where?: SpaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Spaces to fetch.
     */
    orderBy?: SpaceOrderByWithRelationInput | SpaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Spaces.
     */
    cursor?: SpaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Spaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Spaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Spaces.
     */
    distinct?: SpaceScalarFieldEnum | SpaceScalarFieldEnum[]
  }

  /**
   * Space findMany
   */
  export type SpaceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    /**
     * Filter, which Spaces to fetch.
     */
    where?: SpaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Spaces to fetch.
     */
    orderBy?: SpaceOrderByWithRelationInput | SpaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Spaces.
     */
    cursor?: SpaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Spaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Spaces.
     */
    skip?: number
    distinct?: SpaceScalarFieldEnum | SpaceScalarFieldEnum[]
  }

  /**
   * Space create
   */
  export type SpaceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    /**
     * The data needed to create a Space.
     */
    data: XOR<SpaceCreateInput, SpaceUncheckedCreateInput>
  }

  /**
   * Space createMany
   */
  export type SpaceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Spaces.
     */
    data: SpaceCreateManyInput | SpaceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Space createManyAndReturn
   */
  export type SpaceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * The data used to create many Spaces.
     */
    data: SpaceCreateManyInput | SpaceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Space update
   */
  export type SpaceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    /**
     * The data needed to update a Space.
     */
    data: XOR<SpaceUpdateInput, SpaceUncheckedUpdateInput>
    /**
     * Choose, which Space to update.
     */
    where: SpaceWhereUniqueInput
  }

  /**
   * Space updateMany
   */
  export type SpaceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Spaces.
     */
    data: XOR<SpaceUpdateManyMutationInput, SpaceUncheckedUpdateManyInput>
    /**
     * Filter which Spaces to update
     */
    where?: SpaceWhereInput
    /**
     * Limit how many Spaces to update.
     */
    limit?: number
  }

  /**
   * Space updateManyAndReturn
   */
  export type SpaceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * The data used to update Spaces.
     */
    data: XOR<SpaceUpdateManyMutationInput, SpaceUncheckedUpdateManyInput>
    /**
     * Filter which Spaces to update
     */
    where?: SpaceWhereInput
    /**
     * Limit how many Spaces to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Space upsert
   */
  export type SpaceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    /**
     * The filter to search for the Space to update in case it exists.
     */
    where: SpaceWhereUniqueInput
    /**
     * In case the Space found by the `where` argument doesn't exist, create a new Space with this data.
     */
    create: XOR<SpaceCreateInput, SpaceUncheckedCreateInput>
    /**
     * In case the Space was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SpaceUpdateInput, SpaceUncheckedUpdateInput>
  }

  /**
   * Space delete
   */
  export type SpaceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    /**
     * Filter which Space to delete.
     */
    where: SpaceWhereUniqueInput
  }

  /**
   * Space deleteMany
   */
  export type SpaceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Spaces to delete
     */
    where?: SpaceWhereInput
    /**
     * Limit how many Spaces to delete.
     */
    limit?: number
  }

  /**
   * Space.parent
   */
  export type Space$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    where?: SpaceWhereInput
  }

  /**
   * Space.children
   */
  export type Space$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    where?: SpaceWhereInput
    orderBy?: SpaceOrderByWithRelationInput | SpaceOrderByWithRelationInput[]
    cursor?: SpaceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SpaceScalarFieldEnum | SpaceScalarFieldEnum[]
  }

  /**
   * Space.memories
   */
  export type Space$memoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    where?: MemoryWhereInput
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    cursor?: MemoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryScalarFieldEnum | MemoryScalarFieldEnum[]
  }

  /**
   * Space without action
   */
  export type SpaceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
  }


  /**
   * Model Memory
   */

  export type AggregateMemory = {
    _count: MemoryCountAggregateOutputType | null
    _avg: MemoryAvgAggregateOutputType | null
    _sum: MemorySumAggregateOutputType | null
    _min: MemoryMinAggregateOutputType | null
    _max: MemoryMaxAggregateOutputType | null
  }

  export type MemoryAvgAggregateOutputType = {
    confidence: number | null
  }

  export type MemorySumAggregateOutputType = {
    confidence: number | null
  }

  export type MemoryMinAggregateOutputType = {
    id: string | null
    userId: string | null
    spaceId: string | null
    orgId: string | null
    content: Bytes | null
    contentIv: Bytes | null
    summary: string | null
    status: $Enums.MemoryStatus | null
    supersededBy: string | null
    supersededAt: Date | null
    confidence: number | null
    source: $Enums.MemorySource | null
    hint: string | null
    indexedAt: Date | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type MemoryMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    spaceId: string | null
    orgId: string | null
    content: Bytes | null
    contentIv: Bytes | null
    summary: string | null
    status: $Enums.MemoryStatus | null
    supersededBy: string | null
    supersededAt: Date | null
    confidence: number | null
    source: $Enums.MemorySource | null
    hint: string | null
    indexedAt: Date | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type MemoryCountAggregateOutputType = {
    id: number
    userId: number
    spaceId: number
    orgId: number
    content: number
    contentIv: number
    summary: number
    status: number
    supersededBy: number
    supersededAt: number
    confidence: number
    source: number
    hint: number
    indexedAt: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type MemoryAvgAggregateInputType = {
    confidence?: true
  }

  export type MemorySumAggregateInputType = {
    confidence?: true
  }

  export type MemoryMinAggregateInputType = {
    id?: true
    userId?: true
    spaceId?: true
    orgId?: true
    content?: true
    contentIv?: true
    summary?: true
    status?: true
    supersededBy?: true
    supersededAt?: true
    confidence?: true
    source?: true
    hint?: true
    indexedAt?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type MemoryMaxAggregateInputType = {
    id?: true
    userId?: true
    spaceId?: true
    orgId?: true
    content?: true
    contentIv?: true
    summary?: true
    status?: true
    supersededBy?: true
    supersededAt?: true
    confidence?: true
    source?: true
    hint?: true
    indexedAt?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type MemoryCountAggregateInputType = {
    id?: true
    userId?: true
    spaceId?: true
    orgId?: true
    content?: true
    contentIv?: true
    summary?: true
    status?: true
    supersededBy?: true
    supersededAt?: true
    confidence?: true
    source?: true
    hint?: true
    indexedAt?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type MemoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Memory to aggregate.
     */
    where?: MemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memories to fetch.
     */
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Memories
    **/
    _count?: true | MemoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MemoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MemorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryMaxAggregateInputType
  }

  export type GetMemoryAggregateType<T extends MemoryAggregateArgs> = {
        [P in keyof T & keyof AggregateMemory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemory[P]>
      : GetScalarType<T[P], AggregateMemory[P]>
  }




  export type MemoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryWhereInput
    orderBy?: MemoryOrderByWithAggregationInput | MemoryOrderByWithAggregationInput[]
    by: MemoryScalarFieldEnum[] | MemoryScalarFieldEnum
    having?: MemoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryCountAggregateInputType | true
    _avg?: MemoryAvgAggregateInputType
    _sum?: MemorySumAggregateInputType
    _min?: MemoryMinAggregateInputType
    _max?: MemoryMaxAggregateInputType
  }

  export type MemoryGroupByOutputType = {
    id: string
    userId: string
    spaceId: string | null
    orgId: string | null
    content: Bytes
    contentIv: Bytes
    summary: string | null
    status: $Enums.MemoryStatus
    supersededBy: string | null
    supersededAt: Date | null
    confidence: number | null
    source: $Enums.MemorySource
    hint: string | null
    indexedAt: Date | null
    expiresAt: Date | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: MemoryCountAggregateOutputType | null
    _avg: MemoryAvgAggregateOutputType | null
    _sum: MemorySumAggregateOutputType | null
    _min: MemoryMinAggregateOutputType | null
    _max: MemoryMaxAggregateOutputType | null
  }

  type GetMemoryGroupByPayload<T extends MemoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryGroupByOutputType[P]>
        }
      >
    >


  export type MemorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    spaceId?: boolean
    orgId?: boolean
    content?: boolean
    contentIv?: boolean
    summary?: boolean
    status?: boolean
    supersededBy?: boolean
    supersededAt?: boolean
    confidence?: boolean
    source?: boolean
    hint?: boolean
    indexedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    space?: boolean | Memory$spaceArgs<ExtArgs>
    tags?: boolean | Memory$tagsArgs<ExtArgs>
    _count?: boolean | MemoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memory"]>

  export type MemorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    spaceId?: boolean
    orgId?: boolean
    content?: boolean
    contentIv?: boolean
    summary?: boolean
    status?: boolean
    supersededBy?: boolean
    supersededAt?: boolean
    confidence?: boolean
    source?: boolean
    hint?: boolean
    indexedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    space?: boolean | Memory$spaceArgs<ExtArgs>
  }, ExtArgs["result"]["memory"]>

  export type MemorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    spaceId?: boolean
    orgId?: boolean
    content?: boolean
    contentIv?: boolean
    summary?: boolean
    status?: boolean
    supersededBy?: boolean
    supersededAt?: boolean
    confidence?: boolean
    source?: boolean
    hint?: boolean
    indexedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    space?: boolean | Memory$spaceArgs<ExtArgs>
  }, ExtArgs["result"]["memory"]>

  export type MemorySelectScalar = {
    id?: boolean
    userId?: boolean
    spaceId?: boolean
    orgId?: boolean
    content?: boolean
    contentIv?: boolean
    summary?: boolean
    status?: boolean
    supersededBy?: boolean
    supersededAt?: boolean
    confidence?: boolean
    source?: boolean
    hint?: boolean
    indexedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type MemoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "spaceId" | "orgId" | "content" | "contentIv" | "summary" | "status" | "supersededBy" | "supersededAt" | "confidence" | "source" | "hint" | "indexedAt" | "expiresAt" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["memory"]>
  export type MemoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    space?: boolean | Memory$spaceArgs<ExtArgs>
    tags?: boolean | Memory$tagsArgs<ExtArgs>
    _count?: boolean | MemoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MemoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    space?: boolean | Memory$spaceArgs<ExtArgs>
  }
  export type MemoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    space?: boolean | Memory$spaceArgs<ExtArgs>
  }

  export type $MemoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Memory"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      space: Prisma.$SpacePayload<ExtArgs> | null
      tags: Prisma.$MemoryTagPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      spaceId: string | null
      orgId: string | null
      content: Prisma.Bytes
      contentIv: Prisma.Bytes
      summary: string | null
      status: $Enums.MemoryStatus
      supersededBy: string | null
      supersededAt: Date | null
      confidence: number | null
      source: $Enums.MemorySource
      hint: string | null
      indexedAt: Date | null
      expiresAt: Date | null
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["memory"]>
    composites: {}
  }

  type MemoryGetPayload<S extends boolean | null | undefined | MemoryDefaultArgs> = $Result.GetResult<Prisma.$MemoryPayload, S>

  type MemoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemoryCountAggregateInputType | true
    }

  export interface MemoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Memory'], meta: { name: 'Memory' } }
    /**
     * Find zero or one Memory that matches the filter.
     * @param {MemoryFindUniqueArgs} args - Arguments to find a Memory
     * @example
     * // Get one Memory
     * const memory = await prisma.memory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryFindUniqueArgs>(args: SelectSubset<T, MemoryFindUniqueArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Memory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemoryFindUniqueOrThrowArgs} args - Arguments to find a Memory
     * @example
     * // Get one Memory
     * const memory = await prisma.memory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Memory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryFindFirstArgs} args - Arguments to find a Memory
     * @example
     * // Get one Memory
     * const memory = await prisma.memory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryFindFirstArgs>(args?: SelectSubset<T, MemoryFindFirstArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Memory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryFindFirstOrThrowArgs} args - Arguments to find a Memory
     * @example
     * // Get one Memory
     * const memory = await prisma.memory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Memories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Memories
     * const memories = await prisma.memory.findMany()
     * 
     * // Get first 10 Memories
     * const memories = await prisma.memory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryWithIdOnly = await prisma.memory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryFindManyArgs>(args?: SelectSubset<T, MemoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Memory.
     * @param {MemoryCreateArgs} args - Arguments to create a Memory.
     * @example
     * // Create one Memory
     * const Memory = await prisma.memory.create({
     *   data: {
     *     // ... data to create a Memory
     *   }
     * })
     * 
     */
    create<T extends MemoryCreateArgs>(args: SelectSubset<T, MemoryCreateArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Memories.
     * @param {MemoryCreateManyArgs} args - Arguments to create many Memories.
     * @example
     * // Create many Memories
     * const memory = await prisma.memory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryCreateManyArgs>(args?: SelectSubset<T, MemoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Memories and returns the data saved in the database.
     * @param {MemoryCreateManyAndReturnArgs} args - Arguments to create many Memories.
     * @example
     * // Create many Memories
     * const memory = await prisma.memory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Memories and only return the `id`
     * const memoryWithIdOnly = await prisma.memory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Memory.
     * @param {MemoryDeleteArgs} args - Arguments to delete one Memory.
     * @example
     * // Delete one Memory
     * const Memory = await prisma.memory.delete({
     *   where: {
     *     // ... filter to delete one Memory
     *   }
     * })
     * 
     */
    delete<T extends MemoryDeleteArgs>(args: SelectSubset<T, MemoryDeleteArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Memory.
     * @param {MemoryUpdateArgs} args - Arguments to update one Memory.
     * @example
     * // Update one Memory
     * const memory = await prisma.memory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryUpdateArgs>(args: SelectSubset<T, MemoryUpdateArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Memories.
     * @param {MemoryDeleteManyArgs} args - Arguments to filter Memories to delete.
     * @example
     * // Delete a few Memories
     * const { count } = await prisma.memory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryDeleteManyArgs>(args?: SelectSubset<T, MemoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Memories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Memories
     * const memory = await prisma.memory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryUpdateManyArgs>(args: SelectSubset<T, MemoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Memories and returns the data updated in the database.
     * @param {MemoryUpdateManyAndReturnArgs} args - Arguments to update many Memories.
     * @example
     * // Update many Memories
     * const memory = await prisma.memory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Memories and only return the `id`
     * const memoryWithIdOnly = await prisma.memory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemoryUpdateManyAndReturnArgs>(args: SelectSubset<T, MemoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Memory.
     * @param {MemoryUpsertArgs} args - Arguments to update or create a Memory.
     * @example
     * // Update or create a Memory
     * const memory = await prisma.memory.upsert({
     *   create: {
     *     // ... data to create a Memory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Memory we want to update
     *   }
     * })
     */
    upsert<T extends MemoryUpsertArgs>(args: SelectSubset<T, MemoryUpsertArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Memories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryCountArgs} args - Arguments to filter Memories to count.
     * @example
     * // Count the number of Memories
     * const count = await prisma.memory.count({
     *   where: {
     *     // ... the filter for the Memories we want to count
     *   }
     * })
    **/
    count<T extends MemoryCountArgs>(
      args?: Subset<T, MemoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Memory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryAggregateArgs>(args: Subset<T, MemoryAggregateArgs>): Prisma.PrismaPromise<GetMemoryAggregateType<T>>

    /**
     * Group by Memory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryGroupByArgs['orderBy'] }
        : { orderBy?: MemoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Memory model
   */
  readonly fields: MemoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Memory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    space<T extends Memory$spaceArgs<ExtArgs> = {}>(args?: Subset<T, Memory$spaceArgs<ExtArgs>>): Prisma__SpaceClient<$Result.GetResult<Prisma.$SpacePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    tags<T extends Memory$tagsArgs<ExtArgs> = {}>(args?: Subset<T, Memory$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Memory model
   */
  interface MemoryFieldRefs {
    readonly id: FieldRef<"Memory", 'String'>
    readonly userId: FieldRef<"Memory", 'String'>
    readonly spaceId: FieldRef<"Memory", 'String'>
    readonly orgId: FieldRef<"Memory", 'String'>
    readonly content: FieldRef<"Memory", 'Bytes'>
    readonly contentIv: FieldRef<"Memory", 'Bytes'>
    readonly summary: FieldRef<"Memory", 'String'>
    readonly status: FieldRef<"Memory", 'MemoryStatus'>
    readonly supersededBy: FieldRef<"Memory", 'String'>
    readonly supersededAt: FieldRef<"Memory", 'DateTime'>
    readonly confidence: FieldRef<"Memory", 'Float'>
    readonly source: FieldRef<"Memory", 'MemorySource'>
    readonly hint: FieldRef<"Memory", 'String'>
    readonly indexedAt: FieldRef<"Memory", 'DateTime'>
    readonly expiresAt: FieldRef<"Memory", 'DateTime'>
    readonly createdAt: FieldRef<"Memory", 'DateTime'>
    readonly updatedAt: FieldRef<"Memory", 'DateTime'>
    readonly deletedAt: FieldRef<"Memory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Memory findUnique
   */
  export type MemoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter, which Memory to fetch.
     */
    where: MemoryWhereUniqueInput
  }

  /**
   * Memory findUniqueOrThrow
   */
  export type MemoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter, which Memory to fetch.
     */
    where: MemoryWhereUniqueInput
  }

  /**
   * Memory findFirst
   */
  export type MemoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter, which Memory to fetch.
     */
    where?: MemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memories to fetch.
     */
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Memories.
     */
    cursor?: MemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Memories.
     */
    distinct?: MemoryScalarFieldEnum | MemoryScalarFieldEnum[]
  }

  /**
   * Memory findFirstOrThrow
   */
  export type MemoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter, which Memory to fetch.
     */
    where?: MemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memories to fetch.
     */
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Memories.
     */
    cursor?: MemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Memories.
     */
    distinct?: MemoryScalarFieldEnum | MemoryScalarFieldEnum[]
  }

  /**
   * Memory findMany
   */
  export type MemoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter, which Memories to fetch.
     */
    where?: MemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memories to fetch.
     */
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Memories.
     */
    cursor?: MemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memories.
     */
    skip?: number
    distinct?: MemoryScalarFieldEnum | MemoryScalarFieldEnum[]
  }

  /**
   * Memory create
   */
  export type MemoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Memory.
     */
    data: XOR<MemoryCreateInput, MemoryUncheckedCreateInput>
  }

  /**
   * Memory createMany
   */
  export type MemoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Memories.
     */
    data: MemoryCreateManyInput | MemoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Memory createManyAndReturn
   */
  export type MemoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * The data used to create many Memories.
     */
    data: MemoryCreateManyInput | MemoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Memory update
   */
  export type MemoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Memory.
     */
    data: XOR<MemoryUpdateInput, MemoryUncheckedUpdateInput>
    /**
     * Choose, which Memory to update.
     */
    where: MemoryWhereUniqueInput
  }

  /**
   * Memory updateMany
   */
  export type MemoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Memories.
     */
    data: XOR<MemoryUpdateManyMutationInput, MemoryUncheckedUpdateManyInput>
    /**
     * Filter which Memories to update
     */
    where?: MemoryWhereInput
    /**
     * Limit how many Memories to update.
     */
    limit?: number
  }

  /**
   * Memory updateManyAndReturn
   */
  export type MemoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * The data used to update Memories.
     */
    data: XOR<MemoryUpdateManyMutationInput, MemoryUncheckedUpdateManyInput>
    /**
     * Filter which Memories to update
     */
    where?: MemoryWhereInput
    /**
     * Limit how many Memories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Memory upsert
   */
  export type MemoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Memory to update in case it exists.
     */
    where: MemoryWhereUniqueInput
    /**
     * In case the Memory found by the `where` argument doesn't exist, create a new Memory with this data.
     */
    create: XOR<MemoryCreateInput, MemoryUncheckedCreateInput>
    /**
     * In case the Memory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryUpdateInput, MemoryUncheckedUpdateInput>
  }

  /**
   * Memory delete
   */
  export type MemoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter which Memory to delete.
     */
    where: MemoryWhereUniqueInput
  }

  /**
   * Memory deleteMany
   */
  export type MemoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Memories to delete
     */
    where?: MemoryWhereInput
    /**
     * Limit how many Memories to delete.
     */
    limit?: number
  }

  /**
   * Memory.space
   */
  export type Memory$spaceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Space
     */
    select?: SpaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Space
     */
    omit?: SpaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpaceInclude<ExtArgs> | null
    where?: SpaceWhereInput
  }

  /**
   * Memory.tags
   */
  export type Memory$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
    where?: MemoryTagWhereInput
    orderBy?: MemoryTagOrderByWithRelationInput | MemoryTagOrderByWithRelationInput[]
    cursor?: MemoryTagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryTagScalarFieldEnum | MemoryTagScalarFieldEnum[]
  }

  /**
   * Memory without action
   */
  export type MemoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
  }


  /**
   * Model MemoryTag
   */

  export type AggregateMemoryTag = {
    _count: MemoryTagCountAggregateOutputType | null
    _min: MemoryTagMinAggregateOutputType | null
    _max: MemoryTagMaxAggregateOutputType | null
  }

  export type MemoryTagMinAggregateOutputType = {
    id: string | null
    memoryId: string | null
    tag: string | null
    createdAt: Date | null
  }

  export type MemoryTagMaxAggregateOutputType = {
    id: string | null
    memoryId: string | null
    tag: string | null
    createdAt: Date | null
  }

  export type MemoryTagCountAggregateOutputType = {
    id: number
    memoryId: number
    tag: number
    createdAt: number
    _all: number
  }


  export type MemoryTagMinAggregateInputType = {
    id?: true
    memoryId?: true
    tag?: true
    createdAt?: true
  }

  export type MemoryTagMaxAggregateInputType = {
    id?: true
    memoryId?: true
    tag?: true
    createdAt?: true
  }

  export type MemoryTagCountAggregateInputType = {
    id?: true
    memoryId?: true
    tag?: true
    createdAt?: true
    _all?: true
  }

  export type MemoryTagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryTag to aggregate.
     */
    where?: MemoryTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryTags to fetch.
     */
    orderBy?: MemoryTagOrderByWithRelationInput | MemoryTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemoryTags
    **/
    _count?: true | MemoryTagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryTagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryTagMaxAggregateInputType
  }

  export type GetMemoryTagAggregateType<T extends MemoryTagAggregateArgs> = {
        [P in keyof T & keyof AggregateMemoryTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemoryTag[P]>
      : GetScalarType<T[P], AggregateMemoryTag[P]>
  }




  export type MemoryTagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryTagWhereInput
    orderBy?: MemoryTagOrderByWithAggregationInput | MemoryTagOrderByWithAggregationInput[]
    by: MemoryTagScalarFieldEnum[] | MemoryTagScalarFieldEnum
    having?: MemoryTagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryTagCountAggregateInputType | true
    _min?: MemoryTagMinAggregateInputType
    _max?: MemoryTagMaxAggregateInputType
  }

  export type MemoryTagGroupByOutputType = {
    id: string
    memoryId: string
    tag: string
    createdAt: Date
    _count: MemoryTagCountAggregateOutputType | null
    _min: MemoryTagMinAggregateOutputType | null
    _max: MemoryTagMaxAggregateOutputType | null
  }

  type GetMemoryTagGroupByPayload<T extends MemoryTagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryTagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryTagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryTagGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryTagGroupByOutputType[P]>
        }
      >
    >


  export type MemoryTagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    memoryId?: boolean
    tag?: boolean
    createdAt?: boolean
    memory?: boolean | MemoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryTag"]>

  export type MemoryTagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    memoryId?: boolean
    tag?: boolean
    createdAt?: boolean
    memory?: boolean | MemoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryTag"]>

  export type MemoryTagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    memoryId?: boolean
    tag?: boolean
    createdAt?: boolean
    memory?: boolean | MemoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryTag"]>

  export type MemoryTagSelectScalar = {
    id?: boolean
    memoryId?: boolean
    tag?: boolean
    createdAt?: boolean
  }

  export type MemoryTagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "memoryId" | "tag" | "createdAt", ExtArgs["result"]["memoryTag"]>
  export type MemoryTagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memory?: boolean | MemoryDefaultArgs<ExtArgs>
  }
  export type MemoryTagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memory?: boolean | MemoryDefaultArgs<ExtArgs>
  }
  export type MemoryTagIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memory?: boolean | MemoryDefaultArgs<ExtArgs>
  }

  export type $MemoryTagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemoryTag"
    objects: {
      memory: Prisma.$MemoryPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      memoryId: string
      tag: string
      createdAt: Date
    }, ExtArgs["result"]["memoryTag"]>
    composites: {}
  }

  type MemoryTagGetPayload<S extends boolean | null | undefined | MemoryTagDefaultArgs> = $Result.GetResult<Prisma.$MemoryTagPayload, S>

  type MemoryTagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemoryTagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemoryTagCountAggregateInputType | true
    }

  export interface MemoryTagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemoryTag'], meta: { name: 'MemoryTag' } }
    /**
     * Find zero or one MemoryTag that matches the filter.
     * @param {MemoryTagFindUniqueArgs} args - Arguments to find a MemoryTag
     * @example
     * // Get one MemoryTag
     * const memoryTag = await prisma.memoryTag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryTagFindUniqueArgs>(args: SelectSubset<T, MemoryTagFindUniqueArgs<ExtArgs>>): Prisma__MemoryTagClient<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MemoryTag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemoryTagFindUniqueOrThrowArgs} args - Arguments to find a MemoryTag
     * @example
     * // Get one MemoryTag
     * const memoryTag = await prisma.memoryTag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryTagFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryTagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryTagClient<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryTag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTagFindFirstArgs} args - Arguments to find a MemoryTag
     * @example
     * // Get one MemoryTag
     * const memoryTag = await prisma.memoryTag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryTagFindFirstArgs>(args?: SelectSubset<T, MemoryTagFindFirstArgs<ExtArgs>>): Prisma__MemoryTagClient<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryTag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTagFindFirstOrThrowArgs} args - Arguments to find a MemoryTag
     * @example
     * // Get one MemoryTag
     * const memoryTag = await prisma.memoryTag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryTagFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryTagFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryTagClient<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MemoryTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemoryTags
     * const memoryTags = await prisma.memoryTag.findMany()
     * 
     * // Get first 10 MemoryTags
     * const memoryTags = await prisma.memoryTag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryTagWithIdOnly = await prisma.memoryTag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryTagFindManyArgs>(args?: SelectSubset<T, MemoryTagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MemoryTag.
     * @param {MemoryTagCreateArgs} args - Arguments to create a MemoryTag.
     * @example
     * // Create one MemoryTag
     * const MemoryTag = await prisma.memoryTag.create({
     *   data: {
     *     // ... data to create a MemoryTag
     *   }
     * })
     * 
     */
    create<T extends MemoryTagCreateArgs>(args: SelectSubset<T, MemoryTagCreateArgs<ExtArgs>>): Prisma__MemoryTagClient<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MemoryTags.
     * @param {MemoryTagCreateManyArgs} args - Arguments to create many MemoryTags.
     * @example
     * // Create many MemoryTags
     * const memoryTag = await prisma.memoryTag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryTagCreateManyArgs>(args?: SelectSubset<T, MemoryTagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemoryTags and returns the data saved in the database.
     * @param {MemoryTagCreateManyAndReturnArgs} args - Arguments to create many MemoryTags.
     * @example
     * // Create many MemoryTags
     * const memoryTag = await prisma.memoryTag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemoryTags and only return the `id`
     * const memoryTagWithIdOnly = await prisma.memoryTag.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryTagCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryTagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MemoryTag.
     * @param {MemoryTagDeleteArgs} args - Arguments to delete one MemoryTag.
     * @example
     * // Delete one MemoryTag
     * const MemoryTag = await prisma.memoryTag.delete({
     *   where: {
     *     // ... filter to delete one MemoryTag
     *   }
     * })
     * 
     */
    delete<T extends MemoryTagDeleteArgs>(args: SelectSubset<T, MemoryTagDeleteArgs<ExtArgs>>): Prisma__MemoryTagClient<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MemoryTag.
     * @param {MemoryTagUpdateArgs} args - Arguments to update one MemoryTag.
     * @example
     * // Update one MemoryTag
     * const memoryTag = await prisma.memoryTag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryTagUpdateArgs>(args: SelectSubset<T, MemoryTagUpdateArgs<ExtArgs>>): Prisma__MemoryTagClient<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MemoryTags.
     * @param {MemoryTagDeleteManyArgs} args - Arguments to filter MemoryTags to delete.
     * @example
     * // Delete a few MemoryTags
     * const { count } = await prisma.memoryTag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryTagDeleteManyArgs>(args?: SelectSubset<T, MemoryTagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemoryTags
     * const memoryTag = await prisma.memoryTag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryTagUpdateManyArgs>(args: SelectSubset<T, MemoryTagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryTags and returns the data updated in the database.
     * @param {MemoryTagUpdateManyAndReturnArgs} args - Arguments to update many MemoryTags.
     * @example
     * // Update many MemoryTags
     * const memoryTag = await prisma.memoryTag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MemoryTags and only return the `id`
     * const memoryTagWithIdOnly = await prisma.memoryTag.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemoryTagUpdateManyAndReturnArgs>(args: SelectSubset<T, MemoryTagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MemoryTag.
     * @param {MemoryTagUpsertArgs} args - Arguments to update or create a MemoryTag.
     * @example
     * // Update or create a MemoryTag
     * const memoryTag = await prisma.memoryTag.upsert({
     *   create: {
     *     // ... data to create a MemoryTag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemoryTag we want to update
     *   }
     * })
     */
    upsert<T extends MemoryTagUpsertArgs>(args: SelectSubset<T, MemoryTagUpsertArgs<ExtArgs>>): Prisma__MemoryTagClient<$Result.GetResult<Prisma.$MemoryTagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MemoryTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTagCountArgs} args - Arguments to filter MemoryTags to count.
     * @example
     * // Count the number of MemoryTags
     * const count = await prisma.memoryTag.count({
     *   where: {
     *     // ... the filter for the MemoryTags we want to count
     *   }
     * })
    **/
    count<T extends MemoryTagCountArgs>(
      args?: Subset<T, MemoryTagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryTagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemoryTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryTagAggregateArgs>(args: Subset<T, MemoryTagAggregateArgs>): Prisma.PrismaPromise<GetMemoryTagAggregateType<T>>

    /**
     * Group by MemoryTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryTagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryTagGroupByArgs['orderBy'] }
        : { orderBy?: MemoryTagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryTagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemoryTag model
   */
  readonly fields: MemoryTagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemoryTag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryTagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    memory<T extends MemoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemoryDefaultArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MemoryTag model
   */
  interface MemoryTagFieldRefs {
    readonly id: FieldRef<"MemoryTag", 'String'>
    readonly memoryId: FieldRef<"MemoryTag", 'String'>
    readonly tag: FieldRef<"MemoryTag", 'String'>
    readonly createdAt: FieldRef<"MemoryTag", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MemoryTag findUnique
   */
  export type MemoryTagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
    /**
     * Filter, which MemoryTag to fetch.
     */
    where: MemoryTagWhereUniqueInput
  }

  /**
   * MemoryTag findUniqueOrThrow
   */
  export type MemoryTagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
    /**
     * Filter, which MemoryTag to fetch.
     */
    where: MemoryTagWhereUniqueInput
  }

  /**
   * MemoryTag findFirst
   */
  export type MemoryTagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
    /**
     * Filter, which MemoryTag to fetch.
     */
    where?: MemoryTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryTags to fetch.
     */
    orderBy?: MemoryTagOrderByWithRelationInput | MemoryTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryTags.
     */
    cursor?: MemoryTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryTags.
     */
    distinct?: MemoryTagScalarFieldEnum | MemoryTagScalarFieldEnum[]
  }

  /**
   * MemoryTag findFirstOrThrow
   */
  export type MemoryTagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
    /**
     * Filter, which MemoryTag to fetch.
     */
    where?: MemoryTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryTags to fetch.
     */
    orderBy?: MemoryTagOrderByWithRelationInput | MemoryTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryTags.
     */
    cursor?: MemoryTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryTags.
     */
    distinct?: MemoryTagScalarFieldEnum | MemoryTagScalarFieldEnum[]
  }

  /**
   * MemoryTag findMany
   */
  export type MemoryTagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
    /**
     * Filter, which MemoryTags to fetch.
     */
    where?: MemoryTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryTags to fetch.
     */
    orderBy?: MemoryTagOrderByWithRelationInput | MemoryTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemoryTags.
     */
    cursor?: MemoryTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryTags.
     */
    skip?: number
    distinct?: MemoryTagScalarFieldEnum | MemoryTagScalarFieldEnum[]
  }

  /**
   * MemoryTag create
   */
  export type MemoryTagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
    /**
     * The data needed to create a MemoryTag.
     */
    data: XOR<MemoryTagCreateInput, MemoryTagUncheckedCreateInput>
  }

  /**
   * MemoryTag createMany
   */
  export type MemoryTagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemoryTags.
     */
    data: MemoryTagCreateManyInput | MemoryTagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MemoryTag createManyAndReturn
   */
  export type MemoryTagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * The data used to create many MemoryTags.
     */
    data: MemoryTagCreateManyInput | MemoryTagCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryTag update
   */
  export type MemoryTagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
    /**
     * The data needed to update a MemoryTag.
     */
    data: XOR<MemoryTagUpdateInput, MemoryTagUncheckedUpdateInput>
    /**
     * Choose, which MemoryTag to update.
     */
    where: MemoryTagWhereUniqueInput
  }

  /**
   * MemoryTag updateMany
   */
  export type MemoryTagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemoryTags.
     */
    data: XOR<MemoryTagUpdateManyMutationInput, MemoryTagUncheckedUpdateManyInput>
    /**
     * Filter which MemoryTags to update
     */
    where?: MemoryTagWhereInput
    /**
     * Limit how many MemoryTags to update.
     */
    limit?: number
  }

  /**
   * MemoryTag updateManyAndReturn
   */
  export type MemoryTagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * The data used to update MemoryTags.
     */
    data: XOR<MemoryTagUpdateManyMutationInput, MemoryTagUncheckedUpdateManyInput>
    /**
     * Filter which MemoryTags to update
     */
    where?: MemoryTagWhereInput
    /**
     * Limit how many MemoryTags to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryTag upsert
   */
  export type MemoryTagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
    /**
     * The filter to search for the MemoryTag to update in case it exists.
     */
    where: MemoryTagWhereUniqueInput
    /**
     * In case the MemoryTag found by the `where` argument doesn't exist, create a new MemoryTag with this data.
     */
    create: XOR<MemoryTagCreateInput, MemoryTagUncheckedCreateInput>
    /**
     * In case the MemoryTag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryTagUpdateInput, MemoryTagUncheckedUpdateInput>
  }

  /**
   * MemoryTag delete
   */
  export type MemoryTagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
    /**
     * Filter which MemoryTag to delete.
     */
    where: MemoryTagWhereUniqueInput
  }

  /**
   * MemoryTag deleteMany
   */
  export type MemoryTagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryTags to delete
     */
    where?: MemoryTagWhereInput
    /**
     * Limit how many MemoryTags to delete.
     */
    limit?: number
  }

  /**
   * MemoryTag without action
   */
  export type MemoryTagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTag
     */
    select?: MemoryTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTag
     */
    omit?: MemoryTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTagInclude<ExtArgs> | null
  }


  /**
   * Model McpToken
   */

  export type AggregateMcpToken = {
    _count: McpTokenCountAggregateOutputType | null
    _min: McpTokenMinAggregateOutputType | null
    _max: McpTokenMaxAggregateOutputType | null
  }

  export type McpTokenMinAggregateOutputType = {
    id: string | null
    userId: string | null
    token: string | null
    hashedToken: string | null
    scope: $Enums.TokenScope | null
    expiresAt: Date | null
    revokedAt: Date | null
    lastUsedAt: Date | null
    createdAt: Date | null
  }

  export type McpTokenMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    token: string | null
    hashedToken: string | null
    scope: $Enums.TokenScope | null
    expiresAt: Date | null
    revokedAt: Date | null
    lastUsedAt: Date | null
    createdAt: Date | null
  }

  export type McpTokenCountAggregateOutputType = {
    id: number
    userId: number
    token: number
    hashedToken: number
    scope: number
    expiresAt: number
    revokedAt: number
    lastUsedAt: number
    createdAt: number
    _all: number
  }


  export type McpTokenMinAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    hashedToken?: true
    scope?: true
    expiresAt?: true
    revokedAt?: true
    lastUsedAt?: true
    createdAt?: true
  }

  export type McpTokenMaxAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    hashedToken?: true
    scope?: true
    expiresAt?: true
    revokedAt?: true
    lastUsedAt?: true
    createdAt?: true
  }

  export type McpTokenCountAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    hashedToken?: true
    scope?: true
    expiresAt?: true
    revokedAt?: true
    lastUsedAt?: true
    createdAt?: true
    _all?: true
  }

  export type McpTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which McpToken to aggregate.
     */
    where?: McpTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of McpTokens to fetch.
     */
    orderBy?: McpTokenOrderByWithRelationInput | McpTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: McpTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` McpTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` McpTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned McpTokens
    **/
    _count?: true | McpTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: McpTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: McpTokenMaxAggregateInputType
  }

  export type GetMcpTokenAggregateType<T extends McpTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateMcpToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMcpToken[P]>
      : GetScalarType<T[P], AggregateMcpToken[P]>
  }




  export type McpTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: McpTokenWhereInput
    orderBy?: McpTokenOrderByWithAggregationInput | McpTokenOrderByWithAggregationInput[]
    by: McpTokenScalarFieldEnum[] | McpTokenScalarFieldEnum
    having?: McpTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: McpTokenCountAggregateInputType | true
    _min?: McpTokenMinAggregateInputType
    _max?: McpTokenMaxAggregateInputType
  }

  export type McpTokenGroupByOutputType = {
    id: string
    userId: string
    token: string | null
    hashedToken: string
    scope: $Enums.TokenScope
    expiresAt: Date | null
    revokedAt: Date | null
    lastUsedAt: Date | null
    createdAt: Date
    _count: McpTokenCountAggregateOutputType | null
    _min: McpTokenMinAggregateOutputType | null
    _max: McpTokenMaxAggregateOutputType | null
  }

  type GetMcpTokenGroupByPayload<T extends McpTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<McpTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof McpTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], McpTokenGroupByOutputType[P]>
            : GetScalarType<T[P], McpTokenGroupByOutputType[P]>
        }
      >
    >


  export type McpTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    hashedToken?: boolean
    scope?: boolean
    expiresAt?: boolean
    revokedAt?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mcpToken"]>

  export type McpTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    hashedToken?: boolean
    scope?: boolean
    expiresAt?: boolean
    revokedAt?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mcpToken"]>

  export type McpTokenSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    hashedToken?: boolean
    scope?: boolean
    expiresAt?: boolean
    revokedAt?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mcpToken"]>

  export type McpTokenSelectScalar = {
    id?: boolean
    userId?: boolean
    token?: boolean
    hashedToken?: boolean
    scope?: boolean
    expiresAt?: boolean
    revokedAt?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
  }

  export type McpTokenOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "token" | "hashedToken" | "scope" | "expiresAt" | "revokedAt" | "lastUsedAt" | "createdAt", ExtArgs["result"]["mcpToken"]>
  export type McpTokenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type McpTokenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type McpTokenIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $McpTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "McpToken"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      token: string | null
      hashedToken: string
      scope: $Enums.TokenScope
      expiresAt: Date | null
      revokedAt: Date | null
      lastUsedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["mcpToken"]>
    composites: {}
  }

  type McpTokenGetPayload<S extends boolean | null | undefined | McpTokenDefaultArgs> = $Result.GetResult<Prisma.$McpTokenPayload, S>

  type McpTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<McpTokenFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: McpTokenCountAggregateInputType | true
    }

  export interface McpTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['McpToken'], meta: { name: 'McpToken' } }
    /**
     * Find zero or one McpToken that matches the filter.
     * @param {McpTokenFindUniqueArgs} args - Arguments to find a McpToken
     * @example
     * // Get one McpToken
     * const mcpToken = await prisma.mcpToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends McpTokenFindUniqueArgs>(args: SelectSubset<T, McpTokenFindUniqueArgs<ExtArgs>>): Prisma__McpTokenClient<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one McpToken that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {McpTokenFindUniqueOrThrowArgs} args - Arguments to find a McpToken
     * @example
     * // Get one McpToken
     * const mcpToken = await prisma.mcpToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends McpTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, McpTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__McpTokenClient<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first McpToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {McpTokenFindFirstArgs} args - Arguments to find a McpToken
     * @example
     * // Get one McpToken
     * const mcpToken = await prisma.mcpToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends McpTokenFindFirstArgs>(args?: SelectSubset<T, McpTokenFindFirstArgs<ExtArgs>>): Prisma__McpTokenClient<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first McpToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {McpTokenFindFirstOrThrowArgs} args - Arguments to find a McpToken
     * @example
     * // Get one McpToken
     * const mcpToken = await prisma.mcpToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends McpTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, McpTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__McpTokenClient<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more McpTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {McpTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all McpTokens
     * const mcpTokens = await prisma.mcpToken.findMany()
     * 
     * // Get first 10 McpTokens
     * const mcpTokens = await prisma.mcpToken.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const mcpTokenWithIdOnly = await prisma.mcpToken.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends McpTokenFindManyArgs>(args?: SelectSubset<T, McpTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a McpToken.
     * @param {McpTokenCreateArgs} args - Arguments to create a McpToken.
     * @example
     * // Create one McpToken
     * const McpToken = await prisma.mcpToken.create({
     *   data: {
     *     // ... data to create a McpToken
     *   }
     * })
     * 
     */
    create<T extends McpTokenCreateArgs>(args: SelectSubset<T, McpTokenCreateArgs<ExtArgs>>): Prisma__McpTokenClient<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many McpTokens.
     * @param {McpTokenCreateManyArgs} args - Arguments to create many McpTokens.
     * @example
     * // Create many McpTokens
     * const mcpToken = await prisma.mcpToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends McpTokenCreateManyArgs>(args?: SelectSubset<T, McpTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many McpTokens and returns the data saved in the database.
     * @param {McpTokenCreateManyAndReturnArgs} args - Arguments to create many McpTokens.
     * @example
     * // Create many McpTokens
     * const mcpToken = await prisma.mcpToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many McpTokens and only return the `id`
     * const mcpTokenWithIdOnly = await prisma.mcpToken.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends McpTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, McpTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a McpToken.
     * @param {McpTokenDeleteArgs} args - Arguments to delete one McpToken.
     * @example
     * // Delete one McpToken
     * const McpToken = await prisma.mcpToken.delete({
     *   where: {
     *     // ... filter to delete one McpToken
     *   }
     * })
     * 
     */
    delete<T extends McpTokenDeleteArgs>(args: SelectSubset<T, McpTokenDeleteArgs<ExtArgs>>): Prisma__McpTokenClient<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one McpToken.
     * @param {McpTokenUpdateArgs} args - Arguments to update one McpToken.
     * @example
     * // Update one McpToken
     * const mcpToken = await prisma.mcpToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends McpTokenUpdateArgs>(args: SelectSubset<T, McpTokenUpdateArgs<ExtArgs>>): Prisma__McpTokenClient<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more McpTokens.
     * @param {McpTokenDeleteManyArgs} args - Arguments to filter McpTokens to delete.
     * @example
     * // Delete a few McpTokens
     * const { count } = await prisma.mcpToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends McpTokenDeleteManyArgs>(args?: SelectSubset<T, McpTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more McpTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {McpTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many McpTokens
     * const mcpToken = await prisma.mcpToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends McpTokenUpdateManyArgs>(args: SelectSubset<T, McpTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more McpTokens and returns the data updated in the database.
     * @param {McpTokenUpdateManyAndReturnArgs} args - Arguments to update many McpTokens.
     * @example
     * // Update many McpTokens
     * const mcpToken = await prisma.mcpToken.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more McpTokens and only return the `id`
     * const mcpTokenWithIdOnly = await prisma.mcpToken.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends McpTokenUpdateManyAndReturnArgs>(args: SelectSubset<T, McpTokenUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one McpToken.
     * @param {McpTokenUpsertArgs} args - Arguments to update or create a McpToken.
     * @example
     * // Update or create a McpToken
     * const mcpToken = await prisma.mcpToken.upsert({
     *   create: {
     *     // ... data to create a McpToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the McpToken we want to update
     *   }
     * })
     */
    upsert<T extends McpTokenUpsertArgs>(args: SelectSubset<T, McpTokenUpsertArgs<ExtArgs>>): Prisma__McpTokenClient<$Result.GetResult<Prisma.$McpTokenPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of McpTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {McpTokenCountArgs} args - Arguments to filter McpTokens to count.
     * @example
     * // Count the number of McpTokens
     * const count = await prisma.mcpToken.count({
     *   where: {
     *     // ... the filter for the McpTokens we want to count
     *   }
     * })
    **/
    count<T extends McpTokenCountArgs>(
      args?: Subset<T, McpTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], McpTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a McpToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {McpTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends McpTokenAggregateArgs>(args: Subset<T, McpTokenAggregateArgs>): Prisma.PrismaPromise<GetMcpTokenAggregateType<T>>

    /**
     * Group by McpToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {McpTokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends McpTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: McpTokenGroupByArgs['orderBy'] }
        : { orderBy?: McpTokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, McpTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMcpTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the McpToken model
   */
  readonly fields: McpTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for McpToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__McpTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the McpToken model
   */
  interface McpTokenFieldRefs {
    readonly id: FieldRef<"McpToken", 'String'>
    readonly userId: FieldRef<"McpToken", 'String'>
    readonly token: FieldRef<"McpToken", 'String'>
    readonly hashedToken: FieldRef<"McpToken", 'String'>
    readonly scope: FieldRef<"McpToken", 'TokenScope'>
    readonly expiresAt: FieldRef<"McpToken", 'DateTime'>
    readonly revokedAt: FieldRef<"McpToken", 'DateTime'>
    readonly lastUsedAt: FieldRef<"McpToken", 'DateTime'>
    readonly createdAt: FieldRef<"McpToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * McpToken findUnique
   */
  export type McpTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
    /**
     * Filter, which McpToken to fetch.
     */
    where: McpTokenWhereUniqueInput
  }

  /**
   * McpToken findUniqueOrThrow
   */
  export type McpTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
    /**
     * Filter, which McpToken to fetch.
     */
    where: McpTokenWhereUniqueInput
  }

  /**
   * McpToken findFirst
   */
  export type McpTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
    /**
     * Filter, which McpToken to fetch.
     */
    where?: McpTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of McpTokens to fetch.
     */
    orderBy?: McpTokenOrderByWithRelationInput | McpTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for McpTokens.
     */
    cursor?: McpTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` McpTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` McpTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of McpTokens.
     */
    distinct?: McpTokenScalarFieldEnum | McpTokenScalarFieldEnum[]
  }

  /**
   * McpToken findFirstOrThrow
   */
  export type McpTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
    /**
     * Filter, which McpToken to fetch.
     */
    where?: McpTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of McpTokens to fetch.
     */
    orderBy?: McpTokenOrderByWithRelationInput | McpTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for McpTokens.
     */
    cursor?: McpTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` McpTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` McpTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of McpTokens.
     */
    distinct?: McpTokenScalarFieldEnum | McpTokenScalarFieldEnum[]
  }

  /**
   * McpToken findMany
   */
  export type McpTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
    /**
     * Filter, which McpTokens to fetch.
     */
    where?: McpTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of McpTokens to fetch.
     */
    orderBy?: McpTokenOrderByWithRelationInput | McpTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing McpTokens.
     */
    cursor?: McpTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` McpTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` McpTokens.
     */
    skip?: number
    distinct?: McpTokenScalarFieldEnum | McpTokenScalarFieldEnum[]
  }

  /**
   * McpToken create
   */
  export type McpTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
    /**
     * The data needed to create a McpToken.
     */
    data: XOR<McpTokenCreateInput, McpTokenUncheckedCreateInput>
  }

  /**
   * McpToken createMany
   */
  export type McpTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many McpTokens.
     */
    data: McpTokenCreateManyInput | McpTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * McpToken createManyAndReturn
   */
  export type McpTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * The data used to create many McpTokens.
     */
    data: McpTokenCreateManyInput | McpTokenCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * McpToken update
   */
  export type McpTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
    /**
     * The data needed to update a McpToken.
     */
    data: XOR<McpTokenUpdateInput, McpTokenUncheckedUpdateInput>
    /**
     * Choose, which McpToken to update.
     */
    where: McpTokenWhereUniqueInput
  }

  /**
   * McpToken updateMany
   */
  export type McpTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update McpTokens.
     */
    data: XOR<McpTokenUpdateManyMutationInput, McpTokenUncheckedUpdateManyInput>
    /**
     * Filter which McpTokens to update
     */
    where?: McpTokenWhereInput
    /**
     * Limit how many McpTokens to update.
     */
    limit?: number
  }

  /**
   * McpToken updateManyAndReturn
   */
  export type McpTokenUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * The data used to update McpTokens.
     */
    data: XOR<McpTokenUpdateManyMutationInput, McpTokenUncheckedUpdateManyInput>
    /**
     * Filter which McpTokens to update
     */
    where?: McpTokenWhereInput
    /**
     * Limit how many McpTokens to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * McpToken upsert
   */
  export type McpTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
    /**
     * The filter to search for the McpToken to update in case it exists.
     */
    where: McpTokenWhereUniqueInput
    /**
     * In case the McpToken found by the `where` argument doesn't exist, create a new McpToken with this data.
     */
    create: XOR<McpTokenCreateInput, McpTokenUncheckedCreateInput>
    /**
     * In case the McpToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<McpTokenUpdateInput, McpTokenUncheckedUpdateInput>
  }

  /**
   * McpToken delete
   */
  export type McpTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
    /**
     * Filter which McpToken to delete.
     */
    where: McpTokenWhereUniqueInput
  }

  /**
   * McpToken deleteMany
   */
  export type McpTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which McpTokens to delete
     */
    where?: McpTokenWhereInput
    /**
     * Limit how many McpTokens to delete.
     */
    limit?: number
  }

  /**
   * McpToken without action
   */
  export type McpTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the McpToken
     */
    select?: McpTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the McpToken
     */
    omit?: McpTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: McpTokenInclude<ExtArgs> | null
  }


  /**
   * Model AgentRun
   */

  export type AggregateAgentRun = {
    _count: AgentRunCountAggregateOutputType | null
    _avg: AgentRunAvgAggregateOutputType | null
    _sum: AgentRunSumAggregateOutputType | null
    _min: AgentRunMinAggregateOutputType | null
    _max: AgentRunMaxAggregateOutputType | null
  }

  export type AgentRunAvgAggregateOutputType = {
    inputTokens: number | null
    outputTokens: number | null
    latencyMs: number | null
    costUsd: Decimal | null
  }

  export type AgentRunSumAggregateOutputType = {
    inputTokens: number | null
    outputTokens: number | null
    latencyMs: number | null
    costUsd: Decimal | null
  }

  export type AgentRunMinAggregateOutputType = {
    id: string | null
    userId: string | null
    task: string | null
    status: $Enums.AgentRunStatus | null
    errorMsg: string | null
    llmProvider: string | null
    model: string | null
    inputTokens: number | null
    outputTokens: number | null
    latencyMs: number | null
    costUsd: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AgentRunMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    task: string | null
    status: $Enums.AgentRunStatus | null
    errorMsg: string | null
    llmProvider: string | null
    model: string | null
    inputTokens: number | null
    outputTokens: number | null
    latencyMs: number | null
    costUsd: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AgentRunCountAggregateOutputType = {
    id: number
    userId: number
    task: number
    status: number
    errorMsg: number
    llmProvider: number
    model: number
    inputTokens: number
    outputTokens: number
    latencyMs: number
    costUsd: number
    result: number
    memoryIds: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AgentRunAvgAggregateInputType = {
    inputTokens?: true
    outputTokens?: true
    latencyMs?: true
    costUsd?: true
  }

  export type AgentRunSumAggregateInputType = {
    inputTokens?: true
    outputTokens?: true
    latencyMs?: true
    costUsd?: true
  }

  export type AgentRunMinAggregateInputType = {
    id?: true
    userId?: true
    task?: true
    status?: true
    errorMsg?: true
    llmProvider?: true
    model?: true
    inputTokens?: true
    outputTokens?: true
    latencyMs?: true
    costUsd?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AgentRunMaxAggregateInputType = {
    id?: true
    userId?: true
    task?: true
    status?: true
    errorMsg?: true
    llmProvider?: true
    model?: true
    inputTokens?: true
    outputTokens?: true
    latencyMs?: true
    costUsd?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AgentRunCountAggregateInputType = {
    id?: true
    userId?: true
    task?: true
    status?: true
    errorMsg?: true
    llmProvider?: true
    model?: true
    inputTokens?: true
    outputTokens?: true
    latencyMs?: true
    costUsd?: true
    result?: true
    memoryIds?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AgentRunAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentRun to aggregate.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AgentRuns
    **/
    _count?: true | AgentRunCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AgentRunAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AgentRunSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentRunMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentRunMaxAggregateInputType
  }

  export type GetAgentRunAggregateType<T extends AgentRunAggregateArgs> = {
        [P in keyof T & keyof AggregateAgentRun]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgentRun[P]>
      : GetScalarType<T[P], AggregateAgentRun[P]>
  }




  export type AgentRunGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentRunWhereInput
    orderBy?: AgentRunOrderByWithAggregationInput | AgentRunOrderByWithAggregationInput[]
    by: AgentRunScalarFieldEnum[] | AgentRunScalarFieldEnum
    having?: AgentRunScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentRunCountAggregateInputType | true
    _avg?: AgentRunAvgAggregateInputType
    _sum?: AgentRunSumAggregateInputType
    _min?: AgentRunMinAggregateInputType
    _max?: AgentRunMaxAggregateInputType
  }

  export type AgentRunGroupByOutputType = {
    id: string
    userId: string
    task: string
    status: $Enums.AgentRunStatus
    errorMsg: string | null
    llmProvider: string | null
    model: string | null
    inputTokens: number | null
    outputTokens: number | null
    latencyMs: number | null
    costUsd: Decimal | null
    result: JsonValue | null
    memoryIds: string[]
    createdAt: Date
    updatedAt: Date
    _count: AgentRunCountAggregateOutputType | null
    _avg: AgentRunAvgAggregateOutputType | null
    _sum: AgentRunSumAggregateOutputType | null
    _min: AgentRunMinAggregateOutputType | null
    _max: AgentRunMaxAggregateOutputType | null
  }

  type GetAgentRunGroupByPayload<T extends AgentRunGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentRunGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentRunGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentRunGroupByOutputType[P]>
            : GetScalarType<T[P], AgentRunGroupByOutputType[P]>
        }
      >
    >


  export type AgentRunSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    task?: boolean
    status?: boolean
    errorMsg?: boolean
    llmProvider?: boolean
    model?: boolean
    inputTokens?: boolean
    outputTokens?: boolean
    latencyMs?: boolean
    costUsd?: boolean
    result?: boolean
    memoryIds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agentRun"]>

  export type AgentRunSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    task?: boolean
    status?: boolean
    errorMsg?: boolean
    llmProvider?: boolean
    model?: boolean
    inputTokens?: boolean
    outputTokens?: boolean
    latencyMs?: boolean
    costUsd?: boolean
    result?: boolean
    memoryIds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agentRun"]>

  export type AgentRunSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    task?: boolean
    status?: boolean
    errorMsg?: boolean
    llmProvider?: boolean
    model?: boolean
    inputTokens?: boolean
    outputTokens?: boolean
    latencyMs?: boolean
    costUsd?: boolean
    result?: boolean
    memoryIds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agentRun"]>

  export type AgentRunSelectScalar = {
    id?: boolean
    userId?: boolean
    task?: boolean
    status?: boolean
    errorMsg?: boolean
    llmProvider?: boolean
    model?: boolean
    inputTokens?: boolean
    outputTokens?: boolean
    latencyMs?: boolean
    costUsd?: boolean
    result?: boolean
    memoryIds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AgentRunOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "task" | "status" | "errorMsg" | "llmProvider" | "model" | "inputTokens" | "outputTokens" | "latencyMs" | "costUsd" | "result" | "memoryIds" | "createdAt" | "updatedAt", ExtArgs["result"]["agentRun"]>
  export type AgentRunInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AgentRunIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AgentRunIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AgentRunPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AgentRun"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      task: string
      status: $Enums.AgentRunStatus
      errorMsg: string | null
      llmProvider: string | null
      model: string | null
      inputTokens: number | null
      outputTokens: number | null
      latencyMs: number | null
      costUsd: Prisma.Decimal | null
      result: Prisma.JsonValue | null
      memoryIds: string[]
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["agentRun"]>
    composites: {}
  }

  type AgentRunGetPayload<S extends boolean | null | undefined | AgentRunDefaultArgs> = $Result.GetResult<Prisma.$AgentRunPayload, S>

  type AgentRunCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgentRunFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgentRunCountAggregateInputType | true
    }

  export interface AgentRunDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AgentRun'], meta: { name: 'AgentRun' } }
    /**
     * Find zero or one AgentRun that matches the filter.
     * @param {AgentRunFindUniqueArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentRunFindUniqueArgs>(args: SelectSubset<T, AgentRunFindUniqueArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AgentRun that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgentRunFindUniqueOrThrowArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentRunFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgentRun that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindFirstArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentRunFindFirstArgs>(args?: SelectSubset<T, AgentRunFindFirstArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgentRun that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindFirstOrThrowArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentRunFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentRunFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AgentRuns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AgentRuns
     * const agentRuns = await prisma.agentRun.findMany()
     * 
     * // Get first 10 AgentRuns
     * const agentRuns = await prisma.agentRun.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentRunWithIdOnly = await prisma.agentRun.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentRunFindManyArgs>(args?: SelectSubset<T, AgentRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AgentRun.
     * @param {AgentRunCreateArgs} args - Arguments to create a AgentRun.
     * @example
     * // Create one AgentRun
     * const AgentRun = await prisma.agentRun.create({
     *   data: {
     *     // ... data to create a AgentRun
     *   }
     * })
     * 
     */
    create<T extends AgentRunCreateArgs>(args: SelectSubset<T, AgentRunCreateArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AgentRuns.
     * @param {AgentRunCreateManyArgs} args - Arguments to create many AgentRuns.
     * @example
     * // Create many AgentRuns
     * const agentRun = await prisma.agentRun.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentRunCreateManyArgs>(args?: SelectSubset<T, AgentRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AgentRuns and returns the data saved in the database.
     * @param {AgentRunCreateManyAndReturnArgs} args - Arguments to create many AgentRuns.
     * @example
     * // Create many AgentRuns
     * const agentRun = await prisma.agentRun.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AgentRuns and only return the `id`
     * const agentRunWithIdOnly = await prisma.agentRun.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgentRunCreateManyAndReturnArgs>(args?: SelectSubset<T, AgentRunCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AgentRun.
     * @param {AgentRunDeleteArgs} args - Arguments to delete one AgentRun.
     * @example
     * // Delete one AgentRun
     * const AgentRun = await prisma.agentRun.delete({
     *   where: {
     *     // ... filter to delete one AgentRun
     *   }
     * })
     * 
     */
    delete<T extends AgentRunDeleteArgs>(args: SelectSubset<T, AgentRunDeleteArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AgentRun.
     * @param {AgentRunUpdateArgs} args - Arguments to update one AgentRun.
     * @example
     * // Update one AgentRun
     * const agentRun = await prisma.agentRun.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentRunUpdateArgs>(args: SelectSubset<T, AgentRunUpdateArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AgentRuns.
     * @param {AgentRunDeleteManyArgs} args - Arguments to filter AgentRuns to delete.
     * @example
     * // Delete a few AgentRuns
     * const { count } = await prisma.agentRun.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentRunDeleteManyArgs>(args?: SelectSubset<T, AgentRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AgentRuns
     * const agentRun = await prisma.agentRun.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentRunUpdateManyArgs>(args: SelectSubset<T, AgentRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentRuns and returns the data updated in the database.
     * @param {AgentRunUpdateManyAndReturnArgs} args - Arguments to update many AgentRuns.
     * @example
     * // Update many AgentRuns
     * const agentRun = await prisma.agentRun.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AgentRuns and only return the `id`
     * const agentRunWithIdOnly = await prisma.agentRun.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AgentRunUpdateManyAndReturnArgs>(args: SelectSubset<T, AgentRunUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AgentRun.
     * @param {AgentRunUpsertArgs} args - Arguments to update or create a AgentRun.
     * @example
     * // Update or create a AgentRun
     * const agentRun = await prisma.agentRun.upsert({
     *   create: {
     *     // ... data to create a AgentRun
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AgentRun we want to update
     *   }
     * })
     */
    upsert<T extends AgentRunUpsertArgs>(args: SelectSubset<T, AgentRunUpsertArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AgentRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCountArgs} args - Arguments to filter AgentRuns to count.
     * @example
     * // Count the number of AgentRuns
     * const count = await prisma.agentRun.count({
     *   where: {
     *     // ... the filter for the AgentRuns we want to count
     *   }
     * })
    **/
    count<T extends AgentRunCountArgs>(
      args?: Subset<T, AgentRunCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentRunCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AgentRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgentRunAggregateArgs>(args: Subset<T, AgentRunAggregateArgs>): Prisma.PrismaPromise<GetAgentRunAggregateType<T>>

    /**
     * Group by AgentRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgentRunGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentRunGroupByArgs['orderBy'] }
        : { orderBy?: AgentRunGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgentRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AgentRun model
   */
  readonly fields: AgentRunFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AgentRun.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentRunClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AgentRun model
   */
  interface AgentRunFieldRefs {
    readonly id: FieldRef<"AgentRun", 'String'>
    readonly userId: FieldRef<"AgentRun", 'String'>
    readonly task: FieldRef<"AgentRun", 'String'>
    readonly status: FieldRef<"AgentRun", 'AgentRunStatus'>
    readonly errorMsg: FieldRef<"AgentRun", 'String'>
    readonly llmProvider: FieldRef<"AgentRun", 'String'>
    readonly model: FieldRef<"AgentRun", 'String'>
    readonly inputTokens: FieldRef<"AgentRun", 'Int'>
    readonly outputTokens: FieldRef<"AgentRun", 'Int'>
    readonly latencyMs: FieldRef<"AgentRun", 'Int'>
    readonly costUsd: FieldRef<"AgentRun", 'Decimal'>
    readonly result: FieldRef<"AgentRun", 'Json'>
    readonly memoryIds: FieldRef<"AgentRun", 'String[]'>
    readonly createdAt: FieldRef<"AgentRun", 'DateTime'>
    readonly updatedAt: FieldRef<"AgentRun", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AgentRun findUnique
   */
  export type AgentRunFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun findUniqueOrThrow
   */
  export type AgentRunFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun findFirst
   */
  export type AgentRunFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentRuns.
     */
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun findFirstOrThrow
   */
  export type AgentRunFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentRuns.
     */
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun findMany
   */
  export type AgentRunFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRuns to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun create
   */
  export type AgentRunCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * The data needed to create a AgentRun.
     */
    data: XOR<AgentRunCreateInput, AgentRunUncheckedCreateInput>
  }

  /**
   * AgentRun createMany
   */
  export type AgentRunCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AgentRuns.
     */
    data: AgentRunCreateManyInput | AgentRunCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentRun createManyAndReturn
   */
  export type AgentRunCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * The data used to create many AgentRuns.
     */
    data: AgentRunCreateManyInput | AgentRunCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AgentRun update
   */
  export type AgentRunUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * The data needed to update a AgentRun.
     */
    data: XOR<AgentRunUpdateInput, AgentRunUncheckedUpdateInput>
    /**
     * Choose, which AgentRun to update.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun updateMany
   */
  export type AgentRunUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AgentRuns.
     */
    data: XOR<AgentRunUpdateManyMutationInput, AgentRunUncheckedUpdateManyInput>
    /**
     * Filter which AgentRuns to update
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to update.
     */
    limit?: number
  }

  /**
   * AgentRun updateManyAndReturn
   */
  export type AgentRunUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * The data used to update AgentRuns.
     */
    data: XOR<AgentRunUpdateManyMutationInput, AgentRunUncheckedUpdateManyInput>
    /**
     * Filter which AgentRuns to update
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AgentRun upsert
   */
  export type AgentRunUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * The filter to search for the AgentRun to update in case it exists.
     */
    where: AgentRunWhereUniqueInput
    /**
     * In case the AgentRun found by the `where` argument doesn't exist, create a new AgentRun with this data.
     */
    create: XOR<AgentRunCreateInput, AgentRunUncheckedCreateInput>
    /**
     * In case the AgentRun was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentRunUpdateInput, AgentRunUncheckedUpdateInput>
  }

  /**
   * AgentRun delete
   */
  export type AgentRunDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter which AgentRun to delete.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun deleteMany
   */
  export type AgentRunDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentRuns to delete
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to delete.
     */
    limit?: number
  }

  /**
   * AgentRun without action
   */
  export type AgentRunDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    userId: string | null
    action: string | null
    resource: string | null
    resourceId: string | null
    createdAt: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    action: string | null
    resource: string | null
    resourceId: string | null
    createdAt: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    userId: number
    action: number
    resource: number
    resourceId: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    resource?: true
    resourceId?: true
    createdAt?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    resource?: true
    resourceId?: true
    createdAt?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    resource?: true
    resourceId?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    userId: string
    action: string
    resource: string | null
    resourceId: string | null
    metadata: JsonValue | null
    createdAt: Date
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    action?: boolean
    resource?: boolean
    resourceId?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    action?: boolean
    resource?: boolean
    resourceId?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    action?: boolean
    resource?: boolean
    resourceId?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    userId?: boolean
    action?: boolean
    resource?: boolean
    resourceId?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type AuditLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "action" | "resource" | "resourceId" | "metadata" | "createdAt", ExtArgs["result"]["auditLog"]>
  export type AuditLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AuditLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AuditLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      action: string
      resource: string | null
      resourceId: string | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs and returns the data updated in the database.
     * @param {AuditLogUpdateManyAndReturnArgs} args - Arguments to update many AuditLogs.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuditLogUpdateManyAndReturnArgs>(args: SelectSubset<T, AuditLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly userId: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'String'>
    readonly resource: FieldRef<"AuditLog", 'String'>
    readonly resourceId: FieldRef<"AuditLog", 'String'>
    readonly metadata: FieldRef<"AuditLog", 'Json'>
    readonly createdAt: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog updateManyAndReturn
   */
  export type AuditLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    clerk_id: 'clerk_id',
    email: 'email',
    name: 'name',
    image: 'image',
    tier: 'tier',
    stripeCustomerId: 'stripeCustomerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SpaceScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    parentId: 'parentId',
    orgId: 'orgId',
    name: 'name',
    description: 'description',
    isScratchpad: 'isScratchpad',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type SpaceScalarFieldEnum = (typeof SpaceScalarFieldEnum)[keyof typeof SpaceScalarFieldEnum]


  export const MemoryScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    spaceId: 'spaceId',
    orgId: 'orgId',
    content: 'content',
    contentIv: 'contentIv',
    summary: 'summary',
    status: 'status',
    supersededBy: 'supersededBy',
    supersededAt: 'supersededAt',
    confidence: 'confidence',
    source: 'source',
    hint: 'hint',
    indexedAt: 'indexedAt',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type MemoryScalarFieldEnum = (typeof MemoryScalarFieldEnum)[keyof typeof MemoryScalarFieldEnum]


  export const MemoryTagScalarFieldEnum: {
    id: 'id',
    memoryId: 'memoryId',
    tag: 'tag',
    createdAt: 'createdAt'
  };

  export type MemoryTagScalarFieldEnum = (typeof MemoryTagScalarFieldEnum)[keyof typeof MemoryTagScalarFieldEnum]


  export const McpTokenScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    token: 'token',
    hashedToken: 'hashedToken',
    scope: 'scope',
    expiresAt: 'expiresAt',
    revokedAt: 'revokedAt',
    lastUsedAt: 'lastUsedAt',
    createdAt: 'createdAt'
  };

  export type McpTokenScalarFieldEnum = (typeof McpTokenScalarFieldEnum)[keyof typeof McpTokenScalarFieldEnum]


  export const AgentRunScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    task: 'task',
    status: 'status',
    errorMsg: 'errorMsg',
    llmProvider: 'llmProvider',
    model: 'model',
    inputTokens: 'inputTokens',
    outputTokens: 'outputTokens',
    latencyMs: 'latencyMs',
    costUsd: 'costUsd',
    result: 'result',
    memoryIds: 'memoryIds',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AgentRunScalarFieldEnum = (typeof AgentRunScalarFieldEnum)[keyof typeof AgentRunScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    action: 'action',
    resource: 'resource',
    resourceId: 'resourceId',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Bytes'
   */
  export type BytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes'>
    


  /**
   * Reference to a field of type 'Bytes[]'
   */
  export type ListBytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes[]'>
    


  /**
   * Reference to a field of type 'MemoryStatus'
   */
  export type EnumMemoryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MemoryStatus'>
    


  /**
   * Reference to a field of type 'MemoryStatus[]'
   */
  export type ListEnumMemoryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MemoryStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'MemorySource'
   */
  export type EnumMemorySourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MemorySource'>
    


  /**
   * Reference to a field of type 'MemorySource[]'
   */
  export type ListEnumMemorySourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MemorySource[]'>
    


  /**
   * Reference to a field of type 'TokenScope'
   */
  export type EnumTokenScopeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TokenScope'>
    


  /**
   * Reference to a field of type 'TokenScope[]'
   */
  export type ListEnumTokenScopeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TokenScope[]'>
    


  /**
   * Reference to a field of type 'AgentRunStatus'
   */
  export type EnumAgentRunStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AgentRunStatus'>
    


  /**
   * Reference to a field of type 'AgentRunStatus[]'
   */
  export type ListEnumAgentRunStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AgentRunStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    clerk_id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    image?: StringNullableFilter<"User"> | string | null
    tier?: StringFilter<"User"> | string
    stripeCustomerId?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    spaces?: SpaceListRelationFilter
    memories?: MemoryListRelationFilter
    mcpTokens?: McpTokenListRelationFilter
    agentRuns?: AgentRunListRelationFilter
    auditLogs?: AuditLogListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    clerk_id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    tier?: SortOrder
    stripeCustomerId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    spaces?: SpaceOrderByRelationAggregateInput
    memories?: MemoryOrderByRelationAggregateInput
    mcpTokens?: McpTokenOrderByRelationAggregateInput
    agentRuns?: AgentRunOrderByRelationAggregateInput
    auditLogs?: AuditLogOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    clerk_id?: string
    email?: string
    stripeCustomerId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    image?: StringNullableFilter<"User"> | string | null
    tier?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    spaces?: SpaceListRelationFilter
    memories?: MemoryListRelationFilter
    mcpTokens?: McpTokenListRelationFilter
    agentRuns?: AgentRunListRelationFilter
    auditLogs?: AuditLogListRelationFilter
  }, "id" | "clerk_id" | "email" | "stripeCustomerId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    clerk_id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    tier?: SortOrder
    stripeCustomerId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    clerk_id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    image?: StringNullableWithAggregatesFilter<"User"> | string | null
    tier?: StringWithAggregatesFilter<"User"> | string
    stripeCustomerId?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
  }

  export type SpaceWhereInput = {
    AND?: SpaceWhereInput | SpaceWhereInput[]
    OR?: SpaceWhereInput[]
    NOT?: SpaceWhereInput | SpaceWhereInput[]
    id?: StringFilter<"Space"> | string
    userId?: StringFilter<"Space"> | string
    parentId?: StringNullableFilter<"Space"> | string | null
    orgId?: StringNullableFilter<"Space"> | string | null
    name?: StringFilter<"Space"> | string
    description?: StringNullableFilter<"Space"> | string | null
    isScratchpad?: BoolFilter<"Space"> | boolean
    createdAt?: DateTimeFilter<"Space"> | Date | string
    updatedAt?: DateTimeFilter<"Space"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Space"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    parent?: XOR<SpaceNullableScalarRelationFilter, SpaceWhereInput> | null
    children?: SpaceListRelationFilter
    memories?: MemoryListRelationFilter
  }

  export type SpaceOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    parentId?: SortOrderInput | SortOrder
    orgId?: SortOrderInput | SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    isScratchpad?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    parent?: SpaceOrderByWithRelationInput
    children?: SpaceOrderByRelationAggregateInput
    memories?: MemoryOrderByRelationAggregateInput
  }

  export type SpaceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SpaceWhereInput | SpaceWhereInput[]
    OR?: SpaceWhereInput[]
    NOT?: SpaceWhereInput | SpaceWhereInput[]
    userId?: StringFilter<"Space"> | string
    parentId?: StringNullableFilter<"Space"> | string | null
    orgId?: StringNullableFilter<"Space"> | string | null
    name?: StringFilter<"Space"> | string
    description?: StringNullableFilter<"Space"> | string | null
    isScratchpad?: BoolFilter<"Space"> | boolean
    createdAt?: DateTimeFilter<"Space"> | Date | string
    updatedAt?: DateTimeFilter<"Space"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Space"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    parent?: XOR<SpaceNullableScalarRelationFilter, SpaceWhereInput> | null
    children?: SpaceListRelationFilter
    memories?: MemoryListRelationFilter
  }, "id">

  export type SpaceOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    parentId?: SortOrderInput | SortOrder
    orgId?: SortOrderInput | SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    isScratchpad?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: SpaceCountOrderByAggregateInput
    _max?: SpaceMaxOrderByAggregateInput
    _min?: SpaceMinOrderByAggregateInput
  }

  export type SpaceScalarWhereWithAggregatesInput = {
    AND?: SpaceScalarWhereWithAggregatesInput | SpaceScalarWhereWithAggregatesInput[]
    OR?: SpaceScalarWhereWithAggregatesInput[]
    NOT?: SpaceScalarWhereWithAggregatesInput | SpaceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Space"> | string
    userId?: StringWithAggregatesFilter<"Space"> | string
    parentId?: StringNullableWithAggregatesFilter<"Space"> | string | null
    orgId?: StringNullableWithAggregatesFilter<"Space"> | string | null
    name?: StringWithAggregatesFilter<"Space"> | string
    description?: StringNullableWithAggregatesFilter<"Space"> | string | null
    isScratchpad?: BoolWithAggregatesFilter<"Space"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Space"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Space"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Space"> | Date | string | null
  }

  export type MemoryWhereInput = {
    AND?: MemoryWhereInput | MemoryWhereInput[]
    OR?: MemoryWhereInput[]
    NOT?: MemoryWhereInput | MemoryWhereInput[]
    id?: UuidFilter<"Memory"> | string
    userId?: UuidFilter<"Memory"> | string
    spaceId?: UuidNullableFilter<"Memory"> | string | null
    orgId?: UuidNullableFilter<"Memory"> | string | null
    content?: BytesFilter<"Memory"> | Bytes
    contentIv?: BytesFilter<"Memory"> | Bytes
    summary?: StringNullableFilter<"Memory"> | string | null
    status?: EnumMemoryStatusFilter<"Memory"> | $Enums.MemoryStatus
    supersededBy?: UuidNullableFilter<"Memory"> | string | null
    supersededAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    confidence?: FloatNullableFilter<"Memory"> | number | null
    source?: EnumMemorySourceFilter<"Memory"> | $Enums.MemorySource
    hint?: StringNullableFilter<"Memory"> | string | null
    indexedAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    createdAt?: DateTimeFilter<"Memory"> | Date | string
    updatedAt?: DateTimeFilter<"Memory"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    space?: XOR<SpaceNullableScalarRelationFilter, SpaceWhereInput> | null
    tags?: MemoryTagListRelationFilter
  }

  export type MemoryOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    spaceId?: SortOrderInput | SortOrder
    orgId?: SortOrderInput | SortOrder
    content?: SortOrder
    contentIv?: SortOrder
    summary?: SortOrderInput | SortOrder
    status?: SortOrder
    supersededBy?: SortOrderInput | SortOrder
    supersededAt?: SortOrderInput | SortOrder
    confidence?: SortOrderInput | SortOrder
    source?: SortOrder
    hint?: SortOrderInput | SortOrder
    indexedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    space?: SpaceOrderByWithRelationInput
    tags?: MemoryTagOrderByRelationAggregateInput
  }

  export type MemoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MemoryWhereInput | MemoryWhereInput[]
    OR?: MemoryWhereInput[]
    NOT?: MemoryWhereInput | MemoryWhereInput[]
    userId?: UuidFilter<"Memory"> | string
    spaceId?: UuidNullableFilter<"Memory"> | string | null
    orgId?: UuidNullableFilter<"Memory"> | string | null
    content?: BytesFilter<"Memory"> | Bytes
    contentIv?: BytesFilter<"Memory"> | Bytes
    summary?: StringNullableFilter<"Memory"> | string | null
    status?: EnumMemoryStatusFilter<"Memory"> | $Enums.MemoryStatus
    supersededBy?: UuidNullableFilter<"Memory"> | string | null
    supersededAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    confidence?: FloatNullableFilter<"Memory"> | number | null
    source?: EnumMemorySourceFilter<"Memory"> | $Enums.MemorySource
    hint?: StringNullableFilter<"Memory"> | string | null
    indexedAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    createdAt?: DateTimeFilter<"Memory"> | Date | string
    updatedAt?: DateTimeFilter<"Memory"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    space?: XOR<SpaceNullableScalarRelationFilter, SpaceWhereInput> | null
    tags?: MemoryTagListRelationFilter
  }, "id">

  export type MemoryOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    spaceId?: SortOrderInput | SortOrder
    orgId?: SortOrderInput | SortOrder
    content?: SortOrder
    contentIv?: SortOrder
    summary?: SortOrderInput | SortOrder
    status?: SortOrder
    supersededBy?: SortOrderInput | SortOrder
    supersededAt?: SortOrderInput | SortOrder
    confidence?: SortOrderInput | SortOrder
    source?: SortOrder
    hint?: SortOrderInput | SortOrder
    indexedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: MemoryCountOrderByAggregateInput
    _avg?: MemoryAvgOrderByAggregateInput
    _max?: MemoryMaxOrderByAggregateInput
    _min?: MemoryMinOrderByAggregateInput
    _sum?: MemorySumOrderByAggregateInput
  }

  export type MemoryScalarWhereWithAggregatesInput = {
    AND?: MemoryScalarWhereWithAggregatesInput | MemoryScalarWhereWithAggregatesInput[]
    OR?: MemoryScalarWhereWithAggregatesInput[]
    NOT?: MemoryScalarWhereWithAggregatesInput | MemoryScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Memory"> | string
    userId?: UuidWithAggregatesFilter<"Memory"> | string
    spaceId?: UuidNullableWithAggregatesFilter<"Memory"> | string | null
    orgId?: UuidNullableWithAggregatesFilter<"Memory"> | string | null
    content?: BytesWithAggregatesFilter<"Memory"> | Bytes
    contentIv?: BytesWithAggregatesFilter<"Memory"> | Bytes
    summary?: StringNullableWithAggregatesFilter<"Memory"> | string | null
    status?: EnumMemoryStatusWithAggregatesFilter<"Memory"> | $Enums.MemoryStatus
    supersededBy?: UuidNullableWithAggregatesFilter<"Memory"> | string | null
    supersededAt?: DateTimeNullableWithAggregatesFilter<"Memory"> | Date | string | null
    confidence?: FloatNullableWithAggregatesFilter<"Memory"> | number | null
    source?: EnumMemorySourceWithAggregatesFilter<"Memory"> | $Enums.MemorySource
    hint?: StringNullableWithAggregatesFilter<"Memory"> | string | null
    indexedAt?: DateTimeNullableWithAggregatesFilter<"Memory"> | Date | string | null
    expiresAt?: DateTimeNullableWithAggregatesFilter<"Memory"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Memory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Memory"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Memory"> | Date | string | null
  }

  export type MemoryTagWhereInput = {
    AND?: MemoryTagWhereInput | MemoryTagWhereInput[]
    OR?: MemoryTagWhereInput[]
    NOT?: MemoryTagWhereInput | MemoryTagWhereInput[]
    id?: StringFilter<"MemoryTag"> | string
    memoryId?: StringFilter<"MemoryTag"> | string
    tag?: StringFilter<"MemoryTag"> | string
    createdAt?: DateTimeFilter<"MemoryTag"> | Date | string
    memory?: XOR<MemoryScalarRelationFilter, MemoryWhereInput>
  }

  export type MemoryTagOrderByWithRelationInput = {
    id?: SortOrder
    memoryId?: SortOrder
    tag?: SortOrder
    createdAt?: SortOrder
    memory?: MemoryOrderByWithRelationInput
  }

  export type MemoryTagWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    memoryId_tag?: MemoryTagMemoryIdTagCompoundUniqueInput
    AND?: MemoryTagWhereInput | MemoryTagWhereInput[]
    OR?: MemoryTagWhereInput[]
    NOT?: MemoryTagWhereInput | MemoryTagWhereInput[]
    memoryId?: StringFilter<"MemoryTag"> | string
    tag?: StringFilter<"MemoryTag"> | string
    createdAt?: DateTimeFilter<"MemoryTag"> | Date | string
    memory?: XOR<MemoryScalarRelationFilter, MemoryWhereInput>
  }, "id" | "memoryId_tag">

  export type MemoryTagOrderByWithAggregationInput = {
    id?: SortOrder
    memoryId?: SortOrder
    tag?: SortOrder
    createdAt?: SortOrder
    _count?: MemoryTagCountOrderByAggregateInput
    _max?: MemoryTagMaxOrderByAggregateInput
    _min?: MemoryTagMinOrderByAggregateInput
  }

  export type MemoryTagScalarWhereWithAggregatesInput = {
    AND?: MemoryTagScalarWhereWithAggregatesInput | MemoryTagScalarWhereWithAggregatesInput[]
    OR?: MemoryTagScalarWhereWithAggregatesInput[]
    NOT?: MemoryTagScalarWhereWithAggregatesInput | MemoryTagScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemoryTag"> | string
    memoryId?: StringWithAggregatesFilter<"MemoryTag"> | string
    tag?: StringWithAggregatesFilter<"MemoryTag"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MemoryTag"> | Date | string
  }

  export type McpTokenWhereInput = {
    AND?: McpTokenWhereInput | McpTokenWhereInput[]
    OR?: McpTokenWhereInput[]
    NOT?: McpTokenWhereInput | McpTokenWhereInput[]
    id?: StringFilter<"McpToken"> | string
    userId?: StringFilter<"McpToken"> | string
    token?: StringNullableFilter<"McpToken"> | string | null
    hashedToken?: StringFilter<"McpToken"> | string
    scope?: EnumTokenScopeFilter<"McpToken"> | $Enums.TokenScope
    expiresAt?: DateTimeNullableFilter<"McpToken"> | Date | string | null
    revokedAt?: DateTimeNullableFilter<"McpToken"> | Date | string | null
    lastUsedAt?: DateTimeNullableFilter<"McpToken"> | Date | string | null
    createdAt?: DateTimeFilter<"McpToken"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type McpTokenOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrderInput | SortOrder
    hashedToken?: SortOrder
    scope?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    revokedAt?: SortOrderInput | SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type McpTokenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: McpTokenWhereInput | McpTokenWhereInput[]
    OR?: McpTokenWhereInput[]
    NOT?: McpTokenWhereInput | McpTokenWhereInput[]
    userId?: StringFilter<"McpToken"> | string
    hashedToken?: StringFilter<"McpToken"> | string
    scope?: EnumTokenScopeFilter<"McpToken"> | $Enums.TokenScope
    expiresAt?: DateTimeNullableFilter<"McpToken"> | Date | string | null
    revokedAt?: DateTimeNullableFilter<"McpToken"> | Date | string | null
    lastUsedAt?: DateTimeNullableFilter<"McpToken"> | Date | string | null
    createdAt?: DateTimeFilter<"McpToken"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type McpTokenOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrderInput | SortOrder
    hashedToken?: SortOrder
    scope?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    revokedAt?: SortOrderInput | SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: McpTokenCountOrderByAggregateInput
    _max?: McpTokenMaxOrderByAggregateInput
    _min?: McpTokenMinOrderByAggregateInput
  }

  export type McpTokenScalarWhereWithAggregatesInput = {
    AND?: McpTokenScalarWhereWithAggregatesInput | McpTokenScalarWhereWithAggregatesInput[]
    OR?: McpTokenScalarWhereWithAggregatesInput[]
    NOT?: McpTokenScalarWhereWithAggregatesInput | McpTokenScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"McpToken"> | string
    userId?: StringWithAggregatesFilter<"McpToken"> | string
    token?: StringNullableWithAggregatesFilter<"McpToken"> | string | null
    hashedToken?: StringWithAggregatesFilter<"McpToken"> | string
    scope?: EnumTokenScopeWithAggregatesFilter<"McpToken"> | $Enums.TokenScope
    expiresAt?: DateTimeNullableWithAggregatesFilter<"McpToken"> | Date | string | null
    revokedAt?: DateTimeNullableWithAggregatesFilter<"McpToken"> | Date | string | null
    lastUsedAt?: DateTimeNullableWithAggregatesFilter<"McpToken"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"McpToken"> | Date | string
  }

  export type AgentRunWhereInput = {
    AND?: AgentRunWhereInput | AgentRunWhereInput[]
    OR?: AgentRunWhereInput[]
    NOT?: AgentRunWhereInput | AgentRunWhereInput[]
    id?: StringFilter<"AgentRun"> | string
    userId?: StringFilter<"AgentRun"> | string
    task?: StringFilter<"AgentRun"> | string
    status?: EnumAgentRunStatusFilter<"AgentRun"> | $Enums.AgentRunStatus
    errorMsg?: StringNullableFilter<"AgentRun"> | string | null
    llmProvider?: StringNullableFilter<"AgentRun"> | string | null
    model?: StringNullableFilter<"AgentRun"> | string | null
    inputTokens?: IntNullableFilter<"AgentRun"> | number | null
    outputTokens?: IntNullableFilter<"AgentRun"> | number | null
    latencyMs?: IntNullableFilter<"AgentRun"> | number | null
    costUsd?: DecimalNullableFilter<"AgentRun"> | Decimal | DecimalJsLike | number | string | null
    result?: JsonNullableFilter<"AgentRun">
    memoryIds?: StringNullableListFilter<"AgentRun">
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeFilter<"AgentRun"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AgentRunOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    task?: SortOrder
    status?: SortOrder
    errorMsg?: SortOrderInput | SortOrder
    llmProvider?: SortOrderInput | SortOrder
    model?: SortOrderInput | SortOrder
    inputTokens?: SortOrderInput | SortOrder
    outputTokens?: SortOrderInput | SortOrder
    latencyMs?: SortOrderInput | SortOrder
    costUsd?: SortOrderInput | SortOrder
    result?: SortOrderInput | SortOrder
    memoryIds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AgentRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AgentRunWhereInput | AgentRunWhereInput[]
    OR?: AgentRunWhereInput[]
    NOT?: AgentRunWhereInput | AgentRunWhereInput[]
    userId?: StringFilter<"AgentRun"> | string
    task?: StringFilter<"AgentRun"> | string
    status?: EnumAgentRunStatusFilter<"AgentRun"> | $Enums.AgentRunStatus
    errorMsg?: StringNullableFilter<"AgentRun"> | string | null
    llmProvider?: StringNullableFilter<"AgentRun"> | string | null
    model?: StringNullableFilter<"AgentRun"> | string | null
    inputTokens?: IntNullableFilter<"AgentRun"> | number | null
    outputTokens?: IntNullableFilter<"AgentRun"> | number | null
    latencyMs?: IntNullableFilter<"AgentRun"> | number | null
    costUsd?: DecimalNullableFilter<"AgentRun"> | Decimal | DecimalJsLike | number | string | null
    result?: JsonNullableFilter<"AgentRun">
    memoryIds?: StringNullableListFilter<"AgentRun">
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeFilter<"AgentRun"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type AgentRunOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    task?: SortOrder
    status?: SortOrder
    errorMsg?: SortOrderInput | SortOrder
    llmProvider?: SortOrderInput | SortOrder
    model?: SortOrderInput | SortOrder
    inputTokens?: SortOrderInput | SortOrder
    outputTokens?: SortOrderInput | SortOrder
    latencyMs?: SortOrderInput | SortOrder
    costUsd?: SortOrderInput | SortOrder
    result?: SortOrderInput | SortOrder
    memoryIds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AgentRunCountOrderByAggregateInput
    _avg?: AgentRunAvgOrderByAggregateInput
    _max?: AgentRunMaxOrderByAggregateInput
    _min?: AgentRunMinOrderByAggregateInput
    _sum?: AgentRunSumOrderByAggregateInput
  }

  export type AgentRunScalarWhereWithAggregatesInput = {
    AND?: AgentRunScalarWhereWithAggregatesInput | AgentRunScalarWhereWithAggregatesInput[]
    OR?: AgentRunScalarWhereWithAggregatesInput[]
    NOT?: AgentRunScalarWhereWithAggregatesInput | AgentRunScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AgentRun"> | string
    userId?: StringWithAggregatesFilter<"AgentRun"> | string
    task?: StringWithAggregatesFilter<"AgentRun"> | string
    status?: EnumAgentRunStatusWithAggregatesFilter<"AgentRun"> | $Enums.AgentRunStatus
    errorMsg?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    llmProvider?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    model?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    inputTokens?: IntNullableWithAggregatesFilter<"AgentRun"> | number | null
    outputTokens?: IntNullableWithAggregatesFilter<"AgentRun"> | number | null
    latencyMs?: IntNullableWithAggregatesFilter<"AgentRun"> | number | null
    costUsd?: DecimalNullableWithAggregatesFilter<"AgentRun"> | Decimal | DecimalJsLike | number | string | null
    result?: JsonNullableWithAggregatesFilter<"AgentRun">
    memoryIds?: StringNullableListFilter<"AgentRun">
    createdAt?: DateTimeWithAggregatesFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AgentRun"> | Date | string
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    userId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    resource?: StringNullableFilter<"AuditLog"> | string | null
    resourceId?: StringNullableFilter<"AuditLog"> | string | null
    metadata?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    resource?: SortOrderInput | SortOrder
    resourceId?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    userId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    resource?: StringNullableFilter<"AuditLog"> | string | null
    resourceId?: StringNullableFilter<"AuditLog"> | string | null
    metadata?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    resource?: SortOrderInput | SortOrder
    resourceId?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditLog"> | string
    userId?: StringWithAggregatesFilter<"AuditLog"> | string
    action?: StringWithAggregatesFilter<"AuditLog"> | string
    resource?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    resourceId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"AuditLog">
    createdAt?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    spaces?: SpaceCreateNestedManyWithoutUserInput
    memories?: MemoryCreateNestedManyWithoutUserInput
    mcpTokens?: McpTokenCreateNestedManyWithoutUserInput
    agentRuns?: AgentRunCreateNestedManyWithoutUserInput
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    spaces?: SpaceUncheckedCreateNestedManyWithoutUserInput
    memories?: MemoryUncheckedCreateNestedManyWithoutUserInput
    mcpTokens?: McpTokenUncheckedCreateNestedManyWithoutUserInput
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutUserInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spaces?: SpaceUpdateManyWithoutUserNestedInput
    memories?: MemoryUpdateManyWithoutUserNestedInput
    mcpTokens?: McpTokenUpdateManyWithoutUserNestedInput
    agentRuns?: AgentRunUpdateManyWithoutUserNestedInput
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spaces?: SpaceUncheckedUpdateManyWithoutUserNestedInput
    memories?: MemoryUncheckedUpdateManyWithoutUserNestedInput
    mcpTokens?: McpTokenUncheckedUpdateManyWithoutUserNestedInput
    agentRuns?: AgentRunUncheckedUpdateManyWithoutUserNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SpaceCreateInput = {
    id?: string
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    user: UserCreateNestedOneWithoutSpacesInput
    parent?: SpaceCreateNestedOneWithoutChildrenInput
    children?: SpaceCreateNestedManyWithoutParentInput
    memories?: MemoryCreateNestedManyWithoutSpaceInput
  }

  export type SpaceUncheckedCreateInput = {
    id?: string
    userId: string
    parentId?: string | null
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    children?: SpaceUncheckedCreateNestedManyWithoutParentInput
    memories?: MemoryUncheckedCreateNestedManyWithoutSpaceInput
  }

  export type SpaceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutSpacesNestedInput
    parent?: SpaceUpdateOneWithoutChildrenNestedInput
    children?: SpaceUpdateManyWithoutParentNestedInput
    memories?: MemoryUpdateManyWithoutSpaceNestedInput
  }

  export type SpaceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: SpaceUncheckedUpdateManyWithoutParentNestedInput
    memories?: MemoryUncheckedUpdateManyWithoutSpaceNestedInput
  }

  export type SpaceCreateManyInput = {
    id?: string
    userId: string
    parentId?: string | null
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type SpaceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SpaceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MemoryCreateInput = {
    id?: string
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    user: UserCreateNestedOneWithoutMemoriesInput
    space?: SpaceCreateNestedOneWithoutMemoriesInput
    tags?: MemoryTagCreateNestedManyWithoutMemoryInput
  }

  export type MemoryUncheckedCreateInput = {
    id?: string
    userId: string
    spaceId?: string | null
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    tags?: MemoryTagUncheckedCreateNestedManyWithoutMemoryInput
  }

  export type MemoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutMemoriesNestedInput
    space?: SpaceUpdateOneWithoutMemoriesNestedInput
    tags?: MemoryTagUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    spaceId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tags?: MemoryTagUncheckedUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryCreateManyInput = {
    id?: string
    userId: string
    spaceId?: string | null
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type MemoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MemoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    spaceId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MemoryTagCreateInput = {
    id?: string
    tag: string
    createdAt?: Date | string
    memory: MemoryCreateNestedOneWithoutTagsInput
  }

  export type MemoryTagUncheckedCreateInput = {
    id?: string
    memoryId: string
    tag: string
    createdAt?: Date | string
  }

  export type MemoryTagUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memory?: MemoryUpdateOneRequiredWithoutTagsNestedInput
  }

  export type MemoryTagUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    memoryId?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryTagCreateManyInput = {
    id?: string
    memoryId: string
    tag: string
    createdAt?: Date | string
  }

  export type MemoryTagUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryTagUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    memoryId?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type McpTokenCreateInput = {
    id?: string
    token?: string | null
    hashedToken: string
    scope?: $Enums.TokenScope
    expiresAt?: Date | string | null
    revokedAt?: Date | string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutMcpTokensInput
  }

  export type McpTokenUncheckedCreateInput = {
    id?: string
    userId: string
    token?: string | null
    hashedToken: string
    scope?: $Enums.TokenScope
    expiresAt?: Date | string | null
    revokedAt?: Date | string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type McpTokenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    hashedToken?: StringFieldUpdateOperationsInput | string
    scope?: EnumTokenScopeFieldUpdateOperationsInput | $Enums.TokenScope
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMcpTokensNestedInput
  }

  export type McpTokenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    hashedToken?: StringFieldUpdateOperationsInput | string
    scope?: EnumTokenScopeFieldUpdateOperationsInput | $Enums.TokenScope
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type McpTokenCreateManyInput = {
    id?: string
    userId: string
    token?: string | null
    hashedToken: string
    scope?: $Enums.TokenScope
    expiresAt?: Date | string | null
    revokedAt?: Date | string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type McpTokenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    hashedToken?: StringFieldUpdateOperationsInput | string
    scope?: EnumTokenScopeFieldUpdateOperationsInput | $Enums.TokenScope
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type McpTokenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    hashedToken?: StringFieldUpdateOperationsInput | string
    scope?: EnumTokenScopeFieldUpdateOperationsInput | $Enums.TokenScope
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCreateInput = {
    id?: string
    task: string
    status?: $Enums.AgentRunStatus
    errorMsg?: string | null
    llmProvider?: string | null
    model?: string | null
    inputTokens?: number | null
    outputTokens?: number | null
    latencyMs?: number | null
    costUsd?: Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunCreatememoryIdsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutAgentRunsInput
  }

  export type AgentRunUncheckedCreateInput = {
    id?: string
    userId: string
    task: string
    status?: $Enums.AgentRunStatus
    errorMsg?: string | null
    llmProvider?: string | null
    model?: string | null
    inputTokens?: number | null
    outputTokens?: number | null
    latencyMs?: number | null
    costUsd?: Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunCreatememoryIdsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    llmProvider?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    outputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    costUsd?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunUpdatememoryIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAgentRunsNestedInput
  }

  export type AgentRunUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    llmProvider?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    outputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    costUsd?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunUpdatememoryIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCreateManyInput = {
    id?: string
    userId: string
    task: string
    status?: $Enums.AgentRunStatus
    errorMsg?: string | null
    llmProvider?: string | null
    model?: string | null
    inputTokens?: number | null
    outputTokens?: number | null
    latencyMs?: number | null
    costUsd?: Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunCreatememoryIdsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    llmProvider?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    outputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    costUsd?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunUpdatememoryIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    llmProvider?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    outputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    costUsd?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunUpdatememoryIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateInput = {
    id?: string
    action: string
    resource?: string | null
    resourceId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutAuditLogsInput
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    userId: string
    action: string
    resource?: string | null
    resourceId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAuditLogsNestedInput
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id?: string
    userId: string
    action: string
    resource?: string | null
    resourceId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SpaceListRelationFilter = {
    every?: SpaceWhereInput
    some?: SpaceWhereInput
    none?: SpaceWhereInput
  }

  export type MemoryListRelationFilter = {
    every?: MemoryWhereInput
    some?: MemoryWhereInput
    none?: MemoryWhereInput
  }

  export type McpTokenListRelationFilter = {
    every?: McpTokenWhereInput
    some?: McpTokenWhereInput
    none?: McpTokenWhereInput
  }

  export type AgentRunListRelationFilter = {
    every?: AgentRunWhereInput
    some?: AgentRunWhereInput
    none?: AgentRunWhereInput
  }

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput
    some?: AuditLogWhereInput
    none?: AuditLogWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SpaceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type McpTokenOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgentRunOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    clerk_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    image?: SortOrder
    tier?: SortOrder
    stripeCustomerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    clerk_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    image?: SortOrder
    tier?: SortOrder
    stripeCustomerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    clerk_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    image?: SortOrder
    tier?: SortOrder
    stripeCustomerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SpaceNullableScalarRelationFilter = {
    is?: SpaceWhereInput | null
    isNot?: SpaceWhereInput | null
  }

  export type SpaceCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    parentId?: SortOrder
    orgId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    isScratchpad?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type SpaceMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    parentId?: SortOrder
    orgId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    isScratchpad?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type SpaceMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    parentId?: SortOrder
    orgId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    isScratchpad?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type BytesFilter<$PrismaModel = never> = {
    equals?: Bytes | BytesFieldRefInput<$PrismaModel>
    in?: Bytes[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Bytes[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesFilter<$PrismaModel> | Bytes
  }

  export type EnumMemoryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryStatus | EnumMemoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryStatus[] | ListEnumMemoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemoryStatus[] | ListEnumMemoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMemoryStatusFilter<$PrismaModel> | $Enums.MemoryStatus
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type EnumMemorySourceFilter<$PrismaModel = never> = {
    equals?: $Enums.MemorySource | EnumMemorySourceFieldRefInput<$PrismaModel>
    in?: $Enums.MemorySource[] | ListEnumMemorySourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemorySource[] | ListEnumMemorySourceFieldRefInput<$PrismaModel>
    not?: NestedEnumMemorySourceFilter<$PrismaModel> | $Enums.MemorySource
  }

  export type MemoryTagListRelationFilter = {
    every?: MemoryTagWhereInput
    some?: MemoryTagWhereInput
    none?: MemoryTagWhereInput
  }

  export type MemoryTagOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemoryCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    spaceId?: SortOrder
    orgId?: SortOrder
    content?: SortOrder
    contentIv?: SortOrder
    summary?: SortOrder
    status?: SortOrder
    supersededBy?: SortOrder
    supersededAt?: SortOrder
    confidence?: SortOrder
    source?: SortOrder
    hint?: SortOrder
    indexedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type MemoryAvgOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type MemoryMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    spaceId?: SortOrder
    orgId?: SortOrder
    content?: SortOrder
    contentIv?: SortOrder
    summary?: SortOrder
    status?: SortOrder
    supersededBy?: SortOrder
    supersededAt?: SortOrder
    confidence?: SortOrder
    source?: SortOrder
    hint?: SortOrder
    indexedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type MemoryMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    spaceId?: SortOrder
    orgId?: SortOrder
    content?: SortOrder
    contentIv?: SortOrder
    summary?: SortOrder
    status?: SortOrder
    supersededBy?: SortOrder
    supersededAt?: SortOrder
    confidence?: SortOrder
    source?: SortOrder
    hint?: SortOrder
    indexedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type MemorySumOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BytesWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Bytes | BytesFieldRefInput<$PrismaModel>
    in?: Bytes[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Bytes[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesWithAggregatesFilter<$PrismaModel> | Bytes
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBytesFilter<$PrismaModel>
    _max?: NestedBytesFilter<$PrismaModel>
  }

  export type EnumMemoryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryStatus | EnumMemoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryStatus[] | ListEnumMemoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemoryStatus[] | ListEnumMemoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMemoryStatusWithAggregatesFilter<$PrismaModel> | $Enums.MemoryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMemoryStatusFilter<$PrismaModel>
    _max?: NestedEnumMemoryStatusFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumMemorySourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MemorySource | EnumMemorySourceFieldRefInput<$PrismaModel>
    in?: $Enums.MemorySource[] | ListEnumMemorySourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemorySource[] | ListEnumMemorySourceFieldRefInput<$PrismaModel>
    not?: NestedEnumMemorySourceWithAggregatesFilter<$PrismaModel> | $Enums.MemorySource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMemorySourceFilter<$PrismaModel>
    _max?: NestedEnumMemorySourceFilter<$PrismaModel>
  }

  export type MemoryScalarRelationFilter = {
    is?: MemoryWhereInput
    isNot?: MemoryWhereInput
  }

  export type MemoryTagMemoryIdTagCompoundUniqueInput = {
    memoryId: string
    tag: string
  }

  export type MemoryTagCountOrderByAggregateInput = {
    id?: SortOrder
    memoryId?: SortOrder
    tag?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryTagMaxOrderByAggregateInput = {
    id?: SortOrder
    memoryId?: SortOrder
    tag?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryTagMinOrderByAggregateInput = {
    id?: SortOrder
    memoryId?: SortOrder
    tag?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumTokenScopeFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenScope | EnumTokenScopeFieldRefInput<$PrismaModel>
    in?: $Enums.TokenScope[] | ListEnumTokenScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenScope[] | ListEnumTokenScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenScopeFilter<$PrismaModel> | $Enums.TokenScope
  }

  export type McpTokenCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    hashedToken?: SortOrder
    scope?: SortOrder
    expiresAt?: SortOrder
    revokedAt?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type McpTokenMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    hashedToken?: SortOrder
    scope?: SortOrder
    expiresAt?: SortOrder
    revokedAt?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type McpTokenMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    hashedToken?: SortOrder
    scope?: SortOrder
    expiresAt?: SortOrder
    revokedAt?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumTokenScopeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenScope | EnumTokenScopeFieldRefInput<$PrismaModel>
    in?: $Enums.TokenScope[] | ListEnumTokenScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenScope[] | ListEnumTokenScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenScopeWithAggregatesFilter<$PrismaModel> | $Enums.TokenScope
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTokenScopeFilter<$PrismaModel>
    _max?: NestedEnumTokenScopeFilter<$PrismaModel>
  }

  export type EnumAgentRunStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentRunStatus | EnumAgentRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAgentRunStatusFilter<$PrismaModel> | $Enums.AgentRunStatus
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type AgentRunCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    task?: SortOrder
    status?: SortOrder
    errorMsg?: SortOrder
    llmProvider?: SortOrder
    model?: SortOrder
    inputTokens?: SortOrder
    outputTokens?: SortOrder
    latencyMs?: SortOrder
    costUsd?: SortOrder
    result?: SortOrder
    memoryIds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentRunAvgOrderByAggregateInput = {
    inputTokens?: SortOrder
    outputTokens?: SortOrder
    latencyMs?: SortOrder
    costUsd?: SortOrder
  }

  export type AgentRunMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    task?: SortOrder
    status?: SortOrder
    errorMsg?: SortOrder
    llmProvider?: SortOrder
    model?: SortOrder
    inputTokens?: SortOrder
    outputTokens?: SortOrder
    latencyMs?: SortOrder
    costUsd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentRunMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    task?: SortOrder
    status?: SortOrder
    errorMsg?: SortOrder
    llmProvider?: SortOrder
    model?: SortOrder
    inputTokens?: SortOrder
    outputTokens?: SortOrder
    latencyMs?: SortOrder
    costUsd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentRunSumOrderByAggregateInput = {
    inputTokens?: SortOrder
    outputTokens?: SortOrder
    latencyMs?: SortOrder
    costUsd?: SortOrder
  }

  export type EnumAgentRunStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentRunStatus | EnumAgentRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAgentRunStatusWithAggregatesFilter<$PrismaModel> | $Enums.AgentRunStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAgentRunStatusFilter<$PrismaModel>
    _max?: NestedEnumAgentRunStatusFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    resourceId?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    resourceId?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    resourceId?: SortOrder
    createdAt?: SortOrder
  }

  export type SpaceCreateNestedManyWithoutUserInput = {
    create?: XOR<SpaceCreateWithoutUserInput, SpaceUncheckedCreateWithoutUserInput> | SpaceCreateWithoutUserInput[] | SpaceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SpaceCreateOrConnectWithoutUserInput | SpaceCreateOrConnectWithoutUserInput[]
    createMany?: SpaceCreateManyUserInputEnvelope
    connect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
  }

  export type MemoryCreateNestedManyWithoutUserInput = {
    create?: XOR<MemoryCreateWithoutUserInput, MemoryUncheckedCreateWithoutUserInput> | MemoryCreateWithoutUserInput[] | MemoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutUserInput | MemoryCreateOrConnectWithoutUserInput[]
    createMany?: MemoryCreateManyUserInputEnvelope
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
  }

  export type McpTokenCreateNestedManyWithoutUserInput = {
    create?: XOR<McpTokenCreateWithoutUserInput, McpTokenUncheckedCreateWithoutUserInput> | McpTokenCreateWithoutUserInput[] | McpTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: McpTokenCreateOrConnectWithoutUserInput | McpTokenCreateOrConnectWithoutUserInput[]
    createMany?: McpTokenCreateManyUserInputEnvelope
    connect?: McpTokenWhereUniqueInput | McpTokenWhereUniqueInput[]
  }

  export type AgentRunCreateNestedManyWithoutUserInput = {
    create?: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput> | AgentRunCreateWithoutUserInput[] | AgentRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutUserInput | AgentRunCreateOrConnectWithoutUserInput[]
    createMany?: AgentRunCreateManyUserInputEnvelope
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
  }

  export type AuditLogCreateNestedManyWithoutUserInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type SpaceUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SpaceCreateWithoutUserInput, SpaceUncheckedCreateWithoutUserInput> | SpaceCreateWithoutUserInput[] | SpaceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SpaceCreateOrConnectWithoutUserInput | SpaceCreateOrConnectWithoutUserInput[]
    createMany?: SpaceCreateManyUserInputEnvelope
    connect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
  }

  export type MemoryUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MemoryCreateWithoutUserInput, MemoryUncheckedCreateWithoutUserInput> | MemoryCreateWithoutUserInput[] | MemoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutUserInput | MemoryCreateOrConnectWithoutUserInput[]
    createMany?: MemoryCreateManyUserInputEnvelope
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
  }

  export type McpTokenUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<McpTokenCreateWithoutUserInput, McpTokenUncheckedCreateWithoutUserInput> | McpTokenCreateWithoutUserInput[] | McpTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: McpTokenCreateOrConnectWithoutUserInput | McpTokenCreateOrConnectWithoutUserInput[]
    createMany?: McpTokenCreateManyUserInputEnvelope
    connect?: McpTokenWhereUniqueInput | McpTokenWhereUniqueInput[]
  }

  export type AgentRunUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput> | AgentRunCreateWithoutUserInput[] | AgentRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutUserInput | AgentRunCreateOrConnectWithoutUserInput[]
    createMany?: AgentRunCreateManyUserInputEnvelope
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
  }

  export type AuditLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type SpaceUpdateManyWithoutUserNestedInput = {
    create?: XOR<SpaceCreateWithoutUserInput, SpaceUncheckedCreateWithoutUserInput> | SpaceCreateWithoutUserInput[] | SpaceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SpaceCreateOrConnectWithoutUserInput | SpaceCreateOrConnectWithoutUserInput[]
    upsert?: SpaceUpsertWithWhereUniqueWithoutUserInput | SpaceUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SpaceCreateManyUserInputEnvelope
    set?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    disconnect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    delete?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    connect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    update?: SpaceUpdateWithWhereUniqueWithoutUserInput | SpaceUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SpaceUpdateManyWithWhereWithoutUserInput | SpaceUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SpaceScalarWhereInput | SpaceScalarWhereInput[]
  }

  export type MemoryUpdateManyWithoutUserNestedInput = {
    create?: XOR<MemoryCreateWithoutUserInput, MemoryUncheckedCreateWithoutUserInput> | MemoryCreateWithoutUserInput[] | MemoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutUserInput | MemoryCreateOrConnectWithoutUserInput[]
    upsert?: MemoryUpsertWithWhereUniqueWithoutUserInput | MemoryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MemoryCreateManyUserInputEnvelope
    set?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    disconnect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    delete?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    update?: MemoryUpdateWithWhereUniqueWithoutUserInput | MemoryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MemoryUpdateManyWithWhereWithoutUserInput | MemoryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MemoryScalarWhereInput | MemoryScalarWhereInput[]
  }

  export type McpTokenUpdateManyWithoutUserNestedInput = {
    create?: XOR<McpTokenCreateWithoutUserInput, McpTokenUncheckedCreateWithoutUserInput> | McpTokenCreateWithoutUserInput[] | McpTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: McpTokenCreateOrConnectWithoutUserInput | McpTokenCreateOrConnectWithoutUserInput[]
    upsert?: McpTokenUpsertWithWhereUniqueWithoutUserInput | McpTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: McpTokenCreateManyUserInputEnvelope
    set?: McpTokenWhereUniqueInput | McpTokenWhereUniqueInput[]
    disconnect?: McpTokenWhereUniqueInput | McpTokenWhereUniqueInput[]
    delete?: McpTokenWhereUniqueInput | McpTokenWhereUniqueInput[]
    connect?: McpTokenWhereUniqueInput | McpTokenWhereUniqueInput[]
    update?: McpTokenUpdateWithWhereUniqueWithoutUserInput | McpTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: McpTokenUpdateManyWithWhereWithoutUserInput | McpTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: McpTokenScalarWhereInput | McpTokenScalarWhereInput[]
  }

  export type AgentRunUpdateManyWithoutUserNestedInput = {
    create?: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput> | AgentRunCreateWithoutUserInput[] | AgentRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutUserInput | AgentRunCreateOrConnectWithoutUserInput[]
    upsert?: AgentRunUpsertWithWhereUniqueWithoutUserInput | AgentRunUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AgentRunCreateManyUserInputEnvelope
    set?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    disconnect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    delete?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    update?: AgentRunUpdateWithWhereUniqueWithoutUserInput | AgentRunUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AgentRunUpdateManyWithWhereWithoutUserInput | AgentRunUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
  }

  export type AuditLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutUserInput | AuditLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutUserInput | AuditLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutUserInput | AuditLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type SpaceUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SpaceCreateWithoutUserInput, SpaceUncheckedCreateWithoutUserInput> | SpaceCreateWithoutUserInput[] | SpaceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SpaceCreateOrConnectWithoutUserInput | SpaceCreateOrConnectWithoutUserInput[]
    upsert?: SpaceUpsertWithWhereUniqueWithoutUserInput | SpaceUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SpaceCreateManyUserInputEnvelope
    set?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    disconnect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    delete?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    connect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    update?: SpaceUpdateWithWhereUniqueWithoutUserInput | SpaceUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SpaceUpdateManyWithWhereWithoutUserInput | SpaceUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SpaceScalarWhereInput | SpaceScalarWhereInput[]
  }

  export type MemoryUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MemoryCreateWithoutUserInput, MemoryUncheckedCreateWithoutUserInput> | MemoryCreateWithoutUserInput[] | MemoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutUserInput | MemoryCreateOrConnectWithoutUserInput[]
    upsert?: MemoryUpsertWithWhereUniqueWithoutUserInput | MemoryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MemoryCreateManyUserInputEnvelope
    set?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    disconnect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    delete?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    update?: MemoryUpdateWithWhereUniqueWithoutUserInput | MemoryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MemoryUpdateManyWithWhereWithoutUserInput | MemoryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MemoryScalarWhereInput | MemoryScalarWhereInput[]
  }

  export type McpTokenUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<McpTokenCreateWithoutUserInput, McpTokenUncheckedCreateWithoutUserInput> | McpTokenCreateWithoutUserInput[] | McpTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: McpTokenCreateOrConnectWithoutUserInput | McpTokenCreateOrConnectWithoutUserInput[]
    upsert?: McpTokenUpsertWithWhereUniqueWithoutUserInput | McpTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: McpTokenCreateManyUserInputEnvelope
    set?: McpTokenWhereUniqueInput | McpTokenWhereUniqueInput[]
    disconnect?: McpTokenWhereUniqueInput | McpTokenWhereUniqueInput[]
    delete?: McpTokenWhereUniqueInput | McpTokenWhereUniqueInput[]
    connect?: McpTokenWhereUniqueInput | McpTokenWhereUniqueInput[]
    update?: McpTokenUpdateWithWhereUniqueWithoutUserInput | McpTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: McpTokenUpdateManyWithWhereWithoutUserInput | McpTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: McpTokenScalarWhereInput | McpTokenScalarWhereInput[]
  }

  export type AgentRunUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput> | AgentRunCreateWithoutUserInput[] | AgentRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutUserInput | AgentRunCreateOrConnectWithoutUserInput[]
    upsert?: AgentRunUpsertWithWhereUniqueWithoutUserInput | AgentRunUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AgentRunCreateManyUserInputEnvelope
    set?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    disconnect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    delete?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    update?: AgentRunUpdateWithWhereUniqueWithoutUserInput | AgentRunUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AgentRunUpdateManyWithWhereWithoutUserInput | AgentRunUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
  }

  export type AuditLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutUserInput | AuditLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutUserInput | AuditLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutUserInput | AuditLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutSpacesInput = {
    create?: XOR<UserCreateWithoutSpacesInput, UserUncheckedCreateWithoutSpacesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSpacesInput
    connect?: UserWhereUniqueInput
  }

  export type SpaceCreateNestedOneWithoutChildrenInput = {
    create?: XOR<SpaceCreateWithoutChildrenInput, SpaceUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: SpaceCreateOrConnectWithoutChildrenInput
    connect?: SpaceWhereUniqueInput
  }

  export type SpaceCreateNestedManyWithoutParentInput = {
    create?: XOR<SpaceCreateWithoutParentInput, SpaceUncheckedCreateWithoutParentInput> | SpaceCreateWithoutParentInput[] | SpaceUncheckedCreateWithoutParentInput[]
    connectOrCreate?: SpaceCreateOrConnectWithoutParentInput | SpaceCreateOrConnectWithoutParentInput[]
    createMany?: SpaceCreateManyParentInputEnvelope
    connect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
  }

  export type MemoryCreateNestedManyWithoutSpaceInput = {
    create?: XOR<MemoryCreateWithoutSpaceInput, MemoryUncheckedCreateWithoutSpaceInput> | MemoryCreateWithoutSpaceInput[] | MemoryUncheckedCreateWithoutSpaceInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutSpaceInput | MemoryCreateOrConnectWithoutSpaceInput[]
    createMany?: MemoryCreateManySpaceInputEnvelope
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
  }

  export type SpaceUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<SpaceCreateWithoutParentInput, SpaceUncheckedCreateWithoutParentInput> | SpaceCreateWithoutParentInput[] | SpaceUncheckedCreateWithoutParentInput[]
    connectOrCreate?: SpaceCreateOrConnectWithoutParentInput | SpaceCreateOrConnectWithoutParentInput[]
    createMany?: SpaceCreateManyParentInputEnvelope
    connect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
  }

  export type MemoryUncheckedCreateNestedManyWithoutSpaceInput = {
    create?: XOR<MemoryCreateWithoutSpaceInput, MemoryUncheckedCreateWithoutSpaceInput> | MemoryCreateWithoutSpaceInput[] | MemoryUncheckedCreateWithoutSpaceInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutSpaceInput | MemoryCreateOrConnectWithoutSpaceInput[]
    createMany?: MemoryCreateManySpaceInputEnvelope
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutSpacesNestedInput = {
    create?: XOR<UserCreateWithoutSpacesInput, UserUncheckedCreateWithoutSpacesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSpacesInput
    upsert?: UserUpsertWithoutSpacesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSpacesInput, UserUpdateWithoutSpacesInput>, UserUncheckedUpdateWithoutSpacesInput>
  }

  export type SpaceUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<SpaceCreateWithoutChildrenInput, SpaceUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: SpaceCreateOrConnectWithoutChildrenInput
    upsert?: SpaceUpsertWithoutChildrenInput
    disconnect?: SpaceWhereInput | boolean
    delete?: SpaceWhereInput | boolean
    connect?: SpaceWhereUniqueInput
    update?: XOR<XOR<SpaceUpdateToOneWithWhereWithoutChildrenInput, SpaceUpdateWithoutChildrenInput>, SpaceUncheckedUpdateWithoutChildrenInput>
  }

  export type SpaceUpdateManyWithoutParentNestedInput = {
    create?: XOR<SpaceCreateWithoutParentInput, SpaceUncheckedCreateWithoutParentInput> | SpaceCreateWithoutParentInput[] | SpaceUncheckedCreateWithoutParentInput[]
    connectOrCreate?: SpaceCreateOrConnectWithoutParentInput | SpaceCreateOrConnectWithoutParentInput[]
    upsert?: SpaceUpsertWithWhereUniqueWithoutParentInput | SpaceUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: SpaceCreateManyParentInputEnvelope
    set?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    disconnect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    delete?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    connect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    update?: SpaceUpdateWithWhereUniqueWithoutParentInput | SpaceUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: SpaceUpdateManyWithWhereWithoutParentInput | SpaceUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: SpaceScalarWhereInput | SpaceScalarWhereInput[]
  }

  export type MemoryUpdateManyWithoutSpaceNestedInput = {
    create?: XOR<MemoryCreateWithoutSpaceInput, MemoryUncheckedCreateWithoutSpaceInput> | MemoryCreateWithoutSpaceInput[] | MemoryUncheckedCreateWithoutSpaceInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutSpaceInput | MemoryCreateOrConnectWithoutSpaceInput[]
    upsert?: MemoryUpsertWithWhereUniqueWithoutSpaceInput | MemoryUpsertWithWhereUniqueWithoutSpaceInput[]
    createMany?: MemoryCreateManySpaceInputEnvelope
    set?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    disconnect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    delete?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    update?: MemoryUpdateWithWhereUniqueWithoutSpaceInput | MemoryUpdateWithWhereUniqueWithoutSpaceInput[]
    updateMany?: MemoryUpdateManyWithWhereWithoutSpaceInput | MemoryUpdateManyWithWhereWithoutSpaceInput[]
    deleteMany?: MemoryScalarWhereInput | MemoryScalarWhereInput[]
  }

  export type SpaceUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<SpaceCreateWithoutParentInput, SpaceUncheckedCreateWithoutParentInput> | SpaceCreateWithoutParentInput[] | SpaceUncheckedCreateWithoutParentInput[]
    connectOrCreate?: SpaceCreateOrConnectWithoutParentInput | SpaceCreateOrConnectWithoutParentInput[]
    upsert?: SpaceUpsertWithWhereUniqueWithoutParentInput | SpaceUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: SpaceCreateManyParentInputEnvelope
    set?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    disconnect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    delete?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    connect?: SpaceWhereUniqueInput | SpaceWhereUniqueInput[]
    update?: SpaceUpdateWithWhereUniqueWithoutParentInput | SpaceUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: SpaceUpdateManyWithWhereWithoutParentInput | SpaceUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: SpaceScalarWhereInput | SpaceScalarWhereInput[]
  }

  export type MemoryUncheckedUpdateManyWithoutSpaceNestedInput = {
    create?: XOR<MemoryCreateWithoutSpaceInput, MemoryUncheckedCreateWithoutSpaceInput> | MemoryCreateWithoutSpaceInput[] | MemoryUncheckedCreateWithoutSpaceInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutSpaceInput | MemoryCreateOrConnectWithoutSpaceInput[]
    upsert?: MemoryUpsertWithWhereUniqueWithoutSpaceInput | MemoryUpsertWithWhereUniqueWithoutSpaceInput[]
    createMany?: MemoryCreateManySpaceInputEnvelope
    set?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    disconnect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    delete?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    update?: MemoryUpdateWithWhereUniqueWithoutSpaceInput | MemoryUpdateWithWhereUniqueWithoutSpaceInput[]
    updateMany?: MemoryUpdateManyWithWhereWithoutSpaceInput | MemoryUpdateManyWithWhereWithoutSpaceInput[]
    deleteMany?: MemoryScalarWhereInput | MemoryScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutMemoriesInput = {
    create?: XOR<UserCreateWithoutMemoriesInput, UserUncheckedCreateWithoutMemoriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutMemoriesInput
    connect?: UserWhereUniqueInput
  }

  export type SpaceCreateNestedOneWithoutMemoriesInput = {
    create?: XOR<SpaceCreateWithoutMemoriesInput, SpaceUncheckedCreateWithoutMemoriesInput>
    connectOrCreate?: SpaceCreateOrConnectWithoutMemoriesInput
    connect?: SpaceWhereUniqueInput
  }

  export type MemoryTagCreateNestedManyWithoutMemoryInput = {
    create?: XOR<MemoryTagCreateWithoutMemoryInput, MemoryTagUncheckedCreateWithoutMemoryInput> | MemoryTagCreateWithoutMemoryInput[] | MemoryTagUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: MemoryTagCreateOrConnectWithoutMemoryInput | MemoryTagCreateOrConnectWithoutMemoryInput[]
    createMany?: MemoryTagCreateManyMemoryInputEnvelope
    connect?: MemoryTagWhereUniqueInput | MemoryTagWhereUniqueInput[]
  }

  export type MemoryTagUncheckedCreateNestedManyWithoutMemoryInput = {
    create?: XOR<MemoryTagCreateWithoutMemoryInput, MemoryTagUncheckedCreateWithoutMemoryInput> | MemoryTagCreateWithoutMemoryInput[] | MemoryTagUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: MemoryTagCreateOrConnectWithoutMemoryInput | MemoryTagCreateOrConnectWithoutMemoryInput[]
    createMany?: MemoryTagCreateManyMemoryInputEnvelope
    connect?: MemoryTagWhereUniqueInput | MemoryTagWhereUniqueInput[]
  }

  export type BytesFieldUpdateOperationsInput = {
    set?: Bytes
  }

  export type EnumMemoryStatusFieldUpdateOperationsInput = {
    set?: $Enums.MemoryStatus
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumMemorySourceFieldUpdateOperationsInput = {
    set?: $Enums.MemorySource
  }

  export type UserUpdateOneRequiredWithoutMemoriesNestedInput = {
    create?: XOR<UserCreateWithoutMemoriesInput, UserUncheckedCreateWithoutMemoriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutMemoriesInput
    upsert?: UserUpsertWithoutMemoriesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMemoriesInput, UserUpdateWithoutMemoriesInput>, UserUncheckedUpdateWithoutMemoriesInput>
  }

  export type SpaceUpdateOneWithoutMemoriesNestedInput = {
    create?: XOR<SpaceCreateWithoutMemoriesInput, SpaceUncheckedCreateWithoutMemoriesInput>
    connectOrCreate?: SpaceCreateOrConnectWithoutMemoriesInput
    upsert?: SpaceUpsertWithoutMemoriesInput
    disconnect?: SpaceWhereInput | boolean
    delete?: SpaceWhereInput | boolean
    connect?: SpaceWhereUniqueInput
    update?: XOR<XOR<SpaceUpdateToOneWithWhereWithoutMemoriesInput, SpaceUpdateWithoutMemoriesInput>, SpaceUncheckedUpdateWithoutMemoriesInput>
  }

  export type MemoryTagUpdateManyWithoutMemoryNestedInput = {
    create?: XOR<MemoryTagCreateWithoutMemoryInput, MemoryTagUncheckedCreateWithoutMemoryInput> | MemoryTagCreateWithoutMemoryInput[] | MemoryTagUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: MemoryTagCreateOrConnectWithoutMemoryInput | MemoryTagCreateOrConnectWithoutMemoryInput[]
    upsert?: MemoryTagUpsertWithWhereUniqueWithoutMemoryInput | MemoryTagUpsertWithWhereUniqueWithoutMemoryInput[]
    createMany?: MemoryTagCreateManyMemoryInputEnvelope
    set?: MemoryTagWhereUniqueInput | MemoryTagWhereUniqueInput[]
    disconnect?: MemoryTagWhereUniqueInput | MemoryTagWhereUniqueInput[]
    delete?: MemoryTagWhereUniqueInput | MemoryTagWhereUniqueInput[]
    connect?: MemoryTagWhereUniqueInput | MemoryTagWhereUniqueInput[]
    update?: MemoryTagUpdateWithWhereUniqueWithoutMemoryInput | MemoryTagUpdateWithWhereUniqueWithoutMemoryInput[]
    updateMany?: MemoryTagUpdateManyWithWhereWithoutMemoryInput | MemoryTagUpdateManyWithWhereWithoutMemoryInput[]
    deleteMany?: MemoryTagScalarWhereInput | MemoryTagScalarWhereInput[]
  }

  export type MemoryTagUncheckedUpdateManyWithoutMemoryNestedInput = {
    create?: XOR<MemoryTagCreateWithoutMemoryInput, MemoryTagUncheckedCreateWithoutMemoryInput> | MemoryTagCreateWithoutMemoryInput[] | MemoryTagUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: MemoryTagCreateOrConnectWithoutMemoryInput | MemoryTagCreateOrConnectWithoutMemoryInput[]
    upsert?: MemoryTagUpsertWithWhereUniqueWithoutMemoryInput | MemoryTagUpsertWithWhereUniqueWithoutMemoryInput[]
    createMany?: MemoryTagCreateManyMemoryInputEnvelope
    set?: MemoryTagWhereUniqueInput | MemoryTagWhereUniqueInput[]
    disconnect?: MemoryTagWhereUniqueInput | MemoryTagWhereUniqueInput[]
    delete?: MemoryTagWhereUniqueInput | MemoryTagWhereUniqueInput[]
    connect?: MemoryTagWhereUniqueInput | MemoryTagWhereUniqueInput[]
    update?: MemoryTagUpdateWithWhereUniqueWithoutMemoryInput | MemoryTagUpdateWithWhereUniqueWithoutMemoryInput[]
    updateMany?: MemoryTagUpdateManyWithWhereWithoutMemoryInput | MemoryTagUpdateManyWithWhereWithoutMemoryInput[]
    deleteMany?: MemoryTagScalarWhereInput | MemoryTagScalarWhereInput[]
  }

  export type MemoryCreateNestedOneWithoutTagsInput = {
    create?: XOR<MemoryCreateWithoutTagsInput, MemoryUncheckedCreateWithoutTagsInput>
    connectOrCreate?: MemoryCreateOrConnectWithoutTagsInput
    connect?: MemoryWhereUniqueInput
  }

  export type MemoryUpdateOneRequiredWithoutTagsNestedInput = {
    create?: XOR<MemoryCreateWithoutTagsInput, MemoryUncheckedCreateWithoutTagsInput>
    connectOrCreate?: MemoryCreateOrConnectWithoutTagsInput
    upsert?: MemoryUpsertWithoutTagsInput
    connect?: MemoryWhereUniqueInput
    update?: XOR<XOR<MemoryUpdateToOneWithWhereWithoutTagsInput, MemoryUpdateWithoutTagsInput>, MemoryUncheckedUpdateWithoutTagsInput>
  }

  export type UserCreateNestedOneWithoutMcpTokensInput = {
    create?: XOR<UserCreateWithoutMcpTokensInput, UserUncheckedCreateWithoutMcpTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutMcpTokensInput
    connect?: UserWhereUniqueInput
  }

  export type EnumTokenScopeFieldUpdateOperationsInput = {
    set?: $Enums.TokenScope
  }

  export type UserUpdateOneRequiredWithoutMcpTokensNestedInput = {
    create?: XOR<UserCreateWithoutMcpTokensInput, UserUncheckedCreateWithoutMcpTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutMcpTokensInput
    upsert?: UserUpsertWithoutMcpTokensInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMcpTokensInput, UserUpdateWithoutMcpTokensInput>, UserUncheckedUpdateWithoutMcpTokensInput>
  }

  export type AgentRunCreatememoryIdsInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutAgentRunsInput = {
    create?: XOR<UserCreateWithoutAgentRunsInput, UserUncheckedCreateWithoutAgentRunsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAgentRunsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumAgentRunStatusFieldUpdateOperationsInput = {
    set?: $Enums.AgentRunStatus
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type AgentRunUpdatememoryIdsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserUpdateOneRequiredWithoutAgentRunsNestedInput = {
    create?: XOR<UserCreateWithoutAgentRunsInput, UserUncheckedCreateWithoutAgentRunsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAgentRunsInput
    upsert?: UserUpsertWithoutAgentRunsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAgentRunsInput, UserUpdateWithoutAgentRunsInput>, UserUncheckedUpdateWithoutAgentRunsInput>
  }

  export type UserCreateNestedOneWithoutAuditLogsInput = {
    create?: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuditLogsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutAuditLogsNestedInput = {
    create?: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuditLogsInput
    upsert?: UserUpsertWithoutAuditLogsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAuditLogsInput, UserUpdateWithoutAuditLogsInput>, UserUncheckedUpdateWithoutAuditLogsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBytesFilter<$PrismaModel = never> = {
    equals?: Bytes | BytesFieldRefInput<$PrismaModel>
    in?: Bytes[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Bytes[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesFilter<$PrismaModel> | Bytes
  }

  export type NestedEnumMemoryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryStatus | EnumMemoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryStatus[] | ListEnumMemoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemoryStatus[] | ListEnumMemoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMemoryStatusFilter<$PrismaModel> | $Enums.MemoryStatus
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumMemorySourceFilter<$PrismaModel = never> = {
    equals?: $Enums.MemorySource | EnumMemorySourceFieldRefInput<$PrismaModel>
    in?: $Enums.MemorySource[] | ListEnumMemorySourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemorySource[] | ListEnumMemorySourceFieldRefInput<$PrismaModel>
    not?: NestedEnumMemorySourceFilter<$PrismaModel> | $Enums.MemorySource
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedBytesWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Bytes | BytesFieldRefInput<$PrismaModel>
    in?: Bytes[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Bytes[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesWithAggregatesFilter<$PrismaModel> | Bytes
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBytesFilter<$PrismaModel>
    _max?: NestedBytesFilter<$PrismaModel>
  }

  export type NestedEnumMemoryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryStatus | EnumMemoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryStatus[] | ListEnumMemoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemoryStatus[] | ListEnumMemoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMemoryStatusWithAggregatesFilter<$PrismaModel> | $Enums.MemoryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMemoryStatusFilter<$PrismaModel>
    _max?: NestedEnumMemoryStatusFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumMemorySourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MemorySource | EnumMemorySourceFieldRefInput<$PrismaModel>
    in?: $Enums.MemorySource[] | ListEnumMemorySourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemorySource[] | ListEnumMemorySourceFieldRefInput<$PrismaModel>
    not?: NestedEnumMemorySourceWithAggregatesFilter<$PrismaModel> | $Enums.MemorySource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMemorySourceFilter<$PrismaModel>
    _max?: NestedEnumMemorySourceFilter<$PrismaModel>
  }

  export type NestedEnumTokenScopeFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenScope | EnumTokenScopeFieldRefInput<$PrismaModel>
    in?: $Enums.TokenScope[] | ListEnumTokenScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenScope[] | ListEnumTokenScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenScopeFilter<$PrismaModel> | $Enums.TokenScope
  }

  export type NestedEnumTokenScopeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenScope | EnumTokenScopeFieldRefInput<$PrismaModel>
    in?: $Enums.TokenScope[] | ListEnumTokenScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenScope[] | ListEnumTokenScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenScopeWithAggregatesFilter<$PrismaModel> | $Enums.TokenScope
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTokenScopeFilter<$PrismaModel>
    _max?: NestedEnumTokenScopeFilter<$PrismaModel>
  }

  export type NestedEnumAgentRunStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentRunStatus | EnumAgentRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAgentRunStatusFilter<$PrismaModel> | $Enums.AgentRunStatus
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedEnumAgentRunStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentRunStatus | EnumAgentRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAgentRunStatusWithAggregatesFilter<$PrismaModel> | $Enums.AgentRunStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAgentRunStatusFilter<$PrismaModel>
    _max?: NestedEnumAgentRunStatusFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SpaceCreateWithoutUserInput = {
    id?: string
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    parent?: SpaceCreateNestedOneWithoutChildrenInput
    children?: SpaceCreateNestedManyWithoutParentInput
    memories?: MemoryCreateNestedManyWithoutSpaceInput
  }

  export type SpaceUncheckedCreateWithoutUserInput = {
    id?: string
    parentId?: string | null
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    children?: SpaceUncheckedCreateNestedManyWithoutParentInput
    memories?: MemoryUncheckedCreateNestedManyWithoutSpaceInput
  }

  export type SpaceCreateOrConnectWithoutUserInput = {
    where: SpaceWhereUniqueInput
    create: XOR<SpaceCreateWithoutUserInput, SpaceUncheckedCreateWithoutUserInput>
  }

  export type SpaceCreateManyUserInputEnvelope = {
    data: SpaceCreateManyUserInput | SpaceCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type MemoryCreateWithoutUserInput = {
    id?: string
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    space?: SpaceCreateNestedOneWithoutMemoriesInput
    tags?: MemoryTagCreateNestedManyWithoutMemoryInput
  }

  export type MemoryUncheckedCreateWithoutUserInput = {
    id?: string
    spaceId?: string | null
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    tags?: MemoryTagUncheckedCreateNestedManyWithoutMemoryInput
  }

  export type MemoryCreateOrConnectWithoutUserInput = {
    where: MemoryWhereUniqueInput
    create: XOR<MemoryCreateWithoutUserInput, MemoryUncheckedCreateWithoutUserInput>
  }

  export type MemoryCreateManyUserInputEnvelope = {
    data: MemoryCreateManyUserInput | MemoryCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type McpTokenCreateWithoutUserInput = {
    id?: string
    token?: string | null
    hashedToken: string
    scope?: $Enums.TokenScope
    expiresAt?: Date | string | null
    revokedAt?: Date | string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type McpTokenUncheckedCreateWithoutUserInput = {
    id?: string
    token?: string | null
    hashedToken: string
    scope?: $Enums.TokenScope
    expiresAt?: Date | string | null
    revokedAt?: Date | string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type McpTokenCreateOrConnectWithoutUserInput = {
    where: McpTokenWhereUniqueInput
    create: XOR<McpTokenCreateWithoutUserInput, McpTokenUncheckedCreateWithoutUserInput>
  }

  export type McpTokenCreateManyUserInputEnvelope = {
    data: McpTokenCreateManyUserInput | McpTokenCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AgentRunCreateWithoutUserInput = {
    id?: string
    task: string
    status?: $Enums.AgentRunStatus
    errorMsg?: string | null
    llmProvider?: string | null
    model?: string | null
    inputTokens?: number | null
    outputTokens?: number | null
    latencyMs?: number | null
    costUsd?: Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunCreatememoryIdsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunUncheckedCreateWithoutUserInput = {
    id?: string
    task: string
    status?: $Enums.AgentRunStatus
    errorMsg?: string | null
    llmProvider?: string | null
    model?: string | null
    inputTokens?: number | null
    outputTokens?: number | null
    latencyMs?: number | null
    costUsd?: Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunCreatememoryIdsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunCreateOrConnectWithoutUserInput = {
    where: AgentRunWhereUniqueInput
    create: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput>
  }

  export type AgentRunCreateManyUserInputEnvelope = {
    data: AgentRunCreateManyUserInput | AgentRunCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AuditLogCreateWithoutUserInput = {
    id?: string
    action: string
    resource?: string | null
    resourceId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUncheckedCreateWithoutUserInput = {
    id?: string
    action: string
    resource?: string | null
    resourceId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogCreateOrConnectWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    create: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
  }

  export type AuditLogCreateManyUserInputEnvelope = {
    data: AuditLogCreateManyUserInput | AuditLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SpaceUpsertWithWhereUniqueWithoutUserInput = {
    where: SpaceWhereUniqueInput
    update: XOR<SpaceUpdateWithoutUserInput, SpaceUncheckedUpdateWithoutUserInput>
    create: XOR<SpaceCreateWithoutUserInput, SpaceUncheckedCreateWithoutUserInput>
  }

  export type SpaceUpdateWithWhereUniqueWithoutUserInput = {
    where: SpaceWhereUniqueInput
    data: XOR<SpaceUpdateWithoutUserInput, SpaceUncheckedUpdateWithoutUserInput>
  }

  export type SpaceUpdateManyWithWhereWithoutUserInput = {
    where: SpaceScalarWhereInput
    data: XOR<SpaceUpdateManyMutationInput, SpaceUncheckedUpdateManyWithoutUserInput>
  }

  export type SpaceScalarWhereInput = {
    AND?: SpaceScalarWhereInput | SpaceScalarWhereInput[]
    OR?: SpaceScalarWhereInput[]
    NOT?: SpaceScalarWhereInput | SpaceScalarWhereInput[]
    id?: StringFilter<"Space"> | string
    userId?: StringFilter<"Space"> | string
    parentId?: StringNullableFilter<"Space"> | string | null
    orgId?: StringNullableFilter<"Space"> | string | null
    name?: StringFilter<"Space"> | string
    description?: StringNullableFilter<"Space"> | string | null
    isScratchpad?: BoolFilter<"Space"> | boolean
    createdAt?: DateTimeFilter<"Space"> | Date | string
    updatedAt?: DateTimeFilter<"Space"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Space"> | Date | string | null
  }

  export type MemoryUpsertWithWhereUniqueWithoutUserInput = {
    where: MemoryWhereUniqueInput
    update: XOR<MemoryUpdateWithoutUserInput, MemoryUncheckedUpdateWithoutUserInput>
    create: XOR<MemoryCreateWithoutUserInput, MemoryUncheckedCreateWithoutUserInput>
  }

  export type MemoryUpdateWithWhereUniqueWithoutUserInput = {
    where: MemoryWhereUniqueInput
    data: XOR<MemoryUpdateWithoutUserInput, MemoryUncheckedUpdateWithoutUserInput>
  }

  export type MemoryUpdateManyWithWhereWithoutUserInput = {
    where: MemoryScalarWhereInput
    data: XOR<MemoryUpdateManyMutationInput, MemoryUncheckedUpdateManyWithoutUserInput>
  }

  export type MemoryScalarWhereInput = {
    AND?: MemoryScalarWhereInput | MemoryScalarWhereInput[]
    OR?: MemoryScalarWhereInput[]
    NOT?: MemoryScalarWhereInput | MemoryScalarWhereInput[]
    id?: UuidFilter<"Memory"> | string
    userId?: UuidFilter<"Memory"> | string
    spaceId?: UuidNullableFilter<"Memory"> | string | null
    orgId?: UuidNullableFilter<"Memory"> | string | null
    content?: BytesFilter<"Memory"> | Bytes
    contentIv?: BytesFilter<"Memory"> | Bytes
    summary?: StringNullableFilter<"Memory"> | string | null
    status?: EnumMemoryStatusFilter<"Memory"> | $Enums.MemoryStatus
    supersededBy?: UuidNullableFilter<"Memory"> | string | null
    supersededAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    confidence?: FloatNullableFilter<"Memory"> | number | null
    source?: EnumMemorySourceFilter<"Memory"> | $Enums.MemorySource
    hint?: StringNullableFilter<"Memory"> | string | null
    indexedAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
    createdAt?: DateTimeFilter<"Memory"> | Date | string
    updatedAt?: DateTimeFilter<"Memory"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Memory"> | Date | string | null
  }

  export type McpTokenUpsertWithWhereUniqueWithoutUserInput = {
    where: McpTokenWhereUniqueInput
    update: XOR<McpTokenUpdateWithoutUserInput, McpTokenUncheckedUpdateWithoutUserInput>
    create: XOR<McpTokenCreateWithoutUserInput, McpTokenUncheckedCreateWithoutUserInput>
  }

  export type McpTokenUpdateWithWhereUniqueWithoutUserInput = {
    where: McpTokenWhereUniqueInput
    data: XOR<McpTokenUpdateWithoutUserInput, McpTokenUncheckedUpdateWithoutUserInput>
  }

  export type McpTokenUpdateManyWithWhereWithoutUserInput = {
    where: McpTokenScalarWhereInput
    data: XOR<McpTokenUpdateManyMutationInput, McpTokenUncheckedUpdateManyWithoutUserInput>
  }

  export type McpTokenScalarWhereInput = {
    AND?: McpTokenScalarWhereInput | McpTokenScalarWhereInput[]
    OR?: McpTokenScalarWhereInput[]
    NOT?: McpTokenScalarWhereInput | McpTokenScalarWhereInput[]
    id?: StringFilter<"McpToken"> | string
    userId?: StringFilter<"McpToken"> | string
    token?: StringNullableFilter<"McpToken"> | string | null
    hashedToken?: StringFilter<"McpToken"> | string
    scope?: EnumTokenScopeFilter<"McpToken"> | $Enums.TokenScope
    expiresAt?: DateTimeNullableFilter<"McpToken"> | Date | string | null
    revokedAt?: DateTimeNullableFilter<"McpToken"> | Date | string | null
    lastUsedAt?: DateTimeNullableFilter<"McpToken"> | Date | string | null
    createdAt?: DateTimeFilter<"McpToken"> | Date | string
  }

  export type AgentRunUpsertWithWhereUniqueWithoutUserInput = {
    where: AgentRunWhereUniqueInput
    update: XOR<AgentRunUpdateWithoutUserInput, AgentRunUncheckedUpdateWithoutUserInput>
    create: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput>
  }

  export type AgentRunUpdateWithWhereUniqueWithoutUserInput = {
    where: AgentRunWhereUniqueInput
    data: XOR<AgentRunUpdateWithoutUserInput, AgentRunUncheckedUpdateWithoutUserInput>
  }

  export type AgentRunUpdateManyWithWhereWithoutUserInput = {
    where: AgentRunScalarWhereInput
    data: XOR<AgentRunUpdateManyMutationInput, AgentRunUncheckedUpdateManyWithoutUserInput>
  }

  export type AgentRunScalarWhereInput = {
    AND?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
    OR?: AgentRunScalarWhereInput[]
    NOT?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
    id?: StringFilter<"AgentRun"> | string
    userId?: StringFilter<"AgentRun"> | string
    task?: StringFilter<"AgentRun"> | string
    status?: EnumAgentRunStatusFilter<"AgentRun"> | $Enums.AgentRunStatus
    errorMsg?: StringNullableFilter<"AgentRun"> | string | null
    llmProvider?: StringNullableFilter<"AgentRun"> | string | null
    model?: StringNullableFilter<"AgentRun"> | string | null
    inputTokens?: IntNullableFilter<"AgentRun"> | number | null
    outputTokens?: IntNullableFilter<"AgentRun"> | number | null
    latencyMs?: IntNullableFilter<"AgentRun"> | number | null
    costUsd?: DecimalNullableFilter<"AgentRun"> | Decimal | DecimalJsLike | number | string | null
    result?: JsonNullableFilter<"AgentRun">
    memoryIds?: StringNullableListFilter<"AgentRun">
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeFilter<"AgentRun"> | Date | string
  }

  export type AuditLogUpsertWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    update: XOR<AuditLogUpdateWithoutUserInput, AuditLogUncheckedUpdateWithoutUserInput>
    create: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
  }

  export type AuditLogUpdateWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    data: XOR<AuditLogUpdateWithoutUserInput, AuditLogUncheckedUpdateWithoutUserInput>
  }

  export type AuditLogUpdateManyWithWhereWithoutUserInput = {
    where: AuditLogScalarWhereInput
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutUserInput>
  }

  export type AuditLogScalarWhereInput = {
    AND?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    OR?: AuditLogScalarWhereInput[]
    NOT?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    userId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    resource?: StringNullableFilter<"AuditLog"> | string | null
    resourceId?: StringNullableFilter<"AuditLog"> | string | null
    metadata?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type UserCreateWithoutSpacesInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    memories?: MemoryCreateNestedManyWithoutUserInput
    mcpTokens?: McpTokenCreateNestedManyWithoutUserInput
    agentRuns?: AgentRunCreateNestedManyWithoutUserInput
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSpacesInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    memories?: MemoryUncheckedCreateNestedManyWithoutUserInput
    mcpTokens?: McpTokenUncheckedCreateNestedManyWithoutUserInput
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutUserInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSpacesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSpacesInput, UserUncheckedCreateWithoutSpacesInput>
  }

  export type SpaceCreateWithoutChildrenInput = {
    id?: string
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    user: UserCreateNestedOneWithoutSpacesInput
    parent?: SpaceCreateNestedOneWithoutChildrenInput
    memories?: MemoryCreateNestedManyWithoutSpaceInput
  }

  export type SpaceUncheckedCreateWithoutChildrenInput = {
    id?: string
    userId: string
    parentId?: string | null
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    memories?: MemoryUncheckedCreateNestedManyWithoutSpaceInput
  }

  export type SpaceCreateOrConnectWithoutChildrenInput = {
    where: SpaceWhereUniqueInput
    create: XOR<SpaceCreateWithoutChildrenInput, SpaceUncheckedCreateWithoutChildrenInput>
  }

  export type SpaceCreateWithoutParentInput = {
    id?: string
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    user: UserCreateNestedOneWithoutSpacesInput
    children?: SpaceCreateNestedManyWithoutParentInput
    memories?: MemoryCreateNestedManyWithoutSpaceInput
  }

  export type SpaceUncheckedCreateWithoutParentInput = {
    id?: string
    userId: string
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    children?: SpaceUncheckedCreateNestedManyWithoutParentInput
    memories?: MemoryUncheckedCreateNestedManyWithoutSpaceInput
  }

  export type SpaceCreateOrConnectWithoutParentInput = {
    where: SpaceWhereUniqueInput
    create: XOR<SpaceCreateWithoutParentInput, SpaceUncheckedCreateWithoutParentInput>
  }

  export type SpaceCreateManyParentInputEnvelope = {
    data: SpaceCreateManyParentInput | SpaceCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type MemoryCreateWithoutSpaceInput = {
    id?: string
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    user: UserCreateNestedOneWithoutMemoriesInput
    tags?: MemoryTagCreateNestedManyWithoutMemoryInput
  }

  export type MemoryUncheckedCreateWithoutSpaceInput = {
    id?: string
    userId: string
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    tags?: MemoryTagUncheckedCreateNestedManyWithoutMemoryInput
  }

  export type MemoryCreateOrConnectWithoutSpaceInput = {
    where: MemoryWhereUniqueInput
    create: XOR<MemoryCreateWithoutSpaceInput, MemoryUncheckedCreateWithoutSpaceInput>
  }

  export type MemoryCreateManySpaceInputEnvelope = {
    data: MemoryCreateManySpaceInput | MemoryCreateManySpaceInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutSpacesInput = {
    update: XOR<UserUpdateWithoutSpacesInput, UserUncheckedUpdateWithoutSpacesInput>
    create: XOR<UserCreateWithoutSpacesInput, UserUncheckedCreateWithoutSpacesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSpacesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSpacesInput, UserUncheckedUpdateWithoutSpacesInput>
  }

  export type UserUpdateWithoutSpacesInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    memories?: MemoryUpdateManyWithoutUserNestedInput
    mcpTokens?: McpTokenUpdateManyWithoutUserNestedInput
    agentRuns?: AgentRunUpdateManyWithoutUserNestedInput
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSpacesInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    memories?: MemoryUncheckedUpdateManyWithoutUserNestedInput
    mcpTokens?: McpTokenUncheckedUpdateManyWithoutUserNestedInput
    agentRuns?: AgentRunUncheckedUpdateManyWithoutUserNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SpaceUpsertWithoutChildrenInput = {
    update: XOR<SpaceUpdateWithoutChildrenInput, SpaceUncheckedUpdateWithoutChildrenInput>
    create: XOR<SpaceCreateWithoutChildrenInput, SpaceUncheckedCreateWithoutChildrenInput>
    where?: SpaceWhereInput
  }

  export type SpaceUpdateToOneWithWhereWithoutChildrenInput = {
    where?: SpaceWhereInput
    data: XOR<SpaceUpdateWithoutChildrenInput, SpaceUncheckedUpdateWithoutChildrenInput>
  }

  export type SpaceUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutSpacesNestedInput
    parent?: SpaceUpdateOneWithoutChildrenNestedInput
    memories?: MemoryUpdateManyWithoutSpaceNestedInput
  }

  export type SpaceUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    memories?: MemoryUncheckedUpdateManyWithoutSpaceNestedInput
  }

  export type SpaceUpsertWithWhereUniqueWithoutParentInput = {
    where: SpaceWhereUniqueInput
    update: XOR<SpaceUpdateWithoutParentInput, SpaceUncheckedUpdateWithoutParentInput>
    create: XOR<SpaceCreateWithoutParentInput, SpaceUncheckedCreateWithoutParentInput>
  }

  export type SpaceUpdateWithWhereUniqueWithoutParentInput = {
    where: SpaceWhereUniqueInput
    data: XOR<SpaceUpdateWithoutParentInput, SpaceUncheckedUpdateWithoutParentInput>
  }

  export type SpaceUpdateManyWithWhereWithoutParentInput = {
    where: SpaceScalarWhereInput
    data: XOR<SpaceUpdateManyMutationInput, SpaceUncheckedUpdateManyWithoutParentInput>
  }

  export type MemoryUpsertWithWhereUniqueWithoutSpaceInput = {
    where: MemoryWhereUniqueInput
    update: XOR<MemoryUpdateWithoutSpaceInput, MemoryUncheckedUpdateWithoutSpaceInput>
    create: XOR<MemoryCreateWithoutSpaceInput, MemoryUncheckedCreateWithoutSpaceInput>
  }

  export type MemoryUpdateWithWhereUniqueWithoutSpaceInput = {
    where: MemoryWhereUniqueInput
    data: XOR<MemoryUpdateWithoutSpaceInput, MemoryUncheckedUpdateWithoutSpaceInput>
  }

  export type MemoryUpdateManyWithWhereWithoutSpaceInput = {
    where: MemoryScalarWhereInput
    data: XOR<MemoryUpdateManyMutationInput, MemoryUncheckedUpdateManyWithoutSpaceInput>
  }

  export type UserCreateWithoutMemoriesInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    spaces?: SpaceCreateNestedManyWithoutUserInput
    mcpTokens?: McpTokenCreateNestedManyWithoutUserInput
    agentRuns?: AgentRunCreateNestedManyWithoutUserInput
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMemoriesInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    spaces?: SpaceUncheckedCreateNestedManyWithoutUserInput
    mcpTokens?: McpTokenUncheckedCreateNestedManyWithoutUserInput
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutUserInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMemoriesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMemoriesInput, UserUncheckedCreateWithoutMemoriesInput>
  }

  export type SpaceCreateWithoutMemoriesInput = {
    id?: string
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    user: UserCreateNestedOneWithoutSpacesInput
    parent?: SpaceCreateNestedOneWithoutChildrenInput
    children?: SpaceCreateNestedManyWithoutParentInput
  }

  export type SpaceUncheckedCreateWithoutMemoriesInput = {
    id?: string
    userId: string
    parentId?: string | null
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    children?: SpaceUncheckedCreateNestedManyWithoutParentInput
  }

  export type SpaceCreateOrConnectWithoutMemoriesInput = {
    where: SpaceWhereUniqueInput
    create: XOR<SpaceCreateWithoutMemoriesInput, SpaceUncheckedCreateWithoutMemoriesInput>
  }

  export type MemoryTagCreateWithoutMemoryInput = {
    id?: string
    tag: string
    createdAt?: Date | string
  }

  export type MemoryTagUncheckedCreateWithoutMemoryInput = {
    id?: string
    tag: string
    createdAt?: Date | string
  }

  export type MemoryTagCreateOrConnectWithoutMemoryInput = {
    where: MemoryTagWhereUniqueInput
    create: XOR<MemoryTagCreateWithoutMemoryInput, MemoryTagUncheckedCreateWithoutMemoryInput>
  }

  export type MemoryTagCreateManyMemoryInputEnvelope = {
    data: MemoryTagCreateManyMemoryInput | MemoryTagCreateManyMemoryInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutMemoriesInput = {
    update: XOR<UserUpdateWithoutMemoriesInput, UserUncheckedUpdateWithoutMemoriesInput>
    create: XOR<UserCreateWithoutMemoriesInput, UserUncheckedCreateWithoutMemoriesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMemoriesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMemoriesInput, UserUncheckedUpdateWithoutMemoriesInput>
  }

  export type UserUpdateWithoutMemoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spaces?: SpaceUpdateManyWithoutUserNestedInput
    mcpTokens?: McpTokenUpdateManyWithoutUserNestedInput
    agentRuns?: AgentRunUpdateManyWithoutUserNestedInput
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMemoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spaces?: SpaceUncheckedUpdateManyWithoutUserNestedInput
    mcpTokens?: McpTokenUncheckedUpdateManyWithoutUserNestedInput
    agentRuns?: AgentRunUncheckedUpdateManyWithoutUserNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SpaceUpsertWithoutMemoriesInput = {
    update: XOR<SpaceUpdateWithoutMemoriesInput, SpaceUncheckedUpdateWithoutMemoriesInput>
    create: XOR<SpaceCreateWithoutMemoriesInput, SpaceUncheckedCreateWithoutMemoriesInput>
    where?: SpaceWhereInput
  }

  export type SpaceUpdateToOneWithWhereWithoutMemoriesInput = {
    where?: SpaceWhereInput
    data: XOR<SpaceUpdateWithoutMemoriesInput, SpaceUncheckedUpdateWithoutMemoriesInput>
  }

  export type SpaceUpdateWithoutMemoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutSpacesNestedInput
    parent?: SpaceUpdateOneWithoutChildrenNestedInput
    children?: SpaceUpdateManyWithoutParentNestedInput
  }

  export type SpaceUncheckedUpdateWithoutMemoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: SpaceUncheckedUpdateManyWithoutParentNestedInput
  }

  export type MemoryTagUpsertWithWhereUniqueWithoutMemoryInput = {
    where: MemoryTagWhereUniqueInput
    update: XOR<MemoryTagUpdateWithoutMemoryInput, MemoryTagUncheckedUpdateWithoutMemoryInput>
    create: XOR<MemoryTagCreateWithoutMemoryInput, MemoryTagUncheckedCreateWithoutMemoryInput>
  }

  export type MemoryTagUpdateWithWhereUniqueWithoutMemoryInput = {
    where: MemoryTagWhereUniqueInput
    data: XOR<MemoryTagUpdateWithoutMemoryInput, MemoryTagUncheckedUpdateWithoutMemoryInput>
  }

  export type MemoryTagUpdateManyWithWhereWithoutMemoryInput = {
    where: MemoryTagScalarWhereInput
    data: XOR<MemoryTagUpdateManyMutationInput, MemoryTagUncheckedUpdateManyWithoutMemoryInput>
  }

  export type MemoryTagScalarWhereInput = {
    AND?: MemoryTagScalarWhereInput | MemoryTagScalarWhereInput[]
    OR?: MemoryTagScalarWhereInput[]
    NOT?: MemoryTagScalarWhereInput | MemoryTagScalarWhereInput[]
    id?: StringFilter<"MemoryTag"> | string
    memoryId?: StringFilter<"MemoryTag"> | string
    tag?: StringFilter<"MemoryTag"> | string
    createdAt?: DateTimeFilter<"MemoryTag"> | Date | string
  }

  export type MemoryCreateWithoutTagsInput = {
    id?: string
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    user: UserCreateNestedOneWithoutMemoriesInput
    space?: SpaceCreateNestedOneWithoutMemoriesInput
  }

  export type MemoryUncheckedCreateWithoutTagsInput = {
    id?: string
    userId: string
    spaceId?: string | null
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type MemoryCreateOrConnectWithoutTagsInput = {
    where: MemoryWhereUniqueInput
    create: XOR<MemoryCreateWithoutTagsInput, MemoryUncheckedCreateWithoutTagsInput>
  }

  export type MemoryUpsertWithoutTagsInput = {
    update: XOR<MemoryUpdateWithoutTagsInput, MemoryUncheckedUpdateWithoutTagsInput>
    create: XOR<MemoryCreateWithoutTagsInput, MemoryUncheckedCreateWithoutTagsInput>
    where?: MemoryWhereInput
  }

  export type MemoryUpdateToOneWithWhereWithoutTagsInput = {
    where?: MemoryWhereInput
    data: XOR<MemoryUpdateWithoutTagsInput, MemoryUncheckedUpdateWithoutTagsInput>
  }

  export type MemoryUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutMemoriesNestedInput
    space?: SpaceUpdateOneWithoutMemoriesNestedInput
  }

  export type MemoryUncheckedUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    spaceId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserCreateWithoutMcpTokensInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    spaces?: SpaceCreateNestedManyWithoutUserInput
    memories?: MemoryCreateNestedManyWithoutUserInput
    agentRuns?: AgentRunCreateNestedManyWithoutUserInput
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMcpTokensInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    spaces?: SpaceUncheckedCreateNestedManyWithoutUserInput
    memories?: MemoryUncheckedCreateNestedManyWithoutUserInput
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutUserInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMcpTokensInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMcpTokensInput, UserUncheckedCreateWithoutMcpTokensInput>
  }

  export type UserUpsertWithoutMcpTokensInput = {
    update: XOR<UserUpdateWithoutMcpTokensInput, UserUncheckedUpdateWithoutMcpTokensInput>
    create: XOR<UserCreateWithoutMcpTokensInput, UserUncheckedCreateWithoutMcpTokensInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMcpTokensInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMcpTokensInput, UserUncheckedUpdateWithoutMcpTokensInput>
  }

  export type UserUpdateWithoutMcpTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spaces?: SpaceUpdateManyWithoutUserNestedInput
    memories?: MemoryUpdateManyWithoutUserNestedInput
    agentRuns?: AgentRunUpdateManyWithoutUserNestedInput
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMcpTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spaces?: SpaceUncheckedUpdateManyWithoutUserNestedInput
    memories?: MemoryUncheckedUpdateManyWithoutUserNestedInput
    agentRuns?: AgentRunUncheckedUpdateManyWithoutUserNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutAgentRunsInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    spaces?: SpaceCreateNestedManyWithoutUserInput
    memories?: MemoryCreateNestedManyWithoutUserInput
    mcpTokens?: McpTokenCreateNestedManyWithoutUserInput
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAgentRunsInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    spaces?: SpaceUncheckedCreateNestedManyWithoutUserInput
    memories?: MemoryUncheckedCreateNestedManyWithoutUserInput
    mcpTokens?: McpTokenUncheckedCreateNestedManyWithoutUserInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAgentRunsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAgentRunsInput, UserUncheckedCreateWithoutAgentRunsInput>
  }

  export type UserUpsertWithoutAgentRunsInput = {
    update: XOR<UserUpdateWithoutAgentRunsInput, UserUncheckedUpdateWithoutAgentRunsInput>
    create: XOR<UserCreateWithoutAgentRunsInput, UserUncheckedCreateWithoutAgentRunsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAgentRunsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAgentRunsInput, UserUncheckedUpdateWithoutAgentRunsInput>
  }

  export type UserUpdateWithoutAgentRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spaces?: SpaceUpdateManyWithoutUserNestedInput
    memories?: MemoryUpdateManyWithoutUserNestedInput
    mcpTokens?: McpTokenUpdateManyWithoutUserNestedInput
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAgentRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spaces?: SpaceUncheckedUpdateManyWithoutUserNestedInput
    memories?: MemoryUncheckedUpdateManyWithoutUserNestedInput
    mcpTokens?: McpTokenUncheckedUpdateManyWithoutUserNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutAuditLogsInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    spaces?: SpaceCreateNestedManyWithoutUserInput
    memories?: MemoryCreateNestedManyWithoutUserInput
    mcpTokens?: McpTokenCreateNestedManyWithoutUserInput
    agentRuns?: AgentRunCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAuditLogsInput = {
    id?: string
    clerk_id: string
    email: string
    name?: string | null
    image?: string | null
    tier?: string
    stripeCustomerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    spaces?: SpaceUncheckedCreateNestedManyWithoutUserInput
    memories?: MemoryUncheckedCreateNestedManyWithoutUserInput
    mcpTokens?: McpTokenUncheckedCreateNestedManyWithoutUserInput
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAuditLogsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>
  }

  export type UserUpsertWithoutAuditLogsInput = {
    update: XOR<UserUpdateWithoutAuditLogsInput, UserUncheckedUpdateWithoutAuditLogsInput>
    create: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAuditLogsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAuditLogsInput, UserUncheckedUpdateWithoutAuditLogsInput>
  }

  export type UserUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spaces?: SpaceUpdateManyWithoutUserNestedInput
    memories?: MemoryUpdateManyWithoutUserNestedInput
    mcpTokens?: McpTokenUpdateManyWithoutUserNestedInput
    agentRuns?: AgentRunUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    tier?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spaces?: SpaceUncheckedUpdateManyWithoutUserNestedInput
    memories?: MemoryUncheckedUpdateManyWithoutUserNestedInput
    mcpTokens?: McpTokenUncheckedUpdateManyWithoutUserNestedInput
    agentRuns?: AgentRunUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SpaceCreateManyUserInput = {
    id?: string
    parentId?: string | null
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type MemoryCreateManyUserInput = {
    id?: string
    spaceId?: string | null
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type McpTokenCreateManyUserInput = {
    id?: string
    token?: string | null
    hashedToken: string
    scope?: $Enums.TokenScope
    expiresAt?: Date | string | null
    revokedAt?: Date | string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type AgentRunCreateManyUserInput = {
    id?: string
    task: string
    status?: $Enums.AgentRunStatus
    errorMsg?: string | null
    llmProvider?: string | null
    model?: string | null
    inputTokens?: number | null
    outputTokens?: number | null
    latencyMs?: number | null
    costUsd?: Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunCreatememoryIdsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuditLogCreateManyUserInput = {
    id?: string
    action: string
    resource?: string | null
    resourceId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type SpaceUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    parent?: SpaceUpdateOneWithoutChildrenNestedInput
    children?: SpaceUpdateManyWithoutParentNestedInput
    memories?: MemoryUpdateManyWithoutSpaceNestedInput
  }

  export type SpaceUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: SpaceUncheckedUpdateManyWithoutParentNestedInput
    memories?: MemoryUncheckedUpdateManyWithoutSpaceNestedInput
  }

  export type SpaceUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MemoryUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    space?: SpaceUpdateOneWithoutMemoriesNestedInput
    tags?: MemoryTagUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    spaceId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tags?: MemoryTagUncheckedUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    spaceId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type McpTokenUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    hashedToken?: StringFieldUpdateOperationsInput | string
    scope?: EnumTokenScopeFieldUpdateOperationsInput | $Enums.TokenScope
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type McpTokenUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    hashedToken?: StringFieldUpdateOperationsInput | string
    scope?: EnumTokenScopeFieldUpdateOperationsInput | $Enums.TokenScope
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type McpTokenUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    hashedToken?: StringFieldUpdateOperationsInput | string
    scope?: EnumTokenScopeFieldUpdateOperationsInput | $Enums.TokenScope
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    llmProvider?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    outputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    costUsd?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunUpdatememoryIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    llmProvider?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    outputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    costUsd?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunUpdatememoryIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    llmProvider?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    outputTokens?: NullableIntFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    costUsd?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    result?: NullableJsonNullValueInput | InputJsonValue
    memoryIds?: AgentRunUpdatememoryIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SpaceCreateManyParentInput = {
    id?: string
    userId: string
    orgId?: string | null
    name: string
    description?: string | null
    isScratchpad?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type MemoryCreateManySpaceInput = {
    id?: string
    userId: string
    orgId?: string | null
    content: Bytes
    contentIv: Bytes
    summary?: string | null
    status?: $Enums.MemoryStatus
    supersededBy?: string | null
    supersededAt?: Date | string | null
    confidence?: number | null
    source?: $Enums.MemorySource
    hint?: string | null
    indexedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type SpaceUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutSpacesNestedInput
    children?: SpaceUpdateManyWithoutParentNestedInput
    memories?: MemoryUpdateManyWithoutSpaceNestedInput
  }

  export type SpaceUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: SpaceUncheckedUpdateManyWithoutParentNestedInput
    memories?: MemoryUncheckedUpdateManyWithoutSpaceNestedInput
  }

  export type SpaceUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isScratchpad?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MemoryUpdateWithoutSpaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutMemoriesNestedInput
    tags?: MemoryTagUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryUncheckedUpdateWithoutSpaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tags?: MemoryTagUncheckedUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryUncheckedUpdateManyWithoutSpaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: BytesFieldUpdateOperationsInput | Bytes
    contentIv?: BytesFieldUpdateOperationsInput | Bytes
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMemoryStatusFieldUpdateOperationsInput | $Enums.MemoryStatus
    supersededBy?: NullableStringFieldUpdateOperationsInput | string | null
    supersededAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    source?: EnumMemorySourceFieldUpdateOperationsInput | $Enums.MemorySource
    hint?: NullableStringFieldUpdateOperationsInput | string | null
    indexedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MemoryTagCreateManyMemoryInput = {
    id?: string
    tag: string
    createdAt?: Date | string
  }

  export type MemoryTagUpdateWithoutMemoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryTagUncheckedUpdateWithoutMemoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryTagUncheckedUpdateManyWithoutMemoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}