// @ts-expect-error: swagger-jsdoc does not ship TypeScript declarations in this project setup.
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ScopeShift API",
      version: "1.0.0",
      description: "AI Scope Impact Analysis API",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },

  apis: [
    "./src/modules/**/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);