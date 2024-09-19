type EnablesDto = {
  resultsIn: string
  testId?: string
  text: string
}

export type MeetingDtoNode = {
  actor: string
  enables?: EnablesDto[]
  passTime?: boolean
  resultsIn?: string
  text: string
}
