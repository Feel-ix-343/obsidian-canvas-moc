import { randomUUID } from "crypto";
import { EmbedCache, HeadingCache, LinkCache, Notice, TAbstractFile, TFile } from "obsidian";


export interface Node {
  data: NodeTextData | NodeFileData;
  subnodes?: Node[];
}

export class NodeTextData {
  id = randomUUID();
  text: string;
  type = "text" as const;
  width = 250;
  height = 100;

  constructor(text: string) {
    this.text = "# " + text;
  }

  getXOffset() {
    return -this.width/2
  }

  getYOffset() {
    return -this.height/2
  }
}

export class NodeFileData {
  id = randomUUID();
  file: string;
  type = "file" as const; 
  width = 250;
  height = 250;


  constructor(file: TFile | TAbstractFile) {
    this.file = file.path
  }

  getXOffset() {
    return -this.width/2
  }

  getYOffset() {
    return -this.height/2
  }
}


const readMOC = (mocFile: TFile): Node | undefined => {
  const fileCache = app.metadataCache.getFileCache(mocFile);
  if (!fileCache) {
    new Notice("File cache not found");
    return
  }

  const headings = fileCache.headings?.slice().sort((a, b) => a.position.end.line - b.position.end.line);
  const nonEmbedLinks = fileCache.links?.slice().sort((a, b) => a.position.end.line - b.position.end.line);
  const links = (fileCache.embeds ?? []).slice().sort((a, b) => a.position.end.line - b.position.end.line)
    .reduce((acc, curr) => {
      acc.push(curr)
      return acc
    }, nonEmbedLinks as Array<LinkCache | EmbedCache>)


  const baseNode: Node = {
    data: new NodeFileData(mocFile),
    // subnodes are undefined
  }

  // Add all of the links that are not under headings
  if (headings !== undefined) {
    const linksNotUnderHeadings = links?.filter(link => link.position.end.line < headings[0].position.end.line)
    baseNode.subnodes = linksNotUnderHeadings?.reduce((acc, link): Node[] => {
      const path = getPathFromLink(link.link, mocFile)
      if (!path) {
        return acc
      }
      const linkFile = app.vault.getAbstractFileByPath(path)
      if (!linkFile) {
        return acc
      }
      acc.push({data: new NodeFileData(linkFile)})
      return acc
    }, Array<Node>())
  } else {
    baseNode.subnodes = links?.reduce((acc, link): Node[] => {
      const path = getPathFromLink(link.link, mocFile)
      if (!path) {
        return acc
      }
      const linkFile = app.vault.getAbstractFileByPath(path)
      if (!linkFile) {
        return acc
      }
      acc.push({data: new NodeFileData(linkFile)})
      return acc
    }, Array<Node>())

    return baseNode
  } 


  // Get all of the links as subnodes for the headings
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    // Getting the links corresponse to the heading. If the heading is last, then the links are from the heading to the end of the file
    const filteredLinks = links?.filter(link => link.position.end.line > heading.position.end.line &&
      (i == headings.length - 1 || link.position.end.line < headings[i + 1].position.end.line)
    );

    const headingNode: Node = {
      data: new NodeTextData(heading.heading),
      subnodes: filteredLinks?.reduce((acc, link) => {
        const path = getPathFromLink(link.link, mocFile)
        if (!path) { // This may happen if there is a link to a file that has not been created yet
          return acc
        }
        let file = app.vault.getAbstractFileByPath(path)
        if (!file) {
          return acc
        }

        acc.push({
          data: new NodeFileData(file),
        })

        return acc

      }, Array<Node>())
    }

    // Only set the node subnodes if there actually are subnodes, otherwize it will be undefined
    if (filteredLinks && filteredLinks.length > 0) {
      if (!baseNode.subnodes) {
        baseNode.subnodes = []
      }
      baseNode.subnodes.push(headingNode)
    }
  }

  return baseNode
}

const getPathFromLink = (link: string, mocFile: TFile | TAbstractFile): string | undefined => {
  // Adjust for links with # in them
  if (link.contains("#")) {
    link = link.substring(0, link.indexOf("#"))
  }


  const resolvedLink = app.metadataCache.resolvedLinks[mocFile.path]
  if (!resolvedLink) {
    return undefined
  }

  const path = Object.keys(resolvedLink).find((value) => value.contains(link))

  return path
}




export {readMOC}
