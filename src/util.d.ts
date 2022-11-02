declare global {
  interface Replicas {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type OmitFirstParam<C> = C extends (toOmit: any, ...rest: infer Rest) => infer R ? (...params: Rest) => R : never;
}

export type RobloxDataTypes =
  | Axes
  | BrickColor
  | CFrame
  | CatalogSearchParams
  | Color3
  | ColorSequence
  | ColorSequenceKeypoint
  | DateTime
  | DockWidgetPluginGuiInfo
  | Enum
  | EnumItem
  | Enums
  | Faces
  | FloatCurveKey
  | Font
  | Instance
  | NumberRange
  | NumberSequence
  | NumberSequenceKeypoint
  | OverlapParams
  | PathWaypoint
  | PhysicalProperties
  | RBXScriptConnection
  | RBXScriptSignal
  | Random
  | Ray
  | RaycastParams
  | RaycastResult
  | Rect
  | Region3
  | Region3int16
  | TweenInfo
  | UDim
  | UDim2
  | Vector2
  | Vector2int16
  | Vector3
  | Vector3int16;

export type RecursionBreakerTypes =
  | string
  | number
  | boolean
  | symbol
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Map<any, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Set<any>
  | Callback
  | RobloxDataTypes;

export type Cleanable = { Destroy(): void } | { Disconnect(): void };
export type Task = Callback | Instance | Cleanable;
export type ReplicationTypes = "All" | Map<Player, boolean> | Player;
export type ReplicaClassToken<C extends keyof Replicas> = {
  Class: C;
};

type IsRealObject<T> = T extends RecursionBreakerTypes ? false : T extends object ? true : false;
type ValueFilterTypes = "None" | "Object" | "Array" | "Callback";
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]];
type DefaultDepth = 10;

export type ArrayPath<T, VF extends ValueFilterTypes, P extends string[] = [], D extends number = DefaultDepth> = [
  D,
] extends [never]
  ? never
  : IsRealObject<T> extends true
  ? {
      [K in keyof T]-?: K extends string
        ? VF extends "None"
          ? IsRealObject<T[K]> extends true
            ? ArrayPath<T[K], "None", [...P, K], Prev[D]>
            : [...P, K]
          : VF extends "Object"
          ? IsRealObject<T[K]> extends true
            ? [...P, K] | ArrayPath<T[K], "Object", [...P, K], Prev[D]>
            : never
          : VF extends "Array"
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            T[K] extends any[]
            ? [...P, K]
            : IsRealObject<T[K]> extends true
            ? ArrayPath<T[K], "Array", [...P, K], Prev[D]>
            : never
          : VF extends "Callback"
          ? T[K] extends Callback
            ? [...P, K]
            : IsRealObject<T[K]> extends true
            ? ArrayPath<T[K], "Callback", [...P, K], Prev[D]>
            : never
          : never
        : never;
    }[keyof T]
  : [];
export type ArrayPathValue<T, P extends string[]> = P extends [infer K]
  ? K extends keyof T
    ? T[K]
    : never
  : P extends [infer K, ...infer Rest extends string[]]
  ? K extends keyof T
    ? ArrayPathValue<T[K], Rest>
    : never
  : never;

export type StringPath<T, VF extends ValueFilterTypes, P extends string = "", D extends number = DefaultDepth> = [
  D,
] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string
        ? VF extends "None"
          ? IsRealObject<T[K]> extends true
            ? StringPath<T[K], "None", `${P}${K}.`, Prev[D]>
            : `${P}${K}`
          : VF extends "Object"
          ? IsRealObject<T[K]> extends true
            ? `${P}${K}` | StringPath<T[K], "Object", `${P}${K}.`, Prev[D]>
            : never
          : VF extends "Array"
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            T[K] extends any[]
            ? `${P}${K}`
            : IsRealObject<T[K]> extends true
            ? StringPath<T[K], "Array", `${P}${K}.`, Prev[D]>
            : never
          : VF extends "Callback"
          ? T[K] extends Callback
            ? `${P}${K}`
            : IsRealObject<T[K]> extends true
            ? StringPath<T[K], "Callback", `${P}${K}.`, Prev[D]>
            : never
          : never
        : never;
    }[keyof T]
  : "";
export type StringPathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? StringPathValue<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

export type Path<T extends object, VF extends ValueFilterTypes> = ArrayPath<T, VF> | StringPath<T, VF>;
export type PathValue<T extends object, P extends string | string[]> = P extends string
  ? StringPathValue<T, P>
  : P extends string[]
  ? ArrayPathValue<T, P>
  : never;
export type PathValues<
  T extends object,
  P extends string | string[],
  V = PathValue<T, P>,
> = IsRealObject<V> extends true
  ? Partial<{
      [K in keyof V]: V[K];
    }>
  : never;
