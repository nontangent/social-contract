const tsconfig = require("./tsconfig.json");
const moduleNameMapper = require("tsconfig-paths-jest")(tsconfig);
 
module.exports = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper,
  globals: {
    "ts-jest": {
      "tsconfig": "tsconfig.json"
    }
  }
};
