import ProgramLayout from "../ProgramLayout";
import Connection from "../Connection";
import { ConnectionId } from "../Program";
import React = require("react");

export default function ConnectionInEditor({
  programLayout,
  connectionId,
}: {
  programLayout: ProgramLayout;
  connectionId: ConnectionId;
}) {
  const connection = programLayout.program.connections.get(connectionId)!;
  const sourceBlockLocation = programLayout.blockLocations.get(
    connection.sourceBlockId
  )!;
  const destinationBlockLocation = programLayout.blockLocations.get(
    connection.destinationBlockId
  )!;
  return (
    <path
      key={connectionId}
      d={`M ${
        sourceBlockLocation.x + connection.sourceBlockOutputIndex * 50 + 25
      } ${sourceBlockLocation.y + 50} C ${
        sourceBlockLocation.x + connection.sourceBlockOutputIndex * 50 + 25
      } ${sourceBlockLocation.y + 150} ${
        destinationBlockLocation.x +
        connection.destinationBlockInputIndex * 50 +
        25
      } ${destinationBlockLocation.y + 10 - 100} ${
        destinationBlockLocation.x +
        connection.destinationBlockInputIndex * 50 +
        25
      } ${destinationBlockLocation.y + 10}`}
      stroke="black"
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
    ></path>
  );
}
