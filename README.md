# 🧩 ReplicaService Typings

> `roblox-ts` typings for ReplicaService made by MadStudio.

## 🔢 Table of Contents

- [📰 About This Package](#-about-this-package)
- [🔗 TypeScript Example](#-typescript-example)
- [✨ Recommendations](#-recommendations)
- [⛔ Limitations](#-limitations)
- [❔ Frequently Asked Questions](#-frequently-asked-questions)
- [📜 Documentation](#-documentation)
- [⚠️ Support](#-support)

## 📰 About This Package

ReplicaService is a selective state replication system. ReplicaService helps you make server code which changes and replicates any state to select clients.

Assume that a [state (Wikipedia)](<https://en.wikipedia.org/wiki/State_(computer_science)>) is any kind of data that has a present version and may also change at any time in the future, as many times as necessary. The data about a player which you load up during gameplay or save to the DataStore is a state. The color of a part, text shown on a users screen and furniture placed in a player owned house are all states - ReplicaService helps you make server-side code to control and replicate any state to all clients at once or only a select few.

A state (in layman’s terms, a lua table that may contain almost anything) is wrapped with a Replica - like the name implies, it creates a [replica (identical copy)](https://en.wikipedia.org/wiki/Replica) of the wrapped state on the client-side of users you want to see that state. You may define clients who will see that replica, call mutator functions on the Replica to change the state (will change contents of the wrapped table) and make the clients listen to those changes or simply read the state whenever necessary. Furthermore, a Replica can be parented to another Replica (with a few exceptions discussed later), unloaded for select clients and, of course, destroyed.

What's good about ReplicaService:

- **Just replication, whatever you need replicated** - The goal of ReplicaService is to streamline custom Roblox object replication from server to client. ReplicaService avoids being redundant and tackles as few concerns as possible.

- **Chunks & player houses** - Selective replication allows you to make a "custom [StreamingEnabled](https://developer.roblox.com/en-us/articles/content-streaming) implementation" with full server-side control - load in nearby chunks, load in interiors and furniture only when the player enters those areas!

- **"It don't go brrrrr"** - ReplicaService is completely event-based and only tells the client the data that changes - it keeps the network usage low and conserves computer resources.

- **Go big, go small** - Use custom mutators for minimal bandwith and gain access to client-side listeners that react to bulk changes instead of individual values. Use built-in mutators for rapid implementations while still keeping your network use very low.

## 🔗 TypeScript Example

`default.project.json`

```json
{
  "name": "typescript-example",
  "globIgnorePaths": ["**/package.json", "**/tsconfig.json"],
  "tree": {
    "ReplicatedStorage": {
      "$className": "ReplicatedStorage",
      "$path": "out/Shared",
      "Runtime": {
        "$path": "include",
        "node_modules": {
          "$className": "Folder",
          "@rbxts": {
            "$path": "node_modules/@rbxts"
          }
        }
      }
    },
    "$className": "DataModel",
    "ServerScriptService": {
      "$className": "ServerScriptService",
      "$path": "out/Server"
    },
    "StarterPlayer": {
      "$className": "StarterPlayer",
      "StarterPlayerScripts": {
        "$className": "StarterPlayerScripts",
        "$path": "out/Client"
      }
    }
  }
}
```

`src/Types/Replicas.d.ts`

```ts
import { Replica } from "@rbxts/replicaservice";
import PlayerDataReplicaWriteLib from "../Shared/WriteLibs/PlayerData";

declare global {
  interface Replicas {
    PlayerData: {
      Data: {
        Money: number;
      };
      Tags: {};
      WriteLib: typeof PlayerDataReplicaWriteLib;
    };
  }
}

export type PlayerDataReplica = Replica<
  Replicas["PlayerData"]["Data"],
  Replicas["PlayerData"]["Tags"],
  Replicas["PlayerData"]["WriteLib"]
>;
```

`src/Shared/WriteLibs/PlayerData.ts`

```ts
import { PlayerDataReplica } from "../../Types/Replicas.d";

export = {
  ChangeMoney: (replica: PlayerDataReplica, method: "Add" | "Sub", value: number) => {
    const FinalValue = method === "Add" ? replica.Data.Money + value : replica.Data.Money - value;
    if (FinalValue < 0) return replica.SetValue(["Money"], 0);
    replica.SetValue(["Money"], FinalValue);
  },
};
```

`src/Server/Main.server.ts`

```ts
import { ReplicaService } from "@rbxts/replicaservice";
import { Players, ReplicatedStorage } from "@rbxts/services";

const PlayerDataReplicaWriteLib: ModuleScript = ReplicatedStorage.WaitForChild("WriteLibs").WaitForChild(
  "PlayerData",
) as ModuleScript; // This varies depending on your "default.project.json" paths.

Players.PlayerAdded.Connect((player: Player) => {
  const PlayerDataReplica = ReplicaService.NewReplica({
    ClassToken: ReplicaService.NewClassToken("PlayerData"),
    Data: {
      Money: 500,
    },
    Replication: player,
    WriteLib: PlayerDataReplicaWriteLib,
  });

  while (task.wait(1)) {
    PlayerDataReplica.Write("ChangeMoney", "Add", 500);
    // This example uses WriteLib feature of ReplicaService, but if you don't want/don't need to use a WriteLib, then you can do: PlayerDataReplica.SetValue(["Money"], PlayerDataReplica.Data.Money + 500)
  }
});
```

`src/Client/Main.client.ts`

```ts
import { ReplicaController } from "@rbxts/replicaservice";

ReplicaController.ReplicaOfClassCreated("PlayerData", (replica) => {
  print(`PlayerData replica received! Received player money: ${replica.Data.Money}`);

  replica.ListenToChange(["Money"], (newValue) => {
    print(`Money changed: ${newValue}`);
  });
});

ReplicaController.RequestData(); // This function should only be called once in the entire codebase! Read the documentation for more information.
```

## ✨ Recommendations

- Make your `Replica.Data` simple and small without too many keys inside another keys.

## ⛔ Limitations

- Paths (`StringPath` and `ArrayPath`) can only access **21 keys** of an object (this was added as a fix to the issue "Type instantiation is excessively deep and possibly infinite").

## ❔ Frequently Asked Questions

1. **My editor features (autocomplete, others) are laggy, what can I do?** Reopen your code editor (or if you're using Visual Studio Code, restart the TypeScript server), if it's still laggy, contact me in the `roblox-ts` server.
2. **I can't access a key in my object that is inside 35 keys!** Read the [limitations](#-limitations) and [recommendations](#-recommendations).

## 📜 Documentation

Visit the following website to go to the official ReplicaService documentation: https://madstudioroblox.github.io/ReplicaService/

## ⚠️ Support

If you are having issues with typings, join `roblox-ts` Discord server and mention any of the collaborators ([Mixu_78](https://discord.com/users/255257883250393091), or [Sandy Stone](https://discord.com/users/1018447375079063573)) with your issue and we'll try to help the maximum we can.

If you are having issues with ReplicaService and not the typings, [file an issue in the GitHub repository](https://github.com/MadStudioRoblox/ReplicaService/issues).
