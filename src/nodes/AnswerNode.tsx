import { Handle, Position, type NodeProps } from "@xyflow/react"
import { IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import type { Node } from "@xyflow/react"
import { green } from "@mui/material/colors"

import { StyledNodeMainWrapper } from "./StyledNodeMainWrapper"
import { StyledInputWrapper } from "./StyledInputWrapper"

const MIN_ROWS = 3
const MAX_ROWS = 8

export type AnswerNodeField = "resultsIn" | "text" | "passTime"

export type AnswerNodeType = Node<
  {
    passTime?: boolean
    resultsIn: string
    text: string
    onChange?: (value: string | boolean, field: AnswerNodeField) => void
    onDelete?: () => void
  },
  "answer-node"
>

export function AnswerNode({ data }: NodeProps<AnswerNodeType>) {
  const suggestedRows = data.text.length / 25
  const rows = Math.min(Math.max(suggestedRows, MIN_ROWS), MAX_ROWS)

  return (
    <StyledNodeMainWrapper className='react-flow__node-default' sx={{ background: green[50] }}>
      <div>
        <IconButton
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
          }}
          onClick={() => {
            if (data.onDelete) {
              data.onDelete()
            }
          }}
          title='Delete node'
        >
          <CloseIcon sx={{ fontSize: "12px" }} />
        </IconButton>

        <StyledInputWrapper>
          <label>Text</label>
          <textarea
            className='nodrag'
            value={data.text}
            rows={rows}
            onChange={(e) => {
              if (data.onChange) {
                data.onChange(e.target.value, "text")
              }
            }}
          />
        </StyledInputWrapper>

        <StyledInputWrapper>
          <label>Results in</label>
          <input className='nodrag' disabled type='text' value={data.resultsIn} />
        </StyledInputWrapper>

        <StyledInputWrapper>
          <label>Pass time</label>
          <input
            className='nodrag'
            type='checkbox'
            checked={Boolean(data.passTime)}
            onChange={(e) => {
              if (data.onChange) {
                data.onChange(e.target.checked, "passTime")
              }
            }}
          />
        </StyledInputWrapper>
      </div>

      <Handle type='source' position={Position.Right} />
      <Handle type='target' position={Position.Left} />
    </StyledNodeMainWrapper>
  )
}
