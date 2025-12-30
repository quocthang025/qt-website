import "bootstrap/dist/js/bootstrap.js";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { BsBell, BsFillCircleFill } from "react-icons/bs";
import "./layout.css";
import { useDispatch, useSelector } from "react-redux";
import authApi from "../../../api/auth";
import candMsgApi from "../../../api/candidateMessage";
import { candAuthActions } from "../../../redux/slices/candAuthSlice";
import Login from "../auth/Login";
import Pusher from "pusher-js";
import BellDialog from "./BellDialog";
import Stack from "react-bootstrap/Stack";
import { AppContext } from "../../../App";
import clsx from "clsx";

const user_icon = process.env.PUBLIC_URL + "/image/user_icon.png";

function Layout(props) {
  const nav = useNavigate();
  const [bellMsgs, setBellMsgs] = useState([]);
  const [msgStyles, setMsgStyles] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [showBellDialog, setShowBellDialog] = useState(false);
  const [showListMsg, setShowListMsg] = useState(false);
  const [curNotification, setCurNotification] = useState({});
  const { currentPage, setCurrentPage } = useContext(AppContext);

  const dispatch = useDispatch();
  const candidate = useSelector((state) => state.candAuth.current);
  const isAuth = useSelector((state) => state.candAuth.isAuth);

  const handleLogout = async () => {
    await authApi.logout(1);
    dispatch(candAuthActions.logout());
    localStorage.removeItem("candidate_jwt");
    nav("/");
  };

  const getAllMessages = async () => {
    const res = await candMsgApi.getMsgs(candidate.id);
    console.log("bell msgs:", res);
    setBellMsgs(res);
  };
  const handleReadMsg = async (inf) => {
    setShowBellDialog(true);
    setCurNotification(inf);
    // update read status
    if (inf.isRead === 0) {
      await candMsgApi.markAsRead(inf.id);
      let temp = [...bellMsgs];
      for (let i = 0; i < temp.length; i++) {
        if (temp[i].id === inf.id) {
          temp[i].isRead = 1;
        }
      }
      setBellMsgs(temp);
    }
    // nav(`/jobs/${inf.job_id}`);
  };
  useEffect(() => {
    let msg_styles = [];
    for (let i = 0; i < bellMsgs.length; i++) {
      if (bellMsgs[i].isRead === 0) {
        setHasNew(true);
        break;
      }
      if (i === bellMsgs.length - 1) setHasNew(false);
    }
    for (let i = 0; i < bellMsgs.length; i++) {
      if (bellMsgs[i].isRead === 0) {
        msg_styles[i] = " text-primary";
      } else msg_styles[i] = " text-secondary";
    }
    setMsgStyles(msg_styles);
  }, [bellMsgs]);

  const getMe = async () => {
    const res = await authApi.getMe(1);
    dispatch(candAuthActions.setCurrentCandidate(res));
  };
  useEffect(() => {
    if (localStorage.getItem("candidate_jwt")) {
      getMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuth) {
      getAllMessages();
      let pusher = new Pusher("5b0ac1136aca9c77eadb", {
        cluster: "ap1",
        encrypted: true,
      });
      let channelName = `candidate-channel_${candidate.id}`;
      let channel = pusher.subscribe(channelName);
      channel.bind("notification-event", (data) => {
        // alert("bell message::", JSON.stringify(data));
        getAllMessages();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  return (
    <>
      <BellDialog
        show={showBellDialog}
        setShow={setShowBellDialog}
        current={curNotification}
      />
      <header>
        <Stack
          direction="horizontal"
          gap={1}
          className="fixed-top bg-white text-secondary shadow-sm ts-17 fw-500"
        >
          <Link
            className="nav-link ms-2 pe-2 ts-xl pb-1"
            to="/"
            onClick={() => setCurrentPage("home")}
          >
            Recruitment
          </Link>
          <Link
            className={clsx(
              "nav-link py-3 px-2",
              currentPage === "companies" && "text-main"
            )}
            to="/companies"
            onClick={() => setCurrentPage("companies")}
          >
            Công ty
          </Link>
          <Link
            className={clsx(
              "nav-link py-3 px-2",
              currentPage === "jobs" && "text-main"
            )}
            to="/jobs"
            onClick={() => setCurrentPage("jobs")}
          >
            Việc làm
          </Link>

          <div className="nav-item dropdown">
        <span className="nav-link py-3 px-2">
          Hỗ trợ
        </span>
        <div className="dropdown-menu">
          <Link
            className="dropdown-item"
            to="#"
            onClick={() => setCurrentPage("consulting")}
          >
            Hướng dẫn tìm việc an toàn
          </Link>
          <Link
            className="dropdown-item"
            to="#"
            onClick={() => setCurrentPage("contact")}
          >
            Hướng dẫn quản lý tài khoản
          </Link>
          <Link
            className="dropdown-item"
            to="#"
            onClick={() => setCurrentPage("contact")}
          >
            Các câu hỏi thường gặp
          </Link>
          <Link
            className="dropdown-item"
            to="contact"
            onClick={() => setCurrentPage("contact")}
          >
            Yêu cầu hỗ trợ
          </Link>
        </div>
      </div>
          
          <div className="me-auto"></div>
          {!isAuth ? (
            <div className="d-flex align-items-center fw-normal ts-md pointer">
              <div
                data-bs-toggle="modal"
                data-bs-target="#login-box"
              >
                Đăng nhập
              </div>
              <div className="vr mx-2 border-2"/>
              <Link to="/sign-up" className="text-decoration-none text-secondary">
                Đăng ký
              </Link>

              
              <div className="ms-3 me-2">
                <a
                  href="/employer/login"
                  className="btn bg-info text-white fw-500"
                >
                  Đăng tuyển, tìm ứng viên
                </a>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center sidebar-right">
              <div
                className="position-relative"
                onMouseLeave={() => setShowListMsg(false)}
              >
                <BsBell
                  className="fs-3 me-4 pointer"
                  onClick={() => setShowListMsg(true)}
                />
                {hasNew && (
                  <div className="bell-new">
                    <BsFillCircleFill />
                  </div>
                )}
                <div
                  className={clsx(
                    "position-absolute bg-white rounded z-index-1 msg-list fw-normal shadow",
                    showListMsg ? "d-block" : "d-none"
                  )}
                >
                  {bellMsgs.length > 0 ? (
                    bellMsgs.map((item, index) => (
                      <div
                        key={"bell_msg" + index}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleReadMsg(item)}
                        className={
                          "text-wrap px-2 py-1 hover-bg-1" + msgStyles[index]
                        }
                      >
                        {item.name}
                      </div>
                    ))
                  ) : (
                    <span className="ms-3">Không có thông báo nào</span>
                  )}
                </div>
              </div>
              <div className="dropdown pt-1">
                <img
                  src={user_icon}
                  alt="user_icon"
                  style={{ width: "35px" }}
                  className="rounded-pill border border-2"
                />
                &nbsp;
                <span
                  style={{ fontSize: "16px", cursor: "pointer" }}
                  className="dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  {candidate.name && candidate.name.firstname}
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/candidate">
                      Tài khoản
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </Stack>
      </header>
      <main
        className="page-body"
        style={{ marginTop: "57px" }}
      >
        {!isAuth && <Login />}
        {props.children}
      </main>
      <footer className="border-top" style={{ paddingTop: "35px" }}>
        <div className="container">
          <div className="row">
            <div
              className="col-md-4"
              style={{ fontSize: "15.6px", paddingLeft: "27px" }}
            >
              <h5>Thông tin liên hệ</h5>
              <p>Email: info@tuyendung.com</p>
              <p>Điện thoại: 0333-555-789</p>
              <p>
                Địa chỉ: 05 Đường Trâu Quỳ, Thị trấn Trâu Quỳ, <br />
                Huyện Gia Lâm, TP.Hà Nội
              </p>
            </div>
            <div className="col-md-4" style={{ paddingLeft: "125px" }}>
              <h5>Chuyên mục</h5>
              <ul className="list-unstyled">
                <li>
                  <Link
                    to={"#"}
                    className="text-secondary text-decoration-none"
                  >
                    Việc làm IT
                  </Link>
                </li>
                <li>
                  <Link
                    to={"#"}
                    className="text-secondary text-decoration-none"
                  >
                    Việc làm Kế toán
                  </Link>
                </li>
                <li>
                  <Link
                    to={"#"}
                    className="text-secondary text-decoration-none"
                  >
                    Việc làm Kinh doanh
                  </Link>
                </li>
                <li>
                  <Link
                    to={"#"}
                    className="text-secondary text-decoration-none"
                  >
                    Việc làm Marketing
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-md-4" style={{ paddingLeft: "120px" }}>
              <h5>Liên kết</h5>
              <ul className="list-unstyled">
                <li>
                  <Link
                    to={"/"}
                    className="text-secondary text-decoration-none"
                  >
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/jobs"}
                    className="text-secondary text-decoration-none"
                  >
                    Danh sách việc làm
                  </Link>
                </li>
                <li>
                  <Link
                    to={"#"}
                    className="text-secondary text-decoration-none"
                  >
                    Hướng dẫn ứng tuyển
                  </Link>
                </li>
                <li>
                  <Link
                    to={"#"}
                    className="text-secondary text-decoration-none"
                  >
                    Chính sách bảo mật
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <hr />
          <p className="text-center">© 2023 Tuyển dụng. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Layout;
