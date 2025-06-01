export const idlFactory = ({ IDL }) => {
  const Metadata = IDL.Record({
    sentimentScore: IDL.Float64,
    tags: IDL.Vec(IDL.Text),
    summary: IDL.Text,
    sentimentCategory: IDL.Text,
  });
  const Time = IDL.Int;
  const Block = IDL.Record({
    metadataHash: IDL.Text,
    currentHash: IDL.Text,
    timestamp: Time,
    index: IDL.Nat,
    previousHash: IDL.Text,
  });
  return IDL.Service({
    addBlock: IDL.Func([Metadata], [], []),
    getBlockchain: IDL.Func([], [IDL.Vec(Block)], ["query"]),
    removeAllBlocks: IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => {
  return [];
};
