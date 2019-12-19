(function(t){function e(e){for(var s,a,o=e[0],c=e[1],l=e[2],p=0,d=[];p<o.length;p++)a=o[p],Object.prototype.hasOwnProperty.call(r,a)&&r[a]&&d.push(r[a][0]),r[a]=0;for(s in c)Object.prototype.hasOwnProperty.call(c,s)&&(t[s]=c[s]);u&&u(e);while(d.length)d.shift()();return i.push.apply(i,l||[]),n()}function n(){for(var t,e=0;e<i.length;e++){for(var n=i[e],s=!0,o=1;o<n.length;o++){var c=n[o];0!==r[c]&&(s=!1)}s&&(i.splice(e--,1),t=a(a.s=n[0]))}return t}var s={},r={app:0},i=[];function a(e){if(s[e])return s[e].exports;var n=s[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=t,a.c=s,a.d=function(t,e,n){a.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},a.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},a.t=function(t,e){if(1&e&&(t=a(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)a.d(n,s,function(e){return t[e]}.bind(null,s));return n},a.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return a.d(e,"a",e),e},a.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},a.p="/";var o=window["webpackJsonp"]=window["webpackJsonp"]||[],c=o.push.bind(o);o.push=e,o=o.slice();for(var l=0;l<o.length;l++)e(o[l]);var u=c;i.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"56d7":function(t,e,n){"use strict";n.r(e);n("cadf"),n("551c"),n("f751"),n("097d");var s=n("2b0e"),r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"app"}},[n("List")],1)},i=[],a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"fr__grid-container"},[n("div",{staticClass:"fr__heading"},[n("header",[n("h1",[t._v(t._s(t.randomTitle))]),n("form",{staticClass:"fr__form",attrs:{id:"expenses-form"},on:{submit:function(e){return e.preventDefault(),t.addNewExpense(e)}}},[n("fieldset",[n("div",{staticClass:"fr__label-wrapper"},[n("label",{attrs:{for:"expense"}},[t._v("Expense")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.expense,expression:"expense"}],staticClass:"fr__input-box",attrs:{id:"expense",type:"text"},domProps:{value:t.expense},on:{input:function(e){e.target.composing||(t.expense=e.target.value)}}})]),n("div",{staticClass:"fr__label-wrapper"},[n("label",{attrs:{for:"amount"}},[t._v("Amount")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.amount,expression:"amount"}],staticClass:"fr__input-box",attrs:{id:"amount",type:"number"},domProps:{value:t.amount},on:{input:function(e){e.target.composing||(t.amount=e.target.value)}}})]),n("button",{attrs:{hidden:"","aria-hidden":"true"}}),n("add-icon",{staticClass:"fr__button",attrs:{name:"expenses-form"},on:{click:t.addNewExpense}})],1)])])]),n("div",{staticClass:"fr__content-column"},[n("table",[n("thead",[n("tr",[n("th",[t._v("\n            Active:\n          ")]),n("th",[n("b",[t._v(t._s(t.activeExpensesTotal))])])])]),n("tbody",t._l(t.activeExpenses,(function(e,s){return n("tr",{key:s,attrs:{expense:e.expense}},[n("td",[n("b",[t._v(t._s(e.expense))])]),n("td",[t._v("\n            "+t._s(e.amount)+"\n          ")]),n("td",[n("check-icon",{staticClass:"fr__button fr__button--expedite",on:{click:function(n){return t.remove(e.id)}}}),n("chill-icon",{staticClass:"fr__button fr__button--postpone",on:{click:function(n){return t.freeze(e.id)}}})],1)])})),0)]),n("table",[n("thead",[n("tr",[n("th",[t._v("\n            Postponed:\n          ")]),n("th",[n("b",[t._v(t._s(t.postponedExpensesTotal))])])])]),n("tbody",t._l(t.postponedExpenses,(function(e,s){return n("tr",{key:s,attrs:{expense:e.expense}},[n("td",[n("b",[t._v(t._s(e.expense))])]),n("td",[t._v("\n            "+t._s(e.amount)+"\n          ")]),n("td",[n("flame-icon",{staticClass:"fr__button fr__button--advance",on:{click:function(n){return t.advance(e.id)}}})],1)])})),0)])])])},o=[],c={functional:!0,render(t,e){const{_c:n,_v:s,data:r,children:i=[]}=e,{class:a,staticClass:o,style:c,staticStyle:l,attrs:u={},...p}=r;return n("svg",{class:[a,o],style:[c,l],attrs:Object.assign({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24"},u),...p},i.concat([n("path",{attrs:{fill:"none",d:"M0 0h24v24H0V0z"}}),n("path",{attrs:{opacity:".3",d:"M16.11 6.77c-.53 2.6-2.62 4.43-5.28 4.43-1.56 0-2.96-.62-3.97-1.63C6.3 10.96 6 12.47 6 14c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.56-.66-5.03-1.89-7.23zm-4.22 11.22c-1.37 0-2.49-1.08-2.49-2.42 0-1.25.81-2.13 2.17-2.41 1.37-.28 2.78-.93 3.57-1.99.3 1 .46 2.05.46 3.12 0 2.04-1.66 3.7-3.71 3.7z"}}),n("path",{attrs:{d:"M11.57 13.16c-1.36.28-2.17 1.16-2.17 2.41 0 1.34 1.11 2.42 2.49 2.42 2.05 0 3.71-1.66 3.71-3.71 0-1.07-.15-2.12-.46-3.12-.79 1.07-2.2 1.72-3.57 2zM13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM12 20c-3.31 0-6-2.69-6-6 0-1.53.3-3.04.86-4.43a5.582 5.582 0 003.97 1.63c2.66 0 4.75-1.83 5.28-4.43A14.77 14.77 0 0118 14c0 3.31-2.69 6-6 6z"}})]))}},l={functional:!0,render(t,e){const{_c:n,_v:s,data:r,children:i=[]}=e,{class:a,staticClass:o,style:c,staticStyle:l,attrs:u={},...p}=r;return n("svg",{class:[a,o],style:[c,l],attrs:Object.assign({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24"},u),...p},i.concat([n("path",{attrs:{fill:"none",d:"M0 0h24v24H0V0z"}}),n("path",{attrs:{d:"M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22v-2z"}})]))}},u={functional:!0,render(t,e){const{_c:n,_v:s,data:r,children:i=[]}=e,{class:a,staticClass:o,style:c,staticStyle:l,attrs:u={},...p}=r;return n("svg",{class:[a,o],style:[c,l],attrs:Object.assign({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24"},u),...p},i.concat([n("path",{attrs:{fill:"none",d:"M0 0h24v24H0V0z"}}),n("path",{attrs:{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"}})]))}},p={functional:!0,render(t,e){const{_c:n,_v:s,data:r,children:i=[]}=e,{class:a,staticClass:o,style:c,staticStyle:l,attrs:u={},...p}=r;return n("svg",{class:[a,o],style:[c,l],attrs:Object.assign({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24"},u),...p},i.concat([n("path",{attrs:{fill:"none",d:"M0 0h24v24H0V0z"}}),n("path",{attrs:{d:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"}})]))}},d=["Am famished.","Coffee run.","Burgers it is.","Pizza Time"],h={name:"List",components:{FlameIcon:c,ChillIcon:l,CheckIcon:u,AddIcon:p},data:function(){return{expenseList:[],expense:"",amount:"",isCurrentExpensePostponed:!1,id:0}},computed:{totalExpenses:function(){return this.reducer(this.expenseList)},postponedExpensesTotal:function(){return this.reducer(this.postponedExpenses)},postponedExpenses:function(){return this.expenseList.filter((function(t){return t.isCurrentExpensePostponed}))},activeExpensesTotal:function(){return this.reducer(this.activeExpenses)},activeExpenses:function(){return this.expenseList.filter((function(t){return!t.isCurrentExpensePostponed}))},totalExpensesToggle:function(){return!(this.postponedExpenses.length<1||this.activeExpenses.length<1)},randomTitle:function(){return d[Math.floor(Math.random()*d.length)]}},mounted:function(){localStorage.getItem("expenseList")&&this.loadexpenseList()},methods:{addNewExpense:function(){return""!==this.amount?(this.newObjectPush(),this.resetForm(),this.saveExpenseList()):null},newObjectPush:function(){this.expenseList.push({expense:this.expense,amount:this.amount,isCurrentExpensePostponed:!1,id:this.id++})},freeze:function(t){for(var e=0;e<this.expenseList.length;e++)t===this.expenseList[e].id&&(this.expenseList[e].isCurrentExpensePostponed=!0);this.saveExpenseList()},advance:function(t){for(var e=0;e<this.expenseList.length;e++)t===this.expenseList[e].id&&(this.expenseList[e].isCurrentExpensePostponed=!1);this.saveExpenseList()},parser10:function(t){return parseInt(t,10)},reducer:function(t){var e=this;return t.reduce((function(t,n){return t+e.parser10(n.amount)}),0)},resetForm:function(){this.expense="",this.amount=""},remove:function(t){for(var e=0;e<this.expenseList.length;e++)t===this.expenseList[e].id&&this.$delete(this.expenseList,e);this.saveExpenseList()},saveExpenseList:function(){localStorage.setItem("expenseList",JSON.stringify(this.expenseList))},loadexpenseList:function(){try{this.expenseList=JSON.parse(localStorage.getItem("expenseList"))}catch(t){localStorage.removeItem("expenseList")}}}},f=h,v=n("2877"),x=Object(v["a"])(f,a,o,!1,null,null,null),m=x.exports,_={name:"App",components:{List:m}},g=_,b=(n("5c0b"),Object(v["a"])(g,r,i,!1,null,null,null)),w=b.exports;s["a"].config.productionTip=!1,new s["a"]({render:function(t){return t(w)}}).$mount("#app")},"5c0b":function(t,e,n){"use strict";var s=n("e332"),r=n.n(s);r.a},e332:function(t,e,n){}});
//# sourceMappingURL=app.b973a0b2.js.map