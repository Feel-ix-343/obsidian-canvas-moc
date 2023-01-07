import { App, PluginSettingTab, Setting } from "obsidian";
import ObsidianCanvasMOC, { DEFAULT_SETTINGS } from "./main";

export default class SettingTab extends PluginSettingTab {
  plugin: ObsidianCanvasMOC;

  constructor(app: App, plugin: ObsidianCanvasMOC) {
    super(app, plugin)
    this.plugin = plugin
  }

  display() {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', {text: 'Obsidian Canvas MOC Settings'});

    this.generateSettings({
      containerEl,
      name: "Spacing",
      description: "The spacing between nodes; There may still be overlap, but this is the general spacing",
      value: this.plugin.settings.spacing,
      onChange: (value) => {
        this.plugin.settings.spacing = value
      },
      defaultValue: DEFAULT_SETTINGS.spacing,
      placeholder: "Spacing in px"
    })

    this.generateSettings({
      containerEl,
      name: "Minimum Radius",
      description: "The minimum radius of the graph; This will take effet when there are not enough nodes for the radius to be affected by spacing",
      value: this.plugin.settings.minRadius,
      onChange: (value) => {
        this.plugin.settings.minRadius = value
      },
      defaultValue: DEFAULT_SETTINGS.minRadius,
      placeholder: "Minimum radius in px"
    })

    this.generateSettings({
      containerEl,
      name: "Heading Width",
      description: "The width of the text/heading node",
      value: this.plugin.settings.headingWidth,
      onChange: (value) => {
        this.plugin.settings.headingWidth = value
      },
      defaultValue: DEFAULT_SETTINGS.headingWidth,
      placeholder: "Heading width in px"
    })


    this.generateSettings({
      containerEl,
      name: "Heading Height",
      description: "The height of the text/heading node",
      value: this.plugin.settings.headingHeight,
      onChange: (value) => {
        this.plugin.settings.headingHeight = value
      },
      defaultValue: DEFAULT_SETTINGS.headingHeight,
      placeholder: "Heading height in px"
    })

    this.generateSettings({
      containerEl,
      name: "Note Width",
      description: "The width of the note node",
      value: this.plugin.settings.noteWidth,
      onChange: (value) => {
        this.plugin.settings.noteWidth = value
      },
      defaultValue: DEFAULT_SETTINGS.noteWidth,
      placeholder: "Note width in px"
    })

    this.generateSettings({
      containerEl,
      name: "Note Height",
      description: "The height of the note node",
      value: this.plugin.settings.noteHeight,
      onChange: (value) => {
        this.plugin.settings.noteHeight = value
      },
      defaultValue: DEFAULT_SETTINGS.noteHeight,
      placeholder: "Note height in px"
    })

    this.generateSettings({
      containerEl,
      name: "Angle Span",
      description: "The angle span of the graph (when there are enough ntoes to take up the spread); This is the angle between the first and last node",
      value: this.plugin.settings.angleSpan,
      onChange: (value) => {
        this.plugin.settings.angleSpan = value
      },
      defaultValue: DEFAULT_SETTINGS.angleSpan,
      placeholder: "Angle span in degrees"
    })

    this.generateSettings({
      containerEl,
      name: "Angle Span Small",
      description: "The angle span of the graph when there are only 2 nodes",
      value: this.plugin.settings.angleSpanSmall,
      onChange: (value) => {
        this.plugin.settings.angleSpanSmall = value
      },
      defaultValue: DEFAULT_SETTINGS.angleSpanSmall,
      placeholder: "Angle span in degrees"
    })
  }
  generateSettings( { containerEl, name, description, placeholder, value, onChange, defaultValue }: { containerEl: HTMLElement; name: string; description: string; placeholder: string; value: string; onChange: (value: number) => void; defaultValue: number; }) {
    new Setting(containerEl)
      .setName(name)
      .setDesc(description)
      .addText(text =>{
        text
          .setPlaceholder(placeholder)
          .setValue(value?.toString() ?? NaN.toString())
          .onChange(async (value: string) => {
            const parsedValue = parseInt(value) || defaultValue
            onChange(parsedValue)
            await this.plugin.saveSettings()
          })
        text.inputEl.id = name
      })
      .addExtraButton(button => {
        button.setIcon('reset')
          .setTooltip('Reset to default')
          .onClick(async () => {
            onChange(defaultValue)
            await this.plugin.saveSettings()

            const input = document.getElementById(name) as HTMLInputElement
            console.log(input)
            if (input) {
              input.value = value?.toString() ?? defaultValue.toString()
            }
          })
      })
  }
}

