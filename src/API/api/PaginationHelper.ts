export const paginationMerge = {

    serializeQueryArgs: ({
        endpointName,
    }: any) => endpointName,

    merge: (currentCache: any, newItems: any) => {
        currentCache.data.push(...newItems.data);
    },

    forceRefetch({
        currentArg,
        previousArg,
    }: any) {
        return currentArg?.page !== previousArg?.page;
    },
};