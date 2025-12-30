<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Contact;
use App\Models\Employer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{

    public function getAllCandidates()
    {
        $candidates = Candidate::orderBy('id', 'desc')
            ->get();

        return response()->json($candidates);
    }

    public function getContact()
    {
        $contacts = Contact::orderBy('id', 'desc')
            ->get();

        return response()->json($contacts);
    }

    public function createCandidate(Request $request)
    {
        User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 1,
            'is_active' => 1,
        ]);

        $user = User::orderBy('id', 'desc')->first();
        Candidate::create([
            'id' => $user->id,
            'user_id' => $user->id,
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'email' => $request->email,
            'address' => $request->address,
            'phone' => $request->phone,
            'gender' => $request->gender,

        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,

        ], 201);
    }

    public function updateCandidate(Request $request, $id)
    {
        // Tìm ứng viên theo ID
        $candidate = Candidate::find($id);

        if (!$candidate) {
            return response()->json([
                'message' => 'Candidate not found',
            ], 404);
        }

        // Cập nhật thông tin trong bảng users nếu có
        $user = User::find($candidate->user_id);
        if ($user) {
            $user->email = $request->email ?? $user->email;
            if ($request->password) {
                $user->password = Hash::make($request->password);
            }
            $user->save();
        }

        // Cập nhật thông tin trong bảng candidates
        $candidate->firstname = $request->firstname ?? $candidate->firstname;
        $candidate->lastname = $request->lastname ?? $candidate->lastname;
        $candidate->email = $request->email ?? $candidate->email;
        $candidate->address = $request->address ?? $candidate->address;
        $candidate->phone = $request->phone ?? $candidate->phone;
        $candidate->gender = $request->gender ?? $candidate->gender;
        $candidate->save();

        return response()->json([
            'message' => 'Candidate updated successfully',
            'candidate' => $candidate,
        ], 200);
    }

    public function deleteCandidate($id)
    {
        try {
            DB::beginTransaction();

            // Tìm candidate theo ID
            $candidate = Candidate::findOrFail($id);

            // Xóa user tương ứng nếu tồn tại
            if ($candidate->user_id) {
                User::where('id', $candidate->user_id)->delete();
            }

            // Xóa candidate
            $candidate->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa ứng viên và tài khoản thành công.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Xóa thất bại: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getAllEmployers()
    {
        $employers = Employer::orderBy('id', 'desc')
            ->get();

        return response()->json($employers);
    }

    public function createEmployer(Request $request)
    {
        User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 2,
            'is_active' => 1,
        ]);

        $user = User::orderBy('id', 'desc')->first();
        Employer::create([
            'id' => $user->id,
            'user_id' => $user->id,
            'name' => $request->name,
            'min_employees' => $request->min_employees,
            'max_employees' => $request->max_employees,
            'contact_name' => $request->contact_name,
            'address' => $request->address,
            'phone' => $request->phone,
            'website' => $request->website,
            'description' => $request->description,
            'is_hot' => 1,
            'is_active' => 1,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,

        ], 201);
    }

    public function updateEmployer(Request $request, $id)
    {
        // Tìm ứng viên theo ID
        $employer = Employer::find($id);

        if (!$employer) {
            return response()->json([
                'message' => 'employer not found',
            ], 404);
        }

        // Cập nhật thông tin trong bảng employers
        $employer->name = $request->name ?? $employer->name;
        $employer->phone = $request->phone ?? $employer->phone;
        $employer->contact_name = $request->contact_name ?? $employer->contact_name;
        $employer->address = $request->address ?? $employer->address;
        $employer->save();

        return response()->json([
            'message' => 'employer updated successfully',
            'employer' => $employer,
        ], 200);
    }


    public function deleteEmployer($id)
{
    try {
        DB::beginTransaction();

        // Tìm employer theo ID
        $employer = Employer::findOrFail($id);

        // Xóa user tương ứng nếu tồn tại
        if ($employer->user_id) {
            User::where('id', $employer->user_id)->delete();
        }

        // Xóa employer
        $employer->delete();

        DB::commit();

        return response()->json([
            'status' => 'success',
            'message' => 'Xóa nhà tuyển dụng và tài khoản thành công.',
        ]);
    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'status' => 'error',
            'message' => 'Xóa thất bại: ' . $e->getMessage(),
        ], 500);
    }
}


}
