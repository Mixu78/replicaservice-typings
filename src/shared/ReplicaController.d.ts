import { Replica, ReplicaClassToken } from "index";

export interface ReplicaController {
	InitialDataReceivedSignal: RBXScriptSignal;
	InitialDataReceived: boolean;

	ReplicaOfClassCreated(replicaClass: ReplicaClassToken, listener: (replica: Replica) => void): RBXScriptConnection;
	NewReplicaSignal: RBXScriptSignal<(replica: Replica) => void>;
	GetReplicaById(id: Replica["Id"]): Replica | undefined;
}
