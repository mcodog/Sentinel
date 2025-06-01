import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "./sentinel_backend.did";
import { canisterId } from "./index";

// Agent to connect to the IC (local or mainnet)
const agent = new HttpAgent({
  host: "http://127.0.0.1:4943", // use https://icp0.io for mainnet
});

// Fetch root key only in dev mode
if (import.meta.env.MODE === "development") {
  agent.fetchRootKey();
}

// Create an actor for your canister
export const backendActor = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});
