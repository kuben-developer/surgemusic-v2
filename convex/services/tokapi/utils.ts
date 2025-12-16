export const TOKAPI_KEY = "808a45b29cf9422798bcc4560909b4c2";

export const TOKAPI_OPTIONS = {
    method: 'GET',
    headers: {
        'accept': 'application/json',
        'x-project-name': 'tokapi',
        'x-api-key': TOKAPI_KEY
    }
} as const;
