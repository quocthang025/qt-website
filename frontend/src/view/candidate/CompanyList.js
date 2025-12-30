import "./custom.css";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import employerApi from "../../api/employer";
import { AppContext } from "../../App";
import { IoMdPeople } from "react-icons/io";
import { MdLocationOn } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import CPagination from "../../components/CPagination";
import Spinner from "react-bootstrap/Spinner";

function CompanyList() {
  const nav = useNavigate();
  const { setCurrentPage } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [comKey, setComKey] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [curPage, setCurPage] = useState(1);

  const getCompanies = async (page = 1) => {
    const res = await employerApi.getList({ page, keyword: comKey });
    setCompanies(res.data);
    setTotalPage(res.last_page);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();    
    try {
      setIsLoading(true);
      await getCompanies();
      setIsLoading(false);
      setCurPage(1);
    } catch (e) {
      setIsLoading(false);
    }
  };
  const handleChange = (e) => {
    setComKey(e.target.value);
  };

  useEffect(() => {
    setCurrentPage("companies");
    getCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ margin: "0px 100px", paddingBottom: "20px" }}>
      <form className="d-flex pt-4" onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control"
          style={{ width: "300px" }}
          name="com_key"
          placeholder="Tìm tên công ty..."
          onChange={handleChange}
        />
        <button type="submit" className="ms-2 btn btn-primary">
          {isLoading && <Spinner size="sm" className="me-1" />}
          Tìm kiếm
        </button>
      </form>
      <h4 className="my-3 text-main text-center">Danh sách công ty</h4>
      <div className="row mt-3">
        {companies.length > 0 ? (
          companies.map((company) => (
            <div className="col-sm-12 col-lg-4 mb-3 pointer" key={(`company_${company.id}`)}>
              <div
                className="card border hover-border-main hover-shadow-sm"
                style={{ minHeight: "240px" }}
                onClick={() => nav(`/companies/${company.id}`)}
              >
                <div
                  className="d-flex border-bottom px-2"
                  style={{ minHeight: "110px" }}
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={company.logo}
                      style={{ maxWidth: "110px", maxHeight: "110px" }}
                      alt={company.name}
                    />
                  </div>
                  <div className="container-fluid d-flex align-items-center justify-content-start ps-4 fw-bold">
                    <span>{company.name}</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-text text-start ts-smd">
                    <div className="d-flex align-items-center gap-1">
                      <IoMdPeople className="fs-5 text-main" />
                      {company.min_employees ? (
                        <span>
                          {company.min_employees}
                          {company.max_employees !== 0
                            ? " - " + company.max_employees
                            : "+ "}{" "}
                          nhân viên
                        </span>
                      ) : (
                        "Chưa cập nhật"
                      )}
                    </div>
                    <div className="text-multiline">
                      <MdLocationOn className="fs-5 text-main me-1" />
                      {company.address}
                    </div>
                    {company.website && (
                      <span className="text-ellipsis">
                        <IoIosLink className="ts-lg text-main me-1" />
                        <a
                          href={company.website}
                          className="hover-link text-secondary text-decoration-none"
                        >
                          {company.website}
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <h4 className="ms-3 text-start">Không có kết quả nào phù hợp!</h4>
        )}
      </div>
      <CPagination
        className="justify-content-center"
        totalPage={totalPage}
        curPage={curPage}
        setCurPage={setCurPage}
        getList={getCompanies}
      />
    </div>
  );
}

export default CompanyList;
