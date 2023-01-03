import { randomUUID } from 'crypto';
import { Notice, Plugin, TAbstractFile, TFile } from 'obsidian';
import {CanvasData, CanvasFileData, CanvasTextData, NodeSide} from 'obsidian/canvas'
import { argv0 } from 'process';
import graph, {NodeCoordinate} from './Graphing';
import { Node, readMOC } from './ReadMOC';

// TODO: Also get link data


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

    const nodes: Node | undefined = readMOC(mocFile) 
    if (!nodes) {
      new Notice("Could not read MOC file")
      return
    }
    console.log(readMOC(mocFile))

    // Open the canvas file into a new pane
    await this.app.workspace.getLeaf(true).openFile(canvasFile)

    const spacing = 10; // Padding below the node display

    // Graph all of the headings
    const headingGraphResponse = await graph(canvasFile, nodes, {
      center: {x: 0, y: 0},
      spacing,
      angleSpan: 2 * Math.PI,
      startingAngle: 0
    })

    if (!headingGraphResponse) {
      new Notice("Could not graph headings")
      return
    }
    console.log(headingGraphResponse)

    for (const coordinate of headingGraphResponse) {
      let angleSpan
      if (coordinate.node.subnodes?.length == 1) {
        angleSpan = 0
      } else if (coordinate.node.subnodes?.length == 2) {
        angleSpan = 60
      } else {
        angleSpan = 120
      }
      await graph(canvasFile, coordinate.node, {
        center: {x: coordinate.coordinate.x, y: coordinate.coordinate.y},
        spacing,
        startingAngle: (2 * Math.PI + coordinate.coordinate.angle - (angleSpan * (Math.PI / 180)) / 2) % (2 * Math.PI), // A perpendicular degree angle from the base node's angle
        angleSpan: angleSpan * (Math.PI / 180)
      })
    }
  }

  onunload() {

  }
}


