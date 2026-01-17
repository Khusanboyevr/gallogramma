/**
 * Simple gender sensing logic based on common Uzbek and international name patterns.
 * @param {string} name 
 * @returns {'male' | 'female'}
 */
export const detectGender = (name) => {
    if (!name) return 'male';

    const n = name.toLowerCase().trim();

    // Common female suffixes in Uzbek
    const femaleSuffixes = ['oy', 'nur', 'gul', 'gül', 'abon', 'alo', 'ira', 'ra', 'na', 'sa', 'da', 'ya', 'shirin', 'hon', 'xon'];

    // Common male suffixes in Uzbek
    const maleSuffixes = ['bek', 'jon', 'ali', 'mir', 'yor', 'dor', 'berdi', 'boy', 'xoja', 'xo\'ja', 'iddin', 'ulloh', 'ullo', 'lo', 'murod'];

    // Check female suffixes ( Uzbek names often end with these )
    if (femaleSuffixes.some(s => n.endsWith(s))) return 'female';

    // Check male suffixes
    if (maleSuffixes.some(s => n.endsWith(s))) return 'male';

    // Fallback check for last character (many female names end in 'a' or 'o')
    if (n.endsWith('a') || n.endsWith('o') || n.endsWith('i')) {
        // Basic heuristic: 'a' is often female, 'i' could be both but often female-ish in international contexts.
        // In Uzbek 'ali', 'vli' are male. So we check male suffixes first.
        return 'female';
    }

    return 'male';
};
