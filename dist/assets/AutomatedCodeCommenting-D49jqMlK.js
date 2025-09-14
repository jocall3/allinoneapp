import{r as s,aS as h,j as e,n as g,L as i,M as j}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const b=`function calculateTotalPrice(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].price > 100) {
      total += items[i].price * 0.9;
    } else {
      total += items[i].price;
    }
  }
  return total;
}`,N=()=>{const[o,x]=s.useState(b),[a,l]=s.useState(""),[r,c]=s.useState(!1),[d,n]=s.useState(""),u=s.useCallback(async()=>{if(!o.trim()){n("Please enter some code to comment.");return}c(!0),n(""),l("");try{const t=`Add explanatory comments to the following code snippet. Only output the commented code, wrapped in a markdown code block.

\`\`\`
${o}
\`\`\``,p=h(t,"You are an expert at writing clear and concise code comments.");let m="";for await(const f of p)m+=f,l(m)}catch(t){n(t instanceof Error?t.message:"An unknown error occurred.")}finally{c(!1)}},[o]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(g,{}),e.jsx("span",{className:"ml-3",children:"AI Code Commenting"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Automatically add explanatory comments to your code."})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"code-input",className:"text-sm font-medium text-text-secondary mb-2",children:"Uncommented Code"}),e.jsx("textarea",{id:"code-input",value:o,onChange:t=>x(t.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"}),e.jsx("button",{onClick:u,disabled:r,className:"btn-primary mt-4 w-full",children:r?e.jsx(i,{}):"Add Comments"})]}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Commented Code"}),e.jsxs("div",{className:"flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto",children:[r&&e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(i,{})}),d&&e.jsx("p",{className:"p-4 text-red-500",children:d}),a&&e.jsx(j,{content:a})]})]})]})]})};export{N as AutomatedCodeCommenting};
