import UploadIcon from "@mui/icons-material/Upload"
import { Button, styled } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import { ChangeEvent } from "react"
import { Edge } from "@xyflow/react"

import { MeetingDto } from "../types/meeting-dto"
import { MeetingNodeType } from "../nodes/MeetingNode"
import { AnswerNodeType } from "../nodes/AnswerNode"
import { mapJsonToNodes } from "./map-json-to-nodes"
import { MeetingNodeDto } from "../types/meeting-node-dto"
import { EnablesDto } from "../types/enables-dto"
import { AppNode } from "../types/app-node"
import { z, ZodError } from "zod"
import toast from "react-hot-toast"

export const Toolbar = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}: {
  nodes: AppNode[]
  edges: Edge[]
  onNodesChange: (newNodes: AppNode[]) => void
  onEdgesChange: (newEdges: Edge[]) => void
}) => {
  const handleExport = () => {
    const conversation: MeetingDto["conversation"] = nodes.reduce(
      (acc: MeetingDto["conversation"], node) => {
        const { data, id, type } = node

        if (type === "meeting-node") {
          const meetingNode: MeetingNodeDto = {
            text: data.text,
            actor: data.actor,
          }

          if (data.resultsIn) {
            meetingNode.resultsIn = data.resultsIn
          }

          if (data.passTime) {
            meetingNode.passTime = data.passTime
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

    try {
      validate(exportData)
      const element = document.createElement("a")
      const file = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "text/plain",
      })
      element.href = URL.createObjectURL(file)
      element.download = "data.in_person_meeting.json"
      element.click()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors
          .map(
            (err) => `Path: ${err.path.join(" -> ")}\nMessage: ${err.message}\nCode: ${err.code}`,
          )
          .join("\n\n")

        toast.error(`Error, unable to export:\n\n${formattedErrors}`)
        return
      }

      if (error instanceof Error) {
        toast.error(`Error, unable to export:\n\n${error.message}`)
        return
      }

      toast.error(`Error, unable to export. ${String(error)}`)
    }
  }

  const handleAddMeetingNode = () => {
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

    onNodesChange([...nodes, newNode])
  }

  const handleAddAnswerNode = () => {
    const lastNode = nodes[nodes.length - 1] ?? { position: { x: 0, y: 0 } }
    const newNode: AnswerNodeType = {
      id: `node_${nodes.length + 1}`,
      type: "answer-node",
      position: { x: lastNode.position.x + 300, y: lastNode.position.y },
      data: {
        text: "",
        resultsIn: "",
      },
    }

    onNodesChange([...nodes, newNode])
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) {
      return
    }

    const file = event.target.files[0]
    const readFile = await file.text()
    const input: MeetingDto = JSON.parse(readFile)

    const [newNodes, newEdges] = mapJsonToNodes(input.conversation)
    onNodesChange(newNodes)
    onEdgesChange(newEdges)
  }

  return (
    <StyledToolbar>
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
      <Button
        color='primary'
        variant='outlined'
        onClick={handleAddMeetingNode}
        startIcon={<AddIcon />}
      >
        Add meeting node
      </Button>
      <Button
        color='primary'
        variant='outlined'
        onClick={handleAddAnswerNode}
        startIcon={<AddIcon />}
      >
        Add answer node
      </Button>
    </StyledToolbar>
  )
}

const StyledToolbar = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  position: "fixed",
  zIndex: 1,
  display: "flex",
  gap: theme.spacing(2),
  background: "#fff",
}))

const DialogSchema = z.object({
  conversation: z.record(
    z.object({
      text: z.string(),
      passTime: z.boolean().optional(),
      actor: z.string().regex(/^[a-zA-Z]+\.[a-zA-Z]+$/),
      resultsIn: z.string().optional(),
      enables: z
        .array(
          z.object({
            text: z.string(),
            testId: z.string().optional(),
            resultsIn: z.string(),
          }),
        )
        .optional(),
    }),
  ),
})

const validate = (data: unknown) => {
  const parsedData = DialogSchema.parse(data)

  // Check if "resultsIn" points to existing nodes
  Object.entries(parsedData.conversation).forEach(([key, entry]) => {
    if (entry.resultsIn && !parsedData.conversation[entry.resultsIn]) {
      throw new Error(`Invalid resultsIn: "${entry.resultsIn}" in node "${key}" does not exist.`)
    }

    if (entry.enables) {
      entry.enables.forEach((enable) => {
        if (enable.resultsIn && !parsedData.conversation[enable.resultsIn]) {
          throw new Error(
            `Invalid resultsIn: "${enable.resultsIn}" in enabled option of "${key}" does not exist.`,
          )
        }
      })
    }
  })

  const hasIntro = Object.keys(parsedData.conversation).some((key) => key === "intro")
  const hasEnding = Object.keys(parsedData.conversation).some((key) => key === "ending")

  if (!hasIntro) {
    throw new Error("Missing intro node.")
  }

  if (!hasEnding) {
    throw new Error("Missing ending node.")
  }

  return
}
