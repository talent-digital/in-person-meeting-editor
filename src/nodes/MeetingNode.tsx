import { Handle, Position, type NodeProps } from "@xyflow/react"

import { type MeetingNodeType } from "./types"
import "./meeting-node.css"
import { useState } from "react"

const MIN_ROWS = 3
const MAX_ROWS = 8

export function MeetingNode({ data, id }: NodeProps<MeetingNodeType>) {
  const [tempId, setTempId] = useState(id)
  const suggestedRows = data.text.length / 25
  const rows = Math.min(Math.max(suggestedRows, MIN_ROWS), MAX_ROWS)

  return (
    <div className='react-flow__node-default node-main-wrapper'>
      <div className='node-inner-wrapper'>
        <button
          onClick={() => {
            if (data.onDelete) {
              data.onDelete()
            }
          }}
        >
          Delete
        </button>
        {id && (
          <div className='input-wrapper'>
            <label>Id</label>
            <input
              className='nodrag'
              type='text'
              value={tempId || id}
              onChange={(e) => {
                setTempId(e.target.value)
              }}
              onBlur={() => {
                if (data.onChange && tempId !== id) {
                  data.onChange(tempId, "id")
                }
              }}
            />
          </div>
        )}

        <div className='input-wrapper'>
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
        </div>

        {data.actor && (
          <div className='input-wrapper'>
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
          </div>
        )}

        {data.resultsIn && (
          <div className='input-wrapper'>
            <label>Results in</label>
            <input className='nodrag' disabled type='text' value={data.resultsIn} />
          </div>
        )}

        <div className='input-wrapper'>
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
        </div>
      </div>

      <Handle type='source' position={Position.Right} />
      <Handle type='target' position={Position.Left} />
    </div>
  )
}
