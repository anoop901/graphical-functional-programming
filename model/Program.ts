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
  const blockId7 = window.crypto.randomUUID();
  const blockId8 = window.crypto.randomUUID();
  const blockId9 = window.crypto.randomUUID();
  const blockId10 = window.crypto.randomUUID();
  const blockId11 = window.crypto.randomUUID();
  const blockId12 = window.crypto.randomUUID();
  const blockId13 = window.crypto.randomUUID();
  const blockId14 = window.crypto.randomUUID();
  return {
    blocks: {
      [blockId1]: { type: "IntegerLiteralBlock", value: 10, nested: false },
      [blockId2]: { type: "IntegerLiteralBlock", value: 20, nested: true },
      [blockId3]: { type: "IntegerLiteralBlock", value: 30, nested: true },
      [blockId4]: {
        type: "ReferenceBlock",
        name: "plus",
        nested: true,
      },
      [blockId5]: {
        type: "ArrayBlock",
        elementBlockIds: [blockId1, blockId1, blockId2, blockId3],
        nested: true,
      },
      [blockId6]: {
        type: "FunctionCallBlock",
        functionBlockId: blockId4,
        argumentBlockId: blockId5,
        nested: false,
      },
      [blockId7]: { type: "IntegerLiteralBlock", value: 40, nested: true },
      [blockId8]: {
        type: "ReferenceBlock",
        name: "times",
        nested: true,
      },
      [blockId9]: {
        type: "ArrayBlock",
        elementBlockIds: [blockId6, blockId14, blockId7, blockId1],

        nested: true,
      },
      [blockId10]: {
        type: "FunctionCallBlock",
        functionBlockId: blockId8,
        argumentBlockId: blockId9,
        nested: false,
      },
      [blockId14]: {
        type: "ReferenceBlock",
        name: "foo",
        nested: false,
      },
      [blockId11]: {
        type: "IntegerLiteralBlock",
        value: 50,
        nested: false,
      },
      [blockId12]: {
        type: "FunctionCallBlock",
        functionBlockId: blockId13,
        argumentBlockId: blockId11,
        nested: false,
      },
      [blockId13]: {
        type: "ReferenceBlock",
        name: "negative",
        nested: true,
      },
    },
  };
}
