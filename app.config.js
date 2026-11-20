
module.exports = ({ config }) => {
    const isDev = process.env.APP_VARIANT === "development";

    return {
        ...config,

        name: isDev ? "QuickList Dev" : "QuickList",

        ios: {
            ...config.ios,
            bundleIdentifier: isDev
                ? "com.DivergentDevelopmentSolutions.QuickList.dev"
                : "com.DivergentDevelopmentSolutions.QuickList",
        },

        android: {
            ...config.android,
            package: isDev
                ? "com.DivergentDevelopmentSolutions.QuickList.dev"
                : "com.DivergentDevelopmentSolutions.QuickList",
        },
    };
};
