import{r as u,j as s,z as S}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const h=`$primary-color: #0047AB;
$font-size: 16px;

.container {
  padding: 20px;
  background-color: #f0f0f0;

  .title {
    color: $primary-color;
    font-size: $font-size * 1.5;

    &:hover {
      text-decoration: underline;
    }
  }
  
  > p {
    margin-top: 10px;
  }
}`,g=c=>c.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),b=c=>{try{let e=c;e=e.replace(/\/\/.*$/gm,"");const a={};e=e.replace(/\$([\w-]+):\s*(.*?);/g,(r,t,l)=>(a[t]=l.trim(),""));for(let r=0;r<5;r++)Object.entries(a).forEach(([t,l])=>{e=e.replace(new RegExp(`\\$${g(t)}`,"g"),l)});e=e.replace(/([\d.]+)(px|rem|em|%)\s*([*\/])\s*([\d.]+)/g,(r,t,l,m,n)=>{const x=parseFloat(t),p=parseFloat(n);return`${m==="*"?x*p:x/p}${l}`});const i=(r,t="")=>{let l="",m="";const n=[],x=/((?:[\w-:.#&>+~*\s,]+|\([^)]*\))\s*\{[^{}]*\})|((?:[\w-]+\s*:[^;]+;))/g,p=r.substring(r.indexOf("{")+1,r.lastIndexOf("}"));let o;for(;(o=x.exec(p))!==null;)if(o[1]){const d=o[1].substring(0,o[1].indexOf("{")).trim(),f=d.includes("&")?d.replace(/&/g,t):`${t} ${d}`.trim();m+=i(o[1],f)}else o[2]&&n.push(`  ${o[2].trim()}`);return n.length>0&&(l=`${t} {
${n.join(`
`)}
}
`),l+m};return i(`root{${e}}`,"").trim().replace(/root\s*\{\s*\}/,"").trim()}catch(e){return console.error("SCSS Compilation Error:",e),"/* Error compiling SCSS. Check console for details. */"}},N=()=>{const[c,e]=u.useState(h),a=u.useMemo(()=>b(c),[c]);return s.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[s.jsxs("header",{className:"mb-6",children:[s.jsxs("h1",{className:"text-3xl flex items-center",children:[s.jsx(S,{}),s.jsx("span",{className:"ml-3",children:"SASS/SCSS Compiler"})]}),s.jsx("p",{className:"text-text-secondary mt-1",children:"A real-time SASS/SCSS to CSS compiler."})]}),s.jsxs("div",{className:"flex-grow flex flex-col gap-4 min-h-0",children:[s.jsxs("div",{className:"flex flex-col flex-1 min-h-0",children:[s.jsx("label",{htmlFor:"scss-input",className:"text-sm font-medium text-text-secondary mb-2",children:"SASS/SCSS Input"}),s.jsx("textarea",{id:"scss-input",value:c,onChange:i=>e(i.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md resize-y font-mono text-sm text-pink-600",spellCheck:"false"})]}),s.jsxs("div",{className:"flex flex-col flex-1 min-h-0",children:[s.jsx("label",{className:"text-sm font-medium text-text-secondary mb-2",children:"Compiled CSS Output"}),s.jsx("pre",{className:"flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto text-blue-700 font-mono text-sm whitespace-pre-wrap",children:a})]})]})]})};export{N as SassScssCompiler};
