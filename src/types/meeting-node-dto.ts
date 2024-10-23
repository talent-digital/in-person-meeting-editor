import { EnablesDto } from "./enables-dto"

export type MeetingNodeDto = {
  actor: string
  enables?: EnablesDto[]
  fadeOut?: boolean
  passTime?: boolean
  resultsIn?: string
  text: string
  tooltip?: string
}
