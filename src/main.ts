import { randomUUID } from 'crypto';
import { Notice, Plugin, TAbstractFile, TFile } from 'obsidian';
import {CanvasData, CanvasFileData, CanvasTextData, NodeSide} from 'obsidian/canvas'
import graph, {NodeCoordinate} from './Graphing';
import { getCanvasDataFromFile, Node, readMOC } from './ReadMOC';

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

    const nodes: Node = readMOC(mocFile)!

    let canvas = await this.app.workspace.getLeaf(true).openFile(canvasFile)

    const height = 300 // The height of the node + the spacing below it
    const width = 320
    const spacing = 30; // Padding below the node display


    console.log(readMOC(mocFile))

    const coordinates = await graph(canvasFile, nodes, {center: {x: 0, y: 0}, height, width, spacing, angleSpan: 2 * Math.PI, startingAngle: 0})

    console.log(coordinates)

    for (const coordinate of coordinates!) {
      console.log(coordinate)
      await graph(canvasFile, coordinate.node, {
        center: {x: coordinate.coordinate.x, y: coordinate.coordinate.y},
        width,
        height,
        spacing,
        startingAngle: (2 * Math.PI + coordinate.coordinate.angle - (110 * (Math.PI / 180)) / 2) % (2 * Math.PI), // A perpendicular degree angle from the base node's angle
        angleSpan: 110 * (Math.PI / 180)
      })
    }
  }

  onunload() {

  }
}



