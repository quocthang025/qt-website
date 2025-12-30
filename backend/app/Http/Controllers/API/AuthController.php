<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use App\Models\Candidate;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct()
    {
        // Middleware bảo vệ tất cả route trừ login và register
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    /**
     * Đăng nhập và trả về token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
            'role'     => 'required|integer'
        ]);

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = JWTAuth::user();

        // Kiểm tra role
        if ($user->role !== (int)$request->role) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Nếu là candidate thì lấy thêm tên
        if ($user->role == 1) {
            $name = User::join('candidates', 'users.id', '=', 'user_id')
                ->where('users.id', $user->id)
                ->select('firstname', 'lastname')
                ->first();
            $user['name'] = $name;
        }

        return response()->json([
            'user' => $user,
            'authorization' => [
                'token' => $token,
                'type'  => 'bearer',
            ]
        ]);
    }

    /**
     * Đăng ký tài khoản mới
     */
    public function register(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'firstname'=> 'required|string|max:100',
            'lastname' => 'required|string|max:100',
        ]);

        $user = User::create([
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => 1,
            'is_active' => 1
        ]);

        Candidate::create([
            'id'        => $user->id,
            'user_id'   => $user->id,
            'firstname' => $request->firstname,
            'lastname'  => $request->lastname,
            'email'     => $request->email
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user'    => $user
        ], 201);
    }

    /**
     * Lấy thông tin user hiện tại
     */
    public function me()
    {
        $user = JWTAuth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->role == 2) {
            $user = User::with('employer')->find($user->id);
        }

        if ($user->role == 1) {
            $name = User::join('candidates', 'users.id', '=', 'user_id')
                ->where('users.id', $user->id)
                ->select('firstname', 'lastname')
                ->first();
            $user['name'] = $name;
        }

        return response()->json($user);
    }

    /**
     * Đăng xuất (hủy token)
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Successfully logged out']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Logout failed', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Làm mới token
     */
    public function refresh()
    {
        return response()->json([
            'user' => JWTAuth::user(),
            'authorization' => [
                'token' => JWTAuth::refresh(JWTAuth::getToken()),
                'type'  => 'bearer',
            ]
        ]);
    }
}
