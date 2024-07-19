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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchUsers = async (page) => {
    try {
      const response = await axios.get(
        `${GET_ALL_USERS}?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setAllUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleDelete = useCallback((userID) => {
    axios
      .delete(`${UPDATE_USER}/${userID}`, { withCredentials: true })
      .then((response) => {
        if (response.data.success) {
          setAllUsers((prevUsers) => prevUsers.filter((user) => user._id !== userID));
        }
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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

      {/* Pagination Controls */}
      <div className="flex justify-between p-5">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded"
        >
          Previous
        </button>
        <div className="flex items-center">
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border rounded"
        >
          Next
        </button>
      </div>
    </DefaultLayout>
  );
};

export default UsersList;
