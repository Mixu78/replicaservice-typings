type Cleanable =
	| {
			Destroy(): void;
	  }
	| {
			Disconnect(): void;
	  };

type Task = Callback | Instance | Cleanable;

type Str<T> = Extract<T, string>;

type ArrayPath<T, Parent extends string | string[] | undefined = undefined> = _<
	{
		[P in keyof T]: T[P] extends Record<string, unknown>
			? ArrayPath<T[P], Parent extends undefined ? Str<P> : Parent> | [P]
			: Parent extends string
			? [Parent, Str<P>]
			: Parent extends string[]
			? "debug"
			: [P];
	}[keyof T]
>;

type test = ArrayPath<{
	str: string;
	foo: {
		bar: string;
		baz: {
			deep: boolean;
		};
	};
}>;

/*
T = data, Parent = T owner | undefined
parent:
	entry is object:
		parent + path of entry and key
		path of children
	entry is other:
		parent.key
no parent:
	entry is object:
		key
		key + path of entry
		path of children
	entry is other:
		key
*/
/* eslint-disable prettier/prettier */

type PPath<T extends Record<string, unknown>> = {
	[K in keyof T]: /*T[P] extends object ? never :*/ Str<K>;
}[keyof T];

type Path<T extends Record<string, unknown>, Parent extends string | undefined = undefined> = _<
	{
		[K in keyof T]: Parent extends string
		//Parent
		? T[K] extends Record<string, unknown>
		? `${Parent}.${PPath<T[K]>}` | Path<T[K], `${Parent}.${Str<K>}`>
		: `${Parent}.${Str<K>}`
		//No parent
		: T[K] extends Record<string, unknown>
		? `${Str<K>}.${PPath<T[K]>}` | Path<T[K], Str<K>> | K
		: K;
	}[keyof T]
>;
//| ArrayPath<T>;
/* eslint-enable prettier/prettier */

type e = Path<{
	str: string;
	foo: {
		bar: string;
		baz: {
			deep: boolean;
			deeper: {
				nest: number;
			};
		};
	};
}>;

//TODO type data and mutators
export interface Replica<D = {}> {
	//shared
	readonly Data: D;
	readonly Id: number;
	readonly Class: string;
	readonly Tags: {};
	readonly Parent: Replica | undefined;
	readonly Children: Replica[];
	Identify(): string;
	AddCleanupTask(task: Task): void;
	RemoveCleanupTask(task: Task): void;

	//built-in mutators
	SetValue(path: unknown, value: unknown): void;
	SetValues(path: unknown, values: unknown): void;
	ArrayInsert(path: unknown, value: unknown): number;
	ArraySet(path: unknown, index: number, value: unknown): void;
	ArrayRemove(path: unknown, index: number): unknown;
	Write(functionName: string, ...params: unknown[]): unknown;

	//server
	//TODO add @server jsdoc
	SetParent(replica: Replica): void;
	//TODO finish
	ReplicateFor(): void;
	//TODO finish
	DestroyFor(): void;
	ConnectOnServerEvent(listener: (player: Player, ...args: unknown[]) => void): RBXScriptConnection;
	FireClient(player: Player, ...params: unknown[]): void;
	FireAllClients(...args: unknown[]): void;
	Destroy(): void;

	//client
	//TODO add @client jsdoc
	ListenToWrite(functionName: string, listener: (...args: unknown[]) => void): RBXScriptConnection;
	//TODO finish typing this crap
	ListenToChange(path: unknown, listener: (newValue: unknown, oldValue: unknown) => void): RBXScriptConnection;
	ListenToNew(path: unknown, listener: (newValue: unknown, oldValue: unknown) => void): RBXScriptConnection;
	ListenToArrayInsert(path: unknown, listener: (newValue: unknown, oldValue: unknown) => void): RBXScriptConnection;
	ListenToArraySet(path: unknown, listener: (index: unknown, newValue: unknown) => void): RBXScriptConnection;
	ListenToArrayRemove(listener: (oldIndex: unknown, oldValue: unknown) => void): RBXScriptConnection;

	ListenToRaw(listener: (actionName: "SetValue", pathArray: unknown[], value: unknown) => void): RBXScriptConnection;
	ListenToRaw(
		listener: (actionName: "SetValues", pathArray: unknown[], values: unknown[]) => void,
	): RBXScriptConnection;
	ListenToRaw(
		listener: (actionName: "ArrayInsert", pathArray: unknown[], value: unknown) => void,
	): RBXScriptConnection;
	ListenToRaw(
		listener: (actionName: "ArraySet", pathArray: unknown[], index: number, value: unknown) => void,
	): RBXScriptConnection;
	ListenToRaw(
		listener: (actionName: "ArrayRemove", pathArray: unknown[], index: number, oldValue: unknown) => void,
	): RBXScriptConnection;

	ListenToChildAdded(listener: (replica: Replica) => void): RBXScriptConnection;
	FindFirstChildOfClass(replicaClass: Replica["Class"]): Replica | undefined;
	ConnectOnClientEvent(listener: (...params: unknown[]) => void): RBXScriptConnection;
	FireServer(...params: unknown[]): void;
}

export interface ReplicaClassToken {}
