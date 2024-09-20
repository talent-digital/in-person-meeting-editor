import { useCallback } from "react"
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
  Connection,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { nodeTypes } from "./nodes/node-types"
import toast from "react-hot-toast"
import { AppNode } from "./types/app-node"
import { MeetingNodeField } from "./nodes/MeetingNode"
import { AnswerNodeField } from "./nodes/AnswerNode"
import { getMeetingNodeEdgeStyle } from "./helpers/get-meeting-node-edge-style"
import { getAnswerNodeEdgeStyle } from "./helpers/get-answer-node-edge-style"
import { Toolbar } from "./components/Toolbar"

export function InPersonMeetingEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const connectAnswerNode = useCallback(
    (connection: Connection) => {
      const newConnection = {
        ...connection,
        ...getAnswerNodeEdgeStyle(),
      }
      setEdges(() => addEdge(newConnection, edges))
    },
    [edges, setEdges],
  )

  const connectMeetingNode = useCallback(
    (connection: Connection) => {
      const newEdges = edges.filter((edge) => edge.source !== connection.source)
      const newConnection = {
        ...connection,
        ...getMeetingNodeEdgeStyle(),
      }

      const newNodes: AppNode[] = nodes.map((node) => {
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
    [edges, nodes, setEdges, setNodes],
  )

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const isAnswerNode = nodes
        .filter(({ type }) => type === "answer-node")
        .some(({ id }) => id === connection.target)

      if (isAnswerNode) {
        connectAnswerNode(connection)
      } else {
        connectMeetingNode(connection)
      }
    },
    [connectAnswerNode, connectMeetingNode, nodes],
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

      updateMeetingNodeId(nodeId, value)
      updateMeetingEdgeId(nodeId, value)
    } else {
      updateMeetingNodeField(nodeId, value, field)
    }
  }

  const updateMeetingNodeId = (oldId: string, newId: string) => {
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

  const updateMeetingEdgeId = (nodeId: string, newId: string) => {
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

  const updateMeetingNodeField = (
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

  const handleRemoveEdge = (edge: Edge) => {
    const newEdges = edges.filter((e) => e.id !== edge.id)
    const newNodes = nodes.map((node) => {
      if (node.id === edge.source) {
        return {
          ...node,
          data: {
            ...node.data,
            resultsIn: "",
          },
        } as AppNode
      }

      return node
    })
    setEdges(newEdges)
    setNodes(newNodes)
  }

  return (
    <>
      <Toolbar
        nodes={nodes}
        edges={edges}
        onNodesChange={(nodes) => setNodes(nodes)}
        onEdgesChange={(edges) => setEdges(edges)}
      />
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
        onEdgeClick={(_, edge) => {
          handleRemoveEdge(edge)
        }}
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
