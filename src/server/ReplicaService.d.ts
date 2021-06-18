import { Replica, ReplicaClassToken } from "index";

export interface ReplicaService {
	ActivePlayers: ReadonlyMap<Player, true>;
	NewActivePlayerSignal: RBXScriptSignal<(player: Player) => void>;
	RemovedActivePlayerSignal: RBXScriptSignal<(player: Player) => void>;
	Temporary: Replica;

	NewClassToken(className: string): ReplicaClassToken;
	NewReplica<D = {}>(replicaParams: {
		ClassToken: ReplicaClassToken;
		Tags?: {};
		Data?: D;
		Replication?: "All" | Map<Player, true> | Player;
		Parent?: Replica;
		WriteLib?: ModuleScript;
	}): Replica<D>;
}
