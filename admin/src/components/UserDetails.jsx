import React, { useState, useEffect } from "react";
import axios from "axios";

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await axios.get("/api/users");
    setUsers(res.data);
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <input
        type="text"
        placeholder="Search Users..."
        className="p-3 border w-full mb-5 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Vehicles</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3 text-center">{user.vehiclesCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserDetails;
