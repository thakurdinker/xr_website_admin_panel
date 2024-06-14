import { useEffect, useState } from "react";
import TableSix from "../../components/Tables/TableSix";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";
import { GET_ALL_USERS } from "../../api/constants";

const UsersList = () => {
  const [allUsers, setAllUsers] = useState([]);

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
      <div className="flex flex-col gap-10">
        <TableSix users={allUsers} />
      </div>
    </DefaultLayout>
  );
};

export default UsersList;
