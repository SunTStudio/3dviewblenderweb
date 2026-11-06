<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Portal Master Application Configuration
    |--------------------------------------------------------------------------
    |
    | URL and API configuration to communicate with the Master Portal Laravel App.
    |
    */

    'url' => env('PORTAL_URL', 'http://127.0.0.1:8000'),

    'verify_endpoint' => env('PORTAL_SSO_VERIFY_URL', null),
];

