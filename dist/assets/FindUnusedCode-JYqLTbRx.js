import{r as n,b0 as h,j as e,x as p,L as u,M as j}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const b=`
function usedFunction() {
  console.log("I am used!");
}

function unusedFunction() {
  console.log("I am not used!");
}

function anotherUnusedFunction() {
    return 1 + 1;
}

usedFunction();
`,y=()=>{const[r,x]=n.useState(b),[a,c]=n.useState(""),[t,d]=n.useState(!1),[l,o]=n.useState(""),m=n.useCallback(async()=>{if(!r.trim()){o("Please provide code to scan.");return}d(!0),o(""),c("");try{const s=h(r);let i="";for await(const f of s)i+=f,c(i)}catch(s){o(s instanceof Error?s.message:"An unknown error occurred.")}finally{d(!1)}},[r]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(p,{}),e.jsx("span",{className:"ml-3",children:"Find Unused Code"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Scan your project to find dead or unreachable code."})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"code-input",className:"text-sm font-medium text-text-secondary mb-2",children:"Source Code"}),e.jsx("textarea",{id:"code-input",value:r,onChange:s=>x(s.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"}),e.jsx("button",{onClick:m,disabled:t,className:"btn-primary mt-4 w-full",children:t?e.jsx(u,{}):"Scan for Unused Code"})]}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Scan Report"}),e.jsxs("div",{className:"flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto",children:[t&&e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(u,{})}),l&&e.jsx("p",{className:"text-red-500",children:l}),a&&e.jsx(j,{content:a})]})]})]})]})};export{y as FindUnusedCode};
