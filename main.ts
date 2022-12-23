import { randomUUID } from 'crypto';
import { Notice, Plugin, TFile } from 'obsidian';
import {CanvasData, NodeSide} from 'obsidian/canvas'

export default class MyPlugin extends Plugin {
	async onload() {
    this.addCommand({
      name: "Create Canvas",
      id: "create-canvas",
      callback: () => {
        let activeFile = this.app.workspace.getActiveFile();
        if (!activeFile || activeFile.extension != "md") {
          return
        }

        this.createCanvas(activeFile)
      }
    })
	}


  public createCanvas = async (mocFile: TFile) => {
    // Read all of the outgoing links in the MOC
    const outgoing_links = Object.keys(app.metadataCache.resolvedLinks[mocFile.path])
      .map(path => app.vault.getAbstractFileByPath(path))

    this.getCoordinates

    // Create and open the canvas file
    let defaultCanvasJSON: CanvasData = {
      edges: [],
      nodes: []
    }

    // TODO: Turn this into a popup and fix duplicate naming error
    let canvasFile
    let name = mocFile.name + " Canvas.canvas"

    try {
      canvasFile = await this.app.vault.create(name, JSON.stringify(defaultCanvasJSON))
    } catch (e) {
      console.log(e)
      new Notice(`Canvas file (${name}) already exists`)
      return
    }


    let canvas = await this.app.workspace.getLeaf(true).openFile(canvasFile)

    const height = 300 // The height of the node + the spacing below it
    const width = 300
    const spacing = 30; // Padding below the node display

    const xOffset = -(width/2)
    const yOffset = -(height/2)


    let coordinates = this.getCoordinates(width, spacing, outgoing_links.length)

    console.log(coordinates)

    // Load the MOC
    this.app.vault.process(canvasFile, (data: string) => {
      let canvasData: CanvasData = JSON.parse(data)
      const mocID = randomUUID()
      canvasData.nodes.push({
        id: mocID,
        type: "file",
        file: mocFile.name,
        height: height,
        width: width,
        x: 0 + xOffset,
        y: 0 + yOffset,
      })


      for (let i = 0; i < outgoing_links.length; i++) {
        if (!outgoing_links) continue
        const id = randomUUID();
        canvasData.nodes.push({
          id,
          type: "file",
          file: outgoing_links[i]!.path, // TODO: 
          height: height,
          width: width,
          x: coordinates[i].x + xOffset,
          y: coordinates[i].y + yOffset,
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
          fromNode: mocID,
          toNode: id,
          fromSide,
          toSide,
          id: randomUUID()
        })
      }


      return JSON.stringify(canvasData)
    })

  }

  private getCoordinates = (nodeWidth: number, nodeSpacing: number, numOfNodes: number): {x: number, y: number, angle: number}[] => {
    // There needs to be adequate spacing between the nodes
    // This will directly affect the radius of the circle
    // Position of a node: {x: radius * cos( (2 pi / numOfNodes) * nodeIndex ), y: ... sin ...}
    // the diff between the center of the nodes needs to equal nodeSpacing
    // The distance between each node is Sqrt[(x_2 - x_1)^2 + (y_2 - y_1)^2] and it must equal spacer + (2 * width)/2
    // Plug in the position of the node and solve for the radius and you get this equation
    let r =  (Math.sqrt(2) * (nodeSpacing + nodeWidth))/(2 * Math.sqrt(1 - Math.cos((2 * Math.PI) / numOfNodes)))

    if (r < nodeWidth) r = nodeWidth + 100 // For when there are 1-4 notes and they are a little too close to the MOC note


    let coordinates: {x: number, y: number, angle: number}[] = []

    for (let i = 0; i < numOfNodes; i++) {
      const x = r * Math.cos((2 * Math.PI / numOfNodes) * i)
      const y = r * Math.sin((2 * Math.PI / numOfNodes) * i)
      coordinates.push({x, y, angle: 2 * Math.PI / numOfNodes * i})
    }

    return coordinates
  }

	onunload() {

	}
}


