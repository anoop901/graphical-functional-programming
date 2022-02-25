export type BlockId = string;
export type ConnectionId = string;

export interface Location {
  x: number;
  y: number;
}

interface FunctionBlock {
  blockType: "function";
  name: string;
}

interface DefinitionBlock {
  blockType: "definition";
  name: string;
  editing: boolean;
}

interface ReferenceBlock {
  blockType: "reference";
  editing: boolean;
}

interface NumberLiteralBlock {
  blockType: "numberLiteral";
  value: number;
  editing: boolean;
}

interface NumberDisplayBlock {
  blockType: "numberDisplay";
  value: number;
}

export type Block = (
  | FunctionBlock
  | DefinitionBlock
  | ReferenceBlock
  | NumberLiteralBlock
  | NumberDisplayBlock
) & {
  location: Location;
};

export interface Connection {
  sourceBlockId: BlockId;
  sourceBlockOutputIndex: number;
  destinationBlockId: BlockId;
  destinationBlockInputIndex: number;
}
