import { StringToNumberMap, DecrementNumberByOneMap } from "numbers";

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
export type Str<T> = T extends string ? T : never;
type AddParentArrToChildren<T extends Record<string, unknown>, P extends string[]> = _<
	{
		[K in keyof T]: [...P, Str<K>];
	}[keyof T]
>;

type IsStr<T> = T extends string ? T : never;
type StrArr<T> = T extends string[] ? T : never;
type IsArray<T> = T extends any[] ? true : false;
type IsEmpty<T extends any[]> = T extends [] ? true : false;
type IsNever<T> = [T] extends [never] ? true : false;

type StringToNumber<T extends string> = T extends keyof StringToNumberMap ? StringToNumberMap[T] : never;

type ArrayIndexes<T> = T extends []
	? never
	: IsNever<Exclude<keyof T, keyof any[] | "length">> extends true
	? number
	: Exclude<keyof T, keyof any[] | "length">;

type ArrayPathImpl<T, Acc extends unknown[] = [], K extends keyof T = keyof T> = IsArray<T> extends true
	? IsNever<ArrayIndexes<T>> extends true
		? Acc
		: K extends number
		? ArrayPathImpl<T[K], [...Acc, number]>
		: ArrayPathImpl<T[K], [...Acc, StringToNumber<Str<K>>]>
	: T extends Record<string, any>
	? {
			[K in keyof T]: T[K] extends Record<string, any>
				? T[K] extends ArrayLike<any>
					? ArrayPathImpl<T[K], [...Acc, Str<K>], Exclude<keyof T[K], keyof any[] | "length">>
					: ArrayPathImpl<T[K], [...Acc, Str<K>]>
				: [...Acc, K];
	  }[keyof T]
	: Acc;

type StringPathImpl<T, Level extends string, Acc> = IsArray<T> extends true
	? Acc
	: T extends Record<string, any>
	? {
			[K in keyof T]: K extends string
				? T[K] extends Record<string, any>
					? StringPathImpl<T[K], `${Level}${K}.`, Acc | `${Level}${K}`>
					: Acc | `${Level}${K}`
				: Acc;
	  }[keyof T]
	: Acc;

type ArrayPathToString<T extends string[]> = ArrayPathToStringAcc<T, "">;

type ArrayPathToStringAcc<T extends string[], Acc extends string> = T extends [infer A, ...infer Rest]
	? IsEmpty<Rest> extends true
		? `${Acc}${Str<A>}`
		: ArrayPathToStringAcc<StrArr<Rest>, `${Acc}${Str<A>}.`>
	: never;

type StringPathToArray<T extends string> = StringPathToArrayAcc<T, []>;
type StringPathToArrayAcc<T extends string, Acc extends string[]> = T extends `${infer B}.${infer Rest}`
	? StringPathToArrayAcc<Rest, [...Acc, B]>
	: [...Acc, T];

type ArrayPathValue<T, P extends any[]> = P extends [infer K]
	? K extends keyof T
		? K extends keyof DecrementNumberByOneMap
			? DecrementNumberByOneMap[K] extends keyof T
				? T[DecrementNumberByOneMap[K]]
				: never
			: T[K]
		: never
	: P extends [infer K, ...infer Rest]
	? K extends keyof T
		? K extends keyof DecrementNumberByOneMap
			? DecrementNumberByOneMap[K] extends keyof T
				? ArrayPathValue<T[K], Rest>
				: never
			: ArrayPathValue<T[K], Rest>
		: never
	: never;

type StringPathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
	? K extends keyof T
		? StringPathValue<T[K], Rest>
		: never
	: P extends keyof T
	? T[P]
	: never;

export type ArrayPath<T> = ArrayPathImpl<T>;
export type StringPath<T> = StringPathImpl<T, "", never>;
export type Path<T> = ArrayPath<T> | StringPath<T>;

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore not too deep
export type PathValue<T, P extends Path<T>> = P extends string
	? StringPathValue<T, P>
	: P extends any[]
	? ArrayPathValue<T, P>
	: never;
/* eslint-enable @typescript-eslint/ban-ts-comment */
export type PathValues<T, P extends Path<T>, V = PathValue<T, P>> = {
	[K in keyof V]: V[K];
};
