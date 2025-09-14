import{r as s,aZ as p,j as e,ab as u,L as c,M as h}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const f=`
function processOrder(order) {
  if (order.customer.isVip) {
    if (order.total > 500) {
      return "priority_shipping_high_value";
    } else {
      return "priority_shipping";
    }
  } else {
    if (order.total > 1000) {
      return "standard_shipping_high_value";
    } else if (order.total > 50) {
        return "standard_shipping";
    } else {
        return "economy_shipping"
    }
  }
}`,j=()=>{const[t,x]=s.useState(f),[o,n]=s.useState(""),[a,i]=s.useState(!1),[d,l]=s.useState(""),m=s.useCallback(async()=>{if(!t.trim()){l("Please enter code to analyze.");return}i(!0),l(""),n("");try{const r=await p(t);n(r)}catch(r){l(r instanceof Error?r.message:"An unknown error occurred.")}finally{i(!1)}},[t]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(u,{}),e.jsx("span",{className:"ml-3",children:"AI Code Complexity Analysis"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Analyze code complexity and maintainability."})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"code-input",className:"text-sm font-medium text-text-secondary mb-2",children:"Code to Analyze"}),e.jsx("textarea",{id:"code-input",value:t,onChange:r=>x(r.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"}),e.jsx("button",{onClick:m,disabled:a,className:"btn-primary mt-4 w-full",children:a?e.jsx(c,{}):"Analyze Complexity"})]}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Analysis Report"}),e.jsxs("div",{className:"flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto",children:[a&&e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(c,{})}),d&&e.jsx("p",{className:"text-red-500",children:d}),o&&e.jsx(h,{content:o})]})]})]})]})};export{j as AiDrivenCodeComplexity};
