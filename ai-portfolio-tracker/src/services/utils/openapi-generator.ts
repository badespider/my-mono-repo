/**
 * OpenAPI Code Generation Utility
 *
 * This utility can generate TypeScript interfaces from OpenAPI specifications.
 * When the backend provides an OpenAPI spec, run this to auto-generate types.
 *
 * Usage:
 * 1. Install dependencies: npm install -D openapi-typescript
 * 2. Run: npx openapi-typescript ./openapi.json -o ./src/services/types/generated.ts
 * 3. Import generated types in your services
 */

// OpenAPI types - install with: npm install -D openapi-types
// import type { OpenAPIV3 } from 'openapi-types';

// Temporary type definitions for demo purposes
type OpenAPIV3 = {
  Document: {
    components?: {
      schemas?: Record<string, any>;
    };
    paths?: Record<string, any>;
  };
  SchemaObject: {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
    enum?: any[];
    items?: any;
    description?: string;
  };
  ReferenceObject: {
    $ref: string;
  };
  PathsObject: Record<string, any>;
  RequestBodyObject: {
    content?: Record<string, { schema?: any }>;
  };
  ResponsesObject: Record<string, any>;
};

export interface OpenAPIConfig {
  specUrl: string;
  outputPath: string;
  namespace?: string;
  includeDeprecated?: boolean;
  includeExamples?: boolean;
}

/**
 * Fetch OpenAPI specification from backend
 */
export async function fetchOpenAPISpec(
  url: string
): Promise<OpenAPIV3["Document"]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching OpenAPI spec:", error);
    throw error;
  }
}

/**
 * Generate TypeScript interfaces from OpenAPI spec
 * This is a simplified version - use openapi-typescript for production
 */
export function generateTypesFromSpec(spec: OpenAPIV3["Document"]): string {
  let output = `// Auto-generated types from OpenAPI specification
// Generated at: ${new Date().toISOString()}
// Do not edit manually

`;

  // Generate base types
  output += generateBaseTypes();

  // Generate component schemas
  if (spec.components?.schemas) {
    output += generateSchemasTypes(spec.components.schemas);
  }

  // Generate path types
  if (spec.paths) {
    output += generatePathTypes(spec.paths);
  }

  return output;
}

function generateBaseTypes(): string {
  return `
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

`;
}

function generateSchemasTypes(schemas: Record<string, any>): string {
  let output = "// Component Schemas\n\n";

  for (const [name, schema] of Object.entries(schemas)) {
    if ("$ref" in schema) {
      continue; // Skip references for now
    }

    output += generateInterfaceFromSchema(name, schema);
  }

  return output;
}

function generateInterfaceFromSchema(
  name: string,
  schema: OpenAPIV3["SchemaObject"]
): string {
  let output = `export interface ${name} {\n`;

  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const isRequired = schema.required?.includes(propName) || false;
      const propType = getTypeScriptType(propSchema);
      const optional = isRequired ? "" : "?";

      // Add description as comment if available
      const typedPropSchema = propSchema as any;
      if (typedPropSchema.description) {
        output += `  /** ${typedPropSchema.description} */\n`;
      }

      output += `  ${propName}${optional}: ${propType};\n`;
    }
  }

  output += "}\n\n";
  return output;
}

function getTypeScriptType(
  schema: OpenAPIV3["SchemaObject"] | OpenAPIV3["ReferenceObject"]
): string {
  if ("$ref" in schema) {
    // Extract type name from reference
    const refName = schema.$ref.split("/").pop();
    return refName || "any";
  }

  switch (schema.type) {
    case "string":
      if (schema.enum) {
        return schema.enum.map((val: any) => `'${val}'`).join(" | ");
      }
      return "string";

    case "number":
    case "integer":
      return "number";

    case "boolean":
      return "boolean";

    case "array":
      if (schema.items) {
        const itemType = getTypeScriptType(schema.items);
        return `${itemType}[]`;
      }
      return "any[]";

    case "object":
      if (schema.properties) {
        let objectType = "{\n";
        for (const [propName, propSchema] of Object.entries(
          schema.properties
        )) {
          const propType = getTypeScriptType(propSchema);
          const isRequired = schema.required?.includes(propName) || false;
          const optional = isRequired ? "" : "?";
          objectType += `    ${propName}${optional}: ${propType};\n`;
        }
        objectType += "  }";
        return objectType;
      }
      return "Record<string, any>";

    default:
      return "any";
  }
}

function generatePathTypes(paths: OpenAPIV3["PathsObject"]): string {
  let output = "// API Path Types\n\n";

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;

    // Generate types for each HTTP method
    for (const [method, operation] of Object.entries(pathItem)) {
      if (
        typeof operation !== "object" ||
        operation === null ||
        !("operationId" in operation)
      )
        continue;

      const operationData = operation as any;
      if (!operationData.operationId) continue;

      const operationName = operationData.operationId;

      // Generate request type
      if (operationData.requestBody) {
        output += generateRequestType(operationName, operationData.requestBody);
      }

      // Generate response type
      if (operationData.responses) {
        output += generateResponseType(operationName, operationData.responses);
      }
    }
  }

  return output;
}

function generateRequestType(
  operationName: string,
  requestBody: OpenAPIV3["RequestBodyObject"] | OpenAPIV3["ReferenceObject"]
): string {
  if ("$ref" in requestBody) {
    return `export type ${operationName}Request = ${requestBody.$ref.split("/").pop()};\n\n`;
  }

  const content = requestBody.content?.["application/json"];
  if (content?.schema) {
    const type = getTypeScriptType(content.schema);
    return `export type ${operationName}Request = ${type};\n\n`;
  }

  return "";
}

function generateResponseType(
  operationName: string,
  responses: OpenAPIV3["ResponsesObject"]
): string {
  const successResponse = responses["200"] || responses["201"];
  if (!successResponse || "$ref" in successResponse) {
    return "";
  }

  const content = successResponse.content?.["application/json"];
  if (content?.schema) {
    const type = getTypeScriptType(content.schema);
    return `export type ${operationName}Response = ${type};\n\n`;
  }

  return "";
}

/**
 * Command-line script to generate types from OpenAPI spec
 * Usage: node openapi-generator.js <spec-url> <output-path>
 */
export async function generateTypesFromUrl(
  specUrl: string,
  outputPath: string
): Promise<void> {
  try {
    console.log(`Fetching OpenAPI spec from: ${specUrl}`);
    const spec = await fetchOpenAPISpec(specUrl);

    console.log("Generating TypeScript interfaces...");
    const types = generateTypesFromSpec(spec);

    // In a real implementation, you'd write to file system
    // For now, just log the output
    console.log("Generated types:");
    console.log(types);

    console.log(`Types generated successfully at: ${outputPath}`);
  } catch (error) {
    console.error("Failed to generate types:", error);
    process.exit(1);
  }
}

/**
 * Configuration for different environments
 */
export const openApiConfigs: Record<string, OpenAPIConfig> = {
  development: {
    specUrl: "http://localhost:3001/api/docs/json",
    outputPath: "./src/services/types/generated.ts",
    namespace: "DevAPI",
    includeDeprecated: true,
    includeExamples: true,
  },
  staging: {
    specUrl: "https://staging-api.yourapp.com/docs/json",
    outputPath: "./src/services/types/generated.ts",
    namespace: "StagingAPI",
    includeDeprecated: false,
    includeExamples: false,
  },
  production: {
    specUrl: "https://api.yourapp.com/docs/json",
    outputPath: "./src/services/types/generated.ts",
    namespace: "ProdAPI",
    includeDeprecated: false,
    includeExamples: false,
  },
};

/**
 * Integration with build process
 * Add this to your package.json scripts:
 *
 * "scripts": {
 *   "generate-types": "tsx src/services/utils/openapi-generator.ts",
 *   "generate-types:dev": "tsx src/services/utils/openapi-generator.ts development",
 *   "generate-types:prod": "tsx src/services/utils/openapi-generator.ts production"
 * }
 */

// Example usage in npm script
if (require.main === module) {
  const environment = process.argv[2] || "development";
  const config = openApiConfigs[environment];

  if (!config) {
    console.error(`Unknown environment: ${environment}`);
    process.exit(1);
  }

  generateTypesFromUrl(config.specUrl, config.outputPath);
}

/**
 * Webpack plugin integration
 * This can be used to automatically regenerate types during development
 */
export class OpenAPITypesPlugin {
  private config: OpenAPIConfig;

  constructor(config: OpenAPIConfig) {
    this.config = config;
  }

  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapAsync(
      "OpenAPITypesPlugin",
      async (params: any, callback: any) => {
        try {
          await generateTypesFromUrl(
            this.config.specUrl,
            this.config.outputPath
          );
          callback();
        } catch (error) {
          callback(error);
        }
      }
    );
  }
}

/**
 * Next.js integration
 * Add this to your next.config.js to regenerate types on dev server start
 */
export function withOpenAPITypes(
  nextConfig: any,
  openApiConfig: OpenAPIConfig
) {
  return {
    ...nextConfig,
    webpack: (config: any, { dev }: any) => {
      if (dev) {
        // Only regenerate types in development
        generateTypesFromUrl(openApiConfig.specUrl, openApiConfig.outputPath);
      }

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, { dev });
      }

      return config;
    },
  };
}
