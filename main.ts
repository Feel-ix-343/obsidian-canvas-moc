import { Plugin } from 'obsidian';
import {CanvasData} from 'obsidian/canvas'

export default class MyPlugin extends Plugin {
	async onload() {
    this.addCommand({
      name: "Canvas",
      id: "canvas",
      callback: this.canvas
    })
	}

  canvas = async () => {
    let file = this.app.workspace.getActiveFile()

    if (!file) {
      return
    }

    let json = await this.app.vault.read(file)

    console.log(json)

    let canvas: CanvasData = JSON.parse(json);

    console.log(canvas.nodes[0])

    canvas.nodes.forEach((a) => a.width = 1000)

    await this.app.vault.modify(file, JSON.stringify(canvas)); 

  }

	onunload() {

	}
}


