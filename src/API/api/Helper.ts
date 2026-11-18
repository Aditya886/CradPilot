type ApiProps = {
    body?: any;
    params?: any;
    [key: string]: any;
};

export const createGet = (url: string | ((arg: any) => string)) => ({
    query: (arg?: any) => {
        const resolvedUrl = typeof url === 'function' ? url(arg) : url;
        const params = (arg && arg.params !== undefined) ? arg.params : (typeof arg === 'object' && !Array.isArray(arg) ? arg : undefined);
        return {
            url: resolvedUrl,
            params,
        };
    },
});

export const createPost = (url: string | ((arg: any) => string)) => ({
    query: (arg?: any) => {
        const resolvedUrl = typeof url === 'function' ? url(arg) : url;
        const hasWrapper = arg && (arg.body !== undefined || arg.params !== undefined);
        return {
            url: resolvedUrl,
            method: 'POST' as const,
            body: hasWrapper ? arg.body : arg,
            params: hasWrapper ? arg.params : undefined,
        };
    },
});

export const createPut = (url: string | ((arg: any) => string)) => ({
    query: (arg?: any) => {
        const resolvedUrl = typeof url === 'function' ? url(arg) : url;
        const hasWrapper = arg && (arg.body !== undefined || arg.params !== undefined);
        return {
            url: resolvedUrl,
            method: 'PUT' as const,
            body: hasWrapper ? arg.body : arg,
            params: hasWrapper ? arg.params : undefined,
        };
    },
});

export const createPatch = (url: string | ((arg: any) => string)) => ({
    query: (arg?: any) => {
        const resolvedUrl = typeof url === 'function' ? url(arg) : url;
        const hasWrapper = arg && (arg.body !== undefined || arg.params !== undefined);
        return {
            url: resolvedUrl,
            method: 'PATCH' as const,
            body: hasWrapper ? arg.body : arg,
            params: hasWrapper ? arg.params : undefined,
        };
    },
});

export const createDelete = (url: string | ((arg: any) => string)) => ({
    query: (arg?: any) => {
        const resolvedUrl = typeof url === 'function' ? url(arg) : url;
        const hasWrapper = arg && (arg.params !== undefined || arg.body !== undefined);
        return {
            url: resolvedUrl,
            method: 'DELETE' as const,
            params: hasWrapper ? arg.params : (typeof arg === 'object' && !Array.isArray(arg) ? arg : undefined),
            body: hasWrapper ? arg.body : undefined,
        };
    },
});

/**
 * Extracts a clear, user-friendly error message from any API error response,
 * network failure, or exception.
 */
export const extractApiErrorMessage = (error: any, fallback = 'Something went wrong. Please try again.'): string => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;

    // Direct message in error.data
    if (error?.data?.message) return String(error.data.message);
    if (error?.data?.error) return String(error.data.error);

    // Validation errors array
    if (error?.data?.errors && Array.isArray(error.data.errors) && error.data.errors.length > 0) {
        const first = error.data.errors[0];
        return typeof first === 'string' ? first : first.msg || first.message || fallback;
    }

    // Direct error fields
    if (error?.message) return String(error.message);
    if (error?.error) return String(error.error);

    // Network / RTK Query status
    if (error?.status === 'FETCH_ERROR') {
        return 'Network error: Cannot reach server. Please check your internet connection.';
    }
    if (error?.status === 'TIMEOUT_ERROR') {
        return 'Request timed out. Please try again.';
    }
    if (error?.status === 401) {
        return 'Invalid email or password.';
    }
    if (error?.status === 404) {
        return 'Requested item or account was not found.';
    }
    if (error?.status === 500) {
        return 'Server error occurred. Please try again later.';
    }

    return fallback;
};

/**
 * Extracts a success message from an API response, with a friendly fallback.
 */
export const extractApiSuccessMessage = (res: any, fallback = 'Operation completed successfully!'): string => {
    if (!res) return fallback;
    if (typeof res === 'string') return res;
    if (res?.message) return String(res.message);
    if (res?.data?.message) return String(res.data.message);
    return fallback;
};
