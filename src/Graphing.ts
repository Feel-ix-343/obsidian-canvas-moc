import { randomUUID } from 'crypto'
import { TFile } from 'obsidian'
import {CanvasData, CanvasFileData, CanvasLinkData, CanvasTextData, NodeSide} from 'obsidian/canvas'
import { Node } from './ReadMOC'

interface NodeCoordinate {
  node: Node,
  coordinate: Coordinate
}

// TODO: Add type
const graph = async (
  canvasFile: TFile,
  nodes: Node,
  options: {center: {x: number, y: number}, height: number, width: number, spacing: number, angleSpan: number, startingAngle: number}
): Promise<NodeCoordinate[] | undefined> => {
  const {node, subnodes} = nodes

  if (!subnodes) {
    return
  }

  const {height, width, spacing, angleSpan, startingAngle, center} = options
  const xOffset = -(width/2)
  const yOffset = -(height/2)

  // TODO: Include angle span
  let coordinates = calculateCoordinates(width, spacing, subnodes.length, angleSpan, startingAngle)

  console.log(coordinates)

  const nodeCoordinates: NodeCoordinate[] = []

  // Load the central node
  await app.vault.process(canvasFile, (data: string) => {
    let canvasData: CanvasData = JSON.parse(data)
    canvasData.nodes.push({
      ...node,
      x: center.x + xOffset,
      y: center.y + yOffset,
      width: width,
      height: height,
    })



    for (let i = 0; i < subnodes.length; i++) {

      nodeCoordinates.push({node: subnodes[i], coordinate: coordinates[i]})

      canvasData.nodes.push({
        ...subnodes[i].node,
        x: center.x + coordinates[i].x + xOffset,
        y: center.y + coordinates[i].y + yOffset,
        width: width,
        height: height,
      })

      let fromSide: NodeSide, toSide: NodeSide;
      if (coordinates[i].angle < Math.PI / 4 || coordinates[i].angle > 7 * Math.PI / 4) {
        fromSide = "right"
        toSide = "left"
      } else if (coordinates[i].angle < 3 * Math.PI / 4) {
        fromSide = "bottom"
        toSide = "top"
      } else if (coordinates[i].angle < 5 * Math.PI / 4) {
        fromSide = "left"
        toSide = "right"
      } else {
        fromSide = "top"
        toSide = "bottom"
      }

      canvasData.edges.push({
        fromNode: node.id,
        toNode: subnodes[i].node.id,
        fromSide,
        toSide,
        id: randomUUID(),
      })
    }


    return JSON.stringify(canvasData)
  })


  return nodeCoordinates
}

export type { NodeCoordinate }

export default graph


interface Coordinate {
  x: number, y: number, angle: number
}
 
// TODO: Fix calculations when there is only one subnode
const calculateCoordinates = (nodeWidth: number, nodeSpacing: number, numOfNodes: number, angleSpan: number, startingAngle: number): Coordinate[] => {
  // There needs to be adequate spacing between the nodes
  // This will directly affect the radius of the circle
  // Position of a node: {x: radius * cos( (2 pi / (numOfNodes-1)) * nodeIndex ), y: ... sin ...}
  // the diff between the center of the nodes needs to equal nodeSpacing
  // The distance between each node is Sqrt[(x_2 - x_1)^2 + (y_2 - y_1)^2] and it must equal spacer + (2 * width)/2
  // Plug in the position of the node and solve for the radius and you get the equation for r
  const angleDiff = angleSpan == 2 * Math.PI ? angleSpan / (numOfNodes) : angleSpan / (numOfNodes - 1) // Calculating the angle between each node and taking into account the first angle being 0

  let r =  (Math.sqrt(2) * (nodeSpacing + nodeWidth))/(2 * Math.sqrt(1 - Math.cos(angleDiff)))

  if (r < nodeWidth) r = nodeWidth + 100 // For when there are 1-4 notes and they are a little too close to the MOC note


  let coordinates: {x: number, y: number, angle: number}[] = []

  for (let i = 0; i < numOfNodes; i++) {
    let angle = (angleDiff * i + startingAngle) % (2 * Math.PI)
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    coordinates.push({x, y, angle})
  }

  return coordinates
}


