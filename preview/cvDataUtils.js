(function (global) {
  'use strict';

  /**
   * Shallow/deep merge for CV content objects.
   * - Arrays: items from override come first, then base.
   * - Plain objects: recurse one level.
   * - Primitives: override wins.
   * Only one level of nesting is supported.
   */
  function mergeContentObjects(baseObj, overrideObj) {
    if (!baseObj && !overrideObj) return {};
    if (!baseObj) return Array.isArray(overrideObj) ? overrideObj.slice() : { ...overrideObj };
    if (!overrideObj) return Array.isArray(baseObj) ? baseObj.slice() : { ...baseObj };

    const result = Array.isArray(baseObj) ? baseObj.slice() : { ...baseObj };

    Object.keys(overrideObj).forEach((key) => {
      const baseVal = baseObj[key];
      const overrideVal = overrideObj[key];

      // Arrays: items from nested/override go first, then base
      if (Array.isArray(overrideVal)) {
        if (Array.isArray(baseVal)) {
          result[key] = overrideVal.slice().concat(baseVal);
        } else {
          result[key] = overrideVal.slice();
        }
        return;
      }

      // Plain objects: shallow-deep merge (one level)
      if (
        overrideVal &&
        typeof overrideVal === 'object' &&
        !Array.isArray(overrideVal)
      ) {
        if (
          baseVal &&
          typeof baseVal === 'object' &&
          !Array.isArray(baseVal)
        ) {
          result[key] = mergeContentObjects(baseVal, overrideVal);
        } else {
          result[key] = { ...overrideVal };
        }
        return;
      }

      // Primitives / null: override wins
      result[key] = overrideVal;
    });

    return result;
  }

  /**
   * Merge translations: language-by-language merge of nested content objects.
   */
  function mergeCvTranslations(baseTranslations, overrideTranslations) {
    const merged = {};
    const baseKeys = baseTranslations ? Object.keys(baseTranslations) : [];
    const overrideKeys = overrideTranslations ? Object.keys(overrideTranslations) : [];
    const allLangs = new Set([...baseKeys, ...overrideKeys]);

    allLangs.forEach((lang) => {
      const baseT = (baseTranslations && baseTranslations[lang]) || {};
      const overrideT = (overrideTranslations && overrideTranslations[lang]) || {};
      merged[lang] = mergeContentObjects(baseT, overrideT);
    });

    return merged;
  }

  function getFetchBaseCv(options) {
    if (options && typeof options.fetchBaseCv === 'function') {
      return options.fetchBaseCv;
    }
    if (typeof global !== 'undefined' && typeof global.fetchCvByPassword === 'function') {
      // Backwards-compatible default used by the main CV page
      return global.fetchCvByPassword;
    }
    return null;
  }

  /**
   * Resolve CV data with optional base CV.
   *
   * This is shared between the main CV page and the import tool.
   *
   * @param {string} requestedKey - the key/password used by the user (e.g. "cv-google")
   * @param {object} directData - data returned from Firestore for requestedKey
   *   Expected shape:
   *     {
   *       profileImage?: string,
   *       allowAsBase?: boolean,
   *       useBaseCV?: string,
   *       translations: { [lang]: {...} }
   *     }
   * @param {object} [options]
   *   @property {function} fetchBaseCv - async function (baseKey) => baseData | null
   *   @property {object} [meta] - optional meta object to be mutated (used by import tool)
   *
   * @returns {Promise<{ translations: object, profileImage: string | null, meta?: object }>}
   */
  async function resolveCvDataWithBase(requestedKey, directData, options) {
    const direct = directData || {};
    const directTranslations = direct.translations || {};
    const directProfile = direct.profileImage || null;
    const baseKey = direct.useBaseCV;
    const meta = options && options.meta ? options.meta : null;

    const setMeta = (updates) => {
      if (!meta || !updates) return;
      Object.keys(updates).forEach((k) => {
        meta[k] = updates[k];
      });
    };

    setMeta({
      usedBase: false,
      baseKey: typeof baseKey === 'string' ? baseKey : (meta && meta.baseKey) || null,
      baseFound: false,
      baseAllowAsBase: false,
      baseHasOwnBase: false,
      warning: null,
    });

    // If no useBaseCV reference -> just use this CV as-is
    if (!baseKey) {
      return {
        translations: directTranslations,
        profileImage: directProfile,
        meta,
      };
    }

    // Prevent self-reference
    if (baseKey === requestedKey) {
      console.warn('useBaseCV points to the same CV; ignoring useBaseCV.');
      setMeta({
        warning: 'useBaseCV points to the same key; ignoring useBaseCV.',
      });
      return {
        translations: directTranslations,
        profileImage: directProfile,
        meta,
      };
    }

    const fetchBaseCv = getFetchBaseCv(options);

    // If we don't have a way to fetch, we can't resolve the base
    if (!fetchBaseCv) {
      console.warn('No fetchBaseCv function available; cannot resolve useBaseCV.');
      // Keep translations as-is but leave a warning if meta is used
      setMeta({
        warning: 'No fetchBaseCv function available; cannot resolve useBaseCV.',
      });
      return {
        translations: directTranslations,
        profileImage: directProfile,
        meta,
      };
    }

    let baseData = null;
    try {
      baseData = await fetchBaseCv(baseKey);
    } catch (e) {
      console.error('Failed to fetch base CV for key:', baseKey, e);
      if (!meta || !meta.warning) {
        setMeta({
          warning: 'Failed to fetch base CV from data source.',
        });
      }
      return {
        translations: directTranslations,
        profileImage: directProfile,
        meta,
      };
    }

    if (!baseData) {
      console.warn('Base CV not found for key:', baseKey);
      if (!meta || !meta.warning) {
        setMeta({
          warning: 'Base CV not found for key "' + baseKey + '".',
        });
      }
      return {
        translations: directTranslations,
        profileImage: directProfile,
        meta,
      };
    }

    setMeta({ baseFound: true });

    // Only CVs explicitly marked can be used as base
    if (!baseData.allowAsBase) {
      console.warn('Referenced base CV is not marked allowAsBase; ignoring useBaseCV.');
      setMeta({
        baseAllowAsBase: false,
        warning:
          'Base CV "' +
          baseKey +
          '" exists but allowAsBase is not true; ignoring base.',
      });
      return {
        translations: directTranslations,
        profileImage: directProfile,
        meta,
      };
    }

    setMeta({ baseAllowAsBase: true });

    // One level of nesting only: ignore if base also has useBaseCV
    if (baseData.useBaseCV) {
      console.warn('Nested useBaseCV (base of a base) is not supported; using direct CV only.');
      setMeta({
        baseHasOwnBase: true,
        warning:
          'Base CV "' +
          baseKey +
          '" itself has useBaseCV; nested bases are not supported.',
      });
      return {
        translations: directTranslations,
        profileImage: directProfile,
        meta,
      };
    }

    setMeta({ baseHasOwnBase: false });

    const baseTranslations = baseData.translations || {};
    const mergedTranslations = mergeCvTranslations(baseTranslations, directTranslations);
    const mergedProfileImage = direct.profileImage || baseData.profileImage || null;

    setMeta({
      usedBase: true,
      warning: null,
    });

    return {
      translations: mergedTranslations,
      profileImage: mergedProfileImage,
      meta,
    };
  }

  const exported = {
    mergeContentObjects,
    mergeCvTranslations,
    resolveCvDataWithBase,
  };

  global.CvDataUtils = exported;
  // Also expose legacy name for backwards compatibility if needed
  if (!global.resolveCvDataWithBase) {
    global.resolveCvDataWithBase = resolveCvDataWithBase;
  }
})(typeof window !== 'undefined' ? window : this);
