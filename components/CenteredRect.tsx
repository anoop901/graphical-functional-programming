import { SVGProps } from "react";

export default function CenteredRect(props: SVGProps<SVGRectElement>) {
  return (
    <rect
      transform={`translate(${-(props.width ?? 0) / 2},${
        -(props.height ?? 0) / 2
      })`}
      {...props}
    />
  );
}
