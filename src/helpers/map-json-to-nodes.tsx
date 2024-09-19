import { type Edge, MarkerType } from "@xyflow/react"
import { MeetingNodeType } from "../nodes/types"
import { MeetingDto } from "../types/meeting-dto"

const POSITION_X_INCREMENT = 300
const POSITION_Y_INCREMENT = 300

export const mapJsonToNodes = (data: MeetingDto["conversation"]): [MeetingNodeType[], Edge[]] => {
  const nodeList: MeetingNodeType[] = []
  const edgeList: Edge[] = []
  let xIndex = 0
  let yIndex = -1

  Object.entries(data).forEach(([id, item]) => {
    xIndex++

    if (comesFromEnables(id, data)) {
      yIndex++
    }

    if (id === "ending") {
      yIndex = -1
    }

    const yIndexNormalized = Math.max(yIndex, 0)

    nodeList.push({
      id,
      type: "meeting-node",
      position: {
        x: xIndex * POSITION_X_INCREMENT,
        y: yIndexNormalized * POSITION_Y_INCREMENT,
      },
      data: {
        text: item.text,
        actor: item.actor,
        resultsIn: item.resultsIn,
        passTime: item.passTime,
      },
    })

    if (item.enables) {
      xIndex++
      yIndex = -1

      item.enables.forEach((enable, enableIndex) => {
        const enableId = `${id}.enables.${enableIndex}`

        nodeList.push({
          id: enableId,
          type: "meeting-node",
          position: {
            x: xIndex * POSITION_X_INCREMENT,
            y: (yIndexNormalized + enableIndex) * POSITION_Y_INCREMENT,
          },
          data: {
            text: enable.text,
            resultsIn: enable.resultsIn,
          },
        })

        edgeList.push({
          id: `${id}-${enableId}-in`,
          source: id,
          target: enableId,
          markerEnd: { type: MarkerType.ArrowClosed, color: "black" },
          style: { stroke: "black", strokeWidth: 2, strokeDasharray: "5,5" },
        })

        if (enable.resultsIn) {
          edgeList.push({
            id: `${id}-${enableId}-out`,
            source: enableId,
            target: enable.resultsIn,
            markerEnd: { type: MarkerType.ArrowClosed, color: "black" },
            style: { stroke: "black", strokeWidth: 2, strokeDasharray: "5,5" },
          })
        }
      })
    }

    if (item.resultsIn) {
      edgeList.push({
        id: xIndex.toString(),
        source: id,
        target: item.resultsIn,
        markerEnd: { type: MarkerType.ArrowClosed, color: "black" },
        style: { stroke: "black", strokeWidth: 2 },
      })
    }
  })

  return [nodeList, edgeList]
}

const comesFromEnables = (id: string, data: MeetingDto["conversation"]) => {
  return Object.values(data)
    .map((item) => item.enables?.map((enable) => enable.resultsIn))
    .flat()
    .includes(id)
}
