type Cleanable =
	| {
			Destroy(): void;
	  }
	| {
			Disconnect(): void;
	  };

type Task = Callback | Instance | Cleanable;

type Str<T> = Extract<T, string>;

type AddParentArrToChildren<T extends Record<string, unknown>, P extends string[]> = _<
	{
		[K in keyof T]: [...P, Str<K>];
	}[keyof T]
>;

/* eslint-disable prettier/prettier */
type ArrayPath<T extends Record<string, unknown>, Parent extends string[] | undefined = undefined> = _<
	{
		[K in keyof T]: Parent extends string[]
		//String[] parent
		? T[K] extends Record<string, unknown>
		? AddParentArrToChildren<T[K], [...Parent, Str<K>]> | ArrayPath<T[K], [...Parent, Str<K>]>
		: [...Parent, Str<K>]
		//No parent
		: T[K] extends Record<string, unknown>
		? AddParentArrToChildren<T[K], [Str<K>]> | ArrayPath<T[K], [Str<K>]> | [K]
		: [K];
	}[keyof T]
>;
/* eslint-enable prettier/prettier */

type Children<T extends Record<string, unknown>> = _<
	{
		[K in keyof T]: Str<K>;
	}[keyof T]
>;

/* eslint-disable prettier/prettier */
type StringPath<T extends Record<string, unknown>, Parent extends string | undefined = undefined> = _<
	{
		[K in keyof T]: Parent extends string
		//Parent
		? T[K] extends Record<string, unknown>
		? `${Parent}.${Str<K>}.${Children<T[K]>}` | StringPath<T[K], `${Parent}.${Str<K>}`>
		: `${Parent}.${Str<K>}`
		//No parent
		: T[K] extends Record<string, unknown>
		? `${Str<K>}.${Children<T[K]>}` | StringPath<T[K], Str<K>> | K
		: K;
	}[keyof T]
>;
/* eslint-enable prettier/prettier */
type Path<T extends Record<string, unknown>> = StringPath<T> | ArrayPath<T>;

//TODO type data and mutators
export interface Replica<D extends Record<string, unknown> = {}> {
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
	SetValue(path: Path<D>, value: unknown): void;
	SetValues(path: Path<D>, values: unknown): void;
	ArrayInsert(path: Path<D>, value: unknown): number;
	ArraySet(path: Path<D>, index: number, value: unknown): void;
	ArrayRemove(path: Path<D>, index: number): unknown;
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
	ListenToChange(path: Path<D>, listener: (newValue: unknown, oldValue: unknown) => void): RBXScriptConnection;
	ListenToNew(path: Path<D>, listener: (newValue: unknown, oldValue: unknown) => void): RBXScriptConnection;
	ListenToArrayInsert(path: Path<D>, listener: (newValue: unknown, oldValue: unknown) => void): RBXScriptConnection;
	ListenToArraySet(path: Path<D>, listener: (index: unknown, newValue: unknown) => void): RBXScriptConnection;
	ListenToArrayRemove(listener: (oldIndex: unknown, oldValue: unknown) => void): RBXScriptConnection;

	ListenToRaw(listener: (actionName: "SetValue", pathArray: unknown[], value: unknown) => void): RBXScriptConnection;
	ListenToRaw(
		listener: (actionName: "SetValues", pathArray: ArrayPath<D>[], values: unknown[]) => void,
	): RBXScriptConnection;
	ListenToRaw(
		listener: (actionName: "ArrayInsert", pathArray: ArrayPath<D>[], value: unknown) => void,
	): RBXScriptConnection;
	ListenToRaw(
		listener: (actionName: "ArraySet", pathArray: ArrayPath<D>[], index: number, value: unknown) => void,
	): RBXScriptConnection;
	ListenToRaw(
		listener: (actionName: "ArrayRemove", pathArray: ArrayPath<D>[], index: number, oldValue: unknown) => void,
	): RBXScriptConnection;

	ListenToChildAdded(listener: (replica: Replica) => void): RBXScriptConnection;
	FindFirstChildOfClass(replicaClass: Replica["Class"]): Replica | undefined;
	ConnectOnClientEvent(listener: (...params: unknown[]) => void): RBXScriptConnection;
	FireServer(...params: unknown[]): void;
}

export interface ReplicaClassToken {}
