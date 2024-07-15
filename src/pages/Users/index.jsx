import { useCallback, useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";
import { GET_ALL_USERS, UPDATE_USER } from "../../api/constants";
import { Link } from "react-router-dom";
import AddUser from "../../components/AddUser/AddUser";
import UsersTable from "../../components/UsersTable/UsersTable";

const UsersList = () => {
  const [allUsers, setAllUsers] = useState([]);

  const [addUser, setAddUser] = useState(false);

  useEffect(() => {
    axios
      .get(GET_ALL_USERS, { withCredentials: true })
      .then(function (response) {
        // handle success

        if (response.data.success === true) setAllUsers(response.data.users);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }, []);

  const handleDelete = useCallback((userID) => {
    axios
      .delete(UPDATE_USER + "/" + userID, { withCredentials: true })
      .then(function (response) {
        // handle success
        if (response.data.success === true) {
          setAllUsers((prevUser) => {
            return prevUser.filter((user) => user._id !== userID);
          });
        }
      });
  });

  return (
    <DefaultLayout>
      <div className="mb-5 flex w-full items-center justify-between">
        <h2 className="font-medium">Manage Users</h2>
        <Link
          to="#"
          onClick={() => setAddUser(!addUser)}
          className={`inline-flex items-center justify-center rounded-full ${
            !addUser ? "bg-primary" : "bg-red"
          } px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-4 lg:py-2 xl:px-4 xl:py-2`}
        >
          {!addUser ? "Add New User" : "Cancel"}
        </Link>
      </div>

      {!addUser && (
        <div className="flex flex-col gap-10">
          <UsersTable users={allUsers} handleDelete={handleDelete} />
        </div>
      )}

      {addUser && <AddUser setAddUser={setAddUser} />}
    </DefaultLayout>
  );
};

export default UsersList;
