import { defineConfig } from 'oxfmt';

export default defineConfig({
    printWidth: 80,
    singleQuote: true,

    sortImports: true,

    jsdoc: {
        descriptionWithDot: true,
        separateTagGroups: true,
        separateReturnsFromParam: true,
    },
});
