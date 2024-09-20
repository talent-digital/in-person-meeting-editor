import { MarkerType } from "@xyflow/react"

export const getAnswerNodeEdgeStyle = () => {
  return {
    markerEnd: { type: MarkerType.ArrowClosed, color: "black" },
    style: { stroke: "black", strokeWidth: 2, strokeDasharray: "5,5" },
  }
}
