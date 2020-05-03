import Block from './block/Block';
import { List } from 'immutable';

export default class Program {
  constructor(
    public readonly blocks: List<Block> = List()
  ) {}
}