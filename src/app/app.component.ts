import { Component } from '@angular/core';
import { Map } from 'immutable';
import DefinitionBlock from 'src/util/block/DefinitionBlock';
import AdditionBlock from 'src/util/block/function/AdditionBlock';
import MultiplicationBlock from 'src/util/block/function/MultiplicationBlock';
import NegationBlock from 'src/util/block/function/NegationBlock';
import NumberInputBlock from 'src/util/block/NumberInputBlock';
import NumberLiteralBlock from 'src/util/block/NumberLiteralBlock';
import NumberOutputBlock from 'src/util/block/NumberOutputBlock';
import ReferenceBlock from 'src/util/block/ReferenceBlock';
import ProgramLayout from 'src/util/ProgramLayout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  programLayout = generateInitialProgramLayout();
}

function generateInitialProgramLayout(): ProgramLayout {
  const { programLayout: initProgramLayoutWithoutConnections, blockIds } = [
    {
      name: 'literal 3',
      block: new NumberLiteralBlock(3),
      location: { x: 200, y: 100 },
    },
    {
      name: 'literal 5',
      block: new NumberInputBlock(),
      location: { x: 100, y: 100 },
    },
    {
      name: 'negation',
      block: new NegationBlock(),
      location: { x: 200, y: 200 },
    },
    {
      name: 'addition',
      block: new AdditionBlock(),
      location: { x: 100, y: 300 },
    },
    {
      name: 'literal 6',
      block: new NumberLiteralBlock(6),
      location: { x: 300, y: 200 },
    },
    {
      name: 'multiplication',
      block: new MultiplicationBlock(),
      location: { x: 200, y: 400 },
    },
    {
      name: 'result',
      block: new NumberOutputBlock(),
      location: { x: 250, y: 500 },
    },
    {
      name: 'namedefinition',
      block: new DefinitionBlock('foo'),
      location: { x: 250, y: 600 },
    },
    {
      name: 'namereference',
      block: new ReferenceBlock(),
      location: { x: 400, y: 600 },
    },
  ].reduce(
    ({ programLayout, blockIds }, { name, block, location }) => {
      const { newProgramLayout, newBlockId } = programLayout.addBlock(
        block,
        location
      );
      return {
        programLayout: newProgramLayout,
        blockIds: blockIds.set(name, newBlockId),
      };
    },
    {
      programLayout: ProgramLayout.create(),
      blockIds: Map<string, string>(),
    }
  );
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const initProgramLayout = initProgramLayoutWithoutConnections
    .addConnection({
      sourceBlockId: blockIds.get('literal 3')!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get('negation')!,
      destinationBlockInputIndex: 0,
    })
    .addConnection({
      sourceBlockId: blockIds.get('literal 5')!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get('addition')!,
      destinationBlockInputIndex: 0,
    })
    .addConnection({
      sourceBlockId: blockIds.get('addition')!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get('multiplication')!,
      destinationBlockInputIndex: 0,
    })
    .addConnection({
      sourceBlockId: blockIds.get('negation')!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get('addition')!,
      destinationBlockInputIndex: 1,
    })
    .addConnection({
      sourceBlockId: blockIds.get('literal 6')!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get('multiplication')!,
      destinationBlockInputIndex: 1,
    })
    .addConnection({
      sourceBlockId: blockIds.get('multiplication')!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get('result')!,
      destinationBlockInputIndex: 0,
    });
  return initProgramLayout;
}
