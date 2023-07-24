import Block from "./Block";

export interface Program {
  blocks: { [id: string]: Block };
}

export function makeInitialProgram(): Program {
  const blockId1 = window.crypto.randomUUID();
  const blockId2 = window.crypto.randomUUID();
  const blockId3 = window.crypto.randomUUID();
  const blockId4 = window.crypto.randomUUID();
  const blockId5 = window.crypto.randomUUID();
  const blockId6 = window.crypto.randomUUID();
  return {
    blocks: {
      [blockId1]: { type: "IntegerLiteralBlock", value: 10 },
      [blockId2]: { type: "IntegerLiteralBlock", value: 20 },
      [blockId3]: { type: "IntegerLiteralBlock", value: 30 },
      [blockId4]: {
        type: "PlusBlock",
        arg1BlockId: blockId1,
        arg2BlockId: blockId2,
      },
      [blockId5]: {
        type: "TimesBlock",
        arg1BlockId: blockId3,
        arg2BlockId: blockId4,
      },
      [blockId6]: { type: "IntegerLiteralBlock", value: 40 },
    },
  };
}
