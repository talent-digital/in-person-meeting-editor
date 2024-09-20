import { MarkerType } from "@xyflow/react"

export const getMeetingNodeEdgeStyle = () => {
  return {
    style: { stroke: "black", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "black" },
  }
}
