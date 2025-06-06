import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat32 "mo:base/Nat32";
import Debug "mo:base/Debug";

actor sentinel_backend {

  func hashInput(input: Text): Text {
    return Nat32.toText(Text.hash(input));
  };

  type ActivityBlock = {
    index: Nat;
    timestamp: Time.Time;
    previousHash: Text;
    detailsHash: Text;
    currentHash: Text;
  };

  stable var ActivityBlockChain : [ActivityBlock] = [];


  public func addActivityLog(detailsHash: Text): async () {
    let ts = Time.now();

    // Determine new block's index
    let newIndex: Nat = if (ActivityBlockChain.size() == 0) 0 else ActivityBlockChain[ActivityBlockChain.size() - 1].index + 1;

    // Get previous block's hash
    let previousHash: Text = if (ActivityBlockChain.size() == 0) "0" else ActivityBlockChain[ActivityBlockChain.size() - 1].currentHash;

    // Generate raw block data for currentHash calculation
    let rawBlockData = Text.concat(
      Nat.toText(newIndex),
      Text.concat(detailsHash, previousHash)
    );

    let currentHash = hashInput(rawBlockData);

    // Create new block
    let newBlock: ActivityBlock = {
      index = newIndex;
      timestamp = ts;
      previousHash = previousHash;
      detailsHash = detailsHash;
      currentHash = currentHash;
    };

    // Add to blockchain
    ActivityBlockChain := Array.append<ActivityBlock>(ActivityBlockChain, [newBlock]);
  };

    public func getActivityLog(): async [ActivityBlock] {
      return ActivityBlockChain;
    };

    public func deleteActivityBlockChain(): async() {
      ActivityBlockChain := [];
      Debug.print("All consent blocks removed");
    };

  type Consent_Block = {
      index: Nat;
      timestamp: Time.Time;
      previousHash: Text;
      consentHash: Text;
      currentHash: Text;
  };

  stable var ConsentBlockChain : [Consent_Block] = [];

  public func addConsentBlock(consentHash: Text): async() {
    let ts = Time.now();

      // Determine new block's index
    let newIndex: Nat = if (ActivityBlockChain.size() == 0) 0 else ActivityBlockChain[ActivityBlockChain.size() - 1].index + 1;

    // Get previous block's hash
    let previousHash: Text = if (ActivityBlockChain.size() == 0) "0" else ActivityBlockChain[ActivityBlockChain.size() - 1].currentHash;

   // Generate raw block data for currentHash calculation
    let rawBlockData = Text.concat(
      Nat.toText(newIndex),
      Text.concat(consentHash, previousHash)
    );

    let currentHash = hashInput(rawBlockData);

    // Create new block
    let newBlock: Consent_Block = {
      index = newIndex;
      timestamp = ts;
      previousHash = previousHash;
      consentHash = consentHash;
      currentHash = currentHash
    };

    // Add to blockchain
    ConsentBlockChain := Array.append<Consent_Block>(ConsentBlockChain, [newBlock]);
  };

  public func getConsentBlockChain(): async[Consent_Block] {
    return ConsentBlockChain;
  };

  public func deleteConsentBlockChain(): async() {
    ConsentBlockChain := [];
    Debug.print("All consent blocks removed");
  };

  type Session_Block = {
    index: Nat;
    timestamp: Time.Time;
    previousHash: Text;
    sessionHash: Text;
    currentHash: Text;
  };

  stable var SessionBlockChain : [Session_Block] = [];

  public func addSessionBlock(sessionHash: Text): async() {
    let ts = Time.now();

    // Determine new block's index
    let newIndex: Nat = if (ActivityBlockChain.size() == 0) 0 else ActivityBlockChain[ActivityBlockChain.size() - 1].index + 1;
    
    // Get previous block's hash
    let previousHash: Text = if (ActivityBlockChain.size() == 0) "0" else ActivityBlockChain[ActivityBlockChain.size() - 1].currentHash;

     // Generate raw block data for currentHash calculation
    let rawBlockData = Text.concat(
      Nat.toText(newIndex),
      Text.concat(sessionHash, previousHash)
    );

    let currentHash = hashInput(rawBlockData);

    // Create new block
    let newBlock: Session_Block = {
      index = newIndex;
      timestamp = ts;
      previousHash = previousHash;
      sessionHash = sessionHash;
      currentHash = currentHash
    };

    // Add to blockchain
    SessionBlockChain := Array.append<Session_Block>(SessionBlockChain, [newBlock]);
  };

  public func getSessionBlockChain(): async[Session_Block] {
    return SessionBlockChain;
  };

  public func deleteSessionBlockChain(): async() {
    SessionBlockChain := [];
    Debug.print("All session blocks removed");
  };
};
