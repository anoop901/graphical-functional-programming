import { RefObject, SVGProps, useEffect, useState } from "react";

export default function ResizingSvg({
  children,
  svgRef,
  ...rest
}: {
  children: any;
  svgRef: RefObject<SVGSVGElement>;
} & SVGProps<SVGSVGElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (svgRef.current) {
      const observer = new ResizeObserver((e) => {
        const { inlineSize: width, blockSize: height } = e[0].contentBoxSize[0];
        setSize({ width, height });
      });
      observer.observe(svgRef.current);

      return () => observer.disconnect();
    }
  }, []);
  return (
    <svg
      viewBox={`${-size.width / 2} ${-size.height / 2} ${size.width} ${
        size.height
      }`}
      ref={svgRef}
      className="h-full"
      {...rest}
    >
      {children}
    </svg>
  );
}
