import { Task, Array, Path, ArrayPath, PathValue, PathValues } from "./util";

import { ReplicaService } from "./server/ReplicaService";
import { ReplicaController } from "./shared/ReplicaController";

declare global {
	interface Replicas {}
}

type ReplicationSetting = "All" | Map<Player, true> | Player;

// https://stackoverflow.com/questions/58764853/typescript-remove-first-argument-from-a-function
type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

export interface Replica<D extends Record<string, unknown> = {}, T extends Record<string, unknown> = {},
	W extends Record<string, unknown> | undefined = {}> {
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
	readonly Class: keyof Replicas;
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
	 * (strawberriaaa)
	 * Experimental WriteLib typings
	 */
	readonly WriteLib: W;
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
	/**
	 * Calls a function within a [WriteLib](https://madstudioroblox.github.io/ReplicaService/api/#writelib)
	 * that has been assigned to this `Replica`
	 * for both the server and all clients that have this `Replica` replicated to them.
	 */
	Write<P extends Path<W>>(functionName: P, ...params: Parameters<OmitFirstArg<PathValue<W, P>>>): ReturnType<PathValue<W, P>>;

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
	/**
	 * Listens to WriteLib mutator functions being triggered.
	 * See [WriteLib](https://madstudioroblox.github.io/ReplicaService/api/#writelib) section for examples.
	 *
	 * @client
	 */
	ListenToWrite<P extends Path<W>>(functionName: P, listener: (...args: Parameters<OmitFirstArg<PathValue<W, P>>>) => void): RBXScriptConnection;
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

/**
 * @server
 */
export declare const ReplicaService: ReplicaService;
/**
 * @client
 */
export declare const ReplicaController: ReplicaController;