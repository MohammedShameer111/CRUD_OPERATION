import { useEffect, useState } from 'react';
import axios from 'axios';
import './DeleteEntities.css';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const DeletedEntities = () => {
  const [deletedEntities, setDeletedEntities] = useState([]);

  useEffect(() => {
    fetchDeletedEntities();
  }, []);

  const fetchDeletedEntities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/entities?showDeleted=true');
      setDeletedEntities(response.data.entities);
    } catch (error) {
      console.error('Error fetching deleted entities:', error);
    }
  };

  const restoreEntity = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/entities/${id}/restore`);
      fetchDeletedEntities();
      Swal.fire({
        icon: 'success',
        title: 'Entity restored successfully!',
      });
    } catch (error) {
      console.error("Error restoring entity:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to restore entity!',
      });
    }
  };

  const deletePermanently = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          axios.delete(`http://localhost:5000/api/entities/${id}/permanent`)
            .then(() => {
              fetchDeletedEntities();
              Swal.fire('Deleted!', 'The entity has been permanently deleted.', 'success');
            });
        } catch (error) {
          console.error("Error deleting entity permanently:", error);
          Swal.fire({
            icon: 'error',
            title: 'Failed to delete entity permanently!',
          });
        }
      }
    });
  };

  return (
    <div className="table-container">
      <h2>Deleted Entities</h2>
      {deletedEntities.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>No deleted entities found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Registration Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deletedEntities.map((entity) => (
              <tr key={entity._id}>
                <td>{entity.firstName} {entity.lastName}</td>
                <td>{entity.email}</td>
                <td>{new Date(entity.createdDate).toLocaleString()}</td>
                <td>{entity.status}</td>
                <td>
                  <button className="restore-btn" onClick={() => restoreEntity(entity._id)}>
                    <span className="icon">🔄</span> Restore
                  </button>
                  <button className="delete-btn" onClick={() => deletePermanently(entity._id)}>
                    <span className="icon">❌</span> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DeletedEntities;
