export declare const ResourceStatusSchema: {
    readonly type: "string";
    readonly description: "Status of a resource";
    readonly enum: readonly ["active", "inactive", "pending", "archived"];
};
export declare const ResourceSchema: {
    readonly type: "object";
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly description: "Unique identifier for the resource";
        };
        readonly name: {
            readonly type: "string";
            readonly description: "Name of the resource";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "Detailed description of the resource";
        };
        readonly status: {
            readonly $ref: "#/components/schemas/ResourceStatus";
            readonly description: "Current status of the resource";
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "Tags associated with the resource";
        };
        readonly createdAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly description: "When the resource was created";
        };
        readonly updatedAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly description: "When the resource was last updated";
        };
    };
    readonly required: readonly ["id", "name", "status", "createdAt", "updatedAt"];
};
export declare const ResourceCreateSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "Name of the resource";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "Detailed description of the resource";
        };
        readonly status: {
            readonly $ref: "#/components/schemas/ResourceStatus";
            readonly description: "Initial status of the resource";
            readonly default: "active";
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "Tags associated with the resource";
        };
    };
    readonly required: readonly ["name"];
};
export declare const ResourceUpdateSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "Updated name of the resource";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "Updated description of the resource";
        };
        readonly status: {
            readonly $ref: "#/components/schemas/ResourceStatus";
            readonly description: "Updated status of the resource";
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "Updated tags for the resource";
        };
    };
};
export declare const ResourceListSchema: {
    readonly type: "object";
    readonly properties: {
        readonly items: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/Resource";
            };
            readonly description: "List of resources";
        };
        readonly total: {
            readonly type: "number";
            readonly description: "Total number of resources matching the query";
        };
        readonly page: {
            readonly type: "number";
            readonly description: "Current page number";
        };
        readonly page_size: {
            readonly type: "number";
            readonly description: "Number of items per page";
        };
    };
    readonly required: readonly ["items", "total", "page", "page_size"];
};
export declare const ErrorSchema: {
    readonly type: "object";
    readonly properties: {
        readonly error: {
            readonly type: "object";
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly description: "Error code";
                };
                readonly message: {
                    readonly type: "string";
                    readonly description: "Human-readable error message";
                };
                readonly details: {
                    readonly type: "object";
                    readonly additionalProperties: true;
                    readonly description: "Additional error details";
                };
            };
            readonly required: readonly ["code", "message"];
        };
    };
    readonly required: readonly ["error"];
};
