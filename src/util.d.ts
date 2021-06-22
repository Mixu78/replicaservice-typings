export type Cleanable =
	| {
			Destroy(): void;
	  }
	| {
			Disconnect(): void;
	  };

export type Task = Callback | Instance | Cleanable;

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Array<T> = T extends any[] ? T : never[];
export type Str<T> = Extract<T, string>;
type AddParentArrToChildren<T extends Record<string, unknown>, P extends string[]> = _<
	{
		[K in keyof T]: [...P, Str<K>];
	}[keyof T]
>;

/* eslint-disable @typescript-eslint/no-explicit-any */
type StringPathImpl<T, K extends keyof T> = K extends string
	? T[K] extends Record<string, any>
		? T[K] extends ArrayLike<any>
			? K | `${K}.${StringPathImpl<T[K], Exclude<keyof T[K], keyof any[] | "length" | `${number}`>>}`
			: K | `${K}.${StringPathImpl<T[K], keyof T[K]>}`
		: K
	: never;

type ArrayPathImpl<T, K extends keyof T> = K extends string
	? T[K] extends Record<string, any>
		? T[K] extends ArrayLike<any>
			? [K] | [K, ...ArrayPathImpl<T[K], Exclude<keyof T[K], keyof any[] | "length">>]
			: [K] | [K, ...ArrayPathImpl<T[K], keyof T[K]>]
		: [K]
	: never;
/* eslint-enable @typescript-eslint/no-explicit-any */

export type ArrayPath<T> = ArrayPathImpl<T, keyof T>;
export type StringPath<T> = StringPathImpl<T, keyof T>;
export type Path<T> = StringPath<T> | ArrayPath<T>;

/* eslint-disable prettier/prettier */
export type ArrayPathToString<T extends string[]> =
T extends [infer A] ? `${Str<A>}` :
T extends [infer A, infer B] ? `${Str<A>}.${Str<B>}` :
T extends [infer A, infer B, infer C] ? `${Str<A>}.${Str<B>}.${Str<C>}` :
T extends [infer A, infer B, infer C, infer D] ? `${Str<A>}.${Str<B>}.${Str<C>}.${Str<D>}` :
T extends [infer A, infer B, infer C, infer D, infer E] ? `${Str<A>}.${Str<B>}.${Str<C>}.${Str<D>}.${Str<E>}` :
T extends [infer A, infer B, infer C, infer D, infer E, infer F] ? `${Str<A>}.${Str<B>}.${Str<C>}.${Str<D>}.${Str<E>}.${Str<F>}` :
T extends [infer A, infer B, infer C, infer D, infer E, infer F, infer G] ? `${Str<A>}.${Str<B>}.${Str<C>}.${Str<D>}.${Str<E>}.${Str<F>}.${Str<G>}` :
never;
/* eslint-enable prettier/prettier */

type StringPathValue<T, P extends StringPath<T>> = P extends `${infer K}.${infer Rest}`
	? K extends keyof T
		? Rest extends StringPath<T[K]>
			? StringPathValue<T[K], Rest>
			: never
		: never
	: P extends keyof T
	? T[P]
	: never;

export type PathValue<T, P extends Path<T>> = P extends ArrayPath<T>
	? //@ts-expect-error Lots of infering but not infinite
	  StringPathValue<T, ArrayPathToString<P>>
	: P extends StringPath<T>
	? StringPathValue<T, P>
	: never;

export type PathValues<T, P extends Path<T>, V = PathValue<T, P>> = {
	[K in keyof V]: V[K];
};
