import ProgramLayout from "../ProgramLayout";
import * as React from "react";
import Connection from "../Connection";

export default function ConnectionInEditor({
  programLayout,
  connection,
}: {
  programLayout: ProgramLayout;
  connection: Connection;
}): JSX.Element {
  const sourceBlockLocation = programLayout.getBlockLocation(
    connection.sourceBlockId
  );
  const destinationBlockLocation = programLayout.getBlockLocation(
    connection.destinationBlockId
  );
  return (
    <path
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
