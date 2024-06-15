import { useCallback, useEffect, useState } from "react";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import SelectGroupThree from "../../components/Forms/SelectGroup/SelectGroupThree";
import SelectOptionOne from "../../components/Forms/SelectOption/SelectOptionOne";
import SelectOptionThree from "../../components/Forms/SelectOption/SelectOptionThree";
import SelectOptionTwo from "../../components/Forms/SelectOption/SelectOptionTwo";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";
import { GET_ALL_ROLES, REGISTER_USER } from "../../api/constants";

const ProFormLayout = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [isOptionSelected, setIsOptionSelected] = useState(false);

  const [roles, setRoles] = useState(null);
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    roleId: "",
  });

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  useEffect(() => {
    // Get all the roles
    axios
      .get(GET_ALL_ROLES)
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

  const handleChange = (e) => {
    setUserData((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();

      axios({
        method: "post",
        url: REGISTER_USER,
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          roleId: userData.roleId,
          email: userData.email,
          username: userData.username,
          password: userData.password,
        },
      })
        .then((response) => {
          // if (response.data.success) {
          //   setShowNotification(true);
          // }
          console.log(response);
        })
        .catch((err) => {
          console.log("Error Adding user");
        });
    },
    [userData]
  );

  console.log(userData);

  return (
    <>
      {/* <Breadcrumb pageName="Pro Form Layout" /> */}

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
                      value={userData.first_name}
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
                      value={userData.last_name}
                      onChange={handleChange}
                      placeholder="Enter your last name"
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
                      value={userData.email}
                      onChange={handleChange}
                      placeholder="yourmail@gmail.com"
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
                      value={userData.username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-5 w-full">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    placeholder="password"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Select Role
                  </label>

                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <select
                      name="roleId"
                      value={selectedOption}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setSelectedOption(e.target.value);
                        handleChange(e);
                        changeTextColor();
                      }}
                      className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                        isOptionSelected ? "text-black dark:text-white" : ""
                      }`}
                    >
                      <option
                        value={""}
                        className="text-body dark:text-bodydark"
                      >
                        Select Role
                      </option>
                      {roles?.map((role) => {
                        return (
                          <option
                            key={role._id}
                            value={role._id}
                            className="text-body dark:text-bodydark"
                          >
                            {role.role_name}
                          </option>
                        );
                      })}
                    </select>

                    <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleFormSubmit}
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-9">{/* <!-- Survey Form --> */}</div>
      </div>
    </>
  );
};

export default ProFormLayout;
