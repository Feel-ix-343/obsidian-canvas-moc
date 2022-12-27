import { randomUUID } from "crypto";
import { HeadingCache, LinkCache, Notice, TAbstractFile, TFile } from "obsidian";
import { CanvasFileData, CanvasTextData } from "obsidian/canvas";


export interface Node {
  node: CanvasFileData | CanvasTextData;
  subnodes?: Node[];
}


const readMOC = (mocFile: TFile): Node | undefined => {
  const fileCache = app.metadataCache.getFileCache(mocFile);
  if (!fileCache) {
    new Notice("File cache not found");
    return
  }

  const headings = (structuredClone(fileCache.headings) as HeadingCache[]).sort((a, b) => a.position.end.line - b.position.end.line);
  const links = (structuredClone(fileCache.links) as LinkCache[]).sort((a, b) => a.position.end.line - b.position.end.line);

  const baseNode: Node = {
    node: getCanvasDataFromFile(mocFile),
    subnodes: []
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const filteredLinks = links.filter(link => link.position.end.line > heading.position.end.line &&
      (i == headings.length - 1 || link.position.end.line < headings[i + 1].position.end.line)
    );

    const headingNode: Node = {
      node: {
        id: randomUUID(),
        type: "text",
        text: heading.heading,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      subnodes: filteredLinks.map(link => {
        // Get the path of the link
        let regularLinkText = link.link
        if (regularLinkText.contains("#")) {
           regularLinkText = link.link.substring(0, link.link.indexOf("#"))
        }
        const path = Object.keys(app.metadataCache.resolvedLinks[mocFile.path]).find((value) => value.contains(regularLinkText))

        return {
          node: getCanvasDataFromFile(app.vault.getAbstractFileByPath(path!)!)
        }
      })
    }

    baseNode.subnodes?.push(headingNode)
  }

  return baseNode
}


const getCanvasDataFromFile = (file: TFile | TAbstractFile): CanvasFileData => {
  const data: CanvasFileData = {
    id: randomUUID(),
    type: "file",
    file: file.path,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }
  return data
}


export {getCanvasDataFromFile, readMOC}
