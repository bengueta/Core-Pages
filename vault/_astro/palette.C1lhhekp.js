import{r as d}from"./index.DBy5LfQW.js";var b={exports:{}},c={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var m;function E(){if(m)return c;m=1;var e=Symbol.for("react.transitional.element"),t=Symbol.for("react.fragment");function a(o,i,n){var l=null;if(n!==void 0&&(l=""+n),i.key!==void 0&&(l=""+i.key),"key"in i){n={};for(var s in i)s!=="key"&&(n[s]=i[s])}else n=i;return i=n.ref,{$$typeof:e,type:o,key:l,ref:i!==void 0?i:null,props:n}}return c.Fragment=t,c.jsx=a,c.jsxs=a,c}var y;function T(){return y||(y=1,b.exports=E()),b.exports}var _=T();/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),v=(...e)=>e.filter((t,a,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===a).join(" ").trim();/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var R={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=d.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:a=2,absoluteStrokeWidth:o,className:i="",children:n,iconNode:l,...s},g)=>d.createElement("svg",{ref:g,...R,width:t,height:t,stroke:e,strokeWidth:o?Number(a)*24/Number(t):a,className:v("lucide",i),...s},[...l.map(([x,S])=>d.createElement(x,S)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=(e,t)=>{const a=d.forwardRef(({className:o,...i},n)=>d.createElement(O,{ref:n,iconNode:t,className:v(`lucide-${A(e)}`,o),...i}));return a.displayName=`${e}`,a};/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=p("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=p("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=p("Lightbulb",[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=p("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]),I={textSize:"16",lineHeight:"1.75",letterSpacing:"0",textAlign:"start",direction:"rtl"},r={once:!0,margin:"-50px 0px",amount:.1},h={none:{initial:{opacity:1},whileInView:{opacity:1},viewport:r,transition:{duration:0,ease:"easeOut"}},fadeUp:{initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:r,transition:{duration:.5,ease:"easeOut"}},fadeDown:{initial:{opacity:0,y:-20},whileInView:{opacity:1,y:0},viewport:r,transition:{duration:.5,ease:"easeOut"}},slideRight:{initial:{opacity:0,x:-30},whileInView:{opacity:1,x:0},viewport:r,transition:{duration:.5,ease:"easeOut"}},slideLeft:{initial:{opacity:0,x:30},whileInView:{opacity:1,x:0},viewport:r,transition:{duration:.5,ease:"easeOut"}},scale:{initial:{opacity:0,scale:.95},whileInView:{opacity:1,scale:1},viewport:r,transition:{duration:.4,ease:"easeOut"}},fadeScale:{initial:{opacity:0,scale:.98},whileInView:{opacity:1,scale:1},viewport:r,transition:{duration:.5,ease:"easeOut"}},slideUpFast:{initial:{opacity:0,y:15},whileInView:{opacity:1,y:0},viewport:r,transition:{duration:.35,ease:"easeOut"}},fade:{initial:{opacity:0},whileInView:{opacity:1},viewport:r,transition:{duration:.5,ease:"easeOut"}},slideDown:{initial:{opacity:0,y:-15},whileInView:{opacity:1,y:0},viewport:r,transition:{duration:.5,ease:"easeOut"}}},H=[{value:"none",label:"ללא"},{value:"fadeUp",label:"פאד למעלה"},{value:"fadeDown",label:"פאד למטה"},{value:"slideRight",label:"הזזה מימין"},{value:"slideLeft",label:"הזזה משמאל"},{value:"scale",label:"הגדלה"},{value:"fadeScale",label:"פאד + הגדלה"},{value:"slideUpFast",label:"פאד למעלה (מהיר)"},{value:"fade",label:"פאד בלבד"},{value:"slideDown",label:"הופעה מלמעלה"}];function V(e){return!e||!(e in h)?h.fadeUp:h[e]}function u(e,t){return e!=null&&e!==""?e:t}function k(e){const t={compact:{textSize:"14",lineHeight:"1.4",letterSpacing:"-0.02em"},default:{textSize:"16",lineHeight:"1.75",letterSpacing:"0"},comfortable:{textSize:"18",lineHeight:"1.75",letterSpacing:"0"},spacious:{textSize:"20",lineHeight:"2",letterSpacing:"0.02em"},emphasis:{textSize:"22",lineHeight:"1.5",letterSpacing:"0"}};return t[e]??t.default}function D(e){const t=I,a=e.typography?k(e.typography):null,o=u(e.textSize,a?.textSize??t.textSize),i=u(e.lineHeight,a?.lineHeight??t.lineHeight),n=u(e.letterSpacing,a?.letterSpacing??t.letterSpacing),l=u(e.textAlign,t.textAlign),s=u(e.direction,t.direction);return{style:{fontSize:`${o}px`,lineHeight:i,letterSpacing:n},dir:s,alignClass:l==="center"?"text-center":l==="end"?"text-end":"text-start"}}function M(e){const t=e?.trim();if(!t)return{provider:null,embedUrl:null};const a=t.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);if(a)return{provider:"youtube",embedUrl:`https://www.youtube.com/embed/${a[1]}`};if(t.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/))return{provider:"youtube",embedUrl:t};const i=t.match(/(?:vimeo\.com\/)(\d+)/);if(i)return{provider:"vimeo",embedUrl:`https://player.vimeo.com/video/${i[1]}`};const n=t.match(/(?:loom\.com\/share)\/([a-zA-Z0-9_-]+)/);return n?{provider:"loom",embedUrl:`https://www.loom.com/embed/${n[1]}`}:{provider:null,embedUrl:null}}const $=[{value:"white",label:"לבן"},{value:"default",label:"כתום (מותג)"},{value:"neutral",label:"אפור"},{value:"blue",label:"כחול"},{value:"green",label:"ירוק"},{value:"amber",label:"צהוב"},{value:"emerald",label:"טורקיז"}],j=[{role:"heading",label:"כותרת"},{role:"body",label:"טקסט גוף"},{role:"accent",label:"הדגשה"},{role:"buttonBg",label:"רקע כפתור"},{role:"buttonText",label:"טקסט כפתור"}],f={default:"#fb923c",white:"#ffffff",neutral:"#9ca3af",blue:"#60a5fa",green:"#4ade80",amber:"#fbbf24",emerald:"#34d399"},w={heading:"white",body:"white",accent:"default",buttonBg:"default",buttonText:"white"};function N(e){const t=e??w,a=i=>f[t[i]??w[i]??"default"]??f.default,o=a("accent");return{"--palette-heading":a("heading"),"--palette-body":a("body"),"--palette-accent":o,"--palette-accent2":o,"--palette-border":o,"--palette-buttonBg":a("buttonBg"),"--palette-buttonText":a("buttonText")}}export{H as A,f as C,w as D,C as I,P as L,j as P,I as T,U as Z,$ as a,z as b,p as c,D as d,M as e,V as g,_ as j,N as p};
