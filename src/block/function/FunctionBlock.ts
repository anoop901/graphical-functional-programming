import Block from "../Block";
import BlockVisitor from "../BlockVisitor";

export default abstract class FunctionBlock extends Block {
  accept<R>(blockVisitor: BlockVisitor<R>): R {
    return blockVisitor.visitFunctionBlock(this);
  }
}
