import{r as s,bX as b,j as e,bV as p,L as x,M as h}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const g=`
class DatabaseConnection {
    private static instance: DatabaseConnection;
    private constructor() { /* ... */ }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
}
`,N=()=>{const[a,m]=s.useState(g),[o,c]=s.useState(""),[n,l]=s.useState(!1),[i,r]=s.useState(""),f=s.useCallback(async()=>{if(!a.trim()){r("Please provide code to analyze.");return}l(!0),r(""),c("");try{const t=b(a);let d="";for await(const u of t)d+=u,c(d)}catch(t){r(t instanceof Error?t.message:"An unknown error occurred.")}finally{l(!1)}},[a]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(p,{}),e.jsx("span",{className:"ml-3",children:"Architectural Pattern Identifier"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Analyze code to identify design patterns like Singleton, Factory, etc."})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"code-input",className:"text-sm font-medium text-text-secondary mb-2",children:"Code to Analyze"}),e.jsx("textarea",{id:"code-input",value:a,onChange:t=>m(t.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"}),e.jsx("button",{onClick:f,disabled:n,className:"btn-primary mt-4 w-full",children:n?e.jsx(x,{}):"Identify Patterns"})]}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Identified Patterns"}),e.jsxs("div",{className:"flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto",children:[n&&e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(x,{})}),i&&e.jsx("p",{className:"text-red-500",children:i}),o&&e.jsx(h,{content:o})]})]})]})]})};export{N as ArchitecturalPatternIdentifier};
