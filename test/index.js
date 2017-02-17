var less = require("less"),
    lessTest = require("less/test/less-test"),
    lessTester = lessTest(),
    lib = require('../lib'),
    stylize = less.lesscHelper.stylize;

var plugin = new lib();

console.log("\n" + stylize("LESS - inline images", 'underline') + "\n");

lessTester.runTestSet(
    {strictMath: true, relativeUrls: true, silent: true, plugins: [plugin] },
    "inline-images/");

if (lessTester.finish) {
	lessTester.finish();
}