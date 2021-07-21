# replicaservice-typings
roblox-ts typings for MadStudioRoblox's ReplicaService

# Usage
```ts
	//Client side, errors if used on server!
	import { ReplicaController } from "@rbxts/replicaservice"

	//Server side, errors if used on client!
	import { ReplicaService } from "@rbxts/replicaservice"

	//Somewhere in the project, preferrably a .d.ts file:
	declare global {
		interface Replicas {
			ReplicaName: {
				Data: {};
				Tags: {};
			}
		}
	}
	//Modify the Replicas interface to have each Replica class name you use as a key,
	//and an object of Data: {} and Tags: {} properties. These should then contain the intended data and tags
	//respectively for the replica
```

# [ReplicaService Basic Usage](https://madstudioroblox.github.io/ReplicaService/tutorial/basic_usage/) translated to TS

A .d.ts file
```ts
declare global {
	interface Replicas {
		TestReplica: {
			Data: { Value: number };
			Tags: {};
		};
	}
}
```

Server
```ts
import { ReplicaService } from "@rbxts/replicaservice";

const test_replica = ReplicaService.NewReplica({
	ClassToken: ReplicaService.NewClassToken("TestReplica"),
	Data: { Value: 0 },
	Replication: "All",
})

while (wait(1)) {
	test_replica.SetValue(["Value"], test_replica.Data.Value + 1);
}
```

Client
```ts
import { ReplicaController } from "@rbxts/replicaservice";
ReplicaController.ReplicaOfClassCreated("TestReplica", (replica) => {
	print("TestReplica received! Value:", replica.Data.Value);

	replica.ListenToChange(["Value"], (new_value) => {
		print("Value changed:", new_value);
	});
});

ReplicaController.RequestData(); // This function should only be called once
//   in the entire codebase! Read the documentation for more info.

```