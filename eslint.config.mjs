import nextConfig from "eslint-config-next";
import typescriptConfig from "eslint-config-next/typescript";
import coreWebVitalsConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  ...typescriptConfig,
  ...coreWebVitalsConfig,
];

export default eslintConfig;
