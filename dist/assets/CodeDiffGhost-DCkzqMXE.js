import{r,j as e,ae as u}from"./index-Br2PlERp.js";import"https://esm.sh/octokit@4.0.2";const x=`function UserProfile({ user }) {
  return (
    <div className="profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}`,h=`function UserProfile({ user }) {
  const { name, email, avatar } = user;
  return (
    <div className="profile-card">
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <a href={\`mailto:\${email}\`}>{email}</a>
    </div>
  );
}`,b=()=>{const[o,d]=r.useState(x),[a,f]=r.useState(h),[n,i]=r.useState(""),[l,c]=r.useState(!1),s=r.useRef(null),m=()=>{s.current&&clearInterval(s.current),c(!0),i(""),s.current=window.setInterval(()=>{i(t=>t.length<a.length?a.substring(0,t.length+1):(s.current&&clearInterval(s.current),c(!1),a))},15)};return r.useEffect(()=>()=>{s.current&&clearInterval(s.current)},[]),e.jsxs("div",{className:"h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary",children:[e.jsxs("header",{className:"mb-6",children:[e.jsxs("h1",{className:"text-3xl flex items-center",children:[e.jsx(u,{}),e.jsx("span",{className:"ml-3",children:"Code Diff Ghost"})]}),e.jsx("p",{className:"text-text-secondary mt-1",children:'Visualize code changes with a "ghost typing" effect.'})]}),e.jsx("div",{className:"flex justify-center mb-4",children:e.jsx("button",{onClick:m,disabled:l,className:"btn-primary px-6 py-2",children:l?"Visualizing...":"Show Changes"})}),e.jsxs("div",{className:"flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden font-mono text-sm",children:[e.jsxs("div",{className:"flex flex-col h-full",children:[e.jsx("label",{htmlFor:"before-code",className:"text-sm font-medium text-text-secondary mb-2",children:"Before"}),e.jsx("textarea",{id:"before-code",value:o,onChange:t=>d(t.target.value),className:"flex-grow p-4 bg-surface border border-border rounded-md text-red-600 whitespace-pre-wrap resize-none",spellCheck:"false"})]}),e.jsxs("div",{className:"flex flex-col h-full",children:[e.jsx("label",{htmlFor:"after-code",className:"text-sm font-medium text-text-secondary mb-2",children:"After"}),e.jsxs("div",{className:"relative flex-grow",children:[e.jsx("textarea",{id:"after-code",value:a,onChange:t=>f(t.target.value),className:"absolute inset-0 w-full h-full p-4 bg-surface border border-border rounded-md text-emerald-700 whitespace-pre-wrap resize-none z-0",spellCheck:"false"}),(l||n)&&e.jsxs("pre",{className:"absolute inset-0 w-full h-full p-4 bg-surface pointer-events-none text-emerald-700 whitespace-pre-wrap z-10",children:[n,l&&e.jsx("span",{className:"animate-pulse",children:"|"})]})]})]})]})]})};export{b as CodeDiffGhost};
