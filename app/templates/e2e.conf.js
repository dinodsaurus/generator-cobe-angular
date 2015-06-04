exports.config = {
  baseUrl: "http://localhost:9000",
  seleniumAddress: "http://127.0.0.1:4444/wd/hub",
  specs: ["./e2e/*.e2e.js"],
  framework: "jasmine2",
  capabilities: {
    "browserName": "chrome"
  }
};
