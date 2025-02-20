const blacklist = new Set<string>();

export const addToBlacklist = (token: string) => {
    blacklist.add(token);
};

export const isBlacklisted = (token: string): boolean => {
    return blacklist.has(token);
};
