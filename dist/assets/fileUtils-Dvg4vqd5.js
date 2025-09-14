/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/const s=o=>{let n="";const t=new Uint8Array(o),e=t.byteLength;for(let r=0;r<e;r++)n+=String.fromCharCode(t[r]);return window.btoa(n)},d=o=>new Promise((n,t)=>{const e=new FileReader;e.onloadend=()=>{n(s(e.result))},e.onerror=r=>t(r),e.readAsArrayBuffer(o)}),c=o=>d(o),l=o=>new Promise((n,t)=>{const e=new FileReader;e.onloadend=()=>{const r=s(e.result);n(`data:${o.type};base64,${r}`)},e.onerror=r=>t(r),e.readAsArrayBuffer(o)}),b=(o,n,t="text/plain")=>{const e=new Blob([o],{type:t}),r=URL.createObjectURL(e),a=document.createElement("a");a.href=r,a.download=n,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(r)};export{d as a,l as b,b as d,c as f};
