local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local RunService = game:GetService("RunService")

local ServerFolder
local SharedFolder

local ReplicaService
local ReplicaController

if (RunService:IsServer()) then
  ServerFolder = script.Parent:WaitForChild("Server")
  ServerFolder.Name = "_RS_Server"
  ServerFolder.Parent = ServerScriptService
  ReplicaService = ServerFolder:WaitForChild("ReplicaService")
elseif (RunService:IsClient()) then
  SharedFolder = script.Parent:WaitForChild("Shared")
  SharedFolder.Name = "_RS_Shared"
  SharedFolder.Parent = ReplicatedStorage
  ReplicaController = SharedFolder:WaitForChild("ReplicaController")
end

return {
  ReplicaService = (RunService:IsServer() and ReplicaService) and require(ReplicaService) or {},
  ReplicaController = (RunService:IsClient() and ReplicaController) and require(ReplicaController) or {}
}