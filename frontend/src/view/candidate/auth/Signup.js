import { useForm } from "react-hook-form";
import { AiFillWarning } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import authApi from "../../../api/auth";

function Signup() {
  const required_field = <span className="text-danger fw-bold">*</span>;
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();
  const navigate = useNavigate();

  const AlertMsg = ({ msg }) => {
    return (
      <div className="d-flex justify-content-start">
        <span className="text-danger text-start" style={{ fontSize: "15px" }}>
          <span className="h5">
            <AiFillWarning />
          </span>
          <span className="ms-1">{msg}</span>
        </span>
      </div>
    );
  };
  const onSubmit = async (use_inf) => {
    console.log(use_inf);
    try {
      await authApi.register(use_inf);
      alert('Đăng ký thành công!\nNhấn "OK" để quay về trang chủ');
      if (window.location.pathname === "/sign-up") {
        navigate("/");
      }
    } catch (error) {
      alert("Email đã tồn tại trong hệ thống!");
    }
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-4"></div>
          <div
            className="col-lg-4 border mt-5 rounded bg-white shadow"
            // style={{ backgroundColor: "#e0ebeb" }}
          >
            <div className="pt-2 text-center">
              <strong style={{ fontSize: "20px" }}>Đăng ký</strong>
            </div>
            <form className="m-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="d-flex mb-2">
                <div className="me-2">
                  <label htmlFor="lastname" className="d-flex form-label">
                    Họ{required_field}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    {...register("lastname", { required: true })}
                    id="lastname"
                    name="lastname"
                    placeholder="Họ..."
                  />
                </div>
                <div className="">
                  <label htmlFor="firstname" className="d-flex form-label">
                    Tên{required_field}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    {...register("firstname", { required: true })}
                    id="firstname"
                    name="firstname"
                    placeholder="Tên..."
                  />
                </div>
              </div>
              {errors.lastname || errors.firstname ? (
                <AlertMsg msg="Hãy nhập đầy đủ họ, tên" />
              ) : null}
              <div className="mb-2">
                <label htmlFor="su_email" className="d-flex form-label">
                  Email{required_field}
                </label>
                <input
                  type="text"
                  className="form-control"
                  {...register("email", {
                    required: true,
                    pattern:
                      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                  })}
                  id="su_email"
                  name="email"
                  placeholder="Email..."
                />
              </div>
              {errors.email?.type === "required" && (
                <AlertMsg msg="Hãy nhập email" />
              )}
              {errors.email?.type === "pattern" && (
                <AlertMsg msg="Email không đúng định dạng" />
              )}
              <div className="mb-2">
                <label htmlFor="su_pswd" className="d-flex form-label">
                  Mật khẩu{required_field}
                </label>
                <input
                  type="password"
                  className="form-control"
                  {...register("password", {
                    required: true,
                    pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                  })}
                  id="su_pswd"
                  name="password"
                  placeholder="Mật khẩu..."
                />
              </div>
              {errors.password?.type === "required" && (
                <AlertMsg msg="Hãy nhập mật khẩu" />
              )}
              {errors.password?.type === "pattern" && (
                <AlertMsg msg="Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một số" />
              )}
              <div className="mb-2">
                <label htmlFor="re_pswd" className="d-flex form-label">
                  Nhập lại mật khẩu{required_field}
                </label>
                <input
                  type="password"
                  className="form-control"
                  {...register("re_password", {
                    required: true,
                  })}
                  id="re_pswd"
                  name="re_password"
                  placeholder="Nhập lại mật khẩu..."
                />
              </div>
              {!errors.password && errors.re_password?.type === "required" && (
                <AlertMsg msg="Không được để trống" />
              )}
              {!errors.password &&
                (watch("re_password") !== "" &&
                watch("password") !== watch("re_password") ? (
                  <AlertMsg msg="Mật khẩu nhập lại không khớp" />
                ) : null)}
              <div>
                <button
                  type="submit"
                  className="btn btn-primary d-block mx-auto"
                  // data-bs-toggle="modal"
                  // data-bs-target="#signup_msg"
                >
                  Gửi
                </button>
              </div>
              {/* {!errors && (
                                <div className="modal" id="signup_msg">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h4 className="modal-title">Modal Heading</h4>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                        </div>
                                        <div className="modal-body">
                                            Modal body..
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            )}                             */}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
