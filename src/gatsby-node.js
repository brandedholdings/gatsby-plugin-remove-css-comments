/**
 * @typedef {import('webpack').Configuration} WebpackConfig
 * @typedef {import('webpack').RuleSetRule} RuleSetRule
 * @typedef {import('webpack').RuleSetLoader} RuleSetLoader
 */
import path from 'path';
import { getInstalledPathSync } from 'get-installed-path';


const loadersRegex = /postcss-loader/;

/**
 * @typedef {import('webpack').RuleSetUseItem} RuleSetUseItem
 * @typedef {import('webpack').RuleSetLoader} RuleSetLoader
 */

/**
 * Returns the index of regex matched loaders. null if not found
 * @param {RuleSetUseItem[]} useArray
 * @param {RegExp} loaderNamesRegex
 * @returns {number|null} number | null
 */
const findLoader = (useArray, loaderNamesRegex) => {
    const index = useArray.findIndex(loaderObject => {
        let loaderName = '';

        if (typeof loaderObject === 'string') {
            loaderName = loaderObject;
        } else if (
            'loader' in loaderObject &&
            typeof loaderObject.loader === 'string'
        ) {
            loaderName = loaderObject.loader;
        }

        return loaderName.match(loaderNamesRegex) !== null;
    });

    return index === -1 ? null : index;
};

/**
 * Insert given loader at the specified index
 * @param {RuleSetUseItem[]} useArray
 * @param {null|number} index
 * @param {RuleSetLoader} loader
 */
const insertLoader = (useArray, index, loader) => {
    if (index === null) {
        return;
    }
    useArray.splice(index, 0, loader);
};

/**
 * @param actions
 * @param stage
 * @param getConfig
 * @param plugins
 * @param userOptions
 */
export function onCreateWebpackConfig(
    { actions, stage, getConfig },
    { plugins, ...userOptions },
) {
    /**
     * @type {WebpackConfig}
     */
    const config = getConfig();
    const existingRules = config.module.rules;
    const path = getInstalledPathSync('remove-comments-loader', {local: true});
    console.log(path);


    /**
     * @type {RuleSetLoader}
     */
    const stripCommentsloader = {
        loader: `${path}/index.js`,
        options: {
            test: /\.(css)$/,
        },
    };

    existingRules.forEach(rule => {
        if (Array.isArray(rule.oneOf)) {
            rule.oneOf.forEach(rule => {
                if (Array.isArray(rule.use)) {
                    const index = findLoader(rule.use, loadersRegex);
                    insertLoader(rule.use, index, stripCommentsloader);
                }
            });
        }
    });

    actions.replaceWebpackConfig(config);
}
