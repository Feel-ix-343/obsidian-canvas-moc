import { App, Modal, Setting } from "obsidian";

export class RegenerateModal extends Modal {
  result: string;
  displayName: string;
  onRegenerate: () => void;

  constructor(app: App, displayName: string, onRegenerate: () => void) {
    super(app);
    this.onRegenerate = onRegenerate;
    this.displayName = displayName;
  }

  onOpen() {
    const { contentEl } = this;

    const submit = () => {
      this.close()
      this.onRegenerate()
    }

    this.titleEl.setText(`A canvas file with name: "${this.displayName}" already exists. Do you want to regenerate it?`)

    new Setting(contentEl)
      .setName("Regenerate Canvas? The current file will be overwritten.")
      .addButton((btn) => 
        btn
          .setButtonText("Regenerate")
          .setCta()
          .onClick(submit)
        )
      .addButton((btn) => 
        btn
          .setButtonText("Cancel")
          .onClick(() => this.close())
      )
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}
