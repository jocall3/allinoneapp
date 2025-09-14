import{r as t,j as e,P as g,K as b}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const p=`# Slide 1: Welcome

This is a slide deck generated from Markdown.

- Use standard markdown syntax
- Like lists, headers, and **bold** text.

---

# Slide 2: Features

Navigate using the buttons below.

\`\`\`javascript
console.log("Code blocks work too!");
\`\`\`

---

# Slide 3: The End

Easy to create and present.
`,w=()=>{const[n,m]=t.useState(p),[l,i]=t.useState(0),[u,x]=t.useState(""),a=t.useRef(null),r=t.useMemo(()=>n.split(/^-{3,}\s*$/m),[n]);t.useEffect(()=>{(async()=>{const o=r[l]||"",h=await b.parse(o);x(h)})()},[r,l]);const d=t.useCallback(()=>i(s=>Math.min(s+1,r.length-1)),[r.length]),c=t.useCallback(()=>i(s=>Math.max(s-1,0)),[]),f=()=>{var s;(s=a.current)==null||s.requestFullscreen()};return t.useEffect(()=>{const s=o=>{document.fullscreenElement===a.current&&((o.key==="ArrowRight"||o.key===" ")&&d(),o.key==="ArrowLeft"&&c())};return document.addEventListener("keydown",s),()=>document.removeEventListener("keydown",s)},[d,c]),e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(g,{}),e.jsx("span",{className:"ml-3",children:"Markdown to Slides"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Write markdown, present it as a slideshow. Use '---' to separate slides."})]}),e.jsxs("div",{className:"flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden",children:[e.jsxs("div",{className:"flex flex-col h-full",children:[e.jsx("label",{htmlFor:"md-input",className:"text-sm font-medium text-text-secondary mb-2",children:"Markdown Editor"}),e.jsx("textarea",{id:"md-input",value:n,onChange:s=>m(s.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"})]}),e.jsxs("div",{ref:a,className:"flex flex-col h-full bg-surface fullscreen:bg-background border border-border rounded-md",children:[e.jsx("div",{className:"flex-shrink-0 flex justify-end items-center p-2 border-b border-border",children:e.jsx("button",{onClick:f,className:"px-3 py-1 bg-gray-100 rounded-md text-xs hover:bg-gray-200",children:"Fullscreen"})}),e.jsxs("div",{className:"relative flex-grow flex flex-col justify-center items-center p-8 overflow-y-auto",children:[e.jsx("div",{className:"prose prose-lg max-w-none w-full",dangerouslySetInnerHTML:{__html:u}}),e.jsx("button",{onClick:c,disabled:l===0,className:"absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-200/50 rounded-full disabled:opacity-30 hover:bg-gray-300/50",children:"◀"}),e.jsx("button",{onClick:d,disabled:l===r.length-1,className:"absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-200/50 rounded-full disabled:opacity-30 hover:bg-gray-300/50",children:"▶"}),e.jsxs("div",{className:"absolute bottom-4 right-4 text-xs bg-black/50 px-2 py-1 rounded-md text-white",children:[l+1," / ",r.length]})]})]})]})]})};export{w as MarkdownSlides};
