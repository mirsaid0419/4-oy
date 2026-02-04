"use strict";
let N = "135791";
let ok = true;
ok = N.length % 2 === 1;
for (let i = 0; i < N.length; i++) {
    let digit = Number(N[i]);
    ok = ok && (digit % 2 === 1);
}
console.log(ok ? "yes" : "no");
