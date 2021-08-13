'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

figma.showUI(__html__, { width: 288, height: 220 });
const nodes = [];
let frameContainerNodeId;
let frameContainerNode;
const gap = 10;
const columns = 10;
const componentWidth = 65;
const componentHeight = 65;
const margin = 50;
let x = 0 + margin;
let y = 0 + margin;
// let iconNames:[] = [];
let duplicateIcons = 0;
let completedIcons = 0;
let documentNodeList = [];
let workingState = false;
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === 'init') {
        try {
            yield figma.loadFontAsync({ family: "Open Sans", style: "Regular" });
        }
        catch (e) {
            figma.notify(e);
        }
    }
    if (msg.type === 'load-fonts') {
        try {
            yield figma.loadFontAsync({ family: msg.font, style: "Regular" });
            figma.notify(`${msg.font} is installed`);
            figma.ui.postMessage({
                type: 'analyze-selection',
                fontInstalled: true
            });
        }
        catch (e) {
            figma.ui.postMessage({
                type: 'analyze-selection',
                fontInstalled: false
            });
            figma.notify(e);
        }
        // iconNames = msg.names;
    }
    if (msg.type === 'create-icon') {
        let count = msg.count === 0 ? 0 : msg.count - 1;
        if (count === 0) {
            figma.ui.postMessage({ workingState: workingState, count: count, completed: completedIcons, skipped: duplicateIcons, type: 'loop-end' });
            postResults();
            reset();
        }
        else {
            buildIcon(msg.icon, msg.font, msg.prefix);
            figma.ui.postMessage({ workingState: workingState, count: count, completed: completedIcons, skipped: duplicateIcons, type: 'create-end' });
        }
    }
});
function postResults() {
    let message = "";
    if (duplicateIcons === 0 && nodes.length === 0) {
        message = `No icons found.`;
    }
    else if (duplicateIcons > 0 && nodes.length === 0) {
        message = `No new icons found. ${duplicateIcons} icons already exist.`;
    }
    else if (duplicateIcons > 0 && nodes.length === 1) {
        message = `Added ${nodes.length} new icon! ${duplicateIcons} icons already exist.`;
    }
    else if (duplicateIcons > 0 && nodes.length > 1) {
        message = `Added ${nodes.length} new icons! ${duplicateIcons} icons already exist.`;
    }
    else {
        message = (`Added ${nodes.length} new icons!`);
    }
    figma.notify(message);
    figma.ui.postMessage({
        type: 'results',
        message: message
    });
}
function reset() {
    x = 0 + margin;
    y = 0 + margin;
    duplicateIcons = 0;
    documentNodeList = [];
}
function buildIcon(icon, font, prefix) {
    const uniqueIconName = (icon.properties.name).split(', ')[0];
    const iconName = prefix + uniqueIconName;
    // used to set a state in the plugin ui
    workingState = true;
    // create a frame to insert new components.
    // should run only the first time
    if (figma.getNodeById(frameContainerNodeId) == null) {
        const frameContainerNodeNode = figma.createFrame();
        frameContainerNodeId = frameContainerNodeNode.id;
        figma.currentPage.appendChild(frameContainerNodeNode);
        frameContainerNodeNode.x = figma.viewport.center.x - 420;
        frameContainerNodeNode.y = figma.viewport.center.y;
        frameContainerNode = figma.getNodeById(frameContainerNodeId);
    }
    else {
        frameContainerNode = figma.getNodeById(frameContainerNodeId);
    }
    // get a documentNodeList of all component nodes
    // to compare with selection for duplicates.
    // should run only the first time.
    if (documentNodeList.length === 0) {
        let components = figma.root.findAll(n => n.type === "COMPONENT");
        components.forEach(c => {
            documentNodeList.push(c.name);
        });
    }
    // 
    if (!documentNodeList.includes(iconName)) {
        const frame = figma.createFrame();
        const iconComponent = figma.createComponent();
        const glyph = figma.createText();
        const label = figma.createText();
        const background = figma.createRectangle();
        frame.resize(componentWidth, componentHeight);
        background.resize(componentWidth, componentHeight);
        background.opacity = 0;
        background.locked = true;
        iconComponent.name = iconName;
        iconComponent.resize(20, 20);
        iconComponent.appendChild(glyph);
        iconComponent.description = `(Master Component):\nCSS Class: ${iconName}\nCSS Content: TODO}`;
        frame.appendChild(label);
        frame.appendChild(iconComponent);
        frame.insertChild(0, background);
        glyph.fontName = { family: font, style: "Regular" };
        glyph.characters = String.fromCharCode(icon.properties.code);
        glyph.textAlignHorizontal = "CENTER";
        glyph.name = "Icon";
        glyph.fontSize = 20;
        glyph.resize(20, 20);
        glyph.x = 0;
        glyph.y = 0;
        frame.name = iconName;
        frame.x = x;
        frame.y = y;
        label.name = "CSS Class";
        label.fontName = { family: "Open Sans", style: "Regular" };
        label.characters = iconName;
        label.textAlignHorizontal = "CENTER";
        label.fontSize = 6;
        iconComponent.x = (frame.width / 2) - (iconComponent.width / 2);
        iconComponent.y = 10;
        label.x = (frame.width / 2) - (label.width / 2);
        label.y = 35;
        const group = figma.group([label, iconComponent, background], figma.currentPage);
        group.name = iconName;
        frame.remove();
        frameContainerNode.appendChild(group);
        nodes.push(group);
        // position
        x = x + componentWidth + gap;
        if (x > ((componentWidth + gap) * columns) + margin - gap) {
            y = y + componentHeight + gap;
            x = 0 + margin;
        }
        frameContainerNode.resize(840, y + componentHeight + gap + margin);
        completedIcons = completedIcons + 1;
    }
    else {
        duplicateIcons = duplicateIcons + 1;
    }
}
