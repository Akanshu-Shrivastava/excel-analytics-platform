// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { logout } from "../redux/slices/authSlice";
// import { toast } from "react-toastify";

// const SuperAdminDashboard = () => {
//   const { user } = useSelector((state) => state.auth);
//   const [pendingAdmins, setPendingAdmins] = useState([]);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (user?.role !== "super-admin") {
//       navigate("/", { replace: true });
//     } else {
//       fetchPendingAdmins();
//     }
//   }, [user, navigate]);

//   const fetchPendingAdmins = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/admin/pending-admins", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setPendingAdmins(res.data);
//     } catch (err) {
//       console.error("Error fetching pending admins", err);
//     }
//   };

//   const handleApprove = async (id) => {
//     await axios.put(`http://localhost:5000/api/admin/approve-admin/${id}`, {}, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     fetchPendingAdmins();
//   };

//   const handleReject = async (id) => {
//     await axios.delete(`http://localhost:5000/api/admin/reject-admin/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     fetchPendingAdmins();
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/login", { replace: true });
//     toast.success("Logged Out");
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Super Admin Dashboard</h1>

//       <h2 className="text-xl font-semibold mb-3">Pending Admin Requests</h2>
//       {pendingAdmins.length === 0 ? (
//         <p>No pending requests.</p>
//       ) : (
//         <ul>
//           {pendingAdmins.map((admin) => (
//             <li key={admin._id} className="flex justify-between bg-gray-100 p-3 mb-2 rounded">
//               <span>{admin.name} ({admin.email})</span>
//               <div>
//                 <button
//                   onClick={() => handleApprove(admin._id)}
//                   className="bg-green-500 text-white px-3 py-1 rounded mr-2"
//                 >
//                   Approve
//                 </button>
//                 <button
//                   onClick={() => handleReject(admin._id)}
//                   className="bg-red-500 text-white px-3 py-1 rounded"
//                 >
//                   Reject
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}

//       <button
//         onClick={handleLogout}
//         className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
//       >
//       Logout
//       </button>
//     </div>
//   );
// };

// export default SuperAdminDashboard;
