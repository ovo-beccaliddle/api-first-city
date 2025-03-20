import { z } from 'zod';
export declare const zResourceStatus: z.ZodEnum<["active", "inactive", "pending", "archived"]>;
export declare const zResource: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["active", "inactive", "pending", "archived"]>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    status: "active" | "inactive" | "pending" | "archived";
    description?: string | undefined;
    tags?: string[] | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    status: "active" | "inactive" | "pending" | "archived";
    description?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const zResourceCreate: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending", "archived"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    status?: "active" | "inactive" | "pending" | "archived" | undefined;
    tags?: string[] | undefined;
}, {
    name: string;
    description?: string | undefined;
    status?: "active" | "inactive" | "pending" | "archived" | undefined;
    tags?: string[] | undefined;
}>;
export declare const zResourceUpdate: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending", "archived"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    status?: "active" | "inactive" | "pending" | "archived" | undefined;
    tags?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    status?: "active" | "inactive" | "pending" | "archived" | undefined;
    tags?: string[] | undefined;
}>;
export declare const zResourceList: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["active", "inactive", "pending", "archived"]>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        name: string;
        status: "active" | "inactive" | "pending" | "archived";
        description?: string | undefined;
        tags?: string[] | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        name: string;
        status: "active" | "inactive" | "pending" | "archived";
        description?: string | undefined;
        tags?: string[] | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    page_size: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total: number;
    page: number;
    page_size: number;
    items: {
        createdAt: string;
        updatedAt: string;
        id: string;
        name: string;
        status: "active" | "inactive" | "pending" | "archived";
        description?: string | undefined;
        tags?: string[] | undefined;
    }[];
}, {
    total: number;
    page: number;
    page_size: number;
    items: {
        createdAt: string;
        updatedAt: string;
        id: string;
        name: string;
        status: "active" | "inactive" | "pending" | "archived";
        description?: string | undefined;
        tags?: string[] | undefined;
    }[];
}>;
export declare const zError: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: {} | undefined;
    }, {
        code: string;
        message: string;
        details?: {} | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    error: {
        code: string;
        message: string;
        details?: {} | undefined;
    };
}, {
    error: {
        code: string;
        message: string;
        details?: {} | undefined;
    };
}>;
export declare const zListResourcesResponse: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["active", "inactive", "pending", "archived"]>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        name: string;
        status: "active" | "inactive" | "pending" | "archived";
        description?: string | undefined;
        tags?: string[] | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        name: string;
        status: "active" | "inactive" | "pending" | "archived";
        description?: string | undefined;
        tags?: string[] | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    page_size: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total: number;
    page: number;
    page_size: number;
    items: {
        createdAt: string;
        updatedAt: string;
        id: string;
        name: string;
        status: "active" | "inactive" | "pending" | "archived";
        description?: string | undefined;
        tags?: string[] | undefined;
    }[];
}, {
    total: number;
    page: number;
    page_size: number;
    items: {
        createdAt: string;
        updatedAt: string;
        id: string;
        name: string;
        status: "active" | "inactive" | "pending" | "archived";
        description?: string | undefined;
        tags?: string[] | undefined;
    }[];
}>;
export declare const zCreateResourceResponse: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["active", "inactive", "pending", "archived"]>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    status: "active" | "inactive" | "pending" | "archived";
    description?: string | undefined;
    tags?: string[] | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    status: "active" | "inactive" | "pending" | "archived";
    description?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const zDeleteResourceResponse: z.ZodVoid;
export declare const zGetResourceResponse: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["active", "inactive", "pending", "archived"]>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    status: "active" | "inactive" | "pending" | "archived";
    description?: string | undefined;
    tags?: string[] | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    status: "active" | "inactive" | "pending" | "archived";
    description?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const zUpdateResourceResponse: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["active", "inactive", "pending", "archived"]>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    status: "active" | "inactive" | "pending" | "archived";
    description?: string | undefined;
    tags?: string[] | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    status: "active" | "inactive" | "pending" | "archived";
    description?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const zHealthCheckResponse: z.ZodObject<{
    status: z.ZodEnum<["ok", "degraded", "down"]>;
    version: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "ok" | "degraded" | "down";
    timestamp: string;
    version?: string | undefined;
}, {
    status: "ok" | "degraded" | "down";
    timestamp: string;
    version?: string | undefined;
}>;
