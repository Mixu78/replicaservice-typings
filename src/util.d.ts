/* eslint-disable @typescript-eslint/no-explicit-any */
export type Cleanable =
	| {
			Destroy(): void;
	  }
	| {
			Disconnect(): void;
	  };

export type Task = Callback | Instance | Cleanable;

export type Array<T> = T extends any[] ? T : never[];

export type OmitFirstParam<T> = T extends (x: any, ...rest: infer Rest) => infer R ? (...params: Rest) => R : never;

type DataTypes =
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

type TupleIndexes<T extends readonly any[], Acc = never> = T extends readonly [infer _, ...infer Rest]
	? //@ts-expect-error T can be indexed with "length"
	  TupleIndexes<Rest, Acc | [T["length"]]>
	: Acc;
type Indexes<T extends readonly any[]> = T extends readonly [infer _, ...infer _Rest] ? TupleIndexes<T> : [number];

type ArrayPathImpl<T, Acc extends any[]> = T extends readonly any[]
	? Indexes<T>
	: T extends DataTypes
	? Acc
	: T extends Record<string, any>
	? {
			[K in keyof T]: [K] | [K, ...ArrayPathImpl<T[K], Acc>];
	  }[keyof T]
	: Acc;

type ArrayPathValue<T, P extends ArrayPath<T>> = ArrayPathValueImpl<T, P>;
type ArrayPathValueImpl<T, P extends any[]> = P extends [infer S, ...infer Rest]
	? S extends number
		? //@ts-expect-error Will work anyway
		  Rest["length"] extends 0
			? //@ts-expect-error Will work anyway
			  T[DecrementNumberByOneMap[S]]
			: //@ts-expect-error Will work anyway
			  ArrayPathValueImpl<T[DecrementNumberByOneMap[S]], Rest>
		: //@ts-expect-error Will work anyway
		Rest["length"] extends 0
		? //@ts-expect-error Will work anyway
		  T[S]
		: //@ts-expect-error Will work anyway
		  ArrayPathValueImpl<T[S], Rest>
	: never;

export type ArrayPath<T> = ArrayPathImpl<T, []>;
export type Path<T> = ArrayPath<T>;

export type PathValue<T, P extends Path<T>> = P extends any[] ? ArrayPathValue<T, P> : never;
export type PathValues<T, P extends Path<T>, V = PathValue<T, P>> = {
	[K in keyof V]: V[K];
};
