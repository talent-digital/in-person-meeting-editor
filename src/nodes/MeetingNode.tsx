import { Handle, Position, type NodeProps } from "@xyflow/react"
import { useState } from "react"
import { IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import type { Node } from "@xyflow/react"

import toast from "react-hot-toast"
import { StyledNodeMainWrapper } from "./StyledNodeMainWrapper"
import { StyledInputWrapper } from "./StyledInputWrapper"

export type MeetingNodeField = "actor" | "id" | "passTime" | "resultsIn" | "text"

export type MeetingNodeType = Node<
  {
    actor: string
    passTime?: boolean
    resultsIn?: string
    text: string
    onChange?: (value: string | boolean, field: MeetingNodeField) => void
    onDelete?: () => void
  },
  "meeting-node"
>

const MIN_ROWS = 3
const MAX_ROWS = 8

export function MeetingNode({ data, id }: NodeProps<MeetingNodeType>) {
  const [tempId, setTempId] = useState<string | undefined>(undefined)
  const suggestedRows = data.text.length / 25
  const rows = Math.min(Math.max(suggestedRows, MIN_ROWS), MAX_ROWS)

  return (
    <StyledNodeMainWrapper className='react-flow__node-default'>
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
        {id && (
          <StyledInputWrapper>
            <label>Id</label>
            <input
              className='nodrag'
              type='text'
              value={tempId !== undefined ? tempId : id}
              onChange={(e) => {
                setTempId(e.target.value)
              }}
              onBlur={() => {
                if (tempId === "") {
                  toast.error("Id cannot be empty")
                  return
                }
                if (data.onChange && tempId && tempId !== id) {
                  data.onChange(tempId, "id")
                }
              }}
            />
          </StyledInputWrapper>
        )}

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
          <label>Actor</label>
          <input
            className='nodrag'
            type='text'
            value={data.actor}
            onChange={(e) => {
              if (data.onChange) {
                data.onChange(e.target.value, "actor")
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
