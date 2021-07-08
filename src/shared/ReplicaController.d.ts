import { Replica } from "../index";

type ReplicaClassToken<T extends keyof Replicas> =
	| symbol
	| {
			/**
			 * @deprecated
			 * @hidden
			 */
			__originalName: T;
	  };

/**
 * @client
 */
export interface ReplicaController {
	/**
	 * Fired once after the client finishes receiving initial replica data from server.
	 */
	InitialDataReceivedSignal: RBXScriptSignal;
	/**
	 * Set to true after the client finishes receiving initial replica data from server.
	 */
	InitialDataReceived: boolean;

	/**
	 * Listens to creation of replicas client-side of a particular class.
	 *
	 * This is the preferred method of grabbing references to all replicas clients-side.
	 */
	ReplicaOfClassCreated: <C extends keyof Replicas>(
		replicaClass: C,
		listener: (replica: Replica<Replicas[C]["Data"], Replicas[C]["Tags"]>) => void,
	) => RBXScriptConnection;
	/**
	 * Fired every time a replica is created client-side.
	 */
	NewReplicaSignal: RBXScriptSignal<(replica: Replica) => void>;
	/**
	 * Returns a `Replica` that is loaded client-side with a `Replica.Id` that matches `replicaId`.
	 */
	GetReplicaById: (replicaId: Replica["Id"]) => Replica | undefined;
	/**
	 * Requests the server to start sending replica data.
	 *
	 * **All `.NewReplicaSignal` and `.ReplicaOfClassCreated()` listeners should be connected before calling `.RequestData()`!
	 * \- refrain from connecting listeners afterwards!**
	 *
	 * If your game has local scripts that may run later during gameplay and they will need to interact with replicas,
	 * you should create a centralized module that connects `Replica` creation listeners before `.RequestData()` and
	 * provides those local scripts with the replica references they need.
	 */
	RequestData: () => void;
}
