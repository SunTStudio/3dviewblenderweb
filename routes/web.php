<?php

use App\Http\Controllers\Asset3dController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

// Main 3D Studio Web App View
Route::get('/', function () {
    return view('viewer');
})->name('home');

// Authentication Routes
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/me', [AuthController::class, 'me'])->name('me');
});

// 3D Asset Management Routes (Protected by Auth)
Route::middleware('auth')->prefix('assets')->name('assets.')->group(function () {
    Route::get('/', [Asset3dController::class, 'index'])->name('index');
    Route::post('/', [Asset3dController::class, 'store'])->name('store');
    Route::get('/{asset}/stream', [Asset3dController::class, 'stream'])->name('stream');
    Route::put('/{asset}', [Asset3dController::class, 'update'])->name('update');
    Route::delete('/{asset}', [Asset3dController::class, 'destroy'])->name('destroy');
    Route::post('/{asset}/thumbnail', [Asset3dController::class, 'uploadThumbnail'])->name('thumbnail');
});

// Hosting Utility Routes (For Shared Hosting without terminal)
Route::prefix('setup-hosting')->group(function () {
    Route::get('/storage-link', function () {
        Artisan::call('storage:link');

        return response('Symlink public/storage berhasil dibuat! Output: '.Artisan::output(), 200)
            ->header('Content-Type', 'text/plain');
    });

    Route::get('/migrate', function () {
        Artisan::call('migrate --force');

        return response('Migrasi database berhasil dijalankan! Output: '.Artisan::output(), 200)
            ->header('Content-Type', 'text/plain');
    });

    Route::get('/clear-cache', function () {
        Artisan::call('optimize:clear');

        return response('Cache berhasil dibersihkan! Output: '.Artisan::output(), 200)
            ->header('Content-Type', 'text/plain');
    });
});
