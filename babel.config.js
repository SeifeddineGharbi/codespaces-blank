module.exports = function(api) {
    api.cache(true);

    return {
        presets: [["babel-preset-expo", {
            jsxImportSource: "nativewind"
        }], "nativewind/babel"],

        plugins: [["module-resolver", {
            root: ["./"],

            alias: {
                "@": "./",
                "@/src": "./src",
                "@/types": "./src/types/index",
                "@/screens": "./src/screens",
                "@/components": "./src/components",
                "@/services": "./src/services",
                "@/utils": "./src/utils/index",
                "@/hooks": "./src/hooks",
                "@/constants": "./src/constants/index",
                "tailwind.config": "./tailwind.config.js"
            }
        }]]
    };
};