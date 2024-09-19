import { ChangeEvent, useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type Edge,
  MarkerType,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"
import "./InPersonMeetingEditor.css"

import { nodeTypes } from "./nodes"
import { MeetingNodeType, MeetingNodeField } from "./nodes/types"
import { mapJsonToNodes } from "./helpers/map-json-to-nodes"
import { MeetingDto } from "./types/meeting-dto"
import { MeetingDtoNode } from "./types/meeting-dto-node"

export function InPersonMeetingEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<MeetingNodeType>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const newEdges = edges.filter((edge) => edge.source !== connection.source)
      const newConnection = {
        ...connection,
        style: { stroke: "black", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "black" },
      }

      const newNodes = nodes.map((node) => {
        if (node.id === connection.source) {
          return {
            ...node,
            data: {
              ...node.data,
              resultsIn: connection.target,
            },
          }
        }

        return node
      })

      setEdges(() => addEdge(newConnection, newEdges))
      setNodes(newNodes)
    },
    [setEdges, setNodes, edges, nodes],
  )

  const handleNodeDelete = (nodeId: string) => {
    const newNodes = nodes.filter((node) => node.id !== nodeId)
    const newEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)

    setNodes(newNodes)
    setEdges(newEdges)
  }

  const handleNodeChange = (nodeId: string, value: string | boolean, field: MeetingNodeField) => {
    if (field === "id" && typeof value === "string") {
      const newIdExists = nodes.some((node) => node.id === value)
      if (newIdExists) {
        console.error("Id already exists")
        return
      }

      handleNodeIdChange(nodeId, value)
      handleEdgeOnNodeIdChange(nodeId, value)
    } else {
      handleRegularNodeChange(nodeId, value, field)
    }
  }

  const handleNodeIdChange = (oldId: string, newId: string) => {
    const newNodes = nodes.map((node) => {
      if (node.id === oldId) {
        return {
          ...node,
          id: newId,
          data: {
            ...node.data,
          },
        }
      }

      if (node.data.resultsIn === oldId) {
        return {
          ...node,
          data: {
            ...node.data,
            resultsIn: newId,
          },
        }
      }

      return node
    })

    setNodes(newNodes)
  }

  const handleEdgeOnNodeIdChange = (nodeId: string, newId: string) => {
    const newEdges = edges.map((edge) => {
      if (edge.source === nodeId) {
        return {
          ...edge,
          source: newId,
        }
      }

      if (edge.target === nodeId) {
        return {
          ...edge,
          target: newId,
        }
      }

      return edge
    })

    setEdges(newEdges)
  }

  const handleRegularNodeChange = (
    nodeId: string,
    value: string | boolean,
    field: MeetingNodeField,
  ) => {
    const newNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            [field]: value,
          },
        }
      }

      return node
    })

    setNodes(newNodes)
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) {
      return
    }

    const file = event.target.files[0]
    const readFile = await file.text()
    // TODO: possibly use zod for parse and validation
    const input: MeetingDto = JSON.parse(readFile)

    const [newNodes, newEdges] = mapJsonToNodes(input.conversation)
    setNodes(newNodes)
    setEdges(newEdges)
  }

  const handleExport = () => {
    const conversation: MeetingDto["conversation"] = nodes.reduce((acc, node) => {
      const { data, id } = node

      if (!data.actor) {
        console.error("Actor is required")
        return acc
      }

      const meetingNode: MeetingDtoNode = {
        text: data.text,
        actor: data.actor,
        resultsIn: data.resultsIn,
      }

      if (id) {
        return {
          ...acc,
          [id]: meetingNode,
        }
      }

      return acc
    }, {})

    const exportData: MeetingDto = { conversation }

    const element = document.createElement("a")
    const file = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "text/plain",
    })
    element.href = URL.createObjectURL(file)
    element.download = "data.in_person_meeting.json"
    element.click()
  }

  return (
    <>
      <div className='toolbar'>
        <button
          onClick={() => {
            console.log(nodes)
          }}
        >
          Log nodes
        </button>
        <div>
          <label>
            Select file
            <input type='file' hidden onChange={handleImport} />
          </label>
        </div>
        <button onClick={handleExport}>Export</button>
      </div>
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onDelete: () => handleNodeDelete(node.id),
            onChange: (value: string | boolean, field: MeetingNodeField) => {
              handleNodeChange(node.id, value, field)
            },
          },
        }))}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </>
  )
}
