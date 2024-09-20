import type { NodeTypes } from "@xyflow/react"

import { MeetingNode } from "./MeetingNode"
import { AnswerNode } from "./AnswerNode"

export const nodeTypes = {
  "meeting-node": MeetingNode,
  "answer-node": AnswerNode,
} satisfies NodeTypes
