import $ from "jquery";
import { debounce } from "./modules/debounce.js";

document.addEventListener("DOMContentLoaded", function() {
	let str = `window location is ${window.location}`;
	console.log(str);
	console.log($);
	console.log(debounce);
	console.log(7 ** 2);
});
