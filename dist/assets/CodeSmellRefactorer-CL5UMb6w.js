import{r as t,b_ as h,j as e,S as p,L as m,M as g}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const j=`
// This function has a "long method" code smell.
function processOrder(order) {
    // validation
    if (!order.id || !order.items) {
        console.error("Invalid order");
        return;
    }

    // calculate total
    let total = 0;
    for(const item of order.items) {
        total += item.price * item.quantity;
    }

    // apply discount
    if (order.customer.isVip) {
        total *= 0.9;
    }

    // save to database
    console.log("Saving order " + order.id + " with total " + total);
}
`,v=()=>{const[s,x]=t.useState(j),[l,c]=t.useState(""),[o,d]=t.useState(!1),[n,a]=t.useState(""),f=t.useCallback(async()=>{if(!s.trim()){a("Please provide code to refactor.");return}d(!0),a(""),c("");try{const r=h(s);let i="";for await(const u of r)i+=u,c(i)}catch(r){a(r instanceof Error?r.message:"An unknown error occurred.")}finally{d(!1)}},[s]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(p,{}),e.jsx("span",{className:"ml-3",children:"Code Smell Refactorer"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Automatically refactor common code smells like long methods or large classes."})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"code-input",className:"text-sm font-medium text-text-secondary mb-2",children:'Code with "Smells"'}),e.jsx("textarea",{id:"code-input",value:s,onChange:r=>x(r.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"}),e.jsx("button",{onClick:f,disabled:o,className:"btn-primary mt-4 w-full",children:o?e.jsx(m,{}):"Refactor Code"})]}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Refactored Code"}),e.jsxs("div",{className:"flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto",children:[o&&e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(m,{})}),n&&e.jsx("p",{className:"p-4 text-red-500",children:n}),l&&e.jsx(g,{content:l})]})]})]})]})};export{v as CodeSmellRefactorer};
