import{r as i,af as C,j as e,S as v,L as p,A as u}from"./index-Br2PlERp.js";import{Z as w}from"./index-CNmm8XoK.js";import{d as f}from"./fileUtils-Dvg4vqd5.js";import"https://esm.sh/octokit@4.0.2";const N=({palette:n,colors:l,setColors:a})=>{const c=({label:r,value:s,onChange:m})=>e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("label",{className:"text-text-primary",children:r}),e.jsx("div",{className:"flex items-center gap-2",children:n.map(o=>e.jsx("button",{onClick:()=>m(o),className:`w-5 h-5 rounded-full border border-gray-300 ${s===o?"ring-2 ring-primary ring-offset-1":""}`,style:{backgroundColor:o},title:o},o))})]});return e.jsxs("div",{className:"bg-surface p-4 rounded-lg border border-border w-full max-w-sm",children:[e.jsx("h3",{className:"text-lg font-bold mb-4 text-text-primary",children:"Live Preview"}),e.jsxs("div",{className:"p-8 rounded-xl mb-4",style:{backgroundColor:l.cardBg},children:[e.jsx("div",{className:"px-4 py-1 rounded-full text-center text-sm inline-block",style:{backgroundColor:l.pillBg,color:l.pillText},children:"New Feature"}),e.jsx("div",{className:"mt-8 text-center",children:e.jsx("button",{className:"px-6 py-2 rounded-lg font-bold",style:{backgroundColor:l.buttonBg,color:l.cardBg},children:"Get Started"})})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(c,{label:"Card Background",value:l.cardBg,onChange:r=>a(s=>({...s,cardBg:r}))}),e.jsx(c,{label:"Pill Background",value:l.pillBg,onChange:r=>a(s=>({...s,pillBg:r}))}),e.jsx(c,{label:"Pill Text",value:l.pillText,onChange:r=>a(s=>({...s,pillText:r}))}),e.jsx(c,{label:"Button Background",value:l.buttonBg,onChange:r=>a(s=>({...s,buttonBg:r}))})]})]})},$=()=>{const[n,l]=i.useState("#0047AB"),[a,c]=i.useState(["#F0F2F5","#CCD3E8","#99AADD","#6688D1","#3366CC","#0047AB"]),[r,s]=i.useState(!1),[m,o]=i.useState(""),[d,g]=i.useState({cardBg:"#F0F2F5",pillBg:"#CCD3E8",pillText:"#0047AB",buttonBg:"#0047AB"}),h=i.useCallback(async()=>{s(!0),o("");try{const t=await C(n);c(t.colors),g({cardBg:t.colors[0],pillBg:t.colors[2],pillText:t.colors[5],buttonBg:t.colors[5]})}catch(t){const x=t instanceof Error?t.message:"An unknown error occurred.";o(`Failed to generate palette: ${x}`)}finally{s(!1)}},[n]),j=()=>{const t=`:root {
${a.map((x,b)=>`  --color-palette-${b+1}: ${x};`).join(`
`)}
}`;f(t,"palette.css","text/css")},y=()=>{const t=`
<div class="card">
  <div class="pill">New Feature</div>
  <button class="button">Get Started</button>
</div>
        `,x=`
.card {
  background-color: ${d.cardBg};
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
}
.pill {
  background-color: ${d.pillBg};
  color: ${d.pillText};
  display: inline-block;
  padding: 0.25rem 1rem;
  border-radius: 9999px;
  text-align: center;
  font-size: 0.875rem;
}
.button {
  margin-top: 2rem;
  background-color: ${d.buttonBg};
  color: ${d.cardBg};
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
}
        `,b=`<!-- HTML -->
${t}

<!-- CSS -->
<style>
${x}
</style>`;f(b,"preview-card.html","text/html")};return e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6 text-center",children:[e.jsxs("h1",{className:"text-3xl font-bold flex items-center justify-center",children:[e.jsx(v,{}),e.jsx("span",{className:"ml-3",children:"AI Color Palette Generator"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:"Pick a base color, let Gemini design a palette, and preview it on a UI card."})]}),e.jsxs("div",{className:"flex-grow flex flex-col lg:flex-row items-center justify-center gap-8",children:[e.jsxs("div",{className:"flex flex-col items-center gap-4",children:[e.jsx(w,{color:n,onChange:l,className:"!w-64 !h-64"}),e.jsx("div",{className:"p-2 bg-surface rounded-md font-mono text-lg border border-border",style:{color:n},children:n}),e.jsx("button",{onClick:h,disabled:r,className:"btn-primary w-full flex items-center justify-center px-6 py-3",children:r?e.jsx(p,{}):"Generate Palette"}),m&&e.jsx("p",{className:"text-red-500 text-sm mt-2",children:m})]}),e.jsxs("div",{className:"flex flex-col gap-2 w-full max-w-sm",children:[e.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Generated Palette:"}),r?e.jsx("div",{className:"flex items-center justify-center h-48",children:e.jsx(p,{})}):a.map(t=>e.jsxs("div",{className:"group flex items-center justify-between p-4 rounded-md shadow-sm border border-border",style:{backgroundColor:t},children:[e.jsx("span",{className:"font-mono font-bold text-black/70 mix-blend-overlay",children:t}),e.jsx("button",{onClick:()=>navigator.clipboard.writeText(t),className:"opacity-0 group-hover:opacity-100 transition-opacity bg-white/30 hover:bg-white/50 px-3 py-1 rounded text-xs text-black font-semibold backdrop-blur-sm",children:"Copy"})]},t)),e.jsxs("div",{className:"flex gap-2 mt-2",children:[e.jsxs("button",{onClick:j,className:"flex-1 flex items-center justify-center gap-2 text-sm py-2 bg-gray-100 border border-border rounded-md hover:bg-gray-200",children:[e.jsx(u,{className:"w-4 h-4"})," Download Colors"]}),e.jsxs("button",{onClick:y,className:"flex-1 flex items-center justify-center gap-2 text-sm py-2 bg-gray-100 border border-border rounded-md hover:bg-gray-200",children:[e.jsx(u,{className:"w-4 h-4"})," Download Card"]})]})]}),!r&&e.jsx(N,{palette:a,colors:d,setColors:g})]})]})};export{$ as ColorPaletteGenerator};
