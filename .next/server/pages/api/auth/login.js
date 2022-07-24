"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/auth/login";
exports.ids = ["pages/api/auth/login"];
exports.modules = {

/***/ "(api)/./pages/api/auth/login.ts":
/*!*********************************!*\
  !*** ./pages/api/auth/login.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nconst generateRandomString = (length)=>{\n    let text = \"\";\n    const possible = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\";\n    for(let i = 0; i < length; i++){\n        text += possible.charAt(Math.floor(Math.random() * possible.length));\n    }\n    return text;\n};\nconst login = (req, res)=>{\n    const scope = \"streaming user-read-email user-read-private\";\n    const spotify_redirect_uri = \"http://localhost:3000/api/auth/callback\";\n    const state = generateRandomString(16);\n    let spotify_client_id = \"\";\n    if (process.env.SPOTIFY_CLIENT_ID) {\n        spotify_client_id = process.env.SPOTIFY_CLIENT_ID;\n    } else {\n        console.error('Undefined Error: An environmental variable, \"SPOTIFY_CLIENT_ID\", has something wrong.');\n    }\n    const auth_query_parameters = new URLSearchParams({\n        response_type: \"code\",\n        client_id: spotify_client_id,\n        scope: scope,\n        redirect_uri: spotify_redirect_uri,\n        state: state\n    });\n    res.redirect(\"https://accounts.spotify.com/authorize/?\" + auth_query_parameters.toString());\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (login);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvYXV0aC9sb2dpbi50cy5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBRUEsTUFBTUEsb0JBQW9CLEdBQUcsQ0FBQ0MsTUFBYyxHQUFhO0lBQ3ZELElBQUlDLElBQUksR0FBRyxFQUFFO0lBQ2IsTUFBTUMsUUFBUSxHQUNaLGdFQUFnRTtJQUVsRSxJQUFLLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0gsTUFBTSxFQUFFRyxDQUFDLEVBQUUsQ0FBRTtRQUMvQkYsSUFBSSxJQUFJQyxRQUFRLENBQUNFLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNELElBQUksQ0FBQ0UsTUFBTSxFQUFFLEdBQUdMLFFBQVEsQ0FBQ0YsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUN0RTtJQUNELE9BQU9DLElBQUksQ0FBQztDQUNiO0FBRUQsTUFBTU8sS0FBSyxHQUFHLENBQUNDLEdBQW1CLEVBQUVDLEdBQW9CLEdBQUs7SUFDM0QsTUFBTUMsS0FBSyxHQUFXLDZDQUE2QztJQUNuRSxNQUFNQyxvQkFBb0IsR0FBRyx5Q0FBeUM7SUFDdEUsTUFBTUMsS0FBSyxHQUFXZCxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7SUFFOUMsSUFBSWUsaUJBQWlCLEdBQVcsRUFBRTtJQUNsQyxJQUFJQyxPQUFPLENBQUNDLEdBQUcsQ0FBQ0MsaUJBQWlCLEVBQUU7UUFDakNILGlCQUFpQixHQUFHQyxPQUFPLENBQUNDLEdBQUcsQ0FBQ0MsaUJBQWlCLENBQUM7S0FDbkQsTUFBTTtRQUNMQyxPQUFPLENBQUNDLEtBQUssQ0FDWCx1RkFBdUYsQ0FDeEYsQ0FBQztLQUNIO0lBRUQsTUFBTUMscUJBQXFCLEdBQUcsSUFBSUMsZUFBZSxDQUFDO1FBQ2hEQyxhQUFhLEVBQUUsTUFBTTtRQUNyQkMsU0FBUyxFQUFFVCxpQkFBaUI7UUFDNUJILEtBQUssRUFBRUEsS0FBSztRQUNaYSxZQUFZLEVBQUVaLG9CQUFvQjtRQUNsQ0MsS0FBSyxFQUFFQSxLQUFLO0tBQ2IsQ0FBQztJQUVGSCxHQUFHLENBQUNlLFFBQVEsQ0FDViwwQ0FBMEMsR0FDeENMLHFCQUFxQixDQUFDTSxRQUFRLEVBQUUsQ0FDbkMsQ0FBQztDQUNIO0FBRUQsaUVBQWVsQixLQUFLLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pcG9kLWNsYXNzaWMvLi9wYWdlcy9hcGkvYXV0aC9sb2dpbi50cz83NDRkIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTmV4dEFwaVJlcXVlc3QsIE5leHRBcGlSZXNwb25zZSB9IGZyb20gXCJuZXh0XCI7XG5cbmNvbnN0IGdlbmVyYXRlUmFuZG9tU3RyaW5nID0gKGxlbmd0aDogbnVtYmVyKTogc3RyaW5nID0+IHtcbiAgbGV0IHRleHQgPSBcIlwiO1xuICBjb25zdCBwb3NzaWJsZSA9XG4gICAgXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OVwiO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB0ZXh0ICs9IHBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpKTtcbiAgfVxuICByZXR1cm4gdGV4dDtcbn07XG5cbmNvbnN0IGxvZ2luID0gKHJlcTogTmV4dEFwaVJlcXVlc3QsIHJlczogTmV4dEFwaVJlc3BvbnNlKSA9PiB7XG4gIGNvbnN0IHNjb3BlOiBzdHJpbmcgPSBcInN0cmVhbWluZyB1c2VyLXJlYWQtZW1haWwgdXNlci1yZWFkLXByaXZhdGVcIjtcbiAgY29uc3Qgc3BvdGlmeV9yZWRpcmVjdF91cmkgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcGkvYXV0aC9jYWxsYmFja1wiO1xuICBjb25zdCBzdGF0ZTogc3RyaW5nID0gZ2VuZXJhdGVSYW5kb21TdHJpbmcoMTYpO1xuXG4gIGxldCBzcG90aWZ5X2NsaWVudF9pZDogc3RyaW5nID0gXCJcIjtcbiAgaWYgKHByb2Nlc3MuZW52LlNQT1RJRllfQ0xJRU5UX0lEKSB7XG4gICAgc3BvdGlmeV9jbGllbnRfaWQgPSBwcm9jZXNzLmVudi5TUE9USUZZX0NMSUVOVF9JRDtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgJ1VuZGVmaW5lZCBFcnJvcjogQW4gZW52aXJvbm1lbnRhbCB2YXJpYWJsZSwgXCJTUE9USUZZX0NMSUVOVF9JRFwiLCBoYXMgc29tZXRoaW5nIHdyb25nLidcbiAgICApO1xuICB9XG5cbiAgY29uc3QgYXV0aF9xdWVyeV9wYXJhbWV0ZXJzID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgcmVzcG9uc2VfdHlwZTogXCJjb2RlXCIsXG4gICAgY2xpZW50X2lkOiBzcG90aWZ5X2NsaWVudF9pZCxcbiAgICBzY29wZTogc2NvcGUsXG4gICAgcmVkaXJlY3RfdXJpOiBzcG90aWZ5X3JlZGlyZWN0X3VyaSxcbiAgICBzdGF0ZTogc3RhdGUsXG4gIH0pO1xuXG4gIHJlcy5yZWRpcmVjdChcbiAgICBcImh0dHBzOi8vYWNjb3VudHMuc3BvdGlmeS5jb20vYXV0aG9yaXplLz9cIiArXG4gICAgICBhdXRoX3F1ZXJ5X3BhcmFtZXRlcnMudG9TdHJpbmcoKVxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgbG9naW47XG4iXSwibmFtZXMiOlsiZ2VuZXJhdGVSYW5kb21TdHJpbmciLCJsZW5ndGgiLCJ0ZXh0IiwicG9zc2libGUiLCJpIiwiY2hhckF0IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibG9naW4iLCJyZXEiLCJyZXMiLCJzY29wZSIsInNwb3RpZnlfcmVkaXJlY3RfdXJpIiwic3RhdGUiLCJzcG90aWZ5X2NsaWVudF9pZCIsInByb2Nlc3MiLCJlbnYiLCJTUE9USUZZX0NMSUVOVF9JRCIsImNvbnNvbGUiLCJlcnJvciIsImF1dGhfcXVlcnlfcGFyYW1ldGVycyIsIlVSTFNlYXJjaFBhcmFtcyIsInJlc3BvbnNlX3R5cGUiLCJjbGllbnRfaWQiLCJyZWRpcmVjdF91cmkiLCJyZWRpcmVjdCIsInRvU3RyaW5nIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./pages/api/auth/login.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/auth/login.ts"));
module.exports = __webpack_exports__;

})();