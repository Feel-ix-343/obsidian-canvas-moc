import { randomUUID } from 'crypto'
import { TFile } from 'obsidian'
import {CanvasData, NodeSide} from 'obsidian/canvas'
import { Node }  from './ReadMOC'

interface NodeCoordinate {
  node: Node,
  coordinate: Coordinate
}


/**
  Graphs the nodes of nodeParent to the canvasFile and returns the coordinates of the nodes so the next level of nodes can be graphed
*/
export default async function graph (
  canvasFile: TFile,
  nodeParent: Node,
  options: {
    center: {x: number, y: number},
    spacing: number,
    angleSpan: number,
    startingAngle: number,
    minRadius: number,
    noteWidth: number,
  }
): Promise<NodeCoordinate[] | undefined> {
  const {data: node, subnodes} = nodeParent

  // Filter out headings (with sublinks) that do not have links in them
  if (!subnodes) {
    return
  }

  // Filtering out text-subnodes that do not have subnodes
  const subnodesFiltered = subnodes.filter(subnode => subnode.data.type !== "text" || subnode.subnodes !== undefined)

  const {spacing, angleSpan, startingAngle, center, minRadius, noteWidth} = options

  const subNodeCoordinates = calculateCoordinates(noteWidth, spacing, subnodesFiltered.length, angleSpan, startingAngle, minRadius)


  await app.vault.process(canvasFile, (data: string) => {
    const canvasData: CanvasData = JSON.parse(data)

    // Load the central node
    canvasData.nodes.push({
      ...node,
      x: center.x + node.getXOffset(),
      y: center.y + node.getYOffset(),
    })



    for (let i = 0; i < subnodesFiltered.length; i++) {

      canvasData.nodes.push({
        ...subnodesFiltered[i].data,
        x: center.x + subNodeCoordinates[i].x + subnodesFiltered[i].data.getXOffset(),
        y: center.y + subNodeCoordinates[i].y + subnodesFiltered[i].data.getYOffset(),
      })

      let fromSide: NodeSide, toSide: NodeSide;

      if (subNodeCoordinates[i].angle < Math.PI / 4 || subNodeCoordinates[i].angle > 7 * Math.PI / 4) {
        fromSide = "right"
        toSide = "left"
      } else if (subNodeCoordinates[i].angle < 3 * Math.PI / 4) {
        fromSide = "bottom"
        toSide = "top"
      } else if (subNodeCoordinates[i].angle < 5 * Math.PI / 4) {
        fromSide = "left"
        toSide = "right"
      } else {
        fromSide = "top"
        toSide = "bottom"
      }

      canvasData.edges.push({
        fromNode: node.id,
        toNode: subnodesFiltered[i].data.id,
        fromSide,
        toSide,
        id: randomUUID(),
      })
    }


    return JSON.stringify(canvasData)
  })

  // Return information about the coordinates so that the next level of nodes can be graphed

  // zip subnodes and coordinates
  const nodeCoordinates: NodeCoordinate[] = subnodesFiltered.map((subnode, index) => {
    return {node: subnode, coordinate: subNodeCoordinates[index]}
  })

  return nodeCoordinates
}

export type { NodeCoordinate }

interface Coordinate {
  x: number, y: number, angle: number
}

const calculateCoordinates = (nodeWidth: number, nodeSpacing: number, numOfNodes: number, angleSpan: number, startingAngle: number, minRadius: number): Coordinate[] => {
  // There needs to be adequate spacing between the nodes
  // This will directly affect the radius of the circle
  // Position of a node: {x: radius * cos( (2 pi / (numOfNodes-1)) * nodeIndex ), y: ... sin ...}
  // the diff between the center of the nodes needs to equal nodeSpacing
  // The distance between each node is Sqrt[(x_2 - x_1)^2 + (y_2 - y_1)^2] and it must equal spacer + (2 * width)/2
  // Plug in the position of the node and solve for the radius and you get the equation for r (a couple lines below this)

  let angleDiff
  let r = minRadius
  if (numOfNodes === 1) {
    angleDiff = 0
  } else {
    angleDiff = angleSpan == 2 * Math.PI ? angleSpan / (numOfNodes) : angleSpan / (numOfNodes - 1) // Calculating the angle between each node and taking into account the first angle being 0
    r =  (Math.sqrt(2) * (nodeSpacing + nodeWidth))/(2 * Math.sqrt(1 - Math.cos(angleDiff)))
    r < minRadius ? r = minRadius : null
  }

  const coordinates: {x: number, y: number, angle: number}[] = []

  for (let i = 0; i < numOfNodes; i++) {
    const angle = (angleDiff * i + startingAngle) % (2 * Math.PI)
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    coordinates.push({x, y, angle})
  }

  return coordinates
}


