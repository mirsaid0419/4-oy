"use strict";
let raqam = 4;
if (raqam >= 2 && raqam <= 7) {
    console.log("Ekonom klass narxi:", 105000);
}
else if (raqam == 8 || raqam == 9) {
    console.log("Biznes klass narxi:", 140000);
}
else if (raqam == 1 || raqam == 10) {
    console.log("Vip klass narxi:", 210000);
}
else {
    console.log("Bunday vagon mavjud emas");
}
