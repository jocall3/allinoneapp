import{r as o,j as e,ab as h,a6 as u}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const f=`{
    "name": "startApp",
    "duration": 500,
    "children": [
        {
            "name": "fetchUserData",
            "duration": 300,
            "children": [
                { "name": "authenticate", "duration": 100 },
                { "name": "fetchProfile", "duration": 150 }
            ]
        },
        {
            "name": "loadInitialAssets",
            "duration": 450,
            "children": [
                { "name": "loadImage.png", "duration": 200 },
                { "name": "loadScript.js", "duration": 250 }
            ]
        }
    ]
}`,m=({node:s,level:i,maxDuration:t})=>{const[a,c]=u.useState(!0),n=s.children&&s.children.length>0;return e.jsxs("div",{className:"my-1",children:[e.jsxs("div",{className:"flex items-center p-2 rounded-md hover:bg-gray-100",style:{paddingLeft:`${i*20+8}px`},children:[n&&e.jsx("button",{onClick:()=>c(!a),className:`mr-2 text-text-secondary w-4 h-4 flex-shrink-0 transform transition-transform ${a?"rotate-90":""}`,children:"▶"}),!n&&e.jsx("div",{className:"w-6 mr-2 flex-shrink-0"}),e.jsxs("div",{className:"flex-grow flex items-center justify-between gap-4",children:[e.jsx("span",{className:"truncate",children:s.name}),e.jsxs("div",{className:"flex items-center gap-2 flex-shrink-0",children:[e.jsx("div",{className:"w-24 h-4 bg-gray-200 rounded-full overflow-hidden",children:e.jsx("div",{className:"h-4 bg-primary",style:{width:`${s.duration/t*100}%`}})}),e.jsxs("span",{className:"text-primary w-16 text-right",children:[s.duration.toFixed(0),"ms"]})]})]})]}),a&&n&&e.jsx("div",{children:s.children.map((r,l)=>e.jsx(m,{node:r,level:i+1,maxDuration:t},l))})]})},N=()=>{const[s,i]=o.useState(f),[t,a]=o.useState(""),{treeData:c,maxDuration:n}=o.useMemo(()=>{try{const r=JSON.parse(s);let l=0;const x=d=>{d.duration>l&&(l=d.duration),d.children&&d.children.forEach(x)};return x(r),a(""),{treeData:r,maxDuration:l}}catch{return a("Invalid JSON format."),{treeData:null,maxDuration:0}}},[s]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl flex items-center",children:[e.jsx(h,{}),e.jsx("span",{className:"ml-3",children:"Async Call Tree Viewer"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Paste a JSON structure to visualize an asynchronous function call tree."})]}),e.jsxs("div",{className:"flex-grow flex flex-col gap-4 min-h-0",children:[e.jsxs("div",{className:"flex flex-col h-2/5 min-h-[200px]",children:[e.jsx("label",{htmlFor:"json-input",className:"text-sm font-medium text-text-secondary mb-2",children:"JSON Input"}),e.jsx("textarea",{id:"json-input",value:s,onChange:r=>i(r.target.value),className:`flex-grow p-4 bg-surface border ${t?"border-red-500":"border-border"} rounded-md resize-y font-mono text-sm`,spellCheck:"false"}),t&&e.jsx("p",{className:"text-red-500 text-xs mt-1",children:t})]}),e.jsxs("div",{className:"flex flex-col flex-grow min-h-0",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Visual Tree"}),e.jsx("div",{className:"flex-grow bg-surface p-4 rounded-lg text-sm overflow-y-auto border border-border",children:c?e.jsx(m,{node:c,level:0,maxDuration:n}):e.jsx("div",{className:"text-text-secondary",children:t||"Enter valid JSON to see the tree."})})]})]})]})};export{N as AsyncCallTreeViewer};
