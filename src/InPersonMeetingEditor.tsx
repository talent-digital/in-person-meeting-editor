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
import UploadIcon from "@mui/icons-material/Upload"
import { Button } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import FileDownloadIcon from "@mui/icons-material/FileDownload"

import "@xyflow/react/dist/style.css"
import "./InPersonMeetingEditor.css"

import { nodeTypes } from "./nodes"
import { mapJsonToNodes } from "./helpers/map-json-to-nodes"
import { MeetingDto } from "./types/meeting-dto"
import { MeetingNodeDto } from "./types/meeting-node-dto"
import toast from "react-hot-toast"
import { AppNode } from "./types/app-node"
import { MeetingNodeField, MeetingNodeType } from "./nodes/MeetingNode"
import { AnswerNodeField } from "./nodes/AnswerNode"
import { EnablesDto } from "./types/enables-dto"

export function InPersonMeetingEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([])
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
          } as AppNode
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
        toast.error("Id already exists")
        return
      }

      handleMeetingNodeIdChange(nodeId, value)
      handleEdgeOnNodeIdChange(nodeId, value)
    } else {
      handleRegularNodeChange(nodeId, value, field)
    }
  }

  const handleMeetingNodeIdChange = (oldId: string, newId: string) => {
    const newNodes: AppNode[] = nodes.map((node) => {
      if (node.id === oldId) {
        return {
          ...node,
          id: newId,
          data: {
            ...node.data,
          },
        } as AppNode
      }

      if (node.data.resultsIn === oldId) {
        return {
          ...node,
          data: {
            ...node.data,
            resultsIn: newId,
          },
        } as AppNode
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
    const newNodes: AppNode[] = nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            [field]: value,
          },
        } as AppNode
      }

      return node
    })

    setNodes(newNodes)
  }

  const handleAddNode = () => {
    const lastNode = nodes[nodes.length - 1] ?? { position: { x: 0, y: 0 } }
    const newNode: MeetingNodeType = {
      id: `node_${nodes.length + 1}`,
      type: "meeting-node",
      position: { x: lastNode.position.x + 300, y: lastNode.position.y },
      data: {
        text: "",
        actor: "",
        resultsIn: "",
      },
    }

    setNodes([...nodes, newNode])
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
    const conversation: MeetingDto["conversation"] = nodes.reduce(
      (acc: MeetingDto["conversation"], node) => {
        const { data, id, type } = node

        if (type === "meeting-node") {
          const meetingNode: MeetingNodeDto = {
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
        }

        if (type === "answer-node") {
          const answerNode: EnablesDto = {
            text: data.text,
            resultsIn: data.resultsIn,
            passTime: data.passTime,
          }

          const parentId = edges.find((edge) => edge.target === id)?.source

          if (parentId) {
            const oldEnables = acc[parentId]?.enables ?? []
            const enables = [...oldEnables, answerNode]

            return {
              ...acc,
              [parentId]: {
                ...acc[parentId],
                enables,
              },
            }
          }
        }

        return acc
      },
      {},
    )

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
        <Button
          color='primary'
          variant='outlined'
          onClick={() => {
            console.log(nodes)
          }}
        >
          Log nodes
        </Button>
        <div>
          <Button color='primary' variant='outlined' component='label' startIcon={<UploadIcon />}>
            Select file
            <input type='file' hidden onChange={handleImport} />
          </Button>
        </div>
        <Button
          color='primary'
          variant='outlined'
          onClick={handleExport}
          startIcon={<FileDownloadIcon />}
        >
          Export
        </Button>
        <Button color='primary' variant='outlined' onClick={handleAddNode} startIcon={<AddIcon />}>
          Add node
        </Button>
      </div>
      <ReactFlow
        nodes={nodes.map(
          (node) =>
            ({
              ...node,
              data: {
                ...node.data,
                onDelete: () => handleNodeDelete(node.id),
                onChange: (value: string | boolean, field: MeetingNodeField | AnswerNodeField) => {
                  handleNodeChange(node.id, value, field)
                },
              },
            }) as AppNode,
        )}
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
