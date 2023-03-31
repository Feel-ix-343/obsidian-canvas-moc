import { Notice, Plugin, TFile } from 'obsidian';
import {CanvasData} from 'obsidian/canvas'
import graph from './Graphing';
import { Node, readMOC } from './ReadMOC';
import { RegenerateModal } from './RegenerateModal';
import SettingTab  from './SettingTab';

export interface PluginSettings {
	spacing: number,
	levelOneMinRadius: number,
	levelTwoMinRadius: number,
	headingWidth: number,
	headingHeight: number,
	noteWidth: number,
	noteHeight: number,
	angleSpan: number,
	angleSpanSmall: number
}

const DEFAULT_SETTINGS: PluginSettings = {
	spacing: 10,
	levelOneMinRadius: 450,
	levelTwoMinRadius: 300,
	headingWidth: 250,
	headingHeight: 100,
	noteWidth: 250,
	noteHeight: 250,
	angleSpan: 120,
	angleSpanSmall: 60
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
				const activeFile = this.app.workspace.getActiveFile();
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
		const defaultCanvasJSON: CanvasData = {
			edges: [],
			nodes: []
		}

		// TODO: Turn this into a popup and fix duplicate naming error
		let canvasFile
		const name = mocFile.name + " Canvas.canvas"

		try {
			// Canvas file does not exist
			canvasFile = await this.app.vault.create(name, JSON.stringify(defaultCanvasJSON))
		} catch (e) {
			// Canvas file already exists
			console.log(e)
			new RegenerateModal(this.app, name, () => {
				const canvasFile = this.app.vault.getAbstractFileByPath(name)
				if (!canvasFile) {
					new Notice("We just have an error lol idek. I thought the canvas file was not created, but then it was, but now I can't find it")
					return
				}
				this.app.vault.delete(canvasFile)
				this.createCanvas(mocFile)
			}).open()
			return
		}

		const nodes: Node | undefined = readMOC(mocFile, this.settings) 
		if (!nodes) {
			new Notice("Could not read MOC file")
			return
		}

		// Open the canvas file into a new pane
		await this.app.workspace.getLeaf(true).openFile(canvasFile)

		const spacing = this.settings.spacing; // Padding below the node display

		// Graph all of the headings
		const headingGraphResponse = await graph(canvasFile, nodes, {
			center: {x: 0, y: 0},
			spacing,
			angleSpan: 2 * Math.PI,
			startingAngle: 0,
			minRadius: this.settings.levelOneMinRadius,
			noteWidth: this.settings.noteWidth,
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
				angleSpan = this.settings.angleSpanSmall
			} else {
				angleSpan = this.settings.angleSpan
			}
			await graph(canvasFile, coordinate.node, {
				center: {x: coordinate.coordinate.x, y: coordinate.coordinate.y},
				spacing,
				startingAngle: (2 * Math.PI + coordinate.coordinate.angle - (angleSpan * (Math.PI / 180)) / 2) % (2 * Math.PI), // A perpendicular degree angle from the base node's angle
				angleSpan: angleSpan * (Math.PI / 180),
				minRadius: this.settings.levelTwoMinRadius,
				noteWidth: this.settings.noteWidth,
			})
		}
	}

	onunload() {

	}
}



