import { useEffect, useState } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard/Dashboard";
import ResetPassword from "./pages/Authentication/ResetPassword";
import SignIn from "./pages/Authentication/SignIn";
import Loader from "./common/Loader";
import PageTitle from "./components/PageTitle";
import AddProperty from "./pages/Form/AddProperty.jsx";
import AddPost from "./pages/Form/AddPost.jsx";
import AddCommunity from "./pages/Form/AddCommunity.jsx";
import UsersList from "./pages/Users";
import EditUser from "./pages/Users/EditUser";
import ManageProperties from "./pages/ManageProperties/ManageProperties.jsx";
import ManagePosts from "./pages/ManagePosts/ManagePosts.jsx";
import ManageCommunities from "./pages/ManageCommunities/ManageCommunities.jsx";
import { UserContextProvider } from "./context/UserContext.jsx";
import ProtectedRoute from "./route/ProtectedRoute.jsx";
import ForgotPassword from "./pages/Authentication/ForgotPassword.jsx";
import ManageIcons from "./pages/ManageIcons/ManageIcons.jsx";
import AddIcons from "./pages/Form/AddIcons.jsx";
import RedirectManager from "./components/Redirects/Redirects.jsx";
import SitemapDashboard from "./components/GenerateSitemap/SitemapDashboard.jsx";

function WithUserContext() {
  return (
    <>
      <UserContextProvider>
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      </UserContextProvider>
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Routes>
        <Route
          path="/reset-password"
          element={
            <>
              <PageTitle title="Reset Password" />
              <ResetPassword />
            </>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <>
              <PageTitle title="Reset Password" />
              <ForgotPassword />
            </>
          }
        />
        <Route
          path="/auth/signin"
          exact
          element={
            <UserContextProvider>
              <PageTitle title="Signin" />
              <SignIn />
            </UserContextProvider>
          }
        />
        <Route element={<WithUserContext />}>
          <Route
            exact
            path="/"
            element={
              <>
                <PageTitle title="Dashboard" />
                <Dashboard />
              </>
            }
          />
          <Route
            exact
            path="/manage-icons"
            element={
              <>
                <PageTitle title="Manage Icons" />
                <ManageIcons />
              </>
            }
          />
          <Route
            exact
            path="/manage-users/edit"
            element={
              <>
                <PageTitle title="Edit User" />
                <EditUser />
              </>
            }
          />
          <Route
            exact
            path="/manage-users"
            element={
              <>
                <PageTitle title="Manage Users" />
                <UsersList />
              </>
            }
          />

          <Route
            exact
            path="/manage-properties"
            element={
              <>
                <PageTitle title="Manage Properties" />
                <ManageProperties />
              </>
            }
          />
          <Route
            exact
            path="/manage-communities"
            element={
              <>
                <PageTitle title="Manage Communities" />
                <ManageCommunities />
              </>
            }
          />
          <Route
            exact
            path="/manage-posts"
            element={
              <>
                <PageTitle title="Manage Posts" />
                <ManagePosts />
              </>
            }
          />

          <Route
            exact
            path="/generate-sitemap"
            element={
              <>
                <PageTitle title="Sitemap Dashboard" />
                <SitemapDashboard />
              </>
            }
          />

          <Route
            exact
            path="/manage-redirects"
            element={
              <>
                <PageTitle title="Redirect Manager" />
                <RedirectManager />
              </>
            }
          />
          <Route
            exact
            path="/forms/add-property"
            element={
              <>
                <PageTitle title="Add Property" />
                <AddProperty />
              </>
            }
          />

          <Route
            exact
            path="/forms/add-property/:id"
            element={
              <>
                <PageTitle title="Add Property" />
                <AddProperty />
              </>
            }
          />

          <Route
            exact
            path="/forms/add-icon/:id"
            element={
              <>
                <PageTitle title="Manage Icons" />
                <AddIcons />
              </>
            }
          />

          <Route
            exact
            path="/forms/add-post"
            element={
              <>
                <PageTitle title="Add Post" />
                <AddPost />
              </>
            }
          />

          <Route
            exact
            path="/forms/add-post/:id"
            element={
              <>
                <PageTitle title="Add Post" />
                <AddPost />
              </>
            }
          />

          <Route
            exact
            path="/forms/add-community/:id"
            element={
              <>
                <PageTitle title="Add Community" />
                <AddCommunity />
              </>
            }
          />

          <Route
            exact
            path="/forms/add-icon"
            element={
              <>
                <PageTitle title="Add Icons" />
                <AddIcons />
              </>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
