import "./custom.css";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import employerApi from "../../api/employer";
import { IoMdPeople } from "react-icons/io";
import { MdLocationOn } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import { MdPhone } from "react-icons/md";

function Company() {
  const { id } = useParams();
  const [infor, setInfor] = useState({});
  const [jobs, setJobs] = useState([{}]);

  const getCompanyInfor = async () => {
    const res = await employerApi.getById(id);
    setInfor(res);
  };

  const getCompanyJobs = async () => {
    const res = await employerApi.getComJobs(id);
    setJobs(res);
  };

  useEffect(() => {
    getCompanyInfor();
    getCompanyJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="container image-container d-flex justify-content-center">
        <img
          src={infor.image}
          className="mt-3"
          style={{ maxWidth: "93%", maxHeight: "400px" }}
          alt={infor.name}
        />
      </div>
      <div className="d-flex justify-content-center mt-3">
        <div className="bg-white col-md-9 shadow-sm pt-3">
          <h4 style={{ marginLeft: "30px" }} className="text-main">
            {infor.name}
          </h4>
          <div className="d-flex ps-4 pb-4 pt-1 align-items-start">
            <div
              className="border d-flex align-items-center"
              style={{ height: "130px" }}
            >
              <img
                src={infor.logo}
                style={{ maxHeight: "130px", maxWidth: "130px" }}
                alt={infor.name}
              />
            </div>
            <div className="ms-3 mt-2">
              <div className="d-flex gap-1 flex-wrap">
                <div className="d-flex align-items-center me-4 rounded-pill px-2 py-1 bg-mlight text-main">
                  <IoMdPeople className="fs-5 me-1" />
                  {infor.min_employees ? (
                    <span>
                      {infor.min_employees}
                      {infor.max_employees !== 0
                        ? " - " + infor.max_employees
                        : "+ "}{" "}
                      nhân viên
                    </span>
                  ) : (
                    "Chưa cập nhật"
                  )}
                </div>
                <div className="d-flex align-items-center me-4 rounded-pill px-2 py-1 bg-mlight text-main">
                  <MdPhone className="fs-5 me-1" />
                  <span>{infor.phone}</span>
                </div>
                <div className="d-flex align-items-center rounded-pill px-2 py-1 bg-mlight text-main">
                  <IoIosLink className="ts-lg me-1" />
                  <a
                    href={infor.website}
                    className="text-main text-decoration-none"
                  >
                    {infor.website}
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <MdLocationOn className="fs-5 text-main me-1" />
                <span>{infor.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto bg-white col-md-9 mt-4 shadow-sm">
        <h5 className="bg-main text-white p-3">Giới thiệu công ty</h5>
        <div className="whitespace-preline px-3 pb-3">
          {infor.description ? infor.description : "Chưa cập nhật thông tin"}
        </div>
      </div>
      <div className="d-flex justify-content-center mt-4">
        <div className="col-md-9 mb-5">
          <h5 className="bg-main text-white col-md-9 p-3 mb-0">
            Việc làm đang tuyển
          </h5>
          {jobs.map((job) => (
            <div
              className="bg-white border-bottom col-md-9 ps-3 py-1"
              key={"job" + job.id}
            >
              <div className="d-flex p-3">
                <div className="border d-flex align-items-center">
                  <img
                    src={infor.logo}
                    style={{ maxHeight: "130px", maxWidth: "130px" }}
                    alt={infor.name}
                  />
                </div>
                <div className="container-fluid ms-3 mt-1">
                  <Link to={`/jobs/${job.id}`} className="nav-link">
                    <span className="h5 hover-text-main">{job.jname}</span>
                  </Link>
                  <span className="text-secondary">{infor.name}</span>
                  <br />
                  <div style={{ fontSize: "15.5px" }}>
                    <span className="fw-500">Mức lương:</span>&nbsp;
                    {job.min_salary ? (
                      <span>
                        {job.min_salary} - {job.max_salary} triệu VND
                      </span>
                    ) : (
                      <span>Cạnh tranh</span>
                    )}
                    <br />
                    <span className="fw-500">Địa điểm:</span>&nbsp;
                    {job.location}
                    <div className="clearfix">
                      <span>
                        <span className="fw-500">Ngày đăng: </span>
                        {job.postDate ? job.postDate : "06/04/2023"}
                      </span>
                      <span style={{ marginLeft: "150px" }}>
                        <span className="fw-500">Hạn nộp: </span>
                        {job.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Company;
