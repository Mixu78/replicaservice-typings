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
				WriteLib: {};
			}
		}
	}
	//Modify the Replicas interface to have each Replica class name you use as a key,
	//and an object with Data, Tags and WriteLib as the value. These objects should then contain the intended data, tags and optional WriteLib
	//for the replica.
```

# WriteLib example
shared/replicas.d.ts
```ts
import WriteLib from "./WriteLib";

declare global {
	interface Replicas {
		SomeReplica: {
			Data: {};
			Tags: {};
			WriteLib: typeof WriteLib;
		};
	}
}

export type SomeReplica = Replica<
	Replicas["SomeReplica"]["Data"],
	Replicas["SomeReplica"]["Tags"],
	Replicas["SomeReplica"]["WriteLib"]
>;
```

shared/WriteLib.ts
```ts
import { SomeReplica } from "examples/shared/replicas";

export = {
	RestockAll: (replica: SomeReplica) => {
		replica.SetValue(["Cans"], 10);
	},
};
```

server/main.ts
```ts
import { ReplicaService } from "@rbxts/replicaservice";

const ReplicatedStorage = game.GetService("ReplicatedStorage");
const shared = ReplicatedStorage.FindFirstChild("TS") as Folder; //This may vary depending on your rojo configuration
const writeLib = shared.FindFirstChild("WriteLib") as ModuleScript;

const token = ReplicaService.NewClassToken("SomeReplica");

const replica = ReplicaService.NewReplica({
	ClassToken: token,
	Data: {
		Cans: 5,
	},
	WriteLib: writeLib,
});

replica.Write(["RestockAll"]);

```

# [ReplicaService Basic Usage](https://madstudioroblox.github.io/ReplicaService/tutorial/basic_usage/) translated to TS

A .d.ts file
```ts
declare global {
	interface Replicas {
		TestReplica: {
			Data: { Value: number };
			Tags: {};
			WriteLib: {};
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