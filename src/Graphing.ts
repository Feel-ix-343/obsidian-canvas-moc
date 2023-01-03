import { randomUUID } from 'crypto'
import { TFile } from 'obsidian'
import {CanvasData, CanvasFileData, CanvasLinkData, CanvasTextData, NodeSide} from 'obsidian/canvas'
import { argv0 } from 'process'
import { Node, NodeFileData, NodeTextData } from './ReadMOC'

interface NodeCoordinate {
  node: Node,
  coordinate: Coordinate
}

// TODO: Add type
const graph = async (
  canvasFile: TFile,
  nodeParent: Node,
  options: {center: {x: number, y: number}, spacing: number, angleSpan: number, startingAngle: number}
): Promise<NodeCoordinate[] | undefined> => {
  console.log("Node parent: ", nodeParent)
  const {data: node, subnodes} = nodeParent

  // TODO: Don't filter out headings that are also links
  // Dont graph headings that do not have links in them
  if (!subnodes) {
    return
  }

  // Filtering out text-subnodes that do not have subnodes
  console.log(subnodes)
  let subnodesFiltered = subnodes.filter(subnode => subnode.data.type !== "text" || subnode.subnodes !== undefined)

  const {spacing, angleSpan, startingAngle, center} = options

  // TODO: make this better
  let subNodeCoordinates = calculateCoordinates(250, spacing, subnodesFiltered.length, angleSpan, startingAngle, 400)
  console.log(subNodeCoordinates)

  // TODO: Fix this shit
  const nodeCoordinates: NodeCoordinate[] = []

  await app.vault.process(canvasFile, (data: string) => {
    let canvasData: CanvasData = JSON.parse(data)

    // Load the central node
    canvasData.nodes.push({
      ...node,
      x: center.x + node.getXOffset(),
      y: center.y + node.getYOffset(),
    })



    for (let i = 0; i < subnodesFiltered.length; i++) {
      // TODO: make this one call
      nodeCoordinates.push({node: subnodesFiltered[i], coordinate: subNodeCoordinates[i]})

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


    console.log("Canvasdata: ", canvasData)
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
    r < minRadius ? r = minRadius : r = r
  }

  let coordinates: {x: number, y: number, angle: number}[] = []

  for (let i = 0; i < numOfNodes; i++) {
    let angle = (angleDiff * i + startingAngle) % (2 * Math.PI)
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    coordinates.push({x, y, angle})
  }

  return coordinates
}


