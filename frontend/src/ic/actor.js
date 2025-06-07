import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "./sentinel_backend.did";
import { canisterId } from "./index";

// Agent to connect to the IC (local or mainnet)
const agent = new HttpAgent({
  host: "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io", // use https://icp0.io for mainnet
});

// Fetch root key only in dev mode
if (import.meta.env.MODE === "development") {
  agent.fetchRootKey();
}

// Create an actor for your canister
export const backendActor = Actor.createActor(idlFactory, {
  agent,
  canisterId: "kndxn-qiaaa-aaaao-qkbza-cai",
});
