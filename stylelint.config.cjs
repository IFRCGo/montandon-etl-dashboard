module.exports = {
    plugins: [
        'stylelint-value-no-unknown-custom-properties',
    ],
    extends: [
        'stylelint-config-recommended',
        'stylelint-config-concentric',
    ],
    rules: {
        'csstools/value-no-unknown-custom-properties': [
            true, {
                importFrom: [
                    './src/index.css',
                    './node_modules/@ifrc-go/ui/dist/index.css',
                ],
            },
        ],
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],
    },
};
