import type { Node } from "@xyflow/react"

export type MeetingNodeField = "actor" | "id" | "passTime" | "resultsIn" | "text"

export type MeetingNodeType = Node<
  {
    actor?: string
    passTime?: boolean
    resultsIn?: string
    text: string
    onChange?: (value: string | boolean, field: MeetingNodeField) => void
    onDelete?: () => void
  },
  "meeting-node"
>

export type AppNode = MeetingNodeType
