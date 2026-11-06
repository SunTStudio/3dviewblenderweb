<?php

namespace App\Models;

use Database\Factories\Asset3dFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'name',
    'file_path',
    'original_name',
    'mime_type',
    'file_size',
    'triangles_count',
    'vertices_count',
    'meshes_count',
    'thumbnail_path',
    'notes',
])]
class Asset3d extends Model
{
    /** @use HasFactory<Asset3dFactory> */
    use HasFactory;

    /**
     * Get the user that owns the 3D asset.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * URL to download / view the 3D model.
     */
    protected function fileUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => route('assets.stream', $this->id)
        );
    }

    /**
     * Human-readable file size format.
     */
    protected function formattedSize(): Attribute
    {
        return Attribute::make(
            get: function () {
                $bytes = $this->file_size;
                if ($bytes >= 1048576) {
                    return number_format($bytes / 1048576, 2).' MB';
                }
                if ($bytes >= 1024) {
                    return number_format($bytes / 1024, 1).' KB';
                }

                return $bytes.' B';
            }
        );
    }
}
