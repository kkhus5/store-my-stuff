/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: "no-circular",
            severity: "error",
            comment:
                "Circular dependencies lead to hard-to-debug issues and tight coupling.",
            from: {},
            to: {
                circular: true,
            },
        },
    ],
    options: {
        doNotFollow: {
            path: ["node_modules"],
        },
        tsPreCompilationDeps: false,
        tsConfig: {
            fileName: "apps/server/tsconfig.json",
        },
        enhancedResolveOptions: {
            exportsFields: ["exports"],
            conditionNames: ["import", "require", "node", "default"],
            mainFields: ["module", "main", "types", "typings"],
        },
    },
};
