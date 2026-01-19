import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AdminManagement.css";

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", contact: "", password: "" });
    const [showAddModal, setShowAddModal] = useState(false);
    const { token } = useAuth();

    const fetchAdmins = async () => {
        try {
            const response = await fetch("http://localhost:5151/api/users/admins", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setAdmins(data.admins);
            }
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5151/api/users/add-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newAdmin)
            });
            const data = await response.json();

            if (response.ok) {
                alert("Admin added successfully!");
                setShowAddModal(false);
                setNewAdmin({ name: "", email: "", contact: "", password: "" });
                fetchAdmins();
            } else {
                alert(data.message || "Failed to add admin");
            }
        } catch (error) {
            console.error("Error adding admin:", error);
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) return;

        try {
            const response = await fetch("http://localhost:5151/api/users/admins", {
                method: "POST", // The backend uses POST for delete with body
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ adminsIds: [adminId] })
            });

            if (response.ok) {
                fetchAdmins();
            } else {
                alert("Failed to delete admin");
            }
        } catch (error) {
            console.error("Error deleting admin:", error);
        }
    };

    return (
        <div className="admin-management-container">
            <div className="admin-header">
                <h2>Admin Management</h2>
                <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Add New Admin</button>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Contact</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin._id}>
                                <td>{admin.name}</td>
                                <td>{admin.email}</td>
                                <td>{admin.contact}</td>
                                <td><span className={`role-badge ${admin.role}`}>{admin.role}</span></td>
                                <td>
                                    {admin.role !== 'superadmin' && (
                                        <button className="delete-btn" onClick={() => handleDeleteAdmin(admin._id)}>Delete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add New Admin</h3>
                        <form onSubmit={handleAddAdmin}>
                            <div className="form-group">
                                <label>Name</label>
                                <input required type="text" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input required type="email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Contact</label>
                                <input required type="text" value={newAdmin.contact} onChange={e => setNewAdmin({ ...newAdmin, contact: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input required type="password" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Save Admin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
