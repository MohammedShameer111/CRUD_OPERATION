import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateEntity, addEntity } from '../features/entitiesSlice';
import axios from 'axios';
import './EditView.css';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const EditView = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    purpose: '',
    timeIn: '',
    timeOut: '',
    status: 'Active',
  });
  const [initialData, setInitialData] = useState(null); // For reset functionality
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Fetch entity data to edit
      axios
        .get(`http://localhost:5000/api/entities/${id}`)
        .then((res) => {
          setFormData(res.data);
          setInitialData(res.data); // Save initial data for reset
        })
        .catch((error) => {
          console.error('Error fetching entity:', error);
          alert('Error fetching data. Please try again.');
        });
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save operation with SweetAlert2 confirmation
  const handleSave = (e) => {
    e.preventDefault();
    
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save the changes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        if (id) {
          dispatch(updateEntity({ id, entity: formData }));
          toast.success("Entity updated successfully!");
        } else {
          dispatch(addEntity(formData));
          toast.success("New entity added successfully!");
        }
        navigate('/');
      }
    });
  };

  // Reset the form with SweetAlert2 confirmation
  const handleReset = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to reset the form?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(initialData || {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          purpose: '',
          timeIn: '',
          timeOut: '',
          status: 'Active',
        });
        Swal.fire('Reset!', 'The form has been reset.', 'success');
      }
    });
  };

  return (
    <div className="edit-view">
      <h1>{id ? 'Edit Entity' : 'Add Entity'}</h1>
      <form onSubmit={handleSave}>
        <input
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          required
        />
        <input
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          required
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          required
        />
        <input
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          placeholder="Purpose"
          required
        />
        <input
          type="time"
          name="timeIn"
          value={formData.timeIn}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="timeOut"
          value={formData.timeOut}
          onChange={handleChange}
          required
        />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Deactive">Deactive</option>
        </select>
        <div className="buttons">
          <button type="submit">Save</button>
          <button type="button" onClick={handleReset} className="reset-btn">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditView;
