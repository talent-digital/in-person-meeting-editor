import { type Edge } from "@xyflow/react"

import { MeetingDto } from "../types/meeting-dto"
import { AppNode } from "../types/app-node"
import { getAnswerNodeEdgeStyle } from "../helpers/get-answer-node-edge-style"
import { getMeetingNodeEdgeStyle } from "../helpers/get-meeting-node-edge-style"

const POSITION_X_INCREMENT = 300
const POSITION_Y_INCREMENT = 300

export const mapJsonToNodes = (data: MeetingDto["conversation"]): [AppNode[], Edge[]] => {
  const nodeList: AppNode[] = []
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
          type: "answer-node",
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
          ...getAnswerNodeEdgeStyle(),
        })

        if (enable.resultsIn) {
          edgeList.push({
            id: `${id}-${enableId}-out`,
            source: enableId,
            target: enable.resultsIn,
            ...getAnswerNodeEdgeStyle(),
          })
        }
      })
    }

    if (item.resultsIn) {
      edgeList.push({
        id: xIndex.toString(),
        source: id,
        target: item.resultsIn,
        ...getMeetingNodeEdgeStyle(),
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
