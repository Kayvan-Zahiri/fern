import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrMigrationContext } from "../../IrMigrationContext.js";
import { IrSerialization } from "../../ir-serialization/index.js";
import { IrVersions } from "../../ir-versions/index.js";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration.js";

export const V68_TO_V67_MIGRATION: IrMigration<
    IrVersions.V68.ir.IntermediateRepresentation,
    IrVersions.V67.ir.IntermediateRepresentation
> = {
    laterVersion: "v68",
    earlierVersion: "v67",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CLI]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V67.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (
        v68: IrVersions.V68.ir.IntermediateRepresentation,
        _context: IrMigrationContext
    ): IrVersions.V67.ir.IntermediateRepresentation => {
        // The only difference between V68 and V67 is the `none` variant of `dynamic.Response`,
        // so we rewrite it in V68 space and round-trip through V68's serializer + V67's parser
        // to obtain a V67-typed object (the two generated SDKs are nominally distinct).
        const migrated: IrVersions.V68.ir.IntermediateRepresentation = {
            ...v68,
            dynamic: v68.dynamic != null ? migrateDynamicIntermediateRepresentation(v68.dynamic) : undefined
        };
        const json = IrSerialization.V68.IntermediateRepresentation.jsonOrThrow(migrated, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        });
        return IrSerialization.V67.IntermediateRepresentation.parseOrThrow(json, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        });
    }
};

// V67 has no `none` response variant: endpoints without a response body were always
// reported as `json`, so that is what older generators keep receiving.
function migrateDynamicIntermediateRepresentation(
    dynamic: IrVersions.V68.dynamic.DynamicIntermediateRepresentation
): IrVersions.V68.dynamic.DynamicIntermediateRepresentation {
    return {
        ...dynamic,
        endpoints: Object.fromEntries(
            Object.entries(dynamic.endpoints).map(([endpointId, endpoint]) => [
                endpointId,
                {
                    ...endpoint,
                    response: migrateDynamicResponse(endpoint.response)
                }
            ])
        )
    };
}

function migrateDynamicResponse(response: IrVersions.V68.dynamic.Response): IrVersions.V68.dynamic.Response {
    switch (response.type) {
        case "none":
            return IrVersions.V68.dynamic.Response.json();
        case "json":
        case "streaming":
        case "streamParameter":
        case "fileDownload":
        case "text":
        case "bytes":
            return response;
        default:
            assertNever(response);
    }
}
