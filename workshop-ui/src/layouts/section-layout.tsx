import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import { Remarkable } from 'remarkable';
import hljs from 'highlight.js';
import {useEffect, useState} from "react";
import GLightbox from "glightbox";


const md = new Remarkable('full', {
        html: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) {}
            }
            try {
                return hljs.highlightAuto(str).value;
            } catch (__) {}
            return ''; // use external default escaping
        }
    }
);

export default function SectionLayout(props: {component: React.ReactElement, mdPath: string}) {

    const [markdown, setMarkdown] = useState("");

    useEffect(() => {
        // fetching markdown based on the path that was
        // passed in via component props
        fetch(props.mdPath)
            .then((res) => res.text())
            .then((text) => {
                setMarkdown(md.render(text))
                });
        }, []);

    useEffect(() => {
        const pres = document.getElementsByTagName("pre")
        // @ts-ignore
        for (const p of pres) {
            if (p.previousElementSibling?.children[0]?.classList[0] !== "copy") {
                continue
            }
            const handler = function (e: MouseEvent) {
                const t = p.innerText
                navigator.clipboard.writeText(t).then(function() {
                    console.log('Async: Copying to clipboard was successful!');
                }, function(err) {
                    console.error('Async: Could not copy text: ', err);
                });
            }
            const i = document.createElement("img")
            i.setAttribute("src", "images/copy-icon.svg")
            i.setAttribute("title", "Copy to clipboard")
            i.setAttribute("class", "copy-icon")
            i.addEventListener("click", handler)
            const b = document.createElement("button")
            b.setAttribute("class", "hidden-button")
            b.setAttribute("aria-label", "Copy to clipboard")
            b.addEventListener("click", handler)
            p.prepend(i)
            p.append(b)
        }
        const lightbox = GLightbox({
            width: "70%",
            zoomable: false
        })
    }, [markdown]);

    return (
        <Box sx={{ display: 'flex' }}>
            <Box component="main" sx={{ width: "57%", p: 3 }}>
                <Toolbar/>
                {/*INJECTING THE CHILD COMPONENT*/}
                {props.component}
                {/*******************************/}
            </Box>
            <Drawer
                PaperProps={{
                    sx: {
                        width: "43%",
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { boxSizing: 'border-box' },
                    },
                }}
                variant="permanent"
                anchor="right"
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', p: 2 }} id={"markdown-renderer"}>
                    <div dangerouslySetInnerHTML={{ __html: markdown}}>
                    </div>
                </Box>
            </Drawer>
        </Box>
    );
}