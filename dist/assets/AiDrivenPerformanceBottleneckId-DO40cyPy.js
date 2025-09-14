import{r,aT as p,j as e,ab as h,L as m,M as j}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const b=`
function findPrimes(limit) {
  const primes = [];
  for (let i = 2; i <= limit; i++) {
    let isPrime = true;
    for (let j = 2; j < i; j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(i);
    }
  }
  return primes;
}`,N=()=>{const[t,x]=r.useState(b),[o,l]=r.useState(""),[a,i]=r.useState(!1),[c,n]=r.useState(""),f=r.useCallback(async()=>{if(!t.trim()){n("Please enter code to analyze.");return}i(!0),n(""),l("");try{const s=p(t);let d="";for await(const u of s)d+=u,l(d)}catch(s){n(s instanceof Error?s.message:"An unknown error occurred.")}finally{i(!1)}},[t]);return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(h,{}),e.jsx("span",{className:"ml-3",children:"AI Performance Bottleneck Identifier"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Analyze code for potential performance issues and get optimization suggestions."})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{htmlFor:"code-input",className:"text-sm font-medium text-text-secondary mb-2",children:"Code to Analyze"}),e.jsx("textarea",{id:"code-input",value:t,onChange:s=>x(s.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"}),e.jsx("button",{onClick:f,disabled:a,className:"btn-primary mt-4 w-full",children:a?e.jsx(m,{}):"Analyze Performance"})]}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Performance Report"}),e.jsxs("div",{className:"flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto",children:[a&&e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(m,{})}),c&&e.jsx("p",{className:"text-red-500",children:c}),o&&e.jsx(j,{content:o})]})]})]})]})};export{N as AiDrivenPerformanceBottleneckId};
