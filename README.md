<meta name="google-site-verification" content="YWllrHxS71HepBAFJqguFgFjDXHZ7rAIeSUzJTPW91o" />

# Abstract: Obsidian Canvas MOC

With the release of the canvas feature in Obsidian (v1.1), many people have started to wonder about its applicability to well-established note-taking practices like MOC (Map of Content) notes. I believe the expressive canvas interface will replace simple MOC notes and allow for better context between notes and connections. If the transition to canvas from MOC is made, the obsidian community would greatly benefit from automation in this process. 

**Obsidian Canvas MOC provides an easy way for Map Of Content notes to be translated into the new canvas view**

# Preview
![Peek 2023-01-13 21-04](https://user-images.githubusercontent.com/88951499/212445796-ec579dee-2ae8-4828-bf60-0914d9843b66.gif)

# Installation
## BRAT Installation
Now that I have uploaded the first release of the plugin, you are able to install and test it through the BRAT Obsidian plugin. 

Here is the link: https://github.com/TfTHacker/obsidian42-brat#Quick-Guide-for-using-BRAT


## Manual Installation
1. Open a CLI
2. Navigate (through cd) to your obsidian vault's base directory
3. Run `cd .obsidian/plugins/` to open the plugins directory
4. Run `git clone https://github.com/Feel-ix-343/obsidian-canvas-moc.git` to clone the repo
5. Run `cd obsidan-canvas-moc` to enter the plugin directory
6. Run `npm install && npm run build` to install dependencies and build the plugin
7. Enable the plugin in the *Community Plugins* Tab
8. Look at the *features* or *usage* headings to use the plugin!

<details><summary>Here are all of the commands for once you are in cd-ed into your vault</summary>
	
```
cd .obsidian/plugins
git clone https://github.com/Feel-ix-343/obsidian-canvas-moc.git
cd obsidian-canvas-moc
npm install && npm run build
```
	
</details>

# Features

Click expand for a preview!

Run `Create Canvas` to create your canvases.

<details><summary>Present all links in a MOC file in the form of a readable, circular graph diagram</summary>

![Peek 2023-01-13 21-10](https://user-images.githubusercontent.com/88951499/212446080-f3ff2dcb-5ad2-46e4-b922-f2f4e2f461f1.gif)

</details>

<details><summary>If the MOC file separates links by headers, these **headers will show up as the 1st level in the graph view**. The links corresponding to these headers will be displayed as the 2nd level--evenly spaced around their respective headers.</summary>

![Peek 2023-01-13 21-12](https://user-images.githubusercontent.com/88951499/212446131-8f79723a-17e4-4543-9381-47c40ecae306.gif)

</details>

<details><summary>Settings interface to change the spacing, angle span, min radius, node width and height ...</summary>

![Peek 2023-01-13 21-17](https://user-images.githubusercontent.com/88951499/212446284-f421e815-b789-4b39-8fae-0d066aa7ebf9.gif)


</details>

Everybody uses MOC notes differently, but I am relying on the existence of some patterns in my translations. If you think I am missing some of these patterns, please leave an issue with your ideas! As stated, in the *Status* header, I am currently in the feedback stage, so your ideas will likely shape the development this plugin!

# (Possible) Usage

1. Open a MOC note
2. Run the `Create Canvas` command
3. Look at your beautiful and expressive canvas graph!
4. Rearrange it to your liking. Add some context between the nodes, add in links, create new links ...

![Peek 2023-01-13 21-23](https://user-images.githubusercontent.com/88951499/212446561-aa7265d8-188c-4b51-935f-9fe323ca2d23.gif)

Note: in order to get the graph to be displayed exactly the way you want it, try changing the MOC file (adding headers...) and/or adjusting the settings (spacing, angle span, min radius etc ...) *As explained in the features heading*

## Experimental Usage
Although the main intent of this plugin is to translate preexisting MOC notes, I have found it can also be used to quickly generate canvases. 

1. Create a new file
2. Add to the file... make sure to replace Link*n* with a real link. Canvas MOC does not display unresolved links: 
```
# Building a house
## Planning Phase
- [[Link1]]
- [[Link2]]
- [[Link3]]
## Design Phase
- [[Link3]]
- [[Link4]]
- [[Link5]]
## Construction Phase
- [[Link6]]
- [[Link7]]
- [[Link8]]
```
3. Run `Create Canvas` from the command pallet
4. Check out your newly generated canvas!
5. Do canvas-y stuff; rearrange it, add links, add notes...


![Peek 2023-01-13 21-29](https://user-images.githubusercontent.com/88951499/212446740-3ecdea73-c0af-4972-80ed-b902a7540b62.gif)

# Status/Process


- [x] Figure out how to edit obsidian canvases. Explanation below
  1. Read the file
  2. JSON.parse the file into the canvas interface specified in the obsidian api
  3. Edit this interface
  4. Update the file and SEE THE CHANGES
- [x] Implement the plugin just for links
  - Currently works. Creates a circle of the outlinks around the MOC note node
  - I used some cool trig equations for the coordinates. This was fun!
- [x] Implement the plugin for headers; the headers will be at level 1 of the graph, then all links in the headers will be at level 2
  - For this, I added an angle span parameter to the coordinate generation algo (which uses the trig stuff from above)
- [x] Add regenerate file modal
- [x] Add settings menu. This supports...
  - Spacing (between nodes)
  - Minimum radius (for when there are few nodes)
  - Heights and widths
  - Angle span (for when the nodes are branching from headings)
- [x] Set up BRAT for easier user testing
- [ ] Generate as new canvas
- [ ] Auto-fit card to content (within a certain size)
- [ ] Jump to canvas group functionality from MOC. This is cool because it involves the canvas and the MOC being used. It is true, that sometimes it is a pain to find a specific canvas section. Potential for future direction: integrate MOC to canvas to get the best of both worlds
- [ ] Indentation and multiple headers. This will involve making a new algo
- [ ] Add a setting to show all headers
- [ ] Integration with dataview in MOCs
- [ ] Idea from the drag and drop. Intercept this drag and drop and structure through my plugin
 



# Credits

The idea for this plugin came from a reddit comment requesting this feature; u/J4nosch wrote this comment. 
