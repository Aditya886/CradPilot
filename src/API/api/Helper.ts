type ApiProps = {
    body?: any;
    params?: any;
};

export const createGet = (url: string) => ({
    query: (params?: any) => ({
        url,
        params,
    }),
});

export const createPost = (url: string) => ({
    query: ({ body, params }: ApiProps) => ({
        url,
        method: 'POST',
        body,
        params,
    }),
});

export const createPut = (url: string) => ({
    query: ({ body, params }: ApiProps) => ({
        url,
        method: 'PUT',
        body,
        params,
    }),
});

export const createPatch = (url: string) => ({
    query: ({ body, params }: ApiProps) => ({
        url,
        method: 'PATCH',
        body,
        params,
    }),
});

export const createDelete = (url: string) => ({
    query: (params?: any) => ({
        url,
        method: 'DELETE',
        params,
    }),
});