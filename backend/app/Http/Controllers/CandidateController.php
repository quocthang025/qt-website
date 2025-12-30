<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Contact;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CandidateController extends Controller
{
    // public function show($id)
    // {
    //     $candidate = Candidate::find($id);

    //     return response()->json($candidate);
    // }
    public function getCurrent()
    {
        $id = Auth::user()->id;
        $candidate = Candidate::find($id);

        return response()->json($candidate);
    }

    public function getAll()
    {
        $candidates = Candidate::select('candidates.*', 'users.gmail')
            ->join('users', 'users.id', '=', 'candidates.user_id')
            ->orderBy('candidates.id', 'desc')
            ->get();

        return response()->json($candidates);
    }

    public function update(Request $req)
    {
        $id = Auth::user()->id;
        $candidate = Candidate::find($id);

        $candidate->lastname = $req->lastname;
        $candidate->firstname = $req->firstname;
        $candidate->gender = $req->gender;
        $candidate->dob = $req->dob;
        $candidate->phone = $req->phone;
        $candidate->email = $req->email;
        $candidate->address = $req->address;
        $candidate->link = $req->link;
        $candidate->objective = $req->objective;

        $file = $req->file('image');
        if ($file) {
            $fname = 'avatar_candidate_' . '_' . $candidate->id;
            $path = env('APP_URL') . '/storage/' . $file->storeAs('avatar_images', $fname, 'public');
            $candidate->avatar = $path;
        }
        if ($req->delete_img) {
            $candidate->avatar = null;
        }
        $candidate->save();
        // return response()->json($req);
        return response()->json('updated successfully');
    }

    public function getAppliedJobs($id)
    {
        $jobs = Job::join('job_applying', 'id', '=', 'job_id')
            ->join('employers', 'employer_id', '=', 'employers.id')
            ->where('candidate_id', $id)
            ->select(
                'jobs.id', 'jname', 'employers.name', 'cv_link', 'status',
                DB::raw('DATE_FORMAT(job_applying.created_at, "%d/%m/%Y") as postDate')
            )
            ->orderByDesc('job_applying.created_at')
            ->get();

        return response()->json($jobs);
    }
    public function getSavedJobs($id)
    {
        // $candidate_id = Auth::user()->id;
        $jobs = Job::with(['employer', 'locations'])
            ->join('saved_jobs', 'id', '=', 'job_id')
            ->where('candidate_id', $id)
            ->select('jobs.*', DB::raw('DATE_FORMAT(expire_at, "%d/%m/%Y") as deadline'))
            ->get();

        return response()->json($jobs);
    }
    public function checkJobSaved($job_id)
    {
        $candidate_id = Auth::user()->id;
        $res = DB::table('saved_jobs')->where([
            ['candidate_id', '=', $candidate_id],
            ['job_id', '=', $job_id],
        ])->exists();

        if ($res) {
            return response()->json(['value' => true]);
        } else {
            return response()->json(['value' => false]);
        }
    }
    public function processJobSaving(Request $req)
    {
        $candidate_id = Auth::user()->id;
        if ($req->status == true) {
            DB::table('saved_jobs')->insert([
                ['candidate_id' => $candidate_id, 'job_id' => $req->job_id],
            ]);
        } else if ($req->status == false) {
            DB::table('saved_jobs')->where([
                ['candidate_id', '=', $candidate_id],
                ['job_id', '=', $req->job_id],
            ])->delete();
        }

        return response()->json('Updated successfully');
    }

    public function contact(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'topic' => 'required|string|max:255',
            'feedback' => 'required|string',
            'satisfaction' => 'nullable|string|max:50',
        ]);

        // Lưu dữ liệu vào database
        $contact = Contact::create([
            'title' => $validated['topic'],
            'content' => $validated['feedback'],
            'rate' => $this->mapSatisfactionToRate($validated['satisfaction']),
        ]);

        return response()->json([
            'message' => 'Phản hồi của bạn đã được gửi thành công!',
            'data' => $contact,
        ], 201);
    }

// Hàm hỗ trợ để chuyển đổi mức độ hài lòng thành số điểm (1-5)
    private function mapSatisfactionToRate($satisfaction)
    {
        $rates = [
            'Rất tệ' => 1,
            'Tệ' => 2,
            'Bình thường' => 3,
            'Tốt' => 4,
            'Tuyệt vời' => 5,
        ];

        return $rates[$satisfaction] ?? null;
    }
}
