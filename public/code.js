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

figma.showUI(__html__, { width: 232, height: 208 });
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === 'prepare-icons') {
        const allPromise = Promise.all([
            yield figma.loadFontAsync({ family: msg.icons.metadata.name, style: "Regular" }),
            yield figma.loadFontAsync({ family: "Open Sans", style: "Regular" })
        ]);
        allPromise.then(values => {
            console.log(values);
            buildIcons(msg.icons);
        }).catch(error => {
        });
    }
    if (msg.type === 'test') {
        const node = figma.createVector();
        // This creates a triangle
        node.vectorPaths = [{
                windingRule: 'EVENODD',
                // data: 'M 0 100 L 100 100 L 50 0 Z',
                data: "M 512 32l-512 512 96 96 96-96v416h256v-192h128v192h256v-416l96 96 96-96-512-512zM512 448c-35.346 0-64-28.654-64-64s28.654-64 64-64c35.346 0 64 28.654 64 64s-28.654 64-64 64z",
            }];
        // Put the node in the center of the viewport so we can see it
        node.x = figma.viewport.center.x - node.width / 2;
        node.y = figma.viewport.center.y - node.height / 2;
        figma.closePlugin();
    }
});
function buildIcons(icons) {
    // console.log(msg.icons.icons)
    const prefix = icons.preferences.fontPref.prefix;
    // nodes
    const nodes = [];
    let gap = 10;
    let columns = 10;
    let componentWidth = 65;
    let componentHeight = 65;
    let margin = 50;
    let x = 0 + margin;
    let y = 0 + margin;
    // | margin
    // | margin | componentWidth | gap | componentWidth | margin
    let container;
    let selection = figma.currentPage.selection;
    let duplicateIcons = 0;
    if (selection.length === 1 && selection[0].type === "FRAME") {
        container = selection[0];
    }
    else {
        figma.notify('Must select a frame to insert icon components.');
        return;
    }
    tellUI({ icon: '', text: "building" });
    // build all the components
    for (let i = 0; i < icons.icons.length; i++) {
        const icon = icons.icons[i];
        const iconName = prefix + icon.properties.name;
        const iconAlreadyExists = figma.root.findAll(n => n.name === iconName);
        if (!(iconAlreadyExists.length > 0)) {
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
            glyph.fontName = { family: icons.metadata.name, style: "Regular" };
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
            container.appendChild(group);
            nodes.push(group);
            // position
            x = x + componentWidth + gap;
            if (x > ((componentWidth + gap) * columns) + margin - gap) {
                y = y + componentHeight + gap;
                x = 0 + margin;
            }
        }
        else {
            duplicateIcons = duplicateIcons + 1;
        }
    }
    if (duplicateIcons === 0 && nodes.length === 0) {
        figma.notify(`No icons found.`);
    }
    else if (duplicateIcons > 0 && nodes.length === 0) {
        figma.notify(`${duplicateIcons} icons alredy exist. No new icons found to add.`);
    }
    else if (duplicateIcons > 0 && nodes.length === 1) {
        figma.notify(`${duplicateIcons} icons alredy exist. Added ${nodes.length} new icon!`);
    }
    else if (duplicateIcons > 0 && nodes.length > 1) {
        figma.notify(`${duplicateIcons} icons alredy exist. Added ${nodes.length} new icons!`);
    }
    else {
        figma.notify(`Added ${nodes.length} new icons!`);
    }
    figma.viewport.scrollAndZoomIntoView(nodes);
    tellUI({ icon: '', text: 'done' });
    // figma.showUI(__html__, { width: 232, height: 400 });
}
function tellUI(message) {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.ui.postMessage(message);
    });
}
