import{r as t,b6 as u,j as e,aK as p,L as d}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const j=`
From: John Doe (john.doe@example.com)
To: Jane Smith
Date: 2024-07-15

Hi Jane,

Please process invoice #12345 for our client, Acme Corp. Their contact is Robert Paulson at 555-123-4567.

Thanks,
John
`,g=()=>{const[a,m]=t.useState(j),[o,l]=t.useState(""),[r,i]=t.useState(!1),[c,n]=t.useState(""),h=t.useCallback(async()=>{if(!a.trim()){n("Please provide text to anonymize.");return}i(!0),n(""),l("");try{const s=u(a);let x="";for await(const f of s)x+=f,l(x)}catch(s){n(s instanceof Error?s.message:"An unknown error occurred.")}finally{i(!1)}},[a]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(p,{}),e.jsx("span",{className:"ml-3",children:"AI Data Anonymization"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Redact Personally Identifiable Information (PII) from text."})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"text-input",className:"text-sm font-medium text-text-secondary mb-2",children:"Original Text"}),e.jsx("textarea",{id:"text-input",value:a,onChange:s=>m(s.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none"}),e.jsx("button",{onClick:h,disabled:r,className:"btn-primary mt-4 w-full",children:r?e.jsx(d,{}):"Anonymize Text"})]}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Anonymized Text"}),e.jsxs("div",{className:"flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto",children:[r&&e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(d,{})}),c&&e.jsx("p",{className:"text-red-500",children:c}),o&&e.jsx("pre",{className:"whitespace-pre-wrap",children:o})]})]})]})]})};export{g as AiDataAnonymization};
