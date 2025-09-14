import{r,a4 as j,j as e,a5 as y,L as h,A as g,M as b}from"./index-Br2PlERp.js";import{d as w}from"./fileUtils-Dvg4vqd5.js";import"https://esm.sh/octokit@4.0.2";const k=`// main.js
const worker = new Worker('worker.js');

// This object is sent back and forth.
// A race condition can occur because both threads
// read the counter, increment it, and send it back.
// The final value depends on which thread's message
// is processed last.
const data = { counter: 0 };

worker.onmessage = function(e) {
  // Main thread reads and updates
  data.counter = e.data.counter;
  console.log('Main received:', data.counter);
  data.counter++;
  worker.postMessage(data);
};

// Start the process
console.log('Main starting with:', data.counter);
data.counter++;
worker.postMessage(data);


// worker.js
// onmessage = function(e) {
//   // Worker reads and updates
//   let receivedCounter = e.data.counter;
//   console.log('Worker received:', receivedCounter);
//   receivedCounter++;
//   postMessage({ counter: receivedCounter });
// }
`,C=({codeInput:a})=>{const[x,m]=r.useState(a||k),[t,u]=r.useState(""),[s,f]=r.useState(!1),[l,d]=r.useState(""),i=r.useCallback(async n=>{if(!n.trim()){d("Please paste some code to analyze.");return}f(!0),d(""),u("");try{const o=j(n);let c="";for await(const p of o)c+=p,u(c)}catch(o){const c=o instanceof Error?o.message:"An unknown error occurred.";d(`Failed to analyze code: ${c}`)}finally{f(!1)}},[]);return r.useEffect(()=>{a&&(m(a),i(a))},[a,i]),e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center",children:[e.jsx(y,{}),e.jsx("span",{className:"ml-3",children:"AI Concurrency Analyzer"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Analyze JavaScript code for potential Web Worker concurrency issues."})]}),e.jsxs("div",{className:"flex-grow flex flex-col gap-4 min-h-0",children:[e.jsxs("div",{className:"flex flex-col flex-1 min-h-0",children:[e.jsx("label",{htmlFor:"code-input",className:"text-sm font-medium text-text-secondary mb-2",children:"JavaScript Code"}),e.jsx("textarea",{id:"code-input",value:x,onChange:n=>m(n.target.value),placeholder:"Paste your worker-related JS code here...",className:"flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"})]}),e.jsx("div",{className:"flex-shrink-0",children:e.jsx("button",{onClick:()=>i(x),disabled:s,className:"btn-primary w-full max-w-xs mx-auto flex items-center justify-center px-6 py-3",children:s?e.jsx(h,{}):"Analyze Code"})}),e.jsxs("div",{className:"flex flex-col flex-1 min-h-0",children:[e.jsxs("div",{className:"flex justify-between items-center mb-2",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary",children:"AI Analysis"}),t&&!s&&e.jsxs("button",{onClick:()=>w(t,"analysis.md","text/markdown"),className:"flex items-center gap-1 px-3 py-1 bg-gray-100 text-xs rounded-md hover:bg-gray-200",children:[e.jsx(g,{className:"w-4 h-4"})," Download"]})]}),e.jsxs("div",{className:"flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto",children:[s&&e.jsx("div",{className:"flex items-center justify-center h-full",children:e.jsx(h,{})}),l&&e.jsx("p",{className:"text-red-500",children:l}),t&&!s&&e.jsx(b,{content:t}),!s&&!t&&!l&&e.jsx("div",{className:"text-text-secondary h-full flex items-center justify-center",children:"Analysis will appear here."})]})]})]})]})};export{C as WorkerThreadDebugger};
