import { Replica, ReplicaClassToken, ReplicationSetting } from "index";

/**
 * @server
 */
export interface ReplicaService {
	/**
	 * A reference of players that have received initial data
	 * \- having received initial data means having access to all replicas that are selectively replicated to that player.
	 */
	ActivePlayers: ReadonlyMap<Player, true>;
	/**
	 * A signal for new `ReplicaService.ActivePlayers` entries.
	 */
	NewActivePlayerSignal: RBXScriptSignal<(player: Player) => void>;
	/**
	 * A signal for removed `ReplicaService.RemovedActivePlayerSignal` entries.
	 */
	RemovedActivePlayerSignal: RBXScriptSignal<(player: Player) => void>;
	/**
	 * A replica that is not replicated to any player and a "helper" for creating nested `Replica` objects
	 * when immediate replication of individual nested replicas is not desirable.
	 */
	Temporary: Replica;

	/**
	 * Class tokens for a particular class_name can only be created once
	 * \- this helps the developer avoid Replica class name collisions when merging codebases.
	 */
	NewClassToken(className: string): ReplicaClassToken;
	/**
	 * Creates a replica and immediately replicates to select active players based on
	 * replication settings of this `Replica` or the parent `Replica`.
	 */
	NewReplica<D extends Record<string, unknown> = {}, T extends Record<string, unknown> = {}>(replicaParams: {
		/**
		 * Sets` Replica.Class` to the string provided in `ReplicaService.NewClassToken(className)`
		 */
		ClassToken: ReplicaClassToken;
		/**
		 * (Default: {} empty table)
		 * A dictionary of identifiers.
		 * Use Tags to let the client know which game objects the Replica belongs to:
		 * Tags = {Part = part, Player = player, ...}.
		 * Tags can't be changed after the Replica is created.
		 */
		Tags?: T;
		/**
		 * (Default: {} empty table)
		 * A table representing a state. Using Profile.Data from ProfileService is valid!
		 */
		Data?: D;
		/**
		 * (Default: {} not replicated to anyone)
		 * Pass "All" to replicate to everyone in the game and everyone who will join the game later.
		 * Pass {Player = true, Player = true, ...} dictionary or Player instance for selective replication.
		 */
		Replication?: ReplicationSetting;
		/**
		 * (Default: nil)
		 * Don't provide any value to create a top level replica
		 * \- top level replicas can't be parented to other replicas and force their replication settings to
		 * all descendant nested replicas. Providing a parent creates a nested replica
		 * \- nested replicas can be parented to any replica (except their own children),
		 * but they can't have their own replication settings.
		 * Hence the Replication and Parent parameters are mutually exclusive.
		 */
		Parent?: Replica;
		/**
		 * (Default: nil)
		 * Provide a ModuleScript (not the return of require()) to assign write functions (mutator functions) to this replica.
		 * The WriteLib parameter is individual for every Replica.
		 */
		WriteLib?: ModuleScript;
	}): Replica<D>;
}
