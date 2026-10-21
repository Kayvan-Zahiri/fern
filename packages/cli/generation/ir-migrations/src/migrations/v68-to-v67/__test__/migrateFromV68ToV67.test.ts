import { createMockTaskContext } from "@fern-api/task-context";

import { IrVersions } from "../../../ir-versions";
import { V68_TO_V67_MIGRATION } from "../migrateFromV68ToV67";

describe("migrateFromV68ToV67", () => {
    const mockContext = {
        taskContext: createMockTaskContext(),
        targetGenerator: {
            name: "test-generator",
            version: "0.0.0"
        }
    };

    const buildDynamicEndpoint = (response: IrVersions.V68.dynamic.Response): IrVersions.V68.dynamic.Endpoint => ({
        auth: undefined,
        declaration: {
            fernFilepath: { allParts: [], packagePath: [], file: undefined },
            name: {
                originalName: "deleteMovie",
                camelCase: { safeName: "deleteMovie", unsafeName: "deleteMovie" },
                pascalCase: { safeName: "DeleteMovie", unsafeName: "DeleteMovie" },
                snakeCase: { safeName: "delete_movie", unsafeName: "delete_movie" },
                screamingSnakeCase: { safeName: "DELETE_MOVIE", unsafeName: "DELETE_MOVIE" }
            }
        },
        location: { method: "DELETE", path: "/movies/{movieId}" },
        request: IrVersions.V68.dynamic.Request.body({
            pathParameters: undefined,
            body: undefined,
            bodyRequired: undefined
        }),
        response,
        examples: undefined
    });

    const createMinimalV68IR = (
        endpoints: Record<string, IrVersions.V68.dynamic.Endpoint>
    ): IrVersions.V68.ir.IntermediateRepresentation => {
        return {
            fdrApiDefinitionId: undefined,
            specVersion: undefined,
            apiVersion: undefined,
            apiName: {
                originalName: "TestApi",
                camelCase: { safeName: "testApi", unsafeName: "testApi" },
                pascalCase: { safeName: "TestApi", unsafeName: "TestApi" },
                snakeCase: { safeName: "test_api", unsafeName: "test_api" },
                screamingSnakeCase: { safeName: "TEST_API", unsafeName: "TEST_API" }
            },
            apiDisplayName: undefined,
            apiDocs: undefined,
            auth: { docs: undefined, requirement: "ALL", schemes: [] },
            headers: [],
            idempotencyHeaders: [],
            types: {},
            errors: {},
            services: {},
            webhookGroups: {},
            websocketChannels: undefined,
            constants: {
                errorInstanceIdKey: {
                    name: {
                        originalName: "errorInstanceId",
                        camelCase: { safeName: "errorInstanceId", unsafeName: "errorInstanceId" },
                        pascalCase: { safeName: "ErrorInstanceId", unsafeName: "ErrorInstanceId" },
                        snakeCase: { safeName: "error_instance_id", unsafeName: "error_instance_id" },
                        screamingSnakeCase: { safeName: "ERROR_INSTANCE_ID", unsafeName: "ERROR_INSTANCE_ID" }
                    },
                    wireValue: "errorInstanceId"
                }
            },
            environments: undefined,
            basePath: undefined,
            pathParameters: [],
            variables: [],
            globalParameters: undefined,
            serviceTypeReferenceInfo: { typesReferencedOnlyByService: {}, sharedTypes: [] },
            readmeConfig: undefined,
            sourceConfig: undefined,
            publishConfig: undefined,
            dynamic: {
                version: "1.0.0",
                types: {},
                headers: undefined,
                endpoints,
                pathParameters: undefined,
                environments: undefined,
                variables: undefined,
                globalParameters: undefined,
                generatorConfig: undefined
            },
            casingsConfig: {
                generationLanguage: undefined,
                keywords: undefined,
                smartCasing: true,
                smartCasingDigitWordBoundary: undefined
            },
            subpackages: {},
            rootPackage: {
                docs: undefined,
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                webhooks: undefined,
                websocket: undefined,
                hasEndpointsInTree: false,
                hasWebSocketInTree: false,
                navigationConfig: undefined
            },
            sdkConfig: {
                isAuthMandatory: false,
                hasStreamingEndpoints: false,
                hasFileDownloadEndpoints: false,
                platformHeaders: {
                    language: "X-Fern-Language",
                    sdkName: "X-Fern-SDK-Name",
                    sdkVersion: "X-Fern-SDK-Version",
                    userAgent: undefined
                },
                hasPaginatedEndpoints: false,
                idempotencyKeyGeneration: undefined,
                webhookSignatureVerification: undefined
            },
            errorDiscriminationStrategy: IrVersions.V68.ErrorDiscriminationStrategy.statusCode(),
            selfHosted: undefined,
            audiences: [],
            generationMetadata: undefined,
            apiPlayground: undefined
        } as IrVersions.V68.ir.IntermediateRepresentation;
    };

    it("downcasts dynamic Response.none to json", () => {
        const v68IR = createMinimalV68IR({
            endpoint_deleteMovie: buildDynamicEndpoint(IrVersions.V68.dynamic.Response.none())
        });

        const v67IR = V68_TO_V67_MIGRATION.migrateBackwards(v68IR, mockContext);

        expect(v67IR.dynamic?.endpoints.endpoint_deleteMovie?.response.type).toBe("json");
    });

    it("leaves the other dynamic response variants untouched", () => {
        const v68IR = createMinimalV68IR({
            endpoint_getMovie: buildDynamicEndpoint(IrVersions.V68.dynamic.Response.json()),
            endpoint_streamMovie: buildDynamicEndpoint(IrVersions.V68.dynamic.Response.streaming()),
            endpoint_downloadMovie: buildDynamicEndpoint(IrVersions.V68.dynamic.Response.fileDownload())
        });

        const v67IR = V68_TO_V67_MIGRATION.migrateBackwards(v68IR, mockContext);

        expect(v67IR.dynamic?.endpoints.endpoint_getMovie?.response.type).toBe("json");
        expect(v67IR.dynamic?.endpoints.endpoint_streamMovie?.response.type).toBe("streaming");
        expect(v67IR.dynamic?.endpoints.endpoint_downloadMovie?.response.type).toBe("fileDownload");
    });

    it("passes through an IR without a dynamic section", () => {
        const v68IR = { ...createMinimalV68IR({}), dynamic: undefined };

        const v67IR = V68_TO_V67_MIGRATION.migrateBackwards(v68IR, mockContext);

        expect(v67IR.dynamic).toBeUndefined();
    });
});
