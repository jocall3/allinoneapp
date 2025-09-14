import{r,bW as g,j as e,aM as b,L as x,M as j}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const v=`
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
`,N=`
openapi: 3.0.0
info:
  title: User API
  version: 1.1.0
paths:
  /users/{userId}:
    get:
      summary: Get user by user ID
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: integer
`,A=()=>{const[t,p]=r.useState(v),[a,u]=r.useState(N),[c,l]=r.useState(""),[n,i]=r.useState(!1),[d,o]=r.useState(""),f=r.useCallback(async()=>{if(!t.trim()||!a.trim()){o("Please provide both API specifications.");return}i(!0),o(""),l("");try{const s=g(t,a);let m="";for await(const h of s)m+=h,l(m)}catch(s){o(s instanceof Error?s.message:"An unknown error occurred.")}finally{i(!1)}},[t,a]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(b,{}),e.jsx("span",{className:"ml-3",children:"API Contract Tester"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Provide two API specs (e.g., OpenAPI) to check for breaking changes."})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"spec1-input",className:"text-sm font-medium text-text-secondary mb-2",children:"API Spec v1"}),e.jsx("textarea",{id:"spec1-input",value:t,onChange:s=>p(s.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"})]}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"spec2-input",className:"text-sm font-medium text-text-secondary mb-2",children:"API Spec v2"}),e.jsx("textarea",{id:"spec2-input",value:a,onChange:s=>u(s.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"})]})]}),e.jsx("div",{className:"flex-shrink-0 mt-4",children:e.jsx("button",{onClick:f,disabled:n,className:"btn-primary w-full max-w-sm mx-auto",children:n?e.jsx(x,{}):"Check for Breaking Changes"})}),e.jsxs("div",{className:"flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto mt-4",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"Analysis Report:"}),n&&e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(x,{})}),d&&e.jsx("p",{className:"text-red-500",children:d}),c&&e.jsx(j,{content:c})]})]})};export{A as ApiContractTester};
