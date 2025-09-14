import{r as t,c2 as p,j as e,bb as j,L as m,M as g}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const y=`
import { useState } from 'react';

function MyComponent() {
    const [count, setCount] = useState(0);

    const handleClick = () => {
        fetch('/api/data').then(res => res.json());
        setCount(c => c + 1);
    };

    return <button onClick={handleClick}>Count: {count}</button>;
}
`,N=()=>{const[r,x]=t.useState(y),[a,h]=t.useState("find all fetch calls"),[c,l]=t.useState(""),[n,d]=t.useState(!1),[i,o]=t.useState(""),f=t.useCallback(async()=>{if(!r.trim()||!a.trim()){o("Please provide code and a search query.");return}d(!0),o(""),l("");try{const s=p(a,r);let u="";for await(const b of s)u+=b,l(u)}catch(s){o(s instanceof Error?s.message:"An unknown error occurred.")}finally{d(!1)}},[r,a]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(j,{}),e.jsx("span",{className:"ml-3",children:"AST-Based Code Search"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Search code by its structure, not just text (e.g., 'find all async functions')."})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"code-input",className:"text-sm font-medium text-text-secondary mb-2",children:"Code to Search"}),e.jsx("textarea",{id:"code-input",value:r,onChange:s=>x(s.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"})]}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"query-input",className:"text-sm font-medium text-text-secondary mb-2",children:"Search Query"}),e.jsx("input",{id:"query-input",type:"text",value:a,onChange:s=>h(s.target.value),className:"w-full p-2 bg-surface border border-border rounded-md mb-2"}),e.jsx("button",{onClick:f,disabled:n,className:"btn-primary w-full",children:n?e.jsx(m,{}):"Search by Structure"}),e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2 mt-4",children:"Search Results"}),e.jsxs("div",{className:"flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto",children:[n&&e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(m,{})}),i&&e.jsx("p",{className:"p-4 text-red-500",children:i}),c&&e.jsx(g,{content:c})]})]})]})]})};export{N as AstBasedCodeSearch};
