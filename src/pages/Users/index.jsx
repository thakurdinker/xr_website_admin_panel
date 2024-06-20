import { useEffect, useState } from "react";
import TableSix from "../../components/Tables/TableSix";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";
import { GET_ALL_USERS } from "../../api/constants";
import { Link } from "react-router-dom";
import AddProperty from "../Form/AddProperty";

const UsersList = () => {
  const [allUsers, setAllUsers] = useState([]);

  const [addUser, setAddUser] = useState(false);

  useEffect(() => {
    axios
      .get(GET_ALL_USERS)
      .then(function (response) {
        // handle success

        if (response.data.success === true) setAllUsers(response.data.users);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }, []);

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
          <TableSix users={allUsers} />
        </div>
      )}

      {addUser && <AddProperty />}
    </DefaultLayout>
  );
};

export default UsersList;
