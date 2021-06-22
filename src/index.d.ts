type Cleanable =
	| {
			Destroy(): void;
	  }
	| {
			Disconnect(): void;
	  };

type Task = Callback | Instance | Cleanable;

type ReplicationSetting = "All" | Map<Player, true> | Player;

//eslint-disable-next-line @typescript-eslint/no-explicit-any
type Array<T> = T extends any[] ? T : never[];
type Str<T> = Extract<T, string>;
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

type ArrayPath<T> = ArrayPathImpl<T, keyof T>;
type StringPath<T> = StringPathImpl<T, keyof T>;
type Path<T> = StringPath<T> | ArrayPath<T>;

/* eslint-disable prettier/prettier */
type ArrayPathToString<T extends string[]> =
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

type PathValue<T, P extends Path<T>> = P extends ArrayPath<T>
	? //@ts-expect-error Lots of infering but not infinite
	  StringPathValue<T, ArrayPathToString<P>>
	: P extends StringPath<T>
	? StringPathValue<T, P>
	: never;

type PathValues<T, P extends Path<T>, V = PathValue<T, P>> = {
	[K in keyof V]: V[K];
};

//TODO type data and mutators
export interface Replica<D extends Record<string, unknown> = {}, T extends Record<string, unknown> = {}> {
	/**
	 * Table representing the state wrapped by the `Replica`.
	 * Note that after wrapping a table with a `Replica` you may no longer write directly to that table
	 * (doing so would potentially desynchronize state among clients and in some cases even break code)
	 * \- all changes must be applied through [mutators](https://madstudioroblox.github.io/ReplicaService/api/#built-in-mutators).
	 */
	readonly Data: D;
	/**
	 * An identifier that is unique for every `Replica` within a Roblox game session.
	 */
	readonly Id: number;
	/**
	 * The `className` parameter that has been used for the ReplicaClassToken used to create this `Replica`.
	 */
	readonly Class: string;
	/**
	 * A custom static Replica identifier mainly used for referencing affected game instances.
	 * Only used for properties that will not change for the rest of the Replica's lifespan.
	 */
	readonly Tags: T;
	/**
	 * Reference to the parent `Replica`.
	 * All **nested replicas** *will* have a parent.
	 * **All top level replicas** will have their `Parent` property set to `nil`.
	 * **Nested replicas** will never become **top level replicas** and vice versa.
	 */
	readonly Parent: Replica | undefined;
	/**
	 * An array of replicas parented to this `Replica`.
	 */
	readonly Children: Replica[];
	/**
	 * Creates a brief string description of a `Replica`, excluding `Replica.Data` contents. Used for debug purposes.
	 */
	Identify(): string;
	/**
	 * Signs up a task, object, instance or function to be ran or destroyed when the `Replica` is destroyed.
	 * The cleanup task is performed instantly if the `Replica` is already destroyed.
	 */
	AddCleanupTask(task: Task): void;
	/**
	 * Removes the cleanup task from the cleanup list.
	 */
	RemoveCleanupTask(task: Task): void;

	/**
	 * Sets any individual value within `Replica.Data` to `value`.
	 * Parameter `value` can be `nil` and will set the value located in `path` to `nil`.
	 */
	SetValue<P extends Path<D>>(path: P, value: PathValue<D, P>): void;
	/**
	 * Sets multiple keys located in `path` to specified `values`
	 */
	SetValues<P extends Path<D>>(path: P, values: Partial<PathValues<D, P>>): void;
	/**
	 * Performs `table.insert(t, value)` where `t` is a numeric sequential array `table` located in `path`.
	 */
	ArrayInsert<P extends Path<D>>(path: P, value: Array<PathValue<D, P>>[number]): number;
	/**
	 * Performs `t[index] = value` where `t` is a numeric sequential array `table` located in `path`.
	 */
	ArraySet<P extends Path<D>>(path: P, index: number, value: Array<PathValue<D, P>>[number]): void;
	/**
	 * Performs `table.remove(t, index)` where `t` is a numeric sequential array `table` located in `path`.
	 */
	ArrayRemove<P extends Path<D>>(path: P, index: number): Array<PathValue<D, P>>[number];
	//TODO writelib types?
	/**
	 * Calls a function within a [WriteLib](https://madstudioroblox.github.io/ReplicaService/api/#writelib)
	 * that has been assigned to this `Replica`
	 * for both the server and all clients that have this `Replica` replicated to them.
	 */
	Write(functionName: string, ...params: unknown[]): unknown;

	/**
	 * Changes the `Parent` of the `Replica`.
	 *
	 * **Only nested replicas can have their parents changed (nested replicas are replicas that were initially created with a parent).**
	 *
	 * If a `Replica`, from a single player's perspective, is moved from a non-replicated parent to a replicated parent,
	 * the replica will be created for the player as expected.
	 * Likewise, parenting a replica to a non-replicated replica will destroy it for that player.
	 * This feature is useful for controlling visible game chunks with entities that can move between those chunks.
	 *
	 * @server
	 */
	SetParent(replica: Replica): void;
	/**
	 * Changes replication settings (subscription settings) for select players.
	 *
	 * **Only top level replicas can have their replication settings changed
	 * (top level replicas are replicas that were initially created without a parent).**
	 *
	 * @server
	 */
	ReplicateFor(replicateSetting: ReplicationSetting): void;
	/**
	 * Changes replication settings (subscription settings) for select players.
	 *
	 * **Only top level replicas can have their replication settings changed
	 * (top level replicas are replicas that were initially created without a parent).**
	 *
	 * **Warning**
	 *
	 * Selectively destroying Replica:DestroyFor(player) for clients when the replica is replicated to "All" will throw an error
	 * \- Call Replica:DestroyFor("All") first.
	 *
	 * @server
	 */
	DestroyFor(destroySetting: ReplicationSetting): void;
	/**
	 * Simulates the behaviour of
	 * [RemoteEvent.OnServerEvent](https://developer.roblox.com/en-us/api-reference/class/RemoteEvent#onserverevent-instance-player-tuple-arguments-).
	 *
	 * @server
	 */
	ConnectOnServerEvent(listener: (player: Player, ...args: unknown[]) => void): RBXScriptConnection;
	/**
	 * Simulates the behaviour of
	 * [RemoteEvent:FireClient()](https://developer.roblox.com/en-us/api-reference/class/RemoteEvent#fireclient-instance-player-tuple-arguments-).
	 *
	 * @server
	 */
	FireClient(player: Player, ...params: unknown[]): void;
	/**
	 * Simulates the behaviour of
	 * [RemoteEvent:FireAllClients()](https://developer.roblox.com/en-us/api-reference/class/RemoteEvent#fireallclients-tuple-arguments-).
	 *
	 * @server
	 */
	FireAllClients(...args: unknown[]): void;
	/**
	 * Destroys replica and all of its descendants (Depth-first).
	 * `Replica` destruction signal is sent to the client first,
	 * while cleanup tasks assigned with `Replica:AddCleanupTask()` will be performed after.
	 *
	 * @server
	 */
	Destroy(): void;

	//TODO add @client jsdoc
	//TODO writelib types?
	/**
	 * Listens to WriteLib mutator functions being triggered.
	 * See [WriteLib](https://madstudioroblox.github.io/ReplicaService/api/#writelib) section for examples.
	 *
	 * @client
	 */
	ListenToWrite(functionName: string, listener: (...args: unknown[]) => void): RBXScriptConnection;
	/**
	 * Creates a listener which gets triggered by `Replica:SetValue()` calls.
	 *
	 * @client
	 */
	ListenToChange<P extends Path<D>>(
		path: P,
		listener: (newValue: PathValue<D, P>, oldValue: PathValue<D, P>) => void,
	): RBXScriptConnection;
	/**
	 * Creates a listener which gets triggered by `Replica:SetValue()` calls when
	 * a new key is created inside `path` (value previously equal to nil).
	 * Note that this listener can't reference the key itself inside `path`.
	 *
	 * @client
	 */
	ListenToNewKey(path: unknown, listener: (newValue: unknown, newKey: string) => void): RBXScriptConnection;
	/**
	 * Creates a listener which gets triggered by `Replica:ArrayInsert()` calls.
	 *
	 * @client
	 */
	ListenToArrayInsert<P extends Path<D>>(
		path: P,
		listener: (newIndex: number, oldValue: Array<PathValue<D, P>>[number]) => void,
	): RBXScriptConnection;
	/**
	 * Creates a listener which gets triggered by `Replica:ArraySet()` calls.
	 *
	 * @client
	 */
	ListenToArraySet<P extends Path<D>>(
		path: P,
		listener: (index: number, newValue: Array<PathValue<D, P>>[number]) => void,
	): RBXScriptConnection;
	/**
	 * Creates a listener which gets triggered by `Replica:ArrayRemove()` calls.
	 *
	 * @client
	 */
	ListenToArrayRemove<P extends Path<D>>(
		path: P,
		listener: (oldIndex: number, oldValue: Array<PathValue<D, P>>[number]) => void,
	): RBXScriptConnection;

	/**
	 * Allows the developer to parse exact arguments that have been passed to any of the
	 * [built-in mutators](https://madstudioroblox.github.io/ReplicaService/api/#built-in-mutators).
	 *
	 * @client
	 */
	ListenToRaw(
		listener: (actionName: "SetValue", pathArray: ArrayPath<D>[], value: PathValue<D, ArrayPath<D>>) => void,
	): RBXScriptConnection;
	ListenToRaw(
		listener: (actionName: "SetValues", pathArray: ArrayPath<D>[], value: PathValues<D, ArrayPath<D>>) => void,
	): RBXScriptConnection;
	ListenToRaw(
		listener: (
			actionName: "ArrayInsert",
			pathArray: ArrayPath<D>,
			value: Array<PathValue<D, ArrayPath<D>>>[number],
		) => void,
	): RBXScriptConnection;
	ListenToRaw(
		listener: (
			actionName: "ArraySet",
			pathArray: ArrayPath<D>,
			index: number,
			value: Array<PathValue<D, ArrayPath<D>>>[number],
		) => void,
	): RBXScriptConnection;
	ListenToRaw(
		listener: (
			actionName: "ArrayRemove",
			pathArray: ArrayPath<D>,
			index: number,
			oldValue: Array<PathValue<D, ArrayPath<D>>>[number],
		) => void,
	): RBXScriptConnection;

	/**
	 * Creates a listener which gets triggered when a new child `Replica` is created.
	 *
	 * @client
	 */
	ListenToChildAdded(listener: (replica: Replica) => void): RBXScriptConnection;
	/**
	 * Returns a first child `Replica` of specified class if one exists.
	 *
	 * @client
	 */
	FindFirstChildOfClass(replicaClass: Replica["Class"]): Replica | undefined;
	/**
	 * Simulates the behaviour of
	 * [RemoteEvent.OnClientEvent](https://developer.roblox.com/en-us/api-reference/class/RemoteEvent#onclientevent-tuple-arguments-).
	 *
	 * @client
	 */
	ConnectOnClientEvent(listener: (...params: unknown[]) => void): RBXScriptConnection;
	/**
	 * Simulates the behaviour of
	 * [RemoteEvent:FireServer()](https://developer.roblox.com/en-us/api-reference/class/RemoteEvent#fireserver-tuple-arguments-).
	 *
	 * @client
	 */
	FireServer(...params: unknown[]): void;
}

export type ReplicaClassToken = symbol;
