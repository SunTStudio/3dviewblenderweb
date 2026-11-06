<?php

use App\Http\Controllers\Asset3dController;
use App\Http\Controllers\AuthController;
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
