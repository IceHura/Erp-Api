import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ERP API",
      version: "1.0.0",
      description: "API documentation for ERP system",
    },
    servers: [{ url: "http://localhost:5000" }],
    components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "Bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger documentation is available at: http://localhost:5000/api-docs");
};
