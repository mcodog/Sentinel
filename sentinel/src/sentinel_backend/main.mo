import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat32 "mo:base/Nat32";
import Float "mo:base/Float";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Hash "mo:base/Hash";
import Blob "mo:base/Blob";

actor sentinel_backend {

  // Metadata type
  type Metadata = {
    summary: Text;
    sentimentScore: Float;
    sentimentCategory: Text;
    tags: [Text];
  };

  type Consent = {
    user_id: Text;
    consent_type: Text;
    consent_text_version: Text;
    consent_given: Bool;
    method: Text;
  };

  type OldAuditLogEntry = {
    user_id: Nat;
    action: Text;
    details: Text;
  };

  type AuditLogEntry = {
    user_id: Text;
    action: Text;
    details: ?Text;
  };

  type AuditLogBlock = {
    index: Nat;
    timestamp: Time.Time;
    previousHash: Text;
    entryHash: Text;
    currentHash: Text;
  };

  // Block type
  type Block = {
    index: Nat;
    timestamp: Time.Time;
    previousHash: Text;
    metadataHash: Text;
    currentHash: Text;
  };

  type ConsentBlock = {
    index: Nat;
    timestamp: Time.Time;
    previousHash: Text;
    consentHash: Text;
    currentHash: Text;
  };

  // Blockchain storage
  stable var blockchain : [Block] = [];

  // Consent Blockchain storage
  stable var consent_blockchain : [ConsentBlock] = [];

 // Old stable vars (still required to avoid error for now)
  stable var audit_log_entries: [OldAuditLogEntry] = [];
  stable var audit_log_blockchain: [AuditLogBlock] = [];

  // New ones (optional, if replacing)
  stable var audit_log_entries_v2: [AuditLogEntry] = [];
  stable var audit_log_blockchain_v2: [AuditLogBlock] = [];

  system func preupgrade() {
    // Wipe the old data explicitly
    audit_log_entries := [];
    audit_log_blockchain := [];
  };

 stable var auditBlockChain: [AuditLogBlock] = [];


  // Custom join function for tags
  func joinTags(tags: [Text]): Text {
    if (tags.size() == 0) {
      return "";
    };

    var result = tags[0];
    var i = 1;
    while (i < tags.size()) {
      result := result # ", " # tags[i];
      i += 1;
    };
    return result;
  };

  // Convert Metadata to a single text string
  func metadataToText(metadata: Metadata): Text {
    let tagsText = joinTags(metadata.tags);
    return "summary: " # metadata.summary #
           ", sentimentScore: " # Float.toText(metadata.sentimentScore) #
           ", sentimentCategory: " # metadata.sentimentCategory #
           ", tags: [" # tagsText # "]";
  };

  // Convert consent to a single text string
  func consentToText(consent: Consent): Text {
    return "user_id: " # consent.user_id #
       ", consent_type: " # consent.consent_type #
       ", consent_text_version: " # consent.consent_text_version #
       ", consent_given: " # Bool.toText(consent.consent_given) #
       ", method: " # consent.method;

  };

  // Simple hash using Text.hash -> Nat32, then to Text
  func simpleHash(input: Text): Text {
    return Nat32.toText(Text.hash(input));
  };

  // Public method to add a block with metadata
  public func addBlock(metadata: Metadata): async () {
    let ts = Time.now();
    let metadataString = metadataToText(metadata);
    let metadataHash = simpleHash(metadataString);

    let newIndex: Nat = if (blockchain.size() == 0) 0 else blockchain[blockchain.size() - 1].index + 1;
    let previousHash: Text = if (blockchain.size() == 0) "0" else blockchain[blockchain.size() - 1].currentHash;

    let raw = Text.concat(Nat.toText(newIndex), metadataHash # previousHash);
    let currentHash = simpleHash(raw);

    let newBlock: Block = {
      index = newIndex;
      timestamp = ts;
      previousHash = previousHash;
      metadataHash = metadataHash;
      currentHash = currentHash;
    };

    blockchain := Array.append<Block>(blockchain, [newBlock]);
  };

  public func addConsentBlock(consent: Consent): async () {
    let ts = Time.now();
    let consentString = consentToText(consent);
    let consentHash = simpleHash(consentString);

    let newIndex: Nat = if (consent_blockchain.size() == 0) {
      0;
    } else {
      consent_blockchain[consent_blockchain.size() - 1].index + 1;
    };

    let previousHash: Text = if (consent_blockchain.size() == 0) {
      "0";
    } else {
      consent_blockchain[consent_blockchain.size() - 1].currentHash;
    };

    let raw = Text.concat(Nat.toText(newIndex), consentHash # previousHash);
    let currentHash = simpleHash(raw);

    let newConsentBlock: ConsentBlock = {
      index = newIndex;
      timestamp = ts;
      previousHash = previousHash;
      consentHash = consentHash;
      currentHash = currentHash;
    };

    consent_blockchain := Array.append<ConsentBlock>(consent_blockchain, [newConsentBlock]);
  };

  public func addAuditLog(auditEntry: AuditLogEntry): async () {
    let ts = Time.now();

    // Create audit log entry without timestamp (timestamp is in the block)
    let newEntry: AuditLogEntry = {
      user_id = auditEntry.user_id;
      action = auditEntry.action;
      details = auditEntry.details;
    };

    let detailsText = switch (newEntry.details) {
      case (?d) d;
      case null "None";
    };


    // Serialize audit log entry
    let entryText =
      "user_id: " # newEntry.user_id #
      ", action: " # newEntry.action #
      ", details: " # detailsText;

    let entryHash = simpleHash(entryText);

    let newIndex: Nat = if (auditBlockChain.size() == 0) 0 else auditBlockChain[auditBlockChain.size() - 1].index + 1;
    let previousHash: Text = if (auditBlockChain.size() == 0) "0" else auditBlockChain[auditBlockChain.size() - 1].currentHash;

    // Concatenate the new index, timestamp (as Nat), entryHash, and previousHash to generate currentHash
    let rawBlockData = Text.concat(Nat.toText(newIndex), entryHash # previousHash);
    let currentHash = simpleHash(rawBlockData);

    let newBlock: AuditLogBlock = {
      index = newIndex;
      timestamp = ts;
      previousHash = previousHash;
      entryHash = entryHash;
      currentHash = currentHash;
    };

    auditBlockChain := Array.append<AuditLogBlock>(auditBlockChain, [newBlock]);
  };

  public query func getAuditLogs(): async [AuditLogBlock] {
    return auditBlockChain;
  };



  // Public query to fetch the blockchain
  public query func getBlockchain(): async [Block] {
    return blockchain;
  };

  // Public query to fetch the consent_blockchain
  public query func getConsentBlockChain(): async [ConsentBlock] {
    return consent_blockchain;
  };

  // Public query to remove all consent block chain(For dev and testing only!!!)
  public func removeAllConsentBlocks(): async() {
    consent_blockchain := [];
    Debug.print("All consent blocks removed");
  };

  // Public query to remove all audit logs(for dev and testing only!!!)
  public func removeAllAuditEntry(): async() {
    auditBlockChain:= [];
    Debug.print("All audit entries are removed");
  };

  //Public query to remove all blockchain for Metadata(For development & testing purposes only!!!)
  public func removeAllBlocks() : async () {
    blockchain := [];
    Debug.print("All blocks removed");
  };
};
