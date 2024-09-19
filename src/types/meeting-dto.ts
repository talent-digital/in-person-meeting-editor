import { MeetingDtoNode } from "./meeting-dto-node"

export type MeetingDto = {
  conversation: {
    [id: string]: MeetingDtoNode
  }
}
