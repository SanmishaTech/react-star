import React from "react";
import UserForm from "./UserForm";

const EditUser = () => {
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-md dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      <UserForm mode="edit" />
    </div>
  );
};

export default EditUser;