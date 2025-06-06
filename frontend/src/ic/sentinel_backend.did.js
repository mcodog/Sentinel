export const idlFactory = ({ IDL }) => {
  const AuditLogEntry = IDL.Record({
    action: IDL.Text,
    user_id: IDL.Text,
    details: IDL.Opt(IDL.Text),
  });
  const Metadata = IDL.Record({
    sentimentScore: IDL.Float64,
    tags: IDL.Vec(IDL.Text),
    summary: IDL.Text,
    sentimentCategory: IDL.Text,
  });
  const Consent = IDL.Record({
    method: IDL.Text,
    consent_text_version: IDL.Text,
    user_id: IDL.Text,
    consent_given: IDL.Bool,
    consent_type: IDL.Text,
  });
  const Time = IDL.Int;
  const ActivityBlock = IDL.Record({
    detailsHash: IDL.Text,
    currentHash: IDL.Text,
    timestamp: Time,
    index: IDL.Nat,
    previousHash: IDL.Text,
  });
  const AuditLogBlock = IDL.Record({
    entryHash: IDL.Text,
    currentHash: IDL.Text,
    timestamp: Time,
    index: IDL.Nat,
    previousHash: IDL.Text,
  });
  const Block = IDL.Record({
    metadataHash: IDL.Text,
    currentHash: IDL.Text,
    timestamp: Time,
    index: IDL.Nat,
    previousHash: IDL.Text,
  });
  const ConsentBlock = IDL.Record({
    currentHash: IDL.Text,
    timestamp: Time,
    index: IDL.Nat,
    consentHash: IDL.Text,
    previousHash: IDL.Text,
  });
  return IDL.Service({
    addActivityLog: IDL.Func([IDL.Text], [], []),
    addAuditLog: IDL.Func([AuditLogEntry], [], []),
    addBlock: IDL.Func([Metadata], [], []),
    addConsentBlock: IDL.Func([Consent], [], []),
    getActivityLog: IDL.Func([], [IDL.Vec(ActivityBlock)], []),
    getAuditLogs: IDL.Func([], [IDL.Vec(AuditLogBlock)], ["query"]),
    getBlockchain: IDL.Func([], [IDL.Vec(Block)], ["query"]),
    getConsentBlockChain: IDL.Func([], [IDL.Vec(ConsentBlock)], ["query"]),
    removeAllActivity: IDL.Func([], [], []),
    removeAllAuditEntry: IDL.Func([], [], []),
    removeAllBlocks: IDL.Func([], [], []),
    removeAllConsentBlocks: IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => {
  return [];
};
