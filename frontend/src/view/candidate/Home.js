import axios from "axios";
import { useEffect, useState } from "react";
import {
  BsCaretLeft,
  BsCaretRight,
  BsCurrencyDollar,
  BsGeoAlt,
} from "react-icons/bs";
import { Link } from "react-router-dom";

function Home() {
  const poster = process.env.PUBLIC_URL + "/image/poster4.jpg";
  const [hotJobs, setHotJobs] = useState([{ employer: {}, locations: [] }]);
  const [hotCompanies, setHotCompanies] = useState([]);
  const [page, setPage] = useState({ links: [] });
  const [curPage, setCurPage] = useState(1);

  const getHotJobs = async (apiURL) => {
    await axios
      .get(apiURL)
      .then((res) => {
        console.log(res.data);
        setHotJobs(res.data.data);
        delete res.data.data;
        setPage(res.data);
        setCurPage(res.data.current_page);
        // console.log(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const getHotCompanies = async () => {
    await axios
      .get("http://127.0.0.1:8000/api/companies/getHotList")
      .then((res) => {
        console.log(res.data);
        setHotCompanies(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getHotJobs(`http://127.0.0.1:8000/api/jobs/getHotList`);
    getHotCompanies();
  }, []);

  return (
    <>
      <div>
        <img className="w-100" src={poster} alt="poster" />
      </div>
      <div className="mt-5 mx-4 pb-3 bg-white">
        <h4 className="pt-3 ps-4">Việc làm nổi bật</h4>
        <hr />
        <div className="row">
          {hotJobs.map((job, index) => (
            <div
              key={"job" + job.id}
              className="col-md-5 my-2 d-flex border-bottom"
              style={{ marginLeft: "85px" }}
            >
              <Link
                to={`/companies/${job.employer.id}`}
                className="border ms-1 mb-3 d-flex justify-content-center"
                style={{ width: "110px", height: "110px" }}
              >
                <img
                  className="align-self-center"
                  style={{
                    maxHeight: "90px",
                    maxWidth: "90px",
                  }}
                  src={job.employer.logo}
                  alt={"hotjob" + job.id}
                />
              </Link>
              <div style={{ fontSize: "15.5px" }}>
                <div className="ms-4 mt-1 mb-2">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="nav-link fw-bold"
                    style={{ fontSize: "18.5px" }}
                  >
                    {job.jname}
                  </Link>
                  <span className="text-secondary">{job.employer.name} </span>
                  <div className="d-flex align-items-center">
                    <BsCurrencyDollar />
                    {job.min_salary ? (
                      <span>
                        {job.min_salary} - {job.max_salary} triệu VND
                      </span>
                    ) : (
                      "Theo thỏa thuận"
                    )}
                  </div>
                  <div className="d-flex align-items-center">
                    <BsGeoAlt />
                    &nbsp;
                    {job.locations.map((item, index) => (
                      <span key={"job_location_" + job.id + "-" + item.id}>
                        {item.name}
                        {index !== job.locations.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex justify-content-center mt-3">
          {page.links.map((item) => (
            <button
              key={'page' + item.label}
              type="button"
              className="btn btn-sm border me-2"
              style={{
                backgroundColor: curPage.toString() === item.label && "#1E90FF",
                color: curPage.toString() === item.label ? "white" : "#1E90FF",
              }}
              onClick={() => getHotJobs(item.url)}
            >
              {item.label === "&laquo; Previous" && (
                <BsCaretLeft style={{ fontSize: "18px" }} />
              )}
              {item.label === "Next &raquo;" && (
                <BsCaretRight style={{ fontSize: "18px" }} />
              )}
              {item.label !== "&laquo; Previous" &&
              item.label !== "Next &raquo;"
                ? item.label
                : null}
            </button>
          ))}          
        </div>
      </div>
      <div className="mt-5 mx-4 bg-white">
        <h4 className="pt-3 ps-4">Top công ty nổi bật</h4>
        <hr />
        <div className="row ms-4 pb-4">
          {hotCompanies.map((company) => (
            <div
              className="col-md-2 border rounded me-5"
              key={"company" + company.id}
            >
              <Link
                to={`/companies/${company.id}`}
                className="d-flex justify-content-center mx-auto"
                style={{ width: "110px", height: "110px" }}
              >
                <img
                  className="align-self-center"
                  style={{
                    maxHeight: "90px",
                    maxWidth: "90px",
                  }}
                  src={company.logo}
                  alt={"hot_company" + company.id}
                />
              </Link>
              <div className="text-center mb-2">
                <div className="fw-bold mb-1">{company.name}</div>
                <span className="border rounded px-1 bg-mlight">
                  {company.job_num} việc làm
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: "40px" }}>
        <span></span>
      </div>
    </>
  );
}
export default Home;
