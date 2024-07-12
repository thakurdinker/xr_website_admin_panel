import { useCallback, useEffect, useState } from "react";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import SelectGroupThree from "../Forms/SelectGroup/SelectGroupThree";
import axios from "axios";
import { GET_ALL_ROLES, REGISTER_USER } from "../../api/constants";

const AddUser = ({ setAddUser }) => {
  const [roles, setRoles] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    roleId: "",
    email: "",
    password: "",
    username: "",
  });

  useEffect(() => {
    // Get all the roles
    axios
      .get(GET_ALL_ROLES, { withCredentials: true })
      .then(function (response) {
        // handle success

        if (response.data.success === true) setRoles(response.data.roles);
      })
      .catch(function (error) {
        // handle error
        setRoles(null);
        console.log("Error Fetching roles");
      });
  }, []);

  const handleChange = useCallback((e) => {
    setFormData((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  });

  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();

      axios({
        method: "post",
        url: REGISTER_USER,
        data: formData,
        withCredentials: true,
      })
        .then((response) => {
          console.log(response);
          if (response.data.success) {
            // setShowNotification(true);

            setFormData({
              first_name: "",
              last_name: "",
              roleId: "",
              email: "",
              password: "",
              username: "",
            });

            setAddUser(false);
          }
        })
        .catch((err) => {
          console.log("Error Updating user");
        });
    },
    [formData]
  );

  return (
    <>
      <Breadcrumb pageName="Add User" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          {/* <!-- Contact Form 2 --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <form action="#">
              <div className="p-6.5">
                <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      First name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-5.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="password"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <SelectGroupThree
                  label={"Role"}
                  placeholder={"Select Role"}
                  roles={roles}
                  roleId={formData.roleId}
                  handleChange={handleChange}
                />

                <button
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                  onClick={handleFormSubmit}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUser;
