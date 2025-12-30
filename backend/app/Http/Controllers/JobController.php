<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use App\Models\Job;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{
    public function index(Request $req)
    {
        $jobs = Job::with(['employer', 'locations'])
            ->where('jobs.is_active', 1)
            ->when($req->keyword !== null, function ($query) use ($req) {
                // return $query->join('employers', 'employer_id', '=', 'employers.id')
                //     ->whereRaw('LOWER(employers.name) LIKE ?', ['%' . strtolower($req->keyword) . '%']);
                return $query->whereRaw('LOWER(jobs.jname) LIKE ?', ['%' . strtolower($req->keyword) . '%']);
            })
            ->when($req->industry_id !== null, function ($query) use ($req) {
                return $query->join('job_industry', 'jobs.id', '=', 'job_industry.job_id')
                    ->whereIn('industry_id', $req->industry_id);
            })
            ->when($req->location_id !== null, function ($query) use ($req) {
                return $query->join('job_location', 'jobs.id', '=', 'job_location.job_id')
                    ->whereIn('location_id', $req->location_id);
            })
            ->when($req->salary !== null, function ($query) use ($req) {
                return $query->where('min_salary', '>=', $req->salary);
            })
            ->when($req->jtype_id !== null, function ($query) use ($req) {
                return $query->where('jtype_id', '=', $req->jtype_id);
            })
            ->when($req->jlevel_id !== null, function ($query) use ($req) {
                return $query->where('jlevel_id', '=', $req->jlevel_id);
            })
            ->orderByDesc('jobs.updated_at')
            ->select('jobs.*')
            ->distinct()
            ->paginate(9);

        $jobs = $jobs->toArray();
        $currentTime = Carbon::now();

        if ($req->posting_period) {
            $jobs['data'] = array_filter(
                $jobs['data'],
                fn ($item) => $currentTime->diffInDays($item['created_at']) <= $req->posting_period
            );
        }

        return response()->json($jobs);
    }
    public function show($id)
    {
        $job = Job::with(['employer', 'jtype', 'jlevel', 'industries'])
            ->where('id', $id)
            ->select('jobs.*', DB::raw('DATE_FORMAT(created_at, "%d/%m/%Y") as postDate'))
            ->first();
        $this->addLocationInf($job);

        if ($job) {
            return response()->json($job);
        } else {
            return response()->json('resource not found');
        }
    }
    public function getHotList()
    {
        $res = Job::with(['employer', 'locations'])
            ->where('is_hot', 1)
            ->orderByDesc('created_at')
            ->paginate(6);

        return response()->json($res);
    }
    public function create(Request $req)
    {
        $new_record = $req->all();

        $industries = $new_record['industries'];
        unset($new_record['industries']);
        $locations = $new_record['locations'];
        unset($new_record['locations']);

        $new_record['employer_id'] = Auth::user()->id;

        $job = Job::create($new_record);
        for ($i = 0; $i < count($industries); $i++) {
            $job_industries[$i] = collect(['job_id' => $job->id, 'industry_id' => $industries[$i]])->toArray();
        }
        DB::table('job_industry')->insert($job_industries);

        for ($i = 0; $i < count($locations); $i++) {
            $job_locations[$i] = collect(['job_id' => $job->id, 'location_id' => $locations[$i]])->toArray();
        }
        DB::table('job_location')->insert($job_locations);

        return response()->json('Updated successfully');
    }
    public function update(Request $req)
    {
        $update_fields = $req->all();
        if (isset($update_fields['industries'])) {
            $industries = $update_fields['industries'];
            unset($update_fields['industries']);

            //update job_industry
            DB::table('job_industry')->where('job_id', $req->id)->delete();
            for ($i = 0; $i < count($industries); $i++) {
                $job_industries[$i] = collect(['job_id' => $req->id, 'industry_id' => $industries[$i]])->toArray();
            }
            DB::table('job_industry')->insert($job_industries);
        }
        if (isset($update_fields['locations'])) {
            $locations = $update_fields['locations'];
            unset($update_fields['locations']);

            //update job_location
            DB::table('job_location')->where('job_id', $req->id)->delete();
            for ($i = 0; $i < count($locations); $i++) {
                $job_locations[$i] = collect(['job_id' => $req->id, 'location_id' => $locations[$i]])->toArray();
            }
            DB::table('job_location')->insert($job_locations);
        }
        if (count($update_fields) > 0) {
            Job::where('id', $req->id)
                ->update($update_fields);
        }
        $msg = 'Update successfully';

        return response()->json($msg);
    }
    public function getJobIndustries($id)
    {
        $res = Job::find($id)->industries;

        return response()->json($res);
    }

    public function addLocationInf($job)
    {
        $res = DB::table('job_location')
            ->join('locations', 'location_id', '=', 'locations.id')
            ->where('job_id', $job->id)
            ->pluck('locations.name');
        //convert $res from array to string to send back frontend
        $location = array2String($res);
        $job['location'] = $location;
        //format date to display:
        // $job['expire_at'] = Carbon::parse($job['expire_at'])->format('d/m/Y');
        // $job['updated_at'] = Carbon::parse($job['updated_at'])->toDateTimeString();
    }
    public function apply(Request $req)
    {
        $user = Auth::user();
        $fname = 'cand' . $user->id . '_' . $req->fname;
        $path =  env('APP_URL') . '/storage/' . $req->file('cv')->storeAs(
            'cv_images',
            $fname,
            'public'
        );
        DB::table('job_applying')->insert([
            'job_id' => $req->id,
            'candidate_id' => $user->id,
            'cv_link' => $path,
            'created_at' => Carbon::now()
        ]);

        return response()->json($path);
    }
    public function checkApplying($job_id)
    {
        $user = Auth::user();
        $res = DB::table('job_applying')
            ->where([
                ['job_id', '=', $job_id],
                ['candidate_id', '=', $user->id]
            ])->first();

        if ($res != null) {
            return response()->json(['value' => true]);
        } else return response()->json(['value' => false]);
    }
}
