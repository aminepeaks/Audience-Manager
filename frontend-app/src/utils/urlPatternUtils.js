const splitLandingPages = (urls) => {
    const MAX_LENGTH = 450;
    const landingPages = [];

    let currentLandingPages = [];
    let currentCharLength = 0;

    for (let url of urls) {
        try {
            let { pathname } = new URL(url);
            const newLength = currentCharLength + pathname.length;

            if (newLength > MAX_LENGTH) {
                landingPages.push(currentLandingPages);
                currentCharLength = 0;
                currentLandingPages = [];
            }

            currentCharLength += pathname.length;
            currentLandingPages.push(pathname);
        } catch (error) {
            console.error(`Invalid URL skipped: ${url}`, error);
        }
    }

    if (currentLandingPages.length > 0) {
        landingPages.push(currentLandingPages);
    }

    return landingPages;
};

/**
 * Returns an array of RegEx elements for the given groups.
 *
 * @param {string[]} landingPages The array of landing pages .
 * @returns {string[]}
 */
const minifyLandingPages = (landingPages) => {
    const regexes = [];

    const escapeCharacters = [
        {
            name: 'DOT',
            pattern: '\\.',
            replacer: '\\\\.'
        }
    ];

    const FRONT_REGEX = '^(';
    const BACK_REGEX = ')$';

    for (let urls of landingPages) {
        let joined = urls.join('|');

        for (let escapeCharacter of escapeCharacters) {
            joined = joined.replace(new RegExp(escapeCharacter.pattern, 'g'), escapeCharacter.replacer);
        }

        regexes.push(FRONT_REGEX + joined + BACK_REGEX);
    }

    return regexes;
};

export { splitLandingPages, minifyLandingPages };