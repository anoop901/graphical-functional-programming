type InsertionLocation =
  | {
      type: "betweenLayers";
      layerIndex: number;
    }
  | {
      type: "betweenClustersWithinLayer";
      layerIndex: number;
      index: number;
    };
export default InsertionLocation;
