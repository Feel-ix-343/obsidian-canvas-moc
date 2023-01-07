import { Notice, Plugin, TFile } from 'obsidian';
import {CanvasData} from 'obsidian/canvas'
import graph from './Graphing';
import { Node, readMOC } from './ReadMOC';
import SettingTab, { PluginSettings } from './SettingTab';

export interface PluginSettings {
  spacing: number,
  minRadius: number,
  headingWidth: number,
  headingHeight: number,
  noteWidth: number,
  noteHeight: number,
  angleSpan: number,
}

const DEFAULT_SETTINGS: PluginSettings = {
  spacing: 10,
  minRadius: 400,
  headingWidth: 250,
  headingHeight: 250,
  noteWidth: 250,
  noteHeight: 250,
  angleSpan: 110
} 

export {DEFAULT_SETTINGS}
  

export default class ObsidianCanvasMOC extends Plugin {
  settings: PluginSettings
  async onload() {

    this.loadSettings()

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

    this.addSettingTab(new SettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings);
    console.log("Settings saved", this.settings);
  }


  public createCanvas = async (mocFile: TFile) => {

    // Create the canvas file
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
      new Notice("Could not graph")
      return
    }

    // Graph all of the links in the headings. There are at most 2 levels of links. 
    // TODO: Make a recursive function to graph all of the subheadings. This works for now
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



