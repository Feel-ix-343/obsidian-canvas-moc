import { randomUUID } from 'crypto';
import { Plugin, TFile } from 'obsidian';
import {CanvasData} from 'obsidian/canvas'

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

    // Create and open the canvas file
    let defaultCanvasJSON: CanvasData = {
      edges: [],
      nodes: []
    }

    // TODO: Turn this into a popup and fix duplicate naming error
    let canvasFile = await this.app.vault.create(mocFile.name + " Canvas.canvas", JSON.stringify(defaultCanvasJSON))
    let canvas = await this.app.workspace.getLeaf(true).openFile(canvasFile)

    const height = 300 // The height of the node + the spacing below it

    // Load the MOC
    this.app.vault.process(canvasFile, (data: string) => {
      let canvasData: CanvasData = JSON.parse(data)
      const mocID = randomUUID()
      canvasData.nodes.push({
        id: mocID,
        type: "file",
        file: mocFile.name,
        height: height,
        width: 500,
        x: 0,
        y: 0,
      })

      const paddingBelow = 100; // Padding below the node display
      let totalHeight = height * outgoing_links.length + paddingBelow * (outgoing_links.length - 1)
      let middle = totalHeight / 2 // middle
      let yOffset = middle - height / 2  // Adjusted for the height of the MOC node
      const xOffset = 600
      for (let i = 0; i < outgoing_links.length; i++) {
        const id = randomUUID();
        canvasData.nodes.push({
          id,
          type: "file",
          file: outgoing_links[i]!.path, // TODO: 
          height: height,
          width: 500,
          x: xOffset,
          y: (height + paddingBelow) * i - yOffset,
        })

        canvasData.edges.push({
          fromNode: mocID,
          toNode: id,
          fromSide: 'right',
          toSide: "left",
          id: randomUUID()
        })
      }


      return JSON.stringify(canvasData)
    })
  }

	onunload() {

	}
}


