const splitLandingPages = (urls) => {
    const MAX_LENGTH = 450;
    const landingPages = [];
  
    let currentLandingPages = [];
    let currentCharLength = 0;
  
  
    for (let url of urls) {
      console.log(url);
      let { pathname } = new URL(url);
      // console.log(pathname);
      // remove /produkty/ from pathname
      // pathname = pathname.replace('/produkty/', '');
      // pathname = pathname.replace('.html', '');
      const newLength = currentCharLength + pathname.length;
  
      if (newLength > MAX_LENGTH) {
        landingPages.push(currentLandingPages);
  
        currentCharLength = 0;
        currentLandingPages = [];
      }
  
      currentCharLength += pathname.length;
      currentLandingPages.push(pathname);
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
        pattern: '.',
        replacer: '\\.'
      }
    ];
  
    // const FRONT_REGEX = '^(/produkty/(';
    // const BACK_REGEX = ')\\.html)$';
    const FRONT_REGEX = '^(';
    const BACK_REGEX = ')$';
  
    for (let urls of landingPages) {
      let joined = urls.join('|');
  
      for (let escapeCharacter of escapeCharacters) {
        joined = joined.replaceAll(
          escapeCharacter.pattern,
          escapeCharacter.replacer
        );
      }
  
      regexes.push(FRONT_REGEX + joined + BACK_REGEX);
    }
  
    console.log(regexes);  //to see URLs RegEx
    return regexes;
  };
  
  export { splitLandingPages, minifyLandingPages };