import { MeetingNodeDto } from "./meeting-node-dto"

export type MeetingDto = {
  conversation: {
    [id: string]: MeetingNodeDto
  }
}
