import { EnablesDto } from "./enables-dto"

export type MeetingNodeDto = {
  actor: string
  enables?: EnablesDto[]
  passTime?: boolean
  resultsIn?: string
  text: string
}
