<?php

namespace App\Http\Controllers;

use App\Models\Asset3d;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class Asset3dController extends Controller
{
    /**
     * List all 3D assets for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Asset3d::query()
            ->where('user_id', $user->id)
            ->latest();

        if ($request->filled('q')) {
            $search = $request->string('q');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('original_name', 'like', "%{$search}%");
            });
        }

        $assets = $query->get()->map(function (Asset3d $asset) {
            return [
                'id' => $asset->id,
                'name' => $asset->name,
                'original_name' => $asset->original_name,
                'file_size' => $asset->file_size,
                'formatted_size' => $asset->formatted_size,
                'triangles_count' => $asset->triangles_count,
                'vertices_count' => $asset->vertices_count,
                'meshes_count' => $asset->meshes_count,
                'thumbnail_url' => $asset->thumbnail_path ? Storage::url($asset->thumbnail_path) : null,
                'file_url' => route('assets.stream', $asset->id),
                'created_at' => $asset->created_at->diffForHumans(),
                'created_date' => $asset->created_at->format('d M Y, H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'assets' => $assets,
        ]);
    }

    /**
     * Upload and store a new 3D model (.glb / .gltf).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:2097152'], // max 2GB
            'name' => ['nullable', 'string', 'max:255'],
            'triangles_count' => ['nullable', 'integer'],
            'vertices_count' => ['nullable', 'integer'],
            'meshes_count' => ['nullable', 'integer'],
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, ['glb', 'gltf'])) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya format berkas .glb atau .gltf yang didukung.',
            ], 422);
        }

        $userId = Auth::id();
        $displayName = $request->filled('name')
            ? $request->string('name')
            : pathinfo($originalName, PATHINFO_FILENAME);

        // Store file in storage/app/public/models/{userId}/
        $folder = "models/{$userId}";
        $filename = time().'_'.uniqid().'.'.$extension;
        $path = $file->storeAs($folder, $filename, 'public');

        $asset = Asset3d::create([
            'user_id' => $userId,
            'name' => $displayName,
            'file_path' => $path,
            'original_name' => $originalName,
            'mime_type' => $extension === 'glb' ? 'model/gltf-binary' : 'model/gltf+json',
            'file_size' => $file->getSize(),
            'triangles_count' => $request->integer('triangles_count') ?: null,
            'vertices_count' => $request->integer('vertices_count') ?: null,
            'meshes_count' => $request->integer('meshes_count') ?: null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Model 3D berhasil diunggah ke pustaka Anda!',
            'asset' => [
                'id' => $asset->id,
                'name' => $asset->name,
                'original_name' => $asset->original_name,
                'formatted_size' => $asset->formatted_size,
                'triangles_count' => $asset->triangles_count,
                'vertices_count' => $asset->vertices_count,
                'file_url' => route('assets.stream', $asset->id),
                'created_at' => $asset->created_at->diffForHumans(),
            ],
        ], 201);
    }

    /**
     * Stream 3D model file directly to browser viewer.
     */
    public function stream(Asset3d $asset): BinaryFileResponse|Response
    {
        // Check ownership
        if (Auth::id() !== $asset->user_id) {
            abort(403, 'Akses ditolak.');
        }

        if (! Storage::disk('public')->exists($asset->file_path)) {
            abort(404, 'Berkas 3D tidak ditemukan di penyimpanan server.');
        }

        $fullPath = Storage::disk('public')->path($asset->file_path);
        $contentType = str_ends_with($asset->file_path, '.glb')
            ? 'model/gltf-binary'
            : 'model/gltf+json';

        return response()->file($fullPath, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'inline; filename="'.$asset->original_name.'"',
            'Access-Control-Allow-Origin' => '*',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Update asset information (rename).
     */
    public function update(Request $request, Asset3d $asset): JsonResponse
    {
        if (Auth::id() !== $asset->user_id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $asset->update([
            'name' => $validated['name'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nama model berhasil diperbarui.',
            'asset' => [
                'id' => $asset->id,
                'name' => $asset->name,
            ],
        ]);
    }

    /**
     * Delete asset from storage and database.
     */
    public function destroy(Asset3d $asset): JsonResponse
    {
        if (Auth::id() !== $asset->user_id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        // Delete model file
        if (Storage::disk('public')->exists($asset->file_path)) {
            Storage::disk('public')->delete($asset->file_path);
        }

        // Delete thumbnail if exists
        if ($asset->thumbnail_path && Storage::disk('public')->exists($asset->thumbnail_path)) {
            Storage::disk('public')->delete($asset->thumbnail_path);
        }

        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Model berhasil dihapus dari pustaka Anda.',
        ]);
    }

    /**
     * Save snapshot canvas thumbnail for an asset.
     */
    public function uploadThumbnail(Request $request, Asset3d $asset): JsonResponse
    {
        if (Auth::id() !== $asset->user_id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'image' => ['required', 'string'], // base64 data url
        ]);

        $imageContent = $request->string('image')->toString();
        if (preg_match('/^data:image\/(\w+);base64,/', $imageContent, $type)) {
            $imageContent = substr($imageContent, strpos($imageContent, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, etc

            $data = base64_decode($imageContent);
            if ($data === false) {
                return response()->json(['success' => false, 'message' => 'Format gambar tidak valid.'], 422);
            }

            $thumbPath = "thumbnails/{$asset->user_id}/thumb_{$asset->id}.{$type}";
            Storage::disk('public')->put($thumbPath, $data);

            $asset->update(['thumbnail_path' => $thumbPath]);

            return response()->json([
                'success' => true,
                'thumbnail_url' => Storage::url($thumbPath),
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Format base64 tidak valid.'], 422);
    }
}
