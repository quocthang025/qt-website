import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import authApi from "../../../api/auth";
import { candAuthActions } from "../../../redux/slices/candAuthSlice";

function Login() {
  const {
    register,
    // formState: { errors },
    handleSubmit,
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleLogin = async (user) => {
    //add role 1(candidate)
    user.role = 1;
    setIsLoading(true);
    await authApi
      .login(user)
      .then((res) => {
        console.log(res);
        dispatch(candAuthActions.setCurrentCandidate(res.user));
        localStorage.setItem("candidate_jwt", res.authorization.token);
        if (window.location.pathname === "/sign-up") {
          navigate("/");
        } else {
          const closeBtn = document.getElementById("closeBtn");
          closeBtn.click();
          document.querySelector('button.resetBtn').click();
        }
      })
      .catch((error) => {
        // console.log(error);
        setIsError(true);
      });
      setIsLoading(false);
  };

  return (
    <div className="modal fade" id="login-box">
      <div className="modal-dialog shadow">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">Đăng nhập</h3>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              id="closeBtn"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  name="email"                  
                  {...register("email")}
                />
                <label htmlFor="email">Email</label>
              </div>
              <div className="form-floating mt-2">
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  {...register("password")}
                />
                <label htmlFor="password">Mật khẩu</label>
              </div>
              <div className="text-center">
                <a
                  href="/k"
                  className="d-block mt-1"
                  style={{ textDecoration: "none" }}
                >
                  Quên mật khẩu
                </a>
                <span className="text-danger">
                  {isError && (
                    <span>*Email hoặc mật khẩu không chính xác!</span>
                  )}
                </span>
              </div>
              <div className="d-flex justify-content-end mt-2">
                <button type="submit" className="btn btn-primary me-1 w-100">
                  {isLoading && (
                    <span className="spinner-border spinner-border-sm" />
                  )}
                  &nbsp;Đăng nhập
                </button>
                <button type="reset" className="resetBtn" style={{ display: 'none' }} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
