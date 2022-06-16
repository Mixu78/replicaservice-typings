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

## [NEW] Some TS-specific Implementations:
- Exposed `ReplicaService._replicas` map for looking-up replicas server-side given replica ID
- Utilizing WriteLib auto-completion and type checking (note that all WriteLib function definitions **MUST be defined as arrow functions / callbacks [see [here](https://roblox-ts.com/docs/guides/callbacks-vs-methods)], the type passed to `ListenToWrite` does not matter) - here are some snippets from my own project:  

`typings/global.d.ts`
```ts
import PlayerLib from "ReplicatedStorage/WriteLib/Player";
import { PlayerData } from "./replica";

declare global {
    interface Replicas {
        Player: {
            Data: PlayerData;
            Tags: { player: Player };
            WriteLib: typeof PlayerLib;
        };
    }
}
```

`typings/replica.ts`
```ts
import { Replica } from "@rbxts/replicaservice";

type ReplicaType<T extends keyof Replicas> = Replica<Replicas[T]["Data"], Replicas[T]["Tags"], Replicas[T]["WriteLib"]>

export type PlayerRawData = {};
export type PlayerData = PlayerRawData & {
    currency: number;
};
export type PlayerReplica = ReplicaType<"Player">;
```

`ReplicatedStorage/WriteLib/Player.ts (WriteLib)`
```ts
import { RunService } from "@rbxts/services";
import { PlayerReplica } from "typings/replica";

const PlayerLib = {
    SetCurrency: function(replica: PlayerReplica, amount: number) {
        const clientServer = RunService.IsClient() ? "client" : "server";

        const oldCurrency = replica.Data.currency;
        const newCurrency = amount;

        replica.SetValue("currency", newCurrency);
    },
};

export = PlayerLib;
```

Usage examples within client and server:
```ts
// Client, with replica already initialized (or cast to PlayerReplica)
replica.Write("SetCurrency", 500);

// Server, with replica already initialized (or cast to PlayerReplica)
replica.ListenToWrite("SetCurrency", (amount: number) => { 
	print("New currency amount:", amount);
});
```