<?php

namespace Tests\Feature;

use App\Models\Asset3d;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Asset3dTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_login(): void
    {
        $response = $this->postJson('/auth/register', [
            'name' => 'Blender Artist',
            'email' => 'artist@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'name' => 'Blender Artist',
                    'email' => 'artist@example.com',
                ],
            ]);

        $this->assertAuthenticated();

        // Logout
        $this->postJson('/auth/logout')->assertStatus(200);
        $this->assertGuest();

        // Login
        $loginRes = $this->postJson('/auth/login', [
            'email' => 'artist@example.com',
            'password' => 'secret123',
        ]);

        $loginRes->assertStatus(200)->assertJson(['success' => true]);
        $this->assertAuthenticated();
    }

    public function test_guest_cannot_access_assets(): void
    {
        $response = $this->getJson('/assets');
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_upload_and_manage_3d_asset(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $this->actingAs($user);

        // Fake GLB file
        $fakeGlb = UploadedFile::fake()->create('robot_hero.glb', 1024, 'model/gltf-binary');

        $uploadRes = $this->postJson('/assets', [
            'file' => $fakeGlb,
            'name' => 'Robot Hero',
            'triangles_count' => 12500,
            'vertices_count' => 8400,
            'meshes_count' => 4,
        ]);

        $uploadRes->assertStatus(201)
            ->assertJson([
                'success' => true,
                'asset' => [
                    'name' => 'Robot Hero',
                    'original_name' => 'robot_hero.glb',
                ],
            ]);

        $assetId = $uploadRes->json('asset.id');

        // Verify stored in DB
        $this->assertDatabaseHas('asset3ds', [
            'id' => $assetId,
            'user_id' => $user->id,
            'name' => 'Robot Hero',
        ]);

        // List assets
        $listRes = $this->getJson('/assets');
        $listRes->assertStatus(200)
            ->assertJsonCount(1, 'assets');

        // Stream asset
        $asset = Asset3d::find($assetId);
        $streamRes = $this->get('/assets/'.$asset->id.'/stream');
        $streamRes->assertStatus(200);

        // Rename asset
        $renameRes = $this->putJson('/assets/'.$asset->id, [
            'name' => 'Robot Hero V2',
        ]);
        $renameRes->assertStatus(200);
        $this->assertDatabaseHas('asset3ds', [
            'id' => $assetId,
            'name' => 'Robot Hero V2',
        ]);

        // Delete asset
        $delRes = $this->deleteJson('/assets/'.$asset->id);
        $delRes->assertStatus(200);
        $this->assertDatabaseMissing('asset3ds', ['id' => $assetId]);
    }

    public function test_sso_login_from_portal(): void
    {
        Http::fake([
            '*/api/sso/verify' => Http::response([
                'valid' => true,
                'user' => [
                    'id' => 99,
                    'name' => 'Mahsun SSO User',
                    'email' => 'mahsun@portal.test',
                    'department' => '3D Design',
                    'role' => 'Designer',
                ],
            ], 200),
        ]);

        $response = $this->get('/?sso_token=valid_test_token_12345');

        $response->assertRedirect(url('/'));
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'mahsun@portal.test',
            'name' => 'Mahsun SSO User',
        ]);
    }

    public function test_setup_hosting_routes(): void
    {
        $this->get('/setup-hosting/clear-cache')->assertStatus(200);
    }
}
