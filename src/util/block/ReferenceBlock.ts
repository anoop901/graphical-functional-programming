import Block from './Block';
import BlockVisitor from './BlockVisitor';

export default class ReferenceBlock extends Block {
  public readonly numInputs = 0;
  public readonly numOutputs = 1;
  constructor() {
    super();
  }

  accept<R>(blockVisitor: BlockVisitor<R>): R {
    return blockVisitor.visitReferenceBlock(this);
  }

  evaluate(): number[] {
    throw new Error('cannot evaluate reference block by itself');
  }
}
