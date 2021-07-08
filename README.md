# replicaservice-typings
roblox-ts typings for MadStudioRoblox's ReplicaService

# Usage:
```ts
	//Client side, errors if used on server!
	import { ReplicaController } from "@rbxts/replicaservice"

	//Server side, errors if used on client!
	import { ReplicaService } from "@rbxts/replicaservice"

	//Somewhere in the project, preferrably a .d.ts file:
	declare global {
		interface Replicas {
			ReplicaName: {
				Data: {},
				Tags: {}
			}
		}
	}
	//Modify the Replicas interface to have each Replica class name you use as a key,
	//and an object of Data: {} and Tags: {} properties. These should then contain the intended data and tags
	//respectively for the replica
```