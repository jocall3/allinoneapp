import{r as t,bL as f,j as e,bK as g,L as m,M as b}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const h=`
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: npm install, build, and test
      run: |
        npm install
        npm run build --if-present
        npm test
`,N=()=>{const[n,x]=t.useState(h),[i,o]=t.useState(""),[r,l]=t.useState(!1),[c,a]=t.useState(""),u=t.useCallback(async()=>{if(!n.trim()){a("Please provide a CI/CD configuration.");return}l(!0),a(""),o("");try{const s=f(n);let d="";for await(const p of s)d+=p,o(d)}catch(s){a(s instanceof Error?s.message:"An unknown error occurred.")}finally{l(!1)}},[n]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(g,{}),e.jsx("span",{className:"ml-3",children:"CI/CD Pipeline Optimizer"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Paste a CI/CD config to get optimization suggestions."})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"config-input",className:"text-sm font-medium text-text-secondary mb-2",children:"CI/CD Configuration (e.g., GitHub Actions YAML)"}),e.jsx("textarea",{id:"config-input",value:n,onChange:s=>x(s.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"}),e.jsx("button",{onClick:u,disabled:r,className:"btn-primary mt-4 w-full",children:r?e.jsx(m,{}):"Optimize Pipeline"})]}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Optimization Report"}),e.jsxs("div",{className:"flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto",children:[r&&e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(m,{})}),c&&e.jsx("p",{className:"text-red-500",children:c}),i&&e.jsx(b,{content:i})]})]})]})]})};export{N as CiCdPipelineOptimizer};
