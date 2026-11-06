<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class HandlePortalSso
{
    /**
     * Handle Single Sign-On (SSO) token from Master Portal.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Check if 'sso_token' query parameter exists
        if ($request->has('sso_token')) {
            $token = $request->query('sso_token');

            if (! empty($token)) {
                $portalBaseUrl = rtrim(config('portal.url', env('PORTAL_URL', 'http://127.0.0.1:8000')), '/');
                $verifyUrl = config('portal.verify_endpoint') ?: "{$portalBaseUrl}/api/sso/verify";

                try {
                    // 2. Call Master Portal API to verify token
                    $response = Http::timeout(5)->post($verifyUrl, [
                        'token' => $token,
                    ]);

                    if ($response->successful() && $response->json('valid') === true) {
                        $userData = $response->json('user');

                        // 3. Find or create local user
                        $user = User::firstOrCreate(
                            ['email' => $userData['email']],
                            [
                                'name' => $userData['name'],
                                'password' => Hash::make(Str::random(32)),
                            ]
                        );

                        // If user name changed in portal, keep it synced
                        if ($user->name !== $userData['name']) {
                            $user->update(['name' => $userData['name']]);
                        }

                        // 4. Authenticate user into local session
                        Auth::login($user);
                        $request->session()->regenerate();

                        // 5. Clean 'sso_token' from URL query string
                        return redirect()->to($request->url());
                    }
                } catch (\Throwable $e) {
                    report($e);
                }
            }
        }

        return $next($request);
    }
}
