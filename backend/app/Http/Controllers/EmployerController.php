<?php

namespace App\Http\Controllers;

use App\Events\NotifyCandidateEvent;
use App\Models\CandidateMessage;
use App\Models\Employer;
use App\Models\Job;
use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Redis;

class EmployerController extends Controller
{
    public function index(Request $request)
    {
        $keyw = $request->query('keyword');
        $query = Employer::query();
        if ($keyw) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($keyw) . '%']);
        }
        $res = $query->paginate(6);

        return response()->json($res);
    }

    public function show($id)
    {
        $employer = Employer::find($id);
        if ($employer) {
            return $employer;
        } else {
            return response()->json([
                'message' => 'resource not found'
            ], 404);
        }
    }

    public function destroy($id)
    {
        if (Employer::find($id))
            Employer::destroy($id);
        else return response()->json(['message' => 'resource not found']);
    }

    public function getHotList()
    {
        $res = Employer::where('is_hot', 1)->take(5)->get();
        for ($i = 0; $i < count($res); $i++) {
            $job_num = Job::where('employer_id', $res[$i]['id'])->count();
            $res[$i]['job_num'] = $job_num;
        }

        return response()->json($res);
    }

    public function getComJobs($id)
    {

        $jobs = Employer::join('jobs', 'employers.id', '=', 'employer_id')
            ->where([
                ['employers.id', '=', $id],
                ['jobs.is_active', '=', 1]
            ])
            ->select('jobs.*', DB::raw(
                'DATE_FORMAT(jobs.created_at, "%d/%m/%Y") as postDate,
                 DATE_FORMAT(jobs.expire_at, "%d/%m/%Y") as deadline'
            ))
            ->get();
        for ($i = 0; $i < count($jobs); $i++) {
            $res = DB::table('job_location')
                ->join('locations', 'location_id', '=', 'locations.id')
                ->where('job_id', $jobs[$i]->id)
                ->pluck('locations.name');
            //convert $res from array to string to send back frontend
            $location = array2String($res);
            $jobs[$i]['location'] = $location;
        }
        return $jobs;
    }

    public function getCandidateList(Request $req)
    {
        $job_ids = Job::where('employer_id', '=', Auth::user()->id)->pluck('id');

        $keyword = $req->query('keyword'); //search by name, email, applied job of candidate

        if ($req->status == 'WAITING' || $req->status == 'BROWSING_RESUME') {
            $status = ['WAITING', 'BROWSING_RESUME'];
        } else $status[] = $req->status;

        $candidates = DB::table('job_applying')
            ->join('jobs', 'job_id', '=', 'jobs.id')
            ->join('candidates', 'candidate_id', '=', 'candidates.id')
            ->whereIn('status', $status)
            ->whereIn('job_id', $job_ids)
            ->when($keyword != null, function ($query) use ($keyword) {
                return $query->where(function ($query2) use ($keyword) {
                    $query2->whereRaw('LOWER(jname) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orWhereraw('LOWER(candidates.email) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orWhereraw("LOWER(CONCAT(lastname, ' ', firstname)) LIKE ?", ['%' . strtolower($keyword) . '%']);
                });
            })
            ->selectRaw('job_applying.*, candidates.*, jobs.id, jobs.jname,
                        DATE_FORMAT(job_applying.created_at, "%d/%m/%Y %H:%i") as appliedTime')
            ->orderByDesc('job_applying.created_at')
            ->get();

        return response()->json($candidates);
    }

    public function processApplying(Request $req)
    {
        $currentTime = Carbon::parse(Carbon::now())->format('H:i d/m/Y');
        $company = Employer::where('user_id', '=', Auth::user()->id)->value('name');

        if ($req->actType == "VIEWED") $nextStatus = "BROWSING_RESUME";
        else if ($req->actType == "ACCEPT") {
            if ($req->step == "step1") {
                $nextStatus = "BROWSING_INTERVIEW";
                $msgName = "Hồ sơ được chấp nhận, vị trí ";
            } else if ($req->step == "step2") {
                $nextStatus = "PASSED";
                $msgName = "Chúc mừng bạn đã được nhận, vị trí ";
            }
        } else if ($req->actType == "REJECT") {
            if ($req->step == "step1") {
                $nextStatus = "RESUME_FAILED";
                $msgName = "Hồ sơ bị loại, vị trí ";
            } else if ($req->step == "step2") {
                $nextStatus = "INTERVIEW_FAILED";
                $msgName = "Phỏng vấn bị loại, vị trí ";
            }
        }
        $msgName = $msgName . $req->jname . ', ' . $company . ', lúc ' . $currentTime;
        //update:
        DB::table('job_applying')
            ->where([
                ['job_id', '=', $req->job_id],
                ['candidate_id', '=', $req->candidate_id]
            ])
            ->update([
                'status' => $nextStatus,
                'updated_at' => Carbon::now(),
            ]);
        if ($req->actType != "VIEWED") {
            CandidateMessage::create(
                [
                    'candidate_id' => $req->candidate_id,
                    'job_id' => $req->job_id,
                    'name' => $msgName,
                    'title' => $req->title,
                    'content' => $req->content,
                ]
            );
        }
        event(new NotifyCandidateEvent($msgName, $req->candidate_id));

        return response()->json("Updated successfully");
    }
    public function getJobList(Request $req)
    {
        $keyword = $req->query('keyword');
        $jobs = Job::with(['industries', 'locations'])
            ->join('jtypes', 'jtype_id', '=', 'jtypes.id')
            ->join('jlevels', 'jlevel_id', '=', 'jlevels.id')
            ->where('employer_id', '=', $req->id)
            ->when($keyword != null, function ($query) use ($keyword) {
                return $query->where(function ($query2) use ($keyword) {
                    $query2->whereRaw('LOWER(jname) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orWhereraw('LOWER(jtypes.name) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orWhereraw('LOWER(jlevels.name) LIKE ?', ['%' . strtolower($keyword) . '%']);
                });
            })
            ->selectRaw('jobs.*, jtypes.name as jtype_name, jlevels.name as jlevel_name,
                        DATE_FORMAT(jobs.created_at ,"%d/%m/%Y %H:%i") as postTime,
                        DATE_FORMAT(expire_at ,"%d/%m/%Y") as deadline')
            ->orderByDesc('jobs.created_at')
            ->get();

        return response()->json($jobs);
    }
    public function changeJobStatus(Request $req)
    {
        Job::where('id', $req->job_id)
            ->update(['is_active' => $req->status]);

        return response()->json('Updated successfully');
    }
}
